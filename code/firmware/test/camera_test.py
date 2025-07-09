import subprocess

def test_camera():
    try:
        # You can also use libcamera-still for Bullseye+ OS
        result = subprocess.run(["libcamera-still", "-n", "-o", "/dev/null", "-t", "1000"], capture_output=True)
        if result.returncode != 0:
            print("Camera test failed:", result.stderr.decode())
            return False
        print("Camera test passed.")
        return True
    except Exception as e:
        print(f"Camera test error: {e}")
        return False
