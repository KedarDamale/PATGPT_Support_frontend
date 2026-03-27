// pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api";
import { useAuth } from "../App";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const tokens = await authApi.login(form);
            // fetch user profile
            localStorage.setItem("access_token", tokens.access_token);
            localStorage.setItem("refresh_token", tokens.refresh_token);
            const me = await authApi.getMe();
            login(me, tokens);
            navigate(me.role === "admin" ? "/admin" : `/user/${me.id}`, { replace: true });
        } catch (err) {
            let msg = "Login failed";
            if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                msg = Array.isArray(detail) ? detail.map(d => d.msg).join(", ") : detail;
            } else if (err.message) {
                msg = err.message;
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-pharma-mesh dark:bg-[#0d1117] flex items-center justify-center px-4">
            <div className="w-full max-w-sm bg-white/80 dark:bg-[#161b22]/90 backdrop-blur-xl border border-white/60 dark:border-white/[0.07] rounded-3xl shadow-2xl p-8 animate-fade-in">

                {/* Logo */}
                <div className="flex flex-col items-center gap-2 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#16a37a] to-[#0ba8b2] flex items-center justify-center shadow-lg shadow-[#16a37a]/30">
                        <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                            <rect x="14" y="4" width="12" height="32" rx="4" fill="white" />
                            <rect x="4" y="14" width="32" height="12" rx="4" fill="white" opacity="0.85" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Sign in to PatGPT Support</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input
                            name="username"
                            type="email"
                            placeholder="you@example.com"
                            value={form.username}
                            onChange={handle}
                            required
                            className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a37a]/40 focus:border-[#16a37a] transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handle}
                            required
                            className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a37a]/40 focus:border-[#16a37a] transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#16a37a] hover:bg-[#0f8463] text-white font-semibold rounded-xl py-2.5 text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                    >
                        {loading ? "Signing in…" : "Sign In"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 dark:text-gray-500 mt-6">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-[#16a37a] hover:text-[#0f8463] font-semibold">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}