"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { UserButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import {
  User, Mail, Calendar, BookOpen, Briefcase,
  GraduationCap, Code2, Github, Linkedin,
  Globe, Cake, FileText, Sparkles, Brain,
  Trophy, Zap, Target, Clock,
} from "lucide-react";
import { BADGE_DEFS } from "@/hooks/useGamification";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Types ──────────────────────────────────────────────────────────────────────
interface UserMeta {
  age?: string;
  date_of_birth?: string;
  learning_goal?: string;
  preferred_language?: string;
  profession?: string;
  education?: string;
  skills?: string[];
  bio?: string;
  github?: string;
  linkedin?: string;
  onboarded?: boolean;
}

interface Session {
  id: string;
  prompt: string;
  created_at: string;
  response: {
    learner_profile?: { level?: string };
    quiz?: { question: string }[];
    ui_personalization?: { tone?: string; color_scheme?: string };
  };
}

interface GamificationState {
  totalXP: number;
  level: number;
  streak: number;
  maxStreak: number;
  badges: string[];
  totalCorrect: number;
  totalAnswered: number;
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title }: { icon: typeof User; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value || "—"}</p>
      </div>
    </div>
  );
}

function SkillBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
      {label}
    </span>
  );
}

function LinkRow({ icon: Icon, label, href }: { icon: typeof User; label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3 hover:bg-muted/60 transition-colors group"
    >
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-primary truncate group-hover:underline">{href}</p>
      </div>
    </a>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: typeof User; label: string; value: string | number; color: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border bg-muted/30 p-4 gap-1">
      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${color} mb-1`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground text-center">{label}</p>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [gamification, setGamification] = useState<GamificationState | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    (async () => {
      try {
        const token = await getToken();
        const [sessRes, prefRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/history/`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/v1/preferences/`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (sessRes.ok) {
          const sessData = await sessRes.json();
          setSessions(Array.isArray(sessData) ? sessData : sessData.sessions ?? []);
        }
        if (prefRes.ok) {
          const prefs = await prefRes.json();
          if (prefs.gamification) setGamification(prefs.gamification);
        }
      } catch {}
      finally { setLoadingSessions(false); }
    })();
  }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isLoaded) return null;

  const meta = (user?.unsafeMetadata ?? {}) as UserMeta;
  const xpProgress = gamification ? (gamification.totalXP % 100) : 0;

  const container = {
    hidden: { opacity: 0 },
    show:   { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: 12 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-sm text-muted-foreground">Your account details & learning progress</p>
        </div>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">

        {/* ── Identity card ── */}
        <motion.div variants={item} className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-5">
            <UserButton />
            <div>
              <p className="font-semibold text-lg leading-tight">{user?.fullName ?? "Anonymous"}</p>
              <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
          <SectionHeader icon={User} title="Basic Info" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoRow icon={Mail}     label="Email"         value={user?.primaryEmailAddress?.emailAddress ?? ""} />
            <InfoRow icon={Calendar} label="Joined"        value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""} />
            <InfoRow icon={Cake}     label="Date of Birth" value={meta.date_of_birth ?? ""} />
            <InfoRow icon={User}     label="Age Group"     value={meta.age ? meta.age.charAt(0).toUpperCase() + meta.age.slice(1) : ""} />
          </div>
          {meta.bio && (
            <div className="mt-4">
              <SectionHeader icon={FileText} title="Bio" />
              <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm text-foreground leading-relaxed">
                {meta.bio}
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Learning Progress ── */}
        <motion.div variants={item} className="rounded-xl border bg-card p-6 shadow-sm">
          <SectionHeader icon={Brain} title="Learning Progress" />

          {/* XP bar */}
          {gamification && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-muted-foreground">Level {gamification.level}</span>
                <span className="text-xs font-medium text-muted-foreground">{gamification.totalXP} XP total</span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{xpProgress} / 100 XP to Level {gamification.level + 1}</p>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-5">
            <StatCard icon={BookOpen} label="Sessions"      value={sessions.length}                color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
            <StatCard icon={Trophy}   label="Level"         value={gamification?.level ?? 1}       color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" />
            <StatCard icon={Zap}      label="Total XP"      value={gamification?.totalXP ?? 0}     color="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" />
            <StatCard
              icon={Target}
              label="Quiz Accuracy"
              value={gamification && gamification.totalAnswered > 0
                ? `${Math.round((gamification.totalCorrect / gamification.totalAnswered) * 100)}%`
                : "—"}
              color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
            />
          </div>

          {/* Badges */}
          {gamification && gamification.badges.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Badges Earned</p>
              <div className="flex flex-wrap gap-2">
                {gamification.badges.map((b) => (
                  <div key={b} title={BADGE_DEFS[b]?.description} className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1">
                    <span className="text-base">{BADGE_DEFS[b]?.emoji}</span>
                    <span className="text-xs font-medium">{BADGE_DEFS[b]?.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Recent Sessions ── */}
        <motion.div variants={item} className="rounded-xl border bg-card p-6 shadow-sm">
          <SectionHeader icon={Clock} title="Recent Learning Sessions" />
          {loadingSessions ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-lg bg-muted/40 animate-pulse" />)}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No learning sessions yet.</p>
              <p className="text-xs mt-1">Start learning something to see your history here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.slice(0, 8).map((s) => {
                const accentColor = s.response?.ui_personalization?.color_scheme ?? "#6366f1";
                const level = s.response?.learner_profile?.level ?? "—";
                const quizCount = s.response?.quiz?.length ?? 0;
                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3 hover:bg-muted/40 transition-colors"
                    style={{ borderLeftColor: accentColor, borderLeftWidth: "3px" }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.prompt}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground capitalize">{level}</span>
                        {quizCount > 0 && (
                          <>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground">{quizCount} quiz questions</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span
                      className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                    >
                      {level}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* ── Learning Preferences ── */}
        <motion.div variants={item} className="rounded-xl border bg-card p-6 shadow-sm">
          <SectionHeader icon={BookOpen} title="Learning Preferences" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoRow icon={Sparkles} label="Learning Goal"      value={meta.learning_goal      ?? ""} />
            <InfoRow icon={Globe}    label="Preferred Language" value={meta.preferred_language ?? ""} />
          </div>
        </motion.div>

        {/* ── Professional background ── */}
        <motion.div variants={item} className="rounded-xl border bg-card p-6 shadow-sm">
          <SectionHeader icon={Briefcase} title="Professional Background" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
            <InfoRow icon={Briefcase}     label="Profession"      value={meta.profession ?? ""} />
            <InfoRow icon={GraduationCap} label="Education Level" value={meta.education  ?? ""} />
          </div>
          {meta.skills && meta.skills.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5" /> Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {meta.skills.map(s => <SkillBadge key={s} label={s} />)}
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Social links ── */}
        {(meta.github || meta.linkedin) && (
          <motion.div variants={item} className="rounded-xl border bg-card p-6 shadow-sm">
            <SectionHeader icon={Code2} title="Social Links" />
            <div className="space-y-3">
              {meta.github   && <LinkRow icon={Github}   label="GitHub"   href={meta.github}   />}
              {meta.linkedin && <LinkRow icon={Linkedin} label="LinkedIn" href={meta.linkedin} />}
            </div>
          </motion.div>
        )}

      </motion.div>
    </div>
  );
}
