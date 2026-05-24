import { useState } from 'react';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import type { ScanResult } from './utils/api';
import { ShieldCheck } from 'lucide-react';

function App() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-gray-100 selection:bg-blue-500/30 font-sans relative overflow-hidden">
      
      {/* Top Navigation */}
      <header className="border-b border-white/[0.05] bg-[#050505]/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setScanResult(null)}
          >
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 group-hover:border-blue-500/50 transition-colors">
              <ShieldCheck className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">
              Sec<span className="text-blue-500">Scan</span>
            </span>
          </div>
          {/* Nav links removed per user request */}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full relative">
        {!scanResult ? (
          <Home onScanComplete={setScanResult} />
        ) : (
          <Dashboard data={scanResult} onBack={() => setScanResult(null)} />
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm mt-auto z-10 border-t border-white/[0.05]">
        <p>Built for being secure.</p>
      </footer>
    </div>
  );
}

export default App;
