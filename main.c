#include <stdint.h>  // Biblioteca para tipos de datos enteros de tamaño fijo
#include <stdio.h>   // Biblioteca estándar para entrada y salida

// Arreglo que simula un identificador de procesador (CPUID)
uint32_t cpuid[] = {0x00003000, 0x00};

// Arreglo que contiene un número de serie que será escrito en cpuid
uint32_t newserial[] = {0x12345678, 0x9ABCDEF0};

// Función para "leer" el valor de CPUID y mostrarlo en pantalla
void __mread(uint32_t *data) {
    printf("Reading CPUID: 0x%08X, 0x%08X\n", data[0], data[1]);
}

// Función para "escribir" el valor de un nuevo serial en CPUID y mostrar el proceso
void __mwrite(uint32_t *data, int size, uint32_t *target) {
    printf("Writing Serial: 0x%08X, 0x%08X to target CPUID\n", data[0], data[1]);
    target[0] = data[0];
    target[1] = data[1];
}

int main() {
    // Llamada a la función de lectura para mostrar el valor actual de CPUID
    __mread(cpuid);

    // Llamada a la función de escritura para actualizar CPUID con el nuevo serial
    __mwrite(newserial, 8, cpuid);

    return 0;
}
