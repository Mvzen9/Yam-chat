import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    emailOrUser: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login({
        emailOrUser: formData.emailOrUser,
        password: formData.password,
      });
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-secondary-light dark:bg-secondary-dark rounded-xl shadow-xl w-full max-w-md overflow-hidden transition-colors duration-300">
        <div className="bg-primary-light dark:bg-primary-dark p-6 transition-colors duration-300">
          <div className="flex items-center justify-center text-text-primary-dark dark:text-text-primary-light">
            <MessageCircle className="w-8 h-8 mr-2" />
            <h1 className="text-2xl font-sans font-bold">Chat App</h1>
          </div>
        </div>
        
        <div className="p-6">
          <h2 className="text-2xl font-sans font-bold text-text-primary-light dark:text-text-primary-dark mb-6 text-center transition-colors duration-300">
            Sign In
          </h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm font-sans transition-colors duration-300">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-text-primary-light dark:text-text-primary-dark text-sm font-sans font-medium mb-2 transition-colors duration-300" htmlFor="emailOrUser">
                Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-text-secondary-light dark:text-text-secondary-dark transition-colors duration-300" />
                </div>
                <input
                  id="emailOrUser"
                  name="emailOrUser"
                  type="text"
                  required
                  value={formData.emailOrUser}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-4 py-2 border border-primary-light dark:border-primary-dark rounded-lg focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent font-sans bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark transition-colors duration-300"
                  placeholder="Enter your email or username"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-text-primary-light dark:text-text-primary-dark text-sm font-sans font-medium mb-2 transition-colors duration-300" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-secondary-light dark:text-text-secondary-dark transition-colors duration-300" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-4 py-2 border border-primary-light dark:border-primary-dark rounded-lg focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent font-sans bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark transition-colors duration-300"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-text-secondary-light dark:text-text-secondary-dark transition-colors duration-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-text-secondary-light dark:text-text-secondary-dark transition-colors duration-300" />
                  )}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-light dark:bg-primary-dark text-text-primary-dark dark:text-text-primary-light py-2 px-4 rounded-lg font-sans font-medium hover:bg-primary-dark hover:dark:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:ring-opacity-50 transition-colors duration-300"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-text-primary-dark dark:border-text-primary-light rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};