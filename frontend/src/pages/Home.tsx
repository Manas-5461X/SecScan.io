import { useState } from 'react';
import { runScan } from '../utils/api';
import type { ScanResult } from '../utils/api';
import { ShieldAlert, Loader2, Github, AlertTriangle, KeyRound, Box, Settings2, ChevronRight } from 'lucide-react';

interface HomeProps {
    onScanComplete: (data: ScanResult) => void;
}

export default function Home({ onScanComplete }: HomeProps) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.includes('github.com')) {
            setError('Please enter a valid GitHub repository URL.');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const result = await runScan(url);
            onScanComplete(result);
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const e = err as any;
            setError(e.response?.data?.error || e.message || 'Failed to scan repository.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 w-full relative z-10">

            {/* Gemini-like Central Glowing Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] pointer-events-none -z-10">
                <div className="absolute inset-0 bg-blue-600/10 blur-[100px] rounded-full" />
                <div className="absolute inset-10 bg-indigo-500/10 blur-[100px] rounded-full" />
                <div className="absolute inset-20 bg-purple-500/5 blur-[100px] rounded-full" />
            </div>

            <div className="text-center mb-8 animate-fade-in-up w-full max-w-3xl flex flex-col items-center">
                <div className="mb-6">
                    <div className="p-3 rounded-2xl bg-[#1e1e1e] border border-white/5 shadow-lg">
                        <ShieldAlert className="w-8 h-8 text-blue-400" />
                    </div>
                </div>
                <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-4 text-white drop-shadow-sm">
                    Secure Your Codebase. Instantly.
                </h1>
                <p className="text-lg text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
                    Enterprise-grade static analysis for your public repositories. Detect exposed secrets, vulnerable dependencies, and misconfigurations instantly.
                </p>
            </div>

            <div className="w-full max-w-2xl">
                <div className="w-full bg-[#131314] border border-white/10 rounded-[20px] p-2 shadow-2xl relative">
                    <form onSubmit={handleScan} className="flex flex-col sm:flex-row items-center relative">
                        <div className="relative flex-grow w-full">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Github className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                                type="url"
                                className="block w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-gray-500 focus:outline-none transition-all text-base"
                                placeholder="https://github.com/owner/repository"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !url}
                            className={`ml-2 px-6 py-3 rounded-[14px] font-bold text-sm flex items-center justify-center transition-all duration-300 group whitespace-nowrap ${loading
                                ? 'bg-[#3c4043] cursor-not-allowed text-gray-400'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 shadow-md text-white'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    Analyzing
                                </>
                            ) : (
                                <>
                                    Start Scan
                                    <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-950/40 border border-red-900/50 rounded-2xl flex items-start text-red-200 backdrop-blur-md animate-in slide-in-from-top-2">
                        <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5 text-red-400" />
                        <p className="font-medium text-sm">{error}</p>
                    </div>
                )}
            </div>

            {/* Compact Features List under search bar so no scrolling needed */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full">
                <div className="p-5 rounded-2xl bg-[#131314]/80 border border-white/[0.05] flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                            <KeyRound className="h-4 w-4 text-orange-400" />
                        </div>
                        <h3 className="text-base text-gray-100 font-bold">Secrets Detection</h3>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">Advanced heuristic scanning for AWS keys, JWTs, Database tokens, and private keys inadvertently exposed in code.</p>
                </div>
                <div className="p-5 rounded-2xl bg-[#131314]/80 border border-white/[0.05] flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <Box className="h-4 w-4 text-blue-400" />
                        </div>
                        <h3 className="text-base text-gray-100 font-bold">Dependency Audit</h3>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">Real-time CVE correlation using the OSV.dev database to identify vulnerable packages and outdated libraries.</p>
                </div>
                <div className="p-5 rounded-2xl bg-[#131314]/80 border border-white/[0.05] flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <Settings2 className="h-4 w-4 text-purple-400" />
                        </div>
                        <h3 className="text-base text-gray-100 font-bold">Misconfigurations</h3>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">Deep analysis of exposed .git folders, overly permissive CORS policies, and hardcoded debug flags.</p>
                </div>
            </div>
        </div>
    );
}
