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
 * This character should draw 3D axes to represent the X,Y,Z axes of Joint Space for each bone
 * in the animated character.  Use gfx.Geometry3Factory.createAxes(size) create the axes
 * geometry and set the geometry's localToParentMatrix appropriately to display the origin and
 * X,Y,Z direction of *Joint Space* (not Bone Space).  Note: the origin of Bone Space and Joint
 * Space are the same, but the X,Y,Z axes will point in somewhat different directions.
 */
export class JointSpaceAxesCharacter extends AnimatedCharacter
{
    constructor() {
        super();
    }

    public override addGeometryToAnimatedBone(bone: AnimatedBone): void
    {
        // PART 3: Add axes (in joint space) for the character. Refer to the
        // description above, and use the BoneSpaceAxesCharacter as a starting
        // point.
        
        // When this step is done and you enable "Joint Space Axes" from the
        // dropdown for Ballet Character, you should see a skeleton in a
        // "T"-pose, with axes pointing along each joint's axis of rotation. For
        // example, on the left femur (leg bone), the X-axis (red axis) points
        // to the right and slightly upward. See the instructor implementation
        // for more details.

        let size = 0.15;
        if (bone.name === "root") {
            size *= 2;
        }

        const axes = gfx.Geometry3Factory.createAxes(size);
        const axMat = bone.jointSpaceToBoneSpace.clone();
        axes.setLocalToParentMatrix(axMat, false);
        bone.add(axes);
    }
}