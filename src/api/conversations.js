import client from './client';

export const conversationsApi = {
  // My Conversations
  getMyConversations: () => client.get('/conversations/me').then(res => res.data),
  deleteAllMyConversations: () => client.delete('/conversations/me/all').then(res => res.data),
  
  // Conversations
  createConversation: (data) => client.post('/conversations', data).then(res => res.data),
  getConversation: (conversationId) => client.get(`/conversations/${conversationId}`).then(res => res.data),
  updateConversation: (conversationId, data) => client.patch(`/conversations/${conversationId}`, data).then(res => res.data),
  deleteConversation: (conversationId) => client.delete(`/conversations/${conversationId}`).then(res => res.data),
  
  getConversationFull: (conversationId) => client.get(`/conversations/${conversationId}/full`).then(res => res.data),
  
  // Messages
  getMessages: (conversationId) => client.get(`/conversations/${conversationId}/messages`).then(res => res.data),
  createMessage: (conversationId, data) => client.post(`/conversations/${conversationId}/messages`, data).then(res => res.data),
  deleteAllMessages: (conversationId) => client.delete(`/conversations/${conversationId}/messages`).then(res => res.data),
  getMessage: (messageId) => client.get(`/messages/${messageId}`).then(res => res.data),
  deleteMessage: (messageId) => client.delete(`/messages/${messageId}`).then(res => res.data),
  
  // Admin Conversations
  adminGetAllConversations: (params) => client.get('/admin/conversations', { params }).then(res => res.data),
  adminGetUserConversations: (userId) => client.get(`/admin/users/${userId}/conversations`).then(res => res.data),
  adminDeleteUserConversations: (userId) => client.delete(`/admin/users/${userId}/conversations`).then(res => res.data),
};
