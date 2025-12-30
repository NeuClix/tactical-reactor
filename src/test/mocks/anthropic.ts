import { vi } from 'vitest'

// Mock Claude API response
export const mockClaudeResponse = {
  id: 'msg_123',
  type: 'message',
  role: 'assistant',
  content: [
    {
      type: 'text',
      text: 'This is a mock response from Claude.',
    },
  ],
  model: 'claude-3-5-haiku-20241022',
  stop_reason: 'end_turn',
  usage: {
    input_tokens: 50,
    output_tokens: 100,
  },
}

// Create mock Anthropic client
export function createMockAnthropicClient() {
  return {
    messages: {
      create: vi.fn().mockResolvedValue(mockClaudeResponse),
    },
  }
}

// Mock Anthropic instance
export const mockAnthropic = createMockAnthropicClient()

// Helper to create custom responses
export function createMockClaudeResponse(text: string, tokens = { input: 50, output: 100 }) {
  return {
    id: `msg_${Date.now()}`,
    type: 'message',
    role: 'assistant',
    content: [
      {
        type: 'text',
        text,
      },
    ],
    model: 'claude-3-5-haiku-20241022',
    stop_reason: 'end_turn',
    usage: {
      input_tokens: tokens.input,
      output_tokens: tokens.output,
    },
  }
}
