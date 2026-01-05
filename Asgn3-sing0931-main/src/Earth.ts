/* Assignment 3: Earthquake Visualization
 * Concept and C++ implementation by Daniel Keefe and TAs, 2012+
 * GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu> 2022
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * PUBLIC DISTRIBUTION OF SOURCE CODE OUTSIDE OF CSCI 4611 IS PROHIBITED
 */

import * as gfx from 'gophergfx'
import { Vector2, Vector3, Quaternion } from 'gophergfx';
import { EarthquakeMarker } from './EarthquakeMarker';
import { EarthquakeRecord } from './EarthquakeRecord';

export class Earth extends gfx.Node3
{
    private earthMesh: gfx.MorphMesh3;

    public globeMode: boolean;

    // Rotation variables for wizard functionality
    public naturalRotation: Quaternion;
    public mouseRotation: Quaternion;

    constructor()
    {
        // Call the superclass constructor
        super();

        this.earthMesh = new gfx.MorphMesh3();

        this.globeMode = false;

        // Default natural rotation is the earth's axial tilt
        this.naturalRotation = Quaternion.makeRotationZ(-23.4 * Math.PI / 180); 
        
        this.mouseRotation = new Quaternion();
    }

    public initialize(): void
    {
         // Initialize texture: you can change to a lower-res texture here if needed
        // Note that this won't display properly until you assign texture coordinates to the mesh
        this.earthMesh.material.texture = new gfx.Texture('./assets/earth-2k.png');

        // These parameters determine the appearance in the wireframe and vertex display modes
        this.earthMesh.material.ambientColor.set(0, 1, 1);
        this.earthMesh.material.pointSize = 10;
        
        // This disables mipmapping, which makes the texture appear sharper
        this.earthMesh.material.texture.setMinFilter(true, false);   

        // Add the mesh as a child of this node
        this.add(this.earthMesh);
    }


    // The flat map and sphere meshes should both have the same resolution.
    // The assignment handout uses n = number of columns, and m = number of rows.
    // In this routine, let's assume both values are the same:
    //   n = meshResolution
    //   m = meshResolution
    public createMesh(meshResolution: number): void
    {
        // Part 1: Creating the Flat Map Mesh
        // As part of your solution, please complete the convertLatLongToPlane() method
        // that comes later in this class, and use it here to help you calculate the
        // vertex positions for the flat map mesh. 
        const mapVertices: Vector3[] = [];
        const mapNormals: Vector3[] = [];
        const indices: number[] = [];
        const texCoords: number[] = [];

        // define ranges
        const startX = -180;
        const startY = 90;
        const changeX = (180 * 2) / meshResolution;
        const changeY = (90 * 2) / meshResolution;

        // generate vertices for flat map
        for (let y = startY; y >= -90; y -= changeY) {
            for (let x = startX; x <= 180; x += changeX) {
                mapVertices.push(this.convertLatLongToPlane(y, x));
            }
        }

        // generate normals
        for (let i = 0; i < mapVertices.length; i++) {
            mapNormals.push(gfx.Vector3.BACK);
        }

        // generate triangle indices 
        for (let i = 0; i < meshResolution; i++) {
            for (let j = 0; j < meshResolution; j++) {
                const width = meshResolution + 1;
                const topLeft = i * width + j;
                const bottomLeft = (i + 1) * width + j;
                const topRight = i * width + j + 1;
                const bottomRight = (i + 1) * width + j + 1;
                indices.push(topLeft, bottomRight, topRight);
                indices.push(topLeft, bottomLeft, bottomRight);
            }
        }

        // generate texture coordinates
        const change = 1 / meshResolution;
        for (let v = 0; v <= meshResolution; v++) {
            for (let u = 0; u <= meshResolution; u++) {
                texCoords.push(u * change, v * change);
            }
        }

        // This saves the data arrays to the earth mesh
        this.earthMesh.setVertices(mapVertices, true);
        this.earthMesh.setNormals(mapNormals, true);
        this.earthMesh.setIndices(indices);
        this.earthMesh.setTextureCoordinates(texCoords);


        // Part 3: Creating the Globe Mesh
        // As part of your solution, please complete the convertLatLongToSphere() method
        // that comes later in this class, and use it here to help you calculate the
        // vertex positions for the flat map mesh. 

        // If you fill in these arrays to store the globe mesh data, you can use
        // the code below to save them in the globe mesh.  Note, the indices and
        // texture coordinates will be the same for both meshes.  So, we do not
        // need to recompute those.
        const globeVertices: Vector3[] = [];
        const globeNormals: Vector3[] = [];

        // generate vertices for globe
        for (let y = startY; y >= -90; y -= changeY) {
            for (let x = startX; x <= 180; x += changeX) {
                globeVertices.push(this.convertLatLongToSphere(y, x));
            }
        }

        // compute normals for globe
        const center = this.earthMesh.morphTargetBoundingSphere.center;
        for (let i = 0; i < globeVertices.length; i++) {
            const normal = gfx.Vector3.subtract(globeVertices[i], center);
            normal.normalize();
            globeNormals.push(normal);
        }

        // This saves the data arrays to the earth mesh
        this.earthMesh.setMorphTargetVertices(globeVertices, true);
        this.earthMesh.setMorphTargetNormals(globeNormals, true);

        // Recompute the wireframe after the mesh geometry is updated
        this.earthMesh.material.updateWireframeBuffer(this.earthMesh);
    }


