#version 300 es

/* Assignment 5: Artistic Rendering
 * Original C++ implementation by UMN CSCI 4611 Instructors, 2012+
 * GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu>, 2022-2024
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * PUBLIC DISTRIBUTION OF SOURCE CODE OUTSIDE OF CSCI 4611 IS PROHIBITED
 */ 

// Normal mapping based on the approach described in
// https://learnopengl.com/Advanced-Lighting/Normal-Mapping

precision mediump int;
precision mediump float;

// max number of simultaneous lights handled by this shader
const int MAX_LIGHTS = 8;


// INPUT FROM UNIFORMS SET IN THE MAIN APPLICATION

// Transforms points and vectors from Model Space to World Space (modelToWorld)
uniform mat4 modelMatrix;
// Special version of the modelMatrix to use with normal vectors
uniform mat4 normalMatrix;
// Transforms points and vectors from World Space to View Space (a.k.a. Eye Space) (worldToView) 
uniform mat4 viewMatrix;
// Transforms points and vectors from View Space to Normalized Device Coordinates (viewToNDC)
uniform mat4 projectionMatrix;

// position of the camera in world coordinates
uniform vec3 eyePositionWorld;

// properties of the lights in the scene
uniform int numLights;
uniform vec3 lightPositionsWorld[MAX_LIGHTS];


// INPUT FROM THE MESH WE ARE RENDERING WITH THIS SHADER

// per-vertex data, points and vectors are defined in Model Space
in vec3 positionModel;
in vec3 normalModel;
in vec3 tangentModel;
in vec4 color;
in vec2 texCoords;


// OUTPUT TO RASTERIZER TO INTERPOLATE ACROSS TRIANGLES AND SEND TO FRAGMENT SHADERS

out vec4 interpColor;
out vec2 interpTexCoords;
out vec3 interpPositionTangent;
out vec3 eyePositionTangent;
out vec3 lightPositionsTangent[MAX_LIGHTS];


void main() 
{
    // Pass the vertex's color and texture coordinates on to the rasterizer to interpolate 
    // across triagles so we can read these values later in the fragment shader.
    interpColor = color;
    interpTexCoords = texCoords.xy; 

    // Compute the world vertex position
    vec3 positionWorld = (modelMatrix * vec4(positionModel, 1)).xyz;   

    // PART 2.3: Computing the TBN matrix and then using it to transform:
    // - the vertex position
    // - the eye position
    // - the position of each light in the lights array
    // The results should then be saved in the output variables already defined above
    // to pass on to the rasterizer and fragment shader.

    vec3 normalWorld = normalize((normalMatrix * vec4(normalModel, 0.0)).xyz);
    vec3 tangentWorld = normalize((normalMatrix * vec4(tangentModel, 0.0)).xyz);

    vec3 tangentOrtho = tangentWorld - normalWorld * dot(normalWorld, tangentWorld);
    tangentOrtho = normalize(tangentOrtho);

    vec3 bitangentWorld = cross(normalWorld, tangentOrtho);

    mat3 tangentToWorld = mat3(tangentOrtho, bitangentWorld, normalWorld);
    mat3 worldToTangent = transpose(tangentToWorld);

    interpPositionTangent = worldToTangent * positionWorld;
    eyePositionTangent = worldToTangent * eyePositionWorld;

    for (int i = 0; i < numLights; i++) {
        lightPositionsTangent[i] = worldToTangent * lightPositionsWorld[i];
    }

    vec4 positionView4 = viewMatrix * vec4(positionWorld, 1.0);
    gl_Position = projectionMatrix * positionView4;

}
