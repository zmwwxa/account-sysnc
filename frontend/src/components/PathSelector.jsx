import React, { useState } from 'react';
import ApiService from '../api';

const { ipcRenderer } = window.require ? window.require('electron') : {};

function PathSelector({ userdataPath, onPathResolved, onRefresh, disabled }) {
  const [dragOver, setDragOver] = useState(false);

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
    <div className="path-selector">
      <div className="path-selector-header">
        <h2>游戏路径</h2>
      </div>

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
