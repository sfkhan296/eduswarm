"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Zap, ArrowRight, Baby, GraduationCap, Briefcase,
  Globe, User, Cake, BookOpen, Github, Linkedin,
  FileText, Code2, CheckCircle2,
} from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────────
const GOALS = [
  "Learn programming", "Understand science",
  "Study for exams",   "Learn a new language",
  "Career growth",     "Personal curiosity",
];

const LANGUAGES = ["English", "Hindi", "Spanish", "French", "Arabic", "German", "Chinese"];

const PROFESSIONS = [
  "Student", "Software Engineer", "Teacher / Educator",
  "Designer", "Data Scientist", "Researcher",
  "Doctor / Healthcare", "Other",
];

const SKILL_OPTIONS = [
  "Python", "JavaScript", "Machine Learning", "Web Development",
  "Data Analysis", "Mathematics", "Biology", "Physics",
  "Design", "Writing", "Finance", "Marketing",
];

const EDUCATION_LEVELS = [
  "High School", "Undergraduate", "Graduate (Masters)",
  "PhD / Doctorate", "Self-taught", "Other",
];

type Step = "welcome" | "personal" | "age" | "goal" | "language" | "professional" | "social" | "done";

// ── Helper: labelled input ─────────────────────────────────────────────────────
function Field({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border bg-muted/30 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition placeholder:text-muted-foreground/50"
      />
    </div>
  );
}

