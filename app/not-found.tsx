import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#02040a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,242,254,0.12),rgba(99,102,241,0.05),transparent)] font-sans p-4 flex flex-col items-center justify-center relative overflow-x-hidden text-zinc-100">
      <div className="flex flex-col items-center gap-6 text-center max-w-md px-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/5 animate-pulse">
          <FileText className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl font-display">
            404
          </h1>
          <h2 className="text-xl font-semibold text-indigo-300">
            Page Not Found
          </h2>
          <p className="text-sm text-zinc-400 max-w-xs mx-auto">
            The workspace or document directory you are looking for does not exist or has been relocated.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all duration-200 shadow-md shadow-indigo-600/15 hover:shadow-indigo-600/25 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workspace
        </Link>
      </div>
    </div>
  );
}
