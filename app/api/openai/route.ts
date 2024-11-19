import { NextResponse } from "next/server";
import { analyzeWithOpenAI } from "../services/openaiService";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "No text provided" },
        { status: 400 }
      );
    }

    const result = await analyzeWithOpenAI(text);
    return NextResponse.json(result);
  } catch (error) {
    console.error("OpenAI processing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process with OpenAI",
      },
      { status: 500 }
    );
  }
} 