/* Assignment 6: A World Made of Drawings
 * Concept and C++ implementation by Daniel Keefe, 2018+
 * GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu>, 2022-2024
 * Stroke3DFactory class by Prof. Dan Keefe, Fall 2023
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * PUBLIC DISTRIBUTION OF SOURCE CODE OUTSIDE OF CSCI 4611 IS PROHIBITED
 */ 

import * as gfx from 'gophergfx'
import { Vector2, Vector3, Quaternion, Matrix4 } from 'gophergfx';

import { Stroke2D } from './Stroke2D';
import { Billboard } from './Billboard';


/** 
 * This class holds static functions to handle the cases where the user's Stroke2D should be turned into
 * a new geometry, like a Mesh3 that goes in the sky or a Billboard that is attached to the ground. 
 */
export class Stroke3DFactory
{

    /**
     * Creates and returns a new Mesh3 by projecting the Stroke2D drawn by the user onto a sky sphere
     * of the specified radius.
     * 
     * @param stroke2D The stroke drawn by the user. All the points and vertices of this stroke will
     * be defined in normalized device coordinates (-1,-1) to (1,1).
     * @param camera The camera used while drawing the stroke. This is used within the routine to
     * create pick rays that originate at the camera's position and pass through the vertices of the
     * stroke2D.
     * @param skyRadius The radius of the sky sphere the stroke is projected onto.
     * @returns A new Mesh3 that holds the projected version of the stroke and can be added to the scene.
     */
    public static createSkyStrokeMesh(stroke2D: Stroke2D, camera: gfx.Camera, skyRadius: number): gfx.Mesh3
    {
        // TODO: Part 1: Draw Sky Strokes
        
        const mesh = new gfx.Mesh3(); 
        const meshVerts = [];

        const sky = new gfx.BoundingSphere()
        sky.radius = skyRadius

        // Hint #1: The Ray class in GopherGfx has an intersectsSphere() routine that you can use to
        // project the stroke2D onto a "sky sphere".

        for (let i = 0; i < stroke2D.vertices.length; i++) {
            const verts = stroke2D.vertices[i];

            const ray = new gfx.Ray3();
            ray.setPickRay(verts, camera);
            
            const intersection = ray.intersectsSphere(sky);
            if (intersection) {
                meshVerts.push(intersection);
            }
        }

        mesh.setVertices(meshVerts);
        mesh.setIndices(stroke2D.indices);

        // Hint #2: When creating a new Mesh3, you can setup it's material to be the same color as the stroke2D with:
        // newMesh.material = new gfx.UnlitMaterial();
        // newMesh.material.side = gfx.Side.DOUBLE;
        // newMesh.material.setColor(stroke2D.color);

        mesh.material = new gfx.UnlitMaterial();
        mesh.material.side = gfx.Side.DOUBLE;
        mesh.material.setColor(stroke2D.color);

        stroke2D.remove()
        return mesh;
    }


    /** 
     * Creates and returns a new Billboard object by projecting the Stroke2D drawn by the user onto a 3D plane.
     * The plane is defined by a point within the plane (anchorPointWorld) and a normal, which points from the
     * billboard's anchor point to the camera but without any variation in Y since the billboards in Harold are
     * always vertical planes (i.e., with no tilt up or down). 
     * 
     * Note, the Billboard class is just a small wrapper around a Mesh3.  So, the majority of the functionality
     * in this routine relates to projecting the stroke2D onto a plane and creating a new Mesh3 to hold the
     * result.  This new Mesh3 is then wrapped in a new Billboard object.
     * 
     * @param stroke2D The stroke drawn by the user. All the points and vertices of this stroke will
     * be defined in normalized device coordinates (-1,-1) to (1,1).
     * @param camera The camera used while drawing the stroke. This is used within the routine to
     * create pick rays that originate at the camera's position and pass through the vertices of the
     * stroke2D.
     * @param anchorPointWorld The 3D point on the ground that the billboard should be attached to and
     * rotate around.
     * @returns A new Billboard object that can be added to the scene.
     */
    public static createBillboard(stroke2D: Stroke2D, camera: gfx.Camera, anchorPointWorld: Vector3): Billboard
    {
        // TODO: Part 2: Draw Billboards Attached to the Ground

        const mesh = new gfx.Mesh3()
        const meshVerts = [];

        // Hint #1: To get the position of the camera in world coordinates, you can use the camera's localToWorld matrix
        // to transform the origin of camera space (0,0,0) to world space.

        const cameraPosWorld = camera.localToWorldMatrix.transformPoint(new gfx.Vector3(0, 0, 0))
        const anchorToCamera = gfx.Vector3.subtract(cameraPosWorld, anchorPointWorld);
        const anchorToCameraXZ = new Vector3(anchorToCamera.x, 0, anchorToCamera.z);
        anchorToCameraXZ.normalize(); 

        const plane = new gfx.Plane3(anchorPointWorld, anchorToCameraXZ);

        // Hint #2: When creating a new Mesh3, you can setup it's material to be the same color as the stroke2D with:
        // newMesh.material = new gfx.UnlitMaterial();
        // newMesh.material.side = gfx.Side.DOUBLE;
        // newMesh.material.setColor(stroke2D.color);

        for (let i = 0; i < stroke2D.vertices.length; i++) {
            const verts = stroke2D.vertices[i];

            const ray = new gfx.Ray3();
            ray.setPickRay(verts, camera);

            const intersection = ray.intersectsPlane(plane);
            if (intersection) {
                meshVerts.push(intersection);
            }
        }

        mesh.setVertices(meshVerts);
        mesh.setIndices(stroke2D.indices);

        mesh.material = new gfx.UnlitMaterial();
        mesh.material.side = gfx.Side.DOUBLE;
        mesh.material.setColor(stroke2D.color);

        stroke2D.remove();
        return new Billboard(anchorPointWorld, anchorToCameraXZ, mesh);
    }
}
