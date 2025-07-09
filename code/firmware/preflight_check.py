from test.distance_sensor_test import test_distance_sensor
from test.buzzer_test import test_buzzer
from test.temperature_sensor_test import test_temperature_sensor
from test.camera_test import test_camera

import sys

def preflight_check():
    print("Running preflight checks...")

    results = {}

    # Run each test and store human-readable result
    results["Distance Sensor"] = "Ok" if test_distance_sensor() else "Failed"
    results["Temperature Sensor"] = "Ok" if test_temperature_sensor() else "Failed"
    results["Buzzer"] = "Ok" if test_buzzer() else "Failed"
    results["Camera"] = "Ok" if test_camera() else "Failed"

    # Print each result with status symbol
    print("\n===============Test Result=============")
    for component, status in results.items():
        print(f"{component} test: {status}")

    if all(status == "Ok" for status in results.values()):
        print("All sensors OK. Continuing to main program.")
    else:
        print("One or more tests failed. Review above results.")

    return results


if __name__ == "__main__":
    preflight_check()
