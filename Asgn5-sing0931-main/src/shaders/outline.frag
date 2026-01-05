#version 300 es

/* Assignment 5: Artistic Rendering
 * Original C++ implementation by UMN CSCI 4611 Instructors, 2012+
 * GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu>, 2022-2024
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * PUBLIC DISTRIBUTION OF SOURCE CODE OUTSIDE OF CSCI 4611 IS PROHIBITED
 */ 

precision mediump float;


// INPUT FROM UNIFORMS SET WITHIN THE MAIN APPLICATION
uniform vec4 outlineColor;


// OUTPUT
out vec4 fragColor;


// This shader colors each fragment using a constant outline color passed in from 
// the main application.  You do not need to modify it.
void main() {
    fragColor = outlineColor;
}
