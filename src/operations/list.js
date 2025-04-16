import { z } from 'zod';
import { daAdminRequest, daAdminResponseFormat, formatURL } from '../common/utils.js';

const ListSourcesSchema = z.object({
  org: z.string().describe('The organization'),
  repo: z.string().describe('Name of the repository'),
  path: z.string().describe('Path to the folder')
});

async function listSources(org, repo, path) {
  try {
    const url = formatURL('list', org, repo, path);
    const result = await daAdminRequest(url);
    return daAdminResponseFormat(result);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const tools = [{
  name: "da_admin_list_sources",
  description: "Returns a list of sources inside a folder from an organization",
  schema: ListSourcesSchema,
  handler: async (args) => {
    return listSources(args.org, args.repo, args.path);
  }
}];