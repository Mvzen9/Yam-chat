import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { User } from '../types';
import { userAPI } from '../services/api';
import { ConversationListItem } from './ConversationListItem';

interface UserListProps {
  selectedUserId: string | null;
  onUserSelect: (user: User) => void;
  onlineUsers: string[];
}

export const UserList: React.FC<UserListProps> = ({ 
  selectedUserId, 
  onUserSelect, 
  onlineUsers 
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const userList = await userAPI.getAllUsers();
      setUsers(userList);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      try {
        const searchResults = await userAPI.searchUsers(term);
        setUsers(searchResults);
      } catch (error) {
        console.error('Error searching users:', error);
      }
    } else {
      loadUsers();
    }
  };

  const filteredUsers = users.filter(user =>
    user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="w-80 bg-background-light dark:bg-background-dark border-r border-primary-light dark:border-primary-dark p-4 transition-colors duration-300">
        <div className="animate-pulse">
          <div className="h-10 bg-secondary-light dark:bg-secondary-dark rounded-lg mb-4 transition-colors duration-300"></div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center p-3 mb-2">
              <div className="w-10 h-10 bg-secondary-light dark:bg-secondary-dark rounded-full mr-3 transition-colors duration-300"></div>
              <div>
                <div className="h-4 bg-secondary-light dark:bg-secondary-dark rounded w-24 mb-1 transition-colors duration-300"></div>
                <div className="h-3 bg-secondary-light dark:bg-secondary-dark rounded w-16 transition-colors duration-300"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-background-light dark:bg-background-dark border-r border-primary-light dark:border-primary-dark flex flex-col transition-colors duration-300">
      {/* Header */}
      <div className="p-4 border-b border-primary-light dark:border-primary-dark">
        <h2 className="text-xl font-sans font-bold text-text-primary-light dark:text-text-primary-dark mb-4 transition-colors duration-300">Contacts</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark w-4 h-4 transition-colors duration-300" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-primary-light dark:border-primary-dark rounded-lg focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent font-sans bg-secondary-light dark:bg-secondary-dark text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark transition-colors duration-300"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark transition-colors duration-300">
        {filteredUsers.length === 0 ? (
          <div className="p-4 text-center font-sans text-text-secondary-light dark:text-text-secondary-dark transition-colors duration-300">
            {searchTerm ? 'No users found' : 'No users available'}
          </div>
        ) : (
          <div className="p-2">
            {filteredUsers.map((user) => {
              const isOnline = onlineUsers.includes(user.id);
              const isSelected = selectedUserId === user.id;
              
              return (
                <ConversationListItem
                  key={user.id}
                  user={user}
                  isSelected={isSelected}
                  isOnline={isOnline}
                  onClick={() => onUserSelect(user)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};