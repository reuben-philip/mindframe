import { NextRequest, NextResponse } from "next/server";
import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_API_TOKEN!);

export async function POST(req: NextRequest) {
  const { messages, userName, emails } = await req.json();

  const emailContext = emails?.length
    ? `\n\nThe user's current inbox (${emails.length} emails):\n` +
      emails.map((e: any, i: number) => {
        const date = new Date(e.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        const sender = e.from.replace(/<.*?>/, "").trim();
        return `[${i + 1}] ID:${e.id}\n    From: ${sender}\n    Subject: ${e.subject}\n    Date: ${date}\n    Preview: ${e.snippet?.slice(0, 100)}`;
      }).join("\n\n")
    : "";

  const systemPrompt = {
    role: "system" as const,
    content: `You are Mindframe, a personal productivity assistant for ${userName ?? "the user"}.
Your job is to help them stay organized, focused, and on top of their day.
${emailContext}

When the user wants to compose or send a NEW email, respond ONLY with:
<email_draft>{"to":"EMAIL","subject":"SUBJECT","body":"BODY"}</email_draft>

When the user wants to delete, trash, or remove an email, identify the correct email from the inbox above by matching any of: sender name, partial subject, email content/topic, or relative time ("yesterday", "this morning", "the latest one from X"). Then respond ONLY with:
<email_delete>{"id":"EMAIL_ID"}</email_delete>

When the user wants to add, create, or schedule a calendar event, respond ONLY with:
<calendar_event>{"title":"EVENT TITLE","start":"YYYY-MM-DDTHH:MM:SS","end":"YYYY-MM-DDTHH:MM:SS","description":"OPTIONAL DESCRIPTION"}</calendar_event>
Rules for calendar events:
- Always infer the full ISO 8601 date-time from context. Today's date is ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.
- If no time is given, use a date-only string (YYYY-MM-DD) for start and end.
- If no end time is given, default end to 1 hour after start.
- If the description is not mentioned, omit it from the JSON.

When the user wants to create a task, add something to their to-do list, or wants to remember to do something, respond ONLY with:
<task_create>{"name":"TASK NAME","description":"DESCRIPTION","dueDate":"YYYY-MM-DD","priority":"low|medium|high"}</task_create>
Rules for tasks:
- Extract a clear, concise task name from the user's message.
- Include a description if the user provided extra context.
- Parse relative due dates ("tomorrow", "next Friday", "by end of week") into YYYY-MM-DD using today's date: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.
- priority must be exactly "low", "medium", or "high"; default to "medium" if unclear.
- Omit dueDate or description from the JSON if not mentioned.

Rules for matching emails:
- "the email from Google" → match by From field containing "Google"
- "the one about the meeting" → match by Subject or Preview containing "meeting"
- "yesterday's email from Sarah" → combine date + sender
- "the latest from Amazon" → pick the most recent matching sender
- If multiple emails match, pick the most recent one
- If you cannot confidently identify which email the user means, ask: "I see [N] emails that could match — did you mean [subject] from [sender]?"

For everything else, be warm, concise, and direct. Address the user by their first name (${userName ?? "friend"}) when it feels natural.`,
  };

  try {
    const result = await client.chatCompletion({
      model: "Qwen/Qwen2.5-7B-Instruct",
      provider: "together",
      messages: [systemPrompt, ...messages],
      max_tokens: 512,
      temperature: 0.7,
    });

    return NextResponse.json({ response: result.choices[0].message.content });
  } catch (error: any) {
    console.error("Chat error:", error?.message);
    return NextResponse.json({ error: error.message ?? "Failed to get response" }, { status: 500 });
  }
}
