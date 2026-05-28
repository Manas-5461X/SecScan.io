import axios, { AxiosInstance } from 'axios';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface GithubTreeItem {
    path: string;
    mode: string;
    type: 'blob' | 'tree';
    sha: string;
    size?: number;
    url: string;
}

export class GithubService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: 'https://api.github.com',
            headers: {
                Accept: 'application/vnd.github.v3+json',
                ...(env.GITHUB_TOKEN && { Authorization: `token ${env.GITHUB_TOKEN}` }),
            },
            // 5 second timeout for Github API calls
            timeout: 5000,
        });
    }

    public parseUrl(url: string): { owner: string; repo: string } | null {
        try {
            url = url.trim();
            // Handle various github url formats, ignoring trailing slashes and optional .git
            const regex = /github\.com[/:]([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+?)(?:\.git)?\/?$/i;
            const match = url.match(regex);
            if (match && match.length >= 3) {
                return { owner: match[1], repo: match[2] };
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Fetch repository metadata and default branch
     */
    public async getRepoInfo(owner: string, repo: string) {
        try {
            const response = await this.api.get(`/repos/${owner}/${repo}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error(`Repository not found: ${owner}/${repo}`);
            }
            if (error.response?.status === 401) {
                throw new Error('GitHub API token is invalid or expired. Please check your .env file.');
            }
            if (error.response?.status === 403 && error.response.headers['x-ratelimit-remaining'] === '0') {
                throw new Error('GitHub API rate limit exceeded');
            }
            logger.error('Failed to fetch repo info', { error: error.message });
            throw new Error('Failed to fetch repository information');
        }
    }

    /**
     * Fetch the full file tree of the default branch recursively
     */
    public async getRepoTree(owner: string, repo: string, defaultBranch: string): Promise<GithubTreeItem[]> {
        try {
            // Append ?recursive=1 to get the whole tree
            const response = await this.api.get(`/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`);
            return response.data.tree || [];
        } catch (error: any) {
            logger.error('Failed to fetch repo tree', { error: error.message, owner, repo });
            throw new Error('Failed to fetch repository tree');
        }
    }

    /**
     * Fetch the raw content of a specific file
     */
    public async getFileContent(owner: string, repo: string, path: string): Promise<string | null> {
        try {
            const response = await this.api.get(`/repos/${owner}/${repo}/contents/${path}`, {
                headers: {
                    Accept: 'application/vnd.github.v3.raw',
                },
            });
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null; // File doesn't exist
            }
            logger.error(`Failed to fetch file content for ${path}`, { error: error.message });
            return null;
        }
    }
}

export const githubService = new GithubService();
