const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sudo = require('sudo-prompt');
const { MongoClient, ObjectId } = require('mongodb');
const { exec } = require('child_process');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const si = require('systeminformation');


const url = 'mongodb+srv://watrax:wady210807@watrairi.jpn7l.mongodb.net/';
const dbName = 'watrairi';
let db;

async function connectDB() {
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db(dbName);
    console.log('Conectado a MongoDB');
}

function getDB() {
    return db;
}


function createWindow() {
    const win = new BrowserWindow({
        width: 700, 
        height: 425,
        resizable: false, 
        icon: path.join(__dirname, 'assets/icons/byte.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false
        },
        autoHideMenuBar: true,
        frame: false,
        transparent: true 
    });

     win.loadFile('./html/swoof/main.html');
   //win.loadFile('./html/principal/index.html');
}

app.whenReady().then(async () => {
    await connectDB();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

ipcMain.handle('ejecutar-python', async () => {

    return new Promise((resolve, reject) => {
        const options = {
            name: 'ElectronApp'
        };
        const pythonScriptPath = path.join(__dirname, 'mac.py');

        sudo.exec(`python ${pythonScriptPath}`, options, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error al ejecutar script Python: ${error}`);
                reject(new Error(`Error al ejecutar script Python: ${error.message}`));
            } else {
                console.log(`stdout: ${stdout}`);
                resolve('Script ejecutado con éxito');
            }
        });
    });
});
ipcMain.handle('validar-clave', async (event, key) => {
    const db = getDB();
    const clave = await db.collection('keys').findOne({ key: key });

    if (clave) {
        const win = BrowserWindow.getFocusedWindow();
        if (win) {
            switch (clave.type) {
                case 'media':
                    win.loadFile('media.html');
                    break;
                case 'nfa':
                    win.loadFile('./html/users/nfa.html');
                    break;
                case 'admin':
                    win.loadFile('./html/principal/admin.html');
                    break;
                case 'windows':
                    win.loadFile('./html/users/activar.html');
                    break;
                case 'spotify':
                    win.loadFile('./html/users/spotify.html');
                    break;
                case 'swoofer':
                     win.loadFile('./html/swoof/main.html');
                     break;
                case 'spoofer':
                    win.loadFile('./html/swoof/main.html');
                    break;                    
            }
        }
        return true;
    } else {
        return false;
    }
});

ipcMain.handle('obtener-claves', async () => {
    const db = getDB();
    const claves = await db.collection('keys').find({}).toArray();
    return claves;
});

ipcMain.handle('eliminar-clave', async (event, key) => {
    const db = getDB();
    try {
        const result = await db.collection('keys').deleteOne({ key: key });
        if (result.deletedCount > 0) {
            return 'Clave eliminada con éxito.';
        } else {
            return 'No se encontró ninguna clave con ese valor.';
        }
    } catch (error) {
        return `Error al eliminar la clave: ${error.message}`;
    }
});
ipcMain.handle('obtener-expiracion-clave', async (event, key) => {
    const db = getDB();
    const clave = await db.collection('keys').findOne({ key: key });
    
    if (clave && clave.expiresAt) {
        return clave.expiresAt.toISOString(); 
    } else {
        return 'No disponible';
    }
});



ipcMain.handle('activar-spotify', async () => {
    return new Promise((resolve, reject) => {
        const contenidoBat = `
            @echo off
            set param=-new_theme
            set url=https://raw.githubusercontent.com/SpotX-Official/spotx-official.github.io/main/run.ps1
            set url2=https://spotx-official.github.io/run.ps1
            powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12; $p='%param%'; try { iwr -useb %url% | iex } catch { $p+= ' -m'; iwr -useb %url2% | iex }"
            powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('Spotify activado correctamente')"
            pause
        `;

        const rutaBatTemp = path.join(os.tmpdir(), 'spotify-activate-temp.bat');
        fs.writeFileSync(rutaBatTemp, contenidoBat);

        exec(`start cmd.exe /k "${rutaBatTemp}"`, (error, stdout, stderr) => {
            fs.unlinkSync(rutaBatTemp);

            if (error) {
                console.error(`Error al ejecutar el script: ${error.message}`);
                reject(`Error al ejecutar el script: ${error.message}`);
            } else if (stderr) {
                console.error(`stderr: ${stderr}`);
                reject(`stderr: ${stderr}`);
            } else {
                console.log(`stdout: ${stdout}`);
                resolve('Spotify activado correctamente.');
            }
        });
    });
});

ipcMain.handle('obtener-seriales', async () => {
    try {
        const uuid = await si.uuid();
        const bios = await si.bios();
        const baseboard = await si.baseboard();
        const gpu = await si.graphics();
        const memory = await si.memLayout();
        const network = await si.networkInterfaces();
        const disks = await si.diskLayout(); // Obtenemos la información de los discos

        const cpuProcessorId = await new Promise((resolve, reject) => {
            exec('wmic cpu get processorid', (error, stdout, stderr) => {
                if (error || stderr) {
                    reject('Error al obtener CPU ID');
                } else {
                    const lines = stdout.trim().split('\n');
                    const processorId = lines.length > 1 ? lines[1].trim() : 'No disponible';
                    resolve(processorId);
                }
            });
        });

        return {
            motherboardSerial: baseboard.serial,
            uuid: uuid.hardware,
            bios: bios.serial,
            gpuDescription: gpu.controllers.length > 0 ? gpu.controllers[0].model : 'No disponible',
            ramSerial: memory.length > 0 ? memory[0].serialNum : 'No disponible',
            cpuProcessorId,
            mac: network.length > 0 ? network[0].mac : 'No disponible',
            disks: disks.map(disk => ({
                serial: disk.serialNum || 'No disponible'
            }))
        };
    } catch (error) {
        console.error('Error obteniendo seriales:', error);
        return { error: error.message };
    }
});


ipcMain.handle('ejecutar-comandos', async () => {
    try {
        await ejecutarComandoComoAdmin('slmgr /ipk W269N-WFGWX-YVC9B-4J6C9-T83GX');
        try {
            await ejecutarComandoComoAdmin('slmgr /skms kms.digiboy.ir');
        } catch (error) {
            await ejecutarComandoComoAdmin('slmgr /skms kms.msguides.com');
        }
        await ejecutarComandoComoAdmin('slmgr /ato');
        return 'Se ha activado Windows correctamente.';
    } catch (error) {
        return `Error al ejecutar el comando: ${error.message}`;
    }
});

// Función para ejecutar un comando como administrador
function ejecutarComandoComoAdmin(comando) {
    return new Promise((resolve, reject) => {
        const options = {
            name: 'ElectronApp'
        };

        sudo.exec(comando, options, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else if (stderr) {
                reject(new Error(stderr));
            } else {
                resolve(stdout);
            }
        });
    });
}

ipcMain.on('close-window', (event) => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
        win.close();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


