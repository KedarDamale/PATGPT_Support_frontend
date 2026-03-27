import client from './client';

export const healthApi = {
  getHealth: () => client.get('/health/').then(res => res.data),
};
