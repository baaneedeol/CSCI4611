#version 300 es

/* Assignment 5: Artistic Rendering
 * Original C++ implementation by UMN CSCI 4611 Instructors, 2012+
 * GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu>, 2022-2024
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * PUBLIC DISTRIBUTION OF SOURCE CODE OUTSIDE OF CSCI 4611 IS PROHIBITED
 */ 

precision mediump float;

// constants used to indicate the type of each light
#define POINT_LIGHT 0
#define DIRECTIONAL_LIGHT 1

// max number of simultaneous lights handled by this shader
const int MAX_LIGHTS = 8;


// INPUT FROM UNIFORMS SET WITHIN THE MAIN APPLICATION

// position of the camera in world coordinates
uniform vec3 eyePositionWorld;

// properties of the lights in the scene
uniform int numLights;
uniform int lightTypes[MAX_LIGHTS];
uniform vec3 lightPositionsWorld[MAX_LIGHTS];
uniform vec3 lightAmbientIntensities[MAX_LIGHTS];
uniform vec3 lightDiffuseIntensities[MAX_LIGHTS];
uniform vec3 lightSpecularIntensities[MAX_LIGHTS];

// material properties (coefficents of reflection)
uniform vec3 kAmbient;
uniform vec3 kDiffuse;
uniform vec3 kSpecular;
uniform float shininess;

// texture data
uniform int useTexture;
uniform sampler2D surfaceTexture;


// INPUT FROM THE VERTEX SHADER AFTER INTERPOLATION ACROSS TRIANGLES BY THE RASTERIZER

in vec3 interpPositionWorld;
in vec3 interpNormalWorld;
in vec4 interpColor;
in vec2 interpTexCoords;


// OUTPUT

out vec4 fragColor;


void main() {
    // PART 2.0: In class example

    vec3 baseSurfaceColor = interpColor.rgb;
    if (useTexture != 0) {
        vec4 sampledColor = texture(surfaceTexture, interpTexCoords);
        baseSurfaceColor = sampledColor.rgb;
    }

    vec3 accumulatedLighting = vec3(0.0, 0.0, 0.0);

    for (int i = 0; i < numLights; i++) {
        vec3 lightDirectionWorld;
        if (lightTypes[i] == POINT_LIGHT) {
            lightDirectionWorld = normalize(lightPositionsWorld[i] - interpPositionWorld);
        } else {
            lightDirectionWorld = normalize(lightPositionsWorld[i]);
        }

        vec3 viewDirectionWorld = normalize(eyePositionWorld - interpPositionWorld);

        vec3 ambientComponent = kAmbient * lightAmbientIntensities[i];

        float diffuseFactor = max(dot(interpNormalWorld, lightDirectionWorld), 0.0);
        vec3 diffuseComponent = kDiffuse * lightDiffuseIntensities[i] * diffuseFactor;

        vec3 reflectDirectionWorld = normalize(reflect(-lightDirectionWorld, interpNormalWorld));
        float specularFactor = pow(max(dot(viewDirectionWorld, reflectDirectionWorld), 0.0), shininess);
        vec3 specularComponent = kSpecular * lightSpecularIntensities[i] * specularFactor;

        accumulatedLighting += ambientComponent + diffuseComponent + specularComponent;
    }

    vec3 finalColor = baseSurfaceColor * accumulatedLighting;
    finalColor = clamp(finalColor, 0.0, 1.0);
    fragColor = vec4(finalColor, 1.0);
}
