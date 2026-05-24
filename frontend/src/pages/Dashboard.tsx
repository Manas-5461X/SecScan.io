import type { ScanResult } from '../utils/api';
import { IssueList } from '../components/IssueList';
import { ArrowLeft, Download, ShieldCheck, KeyRound, Box, Settings2, Activity } from 'lucide-react';

interface DashboardProps {
    data: ScanResult;
    onBack: () => void;
}

export default function Dashboard({ data, onBack }: DashboardProps) {
    const risk = data.risk || { riskLevel: 'Low', totalScore: 0, breakdown: [] };
    const secrets = data.secrets || [];
    const vulnerabilities = data.vulnerabilities || [];
    const misconfigurations = data.misconfigurations || [];

    const enrichedSecrets = secrets.map(s => ({
        ...s,
        summary: `Exposed ${s.type} found in ${s.file}`,
        details: `### Security Threat Detected\n\nAn exposed secret of type **${s.type}** was detected at line **${s.line}** in \`${s.file}\`.\n\n> **Risk:** Secrets hardcoded in repositories can lead to unauthorized access, data breaches, and severe financial damage.\n\n**Remediation Strategy:**\n- Immediately revoke the exposed credential.\n- Rotate the secret in all affected systems.\n- Move the credential to a secure vault or environment variables (.env).\n- Use a tool like BFG Repo-Cleaner or \`git filter-repo\` to remove it from Git history.`
    }));

    const enrichedMisconfigs = misconfigurations.map(m => ({
        ...m,
        summary: m.description,
        details: `### Misconfiguration Analysis\n\n**Type:** ${m.type}\n**File:** \`${m.file}\`\n\n${m.description}\n\n> **Risk:** Misconfigurations often expose internal system details, allow unauthorized actions, or leak stack traces to malicious actors.\n\n**Remediation Strategy:**\n- Review the configuration settings in the specified file.\n- Apply the principle of least privilege.\n- Ensure debug modes and verbose logging are disabled in production.`
    }));

    const totalIssues = enrichedSecrets.length + vulnerabilities.length + enrichedMisconfigs.length;

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'Critical': return 'text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] border-red-500/50 bg-red-500/10';
            case 'High': return 'text-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)] border-orange-500/50 bg-orange-500/10';
            case 'Medium': return 'text-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)] border-yellow-500/50 bg-yellow-500/10';
            default: return 'text-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)] border-blue-500/50 bg-blue-500/10';
        }
    };

    const handleDownloadReport = () => {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `secscan-report-${data.repository.replace('/', '-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="w-full animate-fade-in-up pb-12 relative">
            
            {/* Background Details */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

            {/* Header Actions */}
            <div className="flex justify-between items-center mb-10">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-all px-5 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05]"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Scan Another</span>
                </button>
                <button
                    onClick={handleDownloadReport}
                    className="flex items-center gap-2 text-white bg-blue-600/20 hover:bg-blue-600/40 transition-all px-5 py-2.5 rounded-xl border border-blue-500/30 hover:border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                >
                    <Download className="w-4 h-4" />
                    <span className="font-medium">Export JSON</span>
                </button>
            </div>

            {/* Hero Overview - Compact Version */}
            <div className="flex flex-col lg:flex-row gap-6 mb-10 w-full">
                
                {/* Risk Score Card - Compact */}
                <div className={`flex-shrink-0 w-full lg:w-72 rounded-2xl p-6 flex flex-col items-center justify-center text-center border-t-2 bg-[#0a0a0a]/80 backdrop-blur-2xl border-white/[0.05] shadow-lg relative overflow-hidden ${getRiskColor(risk.riskLevel).split(' ')[0].replace('text-', 'border-')}`}>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                    <h2 className="text-gray-400 font-semibold mb-3 text-xs tracking-wide uppercase">Overall Risk Score</h2>
                    <div className="flex items-end gap-3 z-10">
                        <span className={`text-5xl font-black block leading-none ${getRiskColor(risk.riskLevel)}`}>{risk.totalScore}</span>
                    </div>
                    <span className={`text-xs uppercase tracking-widest mt-2 font-bold ${getRiskColor(risk.riskLevel)}`}>{risk.riskLevel}</span>
                    <p className="text-xs text-gray-500 mt-4 truncate w-full px-2 font-mono" title={data.repository}>{data.repository.split('/').pop()}</p>
                </div>

                {/* Stats & Breakdown - Compact */}
                <div className="flex-grow rounded-2xl p-6 bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/[0.05] shadow-lg flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <Activity className="w-5 h-5 text-blue-400" />
                        <h3 className="text-lg font-bold">Security Breakdown</h3>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/10 flex flex-col items-center justify-center">
                            <div className="text-3xl font-black text-red-500 leading-none mb-1">{secrets.length}</div>
                            <div className="text-[10px] text-red-200/70 font-bold tracking-widest uppercase">Secrets</div>
                        </div>
                        <div className="bg-orange-500/5 p-4 rounded-xl border border-orange-500/10 flex flex-col items-center justify-center">
                            <div className="text-3xl font-black text-orange-500 leading-none mb-1">{vulnerabilities.length}</div>
                            <div className="text-[10px] text-orange-200/70 font-bold tracking-widest uppercase">Vuln Deps</div>
                        </div>
                        <div className="bg-yellow-500/5 p-4 rounded-xl border border-yellow-500/10 flex flex-col items-center justify-center">
                            <div className="text-3xl font-black text-yellow-500 leading-none mb-1">{misconfigurations.length}</div>
                            <div className="text-[10px] text-yellow-200/70 font-bold tracking-widest uppercase">Config</div>
                        </div>
                    </div>

                    <div className="flex-grow flex flex-col justify-end">
                        {risk.breakdown.length === 0 ? (
                            <div className="flex items-center gap-2 text-green-400 bg-green-500/5 px-4 py-2 rounded-lg border border-green-500/10 font-medium text-sm">
                                <ShieldCheck className="w-4 h-4" />
                                No significant risk factors found.
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {risk.breakdown.map((r, i) => (
                                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] rounded-lg border border-white/[0.05] text-xs">
                                        <span className="text-gray-400">{r.reason}</span>
                                        <span className="text-red-400 font-mono font-bold bg-red-500/10 px-1.5 py-0.5 rounded">+{r.score}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detailed Issue Lists */}
            <div className="space-y-6">
                <h2 className="text-3xl font-extrabold mb-8 pl-4 border-l-4 border-blue-500 text-white tracking-tight">Detailed Findings</h2>

                {totalIssues === 0 && (
                    <div className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/[0.05] p-16 text-center rounded-[2rem] flex flex-col items-center justify-center shadow-2xl">
                        <div className="w-24 h-24 bg-green-500/10 flex items-center justify-center rounded-full border border-green-500/30 mb-8 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                            <ShieldCheck className="w-12 h-12 text-green-500" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-4">Repository is Clean</h3>
                        <p className="text-gray-400 max-w-lg text-lg leading-relaxed">No exposed secrets, vulnerable dependencies, or severe misconfigurations were detected in the analyzed files.</p>
                    </div>
                )}

                <div className="grid gap-6">
                    <IssueList
                        title="Exposed Secrets"
                        issues={enrichedSecrets}
                        icon={<KeyRound className="w-6 h-6 text-red-400" />}
                    />

                    <IssueList
                        title="Vulnerable Dependencies"
                        issues={vulnerabilities}
                        icon={<Box className="w-6 h-6 text-orange-400" />}
                    />

                    <IssueList
                        title="Misconfigurations"
                        issues={enrichedMisconfigs}
                        icon={<Settings2 className="w-6 h-6 text-yellow-400" />}
                    />
                </div>
            </div>

        </div>
    );
}
