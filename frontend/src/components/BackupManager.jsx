import React, { useState, useEffect } from 'react';
import ApiService from '../api';

const { ipcRenderer } = window.require('electron');

function BackupManager({ onClose }) {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const result = await ApiService.listBackups(20);
      setBackups(result.backups);
    } catch (error) {
      alert(`加载备份失败: ${error.message}`);
    } finally {
      setLoading(false);
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

  const formatSize = (bytes) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
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
                  <button
                    className="btn-danger btn-small"
                    onClick={() => handleDelete(backup.name)}
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={handleOpenBackupFolder}>
            打开备份位置
          </button>
          <button className="btn-secondary" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

export default BackupManager;
