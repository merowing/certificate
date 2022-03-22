let { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
let path = require('path');
let fs = require('fs');

let xlsx = require('xlsx');
let pdf = require('html-pdf');
let express = require('express');
let temp = require('./temp'); // template script

let appExps = express();
appExps.use('/temp', express.static(__dirname + '/temp'));

let server = appExps.listen(3000);

let tempDir = __dirname + '/temp';
let mainFolder = path.join(process.resourcesPath, '\\..');

let mainOpen = true;
let layoutOpen = true;

let win;
let createWindow = () => {
    win = new BrowserWindow({
        width: 500,
        height: 600,
        minWidth: 200,
        webPreferences: {
            devTools: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    win.setMenu(null);
    win.loadURL(path.join(__dirname, 'src/index.html'));

    win.on('closed', e => {
        mainOpen = false;
        if(layoutWindow) {
            layoutOpen = false;
            layoutWindow.close();
        }
    });
};

app.on('window-all-closed', function() {
    if(fs.existsSync(tempDir)) fs.rmdirSync(tempDir, { recursive: true });
    if(process.platform != 'darwin') {
        app.quit();
    }
});

app.whenReady().then(() => {
    createWindow();
});

ipcMain.on('open-file', event => {
    dialog.showOpenDialog({
        filters:[
            {name: "Documents", extensions: ["xml", "xlsx"]}
        ],
        properties: ['openFile']
    }).then(res => {
        if(!res.canceled) {
        let xmlfile = res.filePaths[0];

        let xlsxFile = xlsx.readFile(xmlfile);
        let sheets = xlsxFile.SheetNames;
        let xlsjson = xlsx.utils.sheet_to_json(xlsxFile.Sheets[sheets[0]]);

        win.webContents.send('file', xlsjson);
        
        }
    })
    .catch(err => console.log(err));
});

let certFolder = './certificates';
let pos;
let dataNames = [];
let tempImg;
ipcMain.on('create', (event, data) => {
    dataNames = data;

    if(!fs.existsSync(tempDir)) {
        win.webContents.send('error', 'Макет не створено!');
    }else {
        let tempFiles = fs.readdirSync(tempDir);
        tempImg = tempFiles.filter(item => item.search(/.png|.jpg|.jpeg/g) >= 0);
        if(tempImg.length <= 0) {
            win.webContents.send('error', 'Зображення макету не знайдено!');
        }else {
            let json = (fs.existsSync(tempDir + '/options.json')) ? fs.readFileSync(tempDir + '/options.json') : null;
            if(!json) {
                win.webContents.send('error', 'Файл опцій не знайдено.\\r\\ntemp\\options.json');
                return false;
            }
            pos = JSON.parse(json);
            win.webContents.send('error', false);
            if(!fs.existsSync(certFolder)) fs.mkdirSync(certFolder);

            createCertificate();

        }
    }
});

let count = 0;
let cancelCertificate = false;
function createCertificate(i = 0) {

    let nameStr = dataNames[i].name.split(' ');
    while(nameStr.length < 3) {
        nameStr.push('');
    }

    let certificateNumber = dataNames[i].certificate;
    
    try {
        pdf.create(temp(nameStr, certificateNumber, './temp/' + tempImg, pos), {format: pos.format.type, orientation: pos.orientation, border:'0', type:'pdf', quality: 100, timeout:120000}).toFile(certFolder + "/" + certificateNumber + '.pdf', err => {
            if(err) console.log(err);
            
            count += 1;

            let countNum = count % 10;
            let add = (countNum === 1) ? '' : (countNum > 1 && countNum < 5) ? 'и' : 'ів';

            if(i < dataNames.length - 1) {
                if(!cancelCertificate) {
                    win.webContents.send('count', count);
                    createCertificate(++i);
                }else {
                    win.webContents.send('canceled-certificate', `${count} сертифікат${add} було створено!`);
                    cancelCertificate = false;
                    count = 0;
                }
            }else {
                win.webContents.send('done', `${count} сертифікат${add} було створено!`);
            
                shell.openPath(mainFolder + certFolder);
                count = 0;
            }
        });
    }catch(err) {
        console.log(err);
    }
}

ipcMain.on('template', (event, data) => {
    createTemplate({src: data.src, name: data.name});
});

let layoutWindow;
ipcMain.on('layout-window', (event, data) => {
    if(!layoutWindow) {
        layoutWindow = new BrowserWindow({
            width: 900,
            height: 740,
            minWidth: 400,
            webPreferences: {
                devTools: false,
                preload: path.join(__dirname, 'preload.js')
            }
        });
        layoutWindow.setMenu(null);
        
        layoutWindow.loadURL(path.join(__dirname, 'src/layoutPage.html'));
        
        layoutWindow.once('ready-to-show', () => {
            layoutWindow.show();
        });
    }else {
        layoutWindow.show();
    }
    layoutWindow.on('closed', e => {});
    layoutWindow.on('close', e => {
        if(layoutOpen) e.preventDefault();
        layoutWindow.hide();
    });
});

ipcMain.on('create-file-positions', (event, data) => {
    if(!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    fs.writeFileSync(tempDir + '/options.json', data);
});

ipcMain.on('open-template', () => {
    dialog.showOpenDialog({
        filters:[
            {name: "Images", extensions: ["jpg", "jpeg", "png"]}
        ],
        properties: ['openFile']
    })
    .then(res => {
        if(!res.canceled) {
            let filePath = res.filePaths[0];
            let fileName = filePath.split('\\').splice(-1);
            layoutWindow.webContents.send('opened-template', filePath);
            createTemplate({src: filePath, name: fileName});
        }
    });
});

ipcMain.on('cancel-certificate', (event, data) => {
    cancelCertificate = true;
});

function createTemplate({src, name}) {
    if(!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    let tempFiles = fs.readdirSync(tempDir);
    tempImg = tempFiles.filter(item => item.search(/.png|.jpg|.jpeg/g) >= 0);
    if(tempImg.length > 0) fs.unlinkSync('./temp/' + tempImg);

    if(!fs.existsSync(tempDir + '/' + name)) {
        fs.copyFileSync(src, tempDir + '/' + name);
    }
}
