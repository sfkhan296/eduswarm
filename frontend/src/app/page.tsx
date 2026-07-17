"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Brain, BookOpen, ListChecks, Palette, Zap, ArrowRight, Sparkles } from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "Learner Analysis",
    description: "AI detects your level — child, teen, or professional — and adapts instantly.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: BookOpen,
    title: "Personalized Content",
    description: "Lessons crafted to your exact level with examples you'll actually understand.",
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: ListChecks,
    title: "Smart Quizzes",
    description: "Test your knowledge with AI-generated questions tuned to your progress.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Palette,
    title: "Adaptive UI",
    description: "The interface itself transforms based on who you are and what you're learning.",
    color: "from-orange-500 to-amber-600",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-violet-400/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mx-auto max-w-3xl space-y-6"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Powered by 4 specialized AI agents
            </motion.div>

            {/* Title */}
            <h1 className="text-6xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-br from-primary via-violet-500 to-indigo-400 bg-clip-text text-transparent">
                EduSwarm
              </span>
            </h1>
            <p className="text-2xl font-medium text-foreground/80">
              Learning that adapts to{" "}
              <span className="text-primary font-semibold">you</span>
            </p>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Enter any topic. Our swarm of AI agents analyzes who you are,
              builds a personalized lesson, generates a quiz, and designs the
              perfect UI — all in seconds.
            </p>

            {/* CTA */}
            <div className="flex flex-wrap gap-4 justify-center pt-2">
              <SignedOut>
                <Button asChild size="lg" className="gap-2 text-base px-8 shadow-lg shadow-primary/25">
                  <Link href="/sign-up">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base px-8">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </SignedOut>
              <SignedIn>
                <Button asChild size="lg" className="gap-2 text-base px-8 shadow-lg shadow-primary/25">
                  <Link href="/learn">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </SignedIn>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {FEATURES.map(({ icon: Icon, title, description, color }) => (
            <motion.div
              key={title}
              variants={item}
              className="group relative rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-lg`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-3">How it works</h2>
            <p className="text-muted-foreground mb-12">Three steps to a personalized lesson</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-3xl mx-auto">
            {[
              { step: "1", title: "Enter a topic", desc: "Type anything — 'Teach me Python' or 'Explain DNA to a child'" },
              { step: "2", title: "Agents collaborate", desc: "4 AI agents analyze, create content, build a quiz, and design your UI" },
              { step: "3", title: "Learn your way", desc: "Read the lesson, take the quiz, and track your progress over time" },
            ].map(({ step, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25">
                  {step}
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-xl space-y-6"
        >
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/30 mb-2">
            <Zap className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold">Ready to start learning?</h2>
          <p className="text-muted-foreground">Join EduSwarm and experience AI-powered education tailored to you.</p>
          <SignedOut>
            <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/25">
              <Link href="/sign-up">
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button asChild size="lg" className="gap-2">
              <Link href="/learn">
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </SignedIn>
        </motion.div>
      </section>
    </main>
  );
}
