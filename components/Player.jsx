// compatibility library to rapier.
import * as RAPIER from "@dimforge/rapier3d-compat"
import * as TWEEN from "@tweenjs/tween.js"
import { CapsuleCollider, RigidBody, useRapier } from "@react-three/rapier"
import * as THREE from "three"
import { useRef, useState, useEffect } from "react"
import { usePersonControls } from "../src/hooks.js"
import { useFrame } from "@react-three/fiber"
import { useAimingStore, Weapon } from "./Blaster.jsx"
import { Enemies } from "./Enemies.jsx"
import { create } from "zustand"
import { Cubes } from "../components/Cube.jsx"

const raycaster = new THREE.Raycaster();
const MOVE_SPEED = 10;
// const SHOOT_BUTTON = parseInt(import.meta.env.VITE_SHOOT_BUTTON);
// const AIM_BUTTON = parseInt(import.meta.env.VITE_AIM_BUTTON);
const direction = new THREE.Vector3();
const frontVector = new THREE.Vector3();
const sideVector = new THREE.Vector3();
const rotation = new THREE.Vector3();
const cameraDirection = new THREE.Vector3();
const easing = TWEEN.Easing.Quadratic.Out;

export const usePlayerPositionStore = create((set) => ({
    playerTargetPosition: {x:0, y:0, z:0},
    setIsPlayerTargetPosition: (value) => set(() => ({ playerTargetPosition: value }))
}));

