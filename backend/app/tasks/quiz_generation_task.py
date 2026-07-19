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

IMPORTANT: The JSON key names ("question", "options", "correct_index", "explanation") must
remain exactly as shown in English. Only the VALUES (question text, option text, explanation)
should be written in the requested language.
"""


def build_quiz_generation_task(
    agent: Agent,
    prompt: str,
    learner_level: str,
    language: str = "en",
) -> Task:
    lang_instruction = (
        f"\n\nCRITICAL REQUIREMENT: Write ALL question text, answer options, and explanations "
        f"entirely in the language with ISO code '{language}'. Do not use English at all for the "
        f"VALUES. However, the JSON keys MUST stay exactly as: \"question\", \"options\", "
        f"\"correct_index\", \"explanation\" — do NOT translate the key names."
    ) if language != "en" else ""

    return Task(
        description=(
            f"Generate 3–5 multiple-choice quiz questions testing knowledge of: {prompt}\n\n"
            f"Difficulty should match a {learner_level} learner."
            f"{lang_instruction}\n\n"
            f"Return ONLY a valid JSON array:\n"
            f"{QUIZ_OUTPUT_TEMPLATE}"
        ),
        expected_output="A JSON array of quiz question objects.",
        agent=agent,
    )
