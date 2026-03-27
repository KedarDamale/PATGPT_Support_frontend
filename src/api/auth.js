import client from './client';

export const authApi = {
  // Register
  register: (data) => client.post('/auth/register', data).then(res => res.data),
  
  // Login
  // Expects form-encoded body according to openapi spec
  login: (data) => {
    const params = new URLSearchParams();
    if(data.username) params.append('username', data.username);
    if(data.password) params.append('password', data.password);
    if(data.scope) params.append('scope', data.scope);
    if(data.client_id) params.append('client_id', data.client_id);
    if(data.client_secret) params.append('client_secret', data.client_secret);
    
    return client.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(res => res.data);
  },
  
  // Refresh
  refresh: (data) => client.post('/auth/refresh', data).then(res => res.data),
  
  // Logout
  logout: (data) => client.post('/auth/logout', data).then(res => res.data),
  
  // Me
  getMe: () => client.get('/auth/me').then(res => res.data),
  removeMe: () => client.delete('/auth/me').then(res => res.data),
  patchMe: (data) => client.patch('/auth/me', data).then(res => res.data),
  
  // Users (Admin)
  getUsers: (params) => client.get('/auth/users', { params }).then(res => res.data),
  patchUser: (userId, data) => client.patch(`/auth/users/${userId}`, data).then(res => res.data),
  deleteUser: (userId) => client.delete(`/auth/users/${userId}`).then(res => res.data)
};
