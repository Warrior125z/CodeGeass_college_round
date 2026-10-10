import os
import re
import json
import html
import subprocess
from pathlib import Path

from dotenv import load_dotenv
from groq import Groq


# =========================================================
# CONFIGURATION
# =========================================================

AGENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = AGENT_DIR.parents[1]
PROJECT_ROOT = AGENT_DIR.parents[2]
GENERATED_DIR = BACKEND_DIR / "generated_sites"

GENERATED_DIR.mkdir(parents=True, exist_ok=True)

load_dotenv(AGENT_DIR / ".env")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL = "openai/gpt-oss-120b"

# Existing Netlify site configured for draft deployments.
NETLIFY_SITE_ID = "b2a64044-0c6b-4537-a9bb-0a4a05d0e8d4"

client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None


SYSTEM_PROMPT = """
You are Nexus AI, a helpful business and website-building agent.

You can:
1. Create marketing plans.
2. Plan websites.
3. Generate and save actual HTML websites.
4. Deploy generated websites to Netlify draft previews.

RULES:
- For website creation, call create_website.
- Use sensible defaults when the user has not specified details.
- Do not ask unnecessary clarification questions.
- If the user requests both website creation and deployment:
  first call create_website, then call deploy_business_website
  using the same business name.
- Do not claim a website was generated unless the tool confirms it.
- Do not claim a website is online unless deployment succeeds.
- Return the actual preview_path and public deployment URL provided
  by the tools.
- Netlify deployments are draft previews, not production deployments.
- Do not reveal API keys, environment variables, or secrets.
- Preserve conversation context where available.
"""


# =========================================================
# HELPERS
# =========================================================

def slugify(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "my-website"


def get_website_dir(business: str) -> Path:
    return GENERATED_DIR / slugify(business)


# =========================================================
# TOOL 1: MARKETING PLAN
# =========================================================

def create_marketing_plan(business: str, budget: int) -> dict:
    return {
        "success": True,
        "business": business,
        "budget": budget,
        "suggestions": [
            "Create social media content",
            "Build a simple business website",
            "Offer an introductory promotion",
            "Collect customer feedback",
        ],
    }


# =========================================================
# TOOL 2: WEBSITE PLAN
# =========================================================

def plan_website(business: str, goal: str) -> dict:
    return {
        "success": True,
        "business": business,
        "goal": goal,
        "suggested_pages": [
            "Home",
            "About",
            "Services or Menu",
            "Contact",
        ],
    }


# =========================================================
# TOOL 3: GENERATE AND SAVE WEBSITE
# =========================================================

def create_website(business: str, description: str) -> dict:
    if client is None:
        return {
            "success": False,
            "error": "Groq API key is not configured in the backend .env file.",
        }

    site_dir = get_website_dir(business)
    site_dir.mkdir(parents=True, exist_ok=True)
    index_file = site_dir / "index.html"

    prompt = f"""
Create a complete, attractive, responsive single-page website.

Business name: {business}
Requirements: {description}

Requirements:
- Return a complete HTML5 document only.
- Include embedded CSS in a style element.
- Use responsive design for mobile and desktop.
- Include relevant sections, headings, and realistic sample content.
- Use Indian rupee prices when prices are appropriate.
- Make navigation links work with the page sections.
- Do not use JavaScript.
- Do not include Markdown code fences.
- Do not claim the business details are verified.
"""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert website developer. Return valid HTML only.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.4,
            max_completion_tokens=6000,
        )

        page = response.choices[0].message.content or ""
        page = re.sub(
            r"^\s*```(?:html)?\s*|\s*```\s*$",
            "",
            page,
            flags=re.IGNORECASE,
        ).strip()

        if "<html" not in page.lower() or "</html>" not in page.lower():
            return {
                "success": False,
                "error": "The model did not return a complete HTML document.",
            }

        # Basic safeguard: this generator does not need scripts.
        if re.search(r"<\s*script\b", page, re.IGNORECASE):
            return {
                "success": False,
                "error": "Generated HTML contained a script element and was rejected.",
            }

        index_file.write_text(page, encoding="utf-8")

    except Exception as error:
        return {
            "success": False,
            "error": f"Website generation failed: {error}",
        }

    return {
        "success": True,
        "business": business,
        "message": "Website generated and saved successfully.",
        "file": str(index_file),
        "preview_path": f"/preview/{slugify(business)}/index.html",
        "ready_to_deploy": True,
    }


