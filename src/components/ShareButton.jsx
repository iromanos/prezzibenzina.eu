import Button from "react-bootstrap/Button";
import ShareIcon from '@mui/icons-material/Share';

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
        <Button variant={'light'} size={'sm'} onClick={handleShare}>
            <ShareIcon/> Condividi
        </Button>
    );
}
