'use client';

import React, {useEffect, useRef, useState} from 'react';

const FacebookPagePlugin = ({
                                href = "https://www.facebook.com/prezzibenzina.eu",
                            }) => {

    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(340);

    useEffect(() => {
        if (!containerRef.current) return;

        // Monitora la larghezza effettiva del div genitore
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const newWidth = Math.floor(entry.contentRect.width);
                // Facebook accetta larghezze tra 180px e 500px
                if (newWidth >= 180 && newWidth <= 500) {
                    setContainerWidth(newWidth);
                } else if (newWidth > 500) {
                    setContainerWidth(500);
                }
            }
        });

        resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
    }, []);

    // Ogni volta che la larghezza calcolata cambia, forza il re-render di Facebook
    useEffect(() => {
        if (typeof window !== 'undefined' && window.FB?.XFBML?.parse) {
            window.FB.XFBML.parse(containerRef.current);
        }
    }, [containerWidth, href]);

    return (
        <>
            <div
                ref={containerRef}
                className="fb-page mb-4"
                data-href={href}
                data-width={containerWidth}
                data-adapt-container-width="true"
                data-hide-cover="false"
                data-show-facepile="false"></div>
        </>
    );
};

export default FacebookPagePlugin;
