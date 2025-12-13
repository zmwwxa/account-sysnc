"""
Backend package initialization
"""
from .models import RoleInfo, BackupInfo
from .path_resolver import PathResolver
from .role_scanner import RoleScanner
from .role_copier import RoleCopier
from .backup_manager import BackupManager
from .config_manager import ConfigManager

__all__ = [
    'RoleInfo',
    'BackupInfo',
    'PathResolver',
    'RoleScanner',
    'RoleCopier',
    'BackupManager',
    'ConfigManager'
]
