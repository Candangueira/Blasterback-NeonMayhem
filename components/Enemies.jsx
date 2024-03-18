import * as THREE from "three"
import { RigidBody } from "@react-three/rapier"
import spawnSpots from "../src/spawnSpots.json"
import { useState, useEffect, useRef } from 'react'
import { useFrame } from "@react-three/fiber"
import { usePlayerPositionStore } from "./Player"
import { update } from "@tweenjs/tween.js"

export function Enemies() {

  const [enemies, setEnemies] = useState([]);
  const [enemyHealth, setEnemyHealth] = useState(100);
  const SPAWN_TIME = 5000;
  let enemyId = 0; 
  let enemyArray = [];

useEffect(() => {
  
  // adds enemy to the array.
    function addEnemyToArray(newEnemy) {
      setEnemies(prevEnemies => {
    enemyArray = [...prevEnemies, newEnemy];
    console.log(enemyArray); // Log the updated state immediately after setting it
    return enemyArray; 
  });
}

  function spawnEnemy () {
  const idSpawnEnemies = setInterval(() => {
  // spawn enemies in random positions.
  const newEnemyPosition = spawnSpots[getRandomInt(0, spawnSpots.length - 1)];
    
// spawning enemies, setting the hooks.
// set enemies takes the previous state of the enemies and add new ones.
    addEnemyToArray(<Enemy key={enemyId} position={newEnemyPosition} />);
    enemyId++;
    console.log("spawned in " + newEnemyPosition + " with ID: " + enemyId);
    }, SPAWN_TIME);
    return () => clearInterval(idSpawnEnemies);
  };

  const setIntervalId = setTimeout(spawnEnemy, SPAWN_TIME); // Initial call to spawnEnemy
  
  return () => clearInterval(setIntervalId); //  ensures that any pending intervals are canceled when the component is unmounted.
}, []);

  return (
    <>
      {enemies}
    </>
  );
}

// get random function 
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// SINGLE ENEMY ---------------------------------------------------------
function Enemy(props) {
  // use the player position store to get the player position.
    const playerTargetPosition = usePlayerPositionStore((state) => state.playerTargetPosition);

    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3();
    const sideVector = new THREE.Vector3();
    const rotation = new THREE.Vector3();
    const ENEMY_SPEED = 5;
    const enemyRef = useRef();
    const currentEnemyPosition = new THREE.Vector3(0, 0, 0);
    const enemyMesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({ color: "red" }));
    const targetPoint = new THREE.Vector3(playerTargetPosition.x, playerTargetPosition.y, playerTargetPosition.z);


// move enemy function.
function moveEnemy() {
    // console.log(playerTargetPosition);
    // !! CHECK HERE IF THE PLAYER POSITION IS BEING UPDATED. !!
    // console.log(playerPosition);

    // Calculate direction to target
        const direction = targetPoint.clone().sub(enemyMesh.position).normalize(); 
        console.log(targetPoint);

       // get the current linear enemy velocity, to move the enemy.
        const velocityEnemy = enemyRef.current.linvel();

       // Calculate the velocity vector based on the direction and enemy speed
        const velocity = direction.clone().multiplyScalar(ENEMY_SPEED);

        // set the forward/backward motion vector based on the pressed buttons.
        frontVector.set(0, 0, 10);
      
        // set the left/right motion vector based on the pressed buttons.
        sideVector.set(10, 0, 0);

        // - calculates the final vector subtracting the movement vectors, normalising the result.(So the vector length is always 1) and multiplying by the movement speed constant.
        direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(ENEMY_SPEED)

        enemyRef.current.wakeUp();

        enemyRef.current.setLinvel({x: velocity.x, y:velocityEnemy.y, z:velocity.z});       
       
  }
//STILL WORKING ON IT.
  function bulletDamage() {
    // if(enemyMesh.intersectObjects(enemyMesh)) {
    //   console.log("collision");
    //   }
    }
  // // Update the mutable reference whenever props.playerPosition changes.
   

  useEffect(() => {
    const animationId = requestAnimationFrame(moveEnemy);

    return () => cancelAnimationFrame(animationId);
  }, []);

  useFrame(() => {
    moveEnemy();
    bulletDamage();
    
  });
// -----------------------------------------------------------

return (
    <>  
    <RigidBody ref={enemyRef}>
        <primitive object={enemyMesh} position={props.position} />      
    </RigidBody>
    </>
);

}