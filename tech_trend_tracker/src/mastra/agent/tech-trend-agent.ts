
// TODO:
// Task 4 – Tech Trend Tracker Agent
//
// 1. Import the Agent class from '@mastra/core/agent'
// Reference: https://mastra.ai/docs/agents/overview
//
// 2. Import the Memory class from '@mastra/memory'
// Reference: https://mastra.ai/docs/memory/overview
//
// 3. Import the LibSQLStore class from '@mastra/libsql'
// Reference: https://mastra.ai/docs/storage/libsql
//
// 4. Import the three tools you created in the previous tasks:
//    a. hackerNewsTopTool   from '../tools/hacker-news-tool'
//    b. githubSearchTool    from '../tools/github-search-tool'
//    c. devtoSearchTool     from '../tools/devto-search-tool'
// Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
//
// 5. Create and export a constant called `techTrendAgent` using new Agent({ ... }) with:
//    a. name: 'Tech Trend Tracker'
//    b. instructions: a template literal string (backtick string) that tells the agent:
//       - It helps users discover and explore current trends in the technology industry.
//       - When a user asks about a trend, topic, or technology it should:
//         * Use the Hacker News tool to surface what the community is discussing right now.
//         * Use the GitHub search tool to find popular open-source projects on the topic.
//         * Use the DEV.to tool to find recent developer articles and tutorials.
//       - It should present findings in clearly organized sections:
//         * Hacker News (current buzz), GitHub Repositories (popular projects),
//           and DEV.to Articles (recent write-ups).
//       - Each item should include a title, one-sentence summary, and a link.
//       - It should highlight star counts, scores, or reaction counts where available.
//       - It should be concise and factual.
//    c. model: 'mistral/mistral-medium-2508'
//    d. tools: an object containing the three imported tools:
//       { hackerNewsTopTool, githubSearchTool, devtoSearchTool }
//    e. memory: a new Memory instance configured with:
//       - storage: a new LibSQLStore with url set to 'file:../mastra.db'
//         (the path is relative to the .mastra/output directory)
//
// Reference: https://mastra.ai/docs/agents/overview
// Reference: https://mastra.ai/docs/memory/overview
//
// YOUR CODE STARTS HERE (Feel free to add more lines of code as needed)

import {Agent} from "@mastra/core/agent"
import {Memory} from "@mastra/memory";
import {LibSQLStore} from "@mastra/libsql"
import {hackerNewsTopTool} from "../tools/hacker-news-tool";
import {gitHubSearchTool} from "../tools/github-search-tool";
import {devtoSearchTool} from "../tools/devto-search-tool";

// type | interface | schema | objects | class | class object | blueprints

export const techTrendAgent = new Agent({
	id: "tech-trend-tracker",
	name: "Tech Trend Tracker", 
	instructions: `You help users discover and explore current trends in the technology industry.
    - When a user asks about a trend, topic, or technology you should:
      * Use the Hacker News tool to surface what the community is discussing right now.
      * Use the GitHub search tool to find popular open-source projects on the topic.
      * Use the DEV.to tool to find recent developer articles and tutorials.
    - You should present findings in clearly organized sections:
      * Hacker News (current buzz), GitHub Repositories (popular projects),
        and DEV.to Articles (recent write-ups).
    - Each item should include a title, one-sentence summary, and a link.
    - You should highlight star counts, scores, or reaction counts where available.
    - You should be concise and factual.`, 
	model: "mistral/mistral-medium-2508", 
	tools: {hackerNewsTopTool, gitHubSearchTool, devtoSearchTool}, 
	memory: new Memory({
		storage: new LibSQLStore({
			id: "tech-trend-storage", 
			url: "file:../mastra.db"
		})
	})
})