"use client";

import { useState, useEffect } from "react";
import { TextDisplayBox } from "./components/TextDisplayBox";

interface ServiceState {
  text: string;
  rawResponse: any;
  openAIResult: {
    text: string | null;
    rawResponse: any;
  } | null;
  claudeResult: {
    text: string | null;
    rawResponse: any;
  } | null;
}

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [serviceResults, setServiceResults] = useState<{
    simpleParse: ServiceState;
    azure: ServiceState;
    google: ServiceState;
    googleStatement: ServiceState;
    amazon: ServiceState;
    adobe: ServiceState;
  }>({
    simpleParse: { text: "", rawResponse: null, openAIResult: null, claudeResult: null },
    azure: { text: "", rawResponse: null, openAIResult: null, claudeResult: null },
    google: { text: "", rawResponse: null, openAIResult: null, claudeResult: null },
    googleStatement: { text: "", rawResponse: null, openAIResult: null, claudeResult: null },
    amazon: { text: "", rawResponse: null, openAIResult: null, claudeResult: null },
    adobe: { text: "", rawResponse: null, openAIResult: null, claudeResult: null },
  });
  const [errors, setErrors] = useState<{
    simpleParse: string;
    azure: string;
    google: string;
    googleStatement: string;
    amazon: string;
    adobe: string;
  }>({
    simpleParse: "",
    azure: "",
    google: "",
    googleStatement: "",
    amazon: "",
    adobe: "",
  });
  const [isLoading, setIsLoading] = useState<{
    simpleParse: boolean;
    azure: boolean;
    google: boolean;
    googleStatement: boolean;
    amazon: boolean;
    adobe: boolean;
  }>({
    simpleParse: false,
    azure: false,
    google: false,
    googleStatement: false,
    amazon: false,
    adobe: false,
  });
  const [isOpenAILoading, setIsOpenAILoading] = useState<{
    simpleParse: boolean;
    azure: boolean;
    google: boolean;
    googleStatement: boolean;
    amazon: boolean;
    adobe: boolean;
  }>({
    simpleParse: false,
    azure: false,
    google: false,
    googleStatement: false,
    amazon: false,
    adobe: false,
  });
  const [isClaudeLoading, setIsClaudeLoading] = useState<{
    simpleParse: boolean;
    azure: boolean;
    google: boolean;
    googleStatement: boolean;
    amazon: boolean;
    adobe: boolean;
  }>({
    simpleParse: false,
    azure: false,
    google: false,
    googleStatement: false,
    amazon: false,
    adobe: false,
  });

  useEffect(() => {
    // Load default PDF file
    fetch("/test2.pdf")
      .then(response => response.blob())
      .then(blob => {
        const defaultFile = new File([blob], "test1.pdf", { type: "application/pdf" });
        setUploadedFile(defaultFile);
      })
      .catch(error => {
        setErrors(prev => ({
          ...prev,
          simpleParse: "Failed to load default PDF"
        }));
      });
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setServiceResults({
        simpleParse: { text: "", rawResponse: null, openAIResult: null, claudeResult: null },
        azure: { text: "", rawResponse: null, openAIResult: null, claudeResult: null },
        google: { text: "", rawResponse: null, openAIResult: null, claudeResult: null },
        googleStatement: { text: "", rawResponse: null, openAIResult: null, claudeResult: null },
        amazon: { text: "", rawResponse: null, openAIResult: null, claudeResult: null },
        adobe: { text: "", rawResponse: null, openAIResult: null, claudeResult: null },
      });
      setErrors({
        simpleParse: "",
        azure: "",
        google: "",
        googleStatement: "",
        amazon: "",
        adobe: "",
      });
    }
  };

  const handleAnalysis = async (serviceName: keyof typeof serviceResults) => {
    if (!uploadedFile) {
      setErrors(prev => ({
        ...prev,
        [serviceName]: "Please upload a file first"
      }));
      return;
    }

    setIsLoading(prev => ({ ...prev, [serviceName]: true }));
    setErrors(prev => ({ ...prev, [serviceName]: "" }));

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("service", serviceName);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse PDF");
      }

      setServiceResults(prev => ({
        ...prev,
        [serviceName]: {
          text: data.text || "",
          rawResponse: data.rawResponse || null,
          openAIResult: null,
          claudeResult: null,
        },
      }));
    } catch (error) {
      console.error(`Error with ${serviceName} analysis:`, error);
      setErrors(prev => ({
        ...prev,
        [serviceName]: error instanceof Error ? error.message : `Failed to analyze PDF with ${serviceName}`
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, [serviceName]: false }));
    }
  };

  const handleOpenAIAnalysis = async (serviceName: keyof typeof serviceResults) => {
    if (!serviceResults[serviceName].text) {
      return;
    }

    setIsOpenAILoading(prev => ({ ...prev, [serviceName]: true }));

    try {
      const response = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: serviceResults[serviceName].text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze with OpenAI");
      }

      setServiceResults(prev => ({
        ...prev,
        [serviceName]: {
          ...prev[serviceName],
          openAIResult: {
            text: data.text,
            rawResponse: data.rawResponse,
          },
        },
      }));
    } catch (error) {
      console.error(`OpenAI analysis error:`, error);
      setErrors(prev => ({
        ...prev,
        [serviceName]: error instanceof Error ? error.message : "Failed to analyze with OpenAI",
      }));
    } finally {
      setIsOpenAILoading(prev => ({ ...prev, [serviceName]: false }));
    }
  };

  const handleClaudeAnalysis = async (serviceName: keyof typeof serviceResults) => {
    if (!serviceResults[serviceName].text) {
      return;
    }

    console.log("Page - Starting Claude analysis for:", serviceName);
    console.log("Page - Text to analyze:", serviceResults[serviceName].text.substring(0, 100) + "...");

    setIsClaudeLoading(prev => ({ ...prev, [serviceName]: true }));

    try {
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: serviceResults[serviceName].text,
        }),
      });

      const data = await response.json();
      console.log("Page - Claude API response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze with Claude");
      }

      setServiceResults(prev => {
        const newState = {
          ...prev,
          [serviceName]: {
            ...prev[serviceName],
            claudeResult: {
              text: data.text,
              rawResponse: data.rawResponse,
            },
          },
        };
        console.log("Page - Updated service results:", newState[serviceName].claudeResult);
        return newState;
      });
    } catch (error) {
      console.error("Page - Claude analysis error:", error);
      setErrors(prev => ({
        ...prev,
        [serviceName]: error instanceof Error ? error.message : "Failed to analyze with Claude",
      }));
    } finally {
      setIsClaudeLoading(prev => ({ ...prev, [serviceName]: false }));
    }
  };

  const serviceTitles: Record<keyof typeof serviceResults, string> = {
    simpleParse: "pdf-parse",
    azure: "Azure AI",
    google: "Google Document AI",
    googleStatement: "Google (statements)",
    amazon: "Amazon Textract",
    adobe: "Adobe PDF Extract API",
  };

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col items-center gap-8">
        <h1 className="text-2xl font-bold">PDF Read and Parse</h1>
        
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-col items-center gap-2">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="border border-gray-700 rounded p-2 bg-black/30 backdrop-blur-sm"
            />
            <span className="text-xs text-gray-500 italic">
              A test PDF is ready to use - just click "Read with..."
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {Object.entries(serviceResults).map(([service, result]) => (
            <TextDisplayBox
              key={service}
              title={serviceTitles[service as keyof typeof serviceResults]}
              text={result.text}
              rawResponse={result.rawResponse}
              openAIResult={result.openAIResult}
              claudeResult={result.claudeResult}
              error={errors[service as keyof typeof errors]}
              isLoading={isLoading[service as keyof typeof isLoading]}
              isOpenAILoading={isOpenAILoading[service as keyof typeof isOpenAILoading]}
              isClaudeLoading={isClaudeLoading[service as keyof typeof isClaudeLoading]}
              onAnalyze={() => handleAnalysis(service as keyof typeof serviceResults)}
              onOpenAIAnalyze={() => handleOpenAIAnalysis(service as keyof typeof serviceResults)}
              onClaudeAnalyze={() => handleClaudeAnalysis(service as keyof typeof serviceResults)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}