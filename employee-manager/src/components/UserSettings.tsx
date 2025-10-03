import React from 'react';
import { Settings, Monitor, Sun, Moon, RotateCcw } from 'lucide-react';
import { UserSettings } from '../hooks/useSettings';

interface UserSettingsProps {
  settings: UserSettings;
  onUpdateSettings: (updates: Partial<UserSettings>) => void;
  onResetSettings: () => void;
}

const UserSettingsComponent: React.FC<UserSettingsProps> = ({
  settings,
  onUpdateSettings,
  onResetSettings
}) => {
  const handleThemeChange = (theme: UserSettings['theme']) => {
    onUpdateSettings({ theme });
  };


  const handleAutoRefreshChange = (autoRefresh: boolean) => {
    onUpdateSettings({ autoRefresh });
  };

  const handleRefreshIntervalChange = (refreshInterval: number) => {
    onUpdateSettings({ refreshInterval });
  };

  const handleDefaultViewChange = (defaultView: UserSettings['defaultView']) => {
    onUpdateSettings({ defaultView });
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-100 p-2 rounded-full">
            <Settings className="h-5 w-5 text-gray-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
        </div>

        <div className="space-y-6">
          {/* Default View */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Default View
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'dashboard', label: 'Dashboard', icon: '📊' },
                { value: 'employees', label: 'Employees', icon: '👥' },
                { value: 'settings', label: 'Settings', icon: '⚙️' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleDefaultViewChange(option.value as UserSettings['defaultView'])}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    settings.defaultView === option.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Theme
            </label>
            <div className="flex gap-3">
              {[
                { value: 'light', label: 'Light', icon: Sun },
                { value: 'dark', label: 'Dark', icon: Moon },
                { value: 'system', label: 'System', icon: Monitor }
              ].map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleThemeChange(option.value as UserSettings['theme'])}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      settings.theme === option.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <Icon size={16} />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Display Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Settings</h3>
        
        <div className="space-y-4">

          {/* Show Welcome Message */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Show welcome message
              </label>
              <p className="text-xs text-gray-500">Display helpful tips and information</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ showWelcomeMessage: !settings.showWelcomeMessage })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.showWelcomeMessage ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.showWelcomeMessage ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Auto-Refresh Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Auto-Refresh Settings</h3>
        
        <div className="space-y-4">
          {/* Enable Auto-Refresh */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Enable auto-refresh
              </label>
              <p className="text-xs text-gray-500">Automatically refresh data at intervals</p>
            </div>
            <button
              onClick={() => handleAutoRefreshChange(!settings.autoRefresh)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoRefresh ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoRefresh ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Refresh Interval */}
          {settings.autoRefresh && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refresh interval (minutes)
              </label>
              <select
                value={settings.refreshInterval}
                onChange={(e) => handleRefreshIntervalChange(Number(e.target.value))}
                className="input-field w-32"
              >
                <option value={1}>1 minute</option>
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Reset Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reset Settings</h3>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Reset all settings to their default values
            </p>
            <p className="text-xs text-gray-500">This action cannot be undone</p>
          </div>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all settings to default values?')) {
                onResetSettings();
              }
            }}
            className="btn-danger flex items-center gap-2"
          >
            <RotateCcw size={16} />
            Reset Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsComponent;
