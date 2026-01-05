/* Assignment 2: Hole in the Ground
 * CSCI 4611, University of Minnesota
 * Assignment developed by Evan Suma Rosenberg
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * PUBLIC DISTRIBUTION OF SOURCE CODE OUTSIDE OF CSCI 4611 IS PROHIBITED
 */ 


import * as gfx from 'gophergfx'
import { Vector2, Vector3 } from 'gophergfx';
import { RigidBody } from './RigidBody';

export class App extends gfx.GfxApp
{
    // State variable to store the current stage of the game
    private stage: number;

    // Current hole radius
    private holeRadius: number;

    // Mesh of a ground plane with a hole in it
    private hole: gfx.Mesh3;

    // Template mesh to create sphere instances
    private sphere: gfx.Mesh3;

    // The 3D play area is defined by a size in the x, y, and z dimensions, AND
    // a center point.  (The play area is not centered exactly at the origin.)
    private playAreaSize: Vector3;
    private playAreaCenterPt: Vector3;

    // Group that will hold all the rigid bodies currently in the scene
    private rigidBodies: gfx.Node3;  

    // A plane mesh that will be used to display dynamic text
    private textPlane: gfx.Mesh3;

    // A dynamic texture that will be displayed on the plane mesh
    private text: gfx.Text;

    // A sound effect to play when an object falls inside the hole
    private holeSound: HTMLAudioElement;

    // A sound effect to play when the user wins the game
    private winSound: HTMLAudioElement;

    // Vector used to store user input from keyboard or mouse
    private inputVector: Vector2;


    // --- Create the App class ---
    constructor()
    {
        // initialize the base class gfx.GfxApp
        super();

        this.stage = 0;

        this.holeRadius = 1;
        this.hole = gfx.MeshLoader.loadOBJ('./assets/hole.obj');
        this.sphere = gfx.Geometry3Factory.createSphere(1, 2);

        this.playAreaSize = new Vector3();
        this.playAreaCenterPt = new Vector3();
        this.rigidBodies = new gfx.Node3();
        
        this.textPlane = gfx.Geometry3Factory.createPlane();
        this.text = new gfx.Text('Click mouse to start', 512, 256, '48px Helvetica');
        this.holeSound = new Audio('./assets/hole.mp3');
        this.winSound = new Audio('./assets/win.mp3');

        this.inputVector = new Vector2();
    }


