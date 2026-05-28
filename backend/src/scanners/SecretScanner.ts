export interface SecretFinding {
    file: string;
    line: number;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    matchPreview?: string;
}

const SECRET_PATTERNS = [
    { type: 'AWS Access Key', regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/, severity: 'critical' },
    { type: 'AWS Secret Key', regex: /aws_secret_access_key\s*[:=]\s*["']?([a-zA-Z0-9/+=]{40})["']?/i, severity: 'critical' },
    { type: 'Google API Key', regex: /AIza[0-9A-Za-z-_]{35}/, severity: 'high' },
    { type: 'Stripe Secret Key', regex: /sk_(live|test)_[0-9a-zA-Z]{24}/, severity: 'critical' },
    { type: 'JWT Token', regex: /eyJ[a-zA-Z0-9_-]{5,}\.eyJ[a-zA-Z0-9_-]{5,}\.[a-zA-Z0-9_-]+/, severity: 'high' },
    { type: 'Private RSA Key', regex: new RegExp('-----BEGIN RSA ' + 'PRIVATE KEY-----'), severity: 'critical' },
    { type: 'Generic API Key', regex: /(api[_-]?key|secret|token|password)\s*[:=]\s*["']?([a-zA-Z0-9\-_]{16,})["']?/i, severity: 'medium' },
    { type: 'Database URL', regex: /(mongodb(?:\+srv)?|postgres(?:ql)?|mysql):\/\/([^:]+):([^@]+)@/, severity: 'critical' },
    { type: 'Firebase URL', regex: /.*firebaseio\.com.*/, severity: 'low' },
    { type: 'Twilio API Key', regex: /SK[0-9a-fA-F]{32}/, severity: 'high' }
];

export class SecretScanner {
    public scan(file: string, content: string): SecretFinding[] {
        const findings: SecretFinding[] = [];
        if (!content) return findings;

        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const lineContent = lines[i];

            for (const pattern of SECRET_PATTERNS) {
                if (pattern.regex.test(lineContent)) {
                    // Extra check to ignore obvious false positives or placeholder string lengths, skipping for now
                    findings.push({
                        file,
                        line: i + 1,
                        type: pattern.type,
                        severity: pattern.severity as any,
                    });
                }
            }

            // Check for .env contents directly identifying them as high/critical based on file path
            if (file.includes('.env') || file.includes('credentials')) {
                if (lineContent.includes('=') && lineContent.split('=')[1]?.trim()?.length > 4) {
                    findings.push({
                        file,
                        line: i + 1,
                        type: 'Environment Variable Secret',
                        severity: 'high',
                    });
                }
            }
        }

        // Deduplicate on same line and type if needed
        return findings;
    }
}

export const secretScanner = new SecretScanner();
