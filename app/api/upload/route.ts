// app/api/upload/route.ts

import { NextResponse } from "next/server";
import { parsePDF } from "../services/pdfParseService";
import { analyzeWithAzure } from "../services/azureService";
import { analyzeWithAdobe } from "../services/adobeService";
import { analyzeWithGoogle, analyzeWithGoogleStatement } from "../services/googleService";
import { analyzeWithAmazon } from "../services/amazonService";

interface ServiceResult {
  success: boolean;
  text: string;
  rawResponse?: any;
  error?: string;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob;
    const service = formData.get("service") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let result: ServiceResult = { success: true, text: "" };

    switch (service) {
      case "azure": {
        const response = await analyzeWithAzure(buffer);
        result.text = response.text;
        result.rawResponse = response.rawResponse;
        break;
      }
      case "adobe": {
        const response = await analyzeWithAdobe(buffer);
        result.text = response.text;
        result.rawResponse = response.rawResponse;
        break;
      }
      case "google": {
        const response = await analyzeWithGoogle(buffer);
        result.text = response.text;
        result.rawResponse = response.rawResponse;
        break;
      }
      case "googleStatement": {
        const response = await analyzeWithGoogleStatement(buffer);
        result.text = response.text;
        result.rawResponse = response.rawResponse;
        break;
      }
      case "amazon": {
        const response = await analyzeWithAmazon(buffer);
        result.text = response.text;
        result.rawResponse = response.rawResponse;
        break;
      }
      case "simpleParse": {
        const response = await parsePDF(buffer);
        result.text = response.text;
        result.rawResponse = response.rawResponse;
        break;
      }
      default:
        return NextResponse.json(
          { error: "Invalid or missing service parameter" },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("PDF processing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process PDF",
      },
      { status: 500 }
    );
  }
}