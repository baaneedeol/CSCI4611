#version 300 es

/* Assignment 5: Artistic Rendering
 * Original C++ implementation by UMN CSCI 4611 Instructors, 2012+
 * GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu>, 2022-2024
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * PUBLIC DISTRIBUTION OF SOURCE CODE OUTSIDE OF CSCI 4611 IS PROHIBITED
 */ 

precision mediump float;


// INPUT FROM UNIFORMS SET WITHIN THE MAIN APPLICATION

// Transforms points and vectors from Model Space to World Space (modelToWorld)
uniform mat4 modelMatrix;
// Special version of the modelMatrix to use with normal vectors
uniform mat4 normalMatrix;
// Transforms points and vectors from World Space to View Space (a.k.a. Eye Space) (worldToView) 
uniform mat4 viewMatrix;
// Transforms points and vectors from View Space to Normalized Device Coordinates (viewToNDC)
uniform mat4 projectionMatrix;

// Distance to "move" the vertices in View Space to create the outline
uniform float outlineThickness;


// INPUT FROM THE MESH WE ARE RENDERING WITH THIS SHADER

// per-vertex data, points and vectors are defined in Model Space
in vec3 positionModel;
in vec3 normalModel;
in vec4 color;
in vec2 texCoords;


// OUTPUT
// This shader only needs to calculate gl_Position and does not need to
// pass any other output variables to the rasterizer and ragment shader.


void main() 
{
    // PART 2.2: Silhouette Outline Shader

    vec4 positionWorld4 = modelMatrix * vec4(positionModel, 1.0);
    vec3 normalWorld = normalize((normalMatrix * vec4(normalModel, 0.0)).xyz);

    vec4 positionView4 = viewMatrix * positionWorld4;
    vec3 normalView = normalize((viewMatrix * vec4(normalWorld, 0.0)).xyz);

    vec3 normalViewXY = normalView;
    normalViewXY.z = 0.0;

    float len = length(normalViewXY);
    if (len < 1e-6) {
        normalViewXY = vec3(1.0, 0.0, 0.0);
    } else {
        normalViewXY /= len;
    }

    vec3 offsetView = normalViewXY * outlineThickness;
    vec4 offsetPositionView4 = positionView4 + vec4(offsetView, 0.0);

    gl_Position = projectionMatrix * offsetPositionView4;
}
