import { useEffect, useState } from 'react';

export function usePersonControls() {
    const keys = {
        KeyW: 'forward',
        KeyS: 'backward',
        KeyA: 'left',
        KeyD: 'right',
        Space: 'jump',
    };

    const [movement, setMovement] = useState({
        forward: false,
        backward: false,
        left: false,
        right: false,
        jump: false,
    });
    // returns the key that has been inputted
    function moveFieldByKey(key) {
        return keys[key];
    }

    // sets the hook, spreading it and updating only the keys pressed to TRUE.
    const setMovementStatus = (code, status) => {
        setMovement((moves) => ({ ...moves, [code]: status }));
    };

    useEffect(() => {
        // sets the key pressed to true
        function handleKeyDown(event) {
            setMovementStatus(moveFieldByKey(event.code), true);
        }

        // sets the key relesead to false
        function handleKeyUp(event) {
            setMovementStatus(moveFieldByKey(event.code), false);
        }

        // gets the key pressed status to true when key is down
        document.addEventListener('keydown', handleKeyDown);

        // gets the key released status to false when key is up
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    return movement;
}
