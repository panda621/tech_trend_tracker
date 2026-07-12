// TODO:
// Task 3 – DEV.to Article Search Tool
//
// 1. Import the createTool function from '@mastra/core/tools'
// Reference: https://mastra.ai/reference/tools/create-tool
//
// 2. Import the z object from 'zod'
// Reference: https://zod.dev/?id=basic-usage
//
// 3. Define a TypeScript type called DevtoArticle with the following fields:
//    - title (string)
//    - description (string)
//    - url (string)
//    - published_at (string)
//    - tag_list (array of strings)
//    - positive_reactions_count (number)
//    - comments_count (number)
//    - user (object with: name (string), username (string))
// Reference: https://www.typescriptlang.org/docs/handbook/2/objects.html
//
// 4. Create and export a constant called devtoSearchTool using createTool with:
//    a. id: 'devto-article-search'
//    b. description: 'Search DEV.to for technical articles by keyword and return titles, tags, and links'
//    c. inputSchema: a Zod object with:
//       - query: z.string().describe('Keyword or topic to search on DEV.to')
//       - limit: z.number().min(1).max(10).optional().default(5)
//    d. outputSchema: a Zod object with:
//       - articles: z.array() containing objects with:
//         - title: z.string()
//         - description: z.string()
//         - url: z.string().url()
//         - author: z.string()
//         - tags: z.string()
//         - reactions: z.number()
//         - comments: z.number()
//         - publishedAt: z.string()
//         - source: z.literal('devto')
//    e. execute: an async function that receives { context } and:
//       i.   Reads context.query and trims whitespace, store in a const called q
//       ii.  Reads context.limit with a fallback of 5
//       iii. Builds the API URL:
//            `https://dev.to/api/articles?tag=${encodeURIComponent(q)}&top=7&per_page=${limit}`
//            Note: The DEV.to API uses "tag" as the query parameter for searching.
//                  The "top=7" parameter returns articles from the last 7 days.
//       iv.  Calls fetch() with that URL, passing a header:
//            { 'User-Agent': 'mastra-trend-tracker/1.0' }
//       v.   If the response is not ok, throws an Error with the status
//       vi.  Parses the JSON response and casts it as DevtoArticle[]
//       vii. Maps over the articles to build an array of article objects:
//            - title: article.title
//            - description: article.description or 'No description'
//            - url: article.url
//            - author: article.user.name or article.user.username
//            - tags: article.tag_list joined with ', ' or 'none'
//            - reactions: article.positive_reactions_count
//            - comments: article.comments_count
//            - publishedAt: article.published_at
//            - source: 'devto' as const
//       viii. Returns { articles }
//
// Reference: https://developers.forem.com/api/v1
// Reference: https://mastra.ai/reference/tools/create-tool
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
//
// YOUR CODE STARTS HERE (Feel free to add more lines of code as needed)

import { ensureAnthropicCompatibleMessages } from '@mastra/core/agent/message-list';
import { createTool } from '@mastra/core/tools';
import { minLength, z } from 'zod';

interface DevtoArticle{
    title: string, 
	description: string, 
	url: string, 
	published_at: string, 
	tag_list: string[], 
	positive_reactions_count: number;
	comments_count: number;
	user: {
		name: string;
		username: string;
	}
}

export const devtoSearchTool = createTool({
	id: "devto-article-search", 
	description: "Search DEV.to for technical articles by keyword and return titles, tags, and links", 
	inputSchema: z.object({
		query: z.string().describe('Keyword or topic to search on DEV.to'), 
		limit: z.number().min(1).max(10).optional().default(5)
	}), 

	outputSchema: z.object({
		articles: z.array(
			z.object({
				title: z.string(), 
				description: z.string(), 
				url: z.url(), 
				author: z.string(), 
				tags: z.string(), 
				reactions: z.number(), 
				comments: z.number(), 
				publishedAt: z.string(), 
				source: z.literal('devto')
			})
		)
	}), 

	execute: async (context) => {
		const query = context.query.trim()
		const limit = context.limit ?? 5
		const url = `https://dev.to/api/articles?tag=${encodeURIComponent(query)}&top=7&per_page=${limit}`
		const response = await fetch(url, {headers: { 'User-Agent': 'mastra-trend-tracker/1.0' }})

		if (!response.ok) {
			throw new Error(`Dev.to request failed with status ${response.status}`)
		}

		let data = (await response.json()) as DevtoArticle[];

		if (data.length === 0){
			const searchUrl = url
			const searchResponse = await fetch(searchUrl, {headers: { 'User-Agent': 'mastra-trend-tracker/1.0'}, });

			if (searchResponse.ok){
				data = (await searchResponse.json()) as DevtoArticle[];
			}
		}

		const articles = data.map((article) => ({
			title: article.title, 
			desciption: article.description || "No description", 
			url: article.url, 
			author: article.user.name || article.user.username, 
			tags: article.tag_list.join(", ") || "none", 
			reactions: article.positive_reactions_count, 
			comments: article.comments_count, 
			publishedAt: article.published_at, 
			source: "devto" as const, 
		}));

		return {articles}
	}

})