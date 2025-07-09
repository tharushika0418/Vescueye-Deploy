import cv2
import os
from datetime import datetime

class NIRBasicEnhancer:
    def __init__(self, contrast_limit=15):
        self.contrast_limit = contrast_limit
        
    def load_image(self, image_path):
        """Load an image from the specified path"""
        try:
            # Read the image
            image = cv2.imread(image_path)
            
            # Check if image is loaded successfully
            if image is None:
                print(f"Error: Could not load image from {image_path}")
                return None
                
            return image
        except Exception as e:
            print(f"Error loading image: {e}")
            return None
    
    def enhance_nir_basic(self, img):
        """Basic NIR enhancement with contrast stretching and CLAHE"""
        # Convert to grayscale if it's not already
        if len(img.shape) == 3:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        else:
            gray = img.copy()
        
        # Apply CLAHE for adaptive histogram equalization
        clahe = cv2.createCLAHE(clipLimit=self.contrast_limit, tileGridSize=(16, 16))
        enhanced = clahe.apply(gray)
        
        return enhanced
    
    def save_image(self, enhanced_image, output_path):
        """Save the processed image"""
        try:
            # Save the image
            success = cv2.imwrite(output_path, enhanced_image)
            
            if success:
                print(f"Enhanced image saved as: {output_path}")
                return output_path
            else:
                print(f"Error: Failed to save image to {output_path}")
                return None
                
        except Exception as e:
            print(f"Error saving image: {e}")
            return None
    
    def process_image(self, input_path, output_path):
        """Main processing function"""
        print(f"Loading image from: {input_path}")
        
        # Load the image
        original_image = self.load_image(input_path)
        if original_image is None:
            return False
        
        print("Applying basic NIR enhancement...")
        
        # Apply basic enhancement
        enhanced_gray = self.enhance_nir_basic(original_image)
        
        # Save the enhanced image
        saved_path = self.save_image(enhanced_gray, output_path)
        
        if saved_path:
            print("Processing completed successfully!")
            return saved_path
        else:
            print("Processing failed!")
            return None

def image_process(input_path):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    # Create a directory to save images
    save_dir = "process_images"
    os.makedirs(save_dir, exist_ok=True) 
    
    output_path = f"{save_dir}/image_{timestamp}.jpg"
    
    # Check if input file exists
    if not os.path.exists(input_path):
        print(f"Error: Input file '{input_path}' does not exist!")
        return
    
    # Create enhancer instance
    enhancer = NIRBasicEnhancer(contrast_limit=15)
    
    # Process the image
    saved_path = enhancer.process_image(input_path, output_path)
    
    return saved_path
