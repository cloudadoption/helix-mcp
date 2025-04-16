import { z } from 'zod';
import { daAdminRequest, daAdminResponseFormat, formatURL } from '../common/utils.js';
export const ListSourcesSchema = z.object({
  org: z.string().describe('The organization'),
  repo: z.string().describe('Name of the repository'),
  path: z.string().describe('Path to the source content')
});

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