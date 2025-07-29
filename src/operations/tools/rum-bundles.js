/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import { z } from 'zod';
import { wrapToolJSONResult } from '../../common/utils.js';
import { getAllBundles } from '../../common/bundles.js';

function removeProtocol(url) {
  return url.replace(/^https?:\/\//, '');
}

function getDefaultDates() {
  const now = new Date();
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);

  const format = (d) => d.toISOString().split('T')[0]; // YYYY-MM-DD
  return {
    start: format(oneWeekAgo),
    end: format(now),
  };
}

const rumDataTool = {
  name: 'rum-data',
  config: {
    title: 'Operational Telemetry Data Query Using URL and Date',
    description: `
        <use_case>
        Use this tool to retrieve Core Web Vitals (CWV) and engagement metrics for a given site or page. 
        The results provide performance insights across various aggregation types and are scoped to specific paths when applicable.

        - **aggregation**: Metric to aggregate by. Must be one of the following:
            - "pageviews" (returns the **sum** of pageviews)
            - "visits" (returns the **sum** of visits)
            - "bounces" (returns the **sum** of bounces)
            - "organic" (returns the **sum** of organic traffic)
            - "earned" (returns the **sum** of earned traffic)
            - "lcp" (Largest Contentful Paint, returns the **p75** value)
            - "cls" (Cumulative Layout Shift, returns the **p75** value)
            - "inp" (Interaction to Next Paint, returns the **p75** value)
            - "ttfb" (Time to First Byte, returns the **p75** value)
            - "engagement" (custom engagement score, returns the **p75** value)
            - "errors" (pages and the errors on them)

        - **url**: Target URL to analyze. If the URL contains a non-empty path (e.g., "/product/123"), results are scoped to that specific path only.
        </use_case>

        <important_notes>
        - The **domainkey** must be provided. If you're not seeing any data, visit:
        https://aemcs-workspace.adobe.com/customer/generate-rum-domain-key

        - If the URL contains a protocol (e.g., "https://" or "http://"), always **strip the protocol** and pass only the hostname + path. 
        Example: convert \`https://www.example.com/page\` to \`www.example.com/page\`

        - When handling the data, the agent must be **extremely accurate and careful**. The insights from this tool are used to **drive key operational decisions**, so **misreporting or inaccuracies are not acceptable**.

        - If no dates are specified, the tool will not pass any dates so the function will use the default dates.
        
        - **CRITICAL**: When presenting the results, you MUST always include the date range that was queried. State clearly: "This data covers the period from [start date] to [end date]" in your response.
        </important_notes>
    `,
    inputSchema: {
      url: z.string().describe('The full URL to get data for, including path if needed'),
      domainkey: z.string().describe('The domain key used for authorization and bundle access'),
      startdate: z.string().optional().describe('Start date in YYYY-MM-DD format'),
      enddate: z.string().optional().describe('End date in YYYY-MM-DD format'),
      aggregation: z.enum([
        'pageviews',
        'visits',
        'bounces',
        'organic',
        'earned',
        'lcp',
        'cls',
        'inp',
        'ttfb',
        'engagement',
        'errors',
      ]).describe('The metric to extract from the rum bundle data'),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },

  handler: async ({ url, domainkey, startdate, enddate, aggregation }) => {
    const domain = removeProtocol(url);
    const { start, end } = getDefaultDates();

    // Default to one week ago to today if no dates are provided
    const startDateFinal = startdate?.trim() || start;
    const endDateFinal = enddate?.trim() || end;

    const result = await getAllBundles(domain, domainkey, startDateFinal, endDateFinal, aggregation);
    
    // Include date range in the response
    return wrapToolJSONResult({
      ...result,
      dateRange: {
        start: startDateFinal,
        end: endDateFinal
      }
    });
  }
};

export default rumDataTool;