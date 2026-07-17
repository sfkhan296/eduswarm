from crewai import Task, Agent

QUIZ_OUTPUT_TEMPLATE = """
Return a JSON array of quiz questions:
[
  {
    "question": "<question text>",
    "options": ["<A>", "<B>", "<C>", "<D>"],
    "correct_index": <0-3>,
    "explanation": "<why the correct answer is correct>"
  }
]
"""


def build_quiz_generation_task(
    agent: Agent,
    prompt: str,
    learner_level: str,
) -> Task:
    return Task(
        description=(
            f"Generate 3–5 multiple-choice quiz questions testing knowledge of: {prompt}\n\n"
            f"Difficulty should match a {learner_level} learner.\n\n"
            f"Return ONLY a valid JSON array:\n"
            f"{QUIZ_OUTPUT_TEMPLATE}"
        ),
        expected_output="A JSON array of quiz question objects.",
        agent=agent,
    )
