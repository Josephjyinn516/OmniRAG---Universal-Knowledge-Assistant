import React, { useState, useRef } from 'react';
import { Document } from '../types';

interface KnowledgeBaseProps {
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ documents, setDocuments }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newDocContent, setNewDocContent] = useState('');
  const [newDocTitle, setNewDocTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddDocument = () => {
    if (!newDocContent || !newDocTitle) return;

    const newDoc: Document = {
      id: Date.now().toString(),
      title: newDocTitle,
      type: newDocTitle.toLowerCase().endsWith('.pdf') ? 'PDF' : 'Text',
      content: newDocContent,
      uploadDate: new Date().toISOString().split('T')[0],
      active: true
    };

    setDocuments([...documents, newDoc]);
    setNewDocContent('');
    setNewDocTitle('');
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      // Dynamic import to avoid initial load crashes if module resolution fails
      // @ts-ignore
      const pdfjsLib = await import('https://esm.sh/pdfjs-dist@3.11.174');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      // Limit to first 50 pages to ensure good performance while capturing most content
      const maxPages = Math.min(pdf.numPages, 50);
      
      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += `--- Page ${i} ---\n${pageText}\n\n`;
      }
      return fullText;
    } catch (error) {
      console.error("PDF Parse Error:", error);
      throw new Error("Failed to parse PDF. Please try copying text manually.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setNewDocTitle(file.name);

    try {
      if (file.type === 'application/pdf') {
        const text = await extractTextFromPDF(file);
        setNewDocContent(text);
      } else {
        // Fallback for text files
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result;
          if (typeof text === 'string') {
            setNewDocContent(text);
          }
        };
        reader.readAsText(file);
      }
    } catch (err) {
      console.error(err);
      setNewDocContent("Error reading file. Please try copy-pasting the content.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleDocStatus = (id: string) => {
    setDocuments(documents.map(d => d.id === id ? { ...d, active: !d.active } : d));
  };

  const deleteDoc = (id: string) => {
      setDocuments(documents.filter(d => d.id !== id));
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Knowledge Base</h2>
          <p className="text-slate-500 mt-1">Manage documents used for RAG context retrieval.</p>
        </div>
        <button
          onClick={() => setIsUploading(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center shadow-md transition-all"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Document
        </button>
      </div>

      {isUploading && (
        <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-purple-100 animate-fade-in-down">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Ingest New Document</h3>
          
          {/* File Upload Area */}
          <div className="mb-6 p-8 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 text-center hover:bg-slate-100 transition-colors relative group">
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".txt,.md,.json,.csv,.log,.pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="file-upload"
            />
            <div className="flex flex-col items-center justify-center pointer-events-none">
                {isProcessing ? (
                   <div className="flex flex-col items-center">
                     <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                     <p className="text-sm font-medium text-purple-600">Extracting text from document...</p>
                   </div>
                ) : (
                  <>
                    <svg className="w-10 h-10 text-slate-400 mb-3 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm font-medium text-slate-700">
                        <span className="text-purple-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Supported: PDF, .txt, .md, .json</p>
                  </>
                )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Document Title</label>
              <input 
                type="text" 
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-900"
                placeholder="e.g., Q3 Project Report, Employee Handbook..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Content Preview / Edit</label>
              <textarea 
                value={newDocContent}
                onChange={(e) => setNewDocContent(e.target.value)}
                rows={8}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-xs leading-relaxed text-slate-900"
                placeholder="File content will appear here automatically after upload. You can also paste text directly."
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button 
                onClick={() => {
                    setIsUploading(false);
                    setNewDocContent('');
                    setNewDocTitle('');
                    setIsProcessing(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddDocument}
                disabled={!newDocTitle || !newDocContent || isProcessing}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 shadow-md shadow-purple-200"
              >
                Process & Ingest
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {documents.map((doc) => (
          <div key={doc.id} className={`bg-white p-5 rounded-xl border transition-all hover:shadow-md ${doc.active ? 'border-gray-200' : 'border-gray-100 bg-gray-50 opacity-75'}`}>
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${doc.active ? 'bg-purple-50 text-purple-600' : 'bg-gray-200 text-gray-500'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{doc.title}</h3>
                  <div className="flex items-center space-x-3 mt-1 text-sm text-slate-500">
                    <span className="uppercase text-xs font-bold tracking-wider bg-slate-100 px-2 py-0.5 rounded">{doc.type}</span>
                    <span>•</span>
                    <span>Ingested: {doc.uploadDate}</span>
                    <span>•</span>
                    <span>{doc.content.length} chars</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                 <button 
                    onClick={() => toggleDocStatus(doc.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${doc.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                 >
                    {doc.active ? 'Active' : 'Inactive'}
                 </button>
                 <button 
                    onClick={() => deleteDoc(doc.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove from knowledge base"
                 >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                 </button>
              </div>
            </div>
            {/* Preview of content */}
            <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm text-slate-600 font-mono overflow-hidden h-20 relative">
                {doc.content}
                <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-slate-50 to-transparent"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeBase;