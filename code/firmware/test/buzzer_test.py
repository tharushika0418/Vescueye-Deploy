import RPi.GPIO as GPIO
import time

BUZZER_PIN = 27

def test_buzzer():
    try:
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(BUZZER_PIN, GPIO.OUT)
        GPIO.output(BUZZER_PIN, True)
        time.sleep(0.5)
        GPIO.output(BUZZER_PIN, False)
        GPIO.cleanup()
        print("Buzzer test passed.")
        return True
    except Exception as e:
        print(f"Buzzer test failed: {e}")
        GPIO.cleanup()
        return False
