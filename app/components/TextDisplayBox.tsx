interface TextDisplayBoxProps {
  title: string;
  text: string | null;
  error: string | null;
  isLoading: boolean;
  onAnalyze: () => void;
}

export const TextDisplayBox = ({ title, text, error, isLoading, onAnalyze }: TextDisplayBoxProps) => {
  return (
    <div className="flex flex-col w-full max-w-md">
      <button
        onClick={onAnalyze}
        className="mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : `Analyze with ${title}`}
      </button>
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
  );
}; 