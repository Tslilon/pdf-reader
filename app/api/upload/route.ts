import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Convert the blob to a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse the PDF
    const data = await pdfParse(buffer);

    return NextResponse.json({
      success: true,
      text: data.text,
      numPages: data.numpages
    });
  } catch (error) {
    console.error("PDF parsing error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to parse PDF" 
      },
      { status: 500 }
    );
  }
}
