import RPi.GPIO as GPIO
import time

# Pin configuration
BUTTON_PIN = 17  # GPIO17

# Setup
GPIO.setmode(GPIO.BCM)  # Use BCM pin numbering
GPIO.setup(BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)  # Use internal pull-up resistor

print("Press the button (CTRL+C to exit)...")

capture=False
prev_btn_state=GPIO.input(BUTTON_PIN)

while True:
    button_state = GPIO.input(BUTTON_PIN)

    if prev_btn_state == GPIO.HIGH and button_state == GPIO.LOW:
                    capture = not capture
                    print(f"[INFO] Capturing: {'Started' if capture else 'Stopped'}")
                    time.sleep(0.3)  # Debounce delay

    prev_btn_state = button_state




GPIO.cleanup()
   
