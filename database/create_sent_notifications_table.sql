-- database/create_sent_notifications_table.sql

CREATE TABLE IF NOT EXISTS sent_notifications
(
    id              INT AUTO_INCREMENT PRIMARY KEY,
    subscription_id INT                                                                      NOT NULL,
    user_id         BIGINT UNSIGNED                                                          NOT NULL,
    fuel_type       VARCHAR(50)                                                              NOT NULL,
    geo_level       ENUM ('nazionale', 'regionale', 'provinciale', 'comune', 'distributore') NOT NULL,
    geo_code        VARCHAR(255)                                                             NOT NULL,
    triggered_price DECIMAL(5, 3)                                                            NOT NULL,
    sent_at         DATETIME                          DEFAULT CURRENT_TIMESTAMP,
    status          ENUM ('sent', 'failed', 'opened') DEFAULT 'sent',

    CONSTRAINT fk_sent_notifications_subscription
        FOREIGN KEY (subscription_id)
            REFERENCES price_subscriptions (id)
            ON DELETE CASCADE,

    CONSTRAINT fk_sent_notifications_user
        FOREIGN KEY (user_id)
            REFERENCES users (id)
            ON DELETE CASCADE
);

-- Index for analytics and history lookups
CREATE INDEX idx_sent_notifications_user ON sent_notifications (user_id);
CREATE INDEX idx_sent_notifications_subscription ON sent_notifications (subscription_id);
