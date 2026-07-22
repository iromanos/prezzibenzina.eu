import React, {useState} from 'react';
import StarIcon from "@mui/icons-material/Star";

const ReviewForm = ({impiantoId, userId, onReviewSubmitted}) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleRatingChange = (newRating) => {
        setRating(newRating);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        if (rating === 0) {
            setError('Seleziona un voto da 1 a 5 stelle.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_impianto: impiantoId,
                    user_id: userId, // In un'applicazione reale, user_id verrebbe dal contesto di autenticazione
                    rating,
                    comment,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Errore durante l\'invio della recensione.');
            }

            setSuccess(true);
            setRating(0);
            setComment('');
            if (onReviewSubmitted) {
                onReviewSubmitted(); // Callback per aggiornare la lista delle recensioni o la media
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card mb-4">
            <div className="card-body">
                <h5 className="card-title">Lascia una recensione</h5>
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">Recensione inviata con successo!</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="rating" className="form-label">Il tuo voto:</label>
                        <div>
                            {[1, 2, 3, 4, 5].map((star) => (

                                <StarIcon
                                    style={{cursor: 'pointer'}}
                                    onClick={() => handleRatingChange(star)}
                                    className={`fs-2 ${star <= rating ? 'text-warning' : 'text-secondary'}`}
                                    key={star}/>
                            ))}
                        </div>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="comment" className="form-label">Il tuo commento (opzionale):</label>
                        <textarea
                            className="form-control"
                            id="comment"
                            rows="3"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            maxLength="500"
                        ></textarea>
                        <div className="form-text">{comment.length}/500 caratteri</div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? 'Invio...' : 'Invia recensione'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReviewForm;
