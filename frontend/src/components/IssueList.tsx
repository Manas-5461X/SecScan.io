import { useState } from 'react';
import { ChevronDown, ChevronUp, FileCode2, AlertCircle, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Issue {
    file: string;
    severity: string;
    type?: string;
    package?: string;
    cveId?: string;
    description?: string;
    summary?: string;
    details?: string;
    line?: number;
}

interface IssueListProps {
    title: string;
    issues: Issue[];
    icon: React.ReactNode;
}

const getSeverityColor = (sev: string) => {
    switch (sev.toLowerCase()) {
        case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
        case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
        case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
        default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
};

function IssueItem({ issue }: { issue: Issue }) {
    const [showDetails, setShowDetails] = useState(false);

    // Provide a small readable summary by default
    const briefSummary = issue.summary || issue.description || '';
    
    return (
        <div className="p-6 hover:bg-white/[0.02] transition-colors">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                    <AlertCircle className={`w-5 h-5 ${getSeverityColor(issue.severity).split(' ')[0]}`} />
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold border uppercase tracking-wider ${getSeverityColor(issue.severity)}`}>
                        {issue.severity}
                    </span>
                    <span className="font-semibold text-lg">
                        {issue.type || issue.cveId || 'Configuration Issue'}
                    </span>
                </div>
                {issue.package && (
                    <span className="text-sm font-mono bg-[#111] border border-white/5 px-2 py-1 rounded">
                        pkg: {issue.package}
                    </span>
                )}
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm text-gray-400 font-mono bg-black/40 p-3 rounded-lg border border-white/[0.05]">
                <FileCode2 className="w-4 h-4" />
                {issue.file} {issue.line ? `:${issue.line}` : ''}
            </div>

            {briefSummary && (
                <div className="mt-4 flex items-start gap-3 bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl">
                    <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm text-gray-300 leading-relaxed font-medium">
                            {briefSummary}
                        </p>
                    </div>
                </div>
            )}
            
            {issue.details && issue.details !== briefSummary && (
                <div className="mt-4">
                    <button 
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2"
                    >
                        {showDetails ? 'Hide Detailed Analysis' : 'View Detailed Analysis'}
                    </button>

                    {showDetails && (
                        <div className="mt-4 text-sm text-gray-300 bg-black/60 p-5 rounded-xl border border-white/[0.05] max-h-[400px] overflow-y-auto custom-markdown shadow-inner">
                            <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h1: ({node: _node, ...props}) => <h1 className="text-xl font-bold text-white mb-4 mt-6 border-b border-white/10 pb-2" {...props} />,
                                    h2: ({node: _node, ...props}) => <h2 className="text-lg font-bold text-white mb-3 mt-5" {...props} />,
                                    h3: ({node: _node, ...props}) => <h3 className="text-md font-bold text-white mb-2 mt-4" {...props} />,
                                    p: ({node: _node, ...props}) => <p className="mb-4 leading-relaxed text-gray-400" {...props} />,
                                    ul: ({node: _node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-400" {...props} />,
                                    ol: ({node: _node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-1 text-gray-400" {...props} />,
                                    li: ({node: _node, ...props}) => <li className="text-gray-400" {...props} />,
                                    a: ({node: _node, ...props}) => <a className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                    pre: ({node: _node, ...props}) => <pre className="bg-[#111] p-4 rounded-xl overflow-x-auto text-[13px] font-mono text-gray-300 border border-white/[0.05] mb-4 shadow-inner" {...props} />,
                                    code: ({node: _node, className, children, ...props}) => {
                                        const isBlock = /language-(\w+)/.exec(className || '') || String(children).includes('\n');
                                        return isBlock ? (
                                            <code className={className} {...props}>{children}</code>
                                        ) : (
                                            <code className="bg-white/10 text-pink-300 px-1.5 py-0.5 rounded text-[13px] font-mono shadow-sm" {...props}>{children}</code>
                                        );
                                    },
                                    table: ({node: _node, ...props}) => <div className="overflow-x-auto mb-4 rounded-lg border border-white/10"><table className="w-full text-left border-collapse" {...props} /></div>,
                                    th: ({node: _node, ...props}) => <th className="bg-[#111] p-3 border-b border-white/10 font-semibold text-gray-200 whitespace-nowrap text-xs uppercase tracking-wider" {...props} />,
                                    td: ({node: _node, ...props}) => <td className="p-3 border-b border-white/[0.05] whitespace-nowrap text-gray-400 text-sm" {...props} />,
                                    blockquote: ({node: _node, ...props}) => <blockquote className="border-l-4 border-blue-500/50 pl-4 bg-blue-500/5 py-2 pr-4 italic text-gray-400 my-4 rounded-r-lg" {...props} />
                                }}
                            >
                                {issue.details}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export function IssueList({ title, issues, icon }: IssueListProps) {
    const [expanded, setExpanded] = useState(false);

    if (issues.length === 0) {
        return null;
    }

    return (
        <div className="glass-panel rounded-xl overflow-hidden mb-6 transition-all border border-white/[0.05] bg-[#0a0a0a]/50">
            <div
                className="p-6 cursor-pointer flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/[0.05] rounded-lg border border-white/[0.05]">
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-3">
                            {title}
                            <span className="px-3 py-1 text-sm bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 font-bold">
                                {issues.length} {issues.length === 1 ? 'Issue' : 'Issues'}
                            </span>
                        </h3>
                    </div>
                </div>
                <div>
                    {expanded ? <ChevronUp className="w-6 h-6 text-gray-500" /> : <ChevronDown className="w-6 h-6 text-gray-500" />}
                </div>
            </div>

            {expanded && (
                <div className="border-t border-white/[0.05] divide-y divide-white/[0.05]">
                    {issues.map((issue, idx) => (
                        <IssueItem key={idx} issue={issue} />
                    ))}
                </div>
            )}
        </div>
    );
}