# =========================================================
# TOOL 4: DEPLOY WEBSITE TO NETLIFY
# =========================================================

def deploy_business_website(business: str) -> dict:
    site_dir = get_website_dir(business)
    index_file = site_dir / "index.html"

    if not index_file.is_file():
        return {
            "success": False,
            "error": (
                f"No generated website was found for '{business}'. "
                "Generate the website first."
            ),
        }

    if not NETLIFY_SITE_ID:
        return {
            "success": False,
            "error": "Netlify site ID is not configured.",
        }

    command = [
        "npx",
        "--no-install",
        "netlify",
        "deploy",
        "--dir",
        str(site_dir),
        "--site",
        NETLIFY_SITE_ID,
    ]

    try:
        result = subprocess.run(
            command,
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            timeout=180,
            check=False,
        )
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "error": "Netlify deployment timed out. Check Netlify before retrying.",
        }
    except OSError as error:
        return {
            "success": False,
            "error": f"Could not start Netlify CLI: {error}",
        }

    output = result.stdout + "\n" + result.stderr

    if result.returncode != 0:
        return {
            "success": False,
            "error": output[-3000:],
        }

    match = re.search(
        r"https://[a-zA-Z0-9.-]+--[a-zA-Z0-9.-]+\.netlify\.app",
        output,
    )

    if not match:
        return {
            "success": False,
            "error": "Netlify did not return a recognizable draft preview URL.",
            "output": output[-2000:],
        }

    return {
        "success": True,
        "message": "Netlify draft deployment succeeded.",
        "business": business,
        "url": match.group(0),
        "deployment_type": "draft preview",
        "production": False,
    }


# =========================================================
# GROQ TOOL DEFINITIONS
# =========================================================

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "create_marketing_plan",
            "description": "Create a basic marketing plan for a business.",
            "parameters": {
                "type": "object",
                "properties": {
                    "business": {"type": "string"},
                    "budget": {"type": "integer"},
                },
                "required": ["business", "budget"],
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "plan_website",
            "description": "Plan a website for a business.",
            "parameters": {
                "type": "object",
                "properties": {
                    "business": {"type": "string"},
                    "goal": {"type": "string"},
                },
                "required": ["business", "goal"],
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "create_website",
            "description": (
                "Generate and save an actual HTML website. "
                "Returns its local preview_path. Call this for website creation."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "business": {"type": "string"},
                    "description": {"type": "string"},
                },
                "required": ["business", "description"],
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "deploy_business_website",
            "description": (
                "Deploy an already-generated website to Netlify as a draft preview. "
                "Call after create_website when the user requests deployment. "
                "Returns the real public preview URL."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "business": {"type": "string"},
                },
                "required": ["business"],
                "additionalProperties": False,
            },
        },
    },
]


FUNCTIONS = {
    "create_marketing_plan": create_marketing_plan,
    "plan_website": plan_website,
    "create_website": create_website,
    "deploy_business_website": deploy_business_website,
}


# =========================================================
# MAIN AGENT WITH TOOL CALLING
# =========================================================

def ask_nexus(user_message, history=None):
    if client is None:
        return "Nexus AI is not configured. Check the backend .env file."

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    if history:
        for item in history[-12:]:
            role = item.get("role")
            content = item.get("content")

            if role in ("user", "assistant") and isinstance(content, str):
                messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": user_message})

    for _ in range(6):
        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=messages,
                tools=TOOLS,
                tool_choice="auto",
                temperature=0.2,
                max_completion_tokens=3000,
            )
        except Exception as error:
            return f"Nexus could not contact Groq: {error}"

        message = response.choices[0].message

        if not message.tool_calls:
            return message.content or "I couldn't generate a response."

        messages.append(message.model_dump(exclude_none=True))

        for tool_call in message.tool_calls:
            function_name = tool_call.function.name

            try:
                arguments = json.loads(tool_call.function.arguments or "{}")
                function = FUNCTIONS.get(function_name)

                if function is None:
                    result = {
                        "success": False,
                        "error": f"Unknown tool: {function_name}",
                    }
                else:
                    result = function(**arguments)

            except Exception as error:
                result = {
                    "success": False,
                    "error": str(error),
                }

            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(result),
                }
            )

    return (
        "I reached the tool-call limit. Please check the result above "
        "and try again if needed."
    )