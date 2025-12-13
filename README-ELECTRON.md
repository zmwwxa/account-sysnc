# 剑网三角色配置同步工具 (Electron 版)

一个现代化的剑网三角色配置同步工具，使用 Electron + React + Python 构建。

## 技术栈

- **前端**: Electron + React + Vite
- **后端**: Python + Flask
- **UI**: 现代化渐变设计

## 项目结构

```
jx3-role-sync/
├── backend/                 # Python 后端
│   ├── models.py           # 数据模型
│   ├── path_resolver.py    # 路径解析
│   ├── role_scanner.py     # 角色扫描
│   ├── role_copier.py      # 角色复制
│   ├── backup_manager.py   # 备份管理
│   ├── config_manager.py   # 配置管理
│   ├── app.py              # Flask API 服务
│   └── requirements.txt    # Python 依赖
├── frontend/               # Electron + React 前端
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── App.jsx         # 主应用
│   │   ├── api.js          # API 服务层
│   │   └── main.jsx        # 入口文件
│   ├── electron/
│   │   └── main.js         # Electron 主进程
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 功能特性

- ✅ 现代化 UI 界面
- ✅ 拖放快捷方式识别路径
- ✅ 智能角色扫描
- ✅ 批量复制配置
- ✅ 自动备份管理
- ✅ 过滤和筛选功能
- ✅ 模块化代码架构

## 安装步骤

### 1. 安装 Python 依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 安装 Node.js 依赖

```bash
cd frontend
npm install
```

## 运行方法

### 开发模式

1. 启动后端服务：

```bash
cd backend
python app.py
```

2. 启动前端（新终端）：

```bash
cd frontend
npm start
```

这会自动启动 Vite 开发服务器和 Electron 窗口。

### 生产模式打包

```bash
cd frontend
npm run dist
```

打包后的安装程序在 `frontend/dist-electron/` 目录。

## 使用说明

### 1. 设置游戏路径

- 拖入剑网三快捷方式到拖放区域
- 或点击"手动选择游戏目录"

### 2. 选择角色

- 从下拉框选择源角色
- 在列表中选择一个或多个目标角色
- 使用过滤器快速筛选

### 3. 开始同步

- 检查选项（自动备份等）
- 点击"开始同步"按钮

### 4. 备份管理

- 点击"备份管理"查看所有备份
- 支持删除旧备份

## API 说明

后端提供 REST API 服务，运行在 `http://127.0.0.1:5000`

### 主要端点

- `POST /api/path/parse-shortcut` - 解析快捷方式
- `POST /api/path/resolve-game` - 解析游戏路径
- `GET /api/roles/scan` - 扫描所有角色
- `GET /api/roles/filters` - 获取过滤器选项
- `POST /api/copy/multiple` - 批量复制角色
- `GET /api/backup/list` - 列出备份
- `POST /api/backup/delete` - 删除备份
- `GET /api/config/get` - 获取配置
- `POST /api/config/set` - 设置配置

## 模块说明

### Backend 模块

- **models.py**: 定义 RoleInfo 和 BackupInfo 数据模型
- **path_resolver.py**: 处理快捷方式解析和路径识别
- **role_scanner.py**: 扫描和过滤角色
- **role_copier.py**: 执行角色数据复制
- **backup_manager.py**: 管理备份创建、列表、删除
- **config_manager.py**: 配置文件读写
- **app.py**: Flask API 服务入口

### Frontend 组件

- **PathSelector**: 路径选择组件
- **RoleSelector**: 角色选择组件
- **CopyOptions**: 复制选项组件
- **BackupManager**: 备份管理弹窗

## 开发说明

### 修改后端

1. 修改 `backend/` 下的相关模块
2. 重启 Flask 服务

### 修改前端

1. 修改 `frontend/src/` 下的组件
2. Vite 会自动热更新

### 添加新功能

1. 后端：在对应模块添加方法，在 `app.py` 添加 API 端点
2. 前端：在 `api.js` 添加请求方法，在组件中调用

## 故障排除

### 端口冲突

- Flask 默认端口: 5000
- Vite 默认端口: 5173

如需修改，请更新相应配置文件。

### 跨域问题

后端已配置 CORS，允许前端跨域请求。

### Python 进程未关闭

Electron 退出时会自动关闭 Python 进程，如有残留可手动结束。

## 许可证

本项目为开源免费软件，仅供学习交流使用。

## 作者

by 孤月伴云流