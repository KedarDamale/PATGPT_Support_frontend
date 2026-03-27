import client from './client';

export const ticketsApi = {
  // My tickets
  getMyTickets: () => client.get('/tickets/me').then(res => res.data),
  
  // Base tickets
  createTicket: (data) => client.post('/tickets/', data).then(res => res.data),
  adminGetAllTickets: (params) => client.get('/tickets/', { params }).then(res => res.data),
  
  // Single ticket operations
  getTicket: (ticketId) => client.get(`/tickets/${ticketId}`).then(res => res.data),
  updateTicket: (ticketId, data) => client.patch(`/tickets/${ticketId}`, data).then(res => res.data),
  deleteTicket: (ticketId) => client.delete(`/tickets/${ticketId}`).then(res => res.data),
  
  // Admin Endpoints
  adminGetTicketsByUser: (userId) => client.get(`/tickets/user/${userId}`).then(res => res.data),
  adminUpdateTicket: (ticketId, data) => client.patch(`/tickets/admin/${ticketId}`, data).then(res => res.data)
};
