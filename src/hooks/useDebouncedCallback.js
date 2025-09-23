import {useCallback, useRef} from 'react';

export function useDebouncedCallback(callback, delay = 500) {
    const timeoutRef = useRef();

    return useCallback((...args) => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }, [callback, delay]);
}
