import { useState, useEffect } from "react";
import { ticketsApi } from "../api";
import { Ticket, Clock, CheckCircle, AlertCircle, Search, Filter } from "lucide-react";

export default function Tickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const data = await ticketsApi.getMyTickets();
                setTickets(data || []);
            } catch (err) {
                console.error("Failed to fetch tickets", err);
                setError("Could not load your tickets. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    const filteredTickets = tickets.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'open': return <Clock className="w-4 h-4 text-amber-500" />;
            case 'resolved': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            case 'closed': return <CheckCircle className="w-4 h-4 text-gray-400" />;
            default: return <AlertCircle className="w-4 h-4 text-blue-500" />;
        }
    };

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'open': return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
            case 'resolved': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
            case 'closed': return 'bg-gray-50 text-gray-600 dark:bg-white/5 dark:text-gray-400';
            default: return 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400';
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-white dark:bg-[#0d1117]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[#16a37a] animate-spin" />
                    <p className="text-sm text-gray-400 font-medium">Loading tickets...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0d1117] overflow-y-auto">
            <div className="w-full max-w-5xl mx-auto px-6 py-8 md:py-12">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">My Support Tickets</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Track and manage your requests here.</p>
                    </div>
                    
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search tickets..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#16a37a]/30 focus:border-[#16a37a] outline-none transition-all dark:text-gray-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {error ? (
                    <div className="p-8 text-center bg-red-50 dark:bg-red-500/5 rounded-3xl border border-red-100 dark:border-red-500/10">
                        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                        <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div className="p-20 text-center bg-gray-50/50 dark:bg-white/2 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                        <Ticket className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No tickets found.</p>
                        {searchTerm && (
                            <button onClick={() => setSearchTerm("")} className="mt-4 text-[#16a37a] text-sm font-bold hover:underline">
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredTickets.map(ticket => (
                            <div 
                                key={ticket.id} 
                                className="group p-5 md:p-6 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-2xl hover:border-[#16a37a] transition-all shadow-sm hover:shadow-md"
                            >
                                <div className="flex flex-col md:flex-row gap-4 md:items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${getStatusStyle(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                            <span className="text-xs text-gray-400 font-medium">ID: {ticket.id.substring(0, 8)}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 truncate group-hover:text-[#16a37a] transition-colors">
                                            {ticket.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl line-clamp-2">
                                            {ticket.description}
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center justify-between md:flex-col md:items-end gap-3 shrink-0">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                                            {getStatusIcon(ticket.status)}
                                            {ticket.type}
                                        </div>
                                        <div className="text-[11px] text-gray-400 font-medium uppercase tracking-tight">
                                            Updated: {new Date(ticket.updated_at || ticket.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
