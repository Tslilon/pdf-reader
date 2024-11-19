import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import * as path from "path";
import * as fs from "fs";

const projectId = process.env.GOOGLE_PROJECT_ID;
const location = process.env.GOOGLE_LOCATION || "us";
const generalProcessorId = process.env.GOOGLE_PROCESSOR_ID;
const statementProcessorId = process.env.GOOGLE_STATEMENT_PROCESSOR_ID;
const keyFilePath = path.join(process.cwd(), process.env.GOOGLE_KEY_FILE_PATH || "");

// Validate environment variables
const requiredEnvVars = {
  GOOGLE_PROJECT_ID: projectId,
  GOOGLE_PROCESSOR_ID: generalProcessorId,
  GOOGLE_STATEMENT_PROCESSOR_ID: statementProcessorId,
  GOOGLE_LOCATION: location,
  GOOGLE_KEY_FILE_PATH: keyFilePath,
};

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

// Validate service account key file
if (!fs.existsSync(keyFilePath)) {
  throw new Error(`Service account key file not found at: ${keyFilePath}`);
}

// Validate key file content
try {
  const keyFileContent = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
  const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
  requiredFields.forEach(field => {
    if (!keyFileContent[field]) {
      throw new Error(`Missing required field in key file: ${field}`);
    }
  });
} catch (error) {
  throw new Error(`Invalid service account key file: ${error instanceof Error ? error.message : 'Unknown error'}`);
}

// Create client with enhanced configuration
const client = new DocumentProcessorServiceClient({
  keyFilename: keyFilePath,
  retryOptions: { retryCodes: [] }, // Disable retries for debugging
  apiEndpoint: `${location}-documentai.googleapis.com`, // Explicitly set API endpoint
});

async function validateBuffer(buffer: Buffer): Promise<void> {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error("Invalid buffer provided");
  }

  if (buffer.length === 0) {
    throw new Error("Empty buffer provided");
  }

  if (buffer.length > 20 * 1024 * 1024) { // 20MB limit
    throw new Error("File size exceeds 20MB limit");
  }

  // Check PDF magic number
  const pdfHeader = buffer.toString("ascii", 0, 4);
  if (pdfHeader !== "%PDF") {
    throw new Error("Invalid PDF format: Missing PDF header");
  }

  // Save for debugging in development
  if (process.env.NODE_ENV === "development") {
    const debugPath = path.join(process.cwd(), "debug");
    if (!fs.existsSync(debugPath)) {
      fs.mkdirSync(debugPath);
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.writeFileSync(path.join(debugPath, `debug-${timestamp}.pdf`), buffer);
  }
}

interface GoogleAnalysisResult {
  text: string;
  rawResponse: any;
}

async function processDocument(buffer: Buffer, processorId: string): Promise<GoogleAnalysisResult> {
  await validateBuffer(buffer);

  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
  
  // Log configuration before processing
  console.log("Document AI Configuration:", {
    projectId,
    location,
    processorId,
    processorPath: name,
    bufferSize: buffer.length,
    keyFileExists: fs.existsSync(keyFilePath),
    apiEndpoint: `${location}-documentai.googleapis.com`
  });

  // Prepare document content
  const content = buffer.toString("base64");
  
  if (!content) {
    throw new Error("Failed to encode PDF content to base64");
  }

  const request = {
    name,
    rawDocument: {
      content,
      mimeType: "application/pdf",
    },
    parent: `projects/${projectId}/locations/${location}`, // Add parent field
  };

  try {
    console.log("Sending request to Document AI");
    const [result] = await client.processDocument(request);

    if (!result?.document?.text) {
      throw new Error("Document AI returned empty or invalid result");
    }

    return {
      text: result.document.text,
      rawResponse: result
    };
  } catch (error) {
    // Enhanced error handling
    let errorMessage = "Unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for specific error conditions
      if (errorMessage.includes("INVALID_ARGUMENT")) {
        console.error("Invalid argument error details:", {
          processorPath: name,
          location,
          projectId,
          bufferSize: buffer.length
        });
        errorMessage = "Invalid configuration or document format";
      }
    }

    console.error("Document AI Error:", {
      error: errorMessage,
      processorId,
      location,
      projectId
    });

    throw new Error(`Document AI processing failed: ${errorMessage}`);
  }
}

export async function analyzeWithGoogle(buffer: Buffer): Promise<GoogleAnalysisResult> {
  try {
    console.log("Starting general document analysis");
    return await processDocument(buffer, generalProcessorId || "");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Google Document AI error: ${errorMessage}`);
  }
}

export async function analyzeWithGoogleStatement(buffer: Buffer): Promise<GoogleAnalysisResult> {
  try {
    console.log("Starting statement document analysis");
    return await processDocument(buffer, statementProcessorId || "");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Google Statement AI error: ${errorMessage}`);
  }
}