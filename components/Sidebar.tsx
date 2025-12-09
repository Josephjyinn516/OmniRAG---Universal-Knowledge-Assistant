import React from 'react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const menuItems = [
    { id: ViewState.CHAT, label: 'Chat Assistant', icon: '💬' },
    { id: ViewState.KNOWLEDGE_BASE, label: 'Knowledge Base', icon: '📚' },
    { id: ViewState.EVALUATION, label: 'Evaluation Metrics', icon: '📊' },
    { id: ViewState.SETTINGS, label: 'Pipeline Settings', icon: '⚙️' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen border-r border-slate-700">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          OmniRAG
        </h1>
        <p className="text-xs text-slate-400 mt-1">Universal RAG Assistant</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentView === item.id 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-semibold text-slate-300">System Status: Online</span>
          </div>
          <div className="text-xs text-slate-500">
            Model: Gemini 2.5 Flash
            <br/>
            Pipeline: RAG Enabled
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;