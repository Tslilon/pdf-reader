"use client";

import { useState, useEffect } from "react";
import { TextDisplayBox } from "./components/TextDisplayBox";

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [simpleParseText, setSimpleParseText] = useState<string>("");
  const [azureText, setAzureText] = useState<string>("");
  const [googleText, setGoogleText] = useState<string>("");
  const [amazonText, setAmazonText] = useState<string>("");
  const [adobeText, setAdobeText] = useState<string>("");
  const [errors, setErrors] = useState<{
    simpleParse: string;
    azure: string;
    google: string;
    amazon: string;
    adobe: string;
  }>({
    simpleParse: "",
    azure: "",
    google: "",
    amazon: "",
    adobe: "",
  });
  const [isLoading, setIsLoading] = useState<{
    simpleParse: boolean;
    azure: boolean;
    google: boolean;
    amazon: boolean;
    adobe: boolean;
  }>({
    simpleParse: false,
    azure: false,
    google: false,
    amazon: false,
    adobe: false,
  });

  useEffect(() => {
    // Load default PDF file
    fetch("/test1.pdf")
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
      setSimpleParseText("");
      setAzureText("");
      setGoogleText("");
      setAmazonText("");
      setAdobeText("");
      setErrors({
        simpleParse: "",
        azure: "",
        google: "",
        amazon: "",
        adobe: "",
      });
    }
  };

  const handleAnalysis = async (serviceName: string) => {
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

      if (data.success && data.text) {
        switch (serviceName) {
          case "azure": setAzureText(data.text); break;
          case "simpleParse": setSimpleParseText(data.text); break;
          case "google": setGoogleText("not yet implemented"); break;
          case "amazon": setAmazonText("not yet implemented"); break;
          case "adobe": setAdobeText(data.text); break;
        }
      }
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

  const handleSimpleParse = () => handleAnalysis("simpleParse");
  const handleAzureAnalysis = () => handleAnalysis("azure");
  const handleGoogleAnalysis = () => handleAnalysis("google");
  const handleAmazonAnalysis = () => handleAnalysis("amazon");
  const handleAdobeAnalysis = () => handleAnalysis("adobe");

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
          <TextDisplayBox
            title="Simple Parse"
            text={simpleParseText}
            error={errors.simpleParse}
            isLoading={isLoading.simpleParse}
            onAnalyze={handleSimpleParse}
          />
          <TextDisplayBox
            title="Azure AI"
            text={azureText}
            error={errors.azure}
            isLoading={isLoading.azure}
            onAnalyze={handleAzureAnalysis}
          />
          <TextDisplayBox
            title="Google AI"
            text={googleText}
            error={errors.google}
            isLoading={isLoading.google}
            onAnalyze={handleGoogleAnalysis}
          />
          <TextDisplayBox
            title="Amazon AI"
            text={amazonText}
            error={errors.amazon}
            isLoading={isLoading.amazon}
            onAnalyze={handleAmazonAnalysis}
          />
          <TextDisplayBox
            title="Adobe API"
            text={adobeText}
            error={errors.adobe}
            isLoading={isLoading.adobe}
            onAnalyze={handleAdobeAnalysis}
          />
        </div>
      </main>
    </div>
  );
}