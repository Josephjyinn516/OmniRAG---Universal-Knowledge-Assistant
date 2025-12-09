import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Document } from "../types";

// Initialize Gemini Client
// NOTE: In a real production app, you might proxy this through a backend.
// For this portfolio demo, we use the environment variable directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const BASE_SYSTEM_INSTRUCTION = `You are an expert Knowledge Assistant named OmniRAG. 
Your goal is to answer user queries accurately based ONLY on the provided context from the knowledge base. 
If the answer is not in the context, politely state that you do not have that information in your knowledge base.
Maintain a professional, helpful, and concise tone.
Avoid hallucinations. Always cite the specific document title if possible when answering.
`;

export const generateRAGResponse = async (
  query: string,
  documents: Document[],
  customInstruction?: string
): Promise<{ text: string; retrievedContext: string[] }> => {
  
  // 1. Simulate Retrieval (Client-side Vector Search Simulation)
  // Normalization: Lowercase and remove special chars to improve matching
  const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, '');
  const normalizedQuery = normalize(query);
  
  // Improved Tokenization:
  // - Allow words length >= 2 to capture acronyms like "TNG", "AI", "HR"
  const keywords = normalizedQuery.split(/\s+/).filter(w => w.length >= 2);
  
  const activeDocs = documents.filter(d => d.active);
  
  // Keyword Matching
  const scoredDocs = activeDocs.map(doc => {
    let score = 0;
    const normalizedContent = normalize(doc.content);
    const normalizedTitle = normalize(doc.title);

    // Exact phrase match bonus
    if (normalizedContent.includes(normalizedQuery)) score += 10;
    if (normalizedTitle.includes(normalizedQuery)) score += 20;

    keywords.forEach(kw => {
      // Content match
      if (normalizedContent.includes(kw)) score += 1;
      // Title match (higher weight)
      if (normalizedTitle.includes(kw)) score += 3;
    });
    
    // Recency bias: slightly boost newly uploaded docs
    const dateScore = new Date(doc.uploadDate).getTime();
    
    return { doc, score, dateScore };
  });

  // Sort by score first, then by date if scores are tied/low
  scoredDocs.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.dateScore - a.dateScore;
  });

  // Smart Selection:
  let topDocs = scoredDocs.filter(i => i.score > 0).slice(0, 5).map(i => i.doc);
  
  // FALLBACK STRATEGY:
  // If keyword matching fails (score 0) OR we have very few matches, 
  // but there ARE active documents, we should aggressively include them 
  // to ensure the LLM has context. This is crucial for small knowledge bases (Context Stuffing).
  if (topDocs.length === 0 && activeDocs.length > 0) {
      console.log("RAG: No strict keyword matches. Falling back to all active documents (Context Stuffing).");
      // Take up to 5 most recent documents, regardless of score
      topDocs = scoredDocs.slice(0, 5).map(i => i.doc);
  }

  const contextSnippets = topDocs.map(d => `Source: ${d.title}\nContent: ${d.content}`);

  // 2. Construct Prompt
  const contextBlock = contextSnippets.length > 0 
    ? `CONTEXT:\n${contextSnippets.join('\n\n---\n\n')}`
    : `CONTEXT: No relevant documents found in knowledge base.`;

  const finalSystemInstruction = customInstruction || BASE_SYSTEM_INSTRUCTION;

  const fullPrompt = `
${contextBlock}

USER QUERY: ${query}

RESPONSE:
`;

  try {
    // 3. Generate Content
    // We use gemini-2.5-flash for speed and efficiency in RAG tasks
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: fullPrompt }] }
      ],
      config: {
        systemInstruction: finalSystemInstruction,
        temperature: 0.3, // Lower temperature for factual RAG responses
      }
    });

    return {
      text: response.text || "I apologize, but I couldn't generate a response based on the available context.",
      retrievedContext: topDocs.map(d => d.title)
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "Error generating response. Please check your API key or network connection.",
      retrievedContext: []
    };
  }
};