// app/api/upload/route.ts

import { NextResponse } from "next/server";
import { parsePDF } from "../services/pdfParseService";
import { analyzeWithAzure } from "../services/azureService";
import { analyzeWithAdobe } from "../services/adobeService";

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

    let result = { success: true, text: "" };

    switch (service) {
      case "azure":
        result.text = await analyzeWithAzure(buffer);
        break;
      case "adobe":
        result.text = await analyzeWithAdobe(buffer);
        break;
      case "simpleParse":
        const parseResult = await parsePDF(buffer);
        result.text = parseResult.text;
        break;
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