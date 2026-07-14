-- src/database/create_price_subscriptions_table.sql

-- Questo script definisce lo schema per la tabella 'price_subscriptions'.
-- Può essere utilizzato per creare la tabella se non esiste,
-- o per guidare le istruzioni ALTER TABLE manuali se la tabella esiste già
-- ma mancano alcune colonne.

CREATE TABLE IF NOT EXISTS price_subscriptions
(
    id               INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT                                                      NOT NULL,
    fuel_type        VARCHAR(50)                                              NOT NULL,
    geo_level        ENUM ('nazionale', 'regionale', 'provinciale', 'comune') NOT NULL,
    geo_code         VARCHAR(255)                                             NOT NULL,
    threshold_type   ENUM ('cheapest_in_area', 'below_price')                 NOT NULL,
    threshold_value  DECIMAL(5, 3)                                            NULL,
    status           ENUM ('active', 'paused', 'deleted') DEFAULT 'active',
    created_at       DATETIME                             DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME                             DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_notified_at DATETIME                                                 NULL,

    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
            REFERENCES users (id)
            ON DELETE CASCADE
);

-- Se la tabella 'price_subscriptions' esiste già ma mancano alcune colonne,
-- puoi utilizzare le seguenti istruzioni ALTER TABLE per aggiungerle.
-- Si prega di decommentare ed eseguire una per una, verificando prima le colonne esistenti.

-- ALTER TABLE price_subscriptions ADD COLUMN user_id INT NOT NULL;
-- ALTER TABLE price_subscriptions ADD COLUMN fuel_type VARCHAR(50) NOT NULL;
-- ALTER TABLE price_subscriptions ADD COLUMN geo_level ENUM('nazionale', 'regionale', 'provinciale', 'comune') NOT NULL;
-- ALTER TABLE price_subscriptions ADD COLUMN geo_code VARCHAR(255) NOT NULL;
-- ALTER TABLE price_subscriptions ADD COLUMN threshold_type ENUM('cheapest_in_area', 'below_price') NOT NULL;
-- ALTER TABLE price_subscriptions ADD COLUMN threshold_value DECIMAL(5,3) NULL;
-- ALTER TABLE price_subscriptions ADD COLUMN status ENUM('active', 'paused', 'deleted') DEFAULT 'active';
-- ALTER TABLE price_subscriptions ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;
-- ALTER TABLE price_subscriptions ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
-- ALTER TABLE price_subscriptions ADD COLUMN last_notified_at DATETIME NULL;

-- Aggiungi la chiave esterna se non esiste
-- ALTER TABLE price_subscriptions ADD CONSTRAINT fk_user
--     FOREIGN KEY (user_id)
--     REFERENCES users(id)
--     ON DELETE CASCADE;
