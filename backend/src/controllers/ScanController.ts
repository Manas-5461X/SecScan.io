import { Request, Response, NextFunction } from 'express';
import { githubService } from '../services/githubService';
import { secretScanner } from '../scanners/SecretScanner';
import { dependencyScanner } from '../scanners/DependencyScanner';
import { configScanner } from '../scanners/ConfigScanner';
import { riskCalculator } from '../risk-engine/RiskCalculator';
import { z } from 'zod';

const scanRequestSchema = z.object({
    url: z.string().min(1, 'URL is required').refine(val => val.includes('github.com'), 'Invalid GitHub URL'),
});

export class ScanController {
    public async scan(req: Request, res: Response, next: NextFunction) {
        try {
            // 1. Validate Input
            const parseResult = scanRequestSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error.issues[0].message });
            }

            const { url } = parseResult.data;

            // 2. Parse URL & Fetch Repo Info
            const repoInfo = githubService.parseUrl(url);
            if (!repoInfo) {
                return res.status(400).json({ error: 'Invalid GitHub repository URL format' });
            }

            const { owner, repo } = repoInfo;
            const metadata = await githubService.getRepoInfo(owner, repo);
            const defaultBranch = metadata.default_branch;

            // 3. Get Repo Tree
            const tree = await githubService.getRepoTree(owner, repo, defaultBranch);

            // Filters for relevant files to avoid downloading/scanning every single file (keeps it fast)
            // A more robust solution would background job this and process everything
            const interestingExtensions = ['.ts', '.js', '.py', '.json', '.env', '.txt', '.yml', '.yaml', '.xml', 'Dockerfile'];
            const interestingFiles = tree.filter(item =>
                item.type === 'blob' &&
                (interestingExtensions.some(ext => item.path.endsWith(ext)) || item.path.includes('Dockerfile') || item.path.includes('.git/config'))
            );

            // Limit to max 100 files for synchronous MVP
            const filesToProcess = interestingFiles.slice(0, 100);

            const allSecrets = [];
            const allConfigs = [];
            let allDependencies: any[] = [];

            for (const item of filesToProcess) {
                const content = await githubService.getFileContent(owner, repo, item.path);
                if (!content) continue;

                // Base64 decode content (GitHub API returns raw occasionally but using vnd.github.v3.raw headers should give us plain text)
                // Note: the axios config currently uses vnd.github.v3.raw 
                // Axios automatically parses JSON files, so we stringify it back if it's an object
                const fileContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);

                // Scan Secrets
                const fileSecrets = secretScanner.scan(item.path, fileContent);
                allSecrets.push(...fileSecrets);

                // Scan Configs
                const fileConfigs = configScanner.scan(item.path, fileContent);
                allConfigs.push(...fileConfigs);

                // Scan Dependencies
                if (item.path.endsWith('package.json')) {
                    const fileDeps = await dependencyScanner.scanPackageJson(item.path, fileContent);
                    allDependencies.push(...fileDeps);
                }
            }

            // 4. Calculate Risk
            const risk = riskCalculator.calculate(allSecrets, allDependencies, allConfigs);

            // 5. Respond
            return res.status(200).json({
                repository: `${owner}/${repo}`,
                scannedAt: new Date().toISOString(),
                risk,
                secrets: allSecrets,
                vulnerabilities: allDependencies,
                misconfigurations: allConfigs,
            });

        } catch (error) {
            next(error);
        }
    }
}

export const scanController = new ScanController();
