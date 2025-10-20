export default function Loader({rightWidth = 0}) {
    return <div

        style={{
            left: `calc( 50% - ${rightWidth / 2}px)`,
        }}

        className="position-absolute top-50 translate-middle text-center z-3 bg-black p-5 rounded-3 bg-opacity-50">
        <div className="spinner-border text-white" role="status">
            <span className="visually-hidden">Caricamento marker...</span>
        </div>
        <div className="mt-2 text-white fw-bold">Caricamento impianti...</div>
    </div>;
}