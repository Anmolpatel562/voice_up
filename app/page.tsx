"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/home")
    }
  }, [status, router])

  if (status === "loading") return null

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-10">

        {/* Logo + Wave */}
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-5xl font-bold tracking-tight text-white">
            VoiceUp
          </h1>

          {/* Animated sound wave */}
          <div className="flex items-end gap-[3px] h-6">
            {[0.4, 0.7, 1, 0.7, 0.5, 0.8, 1, 0.6, 0.4, 0.9].map((scale, i) => (
              <div
                key={i}
                className="w-[3px] rounded-full bg-white"
                style={{
                  height: `${scale * 24}px`,
                  opacity: 0.3 + scale * 0.5,
                  animation: `pulse ${0.8 + i * 0.1}s ease-in-out infinite alternate`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Tagline */}
        <div className="text-center space-y-2">
          <p className="text-[#888888] text-sm leading-relaxed">
            Practice English conversations with AI.<br />
            Get honest feedback. Speak with confidence.
          </p>
        </div>

        {/* Google Sign In Button */}
        <button
          onClick={() => signIn("google")}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium py-3 px-6 rounded-lg hover:bg-[#f0f0f0] transition-colors duration-150"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
          </svg>
          Continue with Google
        </button>

        {/* Footer */}
        <p className="text-[#444444] text-xs text-center">
          Your conversations are private and secure.
        </p>

      </div>

      <style jsx>{`
        @keyframes pulse {
          from { transform: scaleY(0.6); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </main>
  )
}