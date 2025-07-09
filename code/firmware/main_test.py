import cv2
from picamera2 import Picamera2
import time
import datetime
import os
from alert import get_vein_numbers
from webImg import image_process
from cloud import cloud_upload
from pymongo import MongoClient
import RPi.GPIO as GPIO
from cloud import fetch_patients

# Pin configuration
BUTTON_PIN = 17  # GPIO17
# Setup
GPIO.setmode(GPIO.BCM)  # Use BCM pin numbering
GPIO.setup(BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)  # Use internal pull-up resistor


def start_picamera2_stream(patient_id,resolution=(1280, 720), capture_interval=5):
     
    picam2 = Picamera2()
    preview_config = picam2.create_preview_configuration(
        main={"format": "RGB888", "size": resolution}
    )
    picam2.configure(preview_config)
    picam2.start()
    time.sleep(1)  # Let the camera warm up

    last_capture_time = time.time()

    # Create a directory to save images
    save_dir = "captured_images"
    os.makedirs(save_dir, exist_ok=True)

    print("[INFO] Press 'q' to quit")

    while True:
        
        frame = picam2.capture_array()

        # Show full-color video
        #cv2.imshow("Live Color Video (HD)", frame)
        
        current_time = time.time()
        
        if current_time - last_capture_time >= capture_interval:
            # Generate filename using current date and time
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{save_dir}/image_{timestamp}.jpg"
            frame = cv2.resize(frame, (480,320))
            cv2.imwrite(filename, frame)
            print(f"[INFO] Captured {filename}")
            last_capture_time = current_time
            
            results = get_vein_numbers(filename)
            process_img = image_process(filename)
            
            if results is None:
                print(f"[ERROR] Vein process failed")
                continue
            
            if process_img is None:
                print(f"[ERROR] Image process failed")
                continue
            
            cloud_upload(process_img,patient_id,results)
            
            

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    picam2.stop()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    patients = fetch_patients()
    
    if not patients:
        print("[ERROR] No patients found in database.")
        exit()
    
    print("Select a patient:")
    for idx, patient in enumerate(patients):
        print(f"{idx + 1}. {patient['name']} (ID: {patient['_id']})")
    
    selection = int(input("Enter the number of the selected patient: ")) - 1
    if selection < 0 or selection >= len(patients):
        print("[ERROR] Invalid selection.")
        exit()
    
    selected_patient = patients[selection]
    patient_id = str(selected_patient["_id"])
    
    start_picamera2_stream(patient_id)  # Or use (1920, 1080)
