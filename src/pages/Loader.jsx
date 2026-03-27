// pages/Loader.jsx
// ── Pings the Render backend until it wakes up, then redirects to /login ──

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { health } from "../api/api";

const POLL_INTERVAL_MS = 3000;
const MAX_WAIT_MS = 120_000; // 2 minutes max

// ── tiny SVG cross / pill logo ────────────────────────────────────────────
function PharmaCross({ size = 40 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="14" y="4" width="12" height="32" rx="4" fill="url(#gc)" />
            <rect x="4" y="14" width="32" height="12" rx="4" fill="url(#gc)" opacity="0.85" />
            <defs>
                <linearGradient id="gc" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#16a37a" />
                    <stop offset="100%" stopColor="#0ba8b2" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// ── Status messages while waiting ─────────────────────────────────────────
const statusMessages = [
    "Waking up the backend server…",
    "Render free tier needs a moment to spin up…",
    "Almost there, establishing connection…",
    "Waiting for the server to respond…",
    "Hang tight, this usually takes 30–60 seconds…",
    "Still connecting — thanks for your patience…",
];

export default function Loader() {
    const navigate = useNavigate();
    const [attempt, setAttempt] = useState(0);
    const [messageIdx, setMessageIdx] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [timedOut, setTimedOut] = useState(false);
    const startRef = useRef(Date.now());
    const timerRef = useRef(null);
    const pollRef = useRef(null);

    // ── Elapsed-time ticker ───────────────────────────────────
    useEffect(() => {
        timerRef.current = setInterval(() => {
            const ms = Date.now() - startRef.current;
            setElapsed(Math.floor(ms / 1000));
            if (ms >= MAX_WAIT_MS) {
                clearInterval(timerRef.current);
                clearTimeout(pollRef.current);
                setTimedOut(true);
            }
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, []);

    // ── Message rotator ───────────────────────────────────────
    useEffect(() => {
        const id = setInterval(() => {
            setMessageIdx((i) => (i + 1) % statusMessages.length);
        }, 6000);
        return () => clearInterval(id);
    }, []);

    // ── Health poll ───────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;

        async function ping() {
            if (cancelled || timedOut) return;
            setAttempt((n) => n + 1);
            try {
                await health.check();
                if (!cancelled) {
                    // ✅ Backend is up — go to login
                    navigate("/login", { replace: true });
                }
            } catch {
                // Still sleeping — try again
                if (!cancelled && !timedOut) {
                    pollRef.current = setTimeout(ping, POLL_INTERVAL_MS);
                }
            }
        }

        ping();
        return () => {
            cancelled = true;
            clearTimeout(pollRef.current);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const retry = () => {
        setTimedOut(false);
        setElapsed(0);
        setAttempt(0);
        startRef.current = Date.now();
        window.location.reload();
    };

    // ── Render ────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-pharma-mesh dark:bg-[#0d1117] flex flex-col items-center justify-center px-4 transition-colors duration-300">
            {/* Card */}
            <div className="w-full max-w-sm bg-white/80 dark:bg-[#161b22]/90 backdrop-blur-xl border border-white/60 dark:border-white/[0.07] rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-6 animate-fade-in">

                {/* Logo */}
                <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#16a37a] to-[#0ba8b2] flex items-center justify-center shadow-lg shadow-[#16a37a]/30">
                        <PharmaCross size={32} />
                    </div>
                    {/* Ping ring */}
                    {!timedOut && (
                        <span className="absolute -inset-1 rounded-2xl border-2 border-[#16a37a]/40 animate-ping-brand" />
                    )}
                </div>

                {/* Wordmark */}
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        PatGPT <span className="text-[#16a37a]">Support</span>
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-medium uppercase tracking-widest">
                        Pharma Intelligence Platform
                    </p>
                </div>

                {/* Status */}
                {!timedOut ? (
                    <>
                        {/* Dots */}
                        <div className="flex items-center gap-2">
                            <div className="loader-dot" />
                            <div className="loader-dot" />
                            <div className="loader-dot" />
                        </div>

                        {/* Message */}
                        <p className="text-sm text-center text-gray-600 dark:text-gray-400 min-h-10 transition-all duration-500 px-2">
                            {statusMessages[messageIdx]}
                        </p>

                        {/* Progress bar */}
                        <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-linear-to-r from-[#16a37a] to-[#0ba8b2] rounded-full transition-all duration-1000"
                                style={{ width: `${Math.min((elapsed / 120) * 100, 95)}%` }}
                            />
                        </div>

                        {/* Meta */}
                        <div className="flex items-center justify-between w-full text-xs text-gray-400 dark:text-gray-600">
                            <span>Attempt #{attempt}</span>
                            <span>{elapsed}s elapsed</span>
                        </div>
                    </>
                ) : (
                    /* Timed out state */
                    <>
                        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Connection timed out</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                The backend didn't respond within 2 minutes.
                            </p>
                        </div>
                        <button
                            onClick={retry}
                            className="w-full bg-[#16a37a] hover:bg-[#0f8463] text-white font-semibold rounded-xl py-2.5 text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            Try Again
                        </button>
                    </>
                )}
            </div>

            {/* Footer note */}
            {!timedOut && (
                <p className="mt-6 text-xs text-gray-400 dark:text-gray-600 text-center max-w-xs">
                    Hosted on Render's free tier — the server sleeps after inactivity and needs
                    a moment to wake up. This is a one-time wait.
                </p>
            )}
        </div>
    );
}