import { z } from 'zod';
import { daAdminRequest, daAdminResponseFormat } from '../common/utils.js';

export const GetSourceSchema = z.object({
  org: z.string().describe('The organization'),
  repo: z.string().describe('Name of the repository'),
  path: z.string().describe('Path to the source content'),
  ext: z.string().describe('The source content file extension')
});

export const CreateSourceSchema = z.object({
  org: z.string().describe('The organization'),
  repo: z.string().describe('Name of the repository'),
  path: z.string().describe('Path to the source content'),
  ext: z.string().describe('The source content file extension'),
  content: z.string().describe('An html string using the following template: "<body><header></header><main><!-- content here --></main><footer></footer></body>". Only <main> should be populated with content.'),
});

export const DeleteSourceSchema = z.object({
  org: z.string().describe('The organization'),
  repo: z.string().describe('Name of the repository'),
  path: z.string().describe('Path to the source content'),
  ext: z.string().describe('The source content file extension')
});

export async function getSource(org, repo, path, ext) {
  try {
    const url = `https://admin.da.live/source/${org}/${repo}/${path}.${ext}`;
    const data = await daAdminRequest(url);
    return daAdminResponseFormat(data);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createSource(org, repo, path, ext, content) {
  try {
    const url = `https://admin.da.live/source/${org}/${repo}/${path}.${ext}`;
    const body = new FormData();
    const blob = new Blob([content], { type: 'text/html' });
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

export async function deleteSource(org, repo, path, ext) {
  try {
    const url = `https://admin.da.live/source/${org}/${repo}/${path}.${ext}`;
    const data = await daAdminRequest(url, {
      method: 'DELETE'
    });
    return daAdminResponseFormat(data);
  } catch (error) {
    console.error(error);
    throw error;
  }
} 