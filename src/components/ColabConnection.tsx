import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Settings, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { defaultColabService, ColabService } from '../services/colabService';

interface ColabConnectionProps {
  onConnectionChange?: (connected: boolean) => void;
}

const ColabConnection: React.FC<ColabConnectionProps> = ({ onConnectionChange }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [colabUrl, setColabUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsChecking(true);
    setError('');
    
    try {
      const connected = await defaultColabService.checkConnection();
      setIsConnected(connected);
      
      if (connected) {
        // Lấy thông tin model nếu kết nối thành công
        const modelInfoResponse = await defaultColabService.getModelInfo();
        if (modelInfoResponse.success) {
          setModelInfo(modelInfoResponse.data);
        }
      }
      
      onConnectionChange?.(connected);
    } catch (err) {
      console.error('updateConnection error:', err);
      setError('Lỗi khi kiểm tra kết nối');
      setIsConnected(false);
      onConnectionChange?.(false);
    } finally {
      setIsChecking(false);
    }
  };

  const updateConnection = async () => {
    if (!colabUrl.trim()) {
      setError('Vui lòng nhập URL Colab');
      return;
    }

    setIsChecking(true);
    setError('');

    try {
      defaultColabService.updateConfig({
        colabUrl: colabUrl.trim(),
        apiKey: apiKey.trim() || undefined,
        modelEndpoint: '/predict'
      });

      await checkConnection();
      setShowSettings(false);
    } catch (err) {
      console.error('updateConnection error:', err);
      setError('Lỗi khi cập nhật kết nối');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {isConnected ? (
            <Wifi size={20} className="text-green-600" />
          ) : (
            <WifiOff size={20} className="text-red-600" />
          )}
          <div>
            <h3 className="font-medium text-gray-900">
              Google Colab AI
            </h3>
            <p className="text-sm text-gray-600">
              {isConnected ? 'Đã kết nối' : 'Chưa kết nối'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={checkConnection}
            disabled={isChecking}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={isChecking ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className={`flex items-center space-x-2 p-3 rounded-lg ${
        isConnected ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
      }`}>
        {isConnected ? (
          <CheckCircle size={16} />
        ) : (
          <AlertCircle size={16} />
        )}
        <span className="text-sm font-medium">
          {isConnected ? 'AI model sẵn sàng sử dụng' : 'Cần kết nối với Colab'}
        </span>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Model Info */}
      {isConnected && modelInfo && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Thông tin Model</h4>
          <div className="text-xs text-blue-800 space-y-1">
            <p>Model: {modelInfo.model_name || 'Fashion Recognition'}</p>
            <p>Version: {modelInfo.version || '1.0'}</p>
            <p>Accuracy: {modelInfo.accuracy || 'N/A'}</p>
            <p>Last Updated: {modelInfo.last_updated || 'N/A'}</p>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">Cài đặt kết nối</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Colab URL (ngrok hoặc public URL)
              </label>
              <input
                type="url"
                value={colabUrl}
                onChange={(e) => setColabUrl(e.target.value)}
                placeholder="https://your-colab-url.ngrok.io"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <p className="text-xs text-gray-500 mt-1">
                Sử dụng ngrok để tạo public URL cho Colab notebook
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key (tùy chọn)
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Nhập API key nếu có"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={updateConnection}
                disabled={isChecking}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isChecking ? 'Đang kết nối...' : 'Kết nối'}
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isConnected && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">Hướng dẫn kết nối:</h4>
          <ol className="text-xs text-yellow-700 space-y-1 list-decimal list-inside">
            <li>Chạy AI model trên Google Colab</li>
            <li>Sử dụng ngrok để tạo public URL</li>
            <li>Copy URL và paste vào ô cài đặt</li>
            <li>Click "Kết nối" để kiểm tra</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default ColabConnection;