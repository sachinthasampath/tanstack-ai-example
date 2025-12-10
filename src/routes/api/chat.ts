import { chat, toStreamResponse, toolDefinition } from '@tanstack/ai'
import { gemini } from '@tanstack/ai-gemini'
import { openai } from '@tanstack/ai-openai'

import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

export const Route = createFileRoute('/api/chat')({
  server: { handlers: { POST } },
})

export async function POST({ request }: { request: Request }) {
  if (!process.env.GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({
        error: 'GEMINI_API_KEY not configured',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  const { messages, conversationId } = await request.json()

  try {
    const stream = chat({
      adapter: gemini(),
      messages,
      model: 'gemini-2.5-flash',
      tools: [getTodosTool, updateCounterToolDef],
      conversationId,
    })

    return toStreamResponse(stream)
  } catch (error) {
    console.error(error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An error occurred',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}

const getTodosToolDef = toolDefinition({
  description: 'Fetch a list of todos from the database',
  inputSchema: z.object({
    query: z
      .string()
      .optional()
      .describe('An optional search query to filter todos'),
  }),
  outputSchema: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      completed: z.boolean(),
      userId: z.number(),
    }),
  ),
  name: 'get_todos',
})

const getTodosTool = getTodosToolDef.server(async ({ query }) => {
  const url = new URL('https://jsonplaceholder.typicode.com/todos')
  if (query) url.searchParams.set('q', query)
  console.log(url.toString())

  const response = await fetch(url.toString())
  return await response.json()
})

export const updateCounterToolDef = toolDefinition({
  name: 'set_count',
  description: 'Set the counter value stored in the browser',
  inputSchema: z.object({
    count: z.number().describe('The new counter value to set'),
  }),
  outputSchema: z.object({ success: z.boolean() }),
})
