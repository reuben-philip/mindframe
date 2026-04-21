import { NextRequest, NextResponse } from "next/server";
import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_API_TOKEN!);

export async function POST(req: NextRequest) {
  const { messages, userName } = await req.json();

  const systemPrompt = {
    role: "system" as const,
    content: `You are Mindframe, a personal productivity assistant for ${userName ?? "the user"}.
Your job is to help them stay organized, focused, and on top of their day.
The Mindframe app gives them access to their emails, tasks, calendar, and a priority view — so you can reference those features when relevant.
Be warm, concise, and direct. Address the user by their first name (${userName ?? "friend"}) when it feels natural.
Avoid unnecessary filler. Get to the point and make every response feel tailored to them personally.`,
  };

  try {
    const result = await client.chatCompletion({
      model: "Qwen/Qwen2.5-7B-Instruct",
      messages: [systemPrompt, ...messages],
      max_tokens: 512,
      temperature: 0.7,
    });

    return NextResponse.json({ response: result.choices[0].message.content });
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: error.message ?? "Failed to get response" }, { status: 500 });
  }
}
