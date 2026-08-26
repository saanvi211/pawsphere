import React, { useState } from 'react';
import { MessageSquare, X, Send, AlertTriangle, Stethoscope, HelpCircle } from 'lucide-react';
import { Animal } from '../../types/animal';

interface FloatingAIChatbotProps {
  animal: Animal | null;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isMedical?: boolean;
}

export const FloatingAIChatbot: React.FC<FloatingAIChatbotProps> = ({ animal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I am your PawSphere AI Companion. Ask me anything about feeding, training, behavior, or first aid. How can I help you today?`
    }
  ]);
  const [inputText, setInputText] = useState('');

  const suggestionChips = [
    { text: 'Is chocolate bad for dogs?', isMedical: true },
    { text: 'How often should cats get Rabies shots?', isMedical: false },
    { text: 'First Aid: Bleeding Paw', isMedical: true },
    { text: 'Safe temperature for Bearded Dragon', isMedical: false },
    { text: 'What do baby birds eat?', isMedical: false }
  ];

  const handleSendMessage = (text: string, isFromChip = false) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: 'u-' + Date.now(),
      sender: 'user',
      text
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // AI Response Simulation with Medical Safety Checks
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      const isMedQuery = 
        lowerText.includes('chocolate') || 
        lowerText.includes('bleeding') || 
        lowerText.includes('blood') || 
        lowerText.includes('vomit') || 
        lowerText.includes('fever') || 
        lowerText.includes('lethargic') || 
        lowerText.includes('poison') || 
        lowerText.includes('hurt') || 
        lowerText.includes('pain') ||
        lowerText.includes('first aid') ||
        lowerText.includes('accident') ||
        lowerText.includes('wound');

      let reply = '';
      if (isMedQuery) {
        reply = `🩺 **First-Aid Guidance**:
1. Keep your pet calm and restricted. Do not feed or administer human medication.
2. If bleeding, apply gentle pressure with a clean cloth.
3. If they ingested something toxic (like chocolate or onions), gather the packing label.

🏥 **Nearest Emergency Veterinary Care Contact**:
- **PawSphere 24/7 ER Clinic**: +1 (555) 999-1122 (1.2 km away, Bengaluru Main Rd)
- **Animal Health Rescue Vet**: +1 (555) 777-3300 (2.5 km away)

⚠️ **Cautionary Disclaimer**: This AI response is for emergency first-aid reference only and may not be 100% accurate. Do not delay professional veterinary treatment. Contact a licensed veterinarian immediately!`;
      } else {
        if (lowerText.includes('rabies') || lowerText.includes('vaccin')) {
          reply = `💉 **Vaccination Tip**: Puppies and kittens start core vaccines (Rabies, DHPP/FVRCP) at 6-8 weeks, followed by booster shots every 1 to 3 years depending on local laws. Consult your vet to verify.`;
        } else if (lowerText.includes('temperature') || lowerText.includes('reptile') || lowerText.includes('dragon')) {
          reply = `🦎 **Reptile Care Tip**: Bearded dragons need a temperature gradient. Keep the hot basking spot at 38°C to 40°C, and the cool zone at 26°C. Provide UV lighting 10-12 hours daily.`;
        } else {
          reply = `🐾 **Care Suggestion**: Ensure your pet has access to fresh water, a balanced diet tailored to their age, and daily physical exercise (at least 30 minutes for dogs). Let me know if you want breed-specific tips!`;
        }
      }

      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: reply,
        isMedical: isMedQuery
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 850);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-brand-solidOrange text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all border-4 border-white focus:outline-none cursor-pointer relative"
          title="Open AI Chatbot"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          
          {/* Active indicator dot */}
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-solidGreen rounded-full border-2 border-white animate-ping"></span>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-solidGreen rounded-full border-2 border-white"></span>
        </button>
      </div>

      {/* Chat window Overlay */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[360px] sm:w-[400px] h-[500px] bg-white rounded-3xl border-4 border-brand-solidBlue shadow-2xl flex flex-col overflow-hidden z-50 animate-fadeIn text-xs">
          
          {/* Chat Window Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b-2 border-slate-700">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-brand-solidOrange text-white flex items-center justify-center font-bold">
                AI
              </div>
              <div>
                <h4 className="font-extrabold tracking-tight">PawSphere Companion</h4>
                <p className="text-[9px] text-slate-400 font-semibold uppercase">Real-Time First Aid & Care Advisor</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Viewport */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed font-semibold ${
                    m.sender === 'user'
                      ? 'bg-brand-solidBlue text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border-2 border-slate-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                  
                  {m.isMedical && (
                    <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded-lg text-[10px] text-red-700 flex items-start space-x-1.5 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                      <span>Warning: AI recommendations do not replace immediate veterinary intervention.</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Suggestion Chips */}
          <div className="p-2 border-t border-slate-100 bg-white overflow-x-auto flex space-x-1.5 whitespace-nowrap scrollbar-none">
            {suggestionChips.map((chip, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(chip.text, true)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-brand-lightBlue hover:text-brand-solidBlue border border-slate-200 rounded-full text-[10px] font-bold transition-all text-slate-700"
              >
                {chip.text}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="p-3 border-t-2 border-slate-200 bg-white flex gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about first aid, symptoms, diet..."
              className="flex-1 bg-slate-100 border-2 border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-brand-solidBlue"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-3.5 rounded-xl bg-brand-solidBlue text-white font-bold flex items-center justify-center hover:bg-brand-darkBlue disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
