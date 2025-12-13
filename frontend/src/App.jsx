import React, { useState, useEffect } from 'react';
import ApiService from './api';
import PathSelector from './components/PathSelector';
import RoleSelector from './components/RoleSelector';
import CopyOptions from './components/CopyOptions';
import BackupManager from './components/BackupManager';
import SuccessDialog from './components/SuccessDialog';
import GuideDialog from './components/GuideDialog';
import './App.css';

function App() {
  const [userdataPath, setUserdataPath] = useState('');
  const [roles, setRoles] = useState([]);
  const [sourceRole, setSourceRole] = useState(null);
  const [targetRoles, setTargetRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showBackupManager, setShowBackupManager] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState({ title: '', message: '', details: [] });
  const [showGuide, setShowGuide] = useState(false);

  // 加载配置
  useEffect(() => {
    loadConfig();
    // 检查是否需要显示使用说明
    const hideGuide = localStorage.getItem('hideGuide');
    if (!hideGuide) {
      setShowGuide(true);
    }
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
    setMessage('正在复制...');

    try {
      const result = await ApiService.copyMultiple(
        sourceRole,
        targetRoles,
        options.autoBackup
      );

      if (result.success) {
        const roleDisplay = (role) => `${role.account} - ${role.region} - ${role.server} - ${role.role}`;

        // 构建详细信息
        const details = [
          `📤 源角色: ${roleDisplay(sourceRole)}`,
          '',
          `✅ 成功复制到 ${result.success_count} 个角色:`,
        ];

        // 添加成功的目标角色列表
        const successRoles = targetRoles.filter(target =>
          !result.failed.some(f => f.role === roleDisplay(target))
        );
        successRoles.forEach((role, index) => {
          details.push(`  ${index + 1}. ${roleDisplay(role)}`);
        });

        if (result.failed.length > 0) {
          details.push('');
          details.push(`❌ 复制失败 ${result.failed.length} 个角色:`);
          result.failed.forEach((f, index) => {
            details.push(`  ${index + 1}. ${f.role}: ${f.error}`);
          });
        }

        // 显示成功对话框
        setSuccessInfo({
          title: '复制完成',
          message: result.failed.length > 0
            ? `已完成复制，部分角色复制失败`
            : '所有角色已成功复制！',
          details
        });
        setShowSuccess(true);
        setMessage('');
      }
    } catch (error) {
      setMessage(`复制失败: ${error.message}`);
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
          <div className="message">
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

            <div className="bottom-actions">
              <CopyOptions
                sourceRole={sourceRole}
                targetRoles={targetRoles}
                onCopy={handleCopy}
                disabled={loading || !sourceRole || targetRoles.length === 0}
              />

              <button
                className="btn-secondary btn-backup"
                onClick={() => setShowBackupManager(true)}
                disabled={loading}
              >
                备份管理
              </button>
            </div>
          </>
        )}
      </div>

      {showBackupManager && (
        <BackupManager onClose={() => setShowBackupManager(false)} />
      )}

      {showSuccess && (
        <SuccessDialog
          show={showSuccess}
          title={successInfo.title}
          message={successInfo.message}
          details={successInfo.details}
          onClose={() => setShowSuccess(false)}
        />
      )}

      <GuideDialog
        show={showGuide}
        onClose={() => setShowGuide(false)}
      />
    </div>
  );
}

export default App;
