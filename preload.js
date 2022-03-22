let { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
    "api", {
        send: (opt, data) => {
            ipcRenderer.send(opt, data);
        },
        receive: (opt, func) => {
            ipcRenderer.on(opt, (event, data) => {
                func(data);
            });
        }
    }
)