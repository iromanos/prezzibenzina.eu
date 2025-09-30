"use client";

import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useCallback, useMemo} from "react";

export function useFilters(defaults = {}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Legge i filtri dall’URL, con fallback ai default
    const filters = useMemo(() => {
        const params = {...defaults};
        searchParams.forEach((value, key) => {
            params[key] = value;
        });
        return params;
    }, [searchParams, defaults]);

    // Aggiorna i filtri e sincronizza l’URL
    const setFilters = useCallback(
        (updates) => {
            const params = new URLSearchParams(searchParams.toString());

            Object.entries(updates).forEach(([key, value]) => {
                if (value) {
                    params.set(key, value);
                } else {
                    params.delete(key);
                }
            });

            router.replace(`${pathname}?${params.toString()}`);
        },
        [router, pathname, searchParams]
    );

    return {filters, setFilters};
}
