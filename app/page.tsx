"use client"
import { signIn } from "next-auth/react";

export default function Home() {
  return (
    <main>
      <h1>VoiceUp</h1>
      <p>Feel Confident While Speaking in English with VoiceUp</p>
      <button onClick={() => signIn("google")}>Continue to Google</button>
    </main>
  )
}