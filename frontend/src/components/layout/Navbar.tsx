"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";

export function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm"
    >
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/learn" className="font-bold text-lg text-primary">
          EduSwarm
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/learn"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Learn
          </Link>
          <UserButton afterSignOutUrl="/" />
        </nav>
      </div>
    </motion.header>
  );
}
