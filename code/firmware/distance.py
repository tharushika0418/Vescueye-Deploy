import time
import smbus2
import RPi.GPIO as GPIO

def monitor_distance_and_buzz(BUZZER_PIN=27, MIN_CM=30, MAX_CM=40):
    """
    Continuously monitors distance using VL53L0X.
    - Activates buzzer if outside range [MIN_CM, MAX_CM]
    - Turns off buzzer inside the range
    - Returns True when distance enters range
    - Returns False if button is pressed
    """
    BUTTON_PIN = 17  # GPIO17
    # === Setup GPIO ===
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(BUZZER_PIN, GPIO.OUT)
    GPIO.output(BUZZER_PIN, GPIO.LOW)
    GPIO.setup(BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)  # Use internal pull-up resistor
    
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
    
    # === Setup I2C and sensor ===
    try:
        print("[INFO] Initializing VL53L0X sensor...")
        vl53 = VL53L0X(bus_number=3, address=0x29)
        print("[INFO] VL53L0X sensor detected and initialized")
    except Exception as e:
        print(f"[ERROR] Failed to initialize VL53L0X: {e}")
        GPIO.cleanup()
        return False
    
    time.sleep(2)  # Allow sensor to stabilize
    print(f"[INFO] Monitoring distance. Looking for {MIN_CM}-{MAX_CM} cm...")
    print("[INFO] Press button or Ctrl+C to stop.")
    
    try:
        while True:
            # Check button press
            if GPIO.input(BUTTON_PIN) == GPIO.LOW:
                print("[INFO] Button pressed. Stopping monitoring.")
                return False
            
            # Read distance with error handling
            distance_mm = vl53.read_distance()
            
            if distance_mm >= 8190:
                print("[WARN] Distance out of range.")
                GPIO.output(BUZZER_PIN, GPIO.LOW)
                time.sleep(0.5)
                continue
            
            distance_cm = distance_mm / 10.0
            print(f"Distance: {distance_cm:.1f} cm")
            
            if MIN_CM <= distance_cm <= MAX_CM:
                GPIO.output(BUZZER_PIN, GPIO.LOW)
                print(f"[INFO] Distance within range ({MIN_CM}-{MAX_CM} cm).")
                return True
            else:
                GPIO.output(BUZZER_PIN, GPIO.HIGH)
            
            time.sleep(0.5)
            
    except KeyboardInterrupt:
        print("\n[INFO] Stopped by user.")
        return False
    finally:
        GPIO.output(BUZZER_PIN, GPIO.LOW)
        GPIO.cleanup()
        vl53.close()
        print("[INFO] GPIO cleaned up and sensor closed.")