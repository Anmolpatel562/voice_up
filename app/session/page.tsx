"use client"
import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";

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
    const [conversation, setConversation] = useState<{ role: string, text: string }[]>([])
    const recognitionRef = useRef<any>(null)

    useEffect(() => {
        if (!isSessionStarted) return

        const interval = setInterval(() => {
            if (isSessionStarted) {
                setSessionDuration(prev => prev + 1)
            }
        }, 1000);
        return () => {
            clearInterval(interval);
        }
    }, [isSessionStarted]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
        const secs = (seconds % 60).toString().padStart(2, '0')
        return `${mins}:${secs}`
    }

    const startRecording = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.lang = "en-US"
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript
            console.log("transcript ==>> ", transcript)
            handleExchange(transcript);
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
            const response = await fetch("/api/appSession", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({})
            })
            const data = await response.json()
            if (!data.sessionId) return
            setSessionId(data.sessionId)
            setIsSessionStarted(true)
        } catch (error) {
            console.log("Error starting session: ", error)
        }
    }

    const handleEndSession = async () => {
//      Show feedback to user
        try {
            setIsSessionStarted(false);
            await updateAppSession();
            const feedback = await feedbackApi(conversation);
            router.push(`/feedback/${sessionId}`)
            console.log("feedback => ", feedback);
        } catch (error) {
            console.log("Error ending session:", error);
        }
    }

    const updateAppSession = async () => {
        console.log("Passed SessionId ==>> ", sessionId);
        const id = sessionId;
        await fetch(`/api/appSession/${id}`, {
            method:"PATCH",
            headers: { "Content-Type":"application/json"},
            body: JSON.stringify({duration: sessionDuration}),
        })
    }

    const feedbackApi = async (transcript:{ role: string, text: string }[]) => {
        const response = await fetch(`/api/feedback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({sessionId: sessionId, transcript: transcript})
        })
        return await response.json();;
    } 

    const handleExchange = async (transcript: string) => {
        try {
            if (!transcript) return;
            setConversation(prev => [...prev, { role: 'user', text: transcript }])
            saveMessage('user', transcript);
            const geminiResponse = await callGemini(transcript, conversation);
            if (geminiResponse) {
                console.log("No it worked");
                setConversation(prev => [...prev, { role: 'ai', text: geminiResponse }])
                saveMessage('ai', geminiResponse);
            }
            console.log("Yes passed");
        } catch (error) {
            console.log("Error : ", error);
        }
    }

    const saveMessage = async (role: String, transcript: String) => {
        try {
            await fetch("/api/message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, role: role, text: transcript })
            })
        } catch (error) {
            console.log("Error while saving message to db : ", error);
        }
    }

    const callGemini = async (transcript: String, history: { role: string, text: string }[]) => {
        try {
            const geminiResponse = await fetch("/api/conversation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transcript: transcript, history: history })
            })
            const data = await geminiResponse.json();
            return data.response;
        } catch (error) {
            console.log("Error while calling gemini api : ", error);
        }
    }

    return (
        <div className="container mx-auto max-w-4xl p-6">
            <Card className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">
                        Practice Session
                    </h1>

                    <Badge
                        variant={
                            isMicRecording
                                ? "destructive"
                                : "secondary"
                        }
                    >
                        {isMicRecording
                            ? "Recording"
                            : "Idle"}
                    </Badge>
                </div>

                <div className="text-sm text-muted-foreground">
                    <div>Duration: {formatDuration(sessionDuration)}</div>
                </div>

                <ScrollArea className="h-[350px] rounded-md border p-4">
                    <div className="space-y-3">
                        {conversation.map((msg, idx) => (
                            <div
                                key={idx}
                                className="rounded-lg bg-muted p-3"
                            >
                                {msg.text}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                {!isSessionStarted ? (
                    <Button onClick={handleStartSession}>Start Session</Button>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <button
                            onClick={isMicRecording ? stopRecording : startRecording}
                            className={`
                                relative flex h-24 w-24 items-center justify-center rounded-full
                                ${isMicRecording
                                    ? "bg-red-500"
                                    : "bg-primary"
                                }
              text-white
            `}
                        >
                            {isMicRecording && (
                                <>
                                    <span className="absolute inset-0 rounded-full animate-ping bg-red-500 opacity-30" />
                                    <span className="absolute inset-0 rounded-full animate-pulse bg-red-500 opacity-40" />
                                </>
                            )}

                            {isMicRecording ? (
                                <MicOff className="h-8 w-8" />
                            ) : (
                                <Mic className="h-8 w-8" />
                            )}
                        </button>

                        <Button
                            size="lg"
                            variant={
                                isMicRecording
                                    ? "destructive"
                                    : "default"
                            }
                            onClick={() =>
                                setIsMicRecording(
                                    !isMicRecording
                                )
                            }
                        >
                            {isMicRecording
                                ? "Stop Recording"
                                : "Start Recording"}
                        </Button>

                        <Button
                            variant="outline"
                            size="lg"
                            onClick={handleEndSession}
                        >
                            <PhoneOff className="mr-2 h-4 w-4" />
                            End Session
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
}