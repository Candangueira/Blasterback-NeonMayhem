import * as THREE from "three";
import { useRef } from "react";
import { RigidBody } from "@react-three/rapier";

export const Bullet = ({ position, velocity, onCollision }) => {
  const bulletRef = useRef();

  const bulletMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 16, 8),
    new THREE.MeshBasicMaterial({ color: "red" })
  );

  return (
    <RigidBody
      name="bullet"
      type="dynamic"
      colliders="ball"
      position={Object.values(position)}
      ref={bulletRef}
      linearVelocity={velocity}
      onContactForce={({ other }) => {
        // console.log(other.rigidBodyObject);
        const collidedWith = other.rigidBodyObject.name;
        if (collidedWith === "floor" || collidedWith === "enemy") {
          // console.log("Bullet collided with", collidedWith);
          return;
        }
        
        onCollision();
      }}
    >
      <primitive object={bulletMesh} />
    </RigidBody>
  );
};
