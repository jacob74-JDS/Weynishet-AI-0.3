
import React from 'react';
import type { Message } from '../types';
import { IconRobot } from './icons';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  const containerClasses = `flex items-start gap-3 my-4 ${isUser ? 'justify-end' : ''}`;
  const messageBoxClasses = `max-w-xl p-4 rounded-2xl ${
    isUser
      ? 'bg-blue-600 text-white rounded-br-none'
      : 'bg-gray-700 text-gray-200 rounded-bl-none'
  }`;

  return (
    <div className={containerClasses}>
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border-2 border-blue-500">
          <IconRobot className="w-6 h-6 text-blue-400" />
        </div>
      )}
      <div className={messageBoxClasses}>
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  );
};
