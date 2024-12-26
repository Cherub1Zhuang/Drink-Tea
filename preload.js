const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
    // startCount: (data) => ipcRenderer.send('start-countdown', data),
    // onCountdownEnded: (callback) => ipcRenderer.on('countdown-end', callback),
    // onNotificationClosed: (callback) => ipcRenderer.on('notification-closed', callback),
    trayFlash:(title,body)=>ipcRenderer.send('tray-flash',{title,body}),
    onStopMusic:(callback) => ipcRenderer.on('stop-music', callback),
})