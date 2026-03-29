import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useParams, useLocation } from "react-router-dom";
import { conversationsApi } from "../api";
import { useAuth, toggleTheme } from "../App";
import { MessageSquare, Plus, Menu, X, LogOut, Sun, Moon, Hash } from "lucide-react";

export default function ChatLayout() {
    const { user, logout } = useAuth();
    const { userId, conversationId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [conversations, setConversations] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Automatically keep theme state visually reflected if needed, though App handles HTML class
    const [isDark, setIsDark] = useState(document.documentElement.classList.contains("dark"));

    useEffect(() => {
        const fetchConvos = async () => {
            try {
                const res = await conversationsApi.getMyConversations();
                setConversations(Array.isArray(res) ? res : []);
            } catch (err) {
                console.error("Failed to fetch conversations", err);
            }
        };
        fetchConvos();
    }, [location.pathname]); // Re-fetch on nav so new chats appear automatically

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const handleThemeToggle = () => {
        toggleTheme();
        setIsDark(document.documentElement.classList.contains("dark"));
    };

    return (
        <div className="flex h-dvh bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 overflow-hidden font-sans">
            
            {/* Mobile Header overlay */}
            <div className="md:hidden absolute top-0 left-0 right-0 h-14 bg-white/80 dark:bg-[#161b22]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-4 z-20">
                <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-gray-600 dark:text-gray-300">
                    <Menu className="w-5 h-5" />
                </button>
                <span className="font-bold text-sm tracking-wide">PatGPT Support</span>
                <div className="w-9" /> {/* spacer */}
            </div>

            {/* Sidebar */}
            <aside className={`
                absolute md:static top-0 left-0 bottom-0 z-30 w-72 bg-gray-50 dark:bg-[#161b22] border-r border-gray-200 dark:border-white/10 flex flex-col transition-transform duration-300
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Brand / New Chat */}
                <div className="p-4 flex flex-col gap-4 border-b border-gray-200 dark:border-white/10 bg-white/50 dark:bg-[#0d1117]/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-[#16a37a] to-[#0ba8b2] flex items-center justify-center shadow shadow-[#16a37a]/30">
                                <svg width="14" height="14" viewBox="0 0 40 40" fill="none">
                                    <rect x="14" y="4" width="12" height="32" rx="4" fill="white" />
                                    <rect x="4" y="14" width="32" height="12" rx="4" fill="white" opacity="0.85" />
                                </svg>
                            </div>
                            <span className="font-bold text-[15px] tracking-tight text-gray-800 dark:text-gray-100">PatGPT</span>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <Link 
                        to={`/user/${userId}`} 
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-[#21262d] border border-gray-200 dark:border-white/10 hover:border-[#16a37a] dark:hover:border-[#16a37a] rounded-xl text-sm font-semibold transition-all group shadow-sm text-gray-700 dark:text-gray-200"
                    >
                        <Plus className="w-4 h-4 text-[#16a37a] group-hover:scale-110 transition-transform" />
                        New Chat
                    </Link>
                </div>

                {/* History List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                    <p className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                        Recent
                    </p>
                    
                    {conversations.length === 0 ? (
                        <div className="px-4 py-6 text-center text-xs text-gray-400">
                            No conversations yet.
                        </div>
                    ) : (
                        conversations.map(c => {
                            const isActive = c.id === conversationId;
                            return (
                                <Link
                                    key={c.id}
                                    to={`/user/${userId}/chat/${c.id}`}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left overflow-hidden group
                                        ${isActive ? 'bg-[#16a37a]/10 text-[#16a37a] dark:bg-[#16a37a]/15 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-white/5 font-medium'}
                                    `}
                                >
                                    <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#16a37a]' : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400'}`} />
                                    <span className="truncate">{c.title || `Chat ${c.id.substring(0, 8)}`}</span>
                                </Link>
                            );
                        })
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-4 border-t border-gray-200 dark:border-white/10 text-sm font-medium flex flex-col gap-1">
                    <button onClick={handleThemeToggle} className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-200/50 dark:hover:bg-white/5 rounded-lg text-gray-600 dark:text-gray-400 transition-colors">
                        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        {isDark ? "Light Mode" : "Dark Mode"}
                    </button>
                    {user?.role === 'admin' && (
                        <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-200/50 dark:hover:bg-white/5 rounded-lg text-gray-600 dark:text-gray-400 transition-colors">
                             <Hash className="w-4 h-4" />
                             Admin Panel
                        </Link>
                    )}
                    <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-red-600 dark:text-red-400 transition-colors">
                        <LogOut className="w-4 h-4" />
                        Log out
                    </button>
                </div>
            </aside>

            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/50 z-20 backdrop-blur-sm animate-fade-in"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main view area (Outlet) */}
            <main className="flex-1 flex flex-col min-w-0 md:pt-0 pt-14 bg-white dark:bg-[#0d1117] relative">
                 <Outlet />
            </main>
        </div>
    );
}
