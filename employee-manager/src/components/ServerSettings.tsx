import React, { useState } from 'react';
import { Server, CheckCircle, XCircle, Globe, Shield, Info } from 'lucide-react';

interface ServerSettingsProps {
  serverUrl: string;
  onServerUrlChange: (url: string) => void;
  onTestConnection: () => Promise<void>;
}

const ServerSettings: React.FC<ServerSettingsProps> = ({
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

  const isUrlChanged = localUrl !== serverUrl;

  return (
    <div className="space-y-6">

      {/* Server Configuration */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-100 p-2 rounded-full">
            <Server className="h-5 w-5 text-gray-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Server Configuration</h2>
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
                  className="input-field"
                  placeholder="http://localhost:3001"
                />
                <p className="mt-1 text-sm text-gray-500">
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
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-yellow-800 text-sm">
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Test</h3>
          
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

      {/* Server Requirements */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Server Requirements</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Network Access</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• HTTP/HTTPS access</li>
                <li>• Port 3001 (default)</li>
                <li>• CORS enabled for client</li>
              </ul>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Server Status</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Node.js server running</li>
                <li>• SQLite database initialized</li>
                <li>• API endpoints responding</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Quick Server Setup</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>1. Navigate to the server directory: <code className="bg-gray-200 px-1 rounded">cd server</code></p>
              <p>2. Install dependencies: <code className="bg-gray-200 px-1 rounded">npm install</code></p>
              <p>3. Initialize database: <code className="bg-gray-200 px-1 rounded">npm run init-db</code></p>
              <p>4. Start server: <code className="bg-gray-200 px-1 rounded">npm start</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerSettings;
