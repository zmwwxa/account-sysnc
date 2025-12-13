# 快速入门指南

## 方式一：使用启动脚本（推荐）

**最简单的方式！**

1. 双击运行 `start.bat`
2. 脚本会自动：
   - 检查并安装 Python 依赖
   - 启动后端服务
   - 检查并安装 Node.js 依赖（首次运行）
   - 启动 Electron 应用

## 方式二：手动启动

### 步骤 1：安装依赖

**Python 依赖：**
```bash
cd backend
pip install -r requirements.txt
```

**Node.js 依赖（首次运行）：**
```bash
cd frontend
npm install
```

### 步骤 2：启动应用

**终端 1 - 启动后端：**
```bash
cd backend
python app.py
```

**终端 2 - 启动前端：**
```bash
cd frontend
npm run electron:dev
```

## 首次运行注意事项

1. **确保已安装**：
   - Python 3.7+
   - Node.js 16+
   - npm

2. **首次安装 Node.js 依赖需要时间**：
   - 可能需要 5-10 分钟
   - 需要稳定的网络连接
   - 如果下载慢，可以考虑使用 npm 镜像：
     ```bash
     npm config set registry https://registry.npmmirror.com
     ```

3. **端口占用**：
   - 后端使用 5000 端口
   - 前端开发服务器使用 5173 端口
   - 确保这些端口未被占用

## 常见问题

### 1. 提示找不到 Python

确保 Python 已添加到系统 PATH 环境变量。

### 2. 提示找不到 npm

安装 Node.js 时勾选"Add to PATH"选项。

### 3. npm install 失败

尝试：
```bash
npm config set registry https://registry.npmmirror.com
npm install
```

### 4. 后端启动失败

检查是否已安装所有 Python 依赖：
```bash
pip install Flask flask-cors pywin32 psutil
```

### 5. 应用无法连接后端

确保后端服务已启动并运行在 http://127.0.0.1:5000

## 开发模式 vs 生产模式

**开发模式**（当前使用）：
- 前端可热更新
- 可以打开开发者工具调试
- 需要同时运行后端和前端

**生产模式**（打包后）：
```bash
cd frontend
npm run dist
```
- 生成独立的安装程序
- 无需手动启动后端
- 适合发布给其他用户

## 下一步

启动成功后：
1. 拖入剑网三快捷方式设置路径
2. 选择源角色和目标角色
3. 点击"开始同步"

享受使用！ 🎮
