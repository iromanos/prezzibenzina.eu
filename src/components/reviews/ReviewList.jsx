import React, {useEffect, useState} from 'react';

const ReviewList = ({impiantoId, currentUserId, onReviewChanged}) => {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editRating, setEditRating] = useState(0);
    const [editComment, setEditComment] = useState('');

    const fetchReviews = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/impianti/${impiantoId}/reviews`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Errore durante il recupero delle recensioni.');
            }
            setReviews(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (impiantoId) {
            fetchReviews();
        }
    }, [impiantoId, onReviewChanged]); // Ricarica le recensioni quando impiantoId cambia o quando una recensione viene modificata/eliminata

    const handleEditClick = (review) => {
        setEditingReviewId(review.id);
        setEditRating(review.rating);
        setEditComment(review.comment);
    };

    const handleCancelEdit = () => {
        setEditingReviewId(null);
        setEditRating(0);
        setEditComment('');
    };

    const handleUpdateReview = async (reviewId) => {
        try {
            const response = await fetch(`/api/reviews/${reviewId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: currentUserId,
                    rating: editRating,
                    comment: editComment,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Errore durante l\'aggiornamento della recensione.');
            }

            setEditingReviewId(null);
            setEditRating(0);
            setEditComment('');
            await fetchReviews(); // Ricarica le recensioni dopo l'aggiornamento
            if (onReviewChanged) onReviewChanged(); // Notifica il genitore per aggiornare la media
        } catch (err) {
            alert(`Errore: ${err.message}`);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Sei sicuro di voler eliminare questa recensione?')) {
            return;
        }
        try {
            const response = await fetch(`/api/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({user_id: currentUserId}),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Errore durante l\'eliminazione della recensione.');
            }

            fetchReviews(); // Ricarica le recensioni dopo l'eliminazione
            if (onReviewChanged) onReviewChanged(); // Notifica il genitore per aggiornare la media
        } catch (err) {
            alert(`Errore: ${err.message}`);
        }
    };

    const handleReportReview = async (reviewId) => {
        if (!window.confirm('Sei sicuro di voler segnalare questa recensione come inappropriata?')) {
            return;
        }
        try {
            const response = await fetch(`/api/reviews/${reviewId}/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({user_id: currentUserId}), // L'ID dell'utente che segnala
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Errore durante la segnalazione della recensione.');
            }
            alert('Recensione segnalata con successo. Verrà esaminata.');
            // Non ricarichiamo le recensioni qui, la recensione segnalata rimane visibile finché non viene moderata
        } catch (err) {
            alert(`Errore: ${err.message}`);
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <i
                    key={i}
                    className={`bi ${i <= rating ? 'bi-star-fill text-warning' : 'bi-star text-secondary'} me-1`}
                    style={editingReviewId ? {cursor: 'pointer'} : {}}
                    onClick={editingReviewId === editingReviewId ? () => setEditRating(i) : undefined}
                ></i>
            );
        }
        return stars;
    };

    if (isLoading) {
        return <div className="text-center my-4">Caricamento recensioni...</div>;
    }

    if (error) {
        return <div className="alert alert-danger my-4">Errore: {error}</div>;
    }

    if (reviews.length === 0) {
        return <div className="alert alert-info my-4">Nessuna recensione disponibile per questo impianto.</div>;
    }

    return (
        <div className="mt-4">
            <h5>Recensioni ({reviews.length})</h5>
            {reviews.map((review) => (
                <div key={review.id} className="card mb-3">
                    <div className="card-body">
                        {editingReviewId === review.id ? (
                            // Edit form
                            <div>
                                <div className="mb-2">
                                    {renderStars(editRating)}
                                </div>
                                <textarea
                                    className="form-control mb-2"
                                    value={editComment}
                                    onChange={(e) => setEditComment(e.target.value)}
                                    rows="3"
                                    maxLength="500"
                                ></textarea>
                                <button className="btn btn-success btn-sm me-2"
                                        onClick={() => handleUpdateReview(review.id)}>Salva
                                </button>
                                <button className="btn btn-secondary btn-sm" onClick={handleCancelEdit}>Annulla</button>
                            </div>
                        ) : (
                            // Display review
                            <>
                                <h6 className="card-subtitle mb-2 text-muted">
                                    {review.user_name || 'Utente Anonimo'} - {new Date(review.created_at).toLocaleDateString()}
                                </h6>
                                <div className="mb-2">
                                    {renderStars(review.rating)}
                                </div>
                                <p className="card-text">{review.comment}</p>
                                {currentUserId === review.user_id && (
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-sm btn-outline-primary"
                                                onClick={() => handleEditClick(review)}>Modifica
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDeleteReview(review.id)}>Elimina
                                        </button>
                                    </div>
                                )}
                                {currentUserId !== review.user_id && (
                                    <button className="btn btn-sm btn-outline-warning"
                                            onClick={() => handleReportReview(review.id)}>Segnala</button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ReviewList;
