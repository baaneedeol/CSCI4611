/* Assignment 5: Artistic Rendering
 * Original C++ implementation by UMN CSCI 4611 Instructors, 2012+
 * GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu>, 2022-2024
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * PUBLIC DISTRIBUTION OF SOURCE CODE OUTSIDE OF CSCI 4611 IS PROHIBITED
 */ 

// You only need to modify the shaders for this assignment.
// You do not need to write any TypeScript code unless
// you are planning to add wizard functionality.

// @ts-ignore
import outlineVertexShader from './shaders/outline.vert'
// @ts-ignore
import outlineFragmentShader from './shaders/outline.frag'

import * as gfx from 'gophergfx'
import { Vector2, Vector3, Quaternion, Matrix4 } from 'gophergfx';


export class OutlineMaterial extends gfx.Material3
{
    public color: gfx.Color;
    public thickness: number;
    public baseMaterial: gfx.Material3;

    public static shader = new gfx.ShaderProgram(outlineVertexShader, outlineFragmentShader);

    private modelUniform: WebGLUniformLocation | null;
    private viewUniform: WebGLUniformLocation | null;
    private projectionUniform: WebGLUniformLocation | null;
    private normalUniform: WebGLUniformLocation | null;
    private colorUniform: WebGLUniformLocation | null;
    private thicknessUniform: WebGLUniformLocation | null;

    private positionAttribute: number;
    private normalAttribute: number;

    constructor(baseMaterial: gfx.Material3)
    {
        super();

        this.baseMaterial = baseMaterial;
        this.color = new gfx.Color(0, 0, 0);
        this.thickness = 0.01;

        OutlineMaterial.shader.initialize(this.gl);
        
        this.viewUniform = OutlineMaterial.shader.getUniform(this.gl, 'viewMatrix');
        this.modelUniform = OutlineMaterial.shader.getUniform(this.gl, 'modelMatrix');
        this.projectionUniform = OutlineMaterial.shader.getUniform(this.gl, 'projectionMatrix');
        this.normalUniform = OutlineMaterial.shader.getUniform(this.gl, 'normalMatrix');
        this.colorUniform = OutlineMaterial.shader.getUniform(this.gl, 'outlineColor');
        this.thicknessUniform = OutlineMaterial.shader.getUniform(this.gl, 'outlineThickness');

        this.positionAttribute = OutlineMaterial.shader.getAttribute(this.gl, 'positionModel');
        this.normalAttribute = OutlineMaterial.shader.getAttribute(this.gl, 'normalModel');
    }

    draw(mesh: gfx.Mesh3, camera: gfx.Camera, lightManager: gfx.LightManager): void
    {
        if(!this.visible || mesh.triangleCount == 0)
            return;

        // Enable the stencil test
        this.gl.enable(this.gl.STENCIL_TEST);

        // Clear the stencil buffer
        this.gl.clear(this.gl.STENCIL_BUFFER_BIT);

        // Setup the test so it always passes
        this.gl.stencilFunc(this.gl.ALWAYS, 1, 0xFF);

        // Set the stencil to the reference value when 
        // both the stencil and the depth tests pass
        this.gl.stencilOp(this.gl.KEEP, this.gl.KEEP, this.gl.REPLACE);

        // Draw the base material
        this.baseMaterial.draw(mesh, camera, lightManager);

        // Now the stencil test will only pass if the reference value is 0
        this.gl.stencilFunc(this.gl.EQUAL, 0, 0xFF);

        // Don't update the stencil buffer when rendering the outline
        this.gl.stencilOp(this.gl.KEEP, this.gl.KEEP, this.gl.KEEP);

        // Now initialize the outline shader
        this.initialize();

        // Switch to this shader
        this.gl.useProgram(OutlineMaterial.shader.getProgram());

        // Set the camera uniforms
        this.gl.uniformMatrix4fv(this.modelUniform, false, mesh.localToWorldMatrix.mat);
        this.gl.uniformMatrix4fv(this.viewUniform, false, camera.viewMatrix.mat);
        this.gl.uniformMatrix4fv(this.projectionUniform, false, camera.projectionMatrix.mat);
        this.gl.uniformMatrix4fv(this.normalUniform, false, mesh.localToWorldMatrix.getInverse().getTranspose().mat);

        // Set the material property uniforms
        this.gl.uniform4f(this.colorUniform, this.color.r, this.color.g, this.color.b, this.color.a);

        // Set the line thickness uniform
        this.gl.uniform1f(this.thicknessUniform, this.thickness);

        // Set the vertex positions
        if (this.positionAttribute != -1) {
            this.gl.enableVertexAttribArray(this.positionAttribute);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.positionBuffer);
            this.gl.vertexAttribPointer(this.positionAttribute, 3, this.gl.FLOAT, false, 0, 0);
        }

        // Set the vertex normals
        if (this.normalAttribute != -1) {
            this.gl.enableVertexAttribArray(this.normalAttribute);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.normalBuffer);
            this.gl.vertexAttribPointer(this.normalAttribute, 3, this.gl.FLOAT, false, 0, 0);
        }

        // Draw the triangles
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
        this.gl.drawElements(this.gl.TRIANGLES, mesh.triangleCount*3, this.gl.UNSIGNED_SHORT, 0);

        // Disable the stencil test
        this.gl.disable(this.gl.STENCIL_TEST);
    }

    setColor(color: gfx.Color): void
    {
        this.color.copy(color);
    }

    getColor(): gfx.Color
    {
        return this.color;
    }
}