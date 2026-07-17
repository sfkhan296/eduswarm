"use client";

import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { UserButton } from "@clerk/nextjs";
import { User, Mail, Calendar, BookOpen } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null;

  const meta = user?.publicMetadata as {
    age?: string;
    learning_goal?: string;
    preferred_language?: string;
  } | undefined;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border bg-card p-6 shadow-sm space-y-5"
      >
        <div className="flex items-center gap-4">
          <UserButton />
          <div>
            <p className="font-semibold text-lg">{user?.fullName ?? "Anonymous"}</p>
            <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoRow icon={Mail} label="Email" value={user?.primaryEmailAddress?.emailAddress ?? "—"} />
          <InfoRow icon={Calendar} label="Joined" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"} />
          <InfoRow icon={BookOpen} label="Learning Goal" value={meta?.learning_goal ?? "Not set"} />
          <InfoRow icon={User} label="Age" value={meta?.age ?? "Not set"} />
          <InfoRow icon={User} label="Preferred Language" value={meta?.preferred_language ?? "English"} />
        </div>
      </motion.div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
