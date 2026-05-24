import axios from 'axios';

// Assume backend is running on local 3000 during dev
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    timeout: 30000, // 30 seconds for complete scan
});

export interface VulnerabilityFinding {
    file: string;
    package: string;
    version: string;
    cveId: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    patchedVersion?: string;
    summary?: string;
    details?: string;
}

export interface ScanResult {
    repository: string;
    scannedAt: string;
    risk: {
        totalScore: number;
        riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
        breakdown: Array<{ findings: number; score: number; reason: string }>;
    };
    secrets: Array<{ file: string; line: number; type: string; severity: string }>;
    vulnerabilities: Array<VulnerabilityFinding>;
    misconfigurations: Array<{ file: string; type: string; severity: string; description: string }>;
}

export const runScan = async (url: string): Promise<ScanResult> => {
    const { data } = await api.post<ScanResult>('/scan', { url });
    return data;
};
