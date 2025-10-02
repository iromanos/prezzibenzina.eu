import {useEffect, useState} from 'react';
import {log} from "@/functions/helpers";

export default function useNavBarPresence() {
    const [hasNavBar, setHasNavBar] = useState(false);
    const [navBarHeight, setNavBarHeight] = useState(0);

    useEffect(() => {
        const detectNavBar = () => {
            const screenHeight = window.screen.height;
            const viewportHeight = window.innerHeight;

            const difference = screenHeight - viewportHeight - 88;
            setHasNavBar(difference > 40); // soglia empirica
            setNavBarHeight(difference);
            log("DIFFERENCE: " + difference);
        };

        detectNavBar();
        window.addEventListener('resize', detectNavBar);
        return () => window.removeEventListener('resize', detectNavBar);
    }, []);

    return {hasNavBar, navBarHeight};
}
