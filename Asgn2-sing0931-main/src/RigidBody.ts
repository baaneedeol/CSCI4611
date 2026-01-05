/* Assignment 2: Hole in the Ground
 * CSCI 4611, University of Minnesota
 * Assignment developed by Evan Suma Rosenberg
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * PUBLIC DISTRIBUTION OF SOURCE CODE OUTSIDE OF CSCI 4611 IS PROHIBITED
 */ 

import * as gfx from 'gophergfx'
import { Vector2, Vector3 } from 'gophergfx';

export class RigidBody extends gfx.Mesh3
{
    // Parameter to approximate downward acceleration due to gravity
    public static gravity = -10;

    // The current velocity of the rigid body
    public velocity: Vector3;

    // The current radius of the rigid body's collision sphere
    private radius: number;

    constructor(baseMesh: gfx.Mesh3)
    {   
        super();

        // Copy over all the mesh data from the base mesh
        this.positionBuffer = baseMesh.positionBuffer;
        this.normalBuffer = baseMesh.normalBuffer;
        this.colorBuffer = baseMesh.colorBuffer;
        this.indexBuffer = baseMesh.indexBuffer;
        this.texCoordBuffer = baseMesh.texCoordBuffer;
        this.vertexCount = baseMesh.vertexCount;
        this.hasVertexColors = baseMesh.hasVertexColors;
        this.triangleCount = baseMesh.triangleCount;
        this.material = baseMesh.material;
        this.boundingBox = baseMesh.boundingBox;
        this.boundingSphere = baseMesh.boundingSphere;
        this.visible = baseMesh.visible;

        this.velocity = new Vector3();
        this.radius = baseMesh.boundingSphere.radius;
    }

    update(deltaTime: number): void
    {
        // PART 2: RIGID BODY PHYSICS
        // In this part, you should use the formulas described in class and Vector3 math to:
        // 1. Define an acceleration due to gravity 3D vector
        // 2. Update the 3D velocity vector, given the acceleration
        // 3. Update the 3D position, given the velocity

        const gravity = new Vector3(0, RigidBody.gravity * deltaTime, 0); 
        this.velocity.add(gravity);

        const displacement = new Vector3(this.velocity.x * deltaTime, this.velocity.y * deltaTime, this.velocity.z * deltaTime);
        this.position.add(displacement);
    }

    // Use this method to set the radius of the collision sphere.  This will also
    // properly scale the object that it is displayed within the collision sphere.
    setRadius(radius: number): void
    {
        this.radius = radius;
        
        const scaleFactor = this.radius / this.boundingSphere.radius;
        this.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }

    // Get the current radius of the collision sphere.
    getRadius(): number
    {
        return this.radius;
    }
}
