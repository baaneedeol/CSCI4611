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

// constants used to indicate the type of each light
#define POINT_LIGHT 0
#define DIRECTIONAL_LIGHT 1

// max number of simultaneous lights handled by this shader
const int MAX_LIGHTS = 8;


// INPUT FROM UNIFORMS SET WITHIN THE MAIN APPLICATION

// properties of the lights in the scene
uniform int numLights;
uniform int lightTypes[MAX_LIGHTS];
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

// normal map data
uniform int useNormalMap;
uniform sampler2D normalMap;


// INPUT FROM THE VERTEX SHADER AFTER INTERPOLATION ACROSS TRIANGLES BY THE RASTERIZER

in vec4 interpColor;
in vec2 interpTexCoords;
in vec3 interpPositionTangent;
in vec3 eyePositionTangent;
in vec3 lightPositionsTangent[MAX_LIGHTS];


// OUTPUT
out vec4 fragColor;


void main() 
{
    // The normal in Tangent Space
    vec3 nTangent;

    if (useNormalMap == 0) {
        // If we have NOT loaded a normal map then we default to the surface
        // normal of the triangle.  In Tangent Space, this is (0, 0, 1). 
        // This essentially skips doing any normal mapping.  So, this case 
        // should produce the same result as a Phong shader.
        nTangent = vec3(0, 0, 1);
    }
    else {
        // PART 2.3: Set the normal using data from the normal map texture
        vec3 normalColor = texture(normalMap, interpTexCoords).rgb;
        nTangent = normalize(normalColor * 2.0 - 1.0);
    }

    // Below this point, the code follows a typical Phong process of calculating
    // illumination with the important change that all the calculations are done
    // with points and vectors defined in Tangent Space to match the nTangent
    // vector defined above.  You can copy the main for loop and illumination
    // equations from your Phong shader and paste it below.  Just remember the
    // original code calculates lighting in World Space.  To switch to calculating
    // the lighting in Tangent Space, you need to use the Tangent Space versions
    // of all of the points and vectors used in the calculations.
    
    // PART 2.3: Calculating illumination in Tangent Space

    vec3 baseSurfaceColor = interpColor.rgb;
    if (useTexture == 1) {
        vec3 sampledSurface = texture(surfaceTexture, interpTexCoords).rgb;
        baseSurfaceColor = sampledSurface;
    }

    vec3 accumulatedColor = vec3(0.0, 0.0, 0.0);
    vec3 viewDirectionTangent = normalize(eyePositionTangent - interpPositionTangent);

    for (int i = 0; i < numLights; i++) {
        vec3 lightDirectionTangent;
        if (lightTypes[i] == POINT_LIGHT) {
            lightDirectionTangent = normalize(lightPositionsTangent[i] - interpPositionTangent);
        } else {
            lightDirectionTangent = normalize(lightPositionsTangent[i]);
        }

        vec3 ambientComponent = kAmbient * lightAmbientIntensities[i];

        float diffuseFactor = max(dot(nTangent, lightDirectionTangent), 0.0);
        vec3 diffuseComponent = kDiffuse * lightDiffuseIntensities[i] * diffuseFactor;

        vec3 reflectionDirectionTangent = reflect(-lightDirectionTangent, nTangent);
        float specularFactor = 0.0;
        if (diffuseFactor > 0.0) {
            specularFactor = pow(max(dot(viewDirectionTangent, reflectionDirectionTangent), 0.0), shininess);
        }
        vec3 specularComponent = kSpecular * lightSpecularIntensities[i] * specularFactor;

        accumulatedColor += ambientComponent + diffuseComponent + specularComponent;
    }

    vec3 finalColor = baseSurfaceColor * accumulatedColor;
    finalColor = clamp(finalColor, 0.0, 1.0);
    fragColor = vec4(finalColor, 1.0);

}
