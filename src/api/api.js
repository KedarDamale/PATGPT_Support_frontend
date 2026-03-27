// ============================================================
//  api.js — Auto-generated from openapi.json
//  Base URL is read from VITE_BACKEND_URL env variable
// ============================================================

const BASE_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") ?? "";

// ── Token helpers ────────────────────────────────────────────
const getAccessToken = () => localStorage.getItem("access_token");
const getRefreshToken = () => localStorage.getItem("refresh_token");

const saveTokens = ({ access_token, refresh_token }) => {
  localStorage.setItem("access_token", access_token);
  localStorage.setItem("refresh_token", refresh_token);
};

const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

// ── Core request helper ──────────────────────────────────────
async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { ...options.headers };

  // Attach bearer token when available
  const token = getAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

  // Return raw response for callers that need status codes
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ detail: res.statusText }));
    const err = new Error(errorBody?.detail ?? res.statusText);
    err.status = res.status;
    err.body = errorBody;
    throw err;
  }

  // 204 / empty bodies
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function json(path, method, body, extraHeaders = {}) {
  return request(path, {
    method,
    headers: { "Content-Type": "application/json", ...extraHeaders },
    body: JSON.stringify(body),
  });
}

function formUrlEncoded(path, body) {
  return request(path, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body).toString(),
  });
}

function get(path, params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null))
  ).toString();
  return request(`${path}${qs ? `?${qs}` : ""}`);
}

// ============================================================
//  HEALTH
// ============================================================

/** GET /health/ — Check backend reachability */
export const health = {
  check: () => get("/health/"),
};

// ============================================================
//  AUTH
// ============================================================

export const auth = {
  /** POST /auth/register — Register a new user */
  register: (/** @type {{ email: string; password: string }} */ body) =>
    json("/auth/register", "POST", body),

  /**
   * POST /auth/login — Login (OAuth2 password flow)
   * @param {{ username: string; password: string }} creds
   * Note: FastAPI's OAuth2PasswordBearer expects `username` field even for email-based auth.
   */
  login: (creds) => {
    const data = formUrlEncoded(creds);
    data.then(saveTokens).catch(() => {});
    return data;
  },

  /** POST /auth/refresh — Refresh access token */
  refresh: (refresh_token = getRefreshToken()) =>
    json("/auth/refresh", "POST", { refresh_token }).then((tokens) => {
      saveTokens(tokens);
      return tokens;
    }),

  /**
   * POST /auth/logout — Logout (invalidate tokens on backend)
   */
  logout: (access_token = getAccessToken(), refresh_token = getRefreshToken()) => {
    const p = json("/auth/logout", "POST", { access_token, refresh_token });
    p.then(clearTokens).catch(clearTokens);
    return p;
  },

  /** GET /auth/me — Get current user info */
  me: () => get("/auth/me"),

  /** DELETE /auth/me — Delete own account */
  deleteMe: () => request("/auth/me", { method: "DELETE" }),

  /**
   * PATCH /auth/me — Update own profile
   * @param {{ email?: string; password?: string }} body
   */
  patchMe: (body) => json("/auth/me", "PATCH", body),

  /**
   * GET /auth/users — List all users (admin)
   * @param {{ skip?: number; limit?: number; role?: 'user'|'admin'; is_active?: boolean }} params
   */
  getUsers: (params = {}) => get("/auth/users", params),

  /**
   * PATCH /auth/users/:user_id — Admin update user
   * @param {string} user_id
   * @param {{ role?: string; is_active?: boolean }} body
   */
  patchUser: (user_id, body) => json(`/auth/users/${user_id}`, "PATCH", body),

  /**
   * DELETE /auth/users/:user_id — Admin delete user
   * @param {string} user_id
   */
  deleteUser: (user_id) => request(`/auth/users/${user_id}`, { method: "DELETE" }),
};

// ============================================================
//  CONVERSATIONS & MESSAGES
// ============================================================

