import { TextractClient, DetectDocumentTextCommand } from "@aws-sdk/client-textract";

// Validate environment variables
const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!region || !accessKeyId || !secretAccessKey) {
  throw new Error("AWS credentials must be set in environment variables");
}

// Initialize Textract client
const client = new TextractClient({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

interface AmazonAnalysisResult {
  text: string;
  rawResponse: any;
}

export async function analyzeWithAmazon(buffer: Buffer): Promise<AmazonAnalysisResult> {
  try {
    console.log("Starting Amazon Textract analysis");

    // Validate buffer
    if (!Buffer.isBuffer(buffer)) {
      throw new Error("Invalid buffer provided");
    }

    if (buffer.length === 0) {
      throw new Error("Empty buffer provided");
    }

    // Configure the request
    const params = {
      Document: {
        Bytes: buffer,
      },
    };

    console.log("Sending request to Amazon Textract:", {
      bufferSize: buffer.length,
      region,
    });

    // Send the request
    const command = new DetectDocumentTextCommand(params);
    const response = await client.send(command);

    if (!response.Blocks || response.Blocks.length === 0) {
      throw new Error("No text detected in document");
    }

    // Extract text from blocks
    const textBlocks = response.Blocks
      .filter(block => block.BlockType === "LINE")
      .map(block => block.Text)
      .filter((text): text is string => text !== undefined);

    console.log("Amazon Textract Success:", {
      blockCount: response.Blocks.length,
      textBlockCount: textBlocks.length,
    });

    return {
      text: textBlocks.join("\n"),
      rawResponse: response
    };
  } catch (error) {
    console.error("Amazon Textract Error:", {
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack,
      } : "Unknown error",
    });

    throw new Error(`Amazon Textract error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}