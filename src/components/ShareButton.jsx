export default function ShareButton({impianto}) {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: impianto.nome_impianto,
                text: `Prezzo: ${impianto.prezzo.toFixed(3)} €/L`,
                url: window.location.href,
            });
        } else {
            alert('Condivisione non supportata su questo dispositivo.');
        }
    };

    return (
        <button className="btn btn-sm btn-outline-dark" onClick={handleShare}>
            Condividi
        </button>
    );
}
