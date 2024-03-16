import * as TWEEN from "@tweenjs/tween.js"
import * as THREE from "three"
import { Blaster } from "../src/Blaster.jsx"
import { useState, useRef, useEffect } from "react"
import { useFrame, useLoader } from "@react-three/fiber"
import { usePointerLockControlsStore } from "../src/App.jsx"
import { PointerLockControls } from "@react-three/drei"
// zustand: // needed for state management, especially when different components need to access the same data.
import { create } from "zustand"
import MuzzleFlash from "../src/assets/images/muzzle_flash_pixelated.png"
import shootSound from "../src/assets/sound/shoot_sound5.wav"

const SHOOT_BUTTON = parseInt(import.meta.env.VITE_SHOOT_BUTTON);
const AIM_BUTTON = parseInt(import.meta.env.VITE_AIM_BUTTON);

// stores the aiming state.
export const useAimingStore = create((set) => ({
  isAiming: false,
  // defines an action, takes a value parameter and updates isAiming to this value.
  setIsAiming: (value) => set(() => ({ isAiming: value }))
}));



export function Weapon(props) {
    const muzzleTexture = useLoader(THREE.TextureLoader, MuzzleFlash);

    const recoilAmount = 0.005;
    const recoilDuration = 50;
    const easing = TWEEN.Easing.Quadratic.Out;

    // this hook allows the interaction with the animation, like start(), stop()...
    const [flashAnimation, setFlashAnimation] = useState(null);
    // this hook allows to update the opacity animation as the animation progresses.
    const [flashOpacity, setFlashOpacity] = useState(0);

// set recoil animation hooks.
    const [isShooting, setIsShooting] = useState(false);
    const [recoilAnimation, setRecoilAnimation] = useState(null);
    const [isRecoilAnimationFinished, setIsRecoilBackAnimationFinished] = useState(true);
    const blasterRef = useRef();
    const setIsAiming = useAimingStore((state) => state.setIsAiming);


// defines a recoil ammount.
    function generateRecoilOffset() {
        return new THREE.Vector3(
            recoilAmount,
            recoilAmount,
            recoilAmount,
        )
    }

    function generateNewPositionOfRecoil(currentPosition) {
        const recoilOffset = generateRecoilOffset();
// creates a copy of the current position, adding the recoil offset. So the current position remains unaltered.
        return currentPosition.clone().add(recoilOffset);
    }

// audio function

    function gunShotSound() {
    // creates the async audio HTML Object.
    const audio = new Audio(shootSound);
    // Set the volume level.
    audio.volume = 0.1;
    // play the audio.
    audio.play();

    }

// function start shooting.
    function startShooting() {
        if(!recoilAnimation) return;
        // calls the gunshot sound
        gunShotSound();
        recoilAnimation.start();
        flashAnimation.start();

    }

// recoil animation ------------------------------------------------------------------------------

    function initRecoilAnimation() {
        const currentPosition = new THREE.Vector3(0,0,0);
        const initialPosition = new THREE.Vector3(0,0,0);
        const newPosition = generateNewPositionOfRecoil(currentPosition);

        const twRecoilAnimation = new TWEEN.Tween(currentPosition)
            // new position , time duration
            .to(newPosition, recoilDuration)
            .easing(easing)
            .repeat(1)
            .yoyo(true)
            .onUpdate(() => {
                blasterRef.current.position.copy(currentPosition);
            })
            .onStart(() => {
                setIsRecoilBackAnimationFinished(false);
            })
            .onComplete(() => {
                setIsRecoilBackAnimationFinished(true)
            });

        
        // link both animations, when the first one finishes the other one starts.

        setRecoilAnimation(twRecoilAnimation);
    }
// -----------------------------------------------------------------------------------------------

    function initFlashAnimation() {
        const currentFlashParams = { opacity: 0};
        // current Flash Params will be updated.
        const twFlashAnimation = new TWEEN.Tween(currentFlashParams)
            .to({ opacity: 1 }, recoilDuration)
            .easing(easing)
            // when the value updates its state, sets the opacity to the new value:
            .onUpdate(() => {
                setFlashOpacity(() => currentFlashParams.opacity);
            })

            .onComplete(() => {
                setFlashOpacity(() => 0);
            });

        setFlashAnimation(twFlashAnimation);
        console.log(twFlashAnimation);
    }

// -----------------------------------------------------------------------------------------------
// Shoot / Aim handler function.
    function mouseButtonHandler(button, state) {
        // if isLock is falsy execute.
        if(!usePointerLockControlsStore.getState().isLock) return;

        switch (button) {
            case SHOOT_BUTTON:
                setIsShooting(state);
                break;
            case AIM_BUTTON:
                setIsAiming(state);
                // console.log("aim")
                break;
        }
    }

// -----------------------------------------------------------------------------------------------

    useEffect(() => {
   // changes the state of isShooting hook.
        document.addEventListener("mousedown", (e) => {
            e.preventDefault();
            mouseButtonHandler(e.button, true);
            // console.log("shot!")
        });

        document.addEventListener("mouseup", (e) => {
            e.preventDefault();
            mouseButtonHandler(e.button, false);
            // console.log("stop!")
        });
    });
    // recoil.
    useEffect(() => {
        initRecoilAnimation();
    }, []);
    
    // start shooting.
    useEffect(() => {  
        if(isShooting) {
            startShooting();
        }
    // dependency array, executes when the state changes.
    }, [isShooting]);

    // muzzle flash.
    useEffect(() => {
        initFlashAnimation();
    }, []);
    

    useFrame(() => {
        if(isShooting) {
            startShooting();
            TWEEN.update();
            // console.log(isShooting);
        }
    });

    return (
        <group {...props}>
            <group ref={blasterRef}>
                <mesh position={[0, 0.05, -2]} scale={[1, 1, 0]}>
                    <planeGeometry attach="geometry" args={[1, 1]} />
                    <meshBasicMaterial attach="material" map={muzzleTexture} transparent={true} opacity={flashOpacity} />
                </mesh>
                <Blaster />
            </group>
        </group>
    )
}