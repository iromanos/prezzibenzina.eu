'use client'
import {useState} from "react";
import BottomSheet from "../../components/BottomSheet";

export default function Demo() {

    const [isSheetOpen, setIsSheetOpen] = useState(true);

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
                <BottomSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)}/>
            </div>
        </>
    )
}
