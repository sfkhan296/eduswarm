"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center max-w-2xl"
      >
        <h1 className="text-5xl font-extrabold tracking-tight text-primary mb-4">
          EduSwarm
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Personalized AI-powered learning — tailored to <em>you</em> by a
          swarm of intelligent agents.
        </p>

        <div className="flex gap-4 justify-center">
          <SignedOut>
            <Button asChild size="lg">
              <Link href="/sign-up">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </SignedOut>

          <SignedIn>
            <Button asChild size="lg">
              <Link href="/learn">Go to Dashboard</Link>
            </Button>
          </SignedIn>
        </div>
      </motion.div>
    </main>
  );
}
