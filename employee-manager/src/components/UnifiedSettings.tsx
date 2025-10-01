import React, { useState } from 'react';
import { Settings, RotateCcw, Server, Globe, CheckCircle, XCircle, Info } from 'lucide-react';
import { UserSettings } from '../hooks/useSettings';

interface UnifiedSettingsProps {
  settings: UserSettings;
  onUpdateSettings: (updates: Partial<UserSettings>) => void;
  onResetSettings: () => void;
  serverUrl: string;
  onServerUrlChange: (url: string) => void;
  onTestConnection: () => Promise<void>;
}

const UnifiedSettings: React.FC<UnifiedSettingsProps> = ({
  settings,
  onUpdateSettings,
  onResetSettings,
  serverUrl,
  onServerUrlChange,
  onTestConnection
}) => {
  const [localUrl, setLocalUrl] = useState(serverUrl);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState<string>('');

  const handleUrlChange = (url: string) => {
    setLocalUrl(url);
    setConnectionStatus('idle');
    setTestResult('');
  };

  const handleApplySettings = () => {
    onServerUrlChange(localUrl);
    setConnectionStatus('idle');
    setTestResult('');
  };

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    setTestResult('');
    
    try {
      await onTestConnection();
      setConnectionStatus('success');
      setTestResult('Connection successful! Server is reachable and responding.');
    } catch (error) {
      setConnectionStatus('error');
      setTestResult(error instanceof Error ? error.message : 'Connection failed');
    }
  };


  const handleItemsPerPageChange = (itemsPerPage: number) => {
    onUpdateSettings({ itemsPerPage });
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

  const isUrlChanged = localUrl !== serverUrl;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary-100 p-2 rounded-full">
          <Settings className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h2>
          <p className="text-gray-600 dark:text-gray-400">Configure your application preferences and server connection</p>
        </div>
      </div>


      {/* General Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General Settings</h3>
        
        <div className="space-y-6">
          {/* Default View */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
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
                      ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Items Per Page */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Items per page
            </label>
            <select
              value={settings.itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="input-field w-32"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Show Welcome Message */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Show welcome message
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Display helpful tips and information</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ showWelcomeMessage: !settings.showWelcomeMessage })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.showWelcomeMessage ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Auto-Refresh Settings</h3>
        
        <div className="space-y-4">
          {/* Enable Auto-Refresh */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable auto-refresh
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Automatically refresh data at intervals</p>
            </div>
            <button
              onClick={() => handleAutoRefreshChange(!settings.autoRefresh)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoRefresh ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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

      {/* Server Configuration */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
            <Server className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Server Configuration</h3>
        </div>

        <div className="space-y-4">
          {/* Server URL */}
          <div>
            <label htmlFor="serverUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Server URL
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="url"
                  id="serverUrl"
                  value={localUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="input-field"
                  placeholder="http://localhost:3001"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Enter the full URL of your Employee Manager server
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleApplySettings}
              disabled={!isUrlChanged}
              className={`btn-primary ${!isUrlChanged ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Apply Settings
            </button>
            <button
              onClick={handleTestConnection}
              disabled={connectionStatus === 'testing' || isUrlChanged}
              className="btn-secondary flex items-center gap-2"
            >
              {connectionStatus === 'testing' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              ) : (
                <Globe size={16} />
              )}
              Test Connection
            </button>
          </div>

          {isUrlChanged && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                <Info className="inline h-4 w-4 mr-1" />
                You have unsaved changes. Click "Apply Settings" to save the new server URL.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Connection Status */}
      {connectionStatus !== 'idle' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Connection Test</h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {connectionStatus === 'testing' && (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-blue-600 dark:text-blue-400">Testing connection...</span>
                </>
              )}
              
              {connectionStatus === 'success' && (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-green-600 dark:text-green-400 font-medium">Connection Successful</span>
                </>
              )}
              
              {connectionStatus === 'error' && (
                <>
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <span className="text-red-600 dark:text-red-400 font-medium">Connection Failed</span>
                </>
              )}
            </div>
            
            {testResult && (
              <div className={`p-3 rounded-lg text-sm ${
                connectionStatus === 'success' 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
              }`}>
                {testResult}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reset Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reset Settings</h3>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Reset all settings to their default values
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">This action cannot be undone</p>
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

export default UnifiedSettings;
