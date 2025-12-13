import React, { useState, useEffect } from 'react';
import ApiService from '../api';

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

  const handleSourceChange = (e) => {
    const role = roles.find(r => r.path === e.target.value);
    onSourceChange(role);
    // 清除目标选择中的源角色
    const newTargets = targetRoles.filter(t => t.path !== role?.path);
    onTargetChange(newTargets);
  };

  const handleTargetToggle = (role) => {
    // 不能选择源角色
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
    if (sourceRole && role.path === sourceRole.path) return false; // 排除源角色
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
          onChange={(e) => setSourceSearch(e.target.value)}
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
      </div>

      <div className="target-section">
        <h2>目标角色（可多选）</h2>

        <input
          type="text"
          className="search-input"
          placeholder="搜索角色名..."
          value={targetSearch}
          onChange={(e) => setTargetSearch(e.target.value)}
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
              onClick={() => !disabled && handleTargetToggle(role)}
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

        <div className="selection-info">
          已选择 {targetRoles.length} 个目标角色
        </div>
      </div>
    </div>
  );
}

export default RoleSelector;
