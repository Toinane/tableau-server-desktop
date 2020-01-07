const { app, Menu, BrowserWindow } = require('electron');
const ElectronLightStorage = require('electron-light-storage');
const prompt = require('electron-prompt');

const storage = new ElectronLightStorage();

const startApp = async () => {
    const url = await getTableauUrl();

    const menu = Menu.buildFromTemplate([
        {
            label: app.getName(),
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { label: 'change Tableau Url', click: () => promptUrl(true) },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'pasteandmatchstyle' },
                { role: 'delete' },
                { role: 'selectall' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forcereload' },
                { role: 'toggledevtools' },
                { type: 'separator' },
                { role: 'resetzoom' },
                { role: 'zoomin' },
                { role: 'zoomout' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            role: 'window',
            submenu: [{ role: 'minimize' }, { role: 'close' }]
        }
    ]);

    Menu.setApplicationMenu(menu);

    const win = new BrowserWindow({
        minHeight: 460,
        minWidth: 1000,
        height: 550,
        width: 1010,
        webPreferences: {
            nodeIntegration: false,
            allowRunningInsecureContent: true
        },
        show: false
    });

    const loader = new BrowserWindow({
        resizable: false,
        minimizable: false,
        maximizable: false,
        alwaysOnTop: true,
        closable: false,
        titleBarStyle: 'hidden',
        hasShadow: false,
        transparent: true
    });

    loader.setIgnoreMouseEvents(true);

    win.webContents.on('new-window', (event, url) => {
        console.log(event);
        console.log(url);
        // event.preventDefault()
        // win.loadURL(url);
    });

    setTimeout(() => {
        loader.destroy();
        win.show();
    }, 4000);

    win.loadURL(url);
    loader.loadURL('file://' + __dirname + '/render/loading.html');
};

const getTableauUrl = async () => {
    const store = storage.get();
    if (store.url) return store.url;
    if (process.env.DEFAULT_TABLEAU_URL) return process.env.DEFAULT_TABLEAU_URL;
    return await promptUrl();
};

const promptUrl = async forceReload => {
    const url = await prompt({
        title: 'Tableau Server Url',
        label: 'URL',
        value: 'https://my-tableau-url.com',
        inputAttrs: {
            type: 'url'
        }
    });

    if (url === null) {
        return await promptUrl();
    }

    storage.set({ url: url });
    if (forceReload) reloadApp();
    return url;
};

const reloadApp = () => {
    const windows = BrowserWindow.getAllWindows();
    windows.map(win => win.destroy());

    startApp();
};

app.on('ready', () => startApp());

app.on('activate', () => {
    if (!BrowserWindow.getAllWindows().length) startApp();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
