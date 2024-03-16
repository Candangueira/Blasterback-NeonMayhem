import { RigidBody } from "@react-three/rapier";
import cubes from "../src/cubes.json";

export function Cubes() {
    return cubes.map((coords, index) => <Cube key={index} position={coords} />);
}

function Cube(props) {
    return (
            <RigidBody {...props} >
                <mesh castShadow receiveShadow>
                    <meshBasicMaterial color="gray"/>
                    <boxGeometry/>
                </mesh>
            </RigidBody>

     
    )
}