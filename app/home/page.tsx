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
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">

        {/* Logo */}
        <h1 className="text-2xl font-bold tracking-tight text-foreground">VoiceUp</h1>

        {/* User Info */}
        <div className="flex flex-col items-center gap-3">
          <Avatar className="h-16 w-16 border border-border">
            <AvatarImage src={user?.image ?? ""} alt={user?.name ?? ""} />
            <AvatarFallback className="bg-card text-foreground text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="text-foreground font-medium">{user?.name}</p>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-border" />

        {/* Actions */}
        <div className="w-full flex flex-col gap-3">
          <Link
            href="/session"
            className="w-full bg-primary text-primary-foreground font-medium py-3 px-6 rounded-lg text-center hover:bg-primary/90 transition-colors duration-150"
          >
            Start Practicing
          </Link>

          <Link
            href="/history"
            className="w-full bg-card text-card-foreground font-medium py-3 px-6 rounded-lg text-center border border-border hover:bg-accent transition-colors duration-150"
          >
            View History
          </Link>

          <button
            onClick={() => signOut()}
            className="w-full text-muted-foreground text-sm py-2 hover:text-foreground transition-colors duration-150"
          >
            Sign out
          </button>
        </div>

      </div>
    </main>
  )
}
