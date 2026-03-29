import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { conversationsApi } from "../api";
import { Send, Sparkles } from "lucide-react";
import { useAuth } from "../App";

export default function User() {
    const { userId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!msg.trim() || loading) return;
        setLoading(true);
        try {
            // Create a new conversation placeholder in the database
            const conv = await conversationsApi.createConversation({ 
                title: msg.substring(0, 30) + (msg.length > 30 ? '...' : '') 
            });
            // Navigate to the Chat thread view, handing over the first user message 
            navigate(`/user/${userId}/chat/${conv.id}`, { state: { initialMessage: msg } });
        } catch (err) {
            console.error("Failed to start conversation", err);
            setLoading(false);
            const errDetail = err.response?.data?.detail 
                ? JSON.stringify(err.response.data.detail) 
                : err.message || "Unknown error";
            alert(`Failed to create conversation: ${errDetail}`);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0d1117] relative">
            
            {/* Main Welcome Area */}
            <div className="flex-1 overflow-y-auto w-full flex flex-col justify-center items-center px-4 md:px-8">
                <div className="w-full max-w-3xl flex flex-col items-center text-center animate-fade-in -mt-20">
                    <div className="w-16 h-16 rounded-3xl bg-linear-to-br from-[#16a37a] to-[#0ba8b2] flex items-center justify-center shadow-lg shadow-[#16a37a]/20 mb-6">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                        Hello, <span className="bg-linear-to-r from-[#16a37a] to-[#0ba8b2] bg-clip-text text-transparent">{user?.email?.split('@')[0] || 'User'}</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl font-medium max-w-xl">
                        How can I help you today?
                    </p>
                </div>

                {/* Grid of suggestions (optional styling flair) */}
                <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-3 mt-12 animate-fade-in" style={{animationDelay: "0.1s"}}>
                    {[
                        "I need help logging into my account",
                        "How do I reset my password?",
                        "Where can I find my billing history?",
                        "I am experiencing a bug with the UI graph"
                    ].map((suggestion, i) => (
                        <button 
                            key={i}
                            onClick={() => setMsg(suggestion)}
                            className="text-left px-5 py-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/50 hover:bg-gray-100 dark:bg-white/2 dark:hover:bg-white/5 text-sm text-gray-700 dark:text-gray-300 font-medium transition-colors shadow-sm"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            </div>

            {/* Input Form Pinned to Bottom */}
            <div className="w-full max-w-4xl mx-auto p-4 md:p-6 pb-6 bg-white dark:bg-[#0d1117]">
                <form 
                    onSubmit={handleSend}
                    className="relative flex items-end w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161b22] px-4 py-3 shadow-lg shadow-gray-200/20 dark:shadow-none transition-colors focus-within:ring-2 focus-within:ring-[#16a37a]/50 focus-within:border-[#16a37a]"
                >
                    <textarea 
                        rows={1}
                        placeholder="Message PatGPT..."
                        className="flex-1 max-h-48 min-h-[24px] bg-transparent border-0 outline-none resize-none text-gray-900 dark:text-white placeholer:text-gray-400 py-1 text-[15px] leading-relaxed"
                        value={msg}
                        onChange={e => setMsg(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(e);
                            }
                        }}
                    />
                    <button 
                        type="submit"
                        disabled={!msg.trim() || loading}
                        className="ml-3 shrink-0 p-2 rounded-xl bg-[#16a37a] hover:bg-[#0f8463] text-white disabled:opacity-30 disabled:hover:bg-[#16a37a] transition-colors shadow flex items-center justify-center"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5 -ml-0.5" />}
                    </button>
                </form>
                <p className="text-center text-[11px] font-medium text-gray-400 mt-3 hidden md:block">
                    PatGPT can make mistakes. Please verify critical information.
                </p>
            </div>
        </div>
    );
}