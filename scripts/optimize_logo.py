from PIL import Image
import os

def crop_to_content(input_path, output_path):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    
    # Get the bounding box of the non-transparent content
    bbox = img.getbbox()
    
    if bbox:
        # Crop the image to the contents
        cropped = img.crop(bbox)
        
        # Add a tiny bit of padding (optional, but good for aesthetics)
        # For favicon, we want it MAXIMIZED, so maybe no padding is better.
        # But let's add 5% padding to avoid touching edges? 
        # User said "quase nao aparece", so let's make it TIGHT. No padding.
        
        cropped.save(output_path, "PNG")
        print(f"Successfully cropped text to {bbox} and saved to {output_path}")
    else:
        print("Image is empty!")

# Paths
base_dir = r"d:\Bkp\www\Burgos\apps\web\public"
input_path = os.path.join(base_dir, "logo-dbb.png") # This is already the transparent one from previous step
temp_output = os.path.join(base_dir, "logo-optimized.png")

crop_to_content(input_path, temp_output)

# Overwrite files
import shutil
shutil.copy(temp_output, os.path.join(base_dir, "logo-dbb.png"))
shutil.copy(temp_output, os.path.join(base_dir, "icon.png"))
shutil.copy(temp_output, os.path.join(base_dir, "favicon.ico"))
