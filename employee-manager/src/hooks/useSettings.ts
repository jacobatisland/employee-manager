import { useState, useEffect } from 'react';

export interface UserSettings {
  defaultView: 'dashboard' | 'employees' | 'settings';
  theme: 'light' | 'dark' | 'system';
  itemsPerPage: number;
  autoRefresh: boolean;
  refreshInterval: number; // in minutes
  showWelcomeMessage: boolean;
  serverUrl: string;
}

const defaultSettings: UserSettings = {
  defaultView: 'employees',
  theme: 'light',
  itemsPerPage: 25,
  autoRefresh: false,
  refreshInterval: 5,
  showWelcomeMessage: true,
  serverUrl: 'http://localhost:3001'
};

const STORAGE_KEY = 'employee-manager-settings';

export const useSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsedSettings });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    }
  }, [settings, isLoaded]);

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return {
    settings,
    updateSettings,
    resetSettings,
    isLoaded
  };
};