    // --- Initialize the graphics scene ---
    createScene(): void 
    {
        // Setup the camera projection matrix, position, and look direction.
        // We will learn more about camera models later in this course.
        this.camera.setPerspectiveCamera(60, 1920/1080, 0.001, 50)
        this.camera.position.set(0, 12, 12);
        this.camera.lookAt(Vector3.ZERO);

        // Create an ambient light that illuminates everything in the scene
        const ambientLight = new gfx.AmbientLight(new gfx.Color(0.3, 0.3, 0.3));
        this.scene.add(ambientLight);

        // Create a directional light that is infinitely far away (sunlight)
        const directionalLight = new gfx.DirectionalLight(new gfx.Color(0.6, 0.6, 0.6));
        directionalLight.position.set(0, 2, 1);
        this.scene.add(directionalLight);

        // Set the hole mesh material color to green
        this.hole.material.setColor(new gfx.Color(83/255, 209/255, 110/255));
        this.hole.position.y = -0.1;

        // Define the play area
        this.playAreaSize.set(20, 30, 26);
        this.playAreaCenterPt.set(0, 15, -3);

        // Position the text plane mesh on the ground
        this.textPlane.position.set(0, 0.5, 4.5);
        this.textPlane.scale.set(16, 8, 1);
        this.textPlane.rotation.setEulerAngles(-Math.PI/2, 0, Math.PI);

        // Set up the dynamic texture for the text plane
        const textMaterial = new gfx.UnlitMaterial();
        textMaterial.texture = this.text;
        this.textPlane.material = textMaterial;

        // Draw lines for the play area
        const halfSize = Vector3.multiplyScalar(this.playAreaSize, 0.5);
        const min = Vector3.subtract(this.playAreaCenterPt, halfSize);
        const max = Vector3.add(this.playAreaCenterPt, halfSize);
        const playBounds = new gfx.Line3();
        const boundsBox = new gfx.BoundingBox3();
        boundsBox.min = min;
        boundsBox.max = max;
        playBounds.createFromBox(boundsBox);
        playBounds.color.set(1, 1, 1);
        this.scene.add(playBounds);

        // Add the objects to the scene
        this.scene.add(this.hole);
        this.scene.add(this.textPlane);
        this.scene.add(this.rigidBodies);
    }

    
    // --- Update is called once each frame by the main graphics loop ---
    update(deltaTime: number): void 
    {
        // This code defines the gravity and friction parameters used in the
        // instructor's example implementation. You should not change them
        // for the initial scene because the spheres are placed purposefully
        // to allow you and the TAs to visually check that the physics code
        // is working correctly.  However, you can optionally define different
        // parameters for use in the custom scene that you create in Part 5.

        // The movement speed of the hole in meters / sec
        const holeSpeed = 10;

        // The friction constant will cause physics objects to slow down upon collision
        const frictionSlowDown = 0.9;

        // Hole radius scale factor
        const holeScaleFactor = 1.25;

        // Move hole based on the user input
        this.hole.position.x += this.inputVector.x * holeSpeed * deltaTime;
        this.hole.position.z -= this.inputVector.y * holeSpeed * deltaTime;

        // PART 1: HOLE MOVEMENT
        // This would be a good place to add boundary checks to prevent the
        // hole from leaving the play area.

        // compute half the play area, and the min and max bounds
        const half = Vector3.multiplyScalar(this.playAreaSize, 0.5);
        const min = Vector3.subtract(this.playAreaCenterPt, half);
        const max = Vector3.add(this.playAreaCenterPt, half);

        // restrict x and y positions and ensure that the hole doesn't disappear when going towards boundaries 
        this.hole.position.x = Math.max(min.x + this.holeRadius, Math.min(max.x - this.holeRadius, this.hole.position.x));
        this.hole.position.z = Math.max(min.z + this.holeRadius, Math.min(max.z - this.holeRadius, this.hole.position.z));

        // Update rigid body physics
        // You do not need to modify this code
        this.rigidBodies.children.forEach((transform: gfx.Node3) => {
            const rb = transform as RigidBody;
            rb.update(deltaTime);
        });

        // Handle object-object collisions
        // You do not need to modify this code
        for(let i=0; i < this.rigidBodies.children.length; i++)
        {
            for(let j=i+1; j < this.rigidBodies.children.length; j++)
            {
                const rb1 = this.rigidBodies.children[i] as RigidBody;
                const rb2 = this.rigidBodies.children[j] as RigidBody;

                this.handleObjectCollision(rb1, rb2, frictionSlowDown)
            }
        }

        // Handle object-environment collisions
        // You do not need to modify this code
        this.rigidBodies.children.forEach((transform: gfx.Node3) => {
            const rb = transform as RigidBody;

            // The object has fallen far enough to score a point
            if(rb.position.y < -10)
            {
                this.holeSound.play(); 

                // Remove the object from the scene
                rb.remove();

                //Check if we captured the last sphere
                if(this.rigidBodies.children.length == 0)
                    this.startNextStage();
                else
                    this.setHoleRadius(this.holeRadius * holeScaleFactor);
            }
            // The object is within range of the hole and can fit inside
            else if(rb.getRadius() < this.holeRadius && rb.position.distanceTo(this.hole.position) < this.holeRadius)
            {
                this.handleRimCollision(rb, frictionSlowDown);
            }
            // The object has not fallen all the way into the hole yet
            else if(rb.position.y + rb.getRadius() > 0)
            {
                this.handleBoundaryCollision(rb, frictionSlowDown);
            }
            
        });
    }

    
    handleBoundaryCollision(rb: RigidBody, frictionSlowDown: number): void
    {
        // PART 3: BOUNDARY COLLISIONS  
        
        // compute half the play area, and the min and max bounds
        const half = Vector3.multiplyScalar(this.playAreaSize, 0.5);
        const min = Vector3.subtract(this.playAreaCenterPt, half);
        const max = Vector3.add(this.playAreaCenterPt, half);

        // x-axis
        if (rb.position.x - rb.getRadius() < min.x) {
            rb.position.x = min.x + rb.getRadius();        
            rb.velocity.x = -rb.velocity.x * frictionSlowDown; 
        } 
        else if (rb.position.x + rb.getRadius() > max.x) {
            rb.position.x = max.x - rb.getRadius();
            rb.velocity.x = -rb.velocity.x * frictionSlowDown;
        }

        // y-axis
        if (rb.position.y - rb.getRadius() < min.y) {
            rb.position.y = min.y + rb.getRadius();
            rb.velocity.y = -rb.velocity.y * frictionSlowDown;
        } 
        else if (rb.position.y + rb.getRadius() > max.y) {
            rb.position.y = max.y - rb.getRadius();
            rb.velocity.y = -rb.velocity.y * frictionSlowDown;
        }

        // z-axis
        if (rb.position.z - rb.getRadius() < min.z) {
            rb.position.z = min.z + rb.getRadius();
            rb.velocity.z = -rb.velocity.z * frictionSlowDown;
        } 
        else if (rb.position.z + rb.getRadius() > max.z) {
            rb.position.z = max.z - rb.getRadius();
            rb.velocity.z = -rb.velocity.z * frictionSlowDown;
        }
    }


