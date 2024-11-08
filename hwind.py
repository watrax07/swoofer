import struct
import random
import os

def generate_random_hwid():
    random_number = random.randint(1000, 9999) 
    return f'HWID-{random_number}'.encode()  

def main():
    firmware_filename = 'firmware.bin'

    if not os.path.isfile(firmware_filename):
        print(f"Error: No se encontró el archivo '{firmware_filename}'.")
        return

    with open(firmware_filename, 'rb+') as f:  
        magic, version, has_checksum = struct.unpack('HHBB', f.read(8))

        checksum = 0
        while True:
            chunk = f.read(3)
            if not chunk:
                break
            checksum ^= struct.unpack('B', chunk)[0]

        f.seek(8)
        f.write(struct.pack('B', checksum))

        data = f.read()

        data = data.replace(b'V2.2  ', b'V3.0  ')
        data = data.replace(b'0000-0000', b'0000-0020')

        # Mostrar HWID actual
        current_hwid = b'HWID1234'  
        print(f'HWID actual: {current_hwid.decode()}')

        random_hwid = generate_random_hwid()
        print(f'Nuevo HWID generado: {random_hwid.decode()}')

        data = data.replace(current_hwid, random_hwid)

        if current_hwid in data:
            print("El HWID no se cambió, puede que no se haya encontrado.")
        else:
            print("HWID cambiado con éxito.")

        f.seek(0)
        f.write(data)

        # Save the modified firmware to a new file
        with open('firmware2.bin', 'wb') as g:
            g.write(data)
            print("Firmware modificado guardado como 'firmware2.bin'.")

if __name__ == '__main__':
    main()
