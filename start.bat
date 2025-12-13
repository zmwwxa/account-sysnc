@echo off
chcp 65001 >nul
echo ================================
echo 剑网三角色配置同步工具
echo by 孤月伴云流
echo ================================
echo.

echo [1/3] 检查 Python 依赖...
cd backend
pip show Flask >nul 2>&1
if %errorlevel% neq 0 (
    echo 正在安装 Python 依赖...
    pip install -r requirements.txt
)

echo.
echo [2/3] 启动 Python 后端服务...
start "JX3 Sync Backend" python app.py

echo.
echo [3/3] 等待后端启动...
timeout /t 3 /nobreak >nul

echo.
echo 检查 Node.js 依赖...
cd ..\frontend
if not exist node_modules (
    echo 正在安装 Node.js 依赖（首次运行需要较长时间）...
    call npm install
)

echo.
echo 启动 Electron 应用...
npm run electron:dev

echo.
echo 应用已关闭
pause
