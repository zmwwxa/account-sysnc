"""
Flask API 服务
提供 REST API 供 Electron 前端调用
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from pathlib import Path
import sys

# 添加父目录到路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend import (
    PathResolver, RoleScanner, RoleCopier, BackupManager,
    ConfigManager, RoleInfo
)

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 全局实例
config_manager = ConfigManager()
role_scanner = None
role_copier = RoleCopier()
backup_manager = None


# ===== 路径相关 API =====

@app.route('/api/path/parse-shortcut', methods=['POST'])
def parse_shortcut():
    """解析快捷方式"""
    data = request.json
    lnk_path = data.get('path')

    if not lnk_path:
        return jsonify({'error': '缺少路径参数'}), 400

    try:
        target_path = PathResolver.parse_shortcut(lnk_path)
        if target_path:
            return jsonify({'success': True, 'target_path': target_path})
        else:
            return jsonify({'success': False, 'error': '解析失败'}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/path/resolve-game', methods=['POST'])
def resolve_game_path():
    """解析游戏路径"""
    data = request.json
    base_path = data.get('path')

    if not base_path:
        return jsonify({'error': '缺少路径参数'}), 400

    userdata_path = PathResolver.resolve_game_path(base_path)

    if userdata_path:
        # 保存配置
        config_manager.set('userdata_path', str(userdata_path))
        config_manager.set('game_path', base_path)
        config_manager.save()

        # 初始化扫描器和备份管理器
        global role_scanner, backup_manager
        role_scanner = RoleScanner(str(userdata_path))
        backup_manager = BackupManager(str(userdata_path))

        return jsonify({
            'success': True,
            'userdata_path': str(userdata_path)
        })
    else:
        return jsonify({
            'success': False,
            'error': '未找到 userdata 目录'
        }), 404


# ===== 角色相关 API =====

@app.route('/api/roles/scan', methods=['GET'])
def scan_roles():
    """扫描所有角色"""
    if not role_scanner:
        return jsonify({'error': '未设置游戏路径'}), 400

    try:
        roles = role_scanner.scan_all_roles()
        return jsonify({
            'success': True,
            'roles': [role.to_dict() for role in roles],
            'count': len(roles)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/roles/filters', methods=['GET'])
def get_filters():
    """获取过滤器选项"""
    if not role_scanner:
        return jsonify({'error': '未设置游戏路径'}), 400

    try:
        roles = role_scanner.scan_all_roles()
        return jsonify({
            'accounts': role_scanner.get_accounts(roles),
            'regions': role_scanner.get_regions(roles),
            'servers': role_scanner.get_servers(roles)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ===== 复制相关 API =====

@app.route('/api/copy/validate', methods=['POST'])
def validate_copy():
    """验证复制操作"""
    data = request.json
    source = RoleInfo.from_dict(data.get('source'))
    target = RoleInfo.from_dict(data.get('target'))

    result = RoleCopier.validate_copy(source, target)
    return jsonify(result)


@app.route('/api/copy/single', methods=['POST'])
def copy_single():
    """复制到单个角色"""
    data = request.json
    source = RoleInfo.from_dict(data.get('source'))
    target = RoleInfo.from_dict(data.get('target'))
    auto_backup = data.get('auto_backup', True)

    try:
        # 备份
        if auto_backup and backup_manager:
            backup_result = backup_manager.backup_role(target)
            if not backup_result['success']:
                return jsonify({
                    'success': False,
                    'error': f"备份失败: {backup_result['message']}"
                }), 500

        # 复制
        result = role_copier.copy_role(source, target)
        return jsonify(result)

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/copy/multiple', methods=['POST'])
def copy_multiple():
    """复制到多个角色"""
    data = request.json
    source = RoleInfo.from_dict(data.get('source'))
    targets = [RoleInfo.from_dict(t) for t in data.get('targets', [])]
    auto_backup = data.get('auto_backup', True)

    try:
        # 先备份所有目标
        if auto_backup and backup_manager:
            for target in targets:
                backup_manager.backup_role(target)

        # 执行复制
        result = role_copier.copy_to_multiple(source, targets)
        return jsonify({
            'success': True,
            'success_count': result['success_count'],
            'failed': result['failed']
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ===== 备份相关 API =====

@app.route('/api/backup/list', methods=['GET'])
def list_backups():
    """列出所有备份"""
    if not backup_manager:
        return jsonify({'error': '未设置游戏路径'}), 400

    limit = request.args.get('limit', type=int)
    backups = backup_manager.list_backups(limit)

    return jsonify({
        'backups': [b.to_dict() for b in backups],
        'count': len(backups)
    })


@app.route('/api/backup/restore', methods=['POST'])
def restore_backup():
    """还原备份"""
    if not backup_manager:
        return jsonify({'error': '未设置游戏路径'}), 400

    data = request.json
    backup_name = data.get('backup_name')
    target = RoleInfo.from_dict(data.get('target'))

    result = backup_manager.restore_backup(backup_name, target)
    return jsonify(result)


@app.route('/api/backup/delete', methods=['POST'])
def delete_backup():
    """删除备份"""
    if not backup_manager:
        return jsonify({'error': '未设置游戏路径'}), 400

    data = request.json
    backup_name = data.get('backup_name')

    result = backup_manager.delete_backup(backup_name)
    return jsonify(result)


# ===== 配置相关 API =====

@app.route('/api/config/get', methods=['GET'])
def get_config():
    """获取配置"""
    return jsonify(config_manager.config)


@app.route('/api/config/set', methods=['POST'])
def set_config():
    """设置配置"""
    data = request.json
    config_manager.update(**data)
    config_manager.save()

    return jsonify({'success': True})


# ===== 健康检查 =====

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查"""
    return jsonify({
        'status': 'ok',
        'version': '1.0.0',
        'has_userdata': role_scanner is not None
    })


def main():
    """启动 Flask 服务"""
    # 尝试加载上次的配置
    userdata_path = config_manager.get('userdata_path')
    if userdata_path and Path(userdata_path).exists():
        global role_scanner, backup_manager
        role_scanner = RoleScanner(userdata_path)
        backup_manager = BackupManager(userdata_path)

    app.run(host='127.0.0.1', port=5000, debug=False)


if __name__ == '__main__':
    main()