export const conversations = {
  /** GET /conversations/me — Get current user's conversations */
  mine: () => get("/conversations/me"),

  /**
   * POST /conversations — Create a new conversation
   * @param {{ title?: string }} body
   */
  create: (body = {}) => json("/conversations", "POST", body),

  /**
   * GET /conversations/:id — Get single conversation with messages
   * @param {string} conversation_id
   */
  get: (conversation_id) => get(`/conversations/${conversation_id}`),

  /**
   * PATCH /conversations/:id — Update conversation (rename, etc.)
   * @param {string} conversation_id
   * @param {{ title?: string }} body
   */
  update: (conversation_id, body) => json(`/conversations/${conversation_id}`, "PATCH", body),

  /**
   * DELETE /conversations/:id — Delete conversation
   * @param {string} conversation_id
   */
  delete: (conversation_id) =>
    request(`/conversations/${conversation_id}`, { method: "DELETE" }),

  // ── Admin ──────────────────────────────────────────────────

  /**
   * GET /conversations/admin — Admin: list all conversations
   * @param {{ skip?: number; limit?: number }} params
   */
  adminList: (params = {}) => get("/conversations/admin", params),

  /**
   * GET /conversations/admin/:user_id — Admin: list conversations by user
   * @param {string} user_id
   */
  adminListByUser: (user_id) => get(`/conversations/admin/${user_id}`),

  /**
   * DELETE /conversations/admin/:conversation_id — Admin: delete any conversation
   * @param {string} conversation_id
   */
  adminDelete: (conversation_id) =>
    request(`/conversations/admin/${conversation_id}`, { method: "DELETE" }),
};

// ============================================================
//  MESSAGES
// ============================================================

export const messages = {
  /**
   * GET /conversations/:conversation_id/messages — List messages in a conversation
   * @param {string} conversation_id
   * @param {{ skip?: number; limit?: number }} params
   */
  list: (conversation_id, params = {}) =>
    get(`/conversations/${conversation_id}/messages`, params),

  /**
   * POST /conversations/:conversation_id/messages — Add a message
   * @param {string} conversation_id
   * @param {{ role: 'user'|'ai'; content: string }} body
   */
  create: (conversation_id, body) =>
    json(`/conversations/${conversation_id}/messages`, "POST", body),

  /**
   * DELETE /conversations/:conversation_id/messages/:message_id — Delete a message
   * @param {string} conversation_id
   * @param {string} message_id
   */
  delete: (conversation_id, message_id) =>
    request(`/conversations/${conversation_id}/messages/${message_id}`, { method: "DELETE" }),
};

// ============================================================
//  CHAT (AI)
// ============================================================

export const chat = {
  /**
   * POST /chat/:conversation_id — Send user message and get AI reply
   * @param {string} conversation_id
   * @param {{ message: string }} body
   */
  send: (conversation_id, body) => json(`/chat/${conversation_id}`, "POST", body),
};

// ============================================================
//  TICKETS
// ============================================================

export const tickets = {
  /** GET /tickets/me — Get current user's tickets */
  mine: () => get("/tickets/me"),

  /**
   * POST /tickets — Create a support ticket
   * @param {{ name: string; cause: string; description: string; type?: 'bug'|'question'|'feature'|'other'; status?: 'raised'|'pending'|'attended'|'closed' }} body
   */
  create: (body) => json("/tickets", "POST", body),

  /**
   * GET /tickets/:ticket_id — Get single ticket
   * @param {string} ticket_id
   */
  get: (ticket_id) => get(`/tickets/${ticket_id}`),

  /**
   * PATCH /tickets/:ticket_id — Update ticket
   * @param {string} ticket_id
   * @param {{ name?: string; cause?: string; description?: string; status?: string; type?: string }} body
   */
  update: (ticket_id, body) => json(`/tickets/${ticket_id}`, "PATCH", body),

  /**
   * DELETE /tickets/:ticket_id — Delete ticket
   * @param {string} ticket_id
   */
  delete: (ticket_id) => request(`/tickets/${ticket_id}`, { method: "DELETE" }),

  // ── Admin ──────────────────────────────────────────────────

  /**
   * GET /tickets/admin — Admin: list all tickets
   * @param {{ skip?: number; limit?: number; status?: string; type?: string }} params
   */
  adminList: (params = {}) => get("/tickets/admin", params),

  /**
   * GET /tickets/admin/user/:user_id — Admin: tickets by user
   * @param {string} user_id
   */
  adminListByUser: (user_id) => get(`/tickets/admin/user/${user_id}`),

  /**
   * PATCH /tickets/admin/:ticket_id — Admin: update any ticket
   * @param {string} ticket_id
   * @param {object} body
   */
  adminUpdate: (ticket_id, body) => json(`/tickets/admin/${ticket_id}`, "PATCH", body),

  /**
   * DELETE /tickets/admin/:ticket_id — Admin: delete any ticket
   * @param {string} ticket_id
   */
  adminDelete: (ticket_id) =>
    request(`/tickets/admin/${ticket_id}`, { method: "DELETE" }),
};