    handleObjectCollision(rb1: RigidBody, rb2: RigidBody, frictionSlowDown: number): void
    {
        // PART 4: RIGID BODY COLLISIONS

        // delta vector from rb1 to rb2
        const delta = Vector3.subtract(rb2.position, rb1.position);
        const distance = delta.length();
        const radii = rb1.getRadius() + rb2.getRadius();

        // if spheres intersect execute collision 
        if (distance < radii) 
        {
            // overlap and normalize to get collision 
            const overlap = radii - distance;
            const normal = new Vector3(delta.x / distance, delta.y / distance, delta.z / distance);

            const correction = new Vector3(normal.x * overlap * 0.5, normal.y * overlap * 0.5, normal.z * overlap * 0.5);
            rb1.position.subtract(correction);
            rb2.position.add(correction);

            // relative velocities 
            const relativeVelocity = new Vector3(rb1.velocity.x - rb2.velocity.x, rb1.velocity.y - rb2.velocity.y, rb1.velocity.z - rb2.velocity.z);
            const velocityAlongNormal = relativeVelocity.x * normal.x + relativeVelocity.y * normal.y + relativeVelocity.z * normal.z;

            // if moving towards each other apply collision
            if (velocityAlongNormal < 0) 
            {
                // compute and apply bounce
                const bounce = new Vector3(normal.x * velocityAlongNormal, normal.y * velocityAlongNormal, normal.z * velocityAlongNormal);
                rb1.velocity.subtract(bounce);
                rb2.velocity.add(bounce);

                // apply friction
                rb1.velocity.multiplyScalar(frictionSlowDown);
                rb2.velocity.multiplyScalar(frictionSlowDown);
            }
        }
    }


    // This method handles collisions between the rigid body and the rim
    // of the hole. You do not need to modify this code.
    handleRimCollision(rb: RigidBody, frictionSlowDown: number): void
    {
        // Compute the rigid body's position, ignoring any vertical displacement
        const rbOnGround = new Vector3(rb.position.x, 0, rb.position.z);

        // Find the closest point along the rim of the hole
        const rimPoint = Vector3.subtract(rbOnGround, this.hole.position);
        rimPoint.normalize();
        rimPoint.multiplyScalar(this.holeRadius);
        rimPoint.add(this.hole.position.clone());

        // If the rigid body is colliding with the point on the rim
        if(rb.position.distanceTo(rimPoint) < rb.getRadius())
        {
            // Correct the position of the rigid body so that it is no longer intersecting
            const correctionDistance = rb.getRadius() - rb.position.distanceTo(rimPoint) ;
            const correctionMovement = Vector3.subtract(rb.position, rimPoint);
            correctionMovement.normalize();
            correctionMovement.multiplyScalar(correctionDistance);
            rb.position.add(correctionMovement);

            // Compute the collision normal
            const rimNormal = Vector3.subtract(this.hole.position, rimPoint);
            rimNormal.normalize();

            // Reflect the velocity about the collision normal
            rb.velocity.reflect(rimNormal);

            // Slow down the velocity due to friction
            rb.velocity.multiplyScalar(frictionSlowDown);
        }
    }


