import {useEffect, useState} from 'react';

export default function FavoriteToggle({id}) {
    const [fav, setFav] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('fav-' + id);
        setFav(stored === 'true');
    }, [id]);

    const toggle = () => {
        localStorage.setItem('fav-' + id, (!fav).toString());
        setFav(!fav);
    };

    return (
        <button className="btn btn-sm btn-warning me-2" onClick={toggle}>
            {fav ? '★ Preferito' : '☆ Aggiungi ai preferiti'}
        </button>
    );
}
