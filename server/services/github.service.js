/**
 * GitHub Service — Fetches critical configuration manifests from public repositories
 * via the GitHub REST API without cloning. Targets only:
 *   - package.json (dependency analysis)
 *   - Dockerfile (container analysis)
 *   - .github/workflows/*.yml (CI/CD analysis)
 */

const GITHUB_API = 'https://api.github.com';

/** Maximum time (ms) to wait for a GitHub API response. */
const GITHUB_TIMEOUT_MS = 10000;

/**
 * Fetch a single file's content from a GitHub repo (Base64 decoded).
 * Returns null if the file doesn't exist (404).
 *
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} filePath - Path to file within the repo
 * @returns {string|null} Decoded file content or null
 */
async function fetchFileContent(owner, repo, filePath) {
  try {
    const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GITHUB_TIMEOUT_MS);

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GreenStack-AI/1.0',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);

    // Log rate limit info
    const remaining = res.headers.get('x-ratelimit-remaining');
    if (remaining && Number(remaining) < 10) {
      console.warn(`⚠️  GitHub API rate limit low: ${remaining} requests remaining`);
    }

    const data = await res.json();
    if (data.encoding === 'base64' && data.content) {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    return null;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn(`⚠️  GitHub API timeout for ${filePath}`);
    } else {
      console.warn(`⚠️  Could not fetch ${filePath}: ${error.message}`);
    }
    return null;
  }
}

/**
 * List files in a directory from a GitHub repo.
 * Returns array of file objects or empty array if not found.
 *
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} dirPath - Directory path within the repo
 * @returns {Array} Array of file metadata objects
 */
async function listDirectory(owner, repo, dirPath) {
  try {
    const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${dirPath}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GITHUB_TIMEOUT_MS);

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GreenStack-AI/1.0',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.status === 404) return [];
    if (!res.ok) return [];

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * Fetch basic repository metadata.
 *
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Object} Repository metadata
 */
async function fetchRepoMeta(owner, repo) {
  try {
    const url = `${GITHUB_API}/repos/${owner}/${repo}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GITHUB_TIMEOUT_MS);

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GreenStack-AI/1.0',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

    // Surface rate limit info
    const remaining = res.headers.get('x-ratelimit-remaining');
    if (remaining) {
      console.log(`   GitHub API rate limit: ${remaining} requests remaining`);
    }

    const data = await res.json();

    return {
      name: data.full_name,
      description: data.description,
      language: data.language,
      size: data.size, // KB
      defaultBranch: data.default_branch,
      stars: data.stargazers_count,
      lastPush: data.pushed_at,
    };
  } catch (error) {
    throw new Error(`Failed to fetch repository metadata: ${error.message}`);
  }
}

/**
 * Fetch all critical manifests from a public GitHub repository.
 * Returns a structured object with raw file contents.
 *
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Object} Structured manifest data with metadata and detection flags
 */
async function fetchAllManifests(owner, repo) {
  // Fetch repo metadata first
  const meta = await fetchRepoMeta(owner, repo);

  // Fetch core configuration files in parallel
  const [packageJson, dockerfile, dockerCompose] = await Promise.all([
    fetchFileContent(owner, repo, 'package.json'),
    fetchFileContent(owner, repo, 'Dockerfile'),
    fetchFileContent(owner, repo, 'docker-compose.yml'),
  ]);

  // Fetch GitHub Actions workflows
  const workflowFiles = await listDirectory(owner, repo, '.github/workflows');
  const workflowContents = {};

  // Fetch up to 5 workflow files in parallel
  const workflowFetches = workflowFiles
    .filter((f) => f.name.endsWith('.yml') || f.name.endsWith('.yaml'))
    .slice(0, 5)
    .map(async (f) => {
      const content = await fetchFileContent(owner, repo, f.path);
      if (content) workflowContents[f.name] = content;
    });

  await Promise.all(workflowFetches);

  // Parse package.json for structured data
  let parsedPackageJson = null;
  if (packageJson) {
    try {
      parsedPackageJson = JSON.parse(packageJson);
    } catch {
      parsedPackageJson = null;
    }
  }

  return {
    meta,
    manifests: {
      packageJson: parsedPackageJson,
      packageJsonRaw: packageJson,
      dockerfile,
      dockerCompose,
      workflows: workflowContents,
    },
    detected: {
      hasPackageJson: !!packageJson,
      hasDockerfile: !!dockerfile,
      hasDockerCompose: !!dockerCompose,
      hasWorkflows: Object.keys(workflowContents).length > 0,
      workflowCount: Object.keys(workflowContents).length,
    },
  };
}

module.exports = {
  fetchAllManifests,
  fetchFileContent,
  fetchRepoMeta,
};
