import { useState, useEffect } from "react";
import { ticketsApi } from "../../api";
import { Ticket, Search, Edit2, CheckCircle, AlertCircle, HelpCircle, Bug, Monitor } from "lucide-react";

export default function TicketsView() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const limit = 20;

    const [editingTicket, setEditingTicket] = useState(null);
    const [editForm, setEditForm] = useState({ status: "", type: "" });
    const [saving, setSaving] = useState(false);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await ticketsApi.adminGetAllTickets({ skip: page * limit, limit });
            setTickets(res || []);
        } catch (err) {
            console.error("Failed to fetch tickets", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [page]);

    const openEdit = (t) => {
        setEditingTicket(t);
        setEditForm({ status: t.status, type: t.type });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await ticketsApi.adminUpdateTicket(editingTicket.id, editForm);
            setEditingTicket(null);
            fetchTickets();
        } catch (err) {
            console.error("Failed to update ticket", err);
        } finally {
            setSaving(false);
        }
    };

    // Helper components
    const StatusBadge = ({ status }) => {
        const colors = {
            raised: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 border-red-200 dark:border-red-500/30",
            pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-200 dark:border-amber-500/30",
            attended: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border-blue-200 dark:border-blue-500/30",
            closed: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300 border-green-200 dark:border-green-500/30"
        };
        const icons = {
            raised: <AlertCircle className="w-3 h-3" />,
            pending: <Monitor className="w-3 h-3" />,
            attended: <CheckCircle className="w-3 h-3" />,
            closed: <CheckCircle className="w-3 h-3" />
        };
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${colors[status] || "bg-gray-100 text-gray-700"}`}>
                {icons[status]} {status}
            </span>
        );
    };

    const TypeBadge = ({ type }) => {
        const icons = {
            bug: <Bug className="w-3.5 h-3.5 text-red-500" />,
            question: <HelpCircle className="w-3.5 h-3.5 text-blue-500" />,
            feature: <Monitor className="w-3.5 h-3.5 text-green-500" />,
            other: <Ticket className="w-3.5 h-3.5 text-gray-500" />
        };
        return (
            <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                {icons[type]} {type}
            </span>
        );
    };

    return (
        <div className="flex-1 flex flex-col bg-white dark:bg-[#0d1117] relative">
            <div className="p-6 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Support Tickets</h2>
                    <p className="text-sm text-gray-500">Manage and resolve user tickets.</p>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
                {loading ? (
                    <div className="flex justify-center py-10"><div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[#16a37a] animate-spin" /></div>
                ) : (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {tickets.map(t => (
                            <div key={t.id} className="bg-gray-50 dark:bg-[#161b22]/50 border border-gray-200 dark:border-white/10 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex space-x-2">
                                        <TypeBadge type={t.type} />
                                    </div>
                                    <StatusBadge status={t.status} />
                                </div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{t.name}</h3>
                                <p className="text-xs text-gray-500 mb-4 line-clamp-1 border-b border-dashed border-gray-300 dark:border-white/10 pb-2 flex-grow">
                                    <span className="font-semibold text-gray-600 dark:text-gray-400">Cause:</span> {t.cause}
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-4 flex-grow">
                                    {t.description}
                                </p>
                                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                                    <span className="text-[10px] text-gray-400 font-mono">User: {t.user_id}</span>
                                    <button
                                        onClick={() => openEdit(t)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#16a37a]/10 hover:bg-[#16a37a]/20 text-[#16a37a] rounded-lg text-xs font-semibold transition-colors"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                        Update
                                    </button>
                                </div>
                            </div>
                        ))}
                        {tickets.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-300 dark:border-white/20">
                                <Ticket className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                No tickets found.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-[#161b22]/50 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                 <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-4 py-2 text-sm font-semibold rounded-lg bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-white/10 disabled:opacity-50 shadow-sm">
                    Previous
                </button>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Page {page + 1}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={tickets.length < limit} className="px-4 py-2 text-sm font-semibold rounded-lg bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-white/10 disabled:opacity-50 shadow-sm">
                    Next
                </button>
            </div>

            {/* Edit Modal */}
            {editingTicket && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-[#161b22] w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-white/10 flex flex-col items-center p-8 gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-[#16a37a]/10 flex items-center justify-center text-[#16a37a]">
                             <Edit2 className="w-6 h-6" />
                        </div>
                        <div className="text-center w-full">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Update Ticket</h3>
                            <p className="text-xs text-gray-500 truncate mt-1 break-all px-4">{editingTicket.id}</p>
                        </div>

                        <form onSubmit={handleSave} className="flex flex-col gap-4 w-full">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                <select 
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a37a]"
                                    value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}
                                >
                                    <option value="raised">Raised</option>
                                    <option value="pending">Pending</option>
                                    <option value="attended">Attended</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                <select 
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a37a]"
                                    value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value})}
                                >
                                    <option value="bug">Bug</option>
                                    <option value="question">Question</option>
                                    <option value="feature">Feature</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            
                            <div className="flex gap-3 mt-4">
                                <button type="button" onClick={() => setEditingTicket(null)} className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 transition-colors">
                                    Cancel
                                </button>
                                <button disabled={saving} type="submit" className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white bg-[#16a37a] hover:bg-[#0f8463] shadow-md transition-colors disabled:opacity-50">
                                    {saving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
