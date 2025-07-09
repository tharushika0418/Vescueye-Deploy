import tkinter as tk
from tkinter import messagebox,ttk
import time
import datetime
import os
from cloud import fetch_patients
import threading
from queue import Queue
from concurrent.futures import ThreadPoolExecutor
from preflight_check import preflight_check
import importlib

preloaded_modules = {}
# Shared variable to control operation
capturing = False

#Software based ISR for button
def button_isr(channel):
    global capturing
    capturing = not capturing  # Toggle operation
    if capturing:
        print("Resumed operation")
    else:
        print("Paused operation")



def preload_heavy_modules():
    try:
        #print("Modules being import")
        preloaded_modules['cv2'] = importlib.import_module('cv2')
        preloaded_modules['picamera2'] = importlib.import_module('picamera2')
        preloaded_modules['GPIO'] = importlib.import_module('RPi.GPIO')
        preloaded_modules['get_vein_numbers'] = importlib.import_module('alert').get_vein_numbers
        preloaded_modules['image_process'] = importlib.import_module('webImg').image_process
        preloaded_modules['cloud_upload'] = importlib.import_module('cloud').cloud_upload
        preloaded_modules['monitor_distance_and_buzz'] = importlib.import_module('distance').monitor_distance_and_buzz
        #print("Import complete")
    except Exception as e:
        print(f"Module preload failed: {e}")

# Queue for storing frames
frame_queue = Queue()

# Function to process frames in a separate thread
def processing_worker(patient_id):
    from alert import get_vein_numbers
    from webImg import image_process
    from cloud import cloud_upload

    executor = ThreadPoolExecutor(max_workers=2)

    while True:
        item = frame_queue.get()
        if item is None:
            break  # Sentinel to stop the thread
        frame, timestamp = item

        save_dir = "captured_images"
        os.makedirs(save_dir, exist_ok=True)
        filename = f"{save_dir}/image_{timestamp}.jpg"

        # Resize the frame
        frame = cv2.resize(frame, (480,320)) 

        cv2.imwrite(filename, frame)
        print(f"[INFO] Captured {filename}")

        # Submit both processing tasks to the thread pool
        future_vein = executor.submit(get_vein_numbers, filename)
        future_img = executor.submit(image_process, filename)

        # Wait for both to finish
        results = future_vein.result()
        processed_img = future_img.result()

        if results is None:
            print(f"[ERROR] Vein process failed")
            continue

        if processed_img is None:
            print(f"[ERROR] Image process failed")
            continue

        cloud_upload(processed_img, patient_id, results)

# Main function
def start_picamera2_stream(patient_id, resolution=(1280, 720)):   
    import RPi.GPIO as GPIO
    from distance import monitor_distance_and_buzz
    import cv2
    from picamera2 import Picamera2

    BUTTON_PIN = 17
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)

    # Add interrupt detection on falling edge
    GPIO.add_event_detect(BUTTON_PIN, GPIO.FALLING, callback=button_isr, bouncetime=100)

    picam2 = Picamera2()
    preview_config = picam2.create_preview_configuration(
        main={"format": "RGB888", "size": resolution}
    )
    picam2.configure(preview_config)
    picam2.start()
    time.sleep(1)

    distance = False

    print("[INFO] Press 'q' to quit")

    # Start worker thread
    worker_thread = threading.Thread(target=processing_worker, args=(patient_id,))
    worker_thread.start()

    try:
        while True:
            frame = picam2.capture_array()
            cv2.imshow("Live Color Video (HD)", frame)

            if capturing:
                distance = monitor_distance_and_buzz()
                if not distance:
                    capturing = False

            if capturing and distance:
                timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
                # Put frame + timestamp in the queue for processing
                frame_queue.put((frame.copy(), timestamp))

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    finally:
        picam2.stop()
        cv2.destroyAllWindows()
        frame_queue.put(None)  # Signal worker to stop
        worker_thread.join()


# =======================
# Tkinter GUI Section
# =======================

# Shared variable for patient data
patient_data = []

