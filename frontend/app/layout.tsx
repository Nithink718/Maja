import './globals.css';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'EcoSphere | AI Mock Interview & Candidate Evaluation Platform',
  description: 'AI-powered interview intelligence for candidates and organizations. Evidence-backed candidate scoring with multi-agent reasoning.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© 2026 EcoSphere. Built with Gemini & Gradium Intelligence.</span>
            <div className="flex items-center gap-4 text-slate-600">
              <span>Light Theme SaaS</span>
              <span>•</span>
              <span>Real-time Semantic VAD</span>
              <span>•</span>
              <span>Multi-Agent Scoring</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
