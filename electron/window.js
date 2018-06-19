const { BrowserWindow, protocol, ipcMain, session } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const mime = require('mime-types');

const { createMenu } = require('./menu');
const { createTouchBar } = require('./touchbar');

let instance = null;

const headersToSet = [ 'Origin' ];
let requestHeaders = {};

const actions = {
  createTab: () => {
    console.log('Create tab.');
    instance.webContents.send('create-tab', true);
  },
  closeTab: () => {
    console.log('Close tab.');
    instance.webContents.send('close-tab', true);
  },
  sendRequest: () => {
    instance.webContents.send('send-request', true);
  },
  reloadDocs: () => {
    instance.webContents.send('reload-docs', true);
  },
  showDocs: () => {
    instance.webContents.send('show-docs', true);
  },
};

const createWindow = () => {

  /**
   * Using a custom buffer protocol, instead of a file protocol because of restrictions with the file protocol.
   */
  protocol.registerBufferProtocol('altair', (request, callback) => {
    let url = request.url.substr(7);

    // In windows, the url comes as altair://c/Users/Jackie/Documents/projects/altair/dist/index.html
    // We also need to strip out the //c from the path
    // TODO - Find a better way of handling this
    if (process.platform === 'win32') {
      url = request.url.substr(10);
    }

    // Maybe this could work?
    // console.log('::>>', path.join(__dirname, '../dist', path.basename(request.url)));

    fs.readFile(path.normalize(`${url}`), 'utf8', function (err, data) {
      if (err) {
        return console.log('Error loading file to buffer.', err);
      }

      // Load the data from the file into a buffer and pass it to the callback
      // Using the mime package to get the mime type for the file, based on the file name
      callback({ mimeType: mime.lookup(url), data: new Buffer(data) });
      // console.log(data);
    });
    // callback({path: path.normalize(`${__dirname}/${url}`)})
  }, (error) => {
    if (error) console.error('Failed to register protocol')
  });

  // Create the browser window.
  instance = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      webSecurity: false
    },
    // titleBarStyle: 'hidden-inset'
  });

  // Populate the application menu
  createMenu(actions);

  // and load the index.html of the app.
  instance.loadURL(url.format({
    pathname: path.join(__dirname, '../dist/index.html'),
    protocol: 'altair:',
    slashes: true
  }));
  // instance.loadURL('altair://' + __dirname + '/../dist/index.html');

  // Open the DevTools.
  // instance.webContents.openDevTools();

  // Set the touchbar
  instance.setTouchBar(createTouchBar(actions));

  // Prevent the app from navigating away from the app
  instance.webContents.on('will-navigate', (e, url) => e.preventDefault());

  // Emitted when the window is closed.
  instance.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    instance = null;
  });

  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    // Set the request headers
    Object.keys(requestHeaders).forEach(key => {
      details.requestHeaders[key] = requestHeaders[key];
    });
    callback({
      cancel: false,
      requestHeaders: details.requestHeaders
    });
  });

  // Get 'set headers' instruction from app
  ipcMain.on('set-headers-sync', (e, headers) => {
    requestHeaders = {};

    headers.forEach(header => {
      if (headersToSet.includes(header.key) && header.key && header.value) {
        requestHeaders[header.key] = header.value;
      }
    });

    e.returnValue = true;
  });
};

const getInstance = () => instance;

module.exports = {
  getInstance,
  instance,
  createWindow,
  actions
};
