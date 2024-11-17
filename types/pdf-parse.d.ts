declare module 'pdf-parse' {
    interface PDFData {
      numpages: number;
      numrender: number;
      info: {
        PDFFormatVersion: string;
        IsAcroFormPresent: boolean;
        IsXFAPresent: boolean;
        [key: string]: any;
      };
      metadata: any;
      text: string;
      version: string;
    }
  
    function PDFParse(
      dataBuffer: Buffer,
      options?: {
        pagerender?: (pageData: any) => string;
        max?: number;
      }
    ): Promise<PDFData>;
  
    export default PDFParse;
  }