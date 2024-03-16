import * as THREE from "three"
import * as TWEEN from "@tweenjs/tween.js";
import { useFrame } from "@react-three/fiber"
import { PointerLockControls, Sky } from "@react-three/drei"
import { Ground } from "../components/Ground.jsx"
import { Physics } from "@react-three/rapier"
import { Player } from "../components/Player.jsx"
import { Cubes } from "../components/Cube.jsx"
import { Enemies } from "../components/Enemies.jsx"
// zustand: // needed for state management, especially when different components need to access the same data.
import { create } from "zustand" 


const shadowOffset = 50;

// creates a store,the function passed to create defines the initial state of the store.
export const usePointerLockControlsStore = create(() => ({
  isLock: false,
}));


export default function App() {
  const scene = new THREE.Scene();
  // update the state of all active tweens in every frame.
  useFrame(() => {
    TWEEN.update();
  });

  // function to toggle the state of the pointer lock to true.
  function pointerLockControlsLockHandler() {
    usePointerLockControlsStore.setState({ isLock: true });
    // console.log("lock!")
  }

  // function to toggle the state of the pointer lock to false.
  function pointerLockControlsUnlockHandler() {
    usePointerLockControlsStore.setState({ isLock: false });
    // console.log("unlock!")
  }


  return (
    <>
    {/* camera direction controls */}
     <PointerLockControls onLock={pointerLockControlsLockHandler} onUnlock={pointerLockControlsUnlockHandler}/>

     <Sky sunPosition={[100, 20, 100]} />

     <ambientLight intensity={1.5} />

     <directionalLight castShadow
                       intensity={1.2} 
                      //  increase the quality of the shadow map, avoiding shadow clipping
                       shadow-mapSize={4096}
                       shadow-camera-top={shadowOffset}
                       shadow-camera-bottom={-shadowOffset}
                       shadow-camera-right={-shadowOffset}
                       shadow-camera-left={shadowOffset}
                       position={[100, 100, 0]} />
     
     {/* setup for physics */}
     <Physics gravity={[0, -20, 0]}>

        <Player />

        <Enemies camera={<PointerLockControls/>} scene={scene}/> 

        {/* <Cubes/> */}

        <Ground />

     </Physics>
    
    {/* <group position={[3, 1, -2]}>
      <Blaster />
    </group> */}

     </>
  )
}
