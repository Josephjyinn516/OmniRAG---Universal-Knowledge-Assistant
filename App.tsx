import React, { useState } from 'react';
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import KnowledgeBase from './components/KnowledgeBase';
import EvaluationDashboard from './components/EvaluationDashboard';
import { ViewState, Document, ChatMessage } from './types';
import { MOCK_DOCUMENTS, INITIAL_METRICS } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.CHAT);
  const [documents, setDocuments] = useState<Document[]>(MOCK_DOCUMENTS);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [systemInstruction, setSystemInstruction] = useState(`You are an expert Knowledge Assistant.`);

  const renderContent = () => {
    switch (currentView) {
      case ViewState.CHAT:
        return (
          <ChatArea 
            history={chatHistory} 
            setHistory={setChatHistory} 
            documents={documents}
            systemInstruction={systemInstruction}
          />
        );
      case ViewState.KNOWLEDGE_BASE:
        return (
          <KnowledgeBase 
            documents={documents} 
            setDocuments={setDocuments} 
          />
        );
      case ViewState.EVALUATION:
        return (
          <EvaluationDashboard 
            metrics={INITIAL_METRICS} 
          />
        );
      case ViewState.SETTINGS:
        return (
            <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Pipeline Settings</h2>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
                    <label className="block text-sm font-medium text-slate-700 mb-2">System Persona / Prompt Template</label>
                    <textarea 
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 min-h-[150px]"
                        value={systemInstruction}
                        onChange={(e) => setSystemInstruction(e.target.value)}
                    />
                    <div className="mt-4 flex justify-end">
                        <button className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-700">Save Configuration</button>
                    </div>
                </div>
            </div>
        );
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <Layout
      sidebar={
        <Sidebar 
          currentView={currentView} 
          onChangeView={setCurrentView} 
        />
      }
      content={renderContent()}
    />
  );
};

export default App;