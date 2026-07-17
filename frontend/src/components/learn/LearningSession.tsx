"use client";

import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentView } from "./ContentView";
import { QuizView } from "./QuizView";
import type { LearningResponse } from "@/types/api";

interface LearningSessionProps {
  data: LearningResponse;
}

export function LearningSession({ data }: LearningSessionProps) {
  return (
    <motion.div
      key="session"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Learner profile badge */}
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary capitalize">
          {data.learner_profile.level} learner
        </span>
        <span className="text-sm text-muted-foreground">
          {data.learner_profile.reasoning}
        </span>
      </div>

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Lesson</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-4">
          <ContentView content={data.content} uiTheme={data.ui_personalization} />
        </TabsContent>

        <TabsContent value="quiz" className="mt-4">
          <QuizView questions={data.quiz} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
