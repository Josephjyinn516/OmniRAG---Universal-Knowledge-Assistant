import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { EvaluationMetric } from '../types';

interface EvaluationDashboardProps {
  metrics: EvaluationMetric[];
}

const EvaluationDashboard: React.FC<EvaluationDashboardProps> = ({ metrics }) => {
  const chartData = metrics.map(m => ({
    name: m.name,
    score: m.value * 100 // Convert 0-1 to 0-100 for display
  }));

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Pipeline Evaluation</h2>
        <p className="text-slate-500 mt-1">Real-time metrics on RAG performance and output quality.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-slate-700 text-sm">{metric.name}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${metric.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {metric.trend === 'up' ? '▲ Improving' : '► Stable'}
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-slate-900">{metric.name === 'User Satisfaction' ? metric.value : (metric.value * 100).toFixed(1) + '%'}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">{metric.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Metric Comparison</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={60}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'][index % 4]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6">
          <h4 className="font-semibold text-blue-900 mb-2">Automated Evaluation Framework (RAGAS)</h4>
          <p className="text-sm text-blue-800 leading-relaxed">
            The system employs the RAGAS framework to automatically evaluate each interaction. 
            <strong>Faithfulness</strong> checks if the answer is derived from the context. 
            <strong>Answer Relevancy</strong> measures vector similarity between query and response. 
            <strong>Context Precision</strong> evaluates the ranking quality of retrieved documents.
          </p>
      </div>
    </div>
  );
};

export default EvaluationDashboard;