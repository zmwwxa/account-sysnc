import React, { useState, useEffect } from 'react';
import ApiService from '../api';

// 获取Electron的shell、path和fs API
const electron = window.require ? window.require('electron') : {};
const pathModule = window.require ? window.require('path') : {};
const fs = window.require ? window.require('fs') : {};
const { shell } = electron;

function RoleSelector({ roles, sourceRole, targetRoles, onSourceChange, onTargetChange, disabled }) {
  const [sourceSearch, setSourceSearch] = useState('');
  const [targetSearch, setTargetSearch] = useState('');
  const [filters, setFilters] = useState({
    account: '',
    region: '',
    server: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    accounts: [],
    regions: [],
    servers: []
  });
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    loadFilterOptions();
  }, [roles]);

  const loadFilterOptions = async () => {
    try {
      const options = await ApiService.getFilters();
      setFilterOptions(options);
    } catch (error) {
      console.error('加载过滤选项失败:', error);
    }
  };

  const handleSourceSearchChange = (e) => {
    const searchValue = e.target.value;
    setSourceSearch(searchValue);

    if (searchValue) {
      const filtered = roles.filter(role =>
        role.role.toLowerCase().includes(searchValue.toLowerCase())
      );
      if (filtered.length > 0) {
        const firstRole = filtered[0];
        onSourceChange(firstRole);
        const newTargets = targetRoles.filter(t => t.path !== firstRole.path);
        onTargetChange(newTargets);
      }
    }
  };

  const handleSourceChange = (e) => {
    const role = roles.find(r => r.path === e.target.value);
    onSourceChange(role);
    const newTargets = targetRoles.filter(t => t.path !== role?.path);
    onTargetChange(newTargets);
  };

  const handleTargetToggle = (role, e) => {
    if (e && e.button === 2) {
      return;
    }

    if (sourceRole && role.path === sourceRole.path) {
      return;
    }

    const isSelected = targetRoles.some(t => t.path === role.path);

    if (isSelected) {
      onTargetChange(targetRoles.filter(t => t.path !== role.path));
    } else {
      onTargetChange([...targetRoles, role]);
    }
  };

  const handleOpenFolder = async (rolePath) => {
    if (!shell || !pathModule || !fs) {
      alert('此功能需要在 Electron 环境中运行');
      return;
    }

    try {
      console.log('Original role path:', rolePath);
      let folderPath = rolePath;

      // 检查路径是文件还是目录
      try {
        const stats = fs.statSync(rolePath);
        if (stats.isFile()) {
          // 如果是文件,获取其所在目录
          folderPath = pathModule.dirname(rolePath);
          console.log('Path is a file, using parent directory:', folderPath);
        } else if (stats.isDirectory()) {
          // 如果已经是目录,直接使用
          folderPath = rolePath;
          console.log('Path is a directory, using as-is:', folderPath);
        }
      } catch (err) {
        // 如果路径不存在或无法访问,尝试使用父目录
        console.warn('Path does not exist or cannot be accessed, trying parent directory');
        folderPath = pathModule.dirname(rolePath);
      }

      console.log('Opening folder:', folderPath);

      // 使用shell.openPath打开文件夹
      const result = await shell.openPath(folderPath);

      if (result) {
        console.error('Failed to open folder:', result);
        alert(`打开文件夹失败: ${result}`);
      }
    } catch (error) {
      console.error('Error opening folder:', error);
      alert(`打开文件夹失败: ${error.message}`);
    }
  };

  const handleContextMenu = (e, role) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      role: role
    });
  };

  useEffect(() => {
    if (!contextMenu) return;

    const handleClickOutside = (e) => {
      const menuElement = document.querySelector('.context-menu');
      if (menuElement && !menuElement.contains(e.target)) {
        setContextMenu(null);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside, true);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [contextMenu]);

  const filteredSourceRoles = roles.filter(role => {
    if (sourceSearch && !role.role.toLowerCase().includes(sourceSearch.toLowerCase())) {
      return false;
    }
    return true;
  });

  const filteredTargetRoles = roles.filter(role => {
    if (filters.account && role.account !== filters.account) return false;
    if (filters.region && role.region !== filters.region) return false;
    if (filters.server && role.server !== filters.server) return false;
    if (targetSearch && !role.role.toLowerCase().includes(targetSearch.toLowerCase())) return false;
    if (sourceRole && role.path === sourceRole.path) return false;
    return true;
  });

  const roleDisplay = (role) =>
    `${role.account}-${role.region}-${role.server}-${role.role}`;

  return (
    <div className="role-selector">
      <div className="source-section">
        <h2>源角色</h2>

        <input
          type="text"
          className="search-input"
          placeholder="搜索角色名..."
          value={sourceSearch}
          onChange={handleSourceSearchChange}
          onClick={(e) => e.stopPropagation()}
          disabled={disabled}
        />

        <select
          className="role-select"
          value={sourceRole?.path || ''}
          onChange={handleSourceChange}
          disabled={disabled}
        >
          <option value="">请选择源角色</option>
          {filteredSourceRoles.map(role => (
            <option key={role.path} value={role.path}>
              {roleDisplay(role)}
            </option>
          ))}
        </select>

        {sourceRole && (
          <button
            className="btn-small btn-open-folder"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenFolder(sourceRole.path);
            }}
            disabled={disabled}
            title="打开配置文件夹"
          >
            📁 打开文件夹
          </button>
        )}
      </div>

      <div className="target-section">
        <h2>
          <span>目标角色（可多选）-- 右键可打开角色配置文件夹</span>
          <span className="selection-count">已选 {targetRoles.length} 个</span>
        </h2>

        <input
          type="text"
          className="search-input"
          placeholder="搜索角色名..."
          value={targetSearch}
          onChange={(e) => setTargetSearch(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          disabled={disabled}
        />

        <div className="filters">
          <select
            value={filters.account}
            onChange={(e) => setFilters({ ...filters, account: e.target.value })}
            disabled={disabled}
          >
            <option value="">所有账号</option>
            {filterOptions.accounts.map(acc => (
              <option key={acc} value={acc}>{acc}</option>
            ))}
          </select>

          <select
            value={filters.region}
            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
            disabled={disabled}
          >
            <option value="">所有大区</option>
            {filterOptions.regions.map(reg => (
              <option key={reg} value={reg}>{reg}</option>
            ))}
          </select>

          <select
            value={filters.server}
            onChange={(e) => setFilters({ ...filters, server: e.target.value })}
            disabled={disabled}
          >
            <option value="">所有服务器</option>
            {filterOptions.servers.map(srv => (
              <option key={srv} value={srv}>{srv}</option>
            ))}
          </select>
        </div>

        <div className="role-list">
          {filteredTargetRoles.map(role => (
            <div
              key={role.path}
              className={`role-item ${targetRoles.some(t => t.path === role.path) ? 'selected' : ''}`}
              onClick={(e) => !disabled && handleTargetToggle(role, e)}
              onContextMenu={(e) => handleContextMenu(e, role)}
            >
              <input
                type="checkbox"
                checked={targetRoles.some(t => t.path === role.path)}
                onChange={() => {}}
                disabled={disabled}
              />
              <span>{roleDisplay(role)}</span>
            </div>
          ))}
        </div>
      </div>

      {contextMenu && (
        <div
          className="context-menu"
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 1000
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleOpenFolder(contextMenu.role.path);
            setContextMenu(null);
          }}
        >
          <div className="context-menu-item">
            📁 打开配置文件夹
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleSelector;
