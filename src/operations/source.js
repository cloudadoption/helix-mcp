import { z } from 'zod';
import { daAdminRequest, daAdminResponseFormat, formatURL } from '../common/utils.js';

const GetSourceSchema = z.object({
  org: z.string().describe('The organization'),
  repo: z.string().describe('Name of the repository'),
  path: z.string().describe('Path to the source content'),
  ext: z.string().describe('The source content file extension: html or json'),
});

const CreateSourceSchema = z.object({
  org: z.string().describe('The organization'),
  repo: z.string().describe('Name of the repository'),
  path: z.string().describe('Path to the source content'),
  ext: z.string().describe('The source content file extension: html or json'),
  content: z.string().describe(`
    If extension is html: an html string using the following template: "<body><header></header><main><!-- content here --></main><footer></footer></body>". Only <main> should be populated with content.
    If extension is json: a json string representing a spreadsheet which can have multiple sheets. Each sheet can have an array of rows (represented as a data property). Each row can have as many cells as needed. A cell is a key / value pair. Simple sample: 
    {
      "sheet1": {
        "total": 2,
        "data": [{
          "column1": "value11",
          "column2": "value12",
          "column3": "value13"
        },
        {
          "column1": "value21",
          "column2": "value22",
          "column3": "value23"
        }],
      },
      ":names": [
        "sheet1"
      ],
      ":type": "multi-sheet"
    }
  `),
});

const DeleteSourceSchema = z.object({
  org: z.string().describe('The organization'),
  repo: z.string().describe('Name of the repository'),
  path: z.string().describe('Path to the source content'),
  ext: z.string().describe('The source content file extension: html or json'),
});

async function getSource(org, repo, path, ext) {
  try {
    const url = formatURL('source', org, repo, path, ext);
    const data = await daAdminRequest(url);
    return daAdminResponseFormat(data);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function createSource(org, repo, path, ext, content) {
  try {
    const url = formatURL('source', org, repo, path, ext);
    const body = new FormData();
    const type = ext === 'html' ? 'text/html' : 'application/json';
    const blob = new Blob([content], { type });
    body.set('data', blob);
    
    const data = await daAdminRequest(url, {
      method: 'POST',
      body,
    });
    return daAdminResponseFormat(data);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function deleteSource(org, repo, path, ext) {
  try {
    const url = formatURL('source', org, repo, path, ext);
    const data = await daAdminRequest(url, {
      method: 'DELETE'
    });
    return daAdminResponseFormat(data);
  } catch (error) {
    console.error(error);
    throw error;
  }
} 

export const tools = [{
  name: "da_admin_get_source",
  description: "Get source content from an organization: can be an html file or a json file",
  schema: GetSourceSchema,
  handler: async (args) => {
    return getSource(args.org, args.repo, args.path, args.ext);
  }
}, {
  name: "da_admin_create_source",
  description: "Create source content within an organization: can be an html file or a json file",
  schema: CreateSourceSchema,
  handler: async (args) => {
    return createSource(args.org, args.repo, args.path, args.ext, args.content);
  }
}, {
  name: "da_admin_delete_source",
  description: "Delete source content from an organization: can be an html file or a json file",
  schema: DeleteSourceSchema,
  handler: async (args) => {
    return deleteSource(args.org, args.repo, args.path, args.ext);
  }
}];