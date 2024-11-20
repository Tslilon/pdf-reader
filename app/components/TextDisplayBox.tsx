import React, { useState } from 'react';

interface TextDisplayBoxProps {
  title: string;
  text: string | null;
  rawResponse: any;
  openAIResult: {
    text: string | null;
    rawResponse: any;
  } | null;
  claudeResult: {
    text: string | null;
    rawResponse: any;
  } | null;
  error: string | null;
  isLoading: boolean;
  isOpenAILoading: boolean;
  isClaudeLoading: boolean;
  onAnalyze: () => void;
  onOpenAIAnalyze: () => void;
  onClaudeAnalyze: () => void;
  extractionTime?: number;
}

export const TextDisplayBox = ({
  title,
  text,
  rawResponse,
  openAIResult,
  claudeResult,
  error,
  isLoading,
  isOpenAILoading,
  isClaudeLoading,
  onAnalyze,
  onOpenAIAnalyze,
  onClaudeAnalyze,
  extractionTime,
}: TextDisplayBoxProps) => {
  const [isRawResponseVisible, setIsRawResponseVisible] = useState(false);
  const [isOpenAIRawVisible, setIsOpenAIRawVisible] = useState(false);
  const [isClaudeRawVisible, setIsClaudeRawVisible] = useState(false);

  return (
    <div className="flex flex-col w-full max-w-md gap-4 p-4 border border-gray-700 rounded-lg bg-black/30 backdrop-blur-sm">
      <button
        onClick={onAnalyze}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : `Read with ${title}`}
      </button>

      <div className="flex flex-col">
        <div className="h-48 pb-4 pt-2 px-4 border border-gray-700/50 rounded overflow-auto bg-black/50">
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : text ? (
            <div className="whitespace-pre-wrap text-gray-200">
                {extractionTime && (
                <p className="text-xs text-white italic text-center pb-2 border-b border-gray-700/50">
                  Extracted in {extractionTime.toFixed(2)}s
                </p>
              )}
              <p>{text.trim()}</p>
            </div>
          ) : (
            <p className="text-gray-500 italic">Extracted text will appear here...</p>
          )}
        </div>
      </div>

      {rawResponse && (
        <div className="flex flex-col mt-0">
          <button
            onClick={() => setIsRawResponseVisible(!isRawResponseVisible)}
            className="text-sm font-semibold text-left hover:text-blue-400 flex items-center text-gray-300 transition-colors"
          >
            <span>Raw Response</span>
            <span className="ml-1">{isRawResponseVisible ? "▼" : "▶"}</span>
          </button>
          {isRawResponseVisible && (
            <div className="h-48 p-4 border border-gray-700/50 rounded overflow-auto bg-black/50 mt-2">
              <pre className="text-xs whitespace-pre-wrap text-gray-200">
                {JSON.stringify(rawResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {text && (
        <div className=" pt-4 border-t border-gray-700/50">
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
                <div className="h-48 p-4 border rounded overflow-auto bg-black">
                  <p className="whitespace-pre-wrap">{openAIResult.text}</p>
                </div>
              </div>

              <div className="flex flex-col mt-2">
                <button
                  onClick={() => setIsOpenAIRawVisible(!isOpenAIRawVisible)}
                  className="text-sm font-semibold text-left hover:text-blue-500 flex items-center"
                >
                  <span>Raw Response</span>
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

          <button
            onClick={onClaudeAnalyze}
            className="w-full px-4 py-2 mt-4 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300"
            disabled={isClaudeLoading}
          >
            {isClaudeLoading ? "Processing with Claude..." : "Parse with Claude"}
          </button>

          {claudeResult?.text && (
            <div className="mt-4">
              <div className="flex flex-col">
                <div className="h-48 p-4 border rounded overflow-auto bg-black">
                  <pre className="whitespace-pre-wrap text-sm">
                    {claudeResult.text}
                  </pre>
                </div>
              </div>

              <div className="flex flex-col mt-2">
                <button
                  onClick={() => setIsClaudeRawVisible(!isClaudeRawVisible)}
                  className="text-sm font-semibold text-left hover:text-blue-500 flex items-center"
                >
                  <span>Raw Response</span>
                  <span className="ml-1">{isClaudeRawVisible ? "▼" : "▶"}</span>
                </button>
                {isClaudeRawVisible && (
                  <div className="h-48 p-4 border rounded overflow-auto bg-black">
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(claudeResult.rawResponse, null, 2)}
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