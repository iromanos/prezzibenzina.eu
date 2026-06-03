import {GoogleMapsBottomSheet} from "../../components/GoogleMapsBottomSheet";

export default async function Demo() {
    return (
        <>

            <div
                className="position-relative w-100 vh-100 bg-light overflow-hidden"
                style={{touchAction: 'none'}}
            >
                {/* Mappa di sfondo finta */}
                <div
                    className="position-absolute inset-0 d-flex align-items-center justify-content-center text-muted bg-secondary bg-opacity-25 h-100 w-100">
                    <h5>[Mappa di Background Google Maps]</h5>
                </div>

                <GoogleMapsBottomSheet/>
            </div>
        </>
    )
}
