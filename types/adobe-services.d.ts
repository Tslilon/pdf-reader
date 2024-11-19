// src/@types/adobe-services.d.ts

declare module "@adobe/pdfservices-node-sdk" {
  export class ServicePrincipalCredentials {
    constructor(params: { clientId: string; clientSecret: string });
  }

  export class PDFServices {
    constructor(params: { credentials: ServicePrincipalCredentials });
    upload(params: { readStream: NodeJS.ReadableStream; mimeType: string }): Promise<any>;
    submit(params: { job: any }): Promise<string>;
    getJobResult(params: { pollingURL: string; resultType: any }): Promise<any>;
    getContent(params: { asset: any }): Promise<any>;
  }

  export const MimeType: {
    PDF: string;
  };

  export class ExtractPDFParams {
    constructor(params: { elementsToExtract: string[] });
  }

  export const ExtractElementType: {
    TEXT: string;
  };

  export class ExtractPDFJob {
    constructor(params: { inputAsset: any; params: ExtractPDFParams });
  }

  export const ExtractPDFResult: any;
}