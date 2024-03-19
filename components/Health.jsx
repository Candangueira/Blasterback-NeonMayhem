import { useState } from 'react'
import { useHealthPlayerStore } from './Player'

export function Health() { 
    const playerHealth = useHealthPlayerStore(
        (state) => state.playerHealth
    );
    
return (
    <div className="health">
        <div className="health__bar">
        <h1>{playerHealth}</h1>
        </div>
    </div>
);
}