import time
import board
import busio
import adafruit_mlx90614
import RPi.GPIO as GPIO


# === Setup I2C bus ===
i2c = busio.I2C(board.SCL, board.SDA)

# === Initialize sensors ===
mlx = adafruit_mlx90614.MLX90614(i2c)

print("[INFO] Starting measurements. Press Ctrl+C to stop.")

try:
    while True:
       
        # Read temperatures (in Celsius)
        ambient_temp = mlx.ambient_temperature
        object_temp = mlx.object_temperature

        # Print measurements
        print(f" Ambient Temp: {ambient_temp:.1f} °C | Object Temp: {object_temp:.1f} °C")

        time.sleep(0.5)

except KeyboardInterrupt:
    print("\n[INFO] Measurement stopped by user.")

finally:
    GPIO.cleanup()
