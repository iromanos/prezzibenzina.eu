import React from 'react';
import StarIcon from "@mui/icons-material/Star";
// Importa il tuo componente StarIcon (adatta il percorso se necessario)
// import { StarIcon } from '@/components/icons/StarIcon'; 

const RatingDisplay = ({averageRating, totalReviews, userId}) => {
    // Funzione per generare le stelle
    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => {
            const starValue = i + 1;
            let type = 'empty';

            if (rating >= starValue) {
                type = 'full';
            } else if (rating > i) {
                type = 'half';
            }

            return (
                <StarIcon
                    key={i}
                    type={type}
                    className={type === 'empty' ? "text-secondary" : "text-warning"}
                />
            );
        });
    };

    if (totalReviews === 0) {
        return (
            <div className="d-flex align-items-center gap-2">
                <span className="text-muted">Nessuna recensione</span>
            </div>
        );
    }

    return (
        <div className="d-flex align-items-center gap-2" aria-label={`Valutazione: ${averageRating} su 5 stelle`}>
            <div className="d-flex" aria-hidden="true">
                {renderStars(averageRating)}
            </div>
            {/*<span className="fw-bold">{averageRating ? averageRating.toFixed(1) : 'N/A'}</span>*/}
            <span className="text-muted">({totalReviews})</span>
        </div>
    );
};

export default RatingDisplay;
