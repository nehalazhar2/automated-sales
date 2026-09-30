// Fired by FaqAsk's "Continue in chat" to hand a Q&A over to ChatWidget.
export const CHAT_OPEN_EVENT = 'as-chat:open';
export type ChatOpenDetail = { messages: { role: 'user' | 'assistant'; content: string }[] };
