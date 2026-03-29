import { useState } from "react";
import { useAuth } from "../App";
import UsersView from "./admin/UsersView";
import TicketsView from "./admin/TicketsView";
import UIGraphView from "./admin/UIGraphView";
import { LayoutDashboard, Users, Ticket, Network, LogOut } from "lucide-react";

export default function Admin() {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState("users");

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-[#161b22] border-r border-gray-200 dark:border-white/10 flex flex-col transition-colors duration-300">
                <div className="p-6 border-b border-gray-200 dark:border-white/10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#16a37a] to-[#0ba8b2] flex items-center justify-center shadow-lg shadow-[#16a37a]/30">
                        <LayoutDashboard className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold">Admin Panel</h1>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">PatGPT Support</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <button
                        onClick={() => setActiveTab("users")}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "users" ? "bg-[#16a37a]/10 text-[#16a37a] dark:bg-[#16a37a]/20" : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"}`}
                    >
                        <Users className="w-4 h-4" />
                        Users & Memories
                    </button>
                    <button
                        onClick={() => setActiveTab("tickets")}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "tickets" ? "bg-[#16a37a]/10 text-[#16a37a] dark:bg-[#16a37a]/20" : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"}`}
                    >
                        <Ticket className="w-4 h-4" />
                        Support Tickets
                    </button>
                    <button
                        onClick={() => setActiveTab("ui-graph")}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "ui-graph" ? "bg-[#16a37a]/10 text-[#16a37a] dark:bg-[#16a37a]/20" : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"}`}
                    >
                        <Network className="w-4 h-4" />
                        UI Network Graph
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-white/10">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {activeTab === "users" && <UsersView />}
                {activeTab === "tickets" && <TicketsView />}
                {activeTab === "ui-graph" && <UIGraphView />}
            </main>
        </div>
    );
}