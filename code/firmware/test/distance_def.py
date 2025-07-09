import time
import board
import busio
import adafruit_vl53l0x
import RPi.GPIO as GPIO

# === Configuration ===
BUZZER_PIN = 27           # GPIO pin connected to buzzer
TRIGGER_DISTANCE_CM = 20  # Distance threshold in cm

# === Setup GPIO for buzzer ===
GPIO.setmode(GPIO.BCM)
GPIO.setup(BUZZER_PIN, GPIO.OUT)
GPIO.output(BUZZER_PIN, GPIO.LOW)

# === Setup I2C bus ===
i2c = busio.I2C(board.SCL, board.SDA)

# === Initialize VL53L0X sensor ===
try:
    vl53 = adafruit_vl53l0x.VL53L0X(i2c)
except Exception as e:
    print(f"[ERROR] Failed to initialize VL53L0X: {e}")
    GPIO.cleanup()
    exit(1)

# Optional: give sensor time to initialize
time.sleep(2)

print("[INFO] Starting measurements. Press Ctrl+C to stop.")

try:
    while True:
        # Read distance
        distance_mm = vl53.range

        # Check for out-of-range readings (common for VL53L0X)
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
    print("[INFO] GPIO cleaned up.")
