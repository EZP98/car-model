#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

// API configuration
const API_URL = process.env.API_URL || 'http://localhost:8787';
const API_KEY = process.env.API_KEY || '';

// Helper to make API calls
async function apiCall(endpoint: string, options: any = {}) {
  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
}

// Create server instance
const server = new Server(
  {
    name: 'alf-portfolio-translations',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_items_missing_translations',
        description: 'Lists all items (exhibitions, collections, critics) that have missing translations. Shows which translations are incomplete.',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['exhibitions', 'collections', 'critics', 'all'],
              description: 'Type of items to check. Use "all" to check everything.',
            },
          },
          required: ['type'],
        },
      },
      {
        name: 'get_item_for_translation',
        description: 'Gets a specific item with all its Italian (source) content ready for translation. Returns the Italian texts that need to be translated.',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['exhibition', 'collection', 'critic'],
              description: 'Type of the item',
            },
            id: {
              type: 'number',
              description: 'ID of the item',
            },
          },
          required: ['type', 'id'],
        },
      },
      {
        name: 'update_item_translations',
        description: 'Updates translations for a specific item. Provide the translated texts for each language.',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['exhibition', 'collection', 'critic'],
              description: 'Type of the item',
            },
            id: {
              type: 'number',
              description: 'ID of the item to update',
            },
            translations: {
              type: 'object',
              description: 'Object containing all translations. Keys should be like "title_en", "description_es", etc.',
            },
          },
          required: ['type', 'id', 'translations'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'list_items_missing_translations') {
      const type = (args as any).type;
      const results: any = {};

      // Fetch items based on type
      if (type === 'exhibitions' || type === 'all') {
        const data: any = await apiCall('/api/exhibitions');
        results.exhibitions = data.exhibitions.map((item: any) => ({
          id: item.id,
          title: item.title,
          date: item.date,
          missingFields: getMissingTranslations(item, 'exhibition'),
        })).filter((item: any) => item.missingFields.length > 0);
      }

      if (type === 'collections' || type === 'all') {
        const data: any = await apiCall('/api/collections?all=true');
        results.collections = data.collections.map((item: any) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          missingFields: getMissingTranslations(item, 'collection'),
        })).filter((item: any) => item.missingFields.length > 0);
      }

      if (type === 'critics' || type === 'all') {
        const data: any = await apiCall('/api/critics');
        results.critics = data.critics.map((item: any) => ({
          id: item.id,
          name: item.name,
          role: item.role,
          missingFields: getMissingTranslations(item, 'critic'),
        })).filter((item: any) => item.missingFields.length > 0);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    }

    if (name === 'get_item_for_translation') {
      const { type, id } = args as any;
      let data;
      let endpoint;

      if (type === 'exhibition') {
        endpoint = `/api/exhibitions/${id}`;
      } else if (type === 'collection') {
        endpoint = `/api/collections/${id}`;
      } else if (type === 'critic') {
        endpoint = `/api/critics/${id}`;
      } else {
        throw new Error('Invalid type');
      }

      data = await apiCall(endpoint);
      const item = (data as any).exhibition || (data as any).collection || (data as any).critic;

      // Extract Italian (source) content
      const sourceContent = extractSourceContent(item, type);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              id: item.id,
              type,
              sourceContent,
              missingTranslations: getMissingTranslations(item, type),
            }, null, 2),
          },
        ],
      };
    }

    if (name === 'update_item_translations') {
      const { type, id, translations } = args as any;
      let endpoint;

      if (type === 'exhibition') {
        endpoint = `/api/exhibitions/${id}`;
      } else if (type === 'collection') {
        endpoint = `/api/collections/${id}`;
      } else if (type === 'critic') {
        endpoint = `/api/critics/${id}`;
      } else {
        throw new Error('Invalid type');
      }

      const result = await apiCall(endpoint, {
        method: 'PUT',
        body: JSON.stringify(translations),
      });

      return {
        content: [
          {
            type: 'text',
            text: `Successfully updated translations for ${type} ID ${id}`,
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Helper functions
function getMissingTranslations(item: any, type: string): string[] {
  const languages = ['en', 'es', 'fr', 'ja', 'zh', 'zh_tw'];
  const missing: string[] = [];

  if (type === 'exhibition') {
    const fields = ['title', 'subtitle', 'description', 'location', 'info'];
    for (const lang of languages) {
      for (const field of fields) {
        const key = `${field}_${lang}`;
        if (!item[key]) {
          missing.push(key);
        }
      }
    }
  } else if (type === 'collection') {
    const fields = ['title', 'description'];
    for (const lang of languages) {
      for (const field of fields) {
        const key = `${field}_${lang}`;
        if (!item[key]) {
          missing.push(key);
        }
      }
    }
  } else if (type === 'critic') {
    const fields = ['text'];
    for (const lang of languages) {
      for (const field of fields) {
        const key = `${field}_${lang}`;
        if (!item[key]) {
          missing.push(key);
        }
      }
    }
  }

  return missing;
}

function extractSourceContent(item: any, type: string): any {
  const content: any = {};

  if (type === 'exhibition') {
    content.title = item.title_it || item.title;
    content.subtitle = item.subtitle_it || item.subtitle;
    content.description = item.description_it || item.description;
    content.location = item.location_it || item.location;
    content.info = item.info_it || item.info;
  } else if (type === 'collection') {
    content.title = item.title_it || item.title;
    content.description = item.description_it || item.description;
  } else if (type === 'critic') {
    content.text = item.text_it || item.text;
  }

  return content;
}

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('ALF Portfolio Translations MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
