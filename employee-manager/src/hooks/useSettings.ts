import { useState, useEffect } from 'react';

export interface UserSettings {
  defaultView: 'dashboard' | 'employees' | 'settings';
  theme: 'light' | 'dark' | 'system';
  autoRefresh: boolean;
  refreshInterval: number; // in minutes
  showWelcomeMessage: boolean;
  serverUrl: string;
}

export interface ExternalConfig {
  serverUrl?: string;
}

const defaultSettings: UserSettings = {
  defaultView: 'employees',
  theme: 'light',
  autoRefresh: false,
  refreshInterval: 5,
  showWelcomeMessage: true,
  serverUrl: 'employee-db.se-island.life:4001'
};

const STORAGE_KEY = 'employee-manager-settings';

// Function to load external config file
const loadExternalConfig = async (): Promise<ExternalConfig | null> => {
  try {
    // Check if we're running in a Tauri environment
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      const { invoke } = await import('@tauri-apps/api/core');
      const config = await invoke('read_external_config');
      return config as ExternalConfig | null;
    }
    return null;
  } catch (error) {
    console.log('No external config found or error loading:', error);
    return null;
  }
};

export const useSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage and external config on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // First, try to load external config
        const externalConfig = await loadExternalConfig();
        
        // Load settings from localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        let parsedSettings = stored ? JSON.parse(stored) : {};
        
        // Migrate old server URL to new default
        if (parsedSettings.serverUrl === 'http://localhost:3001' || 
            parsedSettings.serverUrl === 'https://employee-db.se-island.life:4001') {
          parsedSettings.serverUrl = defaultSettings.serverUrl;
          console.log('Migrated server URL to new default:', defaultSettings.serverUrl);
        }
        
        // Apply external config if available (takes precedence)
        if (externalConfig && externalConfig.serverUrl) {
          console.log('Using external config server URL:', externalConfig.serverUrl);
          parsedSettings.serverUrl = externalConfig.serverUrl;
        }
        
        setSettings({ ...defaultSettings, ...parsedSettings });
      } catch (error) {
        console.error('Failed to load settings:', error);
        setSettings(defaultSettings);
      } finally {
        setIsLoaded(true);
      }
    };
    
    loadSettings();
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
