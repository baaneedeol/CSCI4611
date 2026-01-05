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
 * This character should draw an Ant or some other interesting custom 3D character by
 * adding geometry to the bones of the character.  We will assume the character's
 * skeleton is a humanoid skeleton in the CMU MoCap database format.  So, you can
 * selectively add geometry to the bone by checking the name of the bone using an
 * "if" statement as demonstrated in the support code.
 */
export class AntCharacter extends AnimatedCharacter
{
    private blackMaterial: gfx.UnlitMaterial;
    private antMaterial: gfx.PhongMaterial;

    constructor() {
        super();

        this.blackMaterial = new gfx.UnlitMaterial();
        this.blackMaterial.setColor(gfx.Color.BLACK);

        this.antMaterial = new gfx.PhongMaterial();
        this.antMaterial.ambientColor.set(0.6, 0.3, 0.4);  
        this.antMaterial.diffuseColor.set(1.0, 0.6, 0.8); 
        this.antMaterial.specularColor.set(1.0, 0.8, 1.0);
        this.antMaterial.shininess = 120;
    }


    public override addGeometryToAnimatedBone(bone: AnimatedBone): void
    {
        // PART 5: Create a character!
        
        // For our ant character, we added special geometries for the following "bones":
        // - lowerback
        // - upperbackback
        // - thorax
        // - head
        // A full list of available bones (and their hierarchical relationships)
        // can be seen in the skeleton files, for example /public/assets/data/05.asf.

        const skeleton = gfx.Geometry3Factory.createCylinder();
        const scaleVec = new gfx.Vector3();
        scaleVec.set(0.01, bone.length, 0.01);
        const scale = gfx.Matrix4.makeScale(scaleVec);

        const transVec = new gfx.Vector3();
        transVec.set(0, bone.length / 2, 0);
        const trans = gfx.Matrix4.makeTranslation(transVec);

        const rotate = gfx.Matrix4.makeAlign(gfx.Vector3.UP, bone.direction);
        const skeletonMat = gfx.Matrix4.multiplyAll(rotate, trans, scale);

        skeleton.setLocalToParentMatrix(skeletonMat, false);
        skeleton.setColors(Array<gfx.Color>(skeleton.vertexCount).fill(gfx.Color.BLACK));
        bone.add(skeleton);

        if (bone.name == 'lowerback') {
            const lowerback = gfx.Geometry3Factory.createSphere(0.11);
            const scaleVec = new Vector3(); 
            scaleVec.set(1.0, 2.2, 1.0);
            const sc = Matrix4.makeScale(scaleVec);

            const transVec = new Vector3(); 
            transVec.set(0, -(bone.length / 4), 0);
            const tr = Matrix4.makeTranslation(transVec);

            const mat = Matrix4.multiplyAll(sc, tr);
            lowerback.setLocalToParentMatrix(mat, false);
            lowerback.setColors(Array<gfx.Color>(lowerback.vertexCount).fill(new gfx.Color(1.0, 0.6, 0.8)));
            lowerback.material = this.antMaterial;
            bone.add(lowerback);
        }
        else if (bone.name == 'upperback') {
            const upperback = gfx.Geometry3Factory.createSphere(0.1);
            upperback.setColors(Array<gfx.Color>(upperback.vertexCount).fill(new gfx.Color(0.8, 0.7, 1.0)));
            upperback.material = this.antMaterial;
            bone.add(upperback);
        }
        else if (bone.name == 'thorax') {
            const thorax = gfx.Geometry3Factory.createSphere(0.1);
            thorax.setColors(Array<gfx.Color>(thorax.vertexCount).fill(new gfx.Color(1.0, 0.2, 0.6)));
            thorax.material = this.antMaterial;
            bone.add(thorax);    
        }
        else if (bone.name == 'head')  {
            const head = gfx.Geometry3Factory.createSphere(0.2);
            const headRot = gfx.Matrix4.makeRotationX(-45 * Math.PI / 180);

            const scaleVec3 = new gfx.Vector3();
            scaleVec3.set(0.5, 1, 0.5);
            const scale3 = gfx.Matrix4.makeScale(scaleVec3);

            const headMat = gfx.Matrix4.multiplyAll(headRot, scale3);
            head.setLocalToParentMatrix(headMat, false);
            head.setColors(Array<gfx.Color>(head.vertexCount).fill(new gfx.Color(1.0, 0.6, 0.8)));
            head.material = this.antMaterial;
            bone.add(head);

            // Eyes
            const eyeColor = new gfx.Color(0.8, 0.7, 1.0);
            const eyeRadius = 0.02;

            const leye = gfx.Geometry3Factory.createSphere(eyeRadius);
            leye.setColors(Array<gfx.Color>(leye.vertexCount).fill(eyeColor));
            const ltransVec = new gfx.Vector3();
            ltransVec.set(-0.05, 0.01, 0.12);
            const ltrans = gfx.Matrix4.makeTranslation(ltransVec);
            leye.setLocalToParentMatrix(ltrans, false);
            bone.add(leye);

            const reye = gfx.Geometry3Factory.createSphere(eyeRadius);
            reye.setColors(Array<gfx.Color>(reye.vertexCount).fill(eyeColor));
            const rtransVec = new gfx.Vector3();
            rtransVec.set(0.05, 0.01, 0.12);
            const rtrans = gfx.Matrix4.makeTranslation(rtransVec);
            reye.setLocalToParentMatrix(rtrans, false);
            bone.add(reye);

            // Nose
            const nose = gfx.Geometry3Factory.createSphere(0.03);
            const ntrans = gfx.Matrix4.makeTranslation(new gfx.Vector3(0, -0.02, 0.16));
            nose.setLocalToParentMatrix(ntrans, false);
            nose.setColors(Array<gfx.Color>(nose.vertexCount).fill(new gfx.Color(1.0, 0.2, 0.6))); 
            nose.material = this.antMaterial;
            bone.add(nose);

            // Ears
            const earColor = new gfx.Color(1.0, 0.2, 0.6); 
            const earRadius = 0.05;

            const leftEar = gfx.Geometry3Factory.createSphere(earRadius);
            const lEarRot = gfx.Matrix4.makeRotationZ(0.01);
            const lEarTrans = gfx.Matrix4.makeTranslation(new gfx.Vector3(-0.12, 0.05, 0.0));
            const leftEarMat = gfx.Matrix4.multiplyAll(lEarTrans, lEarRot);
            leftEar.setLocalToParentMatrix(leftEarMat, false);
            leftEar.setColors(Array<gfx.Color>(leftEar.vertexCount).fill(earColor));
            leftEar.material = this.antMaterial;
            bone.add(leftEar);

            const rightEar = gfx.Geometry3Factory.createSphere(earRadius);
            const rEarRot = gfx.Matrix4.makeRotationZ(-0.01);
            const rEarTrans = gfx.Matrix4.makeTranslation(new gfx.Vector3(0.12, 0.05, 0.0));
            const rightEarMat = gfx.Matrix4.multiplyAll(rEarTrans, rEarRot);
            rightEar.setLocalToParentMatrix(rightEarMat, false);
            rightEar.setColors(Array<gfx.Color>(rightEar.vertexCount).fill(earColor));
            rightEar.material = this.antMaterial;
            bone.add(rightEar);
        }
    }
}
