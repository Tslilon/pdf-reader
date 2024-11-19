// app/api/services/azureService.ts

import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";

const endpoint = process.env.AZURE_READ_ENDPOINT || "";
const apiKey = process.env.AZURE_READ_KEY || "";

if (!endpoint || !apiKey) {
  throw new Error("Azure endpoint and API key must be set in environment variables.");
}

const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(apiKey));

interface AzureAnalysisResult {
  text: string;
  rawResponse: any;
}

export async function analyzeWithAzure(buffer: Buffer): Promise<AzureAnalysisResult> {
  try {
    const poller = await client.beginAnalyzeDocument("prebuilt-read", buffer);
    const result = await poller.pollUntilDone();

    let extractedText = "";
    for (const page of result.pages || []) {
      for (const line of page.lines || []) {
        extractedText += line.content + "\n";
      }
    }

    return {
      text: extractedText.trim(),
      rawResponse: result
    };
  } catch (error) {
    console.error("Azure analysis error:", error);
    throw new Error("Failed to analyze PDF with Azure Form Recognizer.");
  }
}