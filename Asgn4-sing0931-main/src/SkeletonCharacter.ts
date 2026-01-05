/* Assignment 4: So You Think Ants Can Dance
 * Concept and C++ implementaiton by Daniel Keefe and TAs, 2012+
 * GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu> 2022
 * Significant changes by Prof. Dan Keefe, 2023 
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * PUBLIC DISTRIBUTION OF SOURCE CODE OUTSIDE OF CSCI 4611 IS PROHIBITED
 */ 

import * as gfx from 'gophergfx'
import { Vector2, Vector3, Quaternion, Matrix4 } from 'gophergfx';

import { AnimatedBone } from './AnimatedBone';
import { AnimatedCharacter } from './AnimatedCharacter'


/**
 * This character should draw each bone as a cylinder with radius 0.01.  Transformation matrices 
 * need to be used to scale, rotate, and translate the cylinder so that it starts at the origin
 * of bone space and extends in the bone's direction with a length equal to the bone's length.
 */
export class SkeletonCharacter extends AnimatedCharacter
{
    constructor() {
        super();
    }

    public override addGeometryToAnimatedBone(bone: AnimatedBone): void
    {
        // PART 4: Create a skeleton.
        
        // Use a cylinder mesh as a starting point, then apply the correct transformations
        // to the cylinder's localToParentMatrix so that it starts at the origin of bone space 
        // and extends in the bone's direction with a length equal to the bone's length. 
        
        const skeleton = gfx.Geometry3Factory.createCylinder()
        const scale = gfx.Matrix4.makeScale(new gfx.Vector3(0.01, bone.length, 0.01))
        const trans = gfx.Matrix4.makeTranslation(new gfx.Vector3(0, (bone.length/2), 0))
        const rotate = gfx.Matrix4.makeAlign(gfx.Vector3.UP, bone.direction)
        const skeletonMat = gfx.Matrix4.multiplyAll(rotate, trans, scale)
        skeleton.setLocalToParentMatrix(skeletonMat, false)
        bone.add(skeleton)
    }
}
