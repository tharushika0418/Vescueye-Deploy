import time
import smbus2

class MLX90614:
    def __init__(self, bus_number=3, address=0x5A):
        self.bus = smbus2.SMBus(bus_number)
        self.address = address
        
        # MLX90614 register addresses
        self.MLX90614_TA = 0x06       # Ambient temperature
        self.MLX90614_TOBJ1 = 0x07    # Object temperature
    
    def read_ambient_temp(self):
        """Read ambient temperature in Celsius"""
        try:
            data = self.bus.read_word_data(self.address, self.MLX90614_TA)
            temp = (data * 0.02) - 273.15
            return temp
        except Exception as e:
            print(f"Error reading ambient temperature: {e}")
            return None
    
    def read_object_temp(self):
        """Read object temperature in Celsius"""
        try:
            data = self.bus.read_word_data(self.address, self.MLX90614_TOBJ1)
            temp = (data * 0.02) - 273.15
            return temp
        except Exception as e:
            print(f"Error reading object temperature: {e}")
            return None
    
    def close(self):
        """Close the I2C bus"""
        self.bus.close()

# === Initialize sensor ===
mlx = MLX90614(bus_number=3, address=0x5A)

print("[INFO] Starting measurements. Press Ctrl+C to stop.")

try:
    while True:
        # Read temperatures
        ambient_temp = mlx.read_ambient_temp()
        object_temp = mlx.read_object_temp()
        
        if ambient_temp is not None and object_temp is not None:
            print(f" Ambient Temp: {ambient_temp:.1f} °C | Object Temp: {object_temp:.1f} °C")
        else:
            print("Error reading sensor data")
        
        time.sleep(0.5)
        
except KeyboardInterrupt:
    print("\n[INFO] Measurement stopped by user.")
finally:
    mlx.close()
    print("[INFO] Sensor closed.")