def run_gui():
    window = tk.Tk()
    window.title("Vascueye Flap Monitor")
    window.geometry("500x400")

    # Container frame to swap content
    container = tk.Frame(window)
    container.pack(fill="both", expand=True)

    # Shared variable for switching views
    current_frame = {"frame": None}

    def show_frame(new_frame):
        if current_frame["frame"] is not None:
            current_frame["frame"].pack_forget()
        new_frame.pack(fill="both", expand=True)
        current_frame["frame"] = new_frame

    # ====================
    # Home Screen
    # ====================
    home_frame = tk.Frame(container)

    tk.Label(home_frame, text="Vascueye Flap Monitor", font=("Arial", 20, "bold")).pack(pady=30)

    status_label = tk.Label(home_frame, text="Loading patients...", font=("Arial", 10))
    status_label.pack()

    tk.Button(home_frame, text="Test", command=lambda: show_frame(test_frame), font=("Arial", 14), width=15).pack(pady=10)
    tk.Button(home_frame, text="Run", command=lambda: show_frame(run_frame), font=("Arial", 14), width=15).pack(pady=10)
    tk.Button(home_frame, text="Exit", command=window.destroy, font=("Arial", 14), width=15).pack(pady=10)

    # ====================
    # Test Frame
    # ====================
    test_frame = tk.Frame(container)

    tk.Label(test_frame, text="Preflight Check", font=("Arial", 18, "bold")).pack(pady=10)

    test_result_area = tk.Frame(test_frame)
    test_result_area.pack(pady=10)

    def run_preflight_test():
        for widget in test_result_area.winfo_children():
            widget.destroy()

        result = preflight_check()

        for k, v in result.items():
            tk.Label(test_result_area, text=f"{k}: {v}", font=("Arial", 12)).pack(anchor="w", padx=20)

    tk.Button(test_frame, text="Run Test", command=lambda: threading.Thread(target=run_preflight_test).start(),
              font=("Arial", 12)).pack(pady=10)

    tk.Button(test_frame, text="Back", command=lambda: show_frame(home_frame), font=("Arial", 12)).pack(pady=10)

    # ====================
    # Run Frame
    # ====================
    run_frame = tk.Frame(container)

    tk.Label(run_frame, text="Select a patient", font=("Arial", 18, "bold")).pack(pady=10)

    selected_patient = tk.StringVar()
    patient_map = {}

    container_scroll = ttk.Frame(run_frame)
    canvas = tk.Canvas(container_scroll, height=250)
    scrollbar = ttk.Scrollbar(container_scroll, orient="vertical", command=canvas.yview)
    scrollable_frame = ttk.Frame(canvas)

    scrollable_frame.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
    canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
    canvas.configure(yscrollcommand=scrollbar.set)

    container_scroll.pack(fill="both", expand=True, padx=10)
    canvas.pack(side="left", fill="both", expand=True)
    scrollbar.pack(side="right", fill="y")

    def refresh_patient_list():
        for widget in scrollable_frame.winfo_children():
            widget.destroy()
        for p in patient_data:
            label = f"{p['name']} (ID: {p['_id']})"
            patient_map[label] = str(p["_id"])
            ttk.Radiobutton(scrollable_frame, text=label, variable=selected_patient, value=label).pack(anchor="w", padx=10, pady=5)

    def on_start_scan():
        label = selected_patient.get()
        if label not in patient_map:
            messagebox.showerror("Selection Error", "Please select a patient.")
            return
        if messagebox.askyesno("Confirm", f"Start scan for:\n{label}?"):
            pid = patient_map[label]
            start_picamera2_stream(pid)

    tk.Button(run_frame, text="Start Scan", command=on_start_scan, font=("Arial", 12)).pack(pady=10)
    tk.Button(run_frame, text="Back", command=lambda: show_frame(home_frame), font=("Arial", 12)).pack(pady=10)

    # ====================
    # Load Patients in Background
    # ====================
    def fetch_patients_async():
        patients = fetch_patients()
        patient_data.extend(patients)

        def update_ui():
            status_label.config(text=f"{len(patients)} patients loaded.")
            refresh_patient_list()

        window.after(0, update_ui)

    show_frame(home_frame)
    threading.Thread(target=fetch_patients_async, daemon=True).start()
    window.mainloop()


if __name__ == "__main__":
    print("Starting thread...")
    threading.Thread(target=preload_heavy_modules, daemon=True).start()
    print("Thread started, starting GUI...")
    run_gui()
    print("GUI started")
    
