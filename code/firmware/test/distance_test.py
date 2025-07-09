import time
import smbus2
import RPi.GPIO as GPIO

# === Configuration ===
BUZZER_PIN = 27           # GPIO pin connected to buzzer
TRIGGER_DISTANCE_CM = 20  # Distance threshold in cm

# === Setup GPIO for buzzer ===
GPIO.setmode(GPIO.BCM)
GPIO.setup(BUZZER_PIN, GPIO.OUT)
GPIO.output(BUZZER_PIN, GPIO.LOW)

# === VL53L0X Distance Sensor Class ===
class VL53L0X:
    def __init__(self, bus_number=3, address=0x29):
        self.bus = smbus2.SMBus(bus_number)
        self.address = address
        self._init_sensor()
    
    def _init_sensor(self):
        """Initialize the VL53L0X sensor"""
        try:
            # Check if sensor is responding
            model_id = self.bus.read_byte_data(self.address, 0xC0)
            if model_id != 0xEE:
                raise Exception(f"VL53L0X not found. Model ID: {model_id:02X}, expected 0xEE")
            
            print("[INFO] VL53L0X sensor detected")
            
            # Basic initialization sequence
            self.bus.write_byte_data(self.address, 0x80, 0x01)
            self.bus.write_byte_data(self.address, 0xFF, 0x01)
            self.bus.write_byte_data(self.address, 0x00, 0x00)
            self.bus.write_byte_data(self.address, 0x91, 0x3C)
            self.bus.write_byte_data(self.address, 0x00, 0x01)
            self.bus.write_byte_data(self.address, 0xFF, 0x00)
            self.bus.write_byte_data(self.address, 0x80, 0x00)
            
            print("[INFO] VL53L0X sensor initialized")
            
        except Exception as e:
            print(f"[ERROR] Failed to initialize VL53L0X: {e}")
            raise
    
    def read_distance(self):
        """Read distance measurement in mm"""
        try:
            # Start ranging
            self.bus.write_byte_data(self.address, 0x00, 0x01)
            
            # Wait for measurement to complete
            time.sleep(0.1)
            
            # Check measurement status
            timeout = 0
            while timeout < 100:
                status = self.bus.read_byte_data(self.address, 0x13)
                if status & 0x07:  # New sample ready
                    break
                time.sleep(0.01)
                timeout += 1
            
            if timeout >= 100:
                return 8190  # Return out-of-range value
            
            # Read distance measurement
            distance_bytes = self.bus.read_i2c_block_data(self.address, 0x1E, 2)
            distance = (distance_bytes[0] << 8) | distance_bytes[1]
            
            return distance
            
        except Exception as e:
            print(f"[ERROR] Error reading distance: {e}")
            return 8190  # Return out-of-range value
    
    def close(self):
        """Close the I2C bus"""
        self.bus.close()

# === Initialize VL53L0X sensor ===
try:
    vl53 = VL53L0X(bus_number=3, address=0x29)
except Exception as e:
    print(f"[ERROR] Failed to initialize VL53L0X: {e}")
    GPIO.cleanup()
    exit(1)

# Give sensor time to initialize
time.sleep(2)

print("[INFO] Starting measurements. Press Ctrl+C to stop.")

try:
    while True:
        # Read distance
        distance_mm = vl53.read_distance()
        
        # Check for out-of-range readings
        if distance_mm >= 8190:
            print("[WARN] Distance out of range.")
            GPIO.output(BUZZER_PIN, GPIO.LOW)
            time.sleep(0.5)
            continue
        
        distance_cm = distance_mm / 10.0
        print(f"Distance: {distance_cm:.1f} cm")
        
        # Control buzzer based on threshold
        if distance_cm <= TRIGGER_DISTANCE_CM:
            GPIO.output(BUZZER_PIN, GPIO.HIGH)
        else:
            GPIO.output(BUZZER_PIN, GPIO.LOW)
        
        time.sleep(0.5)
        
except KeyboardInterrupt:
    print("\n[INFO] Measurement stopped by user.")
finally:
    GPIO.output(BUZZER_PIN, GPIO.LOW)
    GPIO.cleanup()
    vl53.close()
    print("[INFO] GPIO cleaned up and sensor closed.")