    // This method advances to the next stage of the game
    startNextStage(): void
    {
        this.stage++;

        // Create a test scene when the user presses start
        if(this.stage == 1)
        {
            // Do not modify the spheres in this initial test scene.
            // They are used to visually check that the physics code
            // is working correctly during grading.
            
            this.textPlane.visible = false;
            
            const rb1 = new RigidBody(this.sphere);
            rb1.material = new gfx.GouraudMaterial();
            rb1.material.setColor(gfx.Color.RED);
            rb1.position.set(0, 0.25, 7.5);
            rb1.setRadius(0.25);
            rb1.velocity.set(0, 10, -4);
            this.rigidBodies.add(rb1);
    
            const rb2 = new RigidBody(this.sphere);
            rb2.material = new gfx.GouraudMaterial();
            rb2.material.setColor(gfx.Color.GREEN);
            rb2.position.set(-8, 1, -5);
            rb2.setRadius(0.5);
            rb2.velocity.set(4, 0, 0);
            this.rigidBodies.add(rb2);
    
            const rb3 = new RigidBody(this.sphere);
            rb3.material = new gfx.GouraudMaterial();
            rb3.material.setColor(gfx.Color.BLUE);
            rb3.position.set(8, 1, -4.5);
            rb3.setRadius(0.5);
            rb3.velocity.set(-9, 0, 0);
            this.rigidBodies.add(rb3);
    
            const rb4 = new RigidBody(this.sphere);
            rb4.material = new gfx.GouraudMaterial();
            rb4.material.setColor(gfx.Color.YELLOW);
            rb4.position.set(0, 0.25, -12);
            rb4.setRadius(0.5);
            rb4.velocity.set(15, 10, -20);
            this.rigidBodies.add(rb4);
        }
        // The user has finished the test scene
        else if(this.stage == 2)
        {
            this.setHoleRadius(0.5);
            
            // PART 5: CREATE YOUR OWN GAME
            // COMMENT OUT THIS CODE
            // this.text.text = 'Create your own game!';
            // this.text.updateTextureImage();
            // this.textPlane.visible = true;

            // ADD YOUR CODE HERE

            // iterate thru number of ball : 12
            for (let i = 0; i < 12; i++)
            {   
                const rb = new RigidBody(this.sphere);
                rb.material = new gfx.GouraudMaterial();

                // set random color
                rb.material.setColor(new gfx.Color(Math.random(), Math.random(), Math.random()));

                // set random inital position 
                rb.position.set(
                    this.playAreaCenterPt.x + (Math.random() - 0.5) * this.playAreaSize.x,
                    0.5 + Math.random() * 2,  
                    this.playAreaCenterPt.z + (Math.random() - 0.5) * this.playAreaSize.z
                );

                // randomize radius between min and max
                const minRadius = 0.2;
                const maxRadius = 1.0;
                const radius = minRadius + Math.random() * (maxRadius - minRadius);
                rb.setRadius(radius);

                // set random initial velocity
                rb.velocity.set((Math.random() - 0.5) * 12, Math.random() * 6, (Math.random() - 0.5) * 12);

                this.rigidBodies.add(rb);
            }

        }
        // The user has finished the game
        else
        {
            this.text.text = 'YOU WIN!';
            this.text.updateTextureImage();
            this.textPlane.visible = true;
            this.winSound.play();
        }
    }


    // Set the radius of the hole and update the scale of the
    // hole mesh so that it is displayed at the correct size.
    setHoleRadius(radius: number): void
    {
        this.holeRadius = radius;
        this.hole.scale.set(radius, 1, radius);
    }


    // Set the x or y components of the input vector when either
    // the WASD or arrow keys are pressed.
    onKeyDown(event: KeyboardEvent): void 
    {
        if(event.key == 'w' || event.key == 'ArrowUp')
            this.inputVector.y = 1;
        else if(event.key == 's' || event.key == 'ArrowDown')
            this.inputVector.y = -1;
        else if(event.key == 'a' || event.key == 'ArrowLeft')
            this.inputVector.x = -1;
        else if(event.key == 'd' || event.key == 'ArrowRight')
            this.inputVector.x = 1;
    }


    // Reset the x or y components of the input vector when either
    // the WASD or arrow keys are released.
    onKeyUp(event: KeyboardEvent): void 
    {
        if((event.key == 'w' || event.key == 'ArrowUp') && this.inputVector.y == 1)
            this.inputVector.y = 0;
        else if((event.key == 's' || event.key == 'ArrowDown') && this.inputVector.y == -1)
            this.inputVector.y = 0;
        else if((event.key == 'a' || event.key == 'ArrowLeft')  && this.inputVector.x == -1)
            this.inputVector.x = 0;
        else if((event.key == 'd' || event.key == 'ArrowRight')  && this.inputVector.x == 1)
            this.inputVector.x = 0;
    }


    // These mouse events are not necessary to play the game on a computer. However, they
    // are included so that the game is playable on touch screen devices without a keyboard.
    onMouseMove(event: MouseEvent): void 
    {
        // Only update the mouse position if only the left button is currently pressed down
        if(event.buttons == 1)
        {
            const mouseCoordinates = this.getNormalizedDeviceCoordinates(event.x, event.y);

            if(mouseCoordinates.x < -0.5)
                this.inputVector.x = -1;
            else if(mouseCoordinates.x > 0.5)
                this.inputVector.x = 1;

            if(mouseCoordinates.y < -0.5)
                this.inputVector.y = -1;
            else if(mouseCoordinates.y > 0.5)
                this.inputVector.y = 1;
        }
    }


    onMouseUp(event: MouseEvent): void
    {
        // Left mouse button
        if(event.button == 0)
            this.inputVector.set(0, 0);
    }


    onMouseDown(event: MouseEvent): void 
    {
        if(this.stage==0)
            this.startNextStage();
        else
            this.onMouseMove(event);
    }
}