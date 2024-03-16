import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import floorTexture from "../src/assets/images/floor-texture.jpg"
import { CuboidCollider, RigidBody } from "@react-three/rapier"


export function Ground() {
    const texture = useTexture(floorTexture);
    // texture WrapS controls how the texture wraps horizontally
    // texture WrapT controls how the texture wraps vertically
    // THREE.RepeatWrapping - if the texture doesn't fully cover the mesh it should repeat itself.
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

    return (
        <RigidBody type="fixed" colliders={false}>
            <mesh receiveShadow position={[0, 0, 0]} rotation-x={-Math.PI / 2}>

                {/* defines the size of the 3D plane */}
                <planeGeometry args={[500, 500]} />

                {/* defines the material of the 3D plane */}
                <meshStandardMaterial color="white" />

                {/* applies texture in the mesh */}
                <meshStandardMaterial map={texture} map-repeat={[25, 25]} />

            </mesh>
            <CuboidCollider args={[500, 2, 500]} position={[0, -2, 0]} />
        </RigidBody>
    )
}