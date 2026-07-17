"use client";

import { motion } from "framer-motion";
import type { ContentSection, UIPersonalization } from "@/types/api";

interface ContentViewProps {
  content: ContentSection[];
  uiTheme: UIPersonalization;
}

export function ContentView({ content, uiTheme }: ContentViewProps) {
  return (
    <div className="space-y-6">
      {content.map((section, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="rounded-lg border bg-card p-5 shadow-sm"
        >
          <h2 className="text-lg font-semibold mb-2">{section.title}</h2>
          <p className="text-muted-foreground leading-relaxed">{section.body}</p>
          {section.code_example && (
            <pre className="mt-3 rounded-md bg-muted p-3 text-sm overflow-x-auto">
              <code>{section.code_example}</code>
            </pre>
          )}
        </motion.div>
      ))}
    </div>
  );
}
