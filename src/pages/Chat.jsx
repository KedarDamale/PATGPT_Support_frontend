import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { conversationsApi, chatApi } from "../api";
import { Send, Bot, User as UserIcon, AlertCircle } from "lucide-react";
import { useAuth } from "../App";
import ReactMarkdown from 'react-markdown';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const renderAiContent = (content) => {
    // Safety: parse string content if it's a JSON object
    let parsedContent = content;
    if (typeof content === 'string') {
        try {
            const parsed = JSON.parse(content);
            // Only use parsed if it looks like a structured response (has format_used, output, etc)
            if (parsed && typeof parsed === 'object' && (parsed.format_used || parsed.output || parsed.table_data || parsed.chart_payloads)) {
                parsedContent = parsed;
            }
        } catch (e) {
            // Not JSON, treat as plain markdown
            parsedContent = content;
        }
    }

    if (typeof parsedContent === 'string') {
        return <ReactMarkdown>{parsedContent}</ReactMarkdown>;
    } else if (typeof parsedContent === 'object' && parsedContent !== null) {
        const { format_used, output, table_data, chart_payloads, text_summary, ticket_id, waiting_for_user, hitl_question } = parsedContent;
        const elements = [];

        // Always show the main output if present
        if (output && (format_used === 'text' || !format_used)) {
            elements.push(<ReactMarkdown key="output">{output}</ReactMarkdown>);
        }

        // Show summary if format includes summary
        if (text_summary && format_used && format_used.includes('summary')) {
            elements.push(<ReactMarkdown key="summary">{text_summary}</ReactMarkdown>);
        }

        // Show table if format includes table
        if (table_data && table_data.length > 0 && format_used && format_used.includes('table')) {
            elements.push(
                <div key="table" className="mt-4 overflow-x-auto">
                    <table className="min-w-full table-auto border-collapse border border-gray-300 dark:border-gray-600">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700">
                                {Object.keys(table_data[0]).map(key => (
                                    <th key={key} className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {table_data.map((row, idx) => (
                                <tr key={idx} className="bg-white dark:bg-gray-800">
                                    {Object.values(row).map((val, i) => (
                                        <td key={i} className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                                            {typeof val === 'number' ? val.toFixed(2) : val}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        // Show charts if format includes chart
        if (chart_payloads && chart_payloads.length > 0 && format_used && format_used.includes('chart')) {
            elements.push(
                <div key="charts" className="mt-4 space-y-4">
                    {chart_payloads.map((chart, idx) => {
                        // Handle new format: { config: {...}, data: [...] }
                        if (chart.config) {
                            const { config, data } = chart;
                            const { chart_type, x_axis, y_axis, group_by, chart_title } = config;

                            const inferAxisKey = (rows, preferred, exclude = []) => {
                                if (!Array.isArray(rows) || rows.length === 0) return preferred;
                                if (preferred && preferred in rows[0]) return preferred;
                                return Object.keys(rows[0]).find(key => !exclude.includes(key)) || preferred;
                            };

                            const resolvedXAxis = inferAxisKey(data, x_axis, [group_by]);
                            const resolvedYAxis = inferAxisKey(data, y_axis, [resolvedXAxis, group_by]);
                            const hasGroupBy = group_by && data.length > 0 && group_by in data[0];

                            if (chart_type === 'scatter') {
                                const groupedData = {};
                                data.forEach(point => {
                                    const group = hasGroupBy ? String(point[group_by] ?? 'Unknown') : 'Unknown';
                                    if (!groupedData[group]) groupedData[group] = [];
                                    const xVal = Number(point[resolvedXAxis] ?? 0);
                                    const yVal = Number(point[resolvedYAxis] ?? 0);
                                    groupedData[group].push({ x: xVal, y: yVal, label: group });
                                });

                                const datasets = Object.entries(groupedData).map(([group, points], i) => ({
                                    label: group,
                                    data: points,
                                    backgroundColor: `hsla(${(i * 360) / Object.keys(groupedData).length}, 70%, 60%, 0.6)`,
                                    borderColor: `hsl(${(i * 360) / Object.keys(groupedData).length}, 70%, 40%)`,
                                    borderWidth: 1
                                }));

                                return (
                                    <div key={idx} className="w-full max-w-4xl mx-auto">
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{chart_title}</p>
                                        <Scatter data={{ datasets }} options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: !!chart_title, text: chart_title } } }} />
                                    </div>
                                );
                            }

                            const labels = data.map(row => String(row[resolvedXAxis] ?? ''));
                            const buildDatasets = () => {
                                if (hasGroupBy) {
                                    const groups = {};
                                    labels.forEach((label, index) => {
                                        const point = data[index];
                                        const groupName = String(point[group_by] ?? 'Unknown');
                                        groups[groupName] = groups[groupName] || {};
                                        groups[groupName][label] = Number(point[resolvedYAxis] ?? 0);
                                    });
                                    return Object.entries(groups).map(([groupName, groupValues], i) => ({
                                        label: groupName,
                                        data: labels.map(label => Number(groupValues[label] ?? 0)),
                                        backgroundColor: `hsla(${(i * 360) / Object.keys(groups).length}, 70%, 60%, 0.6)`,
                                        borderColor: `hsl(${(i * 360) / Object.keys(groups).length}, 70%, 40%)`,
                                        borderWidth: 1,
                                        fill: false,
                                    }));
                                }

                                return [{
                                    label: chart_title || resolvedYAxis || 'Value',
                                    data: data.map(row => Number(row[resolvedYAxis] ?? 0)),
                                    backgroundColor: 'rgba(22, 163, 122, 0.6)',
                                    borderColor: 'rgba(22, 163, 122, 1)',
                                    borderWidth: 1,
                                    fill: false,
                                }];
                            };

                            const chartData = {
                                labels,
                                datasets: buildDatasets()
                            };
                            const options = {
                                responsive: true,
                                plugins: {
                                    legend: { position: 'top' },
                                    title: { display: !!chart_title, text: chart_title }
                                }
                            };

                            return (
                                <div key={idx} className="w-full max-w-4xl mx-auto">
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{chart_title}</p>
                                    {chart_type === 'bar' && <Bar data={chartData} options={options} />}
                                    {chart_type === 'line' && <Line data={chartData} options={options} />}
                                    {chart_type === 'pie' && <Pie data={chartData} options={options} />}
                                </div>
                            );
                        }

                        // Handle old format: { type: 'bar'|'line'|'pie', data: {...}, options: {...} }
                        if (chart.type) {
                            return (
                                <div key={idx} className="w-full max-w-md mx-auto">
                                    {chart.type === 'bar' && <Bar data={chart.data} options={chart.options} />}
                                    {chart.type === 'line' && <Line data={chart.data} options={chart.options} />}
                                    {chart.type === 'pie' && <Pie data={chart.data} options={chart.options} />}
                                </div>
                            );
                        }

                        return null;
                    })}
                </div>
            );
        }

        // Show ticket link if ticket_id is present
        if (ticket_id) {
            elements.push(
                <div key="ticket" className="mt-4 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg">
                    <a href={`/admin/tickets`} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                        📋 View Ticket #{ticket_id}
                    </a>
                </div>
            );
        }

        // Show waiting indicator if waiting_for_user is true
        if (waiting_for_user) {
            elements.push(
                <div key="waiting" className="mt-3 text-xs text-amber-600 dark:text-amber-400 italic flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                    Waiting for your response...
                </div>
            );
        }

        // Show HITL question if present
        if (hitl_question) {
            elements.push(
                <div key="hitl" className="mt-4 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg">
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-200">⚠️ {hitl_question}</p>
                </div>
            );
        }

        // For json format, show the whole JSON only if no other structured elements exist
        if (format_used === 'json' && elements.length === 0) {
            elements.push(<pre key="json" className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded text-sm overflow-x-auto">{JSON.stringify(parsedContent, null, 2)}</pre>);
        }

        // For summary only
        if (format_used === 'summary' && text_summary) {
            elements.push(<ReactMarkdown key="summary">{text_summary}</ReactMarkdown>);
        }

        return <div>{elements}</div>;
    }
    return <div>Unsupported content type</div>;
};


export default function Chat() {
    const { conversationId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [approvalRequired, setApprovalRequired] = useState(null); // { message, threadId }
    const [activeThreadId, setActiveThreadId] = useState(null); // Track the actual thread for HITL
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
            setActiveThreadId(null); // Reset thread ID for new conversation
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

                    // 1. Optimistic push to show user message immediately
                    setMessages(prev => [...prev, {
                        id: `temp_user_${Date.now()}`,
                        role: 'user',
                        content: initMsg
                    }]);

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

    const isStreamingRef = useRef(false);

    const streamAiResponse = async (userMsg, threadId) => {
        if (isStreamingRef.current) return;
        isStreamingRef.current = true;

        let fullReply = "";
        const aiMessageId = `temp_ai_${Date.now()}`;

        // Add placeholder AI message
        setMessages(prev => [...prev, {
            id: aiMessageId,
            role: 'ai',
            content: ""
        }]);

        try {
            await chatApi.chatSse({ message: userMsg, conversation_id: threadId }, (data) => {
                if (data.done) {
                    // Finalize: preserve streamed content, just clean up temp IDs if needed
                    // Update temp ID to real ID if backend provides one (optional)
                    setMessages(prev => prev.map(msg => {
                        if (msg.id === aiMessageId && !msg.id.startsWith('real_')) {
                            // Keep the streamed content, don't replace with DB fetch
                            return msg;
                        }
                        return msg;
                    }));
                } else if (data.data) {
                    // Structured response
                    setMessages(prev => prev.map(msg =>
                        msg.id === aiMessageId ? { ...msg, content: data.data } : msg
                    ));
                } else if (data.content !== undefined) {
                    if (data.content.startsWith("__APPROVAL_REQUIRED__:")) {
                        const msg = data.content.split("__APPROVAL_REQUIRED__:")[1];
                        setApprovalRequired({ message: msg, threadId });
                        setActiveThreadId(threadId); // Lock threadId while in HITL
                        return;
                    }
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
            isStreamingRef.current = false;
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading || isStreamingRef.current) return;

        const userMsg = input.trim();
        setInput("");
        setError(null);

        // Use activeThreadId if set (during HITL), otherwise use conversationId from URL
        const targetThreadId = activeThreadId || conversationId;

        // 1. Optimistic UI Push for user message
        setMessages(prev => [...prev, {
            id: `temp_user_${Date.now()}`,
            role: 'user',
            content: userMsg
        }]);
        setLoading(true);

        try {
            // 2. Stream AI response (assuming backend handles user msg persistence)
            await streamAiResponse(userMsg, targetThreadId);
        } catch (err) {
            console.error("Failed to send message", err);
            setError("Failed to send your message. Please try again.");
            setLoading(false);
        }
    };

    const handleApproval = async (approved) => {
        if (loading || !approvalRequired) return;
        const { threadId } = approvalRequired;
        setApprovalRequired(null);
        setLoading(true);
        setError(null);

        // Add optimistic user "message" for the decision
        setMessages(prev => [...prev, {
            id: `temp_user_${Date.now()}`,
            role: 'user',
            content: approved ? "Yes, proceed." : "No, cancel."
        }]);

        try {
            const resp = await chatApi.approveChat(threadId, approved);
            if (resp.requires_approval) {
                setApprovalRequired({ message: resp.reply, threadId });
            } else {
                // HITL resolved, clear activeThreadId to resume normal flow
                setActiveThreadId(null);
            }
            // Sync history to get the AI response after approval
            const history = await conversationsApi.getMessages(threadId);
            if (history && history.length > 0) {
                setMessages(history);
            }
        } catch (err) {
            console.error("Approval failed", err);
            setError("Failed to submit approval choice.");
            setActiveThreadId(null);
        } finally {
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
                                    <div className={`px-5 py-3.5 text-[15px] leading-relaxed wrap-break-word rounded-2xl ${isUser
                                        ? 'bg-[#161b22] text-white dark:bg-white/10 dark:text-gray-100 rounded-tr-sm'
                                        : 'bg-gray-50 border border-gray-100 text-gray-900 dark:bg-transparent dark:border-none dark:text-gray-200 rounded-tl-sm'
                                        }`}>
                                        {isUser ? (
                                            <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                                        ) : (
                                            <div className="prose dark:prose-invert max-w-none">
                                                {renderAiContent(msg.content)}
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
                                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {approvalRequired && (
                        <div className="w-full flex justify-start animate-fade-in">
                            <div className="flex gap-3 max-w-[85%]">
                                <div className="shrink-0 mt-1">
                                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#16a37a] to-[#0ba8b2] flex items-center justify-center shadow-sm">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                                <div className="bg-[#16a37a]/5 border border-[#16a37a]/20 rounded-2xl p-6 shadow-sm">
                                    <p className="text-sm text-gray-800 dark:text-gray-200 font-semibold mb-4 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-[#16a37a]" />
                                        Approval Required
                                    </p>
                                    <div className="text-[15px] text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                                        {approvalRequired.message}
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleApproval(true)}
                                            className="px-6 py-2 bg-[#16a37a] text-white rounded-xl text-sm font-bold hover:bg-[#0f8463] transition-colors shadow-sm"
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            onClick={() => handleApproval(false)}
                                            className="px-6 py-2 bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
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