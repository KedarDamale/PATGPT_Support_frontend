import client from './client';

export const chatApi = { 
  chatRest: (data) => client.post('/chat/rest', data).then(res => res.data),
  
  // Note: For SSE or streaming, you often use EventSource or fetch natively in the UI.
  // Using axios config for streams where applicable.
  chatStream: (data, config) => client.post('/chat/stream', data, { 
    responseType: 'stream',
    ...config 
  }),
  
  chatSse: async (params, onMessage) => {
    const token = localStorage.getItem('access_token');
    
    // Use axios to construct the URL with params (more robust)
    const url = client.getUri({ url: '/chat/sse', params });
    const fullUrl = url.startsWith('http') ? url : `${client.defaults.baseURL}${url}`;

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("SSE Request Failed:", response.status, errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const content = line.slice(6).trim();
            if (content === '[DONE]') {
              onMessage({ done: true });
            } else if (content) {
              // Unescape newlines if backend escaped them
              const unescaped = content.replace(/\\n/g, '\n');
              onMessage({ content: unescaped });
            }
          }
        }
      }
    } catch (error) {
      console.error("SSE Streaming Error:", error);
      throw error;
    }
  }
};
