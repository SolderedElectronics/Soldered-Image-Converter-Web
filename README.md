# Soldered Image Converter

The **Soldered Image Converter** is a free, web-based tool that lets you prepare and convert images for use with [Inkplate displays](https://soldered.com/inkplate) and other supported boards.  
It’s designed to be simple, fast, and optimized for makers who want to quickly turn images into C header files ready for their projects.

---

## Features

- **Drag & Drop Upload**  
  Easily drop up to 10 images at once or browse from your computer.

- **Multi-File Editing**  
  Switch between multiple uploaded images with navigation controls.

- **Preview Window**  
  See your image exactly as it will appear on your Inkplate or other e-paper displays.

- **Board & Mode Selection**  
  Choose from supported boards and their specific display modes:
  - 1-bit black & white
  - 2-bit (Black/White/Red)
  - 3-bit grayscale
  - 4-bit grayscale

- **Image Processing Controls**  
  - Resize modes: **Fit**, **Fill**, or **Stretch**
  - Threshold adjustment for black & white images
  - Dithering options: Floyd–Steinberg, Jarvis, Stucki, Simple 2D, and more
  - Invert colors toggle
  - Constrain proportions when resizing

- **Real-Time Conversion**  
  All changes instantly regenerate the preview and C array data.

- **Code Panel**  
  Generated C header file is always visible:
  - Copy directly to clipboard
  - Save header for the current image
  - Save headers for all uploaded images in one click

---

## How to Use

1. **Upload an image**  
   Drag & drop or use the **Browse** button to select your files. You can upload up to 10 images.

2. **Select your board**  
   Use the dropdown in the header to choose your Inkplate or supported device.

3. **Adjust settings**  
   - Choose a color depth/mode
   - Apply dithering if needed
   - Adjust threshold, resize mode, or invert colors

4. **Preview**  
   See a pixel-accurate preview of how your image will appear on the device.

5. **Save**  
   - **Save Header** → download a `.h` file for the current image  
   - **Save All** → download headers for all uploaded images

---

## Tips

- For best results, start with an image that roughly matches your device’s aspect ratio.  
- Use dithering for more detail on black & white or grayscale modes.  
- Invert can help if your image background/foreground looks reversed.  
- Naming your image properly (letters, numbers, underscore only) will ensure the generated header is valid for Arduino/C usage.

---

## About Soldered

<img src="https://raw.githubusercontent.com/e-radionicacom/Soldered-Generic-Arduino-Library/dev/extras/Soldered-logo-color.png" alt="soldered-logo" width="500"/>

At Soldered, we design and manufacture a wide selection of electronic products to help you turn your ideas into acts and bring you one step closer to your final project. Our products are intented for makers and crafted in-house by our experienced team in Osijek, Croatia. We believe that sharing is a crucial element for improvement and innovation, and we work hard to stay connected with all our makers regardless of their skill or experience level. Therefore, all our products are open-source. Finally, we always have your back. If you face any problem concerning either your shopping experience or your electronics project, our team will help you deal with it, offering efficient customer service and cost-free technical support anytime. Some of those might be useful for you:

- [Web Store](https://www.soldered.com/shop)
- [Tutorials & Projects](https://soldered.com/learn)
- [Community & Technical support](https://soldered.com/community)

### Open-source license

Soldered invests vast amounts of time into hardware & software for these products, which are all open-source. Please support future development by buying one of our products.

Check license details in the LICENSE file. Long story short, use these open-source files for any purpose you want to, as long as you apply the same open-source licence to it and disclose the original source. No warranty - all designs in this repository are distributed in the hope that they will be useful, but without any warranty. They are provided "AS IS", therefore without warranty of any kind, either expressed or implied. The entire quality and performance of what you do with the contents of this repository are your responsibility. In no event, Soldered (TAVU) will be liable for your damages, losses, including any general, special, incidental or consequential damage arising out of the use or inability to use the contents of this repository.

## Have fun!

And thank you from your fellow makers at Soldered Electronics.
