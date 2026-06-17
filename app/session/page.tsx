"use client";
import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { speakText } from "@/lib/speakText";
import { Volume2, Settings } from "lucide-react";
import { AppearanceSettings } from "@/components/appearance-settings";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function Session() {
  const router = useRouter();
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [isMicRecording, setIsMicRecording] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [conversation, setConversation] = useState<
    { role: string; text: string }[]
  >([]);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [testMessage, setTestMessage] = useState(
    "Hello, my name is Alex. Welcome to VoiceUp.",
  );
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef("");

  useEffect(() => {
    if (!isSessionStarted) return;
    const interval = setInterval(() => {
      setSessionDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isSessionStarted]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation, liveTranscript]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => {
      speechSynthesis.getVoices();
    };
  }, []);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const englishVoices = availableVoices.filter((voice) =>
        voice.lang.startsWith("en"),
      );
      setVoices(englishVoices);
      const savedVoice = localStorage.getItem("voiceup-voice");
      if (savedVoice) {
        setSelectedVoice(savedVoice);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  useEffect(() => {
    if (selectedVoice) {
      localStorage.setItem("voiceup-voice", selectedVoice);
    }
  }, [selectedVoice]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  useEffect(() => {
    const savedSetting = localStorage.getItem("voiceup-voice-enabled");
    if (savedSetting !== null) {
      setIsVoiceEnabled(savedSetting === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("voiceup-voice-enabled", String(isVoiceEnabled));
  }, [isVoiceEnabled]);

  const startRecording = async () => {
    window.speechSynthesis.cancel();
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      const currentTranscript =
        transcriptRef.current + finalTranscript + interimTranscript;

      setLiveTranscript(currentTranscript);
      if (finalTranscript) {
        transcriptRef.current += finalTranscript;
      }
    };

    recognition.onend = async () => {
      const finalText = (transcriptRef.current + liveTranscript).trim();
      setIsMicRecording(false);
      if (!finalText) {
        setLiveTranscript("");
        transcriptRef.current = "";
        return;
      }
      await handleExchange(finalText);
      setLiveTranscript("");
      transcriptRef.current = "";
    };
    recognitionRef.current = recognition;
    recognition.start();
    setIsMicRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
  };

  const handleStartSession = async () => {
    try {
      setIsStartingSession(true);
      const response = await fetch("/api/appSession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (!data.sessionId) return;
      setIsStartingSession(false);
      setSessionId(data.sessionId);
      setIsSessionStarted(true);
    } catch (error) {
      console.log("Error starting session: ", error);
    }
  };

  const handleEndSession = async () => {
    try {
      setIsSessionStarted(false);
      setIsEndingSession(true);
      await updateAppSession();
      const feedback = await feedbackApi(conversation);
      setIsEndingSession(false);
      router.push(`/feedback/${sessionId}`);
    } catch (error) {
      console.log("Error ending session:", error);
    }
  };

  const updateAppSession = async () => {
    await fetch(`/api/appSession/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duration: sessionDuration }),
    });
  };

  const feedbackApi = async (transcript: { role: string; text: string }[]) => {
    if (transcript.length === 0) return;
    const response = await fetch(`/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sessionId, transcript: transcript }),
    });
    return await response.json();
  };

  const handleExchange = async (transcript: string) => {
    try {
      if (!transcript) return;
      setConversation((prev) => [...prev, { role: "user", text: transcript }]);
      saveMessage("user", transcript);
      setIsAiThinking(true);
      const geminiResponse = await callGemini(transcript, conversation);
      setIsAiThinking(false);
      if (geminiResponse) {
        setConversation((prev) => [
          ...prev,
          { role: "ai", text: geminiResponse },
        ]);
        saveMessage("ai", geminiResponse);
        if (isVoiceEnabled) {
          speakText(geminiResponse, selectedVoice);
        }
      }
    } catch (error) {
      setIsAiThinking(false);
      console.log("Error : ", error);
    }
  };

  const saveMessage = async (role: string, text: string) => {
    try {
      await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, role, text }),
      });
    } catch (error) {
      console.log("Error while saving message to db : ", error);
    }
  };

  const callGemini = async (
    transcript: string,
    history: { role: string; text: string }[],
  ) => {
    try {
      const geminiResponse = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, history }),
      });
      const data = await geminiResponse.json();
      if (!geminiResponse.ok) {
        toast.error("AI is temporarily unavailable. Please try again.");
        return null;
      }
      return data.response;
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.log("Error while calling gemini api : ", error);
      return null;
    }
  };

  const handleTestVoice = () => {
    speakText(testMessage, selectedVoice);
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <span className="text-foreground font-bold text-lg">VoiceUp</span>

        <div className="flex items-center gap-4"> 
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="
            flex items-center justify-center
            h-9 w-9
            rounded-lg
            border border-border
            text-muted-foreground
            hover:text-foreground
            hover:border-ring
            "
          >
            <Settings className="h-4 w-4" />
          </button>
          {isSessionStarted && (
            <span className="text-muted-foreground text-sm font-mono">
              {formatDuration(sessionDuration)}
            </span>
          )}
          <div
            className={`flex items-center gap-2 text-xs px-3 py-1 rounded-full border ${
              isMicRecording
                ? "border-red-500/30 text-red-400 bg-red-500/10"
                : "border-border text-muted-foreground"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isMicRecording ? "bg-red-400 animate-pulse" : "bg-ring"}`}
            />
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
            <p className="text-muted-foreground/70 text-sm">
              {isSessionStarted
                ? !isMicRecording
                  ? "Press the mic to start speaking..."
                  : ""
                : "Start a session to begin practicing"}
            </p>
          </div>
        )}

        {conversation.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-card text-card-foreground border border-border rounded-bl-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isMicRecording && (
          <div className="flex justify-end">
            <div className="max-w-[75%] px-4 py-2 rounded-2xl rounded-br-sm bg-primary text-primary-foreground">
              <span>{liveTranscript}</span>

              <span className="inline-flex items-center gap-1 ml-2">
                <span
                  className="w-1 h-1 rounded-full bg-primary-foreground animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-1 h-1 rounded-full bg-primary-foreground animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-1 h-1 rounded-full bg-primary-foreground animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </span>
            </div>
          </div>
        )}
        {isAiThinking && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="border-t border-border px-6 py-6">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-4">
          {!isSessionStarted ? (
            <button
              onClick={handleStartSession}
              className="bg-primary text-primary-foreground font-medium px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors duration-150"
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
                className={`relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-200 ${
                  isMicRecording
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-primary hover:bg-primary/90"
                }`}
              >
                {isMicRecording && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-red-500 opacity-20" />
                )}
                {isMicRecording ? (
                  <MicOff className="h-6 w-6 text-white" />
                ) : (
                  <Mic className="h-6 w-6 text-primary-foreground" />
                )}
              </button>

              {/* End Session */}
              <button
                onClick={handleEndSession}
                className="flex items-center gap-2 text-muted-foreground text-sm border border-border px-4 py-2 rounded-lg hover:border-red-500/50 hover:text-red-400 transition-colors duration-150"
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
            <p className="text-muted-foreground/70 text-xs">
              {isMicRecording
                ? "Listening... click to stop"
                : "Click mic to speak"}
            </p>
          )}
        </div>
      </div>
      {isVoiceModalOpen && (
        <div
          className="
            fixed inset-0 z-50
            bg-background/80 backdrop-blur-sm
            flex items-center justify-center
            p-4
            overflow-y-auto
          "
        >
          <div
              className="
                w-full max-w-xl
                max-h-[90vh]
                overflow-y-auto
                rounded-2xl
                border border-border
                bg-card
                p-8
                shadow-2xl
              "
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border pb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Settings
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Customize your VoiceUp experience.
                </p>
              </div>

              <button
                onClick={() => {
                  setIsVoiceModalOpen(false);
                  window.speechSynthesis.cancel();
                }}
                className="
            text-muted-foreground
            hover:text-foreground
            transition-colors
            text-lg
          "
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="mt-6 space-y-6">
              <AppearanceSettings />

              <div className="h-px bg-border" />

              {/* Voice Toggle */}
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">AI Voice Response</p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Read AI responses aloud during conversations.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (isVoiceEnabled) {
                        window.speechSynthesis.cancel();
                      }

                      setIsVoiceEnabled((prev) => !prev);
                    }}
                    className={`
                relative inline-flex h-7 w-12 items-center rounded-full
                transition-colors duration-200
                ${isVoiceEnabled ? "bg-green-500" : "bg-muted"}
              `}
                  >
                    <span
                      className={`
                  inline-block h-5 w-5 rounded-full bg-white
                  transition-transform duration-200
                  ${isVoiceEnabled ? "translate-x-6" : "translate-x-1"}
                `}
                    />
                  </button>
                </div>
              </div>

              {/* Voice Selection */}
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Voice
                </label>

                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="
              w-full
              rounded-xl
              border border-border
              bg-background
              px-4 py-3
              text-foreground
              focus:outline-none
              focus:border-ring
            "
                >
                  {voices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Preview Text */}
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Preview Text
                </label>

                <textarea
                  rows={5}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Enter text to test the selected voice..."
                  className="
              w-full
              rounded-xl
              border border-border
              bg-background
              p-4
              text-foreground
              resize-none
              focus:outline-none
              focus:border-ring
            "
                />
              </div>

              {/* Preview Button */}
              <button
                onClick={handleTestVoice}
                className="
            w-full
            rounded-xl
            bg-primary
            py-3
            font-medium
            text-primary-foreground
            transition-colors
            hover:bg-primary/90
          "
              >
                🔊 Preview Voice
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
