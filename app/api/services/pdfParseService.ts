import pdfParse from "pdf-parse";

export const parsePDF = async (buffer: Buffer) => {
  try {
    const data = await pdfParse(buffer);
    return {
      success: true,
      text: data.text,
      numPages: data.numpages,
    };
  } catch (error) {
    throw new Error("Failed to parse PDF: " + (error instanceof Error ? error.message : "Unknown error"));
  }
};
