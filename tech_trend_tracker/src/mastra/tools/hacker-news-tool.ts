/**
 *  In this task you will build a Mastra tool that fetches the current
 *  top stories from Hacker News and returns their titles, scores,
 *  and links.
 *
 *  The Hacker News API is completely free and requires no authentication.
 *  It exposes story IDs at one endpoint and individual item details at
 *  another, so the tool needs to make multiple fetch calls.
 */

// TODO:
// Task 1 – Hacker News Top Stories Tool
//
// EXAMPLE IMPLEMENTATION (from the lesson):
//   In the Science Chat project you saw how createTool is used together
//   with a Zod input/output schema and an async execute function that
//   calls a public API. Use that same pattern here.
//
// 1. Import the createTool function from '@mastra/core/tools'
// Reference: https://mastra.ai/docs/agents/using-tools
//
// 2. Import the z object from 'zod' (used to define input and output schemas)
// Reference: https://zod.dev/?id=basic-usage
//
// 3. Define a TypeScript type called HackerNewsItem with the following fields:
//    - id (number)
//    - title (optional string)
//    - url (optional string)
//    - score (optional number)
//    - by (optional string)            – the author's username
//    - time (optional number)          – Unix timestamp
//    - descendants (optional number)   – comment count
// Reference: https://www.typescriptlang.org/docs/handbook/2/objects.html
//
// 4. Create and export a constant called hackerNewsTopTool using createTool with:
//    a. id: 'hacker-news-top'
//    b. description: 'Fetch the current top stories from Hacker News and return titles, scores, and links'
//    c. inputSchema: a Zod object with:
//       - limit: z.number().min(1).max(15).optional().default(5)
//                .describe('Number of top stories to return (1-15)')
//    d. outputSchema: a Zod object with:
//       - stories: z.array() containing objects with:
//         - title: z.string()
//         - url: z.string()
//         - score: z.number()
//         - author: z.string()
//         - commentCount: z.number()
//         - hnLink: z.string().url()
//         - source: z.literal('hackernews')
//    e. execute: an async function that receives { context } and:
//       i.   Reads context.limit with a fallback of 5, store in a const called limit
//       ii.  Fetches the top story IDs from:
//            'https://hacker-news.firebaseio.com/v0/topstories.json'
//       iii. If the response is not ok, throws an Error with the status
//       iv.  Parses the JSON response and casts it as c
//       v.   Slices the array to the first `limit` items, store as topIds
//       vi.  Uses Promise.all to fetch each story's details in parallel:
//            For each id in topIds, fetch:
//            `https://hacker-news.firebaseio.com/v0/item/${id}.json`
//            and cast each response as HackerNewsItem
//       vii. Maps over the fetched items to build an array of story objects:
//            - title: item.title or 'Untitled'
//            - url: item.url or '' (some stories are text-only "Ask HN" posts)
//            - score: item.score or 0
//            - author: item.by or 'unknown'
//            - commentCount: item.descendants or 0
//            - hnLink: `https://news.ycombinator.com/item?id=${item.id}`
//            - source: 'hackernews' as const
//       viii. Returns { stories }
//
// Reference: https://github.com/HackerNews/API (official HN API docs)
// Reference: https://mastra.ai/docs/agents/using-tools
// Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
//
// YOUR CODE STARTS HERE (Feel free to add more lines of code as needed)


import { contextFields } from '@mastra/core/storage';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface HackerNewsItem {
    id: number;
    title?: string;
    url?: string;
    score?: number;
    by?: string;
    time?: number;
    descendants?: number;
}

export const hackerNewsTopTool = createTool({
    id: "hacker-news-top", 
    description: "Fetch the current top stories from Hacker News and return titles, scores, and links", 
    inputSchema: z.object({
        limit: z.number().min(1).max(15).optional().default(5).describe('Number of top stories to return (1-15)'), 
    }), 

    outputSchema: z.object({
        stories: z.array(
            z.object({
                title: z.string(), 
                url: z.url(), 
                score: z.number(), 
                author: z.string(), 
                commentCount: z.number(), 
                hnLink: z.url(), 
                source: z.literal("hackernews")
            })
        )
    }), 
    execute: async (context) => {
        const limit = context.limit ?? 5
        const response = await fetch(`https://hacker-news.firebaseio.com/v0/topstories.json`)
        
        if (!response.ok){
            throw new Error(`Hacker News top stories request failed with status ${response.status}`)
        }

        const allIds = (await response.json()) as number[];
        const topIds = allIds.slice(0, limit);
        const items = await Promise.all(
            topIds.map(async (id) => {
                const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
                return (await res.json()) as HackerNewsItem;
            }),
        );

        const stories = items.map((item) => ({
            title: item.title ?? 'Untitled', 
            url: item.url ?? '', 
            score: item.score ?? 0, 
            author: item.by ?? "unknown", 
            commentCount: item.descendants ?? 0, 
            hnLink: `https://news.ycombinator.com/item?id=${item.id}`, 
            source: 'hackernews' as const
        }))

        return {stories}
    }
})