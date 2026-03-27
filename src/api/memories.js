import client from './client';

export const memoriesApi = {
  // My Memories
  getMyMemories: () => client.get('/memories/me').then(res => res.data),
  createMyMemory: (data) => client.post('/memories/me', data).then(res => res.data),
  deleteAllMyMemories: () => client.delete('/memories/me').then(res => res.data),
  getMyMemoryByKey: (key) => client.get(`/memories/me/key/${key}`).then(res => res.data),
  updateMyMemory: (memoryId, data) => client.patch(`/memories/me/${memoryId}`, data).then(res => res.data),
  deleteMyMemory: (memoryId) => client.delete(`/memories/me/${memoryId}`).then(res => res.data),

  // All Memories / Admin
  getAllMemories: () => client.get('/memories/').then(res => res.data),
  getMemory: (memoryId) => client.get(`/memories/${memoryId}`).then(res => res.data),
  getMemoriesByUser: (userId) => client.get(`/memories/user/${userId}`).then(res => res.data),
  adminDeleteAllMemoriesByUser: (userId) => client.delete(`/memories/user/${userId}`).then(res => res.data)
};
