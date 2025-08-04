export type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  type?: 'text' | 'markdown' | 'list';
  suggestions?: string[];
};

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  mode: 'general' | 'spiritual';
};
