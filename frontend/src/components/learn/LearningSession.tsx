"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentView } from "./ContentView";
import { QuizView } from "./QuizView";
import { SpaceQuiz } from "./SpaceQuiz";
import { FollowUpChat } from "./FollowUpChat";
import type { LearningResponse, LearnerLevel } from "@/types/api";
import { Baby, GraduationCap, Briefcase, BookOpen, Rocket, ListChecks, Globe } from "lucide-react";

interface LearningSessionProps {
  data: LearningResponse;
  prompt: string;
}

const LEVEL_CONFIG: Record<LearnerLevel, { icon: typeof Baby; color: string; bg: string; label: string }> = {
  child: { icon: Baby, color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30", label: "Child" },
  teen: { icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30", label: "Teen" },
  professional: { icon: Briefcase, color: "text-violet-600", bg: "bg-violet-100 dark:bg-violet-900/30", label: "Professional" },
};

export function LearningSession({ data, prompt }: LearningSessionProps) {
  const level = data.learner_profile.level;
  const config = LEVEL_CONFIG[level];
  const Icon = config.icon;
  const useSpaceQuiz = level === "child" || level === "teen";
  const [activeTab, setActiveTab] = useState("content");

  return (
    <motion.div
      key="session"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* Learner profile card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-start gap-4 rounded-xl border bg-card p-4 shadow-sm"
      >
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bg}`}>
          <Icon className={`h-5 w-5 ${config.color}`} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-sm font-semibold ${config.color}`}>{config.label} Learner</span>
            {data.detected_language && data.detected_language !== "en" && (
              <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                <Globe className="h-3 w-3" />
                {data.detected_language.toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{data.learner_profile.reasoning}</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="content" className="flex-1 gap-2">
            <BookOpen className="h-4 w-4" />
            Lesson
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex-1 gap-2">
            {useSpaceQuiz
              ? <><Rocket className="h-4 w-4" /> Space Quiz 🚀</>
              : <><ListChecks className="h-4 w-4" /> Quiz ({data.quiz.length} questions)</>
            }
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-4">
          <ContentView content={data.content} uiTheme={data.ui_personalization} level={level} />
        </TabsContent>

        <TabsContent value="quiz" className="mt-4">
          {useSpaceQuiz
            ? <SpaceQuiz questions={data.quiz} onGoToLesson={() => setActiveTab("content")} />
            : <QuizView questions={data.quiz} level={level} />
          }
        </TabsContent>
      </Tabs>

      {/* Follow-up chat */}
      <FollowUpChat topic={prompt} level={level} language={data.detected_language} />
    </motion.div>
  );
}
