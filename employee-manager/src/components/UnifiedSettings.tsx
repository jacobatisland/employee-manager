import React, { useState, useEffect } from 'react';
import { Server, Globe, CheckCircle, XCircle, Info } from 'lucide-react';
import { UserSettings } from '../hooks/useSettings';

interface UnifiedSettingsProps {
  settings: UserSettings;
  onUpdateSettings: (updates: Partial<UserSettings>) => void;
  serverUrl: string;
  onServerUrlChange: (url: string) => void;
  onTestConnection: () => Promise<void>;
}

const UnifiedSettings: React.FC<UnifiedSettingsProps> = ({
  settings,
  onUpdateSettings,
  serverUrl,
  onServerUrlChange,
  onTestConnection
}) => {
  const [localUrl, setLocalUrl] = useState(serverUrl);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState<string>('');

  // Sync local URL with server URL when it changes
  useEffect(() => {
    setLocalUrl(serverUrl);
  }, [serverUrl]);

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
      {/* Server Configuration - Moved to top */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-full">
            <Server className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Server Configuration</h3>
            <p className="text-sm text-gray-600">Configure your connection to the Employee Management System server</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Server URL */}
          <div>
            <label htmlFor="serverUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Server URL
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="url"
                  id="serverUrl"
                  value={localUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="employee-db.se-island.life:4001"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter the full URL of your Employee Management System server
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleApplySettings}
              disabled={!isUrlChanged}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${!isUrlChanged ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Apply Settings
            </button>
            <button
              onClick={handleTestConnection}
              disabled={connectionStatus === 'testing' || isUrlChanged}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2"
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
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-yellow-800 text-sm">
                <Info className="inline h-4 w-4 mr-1" />
                You have unsaved changes. Click "Apply Settings" to save the new server URL.
              </p>
            </div>
          )}

          {/* Connection Test Results */}
          {connectionStatus !== 'idle' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Connection Test Results</h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {connectionStatus === 'testing' && (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span className="text-blue-600">Testing connection...</span>
                    </>
                  )}
                  
                  {connectionStatus === 'success' && (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-green-600 font-medium">Connection Successful</span>
                    </>
                  )}
                  
                  {connectionStatus === 'error' && (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="text-red-600 font-medium">Connection Failed</span>
                    </>
                  )}
                </div>
                
                {testResult && (
                  <div className={`p-3 rounded-lg text-sm ${
                    connectionStatus === 'success' 
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {testResult}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
        
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
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>


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
                settings.showWelcomeMessage ? 'bg-blue-600' : 'bg-gray-200'
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
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
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
                settings.autoRefresh ? 'bg-blue-600' : 'bg-gray-200'
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
                className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

    </div>
  );
};

export default UnifiedSettings;
