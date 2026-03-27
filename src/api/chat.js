import client from './client';

export const chatApi = {
  chatRest: (data) => client.post('/chat/rest', data).then(res => res.data),
  
  // Note: For SSE or streaming, you often use EventSource or fetch natively in the UI.
  // Using axios config for streams where applicable.
  chatStream: (data, config) => client.post('/chat/stream', data, { 
    responseType: 'stream',
    ...config 
  }),
  
  chatSse: (params) => client.get('/chat/sse', { params, responseType: 'stream' })
};
