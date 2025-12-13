import React, { useState, useEffect } from 'react';
import ApiService from '../api';

const { ipcRenderer } = window.require ? window.require('electron') : {};

function PathSelector({ userdataPath, onPathResolved, onRefresh, disabled }) {
  const [dragOver, setDragOver] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // 当找到路径后，自动折叠
  useEffect(() => {
    if (userdataPath) {
      const timer = setTimeout(() => setCollapsed(true), 300);
      return () => clearTimeout(timer);
    }
  }, [userdataPath]);

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const filePath = files[0].path;

      // 如果是快捷方式
      if (filePath.endsWith('.lnk')) {
        try {
          const result = await ApiService.parseShortcut(filePath);
          if (result.success) {
            onPathResolved(result.target_path);
          }
        } catch (error) {
          alert(`解析快捷方式失败: ${error.message}`);
        }
      } else {
        // 直接是目录
        onPathResolved(filePath);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleSelectDirectory = async () => {
    if (!ipcRenderer) {
      alert('此功能需要在 Electron 环境中运行');
      return;
    }

    const path = await ipcRenderer.invoke('dialog:openDirectory');
    if (path) {
      onPathResolved(path);
    }
  };

  return (
    <div className={`path-selector ${collapsed ? 'collapsed' : ''}`}>
      <div className="path-selector-header">
        <h2>游戏路径</h2>
        {userdataPath && (
          <button
            className="btn-collapse"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? '展开' : '收起'}
          >
            {collapsed ? '▼' : '▲'}
          </button>
        )}
      </div>

      {!collapsed && (
        <>
          <div
            className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <p>拖入剑网三快捷方式到此处</p>
            <p className="or-text">或</p>
            <button
              className="btn-primary"
              onClick={handleSelectDirectory}
              disabled={disabled}
            >
              手动选择游戏目录
            </button>
          </div>

          {userdataPath && (
            <div className="path-info">
              <div className="path-row">
                <span className="label">配置路径:</span>
                <span className="value">{userdataPath}</span>
                <span className="status success">✓ 已找到</span>
              </div>
              <button className="btn-small" onClick={onRefresh} disabled={disabled}>
                刷新角色列表
              </button>
            </div>
          )}
        </>
      )}

      {collapsed && userdataPath && (
        <div className="path-info-compact">
          <span className="status success">✓</span>
          <span className="value">{userdataPath}</span>
          <button className="btn-small" onClick={onRefresh} disabled={disabled}>
            刷新
          </button>
        </div>
      )}
    </div>
  );
}

export default PathSelector;
