import React, { useState, useEffect } from 'react';
import ApiService from './api';
import PathSelector from './components/PathSelector';
import RoleSelector from './components/RoleSelector';
import CopyOptions from './components/CopyOptions';
import BackupManager from './components/BackupManager';
import './App.css';

function App() {
  const [userdataPath, setUserdataPath] = useState('');
  const [roles, setRoles] = useState([]);
  const [sourceRole, setSourceRole] = useState(null);
  const [targetRoles, setTargetRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showBackupManager, setShowBackupManager] = useState(false);

  // 加载配置
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const config = await ApiService.getConfig();
      if (config.userdata_path) {
        setUserdataPath(config.userdata_path);
        scanRoles();
      }
    } catch (error) {
      console.error('加载配置失败:', error);
    }
  };

  const handlePathResolved = async (path) => {
    try {
      const result = await ApiService.resolveGamePath(path);
      if (result.success) {
        setUserdataPath(result.userdata_path);
        setMessage('游戏路径设置成功！');
        scanRoles();
      } else {
        setMessage(`错误: ${result.error}`);
      }
    } catch (error) {
      setMessage(`错误: ${error.message}`);
    }
  };

  const scanRoles = async () => {
    setLoading(true);
    try {
      const result = await ApiService.scanRoles();
      if (result.success) {
        setRoles(result.roles);
        setMessage(`扫描完成，找到 ${result.count} 个角色`);
      }
    } catch (error) {
      setMessage(`扫描失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (options) => {
    if (!sourceRole) {
      setMessage('请选择源角色');
      return;
    }

    if (targetRoles.length === 0) {
      setMessage('请选择至少一个目标角色');
      return;
    }

    setLoading(true);
    setMessage('正在同步...');

    try {
      const result = await ApiService.copyMultiple(
        sourceRole,
        targetRoles,
        options.autoBackup
      );

      if (result.success) {
        const msg = `同步完成！成功: ${result.success_count} 个`;
        if (result.failed.length > 0) {
          const failedInfo = result.failed.map(f => f.role).join(', ');
          setMessage(`${msg}，失败: ${result.failed.length} 个 (${failedInfo})`);
        } else {
          setMessage(msg);
        }
      }
    } catch (error) {
      setMessage(`同步失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>剑网三角色配置同步工具</h1>
        <p className="subtitle">by 孤月伴云流</p>
      </header>

      <div className="app-container">
        {message && (
          <div className={`message ${loading ? 'loading' : ''}`}>
            {message}
          </div>
        )}

        <PathSelector
          userdataPath={userdataPath}
          onPathResolved={handlePathResolved}
          onRefresh={scanRoles}
          disabled={loading}
        />

        {roles.length > 0 && (
          <>
            <RoleSelector
              roles={roles}
              sourceRole={sourceRole}
              targetRoles={targetRoles}
              onSourceChange={setSourceRole}
              onTargetChange={setTargetRoles}
              disabled={loading}
            />

            <CopyOptions
              onCopy={handleCopy}
              disabled={loading || !sourceRole || targetRoles.length === 0}
            />
          </>
        )}

        <div className="footer-actions">
          <button
            className="btn-secondary"
            onClick={() => setShowBackupManager(true)}
            disabled={loading}
          >
            备份管理
          </button>
        </div>
      </div>

      {showBackupManager && (
        <BackupManager onClose={() => setShowBackupManager(false)} />
      )}
    </div>
  );
}

export default App;
