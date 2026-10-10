import os
import json
from pathlib import Path
from dotenv import load_dotenv
from groq import Groq

# Load API key
load_dotenv(Path(__file__).parent / ".env")

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError("GROQ_API_KEY missing from backend/app/agent/.env")

client = Groq(api_key=api_key)
MODEL = "openai/gpt-oss-120b"

SYSTEM_PROMPT = """
You are Nexus AI, an intelligent AI business operating agent.

Your responsibilities:
- Business planning and decision-making
- Marketing and sales strategies
- Website planning
- Customer management ideas
- Productivity and workflow planning
- Business analysis

Instructions:
1. Understand the user's goal before suggesting actions.
2. Give practical, structured, clear responses.
3. Use the available tools whenever appropriate.
4. Explain tool results clearly to the user.
5. Ask questions when important details are missing.
6. Never claim an action was completed unless a tool confirms it.
7. You cannot deploy websites, send emails, or modify databases
   unless an actual connected tool supports that action.
8. Ask for approval before sensitive or irreversible actions.
"""

# TOOL 1: Create a marketing plan
def create_marketing_plan(business: str, budget: int) -> dict:
    return {
        "business": business,
        "budget": budget,
        "tasks": [
            "Identify the target audience",
            "Research competitors",
            "Create social media content",
            "Plan a marketing campaign",
            "Track enquiries and results"
        ]
    }


# TOOL 2: Plan a business website
def plan_website(business: str, goal: str) -> dict:
    return {
        "business": business,
        "goal": goal,
        "pages": [
            "Home",
            "About",
            "Products or Services",
            "Contact",
            "Privacy Policy"
        ],
        "next_steps": [
            "Choose a suitable design",
            "Prepare website content",
            "Build the website pages",
            "Test the website",
            "Deploy after approval"
        ]
    }


# TOOL DEFINITIONS FOR GROQ
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "create_marketing_plan",
            "description": (
                "Create a marketing plan for a business "
                "using its type and budget."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "business": {
                        "type": "string",
                        "description": "Type of business"
                    },
                    "budget": {
                        "type": "integer",
                        "description": "Marketing budget"
                    }
                },
                "required": ["business", "budget"],
                "additionalProperties": False
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "plan_website",
            "description": (
                "Plan the pages and development steps "
                "for a business website."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "business": {
                        "type": "string",
                        "description": "Type of business"
                    },
                    "goal": {
                        "type": "string",
                        "description": "Purpose of the website"
                    }
                },
                "required": ["business", "goal"],
                "additionalProperties": False
            }
        }
    }
]

# CONNECT TOOL NAMES TO PYTHON FUNCTIONS
FUNCTIONS = {
    "create_marketing_plan": create_marketing_plan,
    "plan_website": plan_website
}


# MAIN AGENT FUNCTION
def ask_nexus(user_message, history=None):
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT}
    ]

    # Include recent conversation context
    for item in (history or [])[-10:]:
        if (
            isinstance(item, dict)
            and item.get("role") in ("user", "assistant")
            and isinstance(item.get("content"), str)
        ):
            messages.append({
                "role": item["role"],
                "content": item["content"]
            })

    messages.append({
        "role": "user",
        "content": user_message
    })

    # Agent loop: ask, execute tools, and use their results
    for _ in range(3):
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
            temperature=0.3
        )

        msg = response.choices[0].message
        messages.append(msg)

        if not msg.tool_calls:
            return msg.content or "I couldn't generate a response."

        for tool_call in msg.tool_calls:
            name = tool_call.function.name

            if name not in FUNCTIONS:
                result = {"error": "Tool not available"}
            else:
                try:
                    args = json.loads(
                        tool_call.function.arguments
                    )
                    result = FUNCTIONS[name](**args)
                except (ValueError, TypeError, json.JSONDecodeError):
                    result = {"error": "Invalid tool arguments"}

            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": json.dumps(result)
            })

    return (
        "I couldn't finish the task within the tool-call limit. "
        "Please try a simpler request."
    )


# TERMINAL CHAT INTERFACE
if __name__ == "__main__":
    print("=" * 40)
    print("       NEXUS AI AGENT")
    print("  Your AI Business Assistant")
    print("Type 'exit' to stop.")
    print("=" * 40)

    history = []

    while True:
        user_text = input("\nYou: ").strip()

        if user_text.lower() == "exit":
            print("Nexus: Goodbye!")
            break

        if not user_text:
            continue

        try:
            answer = ask_nexus(user_text, history)
            print("\nNexus:", answer)

            history.extend([
                {"role": "user", "content": user_text},
                {"role": "assistant", "content": answer}
            ])
            history = history[-10:]

        except Exception as error:
            print("Nexus encountered an error:", error)