function Textarea({
  label, value, onChange, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-xl border bg-muted/30 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition placeholder:text-muted-foreground/50 resize-none"
      />
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function OnboardPage() {
  const { user } = useUser();
  const router = useRouter();

  // Step state
  const [step, setStep] = useState<Step>("welcome");

  // Personal
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName]   = useState(user?.lastName  ?? "");
  const [dob, setDob]             = useState("");

  // Learning preferences
  const [age, setAge]           = useState("");
  const [goal, setGoal]         = useState("");
  const [language, setLanguage] = useState("English");

  // Professional
  const [profession, setProfession] = useState("");
  const [education, setEducation]   = useState("");
  const [skills, setSkills]         = useState<string[]>([]);
  const [bio, setBio]               = useState("");

  // Social
  const [github, setGithub]     = useState("");
  const [linkedin, setLinkedin] = useState("");

  const [saving, setSaving] = useState(false);

  const toggleSkill = (s: string) =>
    setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleFinish = async () => {
    setSaving(true);
    try {
      await user?.update({
        firstName: firstName.trim() || undefined,
        lastName:  lastName.trim()  || undefined,
        unsafeMetadata: {
          date_of_birth:      dob,
          age,
          learning_goal:      goal,
          preferred_language: language,
          profession,
          education,
          skills,
          bio,
          github:             github.trim(),
          linkedin:           linkedin.trim(),
          onboarded:          true,
        },
      });
    } catch {
      // non-critical — still proceed
    } finally {
      setSaving(false);
      router.push("/learn");
    }
  };

  const STEPS: Step[] = ["welcome", "personal", "age", "goal", "language", "professional", "social", "done"];
  const stepIdx  = STEPS.indexOf(step);
  const progress = (stepIdx / (STEPS.length - 1)) * 100;

  const slide = { initial: { opacity: 0, x: 40 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -40 } };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Progress bar */}
        {step !== "welcome" && step !== "done" && (
          <div className="mb-8">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Step {stepIdx} of {STEPS.length - 2}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* ── Welcome ── */}
          {step === "welcome" && (
            <motion.div key="welcome"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
              className="text-center space-y-6"
            >
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/30">
                <Zap className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Welcome to EduSwarm</h1>
                <p className="text-muted-foreground mt-2">
                  Hey {user?.firstName ?? "there"}! Let's set up your profile in a few quick steps.
                </p>
              </div>
              <Button size="lg" className="gap-2 w-full" onClick={() => setStep("personal")}>
                Let's Go <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* ── Personal Info ── */}
          {step === "personal" && (
            <motion.div key="personal" {...slide} className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2"><User className="h-5 w-5 text-primary"/>Personal Info</h2>
                <p className="text-muted-foreground mt-1 text-sm">Tell us a bit about yourself.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name" value={firstName} onChange={setFirstName} placeholder="Jane" />
                <Field label="Last Name"  value={lastName}  onChange={setLastName}  placeholder="Doe"  />
              </div>
              <Field label="Date of Birth" value={dob} onChange={setDob} type="date" />
              <Textarea label="Bio" value={bio} onChange={setBio} placeholder="A short intro about you…" />
              <Button size="lg" className="w-full gap-2" onClick={() => setStep("age")}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* ── Age Group ── */}
          {step === "age" && (
            <motion.div key="age" {...slide} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2"><Cake className="h-5 w-5 text-primary"/>Age Group</h2>
                <p className="text-muted-foreground mt-1 text-sm">We'll tune the content to your level.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Under 13", value: "child", icon: Baby,          color: "text-yellow-500", border: "border-yellow-300 dark:border-yellow-700" },
                  { label: "13 – 17",  value: "teen",  icon: GraduationCap, color: "text-blue-500",   border: "border-blue-300 dark:border-blue-700"   },
                  { label: "18+",      value: "adult", icon: Briefcase,     color: "text-violet-500", border: "border-violet-300 dark:border-violet-700" },
                ].map(({ label, value, icon: Icon, color, border }) => (
                  <button key={value} onClick={() => setAge(value)}
                    className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-5 transition-all hover:bg-muted/60
                      ${age === value ? `${border} bg-muted` : "border-border"}`}>
                    <Icon className={`h-7 w-7 ${color}`} />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
              <Button size="lg" className="w-full gap-2" disabled={!age} onClick={() => setStep("goal")}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* ── Learning Goal ── */}
          {step === "goal" && (
            <motion.div key="goal" {...slide} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary"/>Learning Goal</h2>
                <p className="text-muted-foreground mt-1 text-sm">Pick what describes you best.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map(g => (
                  <button key={g} onClick={() => setGoal(g)}
                    className={`rounded-xl border-2 px-4 py-3 text-sm font-medium text-left transition-all hover:bg-muted/60
                      ${goal === g ? "border-primary bg-primary/5" : "border-border"}`}>
                    {g}
                  </button>
                ))}
              </div>
              <Button size="lg" className="w-full gap-2" disabled={!goal} onClick={() => setStep("language")}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* ── Language ── */}
          {step === "language" && (
            <motion.div key="language" {...slide} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2"><Globe className="h-5 w-5 text-primary"/>Preferred Language</h2>
                <p className="text-muted-foreground mt-1 text-sm">We'll respond in your language.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {LANGUAGES.map(lang => (
                  <button key={lang} onClick={() => setLanguage(lang)}
                    className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all hover:bg-muted/60
                      ${language === lang ? "border-primary bg-primary/5" : "border-border"}`}>
                    <Globe className="h-4 w-4 text-muted-foreground" />{lang}
                  </button>
                ))}
              </div>
              <Button size="lg" className="w-full gap-2" onClick={() => setStep("professional")}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* ── Professional Info ── */}
          {step === "professional" && (
            <motion.div key="professional" {...slide} className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary"/>Professional Info</h2>
                <p className="text-muted-foreground mt-1 text-sm">Help us understand your background.</p>
              </div>

              {/* Profession picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Profession</label>
                <div className="grid grid-cols-2 gap-2">
                  {PROFESSIONS.map(p => (
                    <button key={p} onClick={() => setProfession(p)}
                      className={`rounded-xl border-2 px-3 py-2 text-xs font-medium text-left transition-all hover:bg-muted/60
                        ${profession === p ? "border-primary bg-primary/5" : "border-border"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Education Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {EDUCATION_LEVELS.map(e => (
                    <button key={e} onClick={() => setEducation(e)}
                      className={`rounded-xl border-2 px-3 py-2 text-xs font-medium text-left transition-all hover:bg-muted/60
                        ${education === e ? "border-primary bg-primary/5" : "border-border"}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Skills <span className="normal-case">(pick any)</span></label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map(s => (
                    <button key={s} onClick={() => toggleSkill(s)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all
                        ${skills.includes(s) ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"}`}>
                      {skills.includes(s) && <CheckCircle2 className="h-3 w-3" />}
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <Button size="lg" className="w-full gap-2" onClick={() => setStep("social")}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* ── Social Links ── */}
          {step === "social" && (
            <motion.div key="social" {...slide} className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2"><Code2 className="h-5 w-5 text-primary"/>Social Links</h2>
                <p className="text-muted-foreground mt-1 text-sm">Optional — add your profiles.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Github className="h-3.5 w-3.5"/>GitHub
                </label>
                <input
                  value={github} onChange={e => setGithub(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full rounded-xl border bg-muted/30 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Linkedin className="h-3.5 w-3.5"/>LinkedIn
                </label>
                <input
                  value={linkedin} onChange={e => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full rounded-xl border bg-muted/30 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep("done")}>
                  Skip
                </Button>
                <Button size="lg" className="flex-1 gap-2" onClick={() => setStep("done")}>
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Done ── */}
          {step === "done" && (
            <motion.div key="done"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-4xl"
              >
                🎉
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">You're all set!</h2>
                <p className="text-muted-foreground mt-2">Your personalized learning experience is ready.</p>
              </div>

              {/* Summary */}
              <div className="rounded-xl border bg-muted/30 p-4 text-sm text-left space-y-2">
                {(firstName || lastName) && (
                  <p><span className="text-muted-foreground">Name:</span> <span className="font-medium">{[firstName, lastName].filter(Boolean).join(" ")}</span></p>
                )}
                {dob && (
                  <p><span className="text-muted-foreground">Date of Birth:</span> <span className="font-medium">{dob}</span></p>
                )}
                {profession && (
                  <p><span className="text-muted-foreground">Profession:</span> <span className="font-medium">{profession}</span></p>
                )}
                {education && (
                  <p><span className="text-muted-foreground">Education:</span> <span className="font-medium">{education}</span></p>
                )}
                {skills.length > 0 && (
                  <p><span className="text-muted-foreground">Skills:</span> <span className="font-medium">{skills.join(", ")}</span></p>
                )}
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
