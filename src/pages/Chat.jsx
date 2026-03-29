import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { conversationsApi, chatApi } from "../api";
import { Send, Bot, User as UserIcon, AlertCircle } from "lucide-react";
import { useAuth } from "../App";
import ReactMarkdown from 'react-markdown'; 


export default function Chat() {
    const { conversationId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    // Auto-scroll inside effect whenever messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    useEffect(() => {
        let isMounted = true;
        const initChat = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Fetch exact history of this conversation from database
                const history = await conversationsApi.getMessages(conversationId);
                // Assume backend returns array of Message objects: { id, role, content, created_at }
                if (isMounted) setMessages(history || []);
                
                // 2. Check if we arrived via a fresh "New Chat" submission from User.jsx
                if (location.state?.initialMessage && isMounted) {
                    const initMsg = location.state.initialMessage;
                    // Wipe state to prevent double-submit on refresh
                    window.history.replaceState({}, document.title);
                    
                    // 1. Manually save User message to DB
                    await conversationsApi.createMessage(conversationId, { role: 'user', content: initMsg });
                    
                    // Sync timeline to show user message properly
                    const historyWithUser = await conversationsApi.getMessages(conversationId);
                    if (isMounted) setMessages(historyWithUser || []);

                    // 2. Fire off to graph backend via SSE
                    await streamAiResponse(initMsg, conversationId);
                }
            } catch (err) {
                console.error("Failed to load chat", err);
                if (isMounted) setError("Failed to load conversation context.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        
        initChat();
        return () => { isMounted = false; };
    }, [conversationId]); // Re-run if ID changes via sidebar

    const streamAiResponse = async (userMsg, threadId) => {
        let fullReply = "";
        const aiMessageId = `temp_ai_${Date.now()}`;
        
        // Add a placeholder message for the AI
        setMessages(prev => [...prev, { 
            id: aiMessageId, 
            role: 'ai', 
            content: "" 
        }]);

        try {
            await chatApi.chatSse({ message: userMsg, thread_id: threadId }, (data) => {
                if (data.done) {
                    // Finalize: Save to DB
                    conversationsApi.createMessage(threadId, { role: 'ai', content: fullReply });
                } else if (data.content !== undefined) {
                    fullReply += data.content;
                    setMessages(prev => prev.map(msg => 
                        msg.id === aiMessageId ? { ...msg, content: fullReply } : msg
                    ));
                }
            });
        } catch (err) {
            console.error("Streaming failed", err);
            setError("Connection lost. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;
        
        const userMsg = input.trim();
        setInput("");
        setError(null);
        
        // 1. Optimistic UI Push for user message
        setMessages(prev => [...prev, { 
            id: `temp_user_${Date.now()}`, 
            role: 'user', 
            content: userMsg 
        }]);
        setLoading(true);
        
        try {
            // 2. Manually save User message to DB
            await conversationsApi.createMessage(conversationId, { role: 'user', content: userMsg });
            
            // 3. Stream AI response
            await streamAiResponse(userMsg, conversationId);
        } catch (err) {
            console.error("Failed to send message", err);
            setError("Failed to send your message. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0d1117] relative">
            
            {/* Thread Area */}
            <div className="flex-1 overflow-y-auto w-full px-4 md:px-8 pt-6 pb-32">
                <div className="w-full max-w-3xl mx-auto space-y-6">
                    {messages.length === 0 && !loading && !error && (
                        <div className="text-center py-20 text-gray-500">
                            No messages in this conversation yet. Send a message to start!
                        </div>
                    )}
                    
                    {error && (
                        <div className="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-medium justify-center mx-auto shadow-sm">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    {messages.map((msg, idx) => {
                        const isUser = msg.role === 'user';
                        return (
                            <div key={msg.id || idx} className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                <div className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                    
                                    {/* Avatar */}
                                    <div className="shrink-0 mt-1">
                                        {isUser ? (
                                            <div className="w-8 h-8 rounded-full bg-[#161b22] dark:bg-white/10 flex items-center justify-center border border-gray-200 dark:border-white/10">
                                                <UserIcon className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#16a37a] to-[#0ba8b2] flex items-center justify-center shadow-sm">
                                                <Bot className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Message Bubble */}
                                    <div className={`px-5 py-3.5 text-[15px] leading-relaxed wrap-break-word rounded-2xl ${
                                        isUser 
                                        ? 'bg-[#161b22] text-white dark:bg-white/10 dark:text-gray-100 rounded-tr-sm' 
                                        : 'bg-gray-50 border border-gray-100 text-gray-900 dark:bg-transparent dark:border-none dark:text-gray-200 rounded-tl-sm'
                                    }`}>
                                        {isUser ? (
                                            <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                                        ) : (
                                            <div className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:bg-gray-800 prose-pre:text-white max-w-none">
                                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        );
                    })}

                    {loading && (
                        <div className="w-full flex justify-start animate-fade-in">
                            <div className="flex gap-3 max-w-[85%]">
                                <div className="shrink-0 mt-1">
                                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#16a37a] to-[#0ba8b2] flex items-center justify-center shadow-sm">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                                <div className="px-5 py-4 text-sm rounded-2xl bg-gray-50 dark:bg-transparent rounded-tl-sm flex gap-2 items-center h-[52px]">
                                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{animationDelay: "0ms"}}></div>
                                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{animationDelay: "150ms"}}></div>
                                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{animationDelay: "300ms"}}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} className="h-4" />
                </div>
            </div>

            {/* Input Overlay */}
            <div className="absolute bottom-0 left-0 w-full pt-10 pb-6 px-4 md:px-8 bg-linear-to-t from-white via-white to-transparent dark:from-[#0d1117] dark:via-[#0d1117]">
                <div className="w-full max-w-4xl mx-auto">
                    <form 
                        onSubmit={handleSend}
                        className="relative flex items-end w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161b22] px-4 py-3 shadow-[0_0_40px_rgba(0,0,0,0.05)] dark:shadow-none transition-colors focus-within:ring-2 focus-within:ring-[#16a37a]/50 focus-within:border-[#16a37a]"
                    >
                        <textarea 
                            rows={1}
                            placeholder="Message PatGPT..."
                            className="flex-1 max-h-48 min-h-[24px] bg-transparent border-0 outline-none resize-none text-gray-900 dark:text-white placeholer:text-gray-400 py-1 text-[15px] leading-relaxed"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                        />
                        <button 
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="ml-3 shrink-0 p-2 rounded-xl bg-[#16a37a] hover:bg-[#0f8463] text-white disabled:opacity-30 disabled:hover:bg-[#16a37a] transition-colors shadow flex items-center justify-center"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5 -ml-0.5" />}
                        </button>
                    </form>
                </div>
            </div>
            
        </div>
    );
}