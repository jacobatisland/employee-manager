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
  server_url?: string;
}

const defaultSettings: UserSettings = {
  defaultView: 'employees',
  theme: 'light',
  autoRefresh: false,
  refreshInterval: 5,
  showWelcomeMessage: true,
  serverUrl: 'http://employee-db.se-island.life:4001'
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

// Function to write external config file
const writeExternalConfig = async (serverUrl: string): Promise<void> => {
  try {
    // Check if we're running in a Tauri environment
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('write_external_config', { serverUrl });
      console.log('External config updated with server URL:', serverUrl);
    }
  } catch (error) {
    console.error('Failed to write external config:', error);
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
            parsedSettings.serverUrl === 'https://employee-db.se-island.life:4001' ||
            parsedSettings.serverUrl === 'employee-db.se-island.life:4001') {
          parsedSettings.serverUrl = defaultSettings.serverUrl;
          console.log('Migrated server URL to new default:', defaultSettings.serverUrl);
        }
        
        // Apply external config if available (takes precedence)
        if (externalConfig && externalConfig.server_url) {
          console.log('Using external config server URL:', externalConfig.server_url);
          parsedSettings.serverUrl = externalConfig.server_url;
        } else {
          // If no external config exists, create one with the default URL
          console.log('No external config found, creating default config file');
          writeExternalConfig(defaultSettings.serverUrl);
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
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      
      // If server URL is being updated, also write to external config
      if (updates.serverUrl && updates.serverUrl !== prev.serverUrl) {
        writeExternalConfig(updates.serverUrl);
      }
      
      return newSettings;
    });
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
