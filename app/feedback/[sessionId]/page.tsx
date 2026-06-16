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
            <main className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-muted-foreground">Feedback not found.</p>
                    <Link href="/home" className="text-foreground text-sm underline underline-offset-4">
                        Go home
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-background">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <span className="text-foreground font-bold text-lg">VoiceUp</span>
                <Link
                    href="/home"
                    className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                >
                    ← Back to home
                </Link>
            </div>

            <div className="max-w-2xl mx-auto px-6 py-10 space-y-10">

                <div>
                    <h1 className="text-2xl font-bold text-foreground">Session Feedback</h1>
                    <p className="text-muted-foreground text-sm mt-1">Here's how you did this session.</p>
                </div>

                {/* Overall Feedback */}
                <section className="bg-card border border-border rounded-xl p-6 space-y-2">
                    <p className="text-muted-foreground text-xs uppercase tracking-widest">Overall</p>
                    <p className="text-foreground leading-relaxed">{feedback.overallFeedback}</p>
                </section>

                {/* Filler Words */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-foreground font-semibold">Filler Words</h2>
                        <span className="text-muted-foreground text-sm">
                            {feedback.fillerWords?.count ?? 0} detected
                        </span>
                    </div>

                    {feedback.fillerWords?.words?.length === 0 ? (
                        <p className="text-muted-foreground text-sm">None detected 🎉</p>
                    ) : (
                        <div className="flex gap-2 flex-wrap">
                            {feedback.fillerWords?.words?.map((word) => (
                                <span
                                    key={word}
                                    className="px-3 py-1 bg-card border border-border text-muted-foreground text-sm rounded-full"
                                >
                                    {word}
                                </span>
                            ))}
                        </div>
                    )}
                </section>

                {/* Grammar Mistakes */}
                <section className="space-y-4">
                    <h2 className="text-foreground font-semibold">Grammar Mistakes</h2>

                    {feedback.grammarMistakes?.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No mistakes found 🎉</p>
                    ) : (
                        <div className="space-y-3">
                            {feedback.grammarMistakes?.map((mistake, index) => (
                                <div
                                    key={index}
                                    className="bg-card border border-border rounded-xl p-5 space-y-3"
                                >
                                    <div className="flex gap-3 text-sm">
                                        <span className="text-red-400 line-through">{mistake.original}</span>
                                        <span className="text-muted-foreground/70">→</span>
                                        <span className="text-green-400">{mistake.corrected}</span>
                                    </div>
                                    <p className="text-muted-foreground text-xs leading-relaxed">{mistake.explanation}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Vocabulary Suggestions */}
                <section className="space-y-4">
                    <h2 className="text-foreground font-semibold">Vocabulary Suggestions</h2>

                    {feedback.vocabularySuggestions?.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No suggestions.</p>
                    ) : (
                        <div className="space-y-3">
                            {feedback.vocabularySuggestions?.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-card border border-border rounded-xl p-5 space-y-2"
                                >
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-muted-foreground">You said:</span>
                                        <span className="text-foreground">{item.used}</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-muted-foreground text-xs">Try instead:</span>
                                        {item.alternatives.map((alt) => (
                                            <span
                                                key={alt}
                                                className="px-2 py-0.5 bg-foreground/5 border border-border text-foreground text-xs rounded-full"
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
                        className="w-full block text-center bg-primary text-primary-foreground font-medium py-3 rounded-lg hover:bg-primary/90 transition-colors duration-150"
                    >
                        Practice Again
                    </Link>
                </div>

            </div>
        </main>
    );
}
