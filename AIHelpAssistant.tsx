
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const AIHelpAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Namaste! I am your Policy & Concept Guide. Ask me about our "Earn & Learn" mechanics or how to create high-impact tasks.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: `You are the "Hindu Network Policy Assistant".
          Your goal is to explain the "Earn and Learn" portal mechanics.
          1. POLICY: 1 COIN = 1 INR. 
          2. EARN: Users earn by winning reverse auctions (bidding low to get work).
          3. LEARN: High-value tasks involve Digital Sales, Research, and Lead Gen.
          4. ACCESS: 1 COIN is charged every 100 seconds of screentime to maintain professional commitment.
          5. TASK CONCEPTS: Suggest tasks like 'Social Media Lead Sourcing', 'Cold Outreach Support', or 'Data Verification'.
          Be professional, helpful, and concise.`,
        },
      });

      setMessages(prev => [...prev, { role: 'assistant', text: response.text || 'I encountered a network issue. Please check the policy handbook.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Market engine is busy. Please try again later.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-[100]">
      {isOpen ? (
        <div className="bg-white w-[350px] md:w-[400px] h-[500px] rounded-[32px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-scaleIn">
          <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-lg">
                <i className="fa-solid fa-om"></i>
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest">Policy Assistant</h3>
                <p className="text-[8px] text-orange-400 font-bold uppercase tracking-widest">Earn & Learn Guide</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                  m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none text-slate-400 animate-pulse">
                  <i className="fa-solid fa-ellipsis"></i>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-50 bg-slate-50 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask about policy or tasks..."
              className="flex-grow bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-orange-500"
            />
            <button 
              onClick={handleSend}
              className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-orange-600 transition-colors"
            >
              <i className="fa-solid fa-paper-plane text-xs"></i>
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-slate-900 hover:bg-orange-600 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all hover:scale-110 active:scale-95 group relative"
        >
          <i className="fa-solid fa-message group-hover:animate-bounce"></i>
          <span className="absolute -top-2 -left-2 bg-orange-600 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase border-2 border-white shadow-md animate-pulse">Ask AI</span>
        </button>
      )}
    </div>
  );
};

export default AIHelpAssistant;
