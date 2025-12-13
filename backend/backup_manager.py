"""
备份管理模块
处理角色数据的备份和还原
"""
import shutil
from pathlib import Path
from datetime import datetime
from typing import List
from .models import RoleInfo, BackupInfo


class BackupManager:
    """备份管理器"""

    def __init__(self, userdata_path: str, max_backups: int = 5, backup_dir: str = None):
        """
        初始化备份管理器

        Args:
            userdata_path: userdata 目录路径
            max_backups: 每个角色最多保留的备份数量
            backup_dir: 自定义备份目录路径，如果不指定则使用默认路径
        """
        self.userdata_path = Path(userdata_path)

        # 如果指定了备份目录，使用指定的；否则使用默认的游戏目录下的备份
        if backup_dir:
            self.backup_dir = Path(backup_dir)
        else:
            self.backup_dir = self.userdata_path.parent / "userdata_backup"

        self.max_backups = max_backups

        # 确保备份目录存在
        self.backup_dir.mkdir(parents=True, exist_ok=True)

    def backup_role(self, role: RoleInfo) -> dict:
        """
        备份角色数据

        Args:
            role: 角色信息

        Returns:
            操作结果 {'success': bool, 'message': str, 'backup_path': str}
        """
        try:
            role_path = Path(role.path)

            if not role_path.exists():
                return {'success': False, 'message': '角色路径不存在'}

            # 生成备份名称
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_name = f"{role.account}_{role.region}_{role.server}_{role.role}_{timestamp}"
            backup_path = self.backup_dir / backup_name

            # 复制到备份目录
            shutil.copytree(role_path, backup_path)

            # 清理旧备份
            self.cleanup_old_backups(role)

            return {
                'success': True,
                'message': '备份成功',
                'backup_path': str(backup_path)
            }

        except Exception as e:
            return {'success': False, 'message': f'备份失败: {str(e)}'}

    def cleanup_old_backups(self, role: RoleInfo):
        """
        清理旧备份，只保留最近的 max_backups 个

        Args:
            role: 角色信息
        """
        prefix = f"{role.account}_{role.region}_{role.server}_{role.role}_"
        backups = sorted(
            [d for d in self.backup_dir.iterdir()
             if d.is_dir() and d.name.startswith(prefix)],
            key=lambda x: x.stat().st_mtime,
            reverse=True
        )

        # 删除超过限制的旧备份
        for old_backup in backups[self.max_backups:]:
            try:
                shutil.rmtree(old_backup)
            except Exception as e:
                print(f"删除旧备份失败: {e}")

    def list_backups(self, limit: int = None) -> List[BackupInfo]:
        """
        列出所有备份

        Args:
            limit: 限制返回数量

        Returns:
            备份信息列表
        """
        backups = []

        try:
            backup_dirs = sorted(
                [d for d in self.backup_dir.iterdir() if d.is_dir()],
                key=lambda x: x.stat().st_mtime,
                reverse=True
            )

            if limit:
                backup_dirs = backup_dirs[:limit]

            for backup_dir in backup_dirs:
                size = self._get_dir_size(backup_dir)
                created_at = datetime.fromtimestamp(
                    backup_dir.stat().st_mtime
                ).strftime("%Y-%m-%d %H:%M:%S")

                # 从文件夹名称解析角色信息
                parts = backup_dir.name.rsplit('_', 2)
                role_info = parts[0] if parts else backup_dir.name

                backup = BackupInfo(
                    name=backup_dir.name,
                    path=str(backup_dir),
                    size=size,
                    created_at=created_at,
                    role_info=role_info
                )
                backups.append(backup)

        except Exception as e:
            print(f"列出备份失败: {e}")

        return backups

    def restore_backup(self, backup_name: str, target_role: RoleInfo) -> dict:
        """
        还原备份

        Args:
            backup_name: 备份名称
            target_role: 目标角色

        Returns:
            操作结果 {'success': bool, 'message': str}
        """
        try:
            backup_path = self.backup_dir / backup_name
            target_path = Path(target_role.path)

            if not backup_path.exists():
                return {'success': False, 'message': '备份不存在'}

            # 删除目标目录
            if target_path.exists():
                shutil.rmtree(target_path)

            # 复制备份到目标
            shutil.copytree(backup_path, target_path)

            return {'success': True, 'message': '还原成功'}

        except Exception as e:
            return {'success': False, 'message': f'还原失败: {str(e)}'}

    def delete_backup(self, backup_name: str) -> dict:
        """
        删除备份

        Args:
            backup_name: 备份名称

        Returns:
            操作结果 {'success': bool, 'message': str}
        """
        try:
            backup_path = self.backup_dir / backup_name

            if not backup_path.exists():
                return {'success': False, 'message': '备份不存在'}

            shutil.rmtree(backup_path)

            return {'success': True, 'message': '删除成功'}

        except Exception as e:
            return {'success': False, 'message': f'删除失败: {str(e)}'}

    @staticmethod
    def _get_dir_size(path: Path) -> int:
        """获取目录大小（字节）"""
        total = 0
        try:
            for entry in path.rglob('*'):
                if entry.is_file():
                    total += entry.stat().st_size
        except Exception:
            pass
        return total
