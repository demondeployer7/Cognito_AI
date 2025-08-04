import type { ChatSession, Message } from './types';

export const mockChatSessions: ChatSession[] = [
  {
    id: 'chat-1',
    title: 'Spiritual Guidance',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    mode: 'spiritual',
    messages: [
      { id: '1-1', role: 'user', content: 'What is the meaning of life?' },
      {
        id: '1-2',
        role: 'assistant',
        type: 'markdown',
        content:
          "The meaning of life is a profound question pondered by philosophers and theologians for millennia. A common spiritual perspective suggests that life's meaning is found in seeking connection with a higher power, living with compassion, and fulfilling a unique purpose. \n\n> *\"The purpose of life is not to be happy. It is to be useful, to be honorable, to be compassionate, to have it make some difference that you have lived and lived well.\"* - Ralph Waldo Emerson",
        suggestions: ['Tell me more about compassion.', 'What is my purpose?'],
      },
    ],
  },
  {
    id: 'chat-2',
    title: 'Drafting an email',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    mode: 'general',
    messages: [
      { id: '2-1', role: 'user', content: 'Help me draft an email to my team about the new project timeline.' },
      {
        id: '2-2',
        role: 'assistant',
        type: 'markdown',
        content:
          "Of course! Here is a draft you can use:\n\n**Subject: Update on New Project Timeline**\n\nHi Team,\n\nI'm writing to share an update on the timeline for our upcoming project, [Project Name]. After reviewing our resources and dependencies, we've made some adjustments to the key milestones:\n\n- **Phase 1 (Discovery & Planning):** [New End Date]\n- **Phase 2 (Development & Implementation):** [New End Date]\n- **Phase 3 (Testing & QA):** [New End Date]\n- **Launch:** [New Launch Date]\n\nPlease review the updated timeline and let me know if you have any questions or concerns. Your hard work and flexibility are greatly appreciated.\n\nBest,\n\n[Your Name]",
      },
    ],
  },
];

export const quickActions = {
  general: [
    'Write a poem about the moon',
    'Explain quantum computing simply',
    'Summarize the plot of Hamlet',
    'Give me a recipe for chocolate chip cookies',
  ],
  spiritual: [
    'What is mindfulness?',
    'Share a verse about hope',
    'Explain the concept of karma',
    'Guide me through a short meditation',
  ],
};

export function getMockResponse(input: string, mode: 'general' | 'spiritual'): Message {
  const lowerInput = input.toLowerCase();
  
  if (mode === 'spiritual') {
    if (lowerInput.includes('hope')) {
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        type: 'markdown',
        content: 'Of course. Here is a verse about hope:\n\n> *For I know the plans I have for you,” declares the LORD, “plans to prosper you and not to harm you, plans to give you hope and a future.* - Jeremiah 29:11',
        suggestions: ['Explain this verse.', 'Show me another one about faith.'],
      };
    }
  }

  if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: 'Hello! How can I assist you today?',
    };
  }

  return {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: `I'm a mock assistant. I received your message: "${input}". Since this is a test, I can't fully process this, but here's a generic response.`,
    suggestions: ['What can you do?', 'Tell me a joke.'],
  };
}
