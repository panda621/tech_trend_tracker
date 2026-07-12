/**
 *  In this task you will build a Mastra tool that searches GitHub
 *  repositories by a keyword or topic. The GitHub Search API is free
 *  for unauthenticated use (rate-limited to 10 requests per minute).
 *
 *  The tool returns repository names, descriptions, star counts,
 *  languages, and links.
 */

// TODO:
// Task 2 – GitHub Repository Search Tool
//
// 1. Import the createTool function from '@mastra/core/tools'
// Reference: https://mastra.ai/docs/agents/using-tools
//
// 2. Import the z object from 'zod'
// Reference: https://zod.dev/?id=basic-usage
//
// 3. Define a TypeScript type called GitHubRepo with the following fields:
//    - full_name (string)
//    - html_url (string)
//    - description (string or null)
//    - stargazers_count (number)
//    - language (string or null)
//    - updated_at (string)
// Reference: https://www.typescriptlang.org/docs/handbook/2/objects.html
//
// 4. Define a TypeScript type called GitHubSearchResponse with the following fields:
//    - items (optional array of GitHubRepo)
// Reference: https://www.typescriptlang.org/docs/handbook/2/objects.html
//
// 5. Create and export a constant called githubSearchTool using createTool with:
//    a. id: 'github-repo-search'
//    b. description: 'Search GitHub repositories by keyword and return names, descriptions, star counts, and links'
//    c. inputSchema: a Zod object with:
//       - query: z.string().describe('Keyword or topic to search GitHub repositories for')
//       - limit: z.number().min(1).max(10).optional().default(5)
//    d. outputSchema: a Zod object with:
//       - repositories: z.array() containing objects with:
//         - name: z.string()
//         - url: z.url()
//         - description: z.string()
//         - stars: z.number()
//         - language: z.string()
//         - lastUpdated: z.string()
//         - source: z.literal('github')
//    e. execute: an async function that receives { context } and:
//       i.   Reads context.query and trims whitespace, store in a const called q
//       ii.  Reads context.limit with a fallback of 5
//       iii. Builds the API URL:
//            `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=${limit}`
//       iv.  Calls fetch() with that URL, passing headers:
//            { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'mastra-trend-tracker/1.0' }
//       v.   If the response is not ok, throws an Error with the status
//       vi.  Parses the JSON response and casts it as GitHubSearchResponse
//       vii. Maps over (data.items ?? []) to build an array of repository objects:
//            - name: repo.full_name
//            - url: repo.html_url
//            - description: repo.description or 'No description provided'
//            - stars: repo.stargazers_count
//            - language: repo.language or 'Not specified'
//            - lastUpdated: repo.updated_at
//            - source: 'github' as const
//       viii. Returns { repositories }
//
// Reference: https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28#search-repositories
// Reference: https://mastra.ai/docs/agents/using-tools
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
//
// YOUR CODE STARTS HERE (Feel free to add more lines of code as needed)

import { createTool } from '@mastra/core/tools';
import { map, z } from 'zod';

interface GitHubRepo{
    full_name: string;
    html_url: string;
    description: string | null ;
    stargazers_count: number;
    language: string | null;
    updated_at: string;
}

interface GitHubSearchResponse{
    items: GitHubRepo[]
}

export const gitHubSearchTool = createTool({
    id: "github-repo-search", 
    description: "Search GitHub repositories by keyword and return names, descriptions, star counts, and links", 
    inputSchema: z.object({
        query: z.string().describe('Keyword or topic to search GitHub repositories for'), 
        limit: z.number().min(1).max(10).optional().default(5)
    }), 

    outputSchema: z.object({
        repositories: z.array(
            z.object({
                name: z.string(), 
                url: z.url(), 
                description: z.string(), 
                stars: z.number(), 
                language: z.string(), 
                lastUpdated: z.string(), 
                source: z.literal('github')
            })
        )
    }), 

    execute: async (context) => {
        const query = context.query.trim()
        const limit = context.limit ?? 5
        const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${limit}`
        const response = await fetch(url, {headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'mastra-trend-tracker/1.0' }})

        if (!response.ok){
            throw new Error(`Github search request failed with ${response.status}`)
        }

        const data = (await response.json()) as GitHubSearchResponse;

        const repositories = (data.items ?? []).map((repo) => ({
            name: repo.full_name, 
            url: repo.html_url, 
            description: repo.description ?? "No description provided", 
            stars: repo.stargazers_count, 
            language: repo.language ?? "Not specified", 
            lastUpdated: repo.updated_at, 
            source: "github" as const, 
        }));

        return {repositories}    
    }
})