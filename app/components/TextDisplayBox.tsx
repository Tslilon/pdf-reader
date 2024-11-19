import React, { useState } from 'react';

interface TextDisplayBoxProps {
  title: string;
  text: string | null;
  rawResponse: any;
  openAIResult: {
    text: string | null;
    rawResponse: any;
  } | null;
  error: string | null;
  isLoading: boolean;
  isOpenAILoading: boolean;
  onAnalyze: () => void;
  onOpenAIAnalyze: () => void;
}

export const TextDisplayBox = ({
  title,
  text,
  rawResponse,
  openAIResult,
  error,
  isLoading,
  isOpenAILoading,
  onAnalyze,
  onOpenAIAnalyze,
}: TextDisplayBoxProps) => {
  const [isRawResponseVisible, setIsRawResponseVisible] = useState(false);
  const [isOpenAIRawVisible, setIsOpenAIRawVisible] = useState(false);

  return (
    <div className="flex flex-col w-full max-w-md gap-4 p-4 border rounded-lg bg-black">
      <button
        onClick={onAnalyze}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : `Read with ${title}`}
      </button>

      <div className="flex flex-col">
        <h3 className="text-sm font-semibold mb-1">Extracted Text</h3>
        <div className="h-48 p-4 border rounded overflow-auto bg-black">
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : text ? (
            <p className="whitespace-pre-wrap">{text}</p>
          ) : (
            <p className="text-gray-600 italic">Results will appear here...</p>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        <button
          onClick={() => setIsRawResponseVisible(!isRawResponseVisible)}
          className="text-sm font-semibold text-left hover:text-blue-500 flex items-center"
        >
          <span>Raw Response</span>
          <span className="ml-1">{isRawResponseVisible ? "▼" : "▶"}</span>
        </button>
        {isRawResponseVisible && (
          <div className="h-48 p-4 border rounded overflow-auto bg-black">
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(rawResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {text && (
        <div className="mt-4 pt-4 border-t">
          <button
            onClick={onOpenAIAnalyze}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
            disabled={isOpenAILoading}
          >
            {isOpenAILoading ? "Processing with GPT..." : "Parse with GPT"}
          </button>

          {openAIResult?.text && (
            <div className="mt-4">
              <div className="flex flex-col">
                <h3 className="text-sm font-semibold mb-1">GPT Analysis</h3>
                <div className="h-48 p-4 border rounded overflow-auto bg-black">
                  <p className="whitespace-pre-wrap">{openAIResult.text}</p>
                </div>
              </div>

              <div className="flex flex-col mt-2">
                <button
                  onClick={() => setIsOpenAIRawVisible(!isOpenAIRawVisible)}
                  className="text-sm font-semibold text-left hover:text-blue-500 flex items-center"
                >
                  <span>GPT Raw Response</span>
                  <span className="ml-1">{isOpenAIRawVisible ? "▼" : "▶"}</span>
                </button>
                {isOpenAIRawVisible && (
                  <div className="h-48 p-4 border rounded overflow-auto bg-black">
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(openAIResult.rawResponse, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 