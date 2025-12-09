export interface Document {
  id: string;
  title: string;
  type: 'PDF' | 'Markdown' | 'Text';
  content: string;
  uploadDate: string;
  active: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  retrievedContext?: string[]; // Snippets used for RAG
  thinkingTime?: number; // Simulated latency or actual thinking time
  feedback?: 'positive' | 'negative' | null;
}

export interface EvaluationMetric {
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

export enum ViewState {
  CHAT = 'CHAT',
  KNOWLEDGE_BASE = 'KNOWLEDGE_BASE',
  EVALUATION = 'EVALUATION',
  SETTINGS = 'SETTINGS'
}

export interface AppState {
  view: ViewState;
  documents: Document[];
  chatHistory: ChatMessage[];
  isThinking: boolean;
  systemInstruction: string;
}
