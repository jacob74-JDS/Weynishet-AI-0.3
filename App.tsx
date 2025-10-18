
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Message } from './types';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import * as geminiService from './services/geminiService';
import { decode, decodeAudioData } from './services/audioUtils';
import { IconRobot } from './components/icons';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial', text: "Hello! I'm Weynishet. How can I assist you with trading, IT, or digital marketing today?", sender: 'ai' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { isListening, transcript, startListening, stopListening, hasRecognitionSupport, error: recognitionError } = useSpeechRecognition();
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    geminiService.startChat();
    // Create AudioContext after a user gesture (e.g., a click) to comply with browser autoplay policies.
    // We create it here on mount and assume user will interact. It can be moved to the first user interaction if needed.
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isListening && transcript) {
        handleSendMessage(transcript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, transcript]);

  const playAudio = useCallback(async (base64Audio: string) => {
    if (!audioContextRef.current) return;
    
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    
    try {
      const audioBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start();
    } catch (e) {
        console.error("Error playing audio:", e);
    }
  }, []);
  
  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const aiResponseText = await geminiService.sendMessage(text);
      const aiMessage: Message = { id: (Date.now() + 1).toString(), text: aiResponseText, sender: 'ai' };
      setMessages(prev => [...prev, aiMessage]);
      
      const audioData = await geminiService.textToSpeech(aiResponseText);
      if (audioData) {
        await playAudio(audioData);
      }
    } catch (error) {
      console.error(error);
      const errorMessage: Message = { id: (Date.now() + 1).toString(), text: "I'm sorry, I couldn't process your request.", sender: 'ai' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, playAudio]);

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <header className="bg-gray-800/50 backdrop-blur-sm p-4 border-b border-gray-700 shadow-lg sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-center text-white flex items-center justify-center gap-2">
            <IconRobot className="w-8 h-8 text-blue-400"/>
            Weynishet AI Assistant
        </h1>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 my-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border-2 border-blue-500">
                    <IconRobot className="w-6 h-6 text-blue-400" />
                </div>
                <div className="max-w-xl p-4 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                </div>
            </div>
          )}
          {recognitionError && <p className="text-red-400 text-center">{recognitionError}</p>}
          {!hasRecognitionSupport && <p className="text-yellow-400 text-center">Speech recognition is not supported by your browser.</p>}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        isListening={isListening}
        startListening={startListening}
        stopListening={stopListening}
      />
    </div>
  );
};

export default App;
