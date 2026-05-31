import {useEffect, useState} from "react";

export default function useInteraction() {

    const [active, setActive] = useState(false);

    useEffect(() => {
        const events = [
            'scroll', 'mousemove', 'touchstart'
        ];

        const handleInteraction = () => {
            setActive(true);
            events.forEach(event => window.removeEventListener(event, handleInteraction));
        };

        events.forEach(event => window.addEventListener(event, handleInteraction, {passive: true}));

        return () => {
            events.forEach(event => window.removeEventListener(event, handleInteraction));
        };

    }, []);

    return {active, setActive}
}