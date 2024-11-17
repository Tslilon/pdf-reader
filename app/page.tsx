"use client";

import { useState } from "react";

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setError("");
      setPdfText("");
    }
  };

  const handleParsePDF = async () => {
    if (!uploadedFile) {
      setError("Please upload a file first");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned invalid response format");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse PDF");
      }

      if (data.success && data.text) {
        setPdfText(data.text);
      } else {
        throw new Error("No text content found in PDF");
      }

    } catch (error) {
      console.error("Error parsing PDF:", error);
      setError(error instanceof Error ? error.message : "Failed to parse PDF");
      setPdfText("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold">Upload Your PDF</h1>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileUpload}
          className="border border-gray-300 rounded p-2"
        />
        <button
          onClick={handleParsePDF}
          disabled={!uploadedFile || isLoading}
          className={`mt-4 rounded p-2 ${
            uploadedFile && !isLoading
              ? "bg-blue-500 hover:bg-blue-600 text-white"
              : "bg-gray-300 cursor-not-allowed text-gray-500"
          }`}
        >
          {isLoading ? "Processing..." : "Parse PDF"}
        </button>
        {error && (
          <div className="mt-4 p-4 border border-red-300 bg-red-50 text-red-700 rounded">
            {error}
          </div>
        )}
        {pdfText && (
          <div className="mt-4 p-4 border border-gray-300 rounded max-w-full overflow-auto">
            <h2 className="text-xl font-bold mb-4">Extracted Text:</h2>
            <p className="whitespace-pre-wrap">{pdfText}</p>
          </div>
        )}
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <p className="text-sm">Upload your PDF file above.</p>
      </footer>
    </div>
  );
}
