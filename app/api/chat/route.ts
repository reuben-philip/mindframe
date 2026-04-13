import { NextRequest, NextResponse } from "next/server";
import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_API_TOKEN!);

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const result = await client.chatCompletion({
    model: "Qwen/Qwen2.5-7B-Instruct",
    messages,
    max_tokens: 512,
    temperature: 0.7,
  });

  return NextResponse.json({ response: result.choices[0].message.content });
}
