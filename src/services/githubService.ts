export interface GitHubTreeItem {
  path: string;
  type: 'blob' | 'tree';
  size?: number;
  url?: string;
}

export interface GitHubRepoInfo {
  owner: string;
  repo: string;
}

/**
 * Parse a GitHub URL string into owner and repo name
 * e.g. "https://github.com/facebook/react" -> { owner: "facebook", repo: "react" }
 */
export function parseGitHubUrl(urlStr?: string | null): GitHubRepoInfo | null {
  if (!urlStr || typeof urlStr !== 'string') return null;
  const clean = urlStr.trim();
  
  try {
    const formatted = clean.startsWith('http') ? clean : `https://${clean}`;
    const parsed = new URL(formatted);
    if (parsed.hostname.includes('github.com')) {
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts.length >= 2) {
        return {
          owner: parts[0],
          repo: parts[1].replace(/\.git$/i, '')
        };
      }
    }
  } catch {
    // Fallback if URL parsing fails
  }

  // Regex fallback for github.com/owner/repo or owner/repo format
  const match = clean.match(/github\.com\/([^/]+)\/([^/#?]+)/i);
  if (match && match[1] && match[2]) {
    return {
      owner: match[1],
      repo: match[2].replace(/\.git$/i, '')
    };
  }

  // Fallback for simple "owner/repo" format
  const parts = clean.replace(/\/$/, '').split('/');
  if (parts.length === 2 && !clean.includes(':')) {
    return { owner: parts[0], repo: parts[1].replace(/\.git$/i, '') };
  }

  return null;
}

/**
 * Fetch default branch GitHub file tree structure for a repo
 */
export async function fetchGitHubRepoTree(owner: string, repo: string): Promise<GitHubTreeItem[]> {
  const branches = ['main', 'master'];
  
  for (const branch of branches) {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.tree)) {
          return data.tree;
        }
      }
    } catch (e) {
      console.warn(`Attempt to fetch GitHub tree for branch ${branch} failed:`, e);
    }
  }

  return [];
}

/**
 * Fetch raw file content from GitHub CDN
 */
export async function fetchGitHubFileContent(owner: string, repo: string, filePath: string): Promise<string> {
  const branches = ['main', 'master'];

  for (const branch of branches) {
    try {
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
      const res = await fetch(rawUrl);
      if (res.ok) {
        return await res.text();
      }
    } catch (e) {
      console.warn(`Failed to fetch raw file from ${branch}:`, e);
    }
  }

  throw new Error(`Không thể tải nội dung file ${filePath} từ GitHub.`);
}
