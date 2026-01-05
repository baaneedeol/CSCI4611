/* Assignment 4: So You Think Ants Can Dance
 * Concept and C++ implementaiton by Daniel Keefe and TAs, 2012+
 * GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu> 2022
 * Significant changes by Prof. Dan Keefe, 2023 
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * PUBLIC DISTRIBUTION OF SOURCE CODE OUTSIDE OF CSCI 4611 IS PROHIBITED
 */ 

import * as gfx from 'gophergfx'
import { Vector2, Vector3, Quaternion, Matrix4 } from 'gophergfx';
import { Pose } from "./Pose";
import { AnimatedCharacter } from './AnimatedCharacter';


/**
 * This class is a node in the scene graph that represents a bone that is part of an
 * AnimatedCharacter.  It provides just a little bit of added functionality beyond
 * a standard Node3.  Specifally, it stores some data about the bone, and it includes
 * an applyPose routine that will update the node's localToParent transformation
 * matrix based on the current joint angles for the animation.
 */
export class AnimatedBone extends gfx.Node3
{
    // passed in when the bone is created
    public character: AnimatedCharacter;
    public name: string;
    public boneSpaceToParentBoneSpace: Matrix4;

    // can be accessed from the character's bone data, local copies saved for easy access
    public length: number;
    public direction: Vector3;
    public boneSpaceToJointSpace: Matrix4;
    public jointSpaceToBoneSpace: Matrix4;


    /**
     * The constructor saves some data about the bone in local member variables and calls the
     * character's addGeometryToAnimatedBone() function so subclasses can add some extra
     * geometry as children of this node in the scene graph.
     * 
     * @param character The AnimatedCharacter this bone belongs to.
     * @param boneName The unique name for this bone.
     * @param boneSpaceToParentBoneSpace A matrix that will transform points and vectors defined
     * in this bone's coordinate space to the coordinate space of this bone's parent.
     */
    constructor(character: AnimatedCharacter, boneName: string, boneSpaceToParentBoneSpace: Matrix4)
    {
        super();

        this.character = character;
        this.name = boneName;
        this.boneSpaceToParentBoneSpace = boneSpaceToParentBoneSpace;
        this.length = this.character.boneData.boneLength(boneName);
        this.direction = this.character.boneData.boneDirection(boneName);
        this.boneSpaceToJointSpace = this.character.boneData.boneSpaceToJointSpace(boneName);
        this.jointSpaceToBoneSpace = this.character.boneData.jointSpaceToBoneSpace(boneName);

        // whenever we create a bone, we call the character's addGeometryToAnimatedBone() function so
        // that subclasses of the character can easily customize the character's geometry.
        this.character.addGeometryToAnimatedBone(this);
    }


    /**
     * Makes the character take on a specific pose (e.g., one frame of an animated sequence) by 
     * updating the bone's localToParent matrix and then calling Bone.applyPose() recursively 
     * on all children bones to do the same.
     * 
     * The localToParent matrix is updated to account for two things:
     * 1. The geometry of the character's skeleton (bone lengths and directions). The character's
     *    skeleton does not change as it animates.  So, this part of the matrix will stay the
     *    same regardless of the current Pose.  If ONLY this part of the matrix is applied, then
     *    the character will be in the default "T-pose" the mocap system uses to define the skeleton.
     * 2. The current Pose of the skeleton, which includes a joint angle rotation to apply to each
     *    bone.  Note that the joint rotations need to be applied in Joint Space and the transformation
     *    between each bone's Bone Space and Joint Space is a property of the skeleton.  Those
     *    transformations are already saved as member variables of this class.
     *  
     * @param pose Contains the joint rotation matrices for each bone needed to place the
     * AnimatedCharacter into a single pose (i.e., a single frame of motion capture data).
     */
    applyPose(pose: Pose): void
    {
        // PART 2: Update this bone's localToParentMatrix based on the current pose

        // 2.1: First, try setting the localToParentMatrix to account only for the geometry of
        // the character's skeleton.  This will just be one line of code:
        // this.setLocalToParentMatrix(XXXX, false) where XXXX is the matrix that will transform
        // points and vectors defined in this bone's local space (i.e., Bone Space) to the local
        // space of this bone's parent in the scene graph.

        // this.setLocalToParentMatrix(this.boneSpaceToParentBoneSpace, false);

        // 2.2: You might want to pause after 2.1 and implement your JointSpaceAxesCharacter 
        // and/or your SkeletonCharacter because they will help you tell if the next step works.
        // Now, use the same approach of setting the local to parent matrix, but use a more
        // sophisticated matrix created by multiplying together several matrices.  You need
        // to include the transformation based on the skeleton geometry as before AND the 
        // current rotation of the bone passed in via the current Pose.

        const localToParent = gfx.Matrix4.multiplyAll(
            this.boneSpaceToParentBoneSpace,    
            this.jointSpaceToBoneSpace,        
            pose.getJointRotationMatrix(this.name),     
            this.boneSpaceToJointSpace     
        )

        this.setLocalToParentMatrix(localToParent, false)
        
        // Recursive call to apply the same pose to all child bones
        this.children.forEach((child: gfx.Node3) => {
            if (child instanceof AnimatedBone)
                child.applyPose(pose);
        });
    }
}