export function Player() {
// !!!!!!!!!!!! DELETE THIS !!!!!!!!!!!!!!!!!
    // const playerTargetPosition = usePlayerPositionStore((state) => state.playerTargetPosition);
    // console.log(playerTargetPosition);
// ------------------------------------------------
    // create a link for the player object. This will allow direct interaction with the player object in the scene.
    const playerRef = useRef();

    // create a link for the cube object. This will allow direct interaction with the cube object in the scene.
    const cubeRigidBodyRef = useRef();

    // player position to pass to the enemies.
    const [playerPosition, setPlayerPosition] = useState();
    // destructures the controls on hooks.js, indicating which keys are currently pressed.
    const {forward, backward, left, right, jump} = usePersonControls();

    // create a link for the weapon and the player object.
    const objectHandRef = useRef();
    //
    const setIsPlayerTargetPosition = usePlayerPositionStore((state) => state.setIsPlayerTargetPosition);

    // console.log(setIsPlayerTargetPosition);
    //
    const swayingObjectRef = useRef();
    
// console.log(playerPosition);
// setting up animation states.
// RUNNING
    const [swayingAnimation, setSwayingAnimation] = useState(null);
    const [swayingBackAnimation, setSwayingBackAnimation] = useState(null);
    const [isSwayingAnimationFinished, setIsSwayingAnimationFinished] = useState(true);

// IDLE
    const [idle, setIdle] = useState(new THREE.Vector3(-0.005, 0.005, 0));
    const [idleDuration, setIdleDuration] = useState(1000);
    const [isMoving, setIsMoving] = useState(false);

// AIMING
    // Adding the aimingAnimation and aimingBackAnimation states.
    const [aimingAnimation, setAimingAnimation ] = useState(null);
    const [aimingBackAnimation, setAimingBackAnimation ] = useState(null);
    const isAiming = useAimingStore((state) => state.isAiming);

//  BULLET
const [bulletHit, setBulletHit] = useState(false);
const [shootingRay, setShootingRay] = useState(false);
  
    // provides access to rapier.
    const rapier = useRapier();
    const world = rapier.world;
    // is called each frame, here the player position and linear velocity are updated.
    useFrame((state) => {
        // checks if the player exists. If not, will stop the function execution to avoid errors. 
        if(!playerRef.current) return;
        

        // get the current linear player velocity, to move the player.
        const velocity = playerRef.current.linvel();

        // set the forward/backward motion vector based on the pressed buttons.
        frontVector.set(0, 0, backward - forward);
        

        // set the left/right motion vector based on the pressed buttons.
        sideVector.set(left - right, 0, 0);

        // - calculates the final vector subtracting the movement vectors, normalising the result.(So the vector length is always 1) and multiplying by the movement speed constant.
        // - applyEuler applies the rotation to a vector. In this case the camera rotation is applied to the direction vector. So the player moves in the direction of the rotation of the camera.
        direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(MOVE_SPEED).applyEuler(state.camera.rotation);

        // "Wakes up" the player object to make sure it reacts to changes. If you don't use this method, after some time the object will "sleep" and will not react to position changes.
        playerRef.current.wakeUp();

        // set the player's new linear velocity based on the calculated direction of movement and keep the current vertical velocity (so as not to affect jumps or falls).
        playerRef.current.setLinvel({ x: direction.x, y:velocity.y, z: direction.z});
        // updates the state of the player movement.
        setPlayerPosition(playerRef.current.translation());
        // gets the target position reference to use in enemies( so they can follow it.)
        setIsPlayerTargetPosition(playerRef.current.translation());
    
    // SHOOTING WITH RAYCASTING
        // Get the direction the camera is facing
        cameraDirection.applyEuler(state.camera.rotation);
        state.camera.getWorldDirection(cameraDirection);
        // Set the raycaster to start at the player's position and shoot in the direction the camera is facing
        raycaster.set(playerRef.current.translation(), cameraDirection);

        // Get the first object the raycaster hits
        setShootingRay(world.castRay(new RAPIER.Ray(playerRef.current.translation(), cameraDirection)));
        
        // checks if shootingRay exists, if it's colliding with any object in the scene and if the value of "exposure time" of the ray is equal or lesser than the given value then the variable is set to TRUE.
        const test = shootingRay && shootingRay.collider && Math.abs(shootingRay.toi) <= 100;
        if(test){
            console.log(test);
        } else {console.log(false);}

    // JUMPING
        
        // the raycasting creates a ray in the y axis and checks if the ray is intersecting any object in the scene. Used to detect collision in the next line. 
        const ray = world.castRay(new RAPIER.Ray(playerRef.current.translation(), {x:0, y:-1, z:0}));

        // if the ray was created && the ray is colliding with any object in the scene && the value of "exposure time" of the ray is equal or lesser than the given value(this indicate that the player is clone enough to the floor surface) then the variable is set to TRUE.
        const grounded = ray && ray.collider && Math.abs(ray.toi) <= 1;
        // console.log(grounded);

        if(jump && grounded) doJump();

        const { x, y, z} = playerRef.current.translation();
        state.camera.position.set(x, y, z);

        // moving weapon in the hand of player.
        //rotation
        objectHandRef.current.rotation.copy(state.camera.rotation);
        // position
        objectHandRef.current.position.copy(state.camera.position).add(state.camera.getWorldDirection(rotation));

        setIsMoving(direction.length() > 0);

        // if the direction vector is greater than 0, means that it's swaying animation && swinging animation has finished, execute animation.
        if (swayingAnimation && isSwayingAnimationFinished) {
            setIsSwayingAnimationFinished(false);
            swayingAnimation.start();
        }

        TWEEN.update();
    });

// Shoot function.
        function shootButtonHandler() {
            // make the function check if the shootingRay is true or false.
            // and which object is being hit by the ray.
        }

// sets jump function.
        function doJump() {
        playerRef.current.setLinvel({x: 0, y: 10, z: 0});
        }

// idle animation / running animation ----------------------------------------------------

        function setSwayingAnimationParams() {
            // assures that the running animation is falsy.
            if(!swayingAnimation) return;

            swayingAnimation.stop();
            setIsSwayingAnimationFinished(true);

            // check if the Player is moving and changes the animation state of the Player.
            // if Player is Moving, set animation values.
            if(isMoving) {
                setIdleDuration(() => 300);
                setIdle(() => new THREE.Vector3(-0.005,0,0));
                // console.log("IDLE");

            // if Player is not moving, set animation values.
            } else {
                setIdleDuration(() => 1000);
                setIdle(() => new THREE.Vector3(-0.005, 0, 0));
                // console.log("not moving");
            }

        } 

// Aiming Animation function. ------------------------------------------------------------

        function initAimingAnimation() {
            const currentPosition = swayingObjectRef.current.position;
            const finalPosition = new THREE.Vector3(-0.3, -0.01, 0);
            const standartPosition = new THREE.Vector3(0,0,0);

            const twAimingAnimation = new TWEEN.Tween(currentPosition)
                .to(finalPosition, 150)
                .easing(easing)
               
            // The animation will tween between the initial position of the object and this cloned final position. We have to clone to preserve the state of final position.
            const twAimingBackAnimation = new TWEEN.Tween(finalPosition.clone())
                .to(standartPosition, 0)
                .easing(easing)
                // position serves as a dynamic variable that tracks the current position of the object being animated.
                .onUpdate((position) => {      
                    swayingObjectRef.current.position.copy(position);
                });

            setAimingAnimation(twAimingAnimation);
            setAimingBackAnimation(twAimingBackAnimation);
        }

        
// walking animation function. -----------------------------------------------------------

        function initSwayingObjectAnimation() {
            const currentPosition = new THREE.Vector3(0,0,0);
            const initialPosition = new THREE.Vector3(0,0,0);
            const newPosition = idle;
            const animationDuration = idleDuration;
            const easing = TWEEN.Easing.Quadratic.Out;

            const twSwayingAnimation = new TWEEN.Tween(currentPosition)
                .to(newPosition, animationDuration)
                .easing(easing)
                //updates the swaying object ref to the current position on each update.
                .onUpdate(() => {
                    swayingObjectRef.current.position.copy(currentPosition);
                });
            const twSwayingBackAnimation = new TWEEN.Tween(currentPosition)
                // new position , time duration
                .to(initialPosition, animationDuration)
                .easing(easing)
                //updates the swaying object ref to the current position on each update.
                .onUpdate(() => {
                    swayingObjectRef.current.position.copy(currentPosition);
                })
                .onComplete(() => {
                    setIsSwayingAnimationFinished(true);
                });
            
            // link both animations, when the first one finishes the other one starts.
            twSwayingAnimation.chain(twSwayingBackAnimation);
            
            setSwayingAnimation(twSwayingAnimation);
            setSwayingBackAnimation(twSwayingBackAnimation);
            
        }

// ------------------------------------------------------------------------------------
   

        useEffect(() => {
            if(!isAiming) {
                setSwayingAnimationParams();
            }       
            // dependency array, executes when the state changes.
            }, [isMoving]);

        useEffect(() => {
                initSwayingObjectAnimation();
            // dependency array, executes when the state changes.
            },[idle, idleDuration]);

        useEffect(() => {
                initAimingAnimation();
            // dependency array, executes when the state changes.
            }, [swayingObjectRef] );

        useEffect(() => {
            if(isAiming) {
                swayingAnimation.stop();
                aimingAnimation.start();
                // console.log(isAiming);
            } else if (isAiming === false) {
                // ? is used to make sure that aimingBackAnimation is not null or undefined.
                // HERE IS THE BUG, IF I WAIT FOR THE ANIMATION BACK COMPLETE IT BUGS THE WHOLE ANIMATION.
                aimingBackAnimation?.start()
                // when aimingBackAnimation completes, execute setSwayingAnimationParams()
                    .onComplete(() => {
                        setSwayingAnimationParams();
                    });

            }
        }, [ isAiming, aimingAnimation, aimingBackAnimation ]);

         useEffect(() => {
        // bullet shooting
        document.addEventListener("mousedown", (e) => {
            e.preventDefault();
            shootButtonHandler(shootingRay);
            // console.log(shootingRay)
        });

        document.addEventListener("mouseup", (e) => {
            e.preventDefault();
            shootButtonHandler();
            // console.log("stop!")
        });

    });
   
// ------------------------------------------------------------------------------------

    return (
        <>
        <RigidBody colliders={false} mass={1} ref={playerRef} lockRotations>
            <mesh castShadow>
                {/* args={[ radius, height]} */}
                <capsuleGeometry args={[0.5, 0.5]} />
                <CapsuleCollider args={[0.5, 0.5]} />
            </mesh>
        </RigidBody>
        <group ref={objectHandRef}>
            <group ref={swayingObjectRef}>
                <Weapon position={[0.3, -0.1, 0.3]} scale={0.3}/>
            </group>
        </group>

        
            <RigidBody colliders={false} mass={1} ref={cubeRigidBodyRef}>
                <mesh position={[10, 1, 0]}>
                    <capsuleGeometry args={[5, 5]} />
                    <CapsuleCollider args={[5, 5]} />
                </mesh>
            </RigidBody>
        
        
        </>
    );
}