"""
数据模型定义
"""
from dataclasses import dataclass
from pathlib import Path
from typing import Optional


@dataclass
class RoleInfo:
    """角色信息"""
    account: str
    region: str
    server: str
    role: str
    path: str

    def __str__(self):
        return f"{self.account}-{self.region}-{self.server}-{self.role}"

    def to_dict(self):
        return {
            'account': self.account,
            'region': self.region,
            'server': self.server,
            'role': self.role,
            'path': self.path
        }

    @staticmethod
    def from_dict(data):
        return RoleInfo(**data)


@dataclass
class BackupInfo:
    """备份信息"""
    name: str
    path: str
    size: int
    created_at: str
    role_info: str

    def to_dict(self):
        return {
            'name': self.name,
            'path': self.path,
            'size': self.size,
            'created_at': self.created_at,
            'role_info': self.role_info
        }
