"use client"
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log("session => ", session);
    if (status == 'authenticated') {
      router.push('/home');
    }
  }, [status, router]);

  return ( 
    <main>
      <h1>VoiceUp</h1>
      <p>Feel Confident While Speaking in English with VoiceUp</p>
      <button onClick={() => signIn("google")}>Continue to Google</button>
    </main>
  )
}