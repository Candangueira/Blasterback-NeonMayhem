import { useState } from 'react'
import { usePointsPlayerStore } from './Player'

export function Points() { 
    const playerPoints = usePointsPlayerStore(
        (state) => state.playerPoints
    );
    
return (
    <div className="points">
        <h1>{playerPoints}</h1>
    </div>
);
}