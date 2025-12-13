import React, { useState, useEffect } from 'react';
import ApiService from '../api';

const { ipcRenderer } = window.require('electron');

function BackupManager({ onClose }) {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadBackups();
    loadRoles();
  }, []);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const result = await ApiService.listBackups();
      setBackups(result.backups);
    } catch (error) {
      alert(`加载备份失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const result = await ApiService.scanRoles();
      if (result.success) {
        setRoles(result.roles);
      }
    } catch (error) {
      console.error('加载角色失败:', error);
    }
  };

  const handleDelete = async (backupName) => {
    const confirmed = window.confirm('确认删除此备份吗？');
    if (!confirmed) return;

    try {
      const result = await ApiService.deleteBackup(backupName);
      if (result.success) {
        alert('删除成功');
        loadBackups();
      }
    } catch (error) {
      alert(`删除失败: ${error.message}`);
    }
  };

  const handleRestore = (backup) => {
    setSelectedBackup(backup);
    setSelectedRole('');
    setSearchText('');
    setShowRestoreDialog(true);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);

    // 自动选择第一个匹配的角色
    if (value) {
      const filtered = roles.filter(role => {
        const displayText = roleDisplay(role).toLowerCase();
        return displayText.includes(value.toLowerCase());
      });

      if (filtered.length > 0) {
        setSelectedRole(filtered[0].path);
      } else {
        setSelectedRole('');
      }
    } else {
      setSelectedRole('');
    }
  };

  const confirmRestore = async () => {
    if (!selectedRole) {
      alert('请选择目标角色');
      return;
    }

    const role = roles.find(r => r.path === selectedRole);
    if (!role) {
      alert('未找到选中的角色');
      return;
    }

    const confirmed = window.confirm(
      `确认要将备份还原到以下角色吗？\n\n` +
      `目标角色: ${role.account}-${role.region}-${role.server}-${role.role}\n\n` +
      `警告：此操作将覆盖目标角色的当前配置！`
    );

    if (!confirmed) return;

    try {
      const result = await ApiService.restoreBackup(selectedBackup.name, role);
      if (result.success) {
        alert('还原成功！');
        setShowRestoreDialog(false);
        setSelectedBackup(null);
        setSelectedRole('');
        setSearchText('');
      } else {
        alert(`还原失败: ${result.message}`);
      }
    } catch (error) {
      alert(`还原失败: ${error.message}`);
    }
  };

  const handleOpenBackupFolder = async () => {
    try {
      const result = await ApiService.getBackupPath();
      if (result.success) {
        const openResult = await ipcRenderer.invoke('shell:openPath', result.path);
        if (!openResult.success) {
          alert(`打开文件夹失败: ${openResult.error}`);
        }
      }
    } catch (error) {
      alert(`获取备份路径失败: ${error.message}`);
    }
  };


  const handleClearAll = async () => {
    if (backups.length === 0) {
      alert('当前没有备份需要清空');
      return;
    }

    const confirmed = window.confirm(
      `确认要清空所有备份吗？

` +
      `当前共有 ${backups.length} 个备份

` +
      `警告：此操作不可撤销！`
    );

    if (!confirmed) return;

    try {
      const result = await ApiService.clearAllBackups();
      if (result.success) {
        alert(`成功清空 ${result.count} 个备份`);
        loadBackups();
      } else {
        alert(`清空备份失败: ${result.message}`);
      }
    } catch (error) {
      alert(`清空备份失败: ${error.message}`);
    }
  };

  const formatSize = (bytes) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const roleDisplay = (role) =>
    `${role.account}-${role.region}-${role.server}-${role.role}`;

  // 过滤角色列表
  const filteredRoles = roles.filter(role => {
    if (!searchText) return true;
    const displayText = roleDisplay(role).toLowerCase();
    return displayText.includes(searchText.toLowerCase());
  });

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>备份管理</h2>
            <button className="btn-close" onClick={onClose}>×</button>
          </div>

          <div className="modal-body">
            {loading ? (
              <div className="loading">加载中...</div>
            ) : backups.length === 0 ? (
              <div className="empty">暂无备份</div>
            ) : (
              <div className="backup-list">
                {backups.map(backup => (
                  <div key={backup.name} className="backup-item">
                    <div className="backup-info">
                      <div className="backup-name">{backup.role_info}</div>
                      <div className="backup-meta">
                        <span>{backup.created_at}</span>
                        <span>{formatSize(backup.size)}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn-primary btn-small"
                        onClick={() => handleRestore(backup)}
                      >
                        还原
                      </button>
                      <button
                        className="btn-danger btn-small"
                        onClick={() => handleDelete(backup.name)}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn-primary" onClick={handleOpenBackupFolder}>
              打开备份位置
            </button>
            <button className="btn-danger" onClick={handleClearAll}>
              清空备份
            </button>
            <button className="btn-secondary" onClick={onClose}>
              关闭
            </button>
          </div>
        </div>
      </div>

      {showRestoreDialog && (
        <div className="modal-overlay" onClick={() => setShowRestoreDialog(false)}>
          <div className="modal-content restore-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>还原备份</h2>
              <button className="btn-close" onClick={() => setShowRestoreDialog(false)}>×</button>
            </div>

            <div className="modal-body">
              <div style={{ marginBottom: '16px' }}>
                <strong>备份:</strong> {selectedBackup?.role_info}
              </div>

              <div style={{ marginBottom: '8px' }}>
                <strong>搜索角色:</strong>
              </div>
              <input
                type="text"
                className="search-input"
                placeholder="输入角色名、账号、大区或服务器进行搜索..."
                value={searchText}
                onChange={handleSearchChange}
                style={{ width: '100%', marginBottom: '12px' }}
              />

              <div style={{ marginBottom: '8px' }}>
                <strong>选择目标角色:</strong>
                {filteredRoles.length > 0 && searchText && (
                  <span style={{ marginLeft: '8px', fontSize: '12px', color: '#667eea' }}>
                    找到 {filteredRoles.length} 个匹配的角色
                  </span>
                )}
              </div>
              <select
                className="role-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '13px',
                  maxHeight: '200px'
                }}
                size={Math.min(filteredRoles.length, 8)}
              >
                <option value="">请选择角色</option>
                {filteredRoles.map(role => (
                  <option key={role.path} value={role.path}>
                    {roleDisplay(role)}
                  </option>
                ))}
              </select>

              {filteredRoles.length === 0 && searchText && (
                <div style={{
                  marginTop: '8px',
                  color: '#999',
                  fontSize: '12px',
                  textAlign: 'center'
                }}>
                  未找到匹配的角色
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn-primary"
                onClick={confirmRestore}
                disabled={!selectedRole}
              >
                确认还原
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowRestoreDialog(false);
                  setSearchText('');
                }}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default BackupManager;
