import * as THREE from "three"
import { RigidBody } from "@react-three/rapier"
import spawnSpots from "../src/spawnSpots.json"
import { useState, useEffect, useRef } from 'react'
import { useFrame } from "@react-three/fiber"


export function Enemies({ playerPosition }) {

  const [enemies, setEnemies] = useState([]);
  const [enemyHealth, setEnemyHealth] = useState(100);
  const SPAWN_TIME = 5000;
  let enemyId = 0;
  
  console.log(playerPosition);

useEffect(() => {
  function spawnEnemy () {
    const idSpawnEnemies = setInterval(() => {
    // spawn enemies in random positions.
    const newEnemyPosition = spawnSpots[getRandomInt(0, spawnSpots.length - 1)];
    
// spawning enemies, setting the hooks.
    setEnemies(prevEnemies => [...prevEnemies,
          <Enemy key={enemyId} position={newEnemyPosition} playerPosition={ playerPosition}/>
    ]);
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
    const playerPositionRef = useRef(props.playerPosition); // Create a mutable reference
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3();
    const sideVector = new THREE.Vector3();
    const rotation = new THREE.Vector3();
    const ENEMY_SPEED = 5;
    const enemyRef = useRef();
    const currentEnemyPosition = new THREE.Vector3(0, 0, 0);
    const enemyMesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({ color: "red" }));
    const targetPoint = new THREE.Vector3(100, 0, 0);


// move enemy function.
function moveEnemy() {
    // Calculate direction to target
        const direction = targetPoint.clone().sub(enemyMesh.position).normalize(); 

       // get the current linear enemy velocity, to move the enemy.
        const velocityEnemy = enemyRef.current.linvel();

        // set the forward/backward motion vector based on the pressed buttons.
        frontVector.set(0, 0, 10);
        

        // set the left/right motion vector based on the pressed buttons.
        sideVector.set(10, 0, 0);

        // - calculates the final vector subtracting the movement vectors, normalising the result.(So the vector length is always 1) and multiplying by the movement speed constant.
        direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(ENEMY_SPEED)

        enemyRef.current.wakeUp();

        enemyRef.current.setLinvel({x: direction.x, y:velocityEnemy.y, z:direction.z});
        console.log(props);
        
       
  }
//STILL WORKING ON IT.
  function bulletDamage() {
    // if(enemyMesh.intersectObjects(enemyMesh)) {
    //   console.log("collision");
    //   }
    }
  // // Update the mutable reference whenever props.playerPosition changes.
   useEffect(() => {
        playerPositionRef.current = props.playerPosition;
    }, [playerPositionRef]);


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
        <primitive object={enemyMesh} position={props.position} playerPosition={playerPositionRef}/>      
    </RigidBody>
    </>
);

}