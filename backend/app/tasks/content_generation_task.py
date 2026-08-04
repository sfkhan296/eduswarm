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
    document_text: str | None = None,
    format_preference: str = "auto",
    depth_level: str = "auto",
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

    doc_instruction = ""
    if document_text and document_text.strip():
        doc_instruction = (
            f"\n\nATTACHED DOCUMENT CONTENT (use this as your PRIMARY source):\n"
            f"\"\"\"\n{document_text.strip()[:6000]}\n\"\"\"\n"
            f"IMPORTANT: The user has uploaded a document. You MUST base your entire response on the content of this document. "
            f"Extract and explain the key points, concepts, and information FROM THIS DOCUMENT specifically. "
            f"Do NOT generate generic content about the topic — only use what is in the document above."
        )

    format_instruction = ""
    if format_preference == "bullets":
        format_instruction = "\n\nFORMATTING REQUIREMENT: Structure the 'body' of each section using clean, organized bullet points (using • or - with bold highlights)."
    elif format_preference == "paragraphs":
        format_instruction = "\n\nFORMATTING REQUIREMENT: Structure the 'body' of each section using clear, fluid, well-crafted paragraphs."
    elif format_preference == "step_by_step":
        format_instruction = "\n\nFORMATTING REQUIREMENT: Structure the 'body' of each section as sequential numbered step-by-step instructions (1., 2., 3.)."
    elif format_preference == "qa":
        format_instruction = "\n\nFORMATTING REQUIREMENT: Structure the 'body' of each section in a clear Question & Answer (Q: / A:) format."

    depth_instruction = ""
    if depth_level == "overview":
        depth_instruction = "\n\nSPECIFICITY: Keep explanations high-level, concise, and focused on core concepts."
    elif depth_level == "detailed":
        depth_instruction = "\n\nSPECIFICITY: Provide an in-depth, thorough explanation with detailed technical context."
    elif depth_level == "hands_on":
        depth_instruction = "\n\nSPECIFICITY: Focus on practical, real-world hands-on usage and actionable takeaways."

    # When a document/image is provided, use single comprehensive section
    section_instruction = ""
    if document_text and document_text.strip():
        section_instruction = (
            "\n\nSECTION COUNT: Since the user uploaded a document/image, generate EXACTLY 1 section "
            "that comprehensively covers ALL the key points, concepts, and information from the document. "
            "Do not split into multiple sections — put everything in one well-structured body."
        )
    else:
        section_instruction = "\n\nSECTION COUNT: Generate between 5 and 8 content sections. Each section must cover a distinct concept or point."

    return Task(
        description=(
            f"Create a lesson on: {prompt}\n\n"
            f"The learner is a {learner_level}. Adapt your tone and complexity accordingly."
            f"{doc_instruction}"
            f"{format_instruction}"
            f"{depth_instruction}"
            f"{lang_instruction}"
            f"{section_instruction}\n\n"
            f"Return ONLY a valid JSON array of content sections:\n"
            f"{CONTENT_OUTPUT_TEMPLATE}"
        ),
        expected_output="A JSON array of content section objects (1 section if document uploaded, 5-8 otherwise).",
        agent=agent,
    )
