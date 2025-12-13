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
        使用路径穿透方式查找 bin/zhcn_hd/userdata 或 bin/zhcn/userdata

        Args:
            base_path: 游戏根目录或 SeasunGame.exe 路径

        Returns:
            userdata 目录路径，失败返回 None
        """
        base_path = Path(base_path)

        # 如果是 .exe 文件，提取目录
        if base_path.is_file() and base_path.suffix.lower() == '.exe':
            base_path = base_path.parent

        print(f"[DEBUG] 开始查找 userdata，起始路径: {base_path}")

        # 目标路径模式（优先高清版）
        target_patterns = [
            ("bin", "zhcn_hd", "userdata"),
            ("bin", "zhcn", "userdata"),
        ]

        # 策略1：从当前路径向上遍历，查找包含目标路径的位置
        current = base_path
        max_depth = 10  # 最多向上查找10层

        for level in range(max_depth):
            print(f"[DEBUG] 向上查找第 {level} 层: {current}")

            # 在当前层级查找目标路径
            for pattern in target_patterns:
                candidate = current
                for part in pattern:
                    candidate = candidate / part

                if candidate.exists() and candidate.is_dir():
                    print(f"[DEBUG] 找到 userdata 路径: {candidate}")
                    return candidate

            # 向上一层
            parent = current.parent
            if parent == current:  # 已到根目录
                break
            current = parent

        # 策略2：向下递归查找（深度优先）
        print(f"[DEBUG] 向上查找失败，尝试向下递归查找...")
        return PathResolver._search_userdata_downward(base_path, target_patterns)

    @staticmethod
    def _search_userdata_downward(base_path: Path, target_patterns: list, max_depth: int = 5) -> Optional[Path]:
        """
        向下递归查找 userdata 路径

        Args:
            base_path: 起始路径
            target_patterns: 目标路径模式列表
            max_depth: 最大递归深度

        Returns:
            userdata 目录路径，失败返回 None
        """
        if max_depth <= 0:
            return None

        try:
            # 检查当前路径是否匹配任何模式
            for pattern in target_patterns:
                candidate = base_path
                for part in pattern:
                    candidate = candidate / part

                if candidate.exists() and candidate.is_dir():
                    print(f"[DEBUG] 向下找到 userdata 路径: {candidate}")
                    return candidate

            # 递归查找子目录
            for item in base_path.iterdir():
                if item.is_dir() and not item.name.startswith('.'):
                    result = PathResolver._search_userdata_downward(item, target_patterns, max_depth - 1)
                    if result:
                        return result

        except (PermissionError, OSError) as e:
            print(f"[DEBUG] 跳过目录 {base_path}: {e}")

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
