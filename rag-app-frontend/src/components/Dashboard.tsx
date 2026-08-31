import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Send, FileText, LogOut, MessageSquare, Plus, Hammer, CloudUpload } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../api/client';

interface Document {
  id: number;
  filename: string;
  upload_date: string;
}

interface Message {
  text: string;
  isUser: boolean;
  sources?: string[];
}

interface ChatSession {
  id: number;
  title: string;
  created_at: string;
}

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [expandedSources, setExpandedSources] = useState<{ [key: string]: boolean }>({});
  
  const [inputMessage, setInputMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDocuments();
    fetchSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents/');
      setDocuments(res.data);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await api.get('/sessions');
      setSessions(res.data);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  };

  const loadSessionHistory = async (sessionId: number) => {
    setActiveSessionId(sessionId);
    try {
      const res = await api.get(`/sessions/${sessionId}/history`);
      const loadedMessages: Message[] = [];
      res.data.forEach((item: any) => {
        loadedMessages.push({ text: item.user_message, isUser: true });
        loadedMessages.push({ text: item.ai_response, isUser: false });
      });
      setMessages(loadedMessages);
    } catch (err) {
      console.error("Failed to load session history:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    setIsUploading(true);
    try {
      await api.post('/documents/', formData);
      fetchDocuments();
    } catch (err) {
      console.error(err);
      alert('Error uploading file');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteDoc = async (id: number) => {
    try {
      await api.delete(`/documents/${id}`);
      fetchDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = inputMessage;
    setMessages(prev => [...prev, { text: newMsg, isUser: true }]);
    setInputMessage('');
    setIsChatting(true);

    try {
      const payload: any = { message: newMsg };
      if (activeSessionId) {
        payload.session_id = activeSessionId;
      }
      
      const res = await api.post('/chat', payload);
      
      setMessages(prev => [...prev, { 
        text: res.data.response, 
        isUser: false,
        sources: res.data.sources 
      }]);

      if (res.data.session_id && res.data.session_id !== activeSessionId) {
        setActiveSessionId(res.data.session_id);
        fetchSessions();
      }

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { text: 'Error communicating with AI.', isUser: false }]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setExpandedSources({});
  };

  const toggleSource = (msgIdx: number, srcId: string | number) => {
    const key = `${msgIdx}-${srcId}`;
    setExpandedSources(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden">
      
      {/* Left Panel - Sidebar Card */}
      <div className="w-[300px] bg-slate-50 border-r border-slate-200/80 flex flex-col z-10 flex-shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all">
        
        {/* Header & New Chat Button */}
        <div className="p-6 bg-slate-50 relative">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20">
                <Hammer size={16} strokeWidth={2.5} className="text-white" />
              </div>
              <h2 className="text-[18px] font-bold tracking-tight text-slate-800">BigHammer AI</h2>
            </div>
            <button 
              onClick={handleLogout} 
              className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-slate-100 rounded-lg" 
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
          
          <button 
            onClick={handleNewChat}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-md shadow-blue-600/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus size={18} />
            <span>New Chat</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Knowledge Base Section */}
          <div className="px-6 pb-6 border-b border-slate-200/60">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Knowledge Base</h3>
            
            <label className="flex flex-col items-center justify-center space-y-1 w-full py-4 px-3 border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-xl cursor-pointer transition-all duration-200 bg-white mb-5 group shadow-sm">
              <CloudUpload size={20} className="text-slate-400 group-hover:text-indigo-500 group-hover:-translate-y-0.5 transition-all duration-200" />
              <span className="text-xs font-semibold text-slate-600 group-hover:text-indigo-700 transition-colors">
                {isUploading ? 'Uploading...' : 'Upload Document'}
              </span>
              <input type="file" className="hidden" accept=".pdf,.txt,.docx" onChange={handleFileUpload} disabled={isUploading} />
            </label>

            <div className="space-y-2">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm rounded-lg group transition-all duration-200">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="bg-indigo-50 p-1.5 rounded-md text-indigo-500">
                      <FileText size={14} />
                    </div>
                    <span className="text-[13px] text-slate-700 truncate font-medium">{doc.filename}</span>
                  </div>
                  <button onClick={() => handleDeleteDoc(doc.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded-md">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {documents.length === 0 && (
                <p className="text-center text-slate-400 text-xs mt-3 italic font-medium bg-slate-50 py-3 rounded-lg border border-slate-100">No documents uploaded.</p>
              )}
            </div>
          </div>
          
          {/* Chat Sessions Section */}
          <div className="p-6">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Chat Sessions</h3>
            <div className="space-y-1">
              {sessions.map((session) => (
                <button 
                  key={session.id} 
                  onClick={() => loadSessionHistory(session.id)}
                  className={`w-full flex items-center space-x-3 py-2.5 px-3 rounded-lg transition-all duration-200 text-left ${
                    activeSessionId === session.id 
                    ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                    : 'bg-transparent hover:bg-slate-100 text-slate-600 font-medium'
                  }`}
                >
                  <MessageSquare size={16} className={activeSessionId === session.id ? 'text-indigo-500 flex-shrink-0' : 'text-slate-400 flex-shrink-0'} />
                  <span className="text-[13px] truncate">{session.title}</span>
                </button>
              ))}
              {sessions.length === 0 && (
                <p className="text-center text-slate-400 text-xs mt-3 italic font-medium bg-slate-50 py-3 rounded-lg border border-slate-100">No past sessions.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Main Chat Workspace */}
      <div className="flex-1 flex flex-col bg-white relative">
        {/* Subtle background gradient tint */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/20 pointer-events-none" />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar z-10">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-800 max-w-md mx-auto text-center">
              <div className="w-20 h-20 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-blue-100/50">
                <MessageSquare size={36} strokeWidth={1.5} className="text-indigo-500" />
              </div>
              <h2 className="text-2xl font-bold mb-3 tracking-tight text-slate-900">Welcome to BigHammer AI</h2>
              <p className="text-slate-500 text-[15px] font-medium leading-relaxed">
                Upload a document to your knowledge base and ask a question to begin a new intelligent chat session.
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full pb-8">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} mb-8`}>
                  <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-5 md:p-6 shadow-sm ${
                    msg.isUser 
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm shadow-blue-500/10' 
                    : 'bg-white border border-slate-200/60 text-slate-800 rounded-bl-sm shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
                  }`}>
                    
                    {msg.isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed text-[15px] font-medium">{msg.text}</p>
                    ) : (
                      <div className="prose prose-slate prose-sm max-w-none prose-p:leading-relaxed prose-headings:font-semibold">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    )}
                    
                    {/* Sources Badge */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-6 pt-5 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Sources Referenced</p>
                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 transition-all duration-200 hover:border-slate-200 hover:bg-slate-50">
                          {(() => {
                            const isExpanded = expandedSources[`${idx}-combined`];
                            const combinedSources = msg.sources.join('\n\n---\n\n');
                            return (
                              <div className="flex flex-col">
                                <button 
                                  onClick={() => toggleSource(idx, 'combined')}
                                  className="text-[12px] font-semibold text-indigo-500 hover:text-indigo-700 transition-colors flex items-center w-max"
                                >
                                  {isExpanded ? 'Hide source context' : `View retrieved context (${msg.sources.length} chunks)`}
                                </button>
                                {isExpanded && (
                                  <div className="mt-4 pt-4 border-t border-slate-200/60 prose prose-xs max-w-none text-slate-500">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {combinedSources}
                                    </ReactMarkdown>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Loading Indicator */}
              {isChatting && (
                <div className="flex justify-start mb-8">
                  <div className="max-w-[75%] rounded-2xl rounded-bl-sm p-6 bg-white border border-slate-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 bg-indigo-400/80 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-indigo-400/80 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-indigo-400/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="w-full pb-8 pt-4 flex-shrink-0 z-20 px-4 md:px-8 bg-gradient-to-t from-white via-white to-transparent">
          <div className="max-w-4xl mx-auto w-full relative flex flex-col items-center">
            
            <form onSubmit={handleSendMessage} className="w-full relative flex items-center bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-full border border-slate-200 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-300 transition-all duration-300">
              <input
                type="text"
                className="flex-1 bg-transparent px-8 py-5 outline-none text-slate-800 placeholder-slate-400 text-[15px] font-medium"
                placeholder="Ask BigHammer AI..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isChatting}
              />
              <div className="pr-3 py-2 flex-shrink-0">
                <button
                  type="submit"
                  disabled={isChatting || !inputMessage.trim()}
                  className={`p-3 rounded-full transition-all duration-200 flex items-center justify-center shadow-sm ${
                    inputMessage.trim() && !isChatting 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-md hover:scale-105 active:scale-95' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send size={20} className="ml-0.5 transform -rotate-12" />
                </button>
              </div>
            </form>
            
            <div className="text-center mt-4 text-[11px] font-medium text-slate-400">
              BigHammer AI can make mistakes. Verify important information.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
