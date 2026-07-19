from crewai import Agent


def build_quiz_generation_agent() -> Agent:
    return Agent(
        role="Assessment Specialist",
        goal=(
            "Generate 3–5 multiple-choice questions that test understanding of the lesson. "
            "Each question must have 4 options, one correct answer, and a brief explanation."
        ),
        backstory=(
            "You are a certified test designer who specialises in formative assessment. "
            "You craft questions that check genuine comprehension, not just recall, "
            "and you always keep the difficulty level appropriate for the learner."
        ),
        llm="groq/llama-3.3-70b-versatile",
        verbose=True,
        allow_delegation=False,
    )
