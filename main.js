const { app, BrowserWindow, ipcMain, Notification, Tray, Menu, globalShortcut,screen } = require('electron');
const { clear } = require('node:console');
const { console } = require('node:inspector');
if (require('electron-squirrel-startup')) app.quit();

const path = require('node:path')
let win = null
let tray = null
let isFlash = false
let flashInterval = null
let currentIconIndex = 0
let notifwin=null
const iconPaths = [
    path.join(__dirname, 'tea.png'),
    path.join(__dirname, 'tray.png'),
]
const additionalData = { myKey: 'myValue' }
const gotTheLock = app.requestSingleInstanceLock(additionalData)
if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (event, commandLine, workingDirectory, additionalData) => {
        if (win) {
            if (win.isMinimized()) win.restore()
            win.focus()
        }
    })
}
const createWindow = () => {
    win = new BrowserWindow({
        width: 600,
        height: 800,
        icon: path.join(__dirname, 'tea.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            backgroundThrottling: false,
        }
    })

    // win.loadFile('index.html')
    // win.loadURL('http://localhost:5173')
    const indexPath = path.join(__dirname, 'dist', 'index.html')
    win.loadFile(indexPath)
    Menu.setApplicationMenu(null)

    // win.webContents.openDevTools()

    // win.on('close', (event) => {
    //     console.log('event', event)
    //     event.preventDefault();
    //     win.hide();
    // })
}

app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
    // 创建托盘图标
    const iconPath = path.join(__dirname, 'tea.png')// 替换为你的托盘图标路径
    tray = new Tray(iconPath)
    // 设置托盘图标的上下文菜单
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '显示应用',
            click: () => {
                win.show();
            }
        },
        {
            label: '退出',
            click: () => {
                app.quit();
            }
        }
    ])
    tray.setToolTip('喝喝茶~');
    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => {
        win.show();
    })
    tray.on('click', () => {
        if(isFlash){
            toggleFlash()
        }
        win.webContents.send('stop-music')
    })
    tray.on('mouse-enter', () => {
        if(isFlash){
            createNotifwin()
        }
    })
    tray.on('mouse-leave', () => {
        if(notifwin){
            notifwin.close()
            notifwin=null
        }
    })
    const startFlashing = () => {
        if (isFlash) return
        isFlash = true
        flashInterval = setInterval(() => {
            currentIconIndex = (currentIconIndex + 1) % iconPaths.length;
            tray.setImage(iconPaths[currentIconIndex]);
        },500)
    }
    const stopFlashing = () => {
        if (!isFlash) return
        clearInterval(flashInterval)
        flashInterval = null
        isFlash = false
        currentIconIndex = 0
        clearInterval(flashInterval)
        tray.setImage(iconPaths[0]);
    }
    const toggleFlash = () => {
        if (isFlash) {
            stopFlashing()
        } else {
            startFlashing()
        }
    }
    // notifywin
    const createNotifwin = () =>{
        // 计算x,y坐标
        const trayBounds = tray.getBounds()
        const primaryDisplay = screen.getPrimaryDisplay()
        const {width, height} = primaryDisplay.workAreaSize

        const notifWidth=300
        const notifHeight=100

        let x,y;
        x = trayBounds.x - notifWidth/2;
        y = height - notifHeight+10;

        notifwin=new BrowserWindow({
            width:notifWidth,
            height:notifHeight,
            x:x,
            y:y,
            frame:false,
            resizable:false,
            movable:false,
        })
        notifwin.loadFile(path.join(__dirname,'trayHtml.html'))
    }

    // 注册全局快捷键，例如 Ctrl+Shift+H 隐藏/显示窗口
    const ret = globalShortcut.register('Control+Shift+Q', () => {
        if (win.isVisible()) {
            win.hide();
        } else {
            win.show();
        }
    });

    ipcMain.on('tray-flash', (event, arg) => {
        console.log('tray-flash', arg)
        toggleFlash()
    })
})

app.on('browser-window-blur',()=>{
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})