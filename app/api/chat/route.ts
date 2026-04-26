import { NextRequest, NextResponse } from "next/server";
import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_API_TOKEN!);

export async function POST(req: NextRequest) {
  const { messages, userName } = await req.json();

  const systemPrompt = {
    role: "system" as const,
    content:`You are Mindframe, a personal productivity assistant for ${userName ?? "the user"}.
    Your job is to help them stay organized, focused, and on top of their day.

    If the user asks to write, compose, or send an email, respond ONLY with this exact format and nothing else outside it:
    <email_draft>{"to":"EMAIL","subject":"SUBJECT","body":"BODY"}</email_draft>
    Fill in the JSON fields based on what they described. Use a blank string for "to" if no recipient was given.

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
    console.error("HTTP status:", error?.httpResponse?.status);
    console.error("HTTP body:", JSON.stringify(error?.httpResponse?.body));
    return NextResponse.json({ error: error.message ?? "Failed to get response" }, { status: 500 });
  }
}
