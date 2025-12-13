"""
角色扫描模块
扫描和识别所有游戏角色
"""
from pathlib import Path
from typing import List
from .models import RoleInfo


class RoleScanner:
    """角色扫描器"""

    def __init__(self, userdata_path: str):
        """
        初始化扫描器

        Args:
            userdata_path: userdata 目录路径
        """
        self.userdata_path = Path(userdata_path)

    def scan_all_roles(self) -> List[RoleInfo]:
        """
        扫描所有角色

        Returns:
            角色信息列表
        """
        roles = []

        if not self.userdata_path.exists():
            return roles

        try:
            # 遍历账号文件夹
            for account_folder in self.userdata_path.iterdir():
                if not account_folder.is_dir():
                    continue

                # 检查是否为本地数据（有子文件夹）
                subdirs = [d for d in account_folder.iterdir() if d.is_dir()]
                if len(subdirs) == 0:
                    continue  # 跳过服务器数据

                # 遍历大区
                for region_folder in account_folder.iterdir():
                    if not region_folder.is_dir():
                        continue

                    # 遍历服务器
                    for server_folder in region_folder.iterdir():
                        if not server_folder.is_dir():
                            continue

                        # 遍历角色
                        for role_folder in server_folder.iterdir():
                            if not role_folder.is_dir():
                                continue

                            role_info = RoleInfo(
                                account=account_folder.name,
                                region=region_folder.name,
                                server=server_folder.name,
                                role=role_folder.name,
                                path=str(role_folder)
                            )
                            roles.append(role_info)

        except Exception as e:
            print(f"扫描角色失败: {e}")

        return roles

    def get_accounts(self, roles: List[RoleInfo]) -> List[str]:
        """获取所有账号"""
        return sorted(set(role.account for role in roles))

    def get_regions(self, roles: List[RoleInfo]) -> List[str]:
        """获取所有大区"""
        return sorted(set(role.region for role in roles))

    def get_servers(self, roles: List[RoleInfo]) -> List[str]:
        """获取所有服务器"""
        return sorted(set(role.server for role in roles))

    def filter_roles(self, roles: List[RoleInfo], account: str = None,
                     region: str = None, server: str = None) -> List[RoleInfo]:
        """
        过滤角色

        Args:
            roles: 角色列表
            account: 账号过滤
            region: 大区过滤
            server: 服务器过滤

        Returns:
            过滤后的角色列表
        """
        filtered = roles

        if account:
            filtered = [r for r in filtered if r.account == account]
        if region:
            filtered = [r for r in filtered if r.region == region]
        if server:
            filtered = [r for r in filtered if r.server == server]

        return filtered
