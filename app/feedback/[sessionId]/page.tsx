import { prisma } from "@/lib/prisma"

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
    
    let feedback = await prisma.feedback.findUnique({
        where: { sessionId }
    }) as unknown as Feedback
  
    if (!feedback) {
        // feedback = {
        //     id: "test-id",
        //     sessionId: "test-session",
        //     grammarMistakes: [
        //       {
        //         original: "I am go to the market",
        //         corrected: "I am going to the market",
        //         explanation: "Use 'going' instead of 'go' with present continuous tense"
        //       },
        //       {
        //         original: "She don't like coffee",
        //         corrected: "She doesn't like coffee",
        //         explanation: "Use 'doesn't' with third person singular"
        //       }
        //     ],
        //     fillerWords: {
        //       count: 5,
        //       words: ["um", "like", "basically", "you know", "uh"]
        //     },
        //     vocabularySuggestions: [
        //       {
        //         used: "very good",
        //         alternatives: ["excellent", "outstanding", "impressive"]
        //       },
        //       {
        //         used: "big",
        //         alternatives: ["substantial", "significant", "considerable"]
        //       }
        //     ],
        //     overallFeedback: "You communicated your ideas clearly but used several filler words. Your grammar needs some work with verb tenses. Keep practicing and focus on reducing filler words in your next session."
        //   }
      return <div className="p-6"><h1>Feedback not found</h1></div>
    }
    
    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <h1 className="text-3xl font-bold">
                Session Feedback
            </h1>

            {/* Overall Feedback */}
            <section>
                <h2 className="text-xl font-semibold mb-2">
                    Overall Feedback
                </h2>
                <p>{feedback.overallFeedback}</p>
            </section>

            {/* Grammar Mistakes */}
            <section>
                <h2 className="text-xl font-semibold mb-4">
                    Grammar Mistakes
                </h2>

                {feedback.grammarMistakes?.length === 0 ? (
                    <p>No grammar mistakes 🎉</p>
                ) : (
                    <div className="space-y-4">
                        {feedback.grammarMistakes.map(
                            (mistake, index) => (
                                <div
                                    key={index}
                                    className="border rounded p-4"
                                >
                                    <p>
                                        <strong>Original:</strong>{" "}
                                        {mistake.original}
                                    </p>

                                    <p>
                                        <strong>Corrected:</strong>{" "}
                                        {mistake.corrected}
                                    </p>

                                    <p>
                                        <strong>Explanation:</strong>{" "}
                                        {mistake.explanation}
                                    </p>
                                </div>
                            )
                        )}
                    </div>
                )}
            </section>

            {/* Filler Words */}
            <section>
                <h2 className="text-xl font-semibold mb-4">
                    Filler Words
                </h2>

                <p>
                    Count: {feedback.fillerWords?.count ?? 0}
                </p>

                <div className="flex gap-2 flex-wrap mt-2">
                    {feedback.fillerWords?.words?.map((word) => (
                        <span
                            key={word}
                            className="px-3 py-1 bg-gray-200 rounded"
                        >
                            {word}
                        </span>
                    ))}
                </div>
            </section>

            {/* Vocabulary Suggestions */}
            <section>
                <h2 className="text-xl font-semibold mb-4">
                    Vocabulary Suggestions
                </h2>

                {feedback.vocabularySuggestions?.length === 0 ? (
                    <p>No vocabulary suggestions.</p>
                ) : (
                    <div className="space-y-4">
                        {feedback.vocabularySuggestions.map(
                            (item, index) => (
                                <div
                                    key={index}
                                    className="border rounded p-4"
                                >
                                    <p>
                                        <strong>Used:</strong> {item.used}
                                    </p>

                                    <p>
                                        <strong>Alternatives:</strong>{" "}
                                        {item.alternatives.join(", ")}
                                    </p>
                                </div>
                            )
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}