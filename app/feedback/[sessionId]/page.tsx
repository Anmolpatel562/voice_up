import { prisma } from "@/lib/prisma"
import Link from "next/link"

interface Feedback {
    id: string;
    sessionId: string;
    grammarMistakes: {
        original: string;
        corrected: string;
        explanation: string;
    }[];
    fillerWords: {
        count: number;
        words: string[];
    };
    vocabularySuggestions: {
        used: string;
        alternatives: string[];
    }[];
    overallFeedback: string;
}

export default async function FeedbackPage({ params }: { params: Promise<{ sessionId: string }> }) {
    const { sessionId } = await params

    const feedback = await prisma.feedback.findUnique({
        where: { sessionId }
    }) as unknown as Feedback

    if (!feedback) {
        return (
            <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-[#888888]">Feedback not found.</p>
                    <Link href="/home" className="text-white text-sm underline underline-offset-4">
                        Go home
                    </Link>
                </div>
            </main>
        )
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

            <div className="max-w-2xl mx-auto px-6 py-10 space-y-10">

                <div>
                    <h1 className="text-2xl font-bold text-white">Session Feedback</h1>
                    <p className="text-[#888888] text-sm mt-1">Here's how you did this session.</p>
                </div>

                {/* Overall Feedback */}
                <section className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6 space-y-2">
                    <p className="text-[#888888] text-xs uppercase tracking-widest">Overall</p>
                    <p className="text-white leading-relaxed">{feedback.overallFeedback}</p>
                </section>

                {/* Filler Words */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-white font-semibold">Filler Words</h2>
                        <span className="text-[#888888] text-sm">
                            {feedback.fillerWords?.count ?? 0} detected
                        </span>
                    </div>

                    {feedback.fillerWords?.words?.length === 0 ? (
                        <p className="text-[#888888] text-sm">None detected 🎉</p>
                    ) : (
                        <div className="flex gap-2 flex-wrap">
                            {feedback.fillerWords?.words?.map((word) => (
                                <span
                                    key={word}
                                    className="px-3 py-1 bg-[#111111] border border-[#222222] text-[#888888] text-sm rounded-full"
                                >
                                    {word}
                                </span>
                            ))}
                        </div>
                    )}
                </section>

                {/* Grammar Mistakes */}
                <section className="space-y-4">
                    <h2 className="text-white font-semibold">Grammar Mistakes</h2>

                    {feedback.grammarMistakes?.length === 0 ? (
                        <p className="text-[#888888] text-sm">No mistakes found 🎉</p>
                    ) : (
                        <div className="space-y-3">
                            {feedback.grammarMistakes?.map((mistake, index) => (
                                <div
                                    key={index}
                                    className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-5 space-y-3"
                                >
                                    <div className="flex gap-3 text-sm">
                                        <span className="text-red-400 line-through">{mistake.original}</span>
                                        <span className="text-[#444444]">→</span>
                                        <span className="text-green-400">{mistake.corrected}</span>
                                    </div>
                                    <p className="text-[#888888] text-xs leading-relaxed">{mistake.explanation}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Vocabulary Suggestions */}
                <section className="space-y-4">
                    <h2 className="text-white font-semibold">Vocabulary Suggestions</h2>

                    {feedback.vocabularySuggestions?.length === 0 ? (
                        <p className="text-[#888888] text-sm">No suggestions.</p>
                    ) : (
                        <div className="space-y-3">
                            {feedback.vocabularySuggestions?.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-5 space-y-2"
                                >
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-[#888888]">You said:</span>
                                        <span className="text-white">{item.used}</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[#888888] text-xs">Try instead:</span>
                                        {item.alternatives.map((alt) => (
                                            <span
                                                key={alt}
                                                className="px-2 py-0.5 bg-white/5 border border-[#222222] text-white text-xs rounded-full"
                                            >
                                                {alt}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* CTA */}
                <div className="pt-4 pb-10">
                    <Link
                        href="/session"
                        className="w-full block text-center bg-white text-black font-medium py-3 rounded-lg hover:bg-[#f0f0f0] transition-colors duration-150"
                    >
                        Practice Again
                    </Link>
                </div>

            </div>
        </main>
    );
}