import time
import RPi.GPIO as GPIO
from picamera2 import Picamera2

# Initialize the camera
camera = Picamera2()
camera.configure(camera.create_still_configuration())

# Setup GPIO pin 36 for the IR LED
GPIO.setmode(GPIO.BOARD)  # Use physical pin numbering
GPIO.setup(36, GPIO.OUT)  # Set pin 36 as an output pin

camera.start()

# Function to capture an image
def capture_image(image_number):
    # Turn on the IR LED
    GPIO.output(36, GPIO.HIGH)
    print(f"[{image_number}] IR LED is ON")
    
    time.sleep(1)  # Let the IR LED illuminate the scene

    # Capture the image
    filename = f'image_{image_number}.jpg'
    print(f"[{image_number}] Capturing image...")
    camera.capture_file(filename)
    print(f"[{image_number}] Image captured and saved as {filename}")

    # Turn off the IR LED
    GPIO.output(36, GPIO.LOW)
    print(f"[{image_number}] IR LED is OFF")

# Capture 5 images
try:
    for i in range(1, 6):  # 1 to 5
        capture_image(i)
        time.sleep(2)  # Optional: wait between captures
finally:
    # Cleanup GPIO
    GPIO.cleanup()
    print("GPIO cleaned up.")
