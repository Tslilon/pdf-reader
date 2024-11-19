// types/api.d.ts

interface BaseAnalysisResult {
    success: boolean;
    error?: string;
  }

interface TextAnalysisResult extends BaseAnalysisResult {
    text: string;
  }

interface DetailedAnalysisResult extends BaseAnalysisResult {
    text: string;
    raw: any;
  }

type ServiceResponse = TextAnalysisResult | DetailedAnalysisResult;