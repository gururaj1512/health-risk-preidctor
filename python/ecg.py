import cv2
import pytesseract
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMAGES_DIR = os.path.join(BASE_DIR, "images")
image_path = os.path.join(IMAGES_DIR, "Heart_Rate.pbm")
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def extract_ecg_waveform(image_path):
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file not found at: {image_path}")
    
    ecg_img = cv2.imread(image_path, 0)
    if ecg_img is None:
        raise ValueError(f"Failed to load image at: {image_path}")
    
    cropped_ecg = ecg_img[60:300, 100:600]
    edges = cv2.Canny(cropped_ecg, threshold1=50, threshold2=100)
    y_values = np.argmax(edges, axis=0)
    
    y_values = np.interp(y_values, (y_values.min(), y_values.max()), (50, 100))
    
    plt.figure(figsize=(10, 4))
    plt.plot(y_values, color='red')
    plt.gca().invert_yaxis()
    plt.title("HR Waveform")
    plt.xlabel("Time")
    plt.ylabel("Amplitude")
    plt.ylim(50, 100)
    
    # Save plot to images folder
    plot_path = os.path.join(IMAGES_DIR, "ecg_plot.png")
    plt.savefig(plot_path, dpi=300, bbox_inches='tight')
    plt.show()
    
    output_path = os.path.join(BASE_DIR, "waveform_data.csv")
    np.savetxt(output_path, y_values, delimiter=',', fmt='%d')
    
    return y_values

if __name__ == "__main__":
    try:
        if not os.path.exists(IMAGES_DIR):
            os.makedirs(IMAGES_DIR)
        waveform = extract_ecg_waveform(image_path)
        print(waveform)
        print(f"ECG plot saved to: {os.path.join(IMAGES_DIR, 'ecg_plot.png')}")
    except Exception as e:
        print(f"Error: {str(e)}")