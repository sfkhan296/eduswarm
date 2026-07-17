"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, Baby, GraduationCap, Briefcase, Globe } from "lucide-react";

const GOALS = [
  "Learn programming",
  "Understand science",
  "Study for exams",
  "Learn a new language",
  "Career growth",
  "Personal curiosity",
];

const LANGUAGES = ["English", "Hindi", "Spanish", "French", "Arabic", "German", "Chinese"];

type Step = "welcome" | "age" | "goal" | "language" | "done";

export default function OnboardPage() {
  const { user } = useUser();
  const router = useRouter();

  const [step, setStep] = useState<Step>("welcome");
  const [age, setAge] = useState("");
  const [goal, setGoal] = useState("");
  const [language, setLanguage] = useState("English");
  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    setSaving(true);
    try {
      await user?.update({
        unsafeMetadata: {
          age,
          learning_goal: goal,
          preferred_language: language,
          onboarded: true,
        },
      });
    } catch {
      // non-critical
    } finally {
      setSaving(false);
      router.push("/learn");
    }
  };

  const steps: Step[] = ["welcome", "age", "goal", "language", "done"];
  const progress = ((steps.indexOf(step)) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Progress bar */}
        {step !== "welcome" && step !== "done" && (
          <div className="mb-8 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* Welcome */}
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              className="text-center space-y-6"
            >
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/30">
                <Zap className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Welcome to EduSwarm</h1>
                <p className="text-muted-foreground mt-2">
                  Hey {user?.firstName ?? "there"}! Let's personalize your learning experience in 3 quick steps.
                </p>
              </div>
              <Button size="lg" className="gap-2 w-full" onClick={() => setStep("age")}>
                Let's Go <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* Age */}
          {step === "age" && (
            <motion.div
              key="age"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold">How old are you?</h2>
                <p className="text-muted-foreground mt-1">We'll tune the content to your level.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Under 13", value: "child", icon: Baby, color: "text-yellow-500", border: "border-yellow-300 dark:border-yellow-700" },
                  { label: "13 – 17", value: "teen", icon: GraduationCap, color: "text-blue-500", border: "border-blue-300 dark:border-blue-700" },
                  { label: "18+", value: "adult", icon: Briefcase, color: "text-violet-500", border: "border-violet-300 dark:border-violet-700" },
                ].map(({ label, value, icon: Icon, color, border }) => (
                  <button
                    key={value}
                    onClick={() => setAge(value)}
                    className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-5 transition-all hover:bg-muted/60
                      ${age === value ? `${border} bg-muted` : "border-border"}`}
                  >
                    <Icon className={`h-7 w-7 ${color}`} />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
              <Button
                size="lg"
                className="w-full gap-2"
                disabled={!age}
                onClick={() => setStep("goal")}
              >
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* Goal */}
          {step === "goal" && (
            <motion.div
              key="goal"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold">What's your learning goal?</h2>
                <p className="text-muted-foreground mt-1">Pick what describes you best.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={`rounded-xl border-2 px-4 py-3 text-sm font-medium text-left transition-all hover:bg-muted/60
                      ${goal === g ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <Button
                size="lg"
                className="w-full gap-2"
                disabled={!goal}
                onClick={() => setStep("language")}
              >
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* Language */}
          {step === "language" && (
            <motion.div
              key="language"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold">Preferred language?</h2>
                <p className="text-muted-foreground mt-1">We'll respond in your language.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all hover:bg-muted/60
                      ${language === lang ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    {lang}
                  </button>
                ))}
              </div>
              <Button
                size="lg"
                className="w-full gap-2"
                onClick={() => setStep("done")}
              >
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* Done */}
          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-4xl"
              >
                🎉
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">You're all set!</h2>
                <p className="text-muted-foreground mt-2">
                  Your personalized learning experience is ready.
                </p>
              </div>
              <div className="rounded-xl border bg-muted/30 p-4 text-sm text-left space-y-2">
                <p><span className="text-muted-foreground">Age group:</span> <span className="font-medium capitalize">{age}</span></p>
                <p><span className="text-muted-foreground">Goal:</span> <span className="font-medium">{goal}</span></p>
                <p><span className="text-muted-foreground">Language:</span> <span className="font-medium">{language}</span></p>
              </div>
              <Button
                size="lg"
                className="w-full gap-2 shadow-lg shadow-primary/25"
                onClick={handleFinish}
                disabled={saving}
              >
                {saving ? "Saving…" : "Start Learning →"}
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
