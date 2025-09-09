import { z } from 'zod';
import { wrapToolJSONResult } from '../../common/utils.js';

const BLOCK_COLLECTION_URL = 'https://main--aem-block-collection--adobe.aem.live';
const BLOCK_COLLECTION = [
  // Boilerplate blocks (most commonly used)
  {
    name: 'hero',
    description: 'Hero treatment at the top of a page',
    js: `${BLOCK_COLLECTION_URL}/blocks/hero/hero.js`,
    css: `${BLOCK_COLLECTION_URL}/blocks/hero/hero.css`,
    html: `${BLOCK_COLLECTION_URL}/block-collection/hero`,
  },
  {
    name: 'columns',
    description: 'Flexible way to handle multi-column layouts in a responsive way',
    js: `${BLOCK_COLLECTION_URL}/blocks/columns/columns.js`,
    css: `${BLOCK_COLLECTION_URL}/blocks/columns/columns.css`,
    html: `${BLOCK_COLLECTION_URL}/block-collection/columns`,
  },
  {
    name: 'cards',
    description: 'List of cards with or without images and links',
    js: `${BLOCK_COLLECTION_URL}/blocks/cards/cards.js`,
    css: `${BLOCK_COLLECTION_URL}/blocks/cards/cards.css`,
    html: `${BLOCK_COLLECTION_URL}/block-collection/cards`,
  },

  // Block Collection blocks (commonly used but not boilerplate)
  {
    name: 'embed',
    description: 'A simple way to embed social media content into AEM pages',
    js: `${BLOCK_COLLECTION_URL}/blocks/embed/embed.js`,
    css: `${BLOCK_COLLECTION_URL}/blocks/embed/embed.css`,
    html: `${BLOCK_COLLECTION_URL}/block-collection/embed`,
  },
  {
    name: 'fragment',
    description: 'Share pieces of content across multiple pages',
    js: `${BLOCK_COLLECTION_URL}/blocks/fragment/fragment.js`,
    css: `${BLOCK_COLLECTION_URL}/blocks/fragment/fragment.css`,
    html: `${BLOCK_COLLECTION_URL}/block-collection/fragment`,
  },
  {
    name: 'table',
    description: 'A way to organize tabular data into rows and columns',
    js: `${BLOCK_COLLECTION_URL}/blocks/table/table.js`,
    css: `${BLOCK_COLLECTION_URL}/blocks/table/table.css`,
    html: `${BLOCK_COLLECTION_URL}/block-collection/table`,
  },
  {
    name: 'video',
    description: 'Display and playback videos directly from AEM',
    js: `${BLOCK_COLLECTION_URL}/blocks/video/video.js`,
    css: `${BLOCK_COLLECTION_URL}/blocks/video/video.css`,
    html: `${BLOCK_COLLECTION_URL}/block-collection/video`,
  },
  {
    name: 'accordion',
    description: 'A stack of descriptive labels that can be toggled to display related full content',
    js: `${BLOCK_COLLECTION_URL}/blocks/accordion/accordion.js`,
    css: `${BLOCK_COLLECTION_URL}/blocks/accordion/accordion.css`,
    html: `${BLOCK_COLLECTION_URL}/block-collection/accordion`,
  },
  {
    name: 'carousel',
    description: 'A dynamic display tool that smoothly transitions through a series of images with optional text content',
    js: `${BLOCK_COLLECTION_URL}/blocks/carousel/carousel.js`,
    css: `${BLOCK_COLLECTION_URL}/blocks/carousel/carousel.css`,
    html: `${BLOCK_COLLECTION_URL}/block-collection/carousel`,
  },
  {
    name: 'modal',
    description: 'A popup that appears over other site content',
    js: `${BLOCK_COLLECTION_URL}/blocks/modal/modal.js`,
    css: `${BLOCK_COLLECTION_URL}/blocks/modal/modal.css`,
    html: `${BLOCK_COLLECTION_URL}/block-collection/modal`,
  },
  {
    name: 'quote',
    description: 'A display of a quotation or a highlight of specific passage (or "pull quotes") within a document',
    js: `${BLOCK_COLLECTION_URL}/blocks/quote/quote.js`,
    css: `${BLOCK_COLLECTION_URL}/blocks/quote/quote.css`,
    html: `${BLOCK_COLLECTION_URL}/block-collection/quote`,
  },
  {
    name: 'search',
    description: 'Allows users to find site content by entering a search term',
    js: `${BLOCK_COLLECTION_URL}/blocks/search/search.js`,
    css: `${BLOCK_COLLECTION_URL}/blocks/search/search.css`,
    html: `${BLOCK_COLLECTION_URL}/block-collection/search`,
  },
  {
    name: 'tabs',
    description: 'Segment information into multiple labeled (or "tabbed") panels',
    js: `${BLOCK_COLLECTION_URL}/blocks/tabs/tabs.js`,
    css: `${BLOCK_COLLECTION_URL}/blocks/tabs/tabs.css`,
    html: `${BLOCK_COLLECTION_URL}/block-collection/tabs`,
  },
  {
    name: 'form',
    description: 'A set of input controls grouped together that enables users to submit information (Deprecated)',
    js: `${BLOCK_COLLECTION_URL}/blocks/form/form.js`,
    css: `${BLOCK_COLLECTION_URL}/blocks/form/form.css`,
    html: `${BLOCK_COLLECTION_URL}/block-collection/form`,
  },
];

export const blockListTool = {
  name: 'block-list',
  config: {
    title: 'AEM Block Collection - BlockList',
    description: `
    <use_case>
      Use this tool to retrieve a list of all available blocks in the AEM block collection. The results will include 
      the names and basic information about each available block.
      
      **When to use this tool:**
      - You need to see what blocks are available in the collection
      - You want to browse the available block options
      - You're looking for a specific type of block
    </use_case>

    <important_notes>
      1. This tool returns a list of all available blocks, not the details of individual blocks.
      2. Use the block-details tool to get specific information about a particular block.
    </important_notes>
  `,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  handler: async () => {
    return wrapToolJSONResult(BLOCK_COLLECTION.map((block) => ({
      name: block.name,
      description: block.description,
    })));
  },
};

export const blockDetailsTool = {
  name: 'block-details',
  config: {
    title: 'AEM Block Collection - Block Details',
    description: `
    <use_case>
      Use this tool to retrieve detailed information about a specific block in the AEM block collection. The results 
      will include the block's code, description, and other relevant details.
      
      **When to use this tool:**
      - You need detailed information about a specific block
      - You want to see the code and implementation of a block
      - You need to understand how a block works
      - You're looking for block metadata and configuration options
    </use_case>

    <important_notes>
      3. The blockName must match exactly with an available block from the block collection.
      4. Use the block-list tool first to see what blocks are available, or ask the user to provide the block name.
    </important_notes>
  `,
    inputSchema: {
      blockName: z.string().describe('The name of the block to retrieve details for'),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  handler: async ({ blockName }) => {
    const blockInfo = BLOCK_COLLECTION.find((block) => block.name === blockName);
    if (!blockInfo) {
      throw new Error(`Block ${blockName} not found`);
    }

    const [js, css, html] = await Promise.all([
      fetch(blockInfo.js).then((res) => res.text()),
      fetch(blockInfo.css).then((res) => res.text()),
      fetch(blockInfo.html).then((res) => res.text()),
    ]);

    return wrapToolJSONResult({
      name: blockInfo.name,
      description: blockInfo.description,
      js,
      css,
      html,
    });
  },
};
