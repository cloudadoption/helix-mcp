import { z } from 'zod';
import { wrapToolJSONResult } from '../../common/utils.js';

function findResults(query, indexDocs) {
  // split the query into terms, trimming and filtering out 1-2 letter and unhelpful words
  const filterOut = ['and', 'but', 'can', 'eds', 'for', 'how', 'the', 'use', 'what', 'aem'];
  const terms = query.toLowerCase().split(' ').map((e) => e.trim()).filter((e) => e.length > 2 && !filterOut.includes(e));
  if (!terms.length) return { terms, match: [] }; // eject if no valid search terms

  // Search through faq and index docs and return both matches
  const perfectMatches = new Set();
  const strongMatches = new Set();
  const fallbackMatches = new Set();

  indexDocs.forEach((doc) => {
    if (terms.every((term) => doc.title.toLowerCase().includes(term))) {
      perfectMatches.add(doc);
    } else if (terms.some((term) => doc.title.toLowerCase().includes(term))) {
      strongMatches.add(doc);
    } else if (terms.some((term) => `${doc.title} ${doc.content}`.toLowerCase().includes(term))) {
      fallbackMatches.add(doc);
    }
  });

  const matches = [...perfectMatches, ...strongMatches, ...fallbackMatches];
  return { terms, match: matches };
}

async function indexDataToResult(match) {

  let markup;
  const fullUrl = `https://www.aem.live${match.path}`;
  try {
    const resp = await fetch(fullUrl);
    markup = await resp.text();
  } catch {
    // nothing
  }

  return {
    title: match.title,
    description: match.description,
    url: `https://www.aem.live${match.path}`,
    content: markup || match.content,
    lastModified: match.lastModified,
  };
}

const aemDocsSearchTool = {
  name: 'aem-docs-search',
  config: {
    title: 'AEM Documentation Search',
    description: `
    <use_case>
      Use this tool to search the AEM documentation at www.aem.live for specific topics, features, or guidance.
      
      **When to use this tool:**
      - You need to find documentation about specific AEM features or capabilities
      - You're looking for guidance on implementing particular functionality
      - You want to understand how to use specific AEM components or services
      - You need troubleshooting information or best practices
      - You're searching for code examples or configuration details
    </use_case>

    <important_notes>
      1. This tool searches the official AEM documentation at www.aem.live
      2. Search results will include relevant documentation pages, guides, and examples
      3. For best results, search with just a few specific keywords rather than a phrase or sentence
      4. The tool returns documentation URLs and relevant content snippets
      5. Results are limited to publicly available AEM documentation
    </important_notes>
  `,
    inputSchema: {
      query: z.string().describe('The search query to find relevant AEM documentation'),
      maxResults: z.number().min(1).max(20).default(10).describe('Maximum number of search results to return (1-20)'),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  handler: async ({ query, maxResults }) => {
    try {
      // Construct the search URL for AEM documentation
      const indexUrl = 'https://www.aem.live/docpages-index.json';

      const response = await fetch(indexUrl);
      const data = await response.json();

      const { terms, match } = findResults(query, data.data);

      const results = await Promise.all(match.slice(0, maxResults).map(indexDataToResult));

      const searchResults = {
        searchQuery: query,
        searchTerms: terms,
        totalCount: match.length,
        results,
      };

      return wrapToolJSONResult(searchResults);
    } catch (error) {
      return wrapToolJSONResult({
        error: 'Failed to perform AEM documentation search',
        message: error.message,
        searchQuery: query,
      });
    }
  },
};

export default aemDocsSearchTool;
