import cv2
import numpy as np

class VeinExtractorNumbers:
    def __init__(self):
        self.original_image = None
        self.pink_mask = None
        self.blue_mask = None
        self.continuity_score = 0
        self.vein_percentage = 0
        self.blue_percentage = 0
        
    def load_image(self, image_path):
        """Load the NIR hand image"""
        try:
            self.original_image = cv2.imread(image_path)
            if self.original_image is None:
                print(f"Error: Could not load image from {image_path}")
                return False
            return True
        except Exception as e:
            print(f"Error loading image: {e}")
            return False
    
    def alternative_color_extraction(self):
        """Extract pink/magenta regions using RGB color space"""
        if self.original_image is None:
            return None
            
        # Convert to RGB
        rgb_image = cv2.cvtColor(self.original_image, cv2.COLOR_BGR2RGB)
        
        # Extract color channels
        r, g, b = cv2.split(rgb_image)
        
        # Create mask where red and blue are high, but green is relatively low
        pink_condition = (
            (r > g + 20) &  # Red dominance over green
            (b > g + 20) &  # Blue dominance over green  
            (r > 80) &      # Minimum red intensity
            (b > 80) &      # Minimum blue intensity
            ((r + b) > 160) # Combined red+blue intensity
        )
        
        self.pink_mask = pink_condition.astype(np.uint8) * 255
        
        # Clean up the mask
        kernel = np.ones((5,5), np.uint8)
        self.pink_mask = cv2.morphologyEx(self.pink_mask, cv2.MORPH_CLOSE, kernel)
        self.pink_mask = cv2.morphologyEx(self.pink_mask, cv2.MORPH_OPEN, kernel)
        
        return self.pink_mask
    
    def analyze_vein_continuity(self):
        """Analyze vein continuity and return numerical results"""
        if self.pink_mask is None:
            return None
            
        # Calculate total pixels in the image
        total_pixels = self.original_image.shape[0] * self.original_image.shape[1]
        
        # Calculate pink (vein region) pixels
        pink_pixels = np.sum(self.pink_mask > 0)
        self.vein_percentage = (pink_pixels / total_pixels) * 100
        
        # Analyze vein patterns within pink regions
        if pink_pixels > 0:
            # Convert image to grayscale for vein line detection
            gray_image = cv2.cvtColor(self.original_image, cv2.COLOR_BGR2GRAY)
            
            # Apply pink mask to focus only on vein regions
            masked_gray = cv2.bitwise_and(gray_image, gray_image, mask=self.pink_mask)
            
            # Find dark vein lines within pink regions
            pink_region_pixels = masked_gray[self.pink_mask > 0]
            if len(pink_region_pixels) > 0:
                mean_intensity = np.mean(pink_region_pixels)
                std_intensity = np.std(pink_region_pixels)
                
                # Define threshold for dark vein lines
                vein_threshold = max(0, mean_intensity - 0.5 * std_intensity)
                
                # Create mask for dark vein lines within pink regions
                dark_veins_mask = (masked_gray < vein_threshold) & (self.pink_mask > 0)
                dark_veins_mask = dark_veins_mask.astype(np.uint8) * 255
                
                # Clean up the vein lines mask
                kernel_line = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
                dark_veins_mask = cv2.morphologyEx(dark_veins_mask, cv2.MORPH_CLOSE, kernel_line)
                
                # Remove small noise
                kernel_noise = np.ones((2,2), np.uint8)
                dark_veins_mask = cv2.morphologyEx(dark_veins_mask, cv2.MORPH_OPEN, kernel_noise)
                
                # Calculate vein line pixels
                vein_line_pixels = np.sum(dark_veins_mask > 0)
                self.blue_percentage = (vein_line_pixels / pink_pixels) * 100
                
                # Store the vein lines mask
                self.blue_mask = dark_veins_mask
                
                # Calculate continuity score
                optimal_vein_percentage = 27.5  # Midpoint of 15-40%
                vein_density_score = max(0, 10 - abs(self.blue_percentage - optimal_vein_percentage) / 2.75)
                
                # Analyze vein line connectivity
                num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(dark_veins_mask, connectivity=8)
                
                # Filter out very small components (noise)
                min_component_size = 20
                significant_components = np.sum(stats[1:, cv2.CC_STAT_AREA] >= min_component_size)
                
                # Calculate connectivity score
                if significant_components > 0:
                    component_density = significant_components / (pink_pixels / 1000)
                    connectivity_score = max(0, 10 - component_density)
                else:
                    connectivity_score = 0
                
                # Combine scores
                self.continuity_score = (vein_density_score * 0.6 + connectivity_score * 0.4)
                self.continuity_score = max(0, min(10, self.continuity_score))
                
            else:
                self.blue_percentage = 0
                self.continuity_score = 0
        else:
            self.blue_percentage = 0
            self.continuity_score = 0
        
        return {
            'vein_percentage': self.vein_percentage,
            'vein_line_percentage': self.blue_percentage,
            'continuity_score': self.continuity_score
        }
    
    def get_vein_metrics(self, image_path):
        """Complete processing pipeline that returns only the numerical values"""
        # Load image
        if not self.load_image(image_path):
            return None
            
        # Extract pink regions
        self.alternative_color_extraction()
        
        # Analyze vein continuity
        results = self.analyze_vein_continuity()
        
        return {
            'vein_percentage': round(self.vein_percentage, 2),
            'vein_line_percentage': round(self.blue_percentage, 2),
            'continuity_score': round(self.continuity_score, 1)
        }

# Simple usage function
def get_vein_numbers(image_path):
    """
    Simple function that returns vein analysis numbers
    
    Returns:
    - vein_percentage: Percentage of image that contains vein regions
    - vein_line_percentage: Percentage of vein lines within vein regions  
    - continuity_score: Score from 0-10 indicating vein continuity quality
    """
    extractor = VeinExtractorNumbers()
    results = extractor.get_vein_metrics(image_path)
    
    if results:
        print(f"Vein Percentage: {results['vein_percentage']}%")
        print(f"Vein Lines Percentage: {results['vein_line_percentage']}%")
        print(f"Continuity Score: {results['continuity_score']}/10")
        
        return results
    else:
        print("Failed to process image")
        return None
