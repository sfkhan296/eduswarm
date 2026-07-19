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

IMPORTANT: The JSON key names ("title", "body", "code_example") must remain exactly as shown
in English. Only the VALUES (the actual text content) should be written in the requested language.
"""


def build_content_generation_task(
    agent: Agent,
    prompt: str,
    learner_level: str,
    language: str = "en",
) -> Task:
    lang_instruction = (
        f"\n\nCRITICAL REQUIREMENT: You MUST write ALL output VALUES — every title text, body "
        f"paragraph, bullet point, and explanation — entirely in the language with ISO code "
        f"'{language}'. Do not use English at all unless the language code is 'en'. "
        f"Code examples may stay in the programming language requested, but all surrounding text "
        f"must be in '{language}'. "
        f"The JSON keys MUST remain in English exactly as: \"title\", \"body\", \"code_example\" "
        f"— do NOT translate the key names."
    ) if language != "en" else ""

    return Task(
        description=(
            f"Create a lesson on: {prompt}\n\n"
            f"The learner is a {learner_level}. Adapt your tone and complexity accordingly."
            f"{lang_instruction}\n\n"
            f"Return ONLY a valid JSON array of content sections:\n"
            f"{CONTENT_OUTPUT_TEMPLATE}"
        ),
        expected_output="A JSON array of content section objects.",
        agent=agent,
    )
