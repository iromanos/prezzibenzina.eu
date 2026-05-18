'use client';

import {createContext, useContext} from 'react';
import usePreferiti from "@/hooks/usePreferiti";

const PreferitiContext = createContext();


export function PreferitiProvider({children}) {

    // Richiamiamo l'hook qui dentro!
    const preferitiData = usePreferiti();

    return (
        // Passiamo tutto l'oggetto dell'hook come valore globale
        <PreferitiContext.Provider value={preferitiData}>
            {children}
        </PreferitiContext.Provider>
    );

}


export function usePreferitiGlobal() {
    return useContext(PreferitiContext);
}