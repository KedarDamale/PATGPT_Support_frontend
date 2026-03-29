import { useState, useEffect } from "react";
import { authApi, memoriesApi } from "../../api";
import { Search, History, X, User as UserIcon } from "lucide-react";

export default function UsersView() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const limit = 20;

    const [selectedUser, setSelectedUser] = useState(null);
    const [memories, setMemories] = useState([]);
    const [loadingMemories, setLoadingMemories] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const res = await authApi.getUsers({ skip: page * limit, limit });
                // If API returns array directly
                setUsers(res || []);
            } catch (err) {
                console.error("Failed to fetch users", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [page]);

    const viewMemories = async (user) => {
        setSelectedUser(user);
        setLoadingMemories(true);
        try {
            const res = await memoriesApi.getMemoriesByUser(user.id);
            setMemories(res || []);
        } catch (err) {
            console.error("Failed to fetch memories", err);
            setMemories([]);
        } finally {
            setLoadingMemories(false);
        }
    };

    return (
        <div className="flex-1 flex overflow-hidden">
            {/* Users Table */}
            <div className={`flex-1 flex flex-col bg-white dark:bg-[#0d1117] transition-all`}>
                <div className="p-6 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Manage Users</h2>
                        <p className="text-sm text-gray-500">View registered users and inspect their memories.</p>
                    </div>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#16a37a]"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    {loading ? (
                        <div className="flex justify-center py-10"><div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[#16a37a] animate-spin" /></div>
                    ) : (
                        <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-[#161b22]/50">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-medium">
                                    <tr>
                                        <th className="px-4 py-3 border-b border-gray-200 dark:border-white/10">ID</th>
                                        <th className="px-4 py-3 border-b border-gray-200 dark:border-white/10">Email</th>
                                        <th className="px-4 py-3 border-b border-gray-200 dark:border-white/10">Role</th>
                                        <th className="px-4 py-3 border-b border-gray-200 dark:border-white/10">Status</th>
                                        <th className="px-4 py-3 border-b border-gray-200 dark:border-white/10">Joined</th>
                                        <th className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 font-mono text-[11px] text-gray-500 truncate max-w-[100px]" title={u.id}>{u.id}</td>
                                            <td className="px-4 py-3 font-medium flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                                                    <UserIcon className="w-3 h-3 text-gray-500" />
                                                </div>
                                                {u.email}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`flex items-center gap-1.5 text-xs font-medium ${u.is_active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    {u.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-xs">
                                                {new Date(u.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => viewMemories(u)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-semibold transition-colors"
                                                >
                                                    <History className="w-3.5 h-3.5" />
                                                    Memories
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-8 text-center text-gray-500">No users found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            {/* Pagination Controls */}
                            <div className="px-4 py-3 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10 flex justify-between items-center">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-white/10 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="text-xs text-gray-500">Page {page + 1}</span>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={users.length < limit}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-white/10 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Memories Slideover */}
            {selectedUser && (
                <div className="w-96 bg-white dark:bg-[#161b22] border-l border-gray-200 dark:border-white/10 flex flex-col shadow-2xl z-10 animate-fade-in shrink-0">
                    <div className="p-6 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-gray-50 dark:bg-white/5">
                        <div className="overflow-hidden">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <History className="w-4 h-4 text-[#16a37a]" />
                                User Memories
                            </h3>
                            <p className="text-xs text-gray-500 truncate mt-1">{selectedUser.email}</p>
                        </div>
                        <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg text-gray-500 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto p-6 space-y-4 bg-pharma-mesh dark:bg-transparent">
                        {loadingMemories ? (
                            <div className="flex justify-center py-6"><div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-[#16a37a] animate-spin" /></div>
                        ) : memories.length > 0 ? (
                            memories.map(m => (
                                <div key={m.id} className="bg-white dark:bg-[#0d1117]/80 border border-gray-200 dark:border-white/10 p-4 rounded-xl shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-mono bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 px-2 py-0.5 rounded-md self-start truncate max-w-[150px]" title={m.key}>
                                            {m.key}
                                        </span>
                                        <span className="text-[10px] text-gray-400">{new Date(m.updated_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 break-words line-clamp-4 hover:line-clamp-none transition-all">
                                        {m.value}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <History className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">No memories recorded yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
