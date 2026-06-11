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

      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }

      const data = await response.json();

      setSessions(data.response || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading sessions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">
        Session History
      </h1>

      {sessions.length === 0 ? (
        <div className="border rounded-lg p-6 text-center">
          <p>No sessions found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="border rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">
                  {new Date(
                    session.createdAt
                  ).toLocaleDateString()}
                </p>

                <p className="text-gray-600">
                  Duration: {session.duration} sec
                </p>
              </div>

              <Link
                href={`/feedback/${session.id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                View Feedback
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}