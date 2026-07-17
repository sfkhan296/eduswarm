from crewai import Agent


def build_content_generation_agent() -> Agent:
    return Agent(
        role="Curriculum Designer",
        goal=(
            "Create a clear, engaging, level-appropriate lesson on the requested topic. "
            "Break the lesson into titled sections. Include code examples where relevant."
        ),
        backstory=(
            "You are a master educator who has written curriculum for learners ranging "
            "from kindergartners to senior software engineers. You adapt tone, vocabulary, "
            "and depth effortlessly. Your lessons are concise, accurate, and memorable."
        ),
        llm="groq/llama-3.1-8b-instant",
        verbose=True,
        allow_delegation=False,
    )
