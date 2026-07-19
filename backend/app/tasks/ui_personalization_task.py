from crewai import Task, Agent

UI_OUTPUT_TEMPLATE = """
Return a JSON object:
{
  "tone": "<playful|balanced|professional>",
  "color_scheme": "<a CSS color name or hex, e.g. 'violet' or '#7c3aed'>",
  "font_size": "<sm|base|lg>"
}
"""


def build_ui_personalization_task(
    agent: Agent,
    learner_level: str,
    topic: str,
    language: str = "en",
) -> Task:
    return Task(
        description=(
            f"Choose the best UI presentation settings for a {learner_level} learning about: {topic}\n\n"
            f"The user's language is '{language}'. Consider cultural preferences for this language.\n\n"
            f"Return ONLY valid JSON matching:\n"
            f"{UI_OUTPUT_TEMPLATE}"
        ),
        expected_output="A JSON object with 'tone', 'color_scheme', and 'font_size' keys.",
        agent=agent,
    )