    public update(deltaTime: number) : void
    {
        // Part 4: Morphing Between the Map and Globe
        // this.earthMesh is a GopherGfx MorphMesh object.  So, it already knows how to morph
        // between the two sets of vertices using lerp.  However, we need to set the current
        // state for the morph by setting the this.earthMesh.morphAlpha value.
        
        // this.earthMesh.morphAlpha should be set to 0 when in flat map mode and 1 when in 
        // globe mode.  However, to get a smooth morph, you will want to adjust the value
        // gradually based on the elapsed time.
        const morphSpeed = 0.5;
        if (this.globeMode) {
            // globe mode is active
            this.earthMesh.morphAlpha = gfx.MathUtils.clamp(this.earthMesh.morphAlpha + deltaTime * morphSpeed, 0, 1)
        } 
        else {
            // flat map mode is active
            this.earthMesh.morphAlpha = gfx.MathUtils.clamp(this.earthMesh.morphAlpha - deltaTime * morphSpeed, 0, 1)
        }
    }


    public createEarthquake(record: EarthquakeRecord)
    {
        // Part 5: Creating the Earthquake Markers
        // This shows how to create an earthquake and add it to the Earth, but you will still
        // need to set the quake's positions for the map and globe and set its color based on
        // the quake's magnitude.
        const duration = 12 * 30 * 24 * 60 * 60;  // approx number of milliseconds in 1 year

        // set positions for morphing
        const mapPos = this.convertLatLongToPlane(record.latitude, record.longitude);
        const globePos = this.convertLatLongToSphere(record.latitude, record.longitude);

        // initial position
        const earthquake = new EarthquakeMarker(mapPos, globePos, record, duration);

        // set color and size based on magnitude
        const scale = gfx.MathUtils.lerp(0.01, 1, record.magnitude / 10); 
        earthquake.scale.set(scale, scale, scale);

        const color = gfx.Color.lerp(gfx.Color.YELLOW, gfx.Color.RED, record.magnitude / 10);
        earthquake.material.setColor(color);

        this.add(earthquake);
    }


    public animateEarthquakes(currentTime : number)
    {
        // This code removes earthquake markers after their life has expired
        this.children.forEach((quake: gfx.Node3) => {
            if (quake instanceof EarthquakeMarker) {
                const playbackLife = (quake as EarthquakeMarker).getPlaybackLife(currentTime);

                if (playbackLife >= 1) {
                    // The earthquake has exceeded its lifespan and should be moved from the scene
                    quake.remove();
                }
                else {
                    // Part 6: Morphing the Earthquake Positions
                    quake.position = gfx.Vector3.lerp(quake.mapPosition, quake.globePosition, this.earthMesh.morphAlpha)
                }
            }
        });
    }


    // Fill in this method to convert from latitude and longitude (in degrees) to a point
    // in the flat map coordinate system.
    public convertLatLongToPlane(latitude: number, longitude: number): Vector3
    {
        const lat = latitude * Math.PI / 180;
        const lon = longitude * Math.PI / 180;
        return new Vector3(lon, lat, 0);
    }


    // Fill in this method to convert from latitude and longitude (in degrees) to a point
    // in the globe coordinate system.
    public convertLatLongToSphere(latitude: number, longitude: number): Vector3
    {
        const lat = latitude * Math.PI / 180;
        const lon = longitude * Math.PI / 180;
        const x = Math.cos(lat) * Math.sin(lon);
        const y = Math.sin(lat);
        const z = Math.cos(lat) * Math.cos(lon);
        return new Vector3(x, y, z);
    }


    public changeDisplayMode(displayMode : string)
    {
        if (displayMode == 'Textured') {
            this.earthMesh.material.materialMode = gfx.MorphMaterialMode.SHADED;
        }
        else if (displayMode == 'Wireframe') {
            this.earthMesh.material.materialMode = gfx.MorphMaterialMode.WIREFRAME; 
        }
        else if (displayMode == 'Vertices') {
            this.earthMesh.material.materialMode = gfx.MorphMaterialMode.VERTICES;
        }
    }
}