'use client'
import {useEffect, useState} from "react";

import {BottomSheet, useBottomSheet} from "@plainsheet/react";

export default function Demo() {

    const [isSheetOpen, setIsSheetOpen] = useState(true);
    const bottomSheet = useBottomSheet({
        shouldCloseOnOutsideClick: false,
    });

    useEffect(() => {
        bottomSheet.open();
    }, []);

    useEffect(() => {
        bottomSheet.open();
    }, [bottomSheet.isOpen]);

    return (
        <>

            <div
                className="position-relative w-100 bg-light overflow-hidden"
                style={{touchAction: 'none', height: '100svh'}}
            >
                {/* Mappa di sfondo finta */}
                <div
                    className="position-absolute
                    inset-0 d-flex align-items-center
                    justify-content-center text-muted bg-secondary bg-opacity-25 h-100 w-100">
                    <h5>Mappa</h5>
                </div>
                <BottomSheet


                    {...bottomSheet.props} >
                    &nbsp; Hello from Bottom Sheet 🦭
                </BottomSheet>
            </div>
        </>
    )
}
