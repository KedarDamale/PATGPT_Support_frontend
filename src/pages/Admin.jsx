// pages/Admin.jsx — stub, shows auth data only
import { useAuth } from "../App";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api";

function DataRow({ label, value }) {
    return (
        <div className="flex items-start justify-between py-3 border-b border-gray-100 dark:border-white/6 last:border-0">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 w-28 shrink-0">
                {label}
            </span>
            <span className="text-sm text-gray-800 dark:text-gray-200 text-right break-all">
                {value ?? <span className="text-gray-300 dark:text-gray-600 italic">—</span>}
            </span>
        </div>
    );
}

export default function Admin() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try { await auth.logout(); } catch { /* ignore */ }
        logout();
        navigate("/login", { replace: true });
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#f8fafb] dark:bg-[#0d1117] flex items-center justify-center px-4">
            <div className="w-full max-w-md animate-fade-in">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-[#0ba8b2] to-[#16a37a] flex items-center justify-center shadow-md">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-gray-900 dark:text-white leading-tight">Admin Dashboard</h1>
                            <p className="text-xs text-gray-400 dark:text-gray-500">PatGPT Support</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-xs font-semibold text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-all"
                    >
                        Logout
                    </button>
                </div>

                {/* Auth data card */}
                <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-white/6 rounded-2xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-5">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#0ba8b2] to-[#16a37a] flex items-center justify-center text-white font-bold text-lg shadow">
                            {user.email?.[0]?.toUpperCase() ?? "A"}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.email}</p>
                            <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-[#0ba8b2]/10 text-[#0ba8b2] dark:bg-[#0ba8b2]/20 dark:text-[#24c4cc] mt-0.5">
                                {user.role}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <DataRow label="User ID" value={user.id} />
                        <DataRow label="Email" value={user.email} />
                        <DataRow label="Role" value={user.role} />
                        <DataRow label="Active" value={user.is_active ? "Yes" : "No"} />
                        <DataRow label="Joined" value={user.created_at ? new Date(user.created_at).toLocaleString() : null} />
                    </div>
                </div>

                {/* Access token preview */}
                <div className="mt-4 bg-white dark:bg-[#161b22] border border-gray-100 dark:border-white/6 rounded-2xl shadow-sm p-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                        Access Token (preview)
                    </p>
                    <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all leading-relaxed">
                        {localStorage.getItem("access_token")?.slice(0, 80)}…
                    </p>
                </div>

                <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-4">
                    Full admin panel coming soon
                </p>
            </div>
        </div>
    );
}