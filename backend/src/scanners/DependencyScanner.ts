import { osvService } from '../services/osvService';

export interface DependencyFinding {
    file: string;
    package: string;
    version: string;
    cveId: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    patchedVersion?: string;
    summary?: string;
    details?: string;
}

export class DependencyScanner {
    public async scanPackageJson(file: string, content: string): Promise<DependencyFinding[]> {
        const findings: DependencyFinding[] = [];
        try {
            const packageObj = JSON.parse(content);
            const dependencies = { ...packageObj.dependencies, ...packageObj.devDependencies };

            for (const [pkg, version] of Object.entries(dependencies)) {
                // Strip out non-alphanumeric versions (naive versioning for scan demo)
                const cleanVersion = (version as string).replace(/[^0-9.]/g, '');
                if (!cleanVersion) continue;

                const vulnerabilities = await osvService.queryPackage(pkg, cleanVersion, 'npm');

                for (const vuln of vulnerabilities) {
                    let cleanDetails = vuln.details || 'No detailed description provided by the OSV database.';
                    
                    // Truncate massively long markdown details safely
                    if (cleanDetails.length > 800) {
                        const paragraphs = cleanDetails.split('\n\n');
                        cleanDetails = paragraphs.slice(0, 3).join('\n\n');
                        if (cleanDetails.length > 1000) {
                            cleanDetails = cleanDetails.slice(0, 800) + '...';
                        }
                        cleanDetails += `\n\n> **Note:** Analysis truncated. See [${vuln.id}](https://osv.dev/vulnerability/${vuln.id}) on OSV for full disclosure.`;
                    }

                    findings.push({
                        file,
                        package: pkg,
                        version: cleanVersion,
                        cveId: vuln.id,
                        summary: vuln.summary || 'Vulnerability detected in dependency.',
                        details: cleanDetails,
                        // Simplified severity mapping, OSV severity is array
                        severity: this.mapSeverity(vuln),
                    });
                }
            }

        } catch (error) {
            // Invalid package.json, ignore or log
        }
        return findings;
    }

    private mapSeverity(vuln: any): 'low' | 'medium' | 'high' | 'critical' {
        if (vuln.details?.toLowerCase().includes('critical')) return 'critical';
        if (vuln.details?.toLowerCase().includes('high')) return 'high';
        return 'medium'; // Default fallback
    }

    // TODO: Implement scanRequirementsTxt for python
}

export const dependencyScanner = new DependencyScanner();
