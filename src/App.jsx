import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { lazy, Suspense } from "react";
import Loader   from "./pages/Loader";

const Login    = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const User     = lazy(() => import("./pages/User"));
const Chat     = lazy(() => import("./pages/Chat"));
const Admin    = lazy(() => import("./pages/Admin"));


const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem("patgpt_user")); }
    catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback((userData, tokens) => {
    // tokens: { access_token, refresh_token }
    if (tokens) {
      localStorage.setItem("access_token",  tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);
    }
    if (userData) {
      localStorage.setItem("patgpt_user", JSON.stringify(userData));
      setUser(userData);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("patgpt_user");
    setUser(null);
  }, []);

  // ── Dark mode initialiser ─────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem("patgpt_theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (stored === "dark" || (!stored && prefersDark)) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Theme toggle helper (exported for use in nav/header) ──────────────────

export function toggleTheme() {
  const root = document.documentElement;
  if (root.classList.contains("dark")) {
    root.classList.remove("dark");
    localStorage.setItem("patgpt_theme", "light");
  } else {
    root.classList.add("dark");
    localStorage.setItem("patgpt_theme", "dark");
  }
}

// ── Route Guards ──────────────────────────────────────────────────────────

/** Redirects unauthenticated users to /login */
function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

/** Redirects non-admins to their user dashboard */
function AdminRoute() {
  const { user } = useAuth();
  const location = useLocation();
  if (!user)             return <Navigate to="/login"  state={{ from: location }} replace />;
  if (user.role !== "admin") return <Navigate to={`/user/${user.id}`} replace />;
  return <Outlet />;
}

/** Redirects already-logged-in users away from auth pages */
function GuestRoute() {
  const { user } = useAuth();
  if (user) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to={`/user/${user.id}`} replace />;
  }
  return <Outlet />;
}

// ── Page loading fallback ─────────────────────────────────────────────────

function PageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafb] dark:bg-[#0d1117]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-[#16a37a] animate-spin" />
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    </div>
  );
}

// ── 404 Page ──────────────────────────────────────────────────────────────

function NotFound() {
  const { user } = useAuth();
  const home = user
    ? user.role === "admin" ? "/admin" : `/user/${user.id}`
    : "/login";

  return (
    <div className="min-h-screen bg-pharma-mesh dark:bg-[#0d1117] flex flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <p className="text-8xl font-bold text-[#16a37a]/20 dark:text-[#16a37a]/10 select-none">404</p>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mt-2">Page not found</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <a
        href={home}
        className="bg-[#16a37a] hover:bg-[#0f8463] text-white font-semibold rounded-xl px-6 py-2.5 text-sm transition-all duration-200 shadow-sm hover:shadow-md"
      >
        Go Home
      </a>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageSpinner />}>
          <Routes>

            {/* ── Backend loader (entry point) ── */}
            <Route path="/" element={<Loader />} />

            {/* ── Guest-only (redirect if logged in) ── */}
            <Route element={<GuestRoute />}>
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* ── Protected: regular users ── */}
            <Route element={<ProtectedRoute />}>
              {/* User dashboard — dynamic userId */}
              <Route path="/user/:userId" element={<User />} />

              {/* Chat — dynamic userId + conversationId */}
              <Route path="/user/:userId/chat/:conversationId" element={<Chat />} />
            </Route>

            {/* ── Protected: admin-only ── */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Admin />} />
            </Route>

            {/* ── 404 catch-all ── */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}