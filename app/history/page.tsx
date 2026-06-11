"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface AppSession {
  id: string;
  duration: number;
  createdAt: string;
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<AppSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/appSession");
      if (!response.ok) throw new Error("Failed to fetch sessions");
      const data = await response.json();
      setSessions(data.response || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
    const secs = (seconds % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <p className="text-[#888888] text-sm">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A]">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
        <span className="text-white font-bold text-lg">VoiceUp</span>
        <Link
          href="/home"
          className="text-[#888888] text-sm hover:text-white transition-colors"
        >
          ← Back to home
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Session History</h1>
          <p className="text-[#888888] text-sm mt-1">
            {sessions.length} {sessions.length === 1 ? "session" : "sessions"} total
          </p>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-[#888888]">No sessions yet.</p>
            <Link
              href="/session"
              className="inline-block bg-white text-black font-medium px-6 py-2 rounded-lg text-sm hover:bg-[#f0f0f0] transition-colors"
            >
              Start your first session
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, index) => (
              <div
                key={session.id}
                className="bg-[#111111] border border-[#1a1a1a] rounded-xl px-5 py-4 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <p className="text-white text-sm font-medium">
                    Session {sessions.length - index}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[#888888]">
                    <span>
                      {new Date(session.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#444444]" />
                    <span>{formatDuration(session.duration)}</span>
                  </div>
                </div>

                <Link
                  href={`/feedback/${session.id}`}
                  className="text-sm text-[#888888] border border-[#222222] px-4 py-1.5 rounded-lg hover:text-white hover:border-[#444444] transition-colors"
                >
                  View Feedback
                </Link>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}