import smbus2
import time

class MLX90614:
    def __init__(self, bus_number=3, address=0x5A):
        self.bus = smbus2.SMBus(bus_number)
        self.address = address
        
        # MLX90614 register addresses
        self.MLX90614_RAWIR1 = 0x04
        self.MLX90614_RAWIR2 = 0x05
        self.MLX90614_TA = 0x06       # Ambient temperature
        self.MLX90614_TOBJ1 = 0x07    # Object temperature
        self.MLX90614_TOBJ2 = 0x08    # Object temperature 2
    
    def read_ambient_temp(self):
        """Read ambient temperature"""
        try:
            data = self.bus.read_word_data(self.address, self.MLX90614_TA)
            temp = (data * 0.02) - 273.15
            return temp
        except Exception as e:
            print(f"Error reading ambient temperature: {e}")
            return None
    
    def read_object_temp(self):
        """Read object temperature"""
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

def test_temperature_sensor():
    mlx = None
    try:
        # Initialize MLX90614 on I2C bus 3 at address 0x5A
        mlx = MLX90614(bus_number=3, address=0x5A)
        
        # Read temperatures
        ambient_temp = mlx.read_ambient_temp()
        object_temp = mlx.read_object_temp()
        
        if ambient_temp is not None and object_temp is not None:
            print(f"Ambient Temperature: {ambient_temp:.2f} °C")
            print(f"Object Temperature: {object_temp:.2f} °C")
            print("Temperature Sensor OK")
            return True
        else:
            print("Failed to read temperature")
            return False
            
    except Exception as e:
        print(f"Temperature Sensor Error: {e}")
        return False
    finally:
        if mlx:
            mlx.close()

# Test the sensor
if __name__ == "__main__":
    test_temperature_sensor()