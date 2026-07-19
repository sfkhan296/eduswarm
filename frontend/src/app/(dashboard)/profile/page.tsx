"use client";

import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { UserButton } from "@clerk/nextjs";
import {
  User, Mail, Calendar, BookOpen, Briefcase,
  GraduationCap, Code2, Github, Linkedin,
  Globe, Cake, FileText, Sparkles,
} from "lucide-react";

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

function InfoRow({
  icon: Icon, label, value,
}: {
  icon: typeof User; label: string; value: string;
}) {
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

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null;

  const meta = (user?.unsafeMetadata ?? {}) as UserMeta;

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
          <p className="text-sm text-muted-foreground">Your account details</p>
        </div>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">

        {/* ── Identity card ── */}
        <motion.div variants={item} className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-5">
            <UserButton />
            <div>
              <p className="font-semibold text-lg leading-tight">
                {user?.fullName ?? "Anonymous"}
              </p>
              <p className="text-sm text-muted-foreground">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>

          <SectionHeader icon={User} title="Basic Info" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoRow icon={Mail}     label="Email"    value={user?.primaryEmailAddress?.emailAddress ?? ""} />
            <InfoRow icon={Calendar} label="Joined"   value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""} />
            <InfoRow icon={Cake}     label="Date of Birth" value={meta.date_of_birth ?? ""} />
            <InfoRow icon={User}     label="Age Group" value={meta.age ? meta.age.charAt(0).toUpperCase() + meta.age.slice(1) : ""} />
          </div>

          {/* Bio */}
          {meta.bio && (
            <div className="mt-4">
              <SectionHeader icon={FileText} title="Bio" />
              <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm text-foreground leading-relaxed">
                {meta.bio}
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Learning preferences ── */}
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
            <InfoRow icon={Briefcase}     label="Profession"       value={meta.profession ?? ""} />
            <InfoRow icon={GraduationCap} label="Education Level"  value={meta.education  ?? ""} />
          </div>

          {/* Skills */}
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
