import cv2
import os

def crop_and_grayscale(image_path, output_path, crop_size=1200):
    # Read image
    img = cv2.imread(image_path)
    if img is None:
        print(f"Error: Cannot load image from {image_path}")
        return

    h, w = img.shape[:2]
    if h < crop_size or w < crop_size:
        print(f"Error: Image too small to crop to {crop_size}x{crop_size}")
        return

    # Calculate cropping coordinates
    top = (h - crop_size) // 2
    left = (w - crop_size) // 2
    bottom = top + crop_size
    right = left + crop_size

    # Crop the image
    cropped_img = img[top:bottom, left:right]

    # Convert to grayscale
    gray_cropped_img = cv2.cvtColor(cropped_img, cv2.COLOR_BGR2GRAY)

    # Save output as lossless PNG
    cv2.imwrite(output_path, gray_cropped_img)
    print(f"Grayscale cropped image saved to {output_path}")

if __name__ == "__main__":
    input_path = "img6.jpg"              # Replace with your IR image path
    output_path = "cropped_gray_1200.png"    # Use .png for lossless output
    crop_and_grayscale(input_path, output_path)
