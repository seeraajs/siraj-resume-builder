'use client';

import dynamic from 'next/dynamic';

const HomeClient = dynamic(() => import('./home-client'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#02040a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,242,254,0.12),rgba(99,102,241,0.05),transparent)] font-sans p-4 flex flex-col items-center justify-center relative overflow-x-hidden">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <div className="w-10 h-10 rounded-full border-2 border-t-indigo-400 border-r-indigo-400/30 border-b-indigo-400/30 border-l-indigo-400/30 animate-spin" />
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">
            CV & Resume Builder
          </div>
          <div className="text-xs font-mono text-zinc-400">
            Preparing your professional workspace...
          </div>
        </div>
      </div>
    </div>
  ),
});

export default function ClientWrapper() {
  return <HomeClient />;
}
