import client from './client';

export const uiGraphApi = {
  // Graph Level
  getGraph: () => client.get('/ui/graph').then(res => res.data),
  resetGraph: () => client.delete('/ui/graph/reset').then(res => res.data),
  setStartNode: (nodeId) => client.put(`/ui/graph/start-node/${nodeId}`).then(res => res.data),
  searchGraph: (endNode) => client.get(`/ui/graph/search/${endNode}`).then(res => res.data),

  // Nodes
  getNodes: () => client.get('/ui/nodes').then(res => res.data),
  createNode: (data) => client.post('/ui/nodes', data).then(res => res.data),
  getNode: (nodeId) => client.get(`/ui/nodes/${nodeId}`).then(res => res.data),
  updateNode: (nodeId, data) => client.patch(`/ui/nodes/${nodeId}`, data).then(res => res.data),
  deleteNode: (nodeId) => client.delete(`/ui/nodes/${nodeId}`).then(res => res.data),

  // Edges
  getEdges: () => client.get('/ui/edges').then(res => res.data),
  createEdge: (data) => client.post('/ui/edges', data).then(res => res.data),
  getEdge: (edgeId) => client.get(`/ui/edges/${edgeId}`).then(res => res.data),
  updateEdge: (edgeId, data) => client.patch(`/ui/edges/${edgeId}`, data).then(res => res.data),
  deleteEdge: (edgeId) => client.delete(`/ui/edges/${edgeId}`).then(res => res.data)
};
