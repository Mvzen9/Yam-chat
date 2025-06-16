import React, { useState, useEffect } from 'react';
import { LogOut, Wifi, WifiOff } from 'lucide-react';
import { UserList } from './UserList';
import { ChatArea } from './ChatArea';
import { DarkModeToggle } from './DarkModeToggle';
import { useAuth } from '../contexts/AuthContext';
import { User, Message } from '../types';
import { chatAPI } from '../services/api';
import { signalRService } from '../services/signalr';
import * as signalR from '@microsoft/signalr';

export const ChatApp: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<signalR.HubConnectionState | null>(null);
  const { user: currentUser, logout } = useAuth();

  useEffect(() => {
    // Set up SignalR event handlers
    signalRService.setOnMessageReceived((message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    signalRService.setOnMessageRead((messageId: number) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      );
    });

    signalRService.setOnOnlineUsersUpdated((userIds: string[]) => {
      setOnlineUsers(userIds);
    });

    // Monitor connection status
    const checkConnection = () => {
      setConnectionStatus(signalRService.connectionState);
    };

    const interval = setInterval(checkConnection, 5000);
    checkConnection();

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Load chat history when user is selected
    if (selectedUser) {
      loadChatHistory(selectedUser.id);
    }
  }, [selectedUser]);

  const loadChatHistory = async (recipientId: string) => {
    try {
      const history = await chatAPI.getHistory(recipientId);
      setMessages(history);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleSendMessage = async (text: string, recipientId: string) => {
    if (!currentUser) return;

    try {
      // Send via SignalR for real-time delivery
      await signalRService.sendMessage(text, recipientId, currentUser.id);
      
      // Also send via HTTP as backup
      
      // Add to local messages immediately for better UX
      const newMessage: Message = {
        id: Date.now(), // Temporary ID
        senderId: currentUser.id,
        recipientId,
        text,
        sentAt: new Date().toISOString(),
        isRead: false,
      };
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const handleMarkAsRead = async (messageId: number) => {
    try {
      await chatAPI.markAsRead(messageId);
      
      if (selectedUser) {
        await signalRService.notifyMessageRead(messageId, selectedUser.id);
      }
      
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case signalR.HubConnectionState.Connected:
        return 'text-green-500';
      case signalR.HubConnectionState.Connecting:
      case signalR.HubConnectionState.Reconnecting:
        return 'text-yellow-500';
      default:
        return 'text-red-500';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case signalR.HubConnectionState.Connected:
        return 'Connected';
      case signalR.HubConnectionState.Connecting:
        return 'Connecting...';
      case signalR.HubConnectionState.Reconnecting:
        return 'Reconnecting...';
      default:
        return 'Disconnected';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      {/* Header */}
      <div className="bg-secondary-light dark:bg-secondary-dark border-b border-primary-light dark:border-primary-dark p-4 flex justify-between items-center transition-colors duration-300">
        <div className="flex items-center">
          <div className="flex items-center">
            {connectionStatus === signalR.HubConnectionState.Connected ? (
              <Wifi className={`w-4 h-4 ${getConnectionStatusColor()}`} />
            ) : (
              <WifiOff className={`w-4 h-4 ${getConnectionStatusColor()}`} />
            )}
            <span className="text-sm font-sans text-text-secondary-light dark:text-text-secondary-dark transition-colors duration-300">{getConnectionStatusText()}</span>
          </div>
          <div className="mx-4 h-6 border-l border-primary-light dark:border-primary-dark transition-colors duration-300"></div>
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark transition-colors duration-300">ChatApp</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <DarkModeToggle />
          <div className="text-sm font-sans font-bold text-text-primary-light dark:text-text-primary-dark transition-colors duration-300">
            Welcome, {currentUser?.displayName || currentUser?.userName}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-2 text-sm text-text-primary-dark dark:text-text-primary-light bg-primary-light dark:bg-primary-dark rounded-lg hover:bg-primary-dark hover:dark:bg-primary-light transition-colors duration-300 font-sans"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Logout
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden bg-background-light dark:bg-background-dark transition-colors duration-300">
        <UserList 
          selectedUserId={selectedUser?.id || null} 
          onUserSelect={setSelectedUser} 
          onlineUsers={onlineUsers}
        />
        <ChatArea 
          selectedUser={selectedUser} 
          messages={messages} 
          onSendMessage={handleSendMessage}
          onMarkAsRead={handleMarkAsRead}
        />
      </div>
    </div>
  );
};