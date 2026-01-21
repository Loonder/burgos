from PIL import Image

def remove_background(input_path, output_path):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    
    datas = img.getdata()
    
    newData = []
    for item in datas:
        # Check if the pixel is black (or very close to black)
        # item is (R, G, B, A)
        if item[0] < 50 and item[1] < 50 and item[2] < 50:  # Threshold for black
            newData.append((255, 255, 255, 0))  # Transparent
        else:
            newData.append(item)
    
    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Successfully saved transparent image to {output_path}")

input_file = r"C:\Users\PC\.gemini\antigravity\brain\7365088c-6637-41e7-ac77-46493f03c3b4\logo_dbb_gold_fixed_1768959757780.png"
output_file = r"d:\Bkp\www\Burgos\apps\web\public\logo-dbb.png"
output_icon = r"d:\Bkp\www\Burgos\apps\web\public\icon.png"
output_favicon = r"d:\Bkp\www\Burgos\apps\web\public\favicon.ico"

remove_background(input_file, output_file)
# Copy to other locations
Image.open(output_file).save(output_icon)
Image.open(output_file).save(output_favicon)
