"""
配置管理模块
处理应用配置的保存和加载
"""
import json
from pathlib import Path
from typing import Optional


class ConfigManager:
    """配置管理器"""

    DEFAULT_CONFIG = {
        'game_path': '',
        'userdata_path': '',
        'auto_backup': True,
        'confirm_before_copy': True,
        'max_backups': 5,
        'version': '1.0.0'
    }

    def __init__(self, config_file: str = 'jx3_sync_config.json'):
        """
        初始化配置管理器

        Args:
            config_file: 配置文件路径
        """
        self.config_file = Path(config_file)
        self.config = self.DEFAULT_CONFIG.copy()
        self.load()

    def load(self) -> dict:
        """
        加载配置

        Returns:
            配置字典
        """
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    loaded = json.load(f)
                    self.config.update(loaded)
            except Exception as e:
                print(f"加载配置失败: {e}")

        return self.config

    def save(self) -> bool:
        """
        保存配置

        Returns:
            是否保存成功
        """
        try:
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"保存配置失败: {e}")
            return False

    def get(self, key: str, default=None):
        """获取配置项"""
        return self.config.get(key, default)

    def set(self, key: str, value):
        """设置配置项"""
        self.config[key] = value

    def update(self, **kwargs):
        """批量更新配置"""
        self.config.update(kwargs)

    def reset(self):
        """重置为默认配置"""
        self.config = self.DEFAULT_CONFIG.copy()
