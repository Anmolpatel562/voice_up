"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function HomePage() {
  const router = useRouter()
  const { data:session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  if (status === "loading") return <p>Loading...</p>

  const user = session?.user;
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "U"

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="items-center text-center">
            <h1 className="mb-6 text-3xl font-bold tracking-tight">
              VoiceUp
            </h1>

            <div>
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.image ?? ""} alt={user?.name ?? ""} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            </div>

            <CardTitle className="mt-4 text-2xl">
              Welcome back, {user?.name}
            </CardTitle>

            <CardDescription>
              Ready to improve your speaking skills today?
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button asChild size="lg" className="w-full">
              <Link href="/session">
                Start Practicing
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/history">
                View History
              </Link>
            </Button>

            <Button
              variant="ghost"
              className="w-full text-destructive hover:text-destructive"
              onClick={() => signOut()}
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}