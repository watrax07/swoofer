import subprocess
import os
import random

def get_network_adapters():
    result = subprocess.run(["powershell", "Get-NetAdapter"], capture_output=True, text=True)
    adapters = []
    for line in result.stdout.splitlines():
        if "Ethernet" in line or "Wi-Fi" in line:
            parts = line.split()
            if len(parts) > 1:
                adapters.append(parts[0])
    return adapters

def generate_random_mac():
    mac = [random.choice("0123456789ABCDEF") + random.choice("0123456789ABCDEF") for _ in range(6)]
    return ":".join(mac)

def change_mac_address(adapter_name, new_mac):
    try:
        subprocess.run(["powershell", f"Set-NetAdapter -Name '{adapter_name}' -MacAddress '{new_mac}'"], check=True)
        print(f"MAC address for {adapter_name} changed to {new_mac}")
    except subprocess.CalledProcessError as e:
        print(f"Failed to change MAC address: {e}")

def main():
    new_mac = generate_random_mac()
    
    adapters = get_network_adapters()
    
    for adapter in adapters:
        change_mac_address(adapter, new_mac)

if __name__ == "__main__":
    if os.name == 'nt':  
        main()
    else:
        print("Este script solo funciona en Windows.")
    
    input("Presiona Enter para salir...")
