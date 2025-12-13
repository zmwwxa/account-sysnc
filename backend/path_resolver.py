"""
路径解析模块
处理快捷方式解析和游戏路径定位
"""
import os
from pathlib import Path
from typing import Optional

try:
    import win32com.client
    import pythoncom
    HAS_WIN32 = True
except ImportError:
    HAS_WIN32 = False


class PathResolver:
    """路径解析器"""

    @staticmethod
    def parse_shortcut(lnk_path: str) -> Optional[str]:
        """
        解析快捷方式获取目标路径

        Args:
            lnk_path: 快捷方式文件路径

        Returns:
            目标程序路径，失败返回 None
        """
        if not HAS_WIN32:
            raise ImportError("需要安装 pywin32 库来解析快捷方式")

        try:
            print(f"[DEBUG] 尝试解析快捷方式: {lnk_path}")
            print(f"[DEBUG] 文件存在: {os.path.exists(lnk_path)}")

            # 初始化 COM（在多线程环境中需要）
            pythoncom.CoInitialize()

            try:
                shell = win32com.client.Dispatch("WScript.Shell")
                shortcut = shell.CreateShortCut(lnk_path)
                target_path = shortcut.TargetPath

                print(f"[DEBUG] 解析成功，目标路径: {target_path}")
                return target_path if target_path else None
            finally:
                # 清理 COM
                pythoncom.CoUninitialize()

        except Exception as e:
            print(f"[ERROR] 解析快捷方式失败: {e}")
            import traceback
            traceback.print_exc()
            return None

    @staticmethod
    def resolve_game_path(base_path: str) -> Optional[Path]:
        """
        从基础路径解析游戏 userdata 路径

        Args:
            base_path: 游戏根目录或 SeasunGame.exe 路径

        Returns:
            userdata 目录路径，失败返回 None
        """
        base_path = Path(base_path)

        # 如果是 .exe 文件，提取目录
        if base_path.is_file() and base_path.suffix.lower() == '.exe':
            base_path = base_path.parent

        # 尝试可能的 userdata 路径
        possible_paths = [
            base_path / "Game" / "JX3" / "bin" / "zhcn_hd" / "userdata",
            base_path / "Game" / "JX3" / "bin" / "zhcn" / "userdata",
        ]

        for path in possible_paths:
            if path.exists() and path.is_dir():
                return path

        return None

    @staticmethod
    def validate_userdata_path(userdata_path: str) -> bool:
        """
        验证 userdata 路径是否有效

        Args:
            userdata_path: userdata 目录路径

        Returns:
            是否有效
        """
        path = Path(userdata_path)
        if not path.exists() or not path.is_dir():
            return False

        # 检查是否有账号文件夹
        subdirs = [d for d in path.iterdir() if d.is_dir()]
        return len(subdirs) > 0
