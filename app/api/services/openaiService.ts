import OpenAI from "openai";

interface OpenAIAnalysisResult {
  text: string;
  rawResponse: any;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeWithOpenAI(content: string): Promise<OpenAIAnalysisResult> {
  try {
    const thread = await openai.beta.threads.create();
    
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: content,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: process.env.OPENAI_ASSISTANT_ID!,
    });

    // Poll for completion
    let completedRun = await waitForRunCompletion(thread.id, run.id);

    // Get messages
    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessage = messages.data[0];

    return {
      text: lastMessage.content[0].text.value,
      rawResponse: {
        thread,
        run: completedRun,
        messages: messages.data
      }
    };
  } catch (error) {
    console.error("OpenAI Analysis Error:", error);
    throw new Error(`OpenAI analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

async function waitForRunCompletion(threadId: string, runId: string) {
  let run = await openai.beta.threads.runs.retrieve(threadId, runId);
  
  while (run.status === "queued" || run.status === "in_progress") {
    await new Promise(resolve => setTimeout(resolve, 1000));
    run = await openai.beta.threads.runs.retrieve(threadId, runId);
  }

  if (run.status === "failed") {
    throw new Error("OpenAI run failed: " + run.last_error?.message);
  }

  return run;
}