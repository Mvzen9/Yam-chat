import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  currentUserId: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn, currentUserId }) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageIcon = () => {
    if (isOwn) {
      return message.isRead ? (
        <CheckCheck className="w-4 h-4 text-text-primary-dark dark:text-text-primary-light" />
      ) : (
        <Check className="w-4 h-4 text-text-primary-dark dark:text-text-primary-light" />
      );
    }
    return null;
  };

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl transition-colors duration-300 ${
          isOwn
            ? 'bg-primary-light dark:bg-primary-dark text-text-primary-dark dark:text-text-primary-light rounded-br-sm'
            : 'bg-secondary-light dark:bg-secondary-dark text-text-primary-light dark:text-text-primary-dark rounded-bl-sm'
        }`}
      >
        <p className="text-sm font-sans">{message.text}</p>
        <div className={`flex items-center justify-end mt-1 space-x-1 ${
          isOwn ? 'text-text-primary-dark/70 dark:text-text-primary-light/70' : 'text-text-secondary-light/70 dark:text-text-secondary-dark/70'
        }`}>
          <span className="text-xs font-sans">{formatTime(message.sentAt)}</span>
          {getMessageIcon()}
        </div>
      </div>
    </div>
  );
};