import smbus2
import time

class VL53L0X:
    def __init__(self, bus_number=3, address=0x29):
        self.bus = smbus2.SMBus(bus_number)
        self.address = address
        
        # VL53L0X register addresses
        self.VL53L0X_REG_IDENTIFICATION_MODEL_ID = 0xC0
        self.VL53L0X_REG_IDENTIFICATION_REVISION_ID = 0xC2
        self.VL53L0X_REG_PRE_RANGE_CONFIG_VCSEL_PERIOD = 0x50
        self.VL53L0X_REG_FINAL_RANGE_CONFIG_VCSEL_PERIOD = 0x70
        self.VL53L0X_REG_SYSRANGE_START = 0x00
        self.VL53L0X_REG_RESULT_INTERRUPT_STATUS = 0x13
        self.VL53L0X_REG_RESULT_RANGE_STATUS = 0x14
        
        # Initialize sensor
        self._init_sensor()
    
    def _init_sensor(self):
        """Initialize the VL53L0X sensor"""
        try:
            # Check if sensor is responding
            model_id = self.bus.read_byte_data(self.address, self.VL53L0X_REG_IDENTIFICATION_MODEL_ID)
            if model_id != 0xEE:
                raise Exception(f"Wrong model ID: {model_id:02X}, expected 0xEE")
            
            # Basic initialization sequence
            self.bus.write_byte_data(self.address, 0x88, 0x00)
            self.bus.write_byte_data(self.address, 0x80, 0x01)
            self.bus.write_byte_data(self.address, 0xFF, 0x01)
            self.bus.write_byte_data(self.address, 0x00, 0x00)
            
            # Set I2C standard mode
            self.bus.write_byte_data(self.address, 0x91, 0x3C)
            self.bus.write_byte_data(self.address, 0x00, 0x01)
            self.bus.write_byte_data(self.address, 0xFF, 0x00)
            self.bus.write_byte_data(self.address, 0x80, 0x00)
            
            print("VL53L0X sensor initialized successfully")
            
        except Exception as e:
            print(f"Failed to initialize VL53L0X: {e}")
            raise
    
    def read_distance(self):
        """Read distance measurement in mm"""
        try:
            # Start measurement
            self.bus.write_byte_data(self.address, self.VL53L0X_REG_SYSRANGE_START, 0x01)
            
            # Wait for measurement to complete
            timeout = 0
            while timeout < 100:  # 1 second timeout
                status = self.bus.read_byte_data(self.address, self.VL53L0X_REG_RESULT_RANGE_STATUS)
                if (status & 0x01) == 0:  # Device ready
                    break
                time.sleep(0.01)
                timeout += 1
            
            if timeout >= 100:
                raise Exception("Measurement timeout")
            
            # Read the distance
            distance = self.bus.read_word_data(self.address, self.VL53L0X_REG_RESULT_RANGE_STATUS + 10)
            distance = ((distance & 0xFF) << 8) | (distance >> 8)  # Swap bytes
            
            return distance
            
        except Exception as e:
            print(f"Error reading distance: {e}")
            return None
    
    def close(self):
        """Close the I2C bus"""
        self.bus.close()

def test_distance_sensor():
    vl53 = None
    try:
        # Initialize VL53L0X on I2C bus 3 at address 0x29
        vl53 = VL53L0X(bus_number=3, address=0x29)
        
        # Read distance
        distance = vl53.read_distance()
        
        if distance is not None:
            print(f"Distance: {distance}")
            print(f"Distance Sensor OK")
            return True
        else:
            print("Failed to read distance")
            return False
            
    except Exception as e:
        print(f"Distance Sensor Error: {e}")
        return False
    finally:
        if vl53:
            vl53.close()


# Test the sensor
if __name__ == "__main__":
    print("Testing with custom SMBus implementation:")
    test_distance_sensor()
