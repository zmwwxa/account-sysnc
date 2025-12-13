/**
 * API 服务层
 * 与 Python 后端通信
 */

const API_BASE_URL = 'http://127.0.0.1:5000/api';

class ApiService {
  /**
   * 通用请求方法
   */
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '请求失败');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ===== 路径相关 =====

  static async parseShortcut(path) {
    return this.request('/path/parse-shortcut', {
      method: 'POST',
      body: JSON.stringify({ path }),
    });
  }

  static async resolveGamePath(path) {
    return this.request('/path/resolve-game', {
      method: 'POST',
      body: JSON.stringify({ path }),
    });
  }

  // ===== 角色相关 =====

  static async scanRoles() {
    return this.request('/roles/scan');
  }

  static async getFilters() {
    return this.request('/roles/filters');
  }

  // ===== 复制相关 =====

  static async validateCopy(source, target) {
    return this.request('/copy/validate', {
      method: 'POST',
      body: JSON.stringify({ source, target }),
    });
  }

  static async copySingle(source, target, autoBackup = true) {
    return this.request('/copy/single', {
      method: 'POST',
      body: JSON.stringify({ source, target, auto_backup: autoBackup }),
    });
  }

  static async copyMultiple(source, targets, autoBackup = true) {
    return this.request('/copy/multiple', {
      method: 'POST',
      body: JSON.stringify({ source, targets, auto_backup: autoBackup }),
    });
  }

  // ===== 备份相关 =====

  static async getBackupPath() {
    return this.request('/backup/get-path');
  }

  static async listBackups(limit = null) {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/backup/list${params}`);
  }

  static async restoreBackup(backupName, target) {
    return this.request('/backup/restore', {
      method: 'POST',
      body: JSON.stringify({ backup_name: backupName, target }),
    });
  }

  static async deleteBackup(backupName) {
    return this.request('/backup/delete', {
      method: 'POST',
      body: JSON.stringify({ backup_name: backupName }),
    });
  }

  // ===== 配置相关 =====

  static async getConfig() {
    return this.request('/config/get');
  }

  static async setConfig(config) {
    return this.request('/config/set', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  // ===== 健康检查 =====

  static async healthCheck() {
    return this.request('/health');
  }
}

export default ApiService;
