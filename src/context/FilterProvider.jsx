'use client';

import {createContext, useContext, useState} from 'react';
import useCarburante from '@/hooks/useCarburante';

const FilterContext = createContext(null);

export function FilterProvider({children}) {
    const {carburante, setCarburante} = useCarburante('benzina');
    const [filter, setFilterState] = useState({carburante: 'benzina', limite: 10, brand: null});

    /*
    useEffect(() =>{
    }, [carburante])
    */

    function setFilter({carburante = null, limite = null, brand = null}) {
        if (carburante !== null) {
            setFilterState((prev) => ({
                ...prev,
                carburante: carburante,
            }))
        }
        if (limite !== null) {
            setFilterState((prev) => ({
                ...prev, limite: limite
            }));
        }
        if (brand !== null) {
            if (brand.id === '-') brand = null;
            setFilterState((prev) => ({
                ...prev, brand: brand
            }));
        }
    }

    return (
        <FilterContext.Provider value={{filter, setFilter}}>
            {children}
        </FilterContext.Provider>
    );
}

export function useFilter() {
    return useContext(FilterContext);
}
