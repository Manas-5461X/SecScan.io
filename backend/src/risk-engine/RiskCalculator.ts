import { SecretFinding } from '../scanners/SecretScanner';
import { DependencyFinding } from '../scanners/DependencyScanner';
import { ConfigFinding } from '../scanners/ConfigScanner';

export interface ScoreBreakdown {
    findings: number;
    score: number;
    reason: string;
}

export interface RiskResult {
    totalScore: number;
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    breakdown: ScoreBreakdown[];
}

export class RiskCalculator {
    private calculateSecretRisk(secrets: SecretFinding[]): { score: number; count: number } {
        let score = 0;
        secrets.forEach((s) => {
            switch (s.severity) {
                case 'critical': score += 50; break;
                case 'high': score += 40; break;
                case 'medium': score += 20; break;
                case 'low': score += 10; break;
            }
        });
        return { score, count: secrets.length };
    }

    private calculateDependencyRisk(deps: DependencyFinding[]): { score: number; count: number } {
        let score = 0;
        deps.forEach((d) => {
            switch (d.severity) {
                case 'critical': score += 40; break;
                case 'high': score += 30; break;
                case 'medium': score += 15; break;
                case 'low': score += 5; break;
            }
        });
        return { score, count: deps.length };
    }

    private calculateConfigRisk(configs: ConfigFinding[]): { score: number; count: number } {
        let score = 0;
        configs.forEach((c) => {
            switch (c.severity) {
                case 'critical': score += 40; break;
                case 'high': score += 30; break;
                case 'medium': score += 15; break;
                case 'low': score += 5; break;
            }
        });
        return { score, count: configs.length };
    }

    public calculate(
        secrets: SecretFinding[],
        dependencies: DependencyFinding[],
        configs: ConfigFinding[]
    ): RiskResult {
        const sRisk = this.calculateSecretRisk(secrets);
        const dRisk = this.calculateDependencyRisk(dependencies);
        const cRisk = this.calculateConfigRisk(configs);

        const totalScore = sRisk.score + dRisk.score + cRisk.score;

        let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
        if (totalScore > 100) riskLevel = 'Critical';
        else if (totalScore > 50) riskLevel = 'High';
        else if (totalScore > 20) riskLevel = 'Medium';

        const breakdown: ScoreBreakdown[] = [];
        if (sRisk.count > 0) {
            breakdown.push({ findings: sRisk.count, score: sRisk.score, reason: `Found ${sRisk.count} exposed secrets` });
        }
        if (dRisk.count > 0) {
            breakdown.push({ findings: dRisk.count, score: dRisk.score, reason: `Found ${dRisk.count} vulnerable dependencies` });
        }
        if (cRisk.count > 0) {
            breakdown.push({ findings: cRisk.count, score: cRisk.score, reason: `Found ${cRisk.count} misconfigurations` });
        }

        return {
            totalScore,
            riskLevel,
            breakdown
        };
    }
}

export const riskCalculator = new RiskCalculator();
