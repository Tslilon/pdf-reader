import pdfParse from "pdf-parse";

interface PDFParseResult {
  text: string;
  rawResponse: {
    text: string;
    numpages: number;
    info: any;
    metadata: any;
    version: string;
  };
}

export const parsePDF = async (buffer: Buffer): Promise<PDFParseResult> => {
  try {
    const data = await pdfParse(buffer);
    return {
      text: data.text,
      rawResponse: data
    };
  } catch (error) {
    throw new Error("Failed to parse PDF: " + (error instanceof Error ? error.message : "Unknown error"));
  }
};
