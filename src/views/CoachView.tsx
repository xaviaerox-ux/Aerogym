import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Loader2, Sparkles, Dumbbell, Zap } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AppState } from '../types';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface CoachViewProps {
  state: AppState;
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;


export default function CoachView({ state }: CoachViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `¡Hola ${state.profile.name}! Soy tu entrenador Aero. He revisado tus datos: estás en nivel ${state.profile.level} con objetivo de ${state.profile.goal}. ¿En qué puedo ayudarte hoy con tu entrenamiento o nutrición?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const generatePromptContext = () => {
    const { profile, sessions } = state;
    const lastSession = sessions[0];
    
    return `
      Eres Aero, un entrenador personal de élite, experto en biomecánica and nutrición deportiva. 
      CONTEXTO DEL USUARIO:
      - Nombre: ${profile.name}
      - Objetivo: ${profile.goal}
      - Nivel: ${profile.level}
      - Peso: ${profile.weight}kg, Altura: ${profile.height}cm, Edad: ${profile.age}
      - Actividad: ${profile.activityLevel}
      - Historial: ${sessions.length} entrenamientos registrados.
      ${lastSession ? `- Último entrenamiento: ${lastSession.name} el ${new Date(lastSession.date).toLocaleDateString()}. Volumen total: ${lastSession.totalVolume}kg.` : ''}

      INSTRUCCIONES:
      - Sé directo, motivador y científico. 
      - Usa emojis relacionados con el fitness (💪, 🏋️‍♂️, ⚡).
      - Tus respuestas deben ser breves y optimizadas para leer en móvil.
      - Si te preguntan por ejercicios, sugiere variantes basadas en su nivel.
    `;
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping || !genAI) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      const chat = model.startChat({
        history: [
          { role: "user", parts: [{ text: generatePromptContext() }] },
          { role: "model", parts: [{ text: "Entendido. Soy Aero, estoy listo para guiarte." }] },
          ...messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          }))
        ]
      });



      const result = await chat.sendMessage(userMsg);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Lo siento, mi conexión con los servidores de alto rendimiento se ha interrumpido. ¿Podemos intentarlo de nuevo?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!API_KEY) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
           <Zap size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">IA no configurada</h2>
          <p className="text-slate-400 text-sm">Para activar a Aero, necesitas añadir tu <code className="bg-white/10 px-1 rounded">GEMINI_API_KEY</code> en el archivo <code className="bg-white/10 px-1 rounded">.env.local</code>.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[78vh] flex flex-col -mx-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-blue/10 blur-[100px] pointer-events-none" />

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"
      >
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              "flex w-full mb-4",
              msg.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "max-w-[85%] p-4 rounded-2xl relative shadow-lg",
              msg.role === 'user' 
                ? "bg-brand-blue text-slate-950 rounded-tr-none font-medium" 
                : "glass-dark border border-white/10 rounded-tl-none text-slate-100"
            )}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="glass-dark border border-white/10 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-brand-blue" />
              <span className="text-xs text-slate-400 font-medium">Aero está pensando...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
           {['Duda sobre técnica', 'Plan de hoy', 'Cambiar ejercicio'].map(s => (
             <button 
              key={s}
              onClick={() => setInput(s)}
              className="whitespace-nowrap px-3 py-1.5 glass-dark border border-white/5 rounded-full text-[10px] uppercase tracking-wider font-bold text-slate-400 hover:text-brand-blue transition-colors"
             >
              {s}
             </button>
           ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-slate-900/50 backdrop-blur-xl border-t border-white/5">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pregúntame lo que quieras..."
            className="w-full bg-slate-800/80 border border-white/10 rounded-2xl pl-4 pr-14 py-4 text-sm outline-none focus:ring-2 ring-brand-blue/30 transition-all placeholder:text-slate-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={cn(
              "absolute right-2 p-2.5 rounded-xl transition-all",
              input.trim() && !isTyping ? "bg-brand-blue text-slate-950 shadow-lg shadow-brand-blue/20" : "bg-slate-700 text-slate-500"
            )}
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[9px] text-center text-slate-600 mt-2 uppercase tracking-tighter">
          Powered by Gemini AI • Entrenador Aero v1.0
        </p>
      </div>
    </div>
  );
}
