import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { daAdminRequest, daAdminResponseFormat, formatURL } from '../common/utils.js';

export const ListSourcesSchema = z.object({
  org: z.string().describe('The organization'),
  repo: z.string().describe('Name of the repository'),
  path: z.string().describe('Path to the folder')
});

export const ListToolsDefinition = [{
  name: "da_admin_list_sources",
  description: "Returns a list of sources inside a folder from an organization",
  inputSchema: zodToJsonSchema(ListSourcesSchema),
}];

export async function listSources(org, repo, path) {
  try {
    const url = formatURL('list', org, repo, path);
    const result = await daAdminRequest(url);
    return daAdminResponseFormat(result);
  } catch (error) {
    console.error(error);
    throw error;
  }
} 