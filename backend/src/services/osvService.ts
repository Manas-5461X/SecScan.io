import axios from 'axios';
import { logger } from '../utils/logger';

export interface OsvVulnerability {
    id: string;
    summary?: string;
    details?: string;
    aliases?: string[];
    severity?: { type: string; score: string }[];
    affected: any[];
}

export class OsvService {
    private api = axios.create({
        baseURL: 'https://api.osv.dev/v1',
        timeout: 5000,
    });

    /**
     * Query OSV API for vulnerabilities in a specific package
     * Ecosystem examples: 'npm', 'PyPI'
     */
    public async queryPackage(name: string, version: string, ecosystem: string): Promise<OsvVulnerability[]> {
        try {
            const response = await this.api.post('/query', {
                version,
                package: {
                    name,
                    ecosystem,
                },
            });
            return response.data.vulns || [];
        } catch (error: any) {
            logger.error(`OSV API query failed for ${name}@${version}`, { error: error.message });
            return [];
        }
    }
}

export const osvService = new OsvService();
