from crewai import Task, Agent

CONTENT_OUTPUT_TEMPLATE = """
Return a JSON array of sections:
[
  {
    "title": "<section title>",
    "body": "<section explanation>",
    "code_example": "<optional code snippet or null>"
  }
]
"""


def build_content_generation_task(
    agent: Agent,
    prompt: str,
    learner_level: str,
) -> Task:
    return Task(
        description=(
            f"Create a lesson on: {prompt}\n\n"
            f"The learner is a {learner_level}. Adapt your tone and complexity accordingly.\n\n"
            f"Return ONLY a valid JSON array of content sections:\n"
            f"{CONTENT_OUTPUT_TEMPLATE}"
        ),
        expected_output="A JSON array of content section objects.",
        agent=agent,
    )
