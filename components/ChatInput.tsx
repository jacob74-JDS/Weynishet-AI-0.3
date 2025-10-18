
import React, { useState, useRef } from 'react';
import { IconMicrophone, IconPlayerStop, IconSend } from './icons';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  isListening,
  startListening,
  stopListening
}) => {
  const [text, setText] = useState('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (text.trim()) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleVoiceClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  return (
    <div className="bg-gray-800 p-4 border-t border-gray-700">
      <div className="relative max-w-4xl mx-auto">
        <textarea
          ref={textAreaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening..." : "Ask Weynishet about trading, IT, or marketing..."}
          className="w-full bg-gray-700 text-white rounded-lg p-4 pr-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
          rows={1}
          disabled={isLoading || isListening}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
                onClick={handleVoiceClick}
                disabled={isLoading}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-500'} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {isListening ? <IconPlayerStop className="w-6 h-6 text-white" /> : <IconMicrophone className="w-6 h-6 text-white" />}
            </button>
            <button
                onClick={handleSend}
                disabled={isLoading || isListening || !text.trim()}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <IconSend className="w-6 h-6 text-white" />
            </button>
        </div>
      </div>
    </div>
  );
};
