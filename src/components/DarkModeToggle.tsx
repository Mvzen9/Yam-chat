import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Switch, FormControlLabel } from '@mui/material';

export const DarkModeToggle: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check if user has a preference stored in localStorage
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      // Switch to light mode
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      // Switch to dark mode
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  return (
    <div className="flex items-center transition-colors duration-300">
      <Moon className="w-5 h-5 text-primary-light dark:text-primary-dark mr-2" />
      <FormControlLabel
        control={
          <Switch
            checked={darkMode}
            onChange={toggleDarkMode}
            sx={{
              '& .MuiSwitch-switchBase': {
                color: '#F2E2D0',
                '&.Mui-checked': {
                  color: '#9B4F2B',
                  '& + .MuiSwitch-track': {
                    backgroundColor: '#D98A63',
                  },
                },
              },
              '& .MuiSwitch-track': {
                backgroundColor: '#4B4B4B',
              },
            }}
          />
        }
        label=""
      />
      <Sun className="w-5 h-5 text-primary-light dark:text-primary-dark ml-2" />
    </div>
  );
};