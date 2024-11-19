import { NextResponse } from "next/server";
import { ClaudeService } from "../services/claudeService";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    console.log("Claude API Route - Received text:", text.substring(0, 100) + "...");

    const claudeService = new ClaudeService();
    const result = await claudeService.parseTransactions(text);
    
    console.log("Claude API Route - Service result:", result);

    const response = {
      text: JSON.stringify(result, null, 2),
      rawResponse: result
    };

    console.log("Claude API Route - Sending response:", response);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Claude API Route - Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process with Claude",
      },
      { status: 500 }
    );
  }
} 