const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    validarClave: (key) => ipcRenderer.invoke('validar-clave', key),
    ejecutarComandos: () => ipcRenderer.invoke('ejecutar-comandos'),
    generarClave: () => ipcRenderer.invoke('generar-clave'),
    obtenerClaves: () => ipcRenderer.invoke('obtener-claves'), // Obtener todas las claves
    eliminarClave: (keyId) => ipcRenderer.invoke('eliminar-clave', keyId), // Eliminar una clave específica
    activarSpotify: () => ipcRenderer.invoke('activar-spotify'), // Ejecutar el script para activar Spotify
    closeWindow: () => ipcRenderer.send('close-window'), // Cerrar la ventana
    obtenerSeriales: () => ipcRenderer.invoke('obtener-seriales'),
    ejecutarPython: () => {
        console.log("Se llamó a ejecutarPython desde el frontend."); // Log para el frontend
        return ipcRenderer.invoke('ejecutar-python');
    },
    obtenerExpiracionClave: (key) => {
        console.log(`Se está llamando a obtenerExpiracionClave con la clave: ${key}`);
        return ipcRenderer.invoke('obtener-expiracion-clave', key);
    }
});
