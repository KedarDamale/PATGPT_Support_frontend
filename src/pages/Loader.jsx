import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";

const BACKEND_URL   = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") ?? "";
const POLL_INTERVAL = 9000;   // ms between retries
const MAX_WAIT      = 240000; // 4 min timeout

function PharmaCross({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect x="14" y="4" width="12" height="32" rx="4" fill="white" />
      <rect x="4" y="14" width="32" height="12" rx="4" fill="white" opacity="0.85" />
    </svg>
  );
}

const MESSAGES = [
  "Waking up the backend server…",
  "Render free tier sleeps after inactivity — hang tight…",
  "Almost there, establishing connection…",
  "Still waiting for the server to respond…",
  "This usually takes 30–60 seconds on first load…",
  "Thanks for your patience, nearly done…",
];

export default function Loader() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [attempt,   setAttempt]   = useState(0);
  const [msgIdx,    setMsgIdx]    = useState(0);
  const [elapsed,   setElapsed]   = useState(0);
  const [timedOut,  setTimedOut]  = useState(false);
  const [lastError, setLastError] = useState("");

  const startedAt = useRef(Date.now());
  const pollTimer = useRef(null);
  const cancelled = useRef(false);

  // ── 1-second elapsed ticker ──────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Message rotator ──────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setMsgIdx(i => (i + 1) % MESSAGES.length), 6000);
    return () => clearInterval(id);
  }, []);

  // ── Poll function ────────────────────────────────────────
  const poll = async () => {
    if (cancelled.current) return;

    if (Date.now() - startedAt.current >= MAX_WAIT) {
      setTimedOut(true);
      return;
    }

    setAttempt(n => n + 1);

    try {
      // Plain fetch — bypasses api.js wrapper entirely
      const res = await fetch(`${BACKEND_URL}/health/`, {
        method: "GET",
        signal: AbortSignal.timeout(8000), // 8s per request
      });

      if (res.ok) {
        if (!cancelled.current) {
          if (user) {
            navigate(user.role === "admin" ? "/admin" : `/user/${user.id}`, { replace: true });
          } else {
            navigate("/login", { replace: true });
          }
        }
        return;
      }

      setLastError(`Server returned HTTP ${res.status}, retrying…`);
    } catch (err) {
      setLastError(
        err.name === "TimeoutError"
          ? "Request timed out, retrying…"
          : "No response yet, retrying…"
      );
    }

    // Schedule next attempt
    if (!cancelled.current) {
      pollTimer.current = setTimeout(poll, POLL_INTERVAL);
    }
  };

  // ── Start on mount ───────────────────────────────────────
  useEffect(() => {
    cancelled.current = false;
    poll();
    return () => {
      cancelled.current = true;
      clearTimeout(pollTimer.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Retry ────────────────────────────────────────────────
  const retry = () => {
    cancelled.current = false;
    startedAt.current = Date.now();
    setTimedOut(false);
    setElapsed(0);
    setAttempt(0);
    setLastError("");
    poll();
  };

  const pct = Math.min((elapsed / 120) * 100, 96);

  return (
    <div className="min-h-screen bg-pharma-mesh dark:bg-[#0d1117] flex flex-col items-center justify-center px-4 transition-colors duration-300">
      <div className="w-full max-w-sm bg-white/80 dark:bg-[#161b22]/90 backdrop-blur-xl border border-white/60 dark:border-white/[0.07] rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-6 animate-fade-in">

        {/* Logo */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#16a37a] to-[#0ba8b2] flex items-center justify-center shadow-lg shadow-[#16a37a]/30">
            <PharmaCross />
          </div>
          {!timedOut && (
            <span className="absolute -inset-1 rounded-2xl border-2 border-[#16a37a]/40 animate-ping-brand" />
          )}
        </div>

        {/* Wordmark */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            PatGPT <span className="text-[#16a37a]">Support</span>
          </h1>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-semibold uppercase tracking-widest">
            Pharma Intelligence Platform
          </p>
        </div>

        {!timedOut ? (
          <>
            <div className="flex items-center gap-2">
              <div className="loader-dot" />
              <div className="loader-dot" />
              <div className="loader-dot" />
            </div>

            <p className="text-sm text-center text-gray-600 dark:text-gray-400 min-h-[40px] px-2">
              {MESSAGES[msgIdx]}
            </p>

            <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-[#16a37a] to-[#0ba8b2] rounded-full transition-all duration-1000"
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="flex items-center justify-between w-full text-xs text-gray-400 dark:text-gray-600">
              <span>Attempt #{attempt}</span>
              <span>{elapsed}s elapsed</span>
            </div>

            {lastError && (
              <p className="text-[11px] text-gray-400 dark:text-gray-600 text-center -mt-3">
                {lastError}
              </p>
            )}
          </>
        ) : (
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
            <button onClick={retry}
              className="w-full bg-[#16a37a] hover:bg-[#0f8463] text-white font-semibold rounded-xl py-2.5 text-sm transition-all duration-200 shadow-sm hover:shadow-md">
              Try Again
            </button>
          </>
        )}
      </div>

      {!timedOut && (
        <p className="mt-5 text-xs text-gray-400 dark:text-gray-600 text-center max-w-xs">
          Hosted on Render's free tier — cold starts can take 30–60 seconds.
        </p>
      )}
    </div>
  );
}