import AdmZip from "adm-zip";
import { Readable } from 'stream';
const {
  ServicePrincipalCredentials,
  PDFServices,
  MimeType,
  ExtractPDFParams,
  ExtractElementType,
  ExtractPDFJob,
  ExtractPDFResult
} = require("@adobe/pdfservices-node-sdk");

export async function analyzeWithAdobe(buffer: Buffer): Promise<string> {
  try {
    // Initialize credentials
    const credentials = new ServicePrincipalCredentials({
      clientId: process.env.PDF_SERVICES_CLIENT_ID || "",
      clientSecret: process.env.PDF_SERVICES_CLIENT_SECRET || ""
    });

    // Create a PDF Services instance
    const pdfServices = new PDFServices({ credentials });

    // Create an asset from the buffer and upload
    const readStream = Readable.from(buffer);
    const inputAsset = await pdfServices.upload({
      readStream,
      mimeType: MimeType.PDF
    });

    // Create parameters for the job
    const params = new ExtractPDFParams({
      elementsToExtract: [ExtractElementType.TEXT]
    });

    // Create a new job instance
    const job = new ExtractPDFJob({ inputAsset, params });

    // Submit the job and get the job result
    const pollingURL = await pdfServices.submit({ job });
    const pdfServicesResponse = await pdfServices.getJobResult({
      pollingURL,
      resultType: ExtractPDFResult
    });

    // Get content from the resulting asset(s)
    const resultAsset = pdfServicesResponse.result.resource;
    const streamAsset = await pdfServices.getContent({ asset: resultAsset });

    // Read the result stream into a buffer
    const chunks = [];
    for await (const chunk of streamAsset.readStream) {
      chunks.push(chunk);
    }
    const zipBuffer = Buffer.concat(chunks);

    // Parse the ZIP file to extract content
    const zip = new AdmZip(zipBuffer);
    const jsonData = zip.readAsText("structuredData.json");
    const parsedData = JSON.parse(jsonData);

    // Extract and concatenate text content
    let extractedText = "";
    parsedData.elements.forEach((element: any) => {
      if (element.Text) {
        extractedText += element.Text + "\n";
      }
    });

    return extractedText.trim();
  } catch (error) {
    console.error("Adobe PDF Extract API error:", error);
    throw new Error("Failed to analyze PDF with Adobe API");
  }
}