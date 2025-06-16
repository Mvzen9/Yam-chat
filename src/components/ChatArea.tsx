import React, { useState, useEffect, useRef } from 'react';
import { Send, Clock } from 'lucide-react';
import { Message, User } from '../types';
import { chatAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { MessageBubble } from './MessageBubble';

interface ChatAreaProps {
  selectedUser: User | null;
  messages: Message[];
  onSendMessage: (text: string, recipientId: string) => void;
  onMarkAsRead: (messageId: number) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  selectedUser,
  messages,
  onSendMessage,
  onMarkAsRead,
}) => {
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mark unread messages as read when chat is opened
    if (selectedUser && currentUser) {
      const unreadMessages = messages.filter(
        msg => !msg.isRead && msg.senderId === selectedUser.id && msg.recipientId === currentUser.id
      );
      
      unreadMessages.forEach(msg => {
        onMarkAsRead(msg.id);
      });
    }
  }, [selectedUser, messages, currentUser, onMarkAsRead]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUser || !currentUser) return;

    const text = messageText.trim();
    setMessageText('');
    setIsLoading(true);

    try {
      await onSendMessage(text, selectedUser.id);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessageText(text); // Restore message text on error
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getMessageIcon = (message: Message) => {
    if (message.senderId === currentUser?.id) {
      return message.isRead ? (
        <CheckCheck className="w-4 h-4 text-blue-500" />
      ) : (
        <Check className="w-4 h-4 text-gray-400" />
      );
    }
    return null;
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.sentAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-background-dark transition-colors duration-300">
        <div className="text-center">
          <div className="w-16 h-16 bg-secondary-light dark:bg-secondary-dark rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
            <Send className="w-8 h-8 text-primary-light dark:text-primary-dark" />
          </div>
          <h3 className="text-lg font-sans font-bold text-text-primary-light dark:text-text-primary-dark mb-2 transition-colors duration-300">Select a conversation</h3>
          <p className="font-sans text-text-secondary-light dark:text-text-secondary-dark transition-colors duration-300">Choose a contact to start messaging</p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark transition-colors duration-300">
      {/* Header */}
      <div className="bg-secondary-light dark:bg-secondary-dark border-b border-primary-light dark:border-primary-dark p-4 transition-colors duration-300">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-light to-primary-dark dark:from-primary-dark dark:to-primary-light rounded-full flex items-center justify-center">
            <span className="text-text-primary-dark dark:text-text-primary-light font-medium font-sans">
              {selectedUser.displayName?.[0]?.toUpperCase() || selectedUser.userName[0]?.toUpperCase()}
            </span>
          </div>
          <div className="ml-3">
            <h3 className="font-sans font-bold text-text-primary-light dark:text-text-primary-dark">
              {selectedUser.displayName || selectedUser.userName}
            </h3>
            <p className="text-sm font-sans text-text-secondary-light dark:text-text-secondary-dark">
              {selectedUser.email}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background-light dark:bg-background-dark transition-colors duration-300">
        {Object.entries(messageGroups).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-secondary-light dark:bg-secondary-dark px-3 py-1 rounded-full transition-colors duration-300">
                <span className="text-xs font-sans text-text-secondary-light dark:text-text-secondary-dark">{formatDate(date)}</span>
              </div>
            </div>

            {/* Messages for this date */}
            {dateMessages.map((message) => {
              const isOwn = message.senderId === currentUser?.id;
              return (
                <MessageBubble 
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  currentUserId={currentUser?.id || ''}
                />
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-primary-light dark:border-primary-dark p-4 bg-secondary-light dark:bg-secondary-dark transition-colors duration-300">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={`Message ${selectedUser.displayName || selectedUser.userName}...`}
            className="flex-1 border border-primary-light dark:border-primary-dark rounded-full px-4 py-2 focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent font-sans placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark transition-colors duration-300"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!messageText.trim() || isLoading}
            className="bg-primary-light dark:bg-primary-dark text-text-primary-dark dark:text-text-primary-light p-2 rounded-full hover:bg-primary-dark dark:hover:bg-primary-light focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
          >
            {isLoading ? (
              <Clock className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};