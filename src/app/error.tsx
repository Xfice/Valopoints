'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{ backgroundColor: '#0f1923', color: '#f3f4f6' }}
    >
      <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
      <p className="text-red-400 mb-4 text-center max-w-md">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-medium"
      >
        Try again
      </button>
    </div>
  );
}
