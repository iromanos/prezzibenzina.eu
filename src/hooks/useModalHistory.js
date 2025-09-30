import {useEffect, useRef} from 'react';

export function useModalHistory(isOpen, onClose) {
    const pushed = useRef(false);

    useEffect(() => {
        if (isOpen) {
            pushed.current = true;
            window.history.pushState(null, '');
        }

        const handlePopState = () => {
            if (pushed.current) {
                onClose();
                pushed.current = false;
            }
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            if (pushed.current) {
                window.history.back();
                pushed.current = false;
            }
        };
    }, [isOpen]);
}
