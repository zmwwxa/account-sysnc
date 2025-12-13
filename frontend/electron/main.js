const { app, BrowserWindow, ipcMain, dialog, shell, protocol } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const kill = require('tree-kill');
const fs = require('fs');

let mainWindow;
let pythonProcess;

// 启动 Python 后端服务
function startPythonBackend() {
  let pythonBackend;

  // 检查是否是打包后的环境
  const isPacked = app.isPackaged;

  if (isPacked) {
    // 打包后：使用打包的 exe 文件
    pythonBackend = path.join(process.resourcesPath, 'backend', 'jx3-backend.exe');
    console.log('Using packaged Python backend:', pythonBackend);
    pythonProcess = spawn(pythonBackend);
  } else {
    // 开发环境：使用 Python 脚本
    const pythonScript = path.join(__dirname, '..', '..', 'backend', 'app.py');
    console.log('Using Python script:', pythonScript);
    pythonProcess = spawn('python', ['-B', pythonScript]);
  }

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
  });

  // 等待后端服务启动
  return new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });
}

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    titleBarStyle: 'default',
    title: '剑网三角色配置同步工具 by 孤月伴云流'
  });

  // 开发模式加载 Vite 开发服务器
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // 生产模式加载打包后的文件
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 处理文件选择对话框
ipcMain.handle('dialog:openDirectory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// 处理文件对话框
ipcMain.handle('dialog:openFile', async (event, filters) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: filters || []
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// 打开文件夹
ipcMain.handle('shell:openPath', async (event, folderPath) => {
  try {
    const result = await shell.openPath(folderPath);
    if (result) {
      return { success: false, error: result };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 应用启动
app.whenReady().then(async () => {
  // 注册本地资源协议
  protocol.registerFileProtocol('local-resource', (request, callback) => {
    const url = request.url.replace('local-resource://', '');
    const resourcePath = app.isPackaged
      ? path.join(process.resourcesPath, url)
      : path.join(__dirname, '..', 'public', url);
    callback({ path: resourcePath });
  });

  // 启动 Python 后端
  await startPythonBackend();

  // 创建窗口
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 应用退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', (event) => {
  // 阻止默认退出，先清理进程
  if (pythonProcess && pythonProcess.pid) {
    event.preventDefault();

    console.log('Killing Python process tree, PID:', pythonProcess.pid);

    // 在Windows上，强制使用taskkill来确保进程被杀死
    if (process.platform === 'win32') {
      const { exec } = require('child_process');
      exec(`taskkill /F /T /PID ${pythonProcess.pid}`, (error) => {
        if (error) {
          console.error('taskkill error:', error);
        }
        // 额外确保 jx3-backend.exe 被杀死
        exec('taskkill /F /IM jx3-backend.exe /T', (err2) => {
          if (err2 && !err2.message.includes('not found')) {
            console.error('Failed to kill jx3-backend.exe:', err2);
          }
          setTimeout(() => {
            pythonProcess = null;
            app.quit();
          }, 500);
        });
      });
    } else {
      // 非Windows平台使用tree-kill
      kill(pythonProcess.pid, 'SIGKILL', (err) => {
        if (err) {
          console.error('Failed to kill process tree:', err);
        }
        setTimeout(() => {
          pythonProcess = null;
          app.quit();
        }, 500);
      });
    }
  }
});

app.on('will-quit', () => {
  // 最后的保障，确保进程被杀死
  if (pythonProcess && pythonProcess.pid) {
    try {
      kill(pythonProcess.pid, 'SIGKILL');
    } catch (err) {
      console.error('Error in will-quit:', err);
    }
  }
});
