import tkinter as tk
from tkinter import messagebox,ttk
import cv2
from picamera2 import Picamera2
import time
import datetime
import os
from alert import get_vein_numbers
from webImg import image_process
from cloud import cloud_upload,fetch_patients
import RPi.GPIO as GPIO
from distance import monitor_distance_and_buzz


# GPIO Setup
BUTTON_PIN = 17
GPIO.setmode(GPIO.BCM)
GPIO.setup(BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)


def start_picamera2_stream(patient_id, resolution=(1280, 720), capture_interval=5):
    picam2 = Picamera2()
    preview_config = picam2.create_preview_configuration(
        main={"format": "RGB888", "size": resolution}
    )
    picam2.configure(preview_config)
    picam2.start()
    time.sleep(1)

    capturing = False
    distance=False
    last_button_state = GPIO.input(BUTTON_PIN)

    # Create a directory to save images
    save_dir = "captured_images"
    os.makedirs(save_dir, exist_ok=True)

    print("[INFO] Press 'q' to quit")

    while True:
        
        frame = picam2.capture_array()

        # Show full-color video
        cv2.imshow("Live Color Video (HD)", frame)
        
        # Check for button press (state change from HIGH to LOW)
        current_button_state = GPIO.input(BUTTON_PIN)
        if last_button_state == GPIO.HIGH and current_button_state == GPIO.LOW:
                capturing = not capturing
                print(f"[INFO] Capturing: {'Started' if capturing else 'Stopped'}")
                time.sleep(0.3)  # Debounce delay

        last_button_state = current_button_state
        if capturing:
            distance = monitor_distance_and_buzz()
            if distance==False:
                capturing = False
        
        if capturing and distance :
            # Generate filename using current date and time
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{save_dir}/image_{timestamp}.jpg"
            cv2.imwrite(filename, frame)
            print(f"[INFO] Captured {filename}")
            
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

# =======================
# Tkinter GUI Section
# =======================
def run_gui():
    patients = fetch_patients()
    if not patients:
        print("[ERROR] No patients found in database.")
        return

    window = tk.Tk()
    window.title("Patient Selection")
    window.geometry("500x400")

    tk.Label(window, text="Select a patient:", font=("Arial", 16)).pack(pady=10)

    selected_patient = tk.StringVar()
    patient_map = {}

    # Scrollable frame setup
    container = ttk.Frame(window)
    canvas = tk.Canvas(container, height=250)
    scrollbar = ttk.Scrollbar(container, orient="vertical", command=canvas.yview)
    scrollable_frame = ttk.Frame(canvas)

    scrollable_frame.bind(
        "<Configure>",
        lambda e: canvas.configure(
            scrollregion=canvas.bbox("all")
        )
    )

    canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
    canvas.configure(yscrollcommand=scrollbar.set)

    container.pack(fill="both", expand=True, padx=10)
    canvas.pack(side="left", fill="both", expand=True)
    scrollbar.pack(side="right", fill="y")

    for p in patients:
        label = f"{p['name']} (ID: {p['_id']})"
        patient_map[label] = str(p["_id"])
        ttk.Radiobutton(scrollable_frame, text=label, variable=selected_patient, value=label).pack(anchor="w", padx=10, pady=5)

    def on_start():
        selected_label = selected_patient.get()
        if selected_label not in patient_map:
            messagebox.showerror("Selection Error", "Please select a patient.")
            return

        confirm = messagebox.askyesno("Confirm Selection", f"Start scan for:\n{selected_label}?")
        if not confirm:
            return

        pid = patient_map[selected_label]
        window.destroy()
        start_picamera2_stream(pid)

    tk.Button(window, text="Start", command=on_start, font=("Arial", 12)).pack(pady=20)

    window.mainloop()
# =======================


if __name__ == "__main__":
    run_gui()
