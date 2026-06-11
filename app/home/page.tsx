"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function HomePage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  if (status === "loading") return null

  const user = session?.user
  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() ?? "U"

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">

        {/* Logo */}
        <h1 className="text-2xl font-bold tracking-tight text-white">VoiceUp</h1>

        {/* User Info */}
        <div className="flex flex-col items-center gap-3">
          <Avatar className="h-16 w-16 border border-[#222222]">
            <AvatarImage src={user?.image ?? ""} alt={user?.name ?? ""} />
            <AvatarFallback className="bg-[#111111] text-white text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="text-white font-medium">{user?.name}</p>
            <p className="text-[#888888] text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[#1a1a1a]" />

        {/* Actions */}
        <div className="w-full flex flex-col gap-3">
          <Link
            href="/session"
            className="w-full bg-white text-black font-medium py-3 px-6 rounded-lg text-center hover:bg-[#f0f0f0] transition-colors duration-150"
          >
            Start Practicing
          </Link>

          <Link
            href="/history"
            className="w-full bg-[#111111] text-white font-medium py-3 px-6 rounded-lg text-center border border-[#222222] hover:bg-[#1a1a1a] transition-colors duration-150"
          >
            View History
          </Link>

          <button
            onClick={() => signOut()}
            className="w-full text-[#888888] text-sm py-2 hover:text-white transition-colors duration-150"
          >
            Sign out
          </button>
        </div>

      </div>
    </main>
  )
}