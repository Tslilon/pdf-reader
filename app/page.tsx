"use client";

import { useState, useEffect } from "react";
import { TextDisplayBox } from "./components/TextDisplayBox";

interface ServiceState {
  text: string;
  rawResponse: any;
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
    simpleParse: { text: "", rawResponse: null },
    azure: { text: "", rawResponse: null },
    google: { text: "", rawResponse: null },
    googleStatement: { text: "", rawResponse: null },
    amazon: { text: "", rawResponse: null },
    adobe: { text: "", rawResponse: null },
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
        simpleParse: { text: "", rawResponse: null },
        azure: { text: "", rawResponse: null },
        google: { text: "", rawResponse: null },
        googleStatement: { text: "", rawResponse: null },
        amazon: { text: "", rawResponse: null },
        adobe: { text: "", rawResponse: null },
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

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col items-center gap-8">
        <h1 className="text-2xl font-bold">PDF Analysis Tool</h1>
        
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileUpload}
          className="border border-gray-300 rounded p-2"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {Object.entries(serviceResults).map(([service, result]) => (
            <TextDisplayBox
              key={service}
              title={service.charAt(0).toUpperCase() + service.slice(1)}
              text={result.text}
              rawResponse={result.rawResponse}
              error={errors[service as keyof typeof errors]}
              isLoading={isLoading[service as keyof typeof isLoading]}
              onAnalyze={() => handleAnalysis(service as keyof typeof serviceResults)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}