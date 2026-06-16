"use client"
import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, PhoneOff } from "lucide-react";
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react";

declare global {
    interface Window {
        SpeechRecognition: any
        webkitSpeechRecognition: any
    }
}

export default function Session() {
    const router = useRouter();
    const [isSessionStarted, setIsSessionStarted] = useState(false)
    const [isMicRecording, setIsMicRecording] = useState(false)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [sessionDuration, setSessionDuration] = useState(0)
    const [isAiThinking, setIsAiThinking] = useState(false)
    const [conversation, setConversation] = useState<{ role: string, text: string }[]>([])
    const [isStartingSession, setIsStartingSession] = useState(false)
    const [isEndingSession, setIsEndingSession] = useState(false)
    const recognitionRef = useRef<any>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isSessionStarted) return
        const interval = setInterval(() => {
            setSessionDuration(prev => prev + 1)
        }, 1000);
        return () => clearInterval(interval);
    }, [isSessionStarted]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [conversation]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
        const secs = (seconds % 60).toString().padStart(2, '0')
        return `${mins}:${secs}`
    }

    const startRecording = async () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.lang = "en-US"
        // recognition.continuous = true  // keep this false actually
        // recognition.interimResults = true
        recognition.onresult = async (event: any) => {
            const transcript = event.results[0][0].transcript
            await handleExchange(transcript);
        }
        recognition.onend = () => {
            setIsMicRecording(false)  // ← automatically reset when speech stops
        }
        recognitionRef.current = recognition
        recognition.start()
        setIsMicRecording(true)
    }

    const stopRecording = () => {
        recognitionRef.current?.stop()
        setIsMicRecording(false)
    }

    const handleStartSession = async () => {
        try {
            setIsStartingSession(true);
            const response = await fetch("/api/appSession", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({})
            })
            const data = await response.json()
            if (!data.sessionId) return
            setIsStartingSession(false);
            setSessionId(data.sessionId)
            setIsSessionStarted(true)
        } catch (error) {
            console.log("Error starting session: ", error)
        }
    }

    const handleEndSession = async () => {
        try {
            setIsSessionStarted(false);
            setIsEndingSession(true);
            await updateAppSession();
            const feedback = await feedbackApi(conversation);
            setIsEndingSession(false);
            router.push(`/feedback/${sessionId}`)
        } catch (error) {
            console.log("Error ending session:", error);
        }
    }

    const updateAppSession = async () => {
        await fetch(`/api/appSession/${sessionId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ duration: sessionDuration }),
        })
    }

    const feedbackApi = async (transcript: { role: string, text: string }[]) => {
        if (transcript.length === 0) return;
        const response = await fetch(`/api/feedback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: sessionId, transcript: transcript })
        })
        return await response.json();
    }

    const handleExchange = async (transcript: string) => {
        try {
            if (!transcript) return;
            setConversation(prev => [...prev, { role: 'user', text: transcript }])
            saveMessage('user', transcript);
            setIsAiThinking(true);
            const geminiResponse = await callGemini(transcript, conversation);
            setIsAiThinking(false);
            if (geminiResponse) {
                setConversation(prev => [...prev, { role: 'ai', text: geminiResponse }])
                saveMessage('ai', geminiResponse);
            }
        } catch (error) {
            setIsAiThinking(false)
            console.log("Error : ", error);
        }
    }

    const saveMessage = async (role: string, text: string) => {
        try {
            await fetch("/api/message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, role, text })
            })
        } catch (error) {
            console.log("Error while saving message to db : ", error);
        }
    }

    const callGemini = async (transcript: string, history: { role: string, text: string }[]) => {
        try {
            const geminiResponse = await fetch("/api/conversation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transcript, history })
            })
            const data = await geminiResponse.json();
            if (!geminiResponse.ok) {
                toast.error("AI is temporarily unavailable. Please try again.")
                return null
            }
            return data.response;
        } catch (error) {
            toast.error("Something went wrong. Please try again.")
            console.log("Error while calling gemini api : ", error);
            return null
        }
    }

    return (
        <main className="min-h-screen bg-[#0A0A0A] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
                <span className="text-white font-bold text-lg">VoiceUp</span>
                <div className="flex items-center gap-4">
                    {isSessionStarted && (
                        <span className="text-[#888888] text-sm font-mono">
                            {formatDuration(sessionDuration)}
                        </span>
                    )}
                    <div className={`flex items-center gap-2 text-xs px-3 py-1 rounded-full border ${isMicRecording
                        ? "border-red-500/30 text-red-400 bg-red-500/10"
                        : "border-[#222222] text-[#888888]"
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isMicRecording ? "bg-red-400 animate-pulse" : "bg-[#444444]"}`} />
                        {isMicRecording ? "Recording" : "Idle"}
                    </div>
                </div>
            </div>

            {/* Conversation Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-6 py-6 space-y-4 max-w-2xl w-full mx-auto"
            >
                {conversation.length === 0 && (
                    <div className="flex items-center justify-center h-full min-h-[200px]">
                        <p className="text-[#444444] text-sm">
                            {isSessionStarted ? "Press the mic to start speaking..." : "Start a session to begin practicing"}
                        </p>
                    </div>
                )}

                {conversation.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                            ? 'bg-white text-black rounded-br-sm'
                            : 'bg-[#111111] text-white border border-[#222222] rounded-bl-sm'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isAiThinking && (
                    <div className="flex justify-start">
                        <div className="bg-[#111111] border border-[#222222] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#888888] animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#888888] animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#888888] animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="border-t border-[#1a1a1a] px-6 py-6">
                <div className="max-w-2xl mx-auto flex flex-col items-center gap-4">

                    {!isSessionStarted ? (
                        <button
                            onClick={handleStartSession}
                            className="bg-white text-black font-medium px-8 py-3 rounded-lg hover:bg-[#f0f0f0] transition-colors duration-150"
                        >
                            {isStartingSession ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Start Session"
                            )}
                        </button>
                    ) : (
                        <div className="flex items-center gap-6">

                            {/* Mic Button */}
                            <button
                                onClick={isMicRecording ? stopRecording : startRecording}
                                className={`relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-200 ${isMicRecording
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "bg-white hover:bg-[#f0f0f0]"
                                    }`}
                            >
                                {isMicRecording && (
                                    <span className="absolute inset-0 rounded-full animate-ping bg-red-500 opacity-20" />
                                )}
                                {isMicRecording
                                    ? <MicOff className="h-6 w-6 text-white" />
                                    : <Mic className="h-6 w-6 text-black" />
                                }
                            </button>

                            {/* End Session */}
                            <button
                                onClick={handleEndSession}
                                className="flex items-center gap-2 text-[#888888] text-sm border border-[#222222] px-4 py-2 rounded-lg hover:border-red-500/50 hover:text-red-400 transition-colors duration-150"
                            >
                                <PhoneOff className="h-4 w-4" />

                                {isEndingSession ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "End Session"
                                )}


                            </button>
                        </div>
                    )}

                    {isSessionStarted && (
                        <p className="text-[#444444] text-xs">
                            {isMicRecording ? "Listening... click to stop" : "Click mic to speak"}
                        </p>
                    )}
                </div>
            </div>

        </main>
    );
}