// ============================================================
//  MEMORY
// ============================================================

export const memory = {
  /** GET /memory — Get all memory entries for current user */
  list: () => get("/memory"),

  /**
   * POST /memory — Create a memory entry
   * @param {{ key: string; value: string }} body
   */
  create: (body) => json("/memory", "POST", body),

  /**
   * GET /memory/:memory_id — Get a single memory entry
   * @param {string} memory_id
   */
  get: (memory_id) => get(`/memory/${memory_id}`),

  /**
   * PATCH /memory/:memory_id — Update a memory entry
   * @param {string} memory_id
   * @param {{ value: string }} body
   */
  update: (memory_id, body) => json(`/memory/${memory_id}`, "PATCH", body),

  /**
   * DELETE /memory/:memory_id — Delete a memory entry
   * @param {string} memory_id
   */
  delete: (memory_id) => request(`/memory/${memory_id}`, { method: "DELETE" }),

  // ── Admin ──────────────────────────────────────────────────

  /**
   * GET /memory/admin — Admin: list all memory entries
   * @param {{ skip?: number; limit?: number }} params
   */
  adminList: (params = {}) => get("/memory/admin", params),

  /**
   * GET /memory/admin/:user_id — Admin: memory by user
   * @param {string} user_id
   */
  adminListByUser: (user_id) => get(`/memory/admin/${user_id}`),

  /**
   * DELETE /memory/admin/:memory_id — Admin: delete any memory entry
   * @param {string} memory_id
   */
  adminDelete: (memory_id) =>
    request(`/memory/admin/${memory_id}`, { method: "DELETE" }),
};

// ============================================================
//  KNOWLEDGE GRAPH  (Nodes & Edges)
// ============================================================

export const graph = {
  // ── Nodes ─────────────────────────────────────────────────

  /** GET /graph/nodes — List all nodes */
  listNodes: (params = {}) => get("/graph/nodes", params),

  /**
   * POST /graph/nodes — Create a node
   * @param {{ id: string; node_name: string; node_type: string; node_info: string; tags?: string[]; scroll_count?: number }} body
   */
  createNode: (body) => json("/graph/nodes", "POST", body),

  /**
   * GET /graph/nodes/:node_id — Get a node
   * @param {string} node_id
   */
  getNode: (node_id) => get(`/graph/nodes/${node_id}`),

  /**
   * PATCH /graph/nodes/:node_id — Update a node
   * @param {string} node_id
   * @param {object} body
   */
  updateNode: (node_id, body) => json(`/graph/nodes/${node_id}`, "PATCH", body),

  /**
   * DELETE /graph/nodes/:node_id — Delete a node
   * @param {string} node_id
   */
  deleteNode: (node_id) => request(`/graph/nodes/${node_id}`, { method: "DELETE" }),

  // ── Edges ─────────────────────────────────────────────────

  /** GET /graph/edges — List all edges */
  listEdges: (params = {}) => get("/graph/edges", params),

  /**
   * POST /graph/edges — Create an edge
   * @param {{ id: string; from_node: string; to_node: string; weight?: number; action: string }} body
   */
  createEdge: (body) => json("/graph/edges", "POST", body),

  /**
   * GET /graph/edges/:edge_id — Get an edge
   * @param {string} edge_id
   */
  getEdge: (edge_id) => get(`/graph/edges/${edge_id}`),

  /**
   * PATCH /graph/edges/:edge_id — Update an edge
   * @param {string} edge_id
   * @param {{ weight?: number; action?: string }} body
   */
  updateEdge: (edge_id, body) => json(`/graph/edges/${edge_id}`, "PATCH", body),

  /**
   * DELETE /graph/edges/:edge_id — Delete an edge
   * @param {string} edge_id
   */
  deleteEdge: (edge_id) => request(`/graph/edges/${edge_id}`, { method: "DELETE" }),
};

// ============================================================
//  Token utilities (re-exported for use in auth context)
// ============================================================
export { getAccessToken, getRefreshToken, saveTokens, clearTokens };