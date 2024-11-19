import React, { useState } from 'react';

interface TextDisplayBoxProps {
  title: string;
  text: string | null;
  rawResponse: any;
  error: string | null;
  isLoading: boolean;
  onAnalyze: () => void;
}

export const TextDisplayBox = ({ title, text, rawResponse, error, isLoading, onAnalyze }: TextDisplayBoxProps) => {
  const [isRawResponseVisible, setIsRawResponseVisible] = useState(false);

  return (
    <div className="flex flex-col w-full max-w-md gap-2">
      <button
        onClick={onAnalyze}
        className="mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : `Analyze with ${title}`}
      </button>

      {/* Text Display */}
      <div className="flex flex-col">
        <h3 className="text-sm font-semibold mb-1">Extracted Text</h3>
        <div className="h-48 p-4 border border-gray-300 rounded overflow-auto">
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : text ? (
            <p className="whitespace-pre-wrap">{text}</p>
          ) : (
            <p className="text-gray-500 italic">Results will appear here...</p>
          )}
        </div>
      </div>

      {/* Raw Response Display */}
      <div className="flex flex-col">
        <button
          onClick={() => setIsRawResponseVisible(!isRawResponseVisible)}
          className="text-sm font-semibold mb-1 text-left hover:text-blue-500 flex items-center"
        >
          <span>Raw Response</span>
          <span className="ml-1">{isRawResponseVisible ? "▼" : "▶"}</span>
        </button>
        {isRawResponseVisible && (
          <div className="h-48 p-4 border border-gray-300 rounded overflow-auto">
            {rawResponse ? (
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(rawResponse, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500 italic">No raw response available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 