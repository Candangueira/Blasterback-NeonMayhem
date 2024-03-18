import * as THREE from 'three';
import { RigidBody } from '@react-three/rapier';
import spawnSpots from '../src/spawnSpots.json';
import { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { usePlayerPositionStore } from './Player';
// import { update } from "@tweenjs/tween.js"

export function Enemies() {
    const [enemies, setEnemies] = useState([]);
    const [enemyHealth, setEnemyHealth] = useState(100);
    const SPAWN_TIME = 5000;
    let enemyId = 0;
    let enemyArray = [];

    useEffect(() => {
        // adds enemy to the array.
        function addEnemyToArray(newEnemy) {
            setEnemies((prevEnemies) => {
                enemyArray = [...prevEnemies, newEnemy];
                // console.log(enemyArray); // Log the updated state immediately after setting it
                return enemyArray;
            });
        }

        function spawnEnemy() {
            const idSpawnEnemies = setInterval(() => {
            const newEnemyPosition =
                    spawnSpots[getRandomInt(0, spawnSpots.length - 1)];
                console.log(newEnemyPosition);
                // spawning enemies, setting the hooks.
                // set enemies takes the previous state of the enemies and add new ones.
                
                addEnemyToArray(
                    <Enemy key={enemyId} enemyPosition={newEnemyPosition}/>
                );
                enemyId++;
            }, 5000);
            return () => clearInterval(idSpawnEnemies);
        }

        const setIntervalId = setTimeout(spawnEnemy, SPAWN_TIME); // Initial call to spawnEnemy

        return () => clearInterval(setIntervalId); //  ensures that any pending intervals are canceled when the component is unmounted.
    }, []);

    return <>{enemies}</>;
}

// get random function
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// SINGLE ENEMY ---------------------------------------------------------
function Enemy(props) {
    // use the player position store to get the player position.
    const playerTargetPosition = usePlayerPositionStore(
        (state) => state.playerTargetPosition
    );

    const ENEMY_SPEED = 5;
    const enemyRef = useRef();
    const enemyMesh = new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshBasicMaterial({ color: 'red' })
    );
    const targetPoint = new THREE.Vector3(
        playerTargetPosition.x,
        playerTargetPosition.y,
        playerTargetPosition.z
    );

    // move enemy function.
    function moveEnemy() {
        // Calculate direction to target
        const direction = targetPoint
            .clone()
            .sub(enemyRef.current.translation()) // get the enemy position
            .normalize();
        // console.log(targetPoint);

        // get the current linear enemy velocity, to move the enemy.
        const velocityEnemy = enemyRef.current.linvel();

        // Calculate the velocity vector based on the direction and enemy speed
        const velocity = direction.clone().multiplyScalar(ENEMY_SPEED);

        enemyRef.current.wakeUp();

        enemyRef.current.setLinvel({
            x: velocity.x,
            y: velocityEnemy.y,
            z: velocity.z,
        });
        console.log(velocityEnemy);
    }

    //STILL WORKING ON IT.
    function bulletDamage() {
        // if(enemyMesh.intersectObjects(enemyMesh)) {
        //   console.log("collision");
        //   }
    }
    // // Update the mutable reference whenever props.playerPosition changes.

    // useEffect(() => {
    //     const animationId = requestAnimationFrame(moveEnemy);

    //     return () => cancelAnimationFrame(animationId);
    // }, []);

    useFrame(() => {
        moveEnemy();
        bulletDamage();
    });
    // -----------------------------------------------------------


    return (
        <>
        <group position={props.enemyPosition}>
            <RigidBody ref={enemyRef}>
                <primitive object={enemyMesh} />
            </RigidBody>
        </group>
        </>
    );
}