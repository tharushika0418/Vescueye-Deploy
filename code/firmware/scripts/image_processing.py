import cv2
import numpy as np
import os
import io
import sys
from rembg import remove

def process_nir_image(input_path):
    """
    Process an NIR image: remove background and apply false color.
    Saves only the final processed image in the 'process_imgs' directory.
    
    Args:
        input_path (str): Absolute path to input image
    """
    try:
        abs_input_path = os.path.abspath(input_path)
        print(f"Processing image: {abs_input_path}")
        
        if not os.path.exists(abs_input_path):
            print(f"Error: Input file not found: {abs_input_path}")
            return False
            
        script_dir = os.path.dirname(os.path.abspath(__file__))
        process_imgs_dir = os.path.join(script_dir, "process_imgs")
        os.makedirs(process_imgs_dir, exist_ok=True)
        
        base_name = os.path.splitext(os.path.basename(abs_input_path))[0]

        print("Removing background...")
        bg_removed_image = remove_background(abs_input_path)
        
        if bg_removed_image is None:
            print("Failed to remove background. Exiting.")
            return False

        print("Creating false color image...")
        final_image = create_false_color(bg_removed_image)
        
        if final_image is None:
            print("Failed to create false color image. Exiting.")
            return False
        
        final_output_path = os.path.join(process_imgs_dir, f"{base_name}_processed.png")
        print(f"Saving final processed image to: {final_output_path}")
        cv2.imwrite(final_output_path, final_image)
        
        return final_output_path
    except Exception as e:
        print(f"Error in process_nir_image: {str(e)}")
        return 

def remove_background(image_path):
    """Remove background from the image using rembg (without PIL)"""
    try:
        print(f"Opening image file: {image_path}")
        with open(image_path, "rb") as input_file:
            input_data = input_file.read()
        
        print("Running background removal...")
        output_data = remove(input_data)

        # Convert byte data to OpenCV format
        image_array = np.frombuffer(output_data, dtype=np.uint8)
        opencv_image = cv2.imdecode(image_array, cv2.IMREAD_UNCHANGED)

        if opencv_image is None:
            print("Failed to decode image after background removal.")
            return None

        if opencv_image.shape[-1] == 4:  # If image has an alpha channel
            opencv_image = cv2.cvtColor(opencv_image, cv2.COLOR_BGRA2BGR)
        
        return opencv_image
    except Exception as e:
        print(f"Error removing background: {e}")
        return None

def create_false_color(img, clip_limit=15):
    """Convert NIR grayscale to false color representation"""
    try:
        if len(img.shape) == 3:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        else:
            gray = img.copy()
        
        clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=(16, 16))
        enhanced = clahe.apply(gray)
        
        dimensions = enhanced.shape
        temp_frame = np.zeros((dimensions[0], dimensions[1], 3), dtype=np.uint8)
        
        for i in range(dimensions[0]):
            for j in range(dimensions[1]):
                intensity = enhanced[i, j]
                if intensity < 85:
                    temp_frame[i, j] = (intensity * 2, intensity, 0)  # Dark blue-green
                elif intensity < 170:
                    temp_frame[i, j] = (0, intensity, intensity)  # Cyan-blue
                else:
                    temp_frame[i, j] = (0, 255 - intensity, intensity)  # Yellow-red
        
        return temp_frame
    except Exception as e:
        print(f"Error creating false color: {e}")
        return None

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_filename = "img2.jpeg"
    INPUT_IMAGE_PATH = os.path.join(script_dir, input_filename)

    print(f"Input image path: {INPUT_IMAGE_PATH}")
    
    result = process_nir_image(INPUT_IMAGE_PATH)
    if result:
        print("Processing complete!")
    else:
        print("Processing failed!")
        sys.exit(1)
