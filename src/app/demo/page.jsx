'use client'
import React, {useEffect, useState} from "react";

import {BottomSheet, useBottomSheet} from "@plainsheet/react";
import {SheetContent} from "@/components/mappe/MappaClient";

export default function Demo() {

    const [isSheetOpen, setIsSheetOpen] = useState(true);
    const bottomSheet = useBottomSheet({
        shouldCloseOnOutsideClick: false,
        shouldShowBackdrop: false,
        width: '100%',
        containerBorderRadius: '20px',
        defaultPosition: 'closed'
    });

    useEffect(() => {
        bottomSheet.open();
    }, []);

    useEffect(() => {
        if (bottomSheet.isOpen === false) {
            bottomSheet.setIsOpen(true);
            bottomSheet.moveTo(0.4);
        }
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
                    <SheetContent
                        distributori={[]}
                        prezzoMedio={1.255}
                    />
                </BottomSheet>
            </div>
        </>
    )
}
