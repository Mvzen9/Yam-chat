import React from 'react';
import { User as UserIcon, Circle } from 'lucide-react';
import { User } from '../types';

interface ConversationListItemProps {
  user: User;
  isSelected: boolean;
  isOnline: boolean;
  onClick: () => void;
  lastMessage?: string;
}

export const ConversationListItem: React.FC<ConversationListItemProps> = ({
  user,
  isSelected,
  isOnline,
  onClick,
  lastMessage,
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center p-3 rounded-lg mb-1 transition-colors duration-300 
        ${isSelected 
          ? 'bg-secondary-light dark:bg-secondary-dark' 
          : 'hover:bg-background-light dark:hover:bg-background-dark'}`}
    >
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-r from-primary-light to-primary-dark dark:from-primary-dark dark:to-primary-light rounded-full flex items-center justify-center">
          <span className="text-text-primary-dark dark:text-text-primary-light font-medium">
            {user.displayName?.[0]?.toUpperCase() || user.userName[0]?.toUpperCase()}
          </span>
        </div>
        {/* Online/offline indicator removed */}
      </div>
      
      <div className="ml-3 flex-1 text-left">
        <div className="font-sans font-bold text-text-primary-light dark:text-text-primary-dark">
          {user.displayName || user.userName}
        </div>
        {lastMessage && (
          <div className="text-sm font-sans text-text-secondary-light dark:text-text-secondary-dark truncate max-w-[180px]">
            {lastMessage}
          </div>
        )}
        {/* Online/offline status text removed */}
      </div>
    </button>
  );
};