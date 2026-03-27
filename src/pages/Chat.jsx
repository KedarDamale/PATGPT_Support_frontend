// pages/Chat.jsx — stub
import { useParams } from "react-router-dom";
import { useAuth } from "../App";

export default function Chat() {
    const { conversationId } = useParams();
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-[#f8fafb] dark:bg-[#0d1117] flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white dark:bg-[#161b22] border border-gray-100 dark:border-white/[0.06] rounded-2xl shadow-sm p-6 animate-fade-in">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Chat stub</p>
                <div className="flex flex-col gap-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-white/[0.06]">
                        <span className="text-gray-400 text-xs uppercase tracking-widest font-semibold">User ID</span>
                        <span className="text-gray-700 dark:text-gray-300 break-all">{user?.id}</span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-gray-400 text-xs uppercase tracking-widest font-semibold">Conversation ID</span>
                        <span className="text-gray-700 dark:text-gray-300 break-all">{conversationId}</span>
                    </div>
                </div>
                <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">Chat UI coming soon</p>
            </div>
        </div>
    );
}