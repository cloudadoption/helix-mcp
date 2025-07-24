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

const rumDataTool = {
  name: 'rum-data',
  config: {
    title: 'Get RUM Data statitsics by URL and Date Range',
    description: `
        <use_case>
        Use this tool to retrieve Core Web Vitals (CWV) and engagement metrics using rum-distiller bundles for a given site or page. 
        The results provide performance insights across various aggregation types and are scoped to specific paths when applicable.

        - **aggregation**: Metric to aggregate by. Must be one of the following:
            - "pageviews"
            - "visits"
            - "bounces"
            - "organic"
            - "earned"
            - "lcp" (Largest Contentful Paint)
            - "cls" (Cumulative Layout Shift)
            - "inp" (Interaction to Next Paint)
            - "ttfb" (Time to First Byte)
            - "engagement" (custom engagement score)

        - **url**: Target URL to analyze. If the URL contains a non-empty path (e.g., "/product/123"), results are scoped to that specific path only.
        - **from/to**: Start and end dates for the desired reporting window.
        - **data_source**: Metrics are derived from daily rum-distiller bundles collected during the specified date range.
        </use_case>
  `,
    inputSchema: {
        url: z.string().describe('The full URL to get data for, including path if needed'),
        domainkey: z.string().describe('The domain key used for authorization and bundle access'),
        startdate: z.string().describe('Start date in YYYY-MM-DD format'),
        enddate: z.string().describe('End date in YYYY-MM-DD format'),
        aggregation: z
        .enum([
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
        ])
        .describe('The metric to extract from the rum bundle data'),
    },
    annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
    },
  },
  handler: async ({ url, domainkey, startdate, enddate, aggregation, }) => {
    const resp = await getAllBundles(url, domainkey, startdate, enddate, aggregation);
    return wrapToolJSONResult(resp)
    }   
}

export default rumDataTool;