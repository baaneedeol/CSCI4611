/** CSci-4611 Text Rain Assignment Support Code
 * Assignment concept by Daniel Keefe, 2014+
 * GopherGfx implementation, Daniel Keefe, 2023
 * Inspired by Camille Utterbeck's "Text Rain" installation, 2000+
 * Copyright Regents of the University of Minnesota
 * Please do not distribute beyond the CSci-4611 course
 */

import * as gfx from 'gophergfx'

/**
 * A collection of helper routines for working with images stored in ImageData objects.
 * Feel free to add additional routines (e.g., image filters) if you like.  (We did in
 * our implementation.)
 */
export class ImageUtils
{
    /**
     * Creates a new ImageData object of the specified width and height.  Every byte in the data array
     * will be be initialized to 0 (i.e., black completely transparent pixels).
     */
    public static createBlank(width: number, height: number): ImageData
    {
        const nBytes = width * height * 4;
        return new ImageData(new Uint8ClampedArray(nBytes), width, height);
    }

    /**
     * Checks the image variable to determine if has already been created, then checks to see if it has
     * the desired width and height.  If these checks pass, then the function returns the existing image.
     * If either check fails, then the function creates a new ImageData object of the desired width and 
     * height and returns it.  In this case, the image will be initialized using ImageUtils.createBlank().   
     * @param image Can be null, undefined, or an existing image
     * @param width The desired width of the image
     * @param height The desired height of the image
     * @returns The current image if it matches the desired width and height or a new image that matches
     */
    public static createOrResizeIfNeeded(image: ImageData | undefined | null, width: number, height: number): ImageData
    {
        if (!(image instanceof ImageData) || image.width != width || image.height != height) {
            return this.createBlank(width, height);
        } else {
            return image;
        }
    }

    /**
     * Returns a new ImageData object that is a deep copy of the source image provided.  This includes copying
     * all of the pixel data from the source to the new image object.
     */
    public static clone(source: ImageData): ImageData
    {
        const copyOfPixelData = new Uint8ClampedArray(source.data);
        return new ImageData(copyOfPixelData, source.width, source.height);
    }

    /**
     * Copies the pixel data from the source image into the pixels of the destination image. 
     * @param source An existing ImageData object that is the source for the pixel data.
     * @param dest An existing ImageData object that is the destination for the pixel data.
     */
    public static copyPixels(source: ImageData, dest: ImageData): void
    {
        for (let i=0; i<source.data.length; i++) {
            dest.data[i] = source.data[i];
        }
    }


    /* The following helper functions should be fairly easy to implement based on your answers to
     * the quiz and may be useful to use as part of your solution. 
     */

    // channel number is the +1, +2, +3, etc. 

    /**
     * Returns the value of the red component of the color for the pixel located at the
     * given row and column in the image.
     */
    public static getRed(image: ImageData, col: number, row: number): number
    {
        const index = (row * image.width + col) * 4; 
        return image.data[index]
    }

    /**
     * Returns the value of the green component of the color for the pixel located at the
     * given row and column in the image.
     */
    public static getGreen(image: ImageData, col: number, row: number): number
    {
        const index = (row * image.width + col) * 4; 
        return image.data[index + 1]
    }

    /**
     * Returns the value of the blue component of the color for the pixel located at the
     * given row and column in the image.
     */
    public static getBlue(image: ImageData, col: number, row: number): number
    {
        const index = (row * image.width + col) * 4; 
        return image.data[index + 2]
    }

    /**
     * Returns the value of the alpha component of the color for the pixel located at the
     * given row and column in the image.
     */
    public static getAlpha(image: ImageData, col: number, row: number): number
    {
        const index = (row * image.width + col) * 4; 
        return image.data[index + 3]
    }

    /**
     * Returns the color (RGBA) for the pixel located at the given row and column in 
     * the image using the GopherGfx Color class.
     */
    public static getPixel(image: ImageData, col: number, row: number): gfx.Color
    {
        const index = (row * image.width + col) * 4; 
        const r = image.data[index];
        const g = image.data[index + 1];
        const b = image.data[index + 2];
        const a = image.data[index + 3]; 
        return new gfx.Color(r/255, g/255, b/255, a/ 255);    
    }

    // Image Processing

    // Converting to Grayscale
    public static conversionGrayscale(source: ImageData, dest: ImageData): void {
        for (let row = 0; row < source.height; row++) {
            for (let col = 0; col < source.width; col++) {
                const index = (row * source.width + col) * 4; 
                const r = source.data[index]; 
                const g = source.data[index + 1]; 
                const b = source.data[index + 2]; 
                const avg = 0.21*r + 0.72*g + 0.07*b; //from lecture slides

                dest.data[index] = avg;
                dest.data[index + 1] = avg;
                dest.data[index + 2] = avg;
                dest.data[index + 3] = 255;
            }
        }
    }

    // Mirroring the Image
    public static mirrorImage(source: ImageData, dest: ImageData): void {
        const width = source.width;
        const height = source.height; 

        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col ++) {
                const mirrorCol = width - 1 - col; 

                const sourceIndex = (row * width + col) * 4; 
                const destIndex = (row * width + mirrorCol) * 4; 
                
                dest.data[destIndex] = source.data[sourceIndex];                 
                dest.data[destIndex + 1] = source.data[sourceIndex + 1]; 
                dest.data[destIndex + 2] = source.data[sourceIndex + 2]; 
                dest.data[destIndex + 3] = source.data[sourceIndex + 3]; 

            }
        }
    }
    
    // Threshold
    public static threshold(source: ImageData, dest: ImageData, threshold: number): void {
        for (let row = 0; row < source.height; row++) {
            for (let col = 0; col < source.width; col++) {
                const index = (row * source.width + col) * 4;
                const gray = source.data[index]; // picking from red since R = G = B

                const value = (gray > threshold) ? 255 : 0; // assigns value based on whether gray > threshold

                dest.data[index]     = value;
                dest.data[index + 1] = value;
                dest.data[index + 2] = value;
                dest.data[index + 3] = 255;
            }
        }
    }
}


