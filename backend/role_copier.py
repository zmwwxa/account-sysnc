"""
角色复制模块
处理角色数据的复制操作
"""
import shutil
from pathlib import Path
from typing import List, Callable, Optional
from .models import RoleInfo


class RoleCopier:
    """角色复制器"""

    def __init__(self):
        self.progress_callback: Optional[Callable] = None

    def set_progress_callback(self, callback: Callable):
        """
        设置进度回调函数

        Args:
            callback: 回调函数，接收 (current, total, message) 参数
        """
        self.progress_callback = callback

    def copy_role(self, source: RoleInfo, target: RoleInfo) -> dict:
        """
        复制单个角色数据

        Args:
            source: 源角色
            target: 目标角色

        Returns:
            操作结果 {'success': bool, 'message': str}
        """
        try:
            source_path = Path(source.path)
            target_path = Path(target.path)

            # 验证源路径
            if not source_path.exists():
                return {'success': False, 'message': f'源路径不存在: {source_path}'}

            # 删除目标目录
            if target_path.exists():
                shutil.rmtree(target_path)

            # 复制目录
            shutil.copytree(source_path, target_path)

            return {'success': True, 'message': '复制成功'}

        except Exception as e:
            return {'success': False, 'message': f'复制失败: {str(e)}'}

    def copy_to_multiple(self, source: RoleInfo, targets: List[RoleInfo]) -> dict:
        """
        复制到多个目标角色

        Args:
            source: 源角色
            targets: 目标角色列表

        Returns:
            操作结果 {'success_count': int, 'failed': List[dict]}
        """
        success_count = 0
        failed_list = []
        total = len(targets)

        for i, target in enumerate(targets):
            if self.progress_callback:
                self.progress_callback(i, total, f"正在复制到: {target}")

            result = self.copy_role(source, target)

            if result['success']:
                success_count += 1
            else:
                failed_list.append({
                    'role': str(target),
                    'error': result['message']
                })

        if self.progress_callback:
            self.progress_callback(total, total, "复制完成")

        return {
            'success_count': success_count,
            'failed': failed_list
        }

    @staticmethod
    def validate_copy(source: RoleInfo, target: RoleInfo) -> dict:
        """
        验证复制操作是否可行

        Args:
            source: 源角色
            target: 目标角色

        Returns:
            验证结果 {'valid': bool, 'message': str}
        """
        source_path = Path(source.path)
        target_path = Path(target.path)

        # 检查源路径
        if not source_path.exists():
            return {'valid': False, 'message': '源角色路径不存在'}

        # 检查是否为同一路径
        if source_path == target_path:
            return {'valid': False, 'message': '源和目标不能相同'}

        # 检查目标父目录
        if not target_path.parent.exists():
            return {'valid': False, 'message': '目标父目录不存在'}

        return {'valid': True, 'message': '验证通过'}
