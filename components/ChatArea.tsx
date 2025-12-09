import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Document } from '../types';
import { generateRAGResponse } from '../services/gemini';

interface ChatAreaProps {
  history: ChatMessage[];
  setHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  documents: Document[];
  systemInstruction: string;
}

const ChatArea: React.FC<ChatAreaProps> = ({ history, setHistory, documents, systemInstruction }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setHistory(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const startTime = Date.now();
    const response = await generateRAGResponse(userMsg.text, documents, systemInstruction);
    const endTime = Date.now();

    const modelMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: response.text,
      timestamp: Date.now(),
      retrievedContext: response.retrievedContext,
      thinkingTime: endTime - startTime,
      feedback: null
    };

    setHistory(prev => [...prev, modelMsg]);
    setLoading(false);
  };

  const handleFeedback = (msgId: string, type: 'positive' | 'negative') => {
    setHistory(prev => prev.map(msg => 
      msg.id === msgId ? { ...msg, feedback: type } : msg
    ));
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-tl-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
        <div>
          <h2 className="text-lg font-bold text-slate-800">OmniRAG Assistant</h2>
          <p className="text-xs text-slate-500">Powered by Gemini & Simulated RAG</p>
        </div>
        <button 
          onClick={() => setHistory([])}
          className="text-xs text-red-500 hover:bg-red-50 px-3 py-1 rounded-md transition-colors"
        >
          Clear History
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <p className="text-center max-w-md">
              Ask a question based on your Knowledge Base.<br/>
              <span className="text-xs mt-2 block">Upload documents in the "Knowledge Base" tab to get started.</span>
            </p>
          </div>
        )}
        
        {history.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl w-full ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
              <div className={`p-4 rounded-xl shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-purple-600 text-white rounded-br-none' 
                  : 'bg-white border border-gray-200 text-slate-700 rounded-bl-none'
              }`}>
                {/* Message Content */}
                <div className="whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                </div>

                {/* Metadata for AI responses */}
                {msg.role === 'model' && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    
                    {/* RAG Context Visualization */}
                    {msg.retrievedContext && msg.retrievedContext.length > 0 && (
                      <div className="mb-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Retrieved Sources:</p>
                        <div className="flex flex-wrap gap-2">
                          {msg.retrievedContext.map((source, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                              {source}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-[10px] text-slate-400 flex items-center">
                        <span className="mr-3">Lat: {msg.thinkingTime}ms</span>
                        <span>Tokens: ~{Math.ceil(msg.text.length / 4)}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                         <button 
                          onClick={() => handleFeedback(msg.id, 'positive')}
                          className={`p-1 rounded hover:bg-green-50 transition-colors ${msg.feedback === 'positive' ? 'text-green-600' : 'text-slate-300'}`}
                         >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                         </button>
                         <button 
                          onClick={() => handleFeedback(msg.id, 'negative')}
                          className={`p-1 rounded hover:bg-red-50 transition-colors ${msg.feedback === 'negative' ? 'text-red-600' : 'text-slate-300'}`}
                         >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" /></svg>
                         </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-white border border-gray-200 p-4 rounded-xl rounded-bl-none shadow-sm flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question..."
            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all shadow-sm text-slate-900 placeholder-slate-400"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 top-2 p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
        <div className="mt-2 text-center">
            <p className="text-[10px] text-slate-400">
                AI can make mistakes. Please verify important information.
            </p>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;