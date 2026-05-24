export interface ConfigFinding {
    file: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
}

export class ConfigScanner {
    public scan(file: string, content: string): ConfigFinding[] {
        const findings: ConfigFinding[] = [];
        if (!content) return findings;

        // Check for exposed .git
        if (file.includes('.git/config')) {
            findings.push({
                file,
                type: 'Exposed Git Folder',
                severity: 'high',
                description: 'The .git folder is exposed, leaking repository history.'
            });
        }

        // Check Dockerfile bad practices
        if (file.includes('Dockerfile')) {
            if (content.match(/ENV\s+.*?(key|secret|password|token)/i)) {
                findings.push({
                    file,
                    type: 'Dockerfile Secrets',
                    severity: 'high',
                    description: 'Secrets hardcoded in Dockerfile ENV instructions.'
                });
            }
            if (content.match(/USER\s+root/i) || !content.match(/USER\s+/i)) {
                findings.push({
                    file,
                    type: 'Docker Root Execution',
                    severity: 'medium',
                    description: 'Dockerfile runs as root.'
                });
            }
        }

        // Check Debug=true
        if (content.match(/debug\s*=\s*(true|1)/i)) {
            findings.push({
                file,
                type: 'Debug Mode Enabled',
                severity: 'medium',
                description: 'Debug mode appears to be enabled which can leak stack traces.'
            });
        }

        // S3 Bucket URL
        if (content.match(/s3\.amazonaws\.com/)) {
            findings.push({
                file,
                type: 'S3 Bucket URL',
                severity: 'low',
                description: 'Hardcoded S3 Bucket URL found.'
            });
        }

        // Open CORS in common configs
        if (content.match(/Access-Control-Allow-Origin:\s*\*/i)) {
            findings.push({
                file,
                type: 'Open CORS',
                severity: 'medium',
                description: 'CORS policy configured to allow any origin (*)'
            });
        }

        return findings;
    }
}

export const configScanner = new ConfigScanner();
