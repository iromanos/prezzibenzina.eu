-- Migrazione: integra la tabella `users` esistente (schema Laravel) con i campi
-- necessari al Sistema di Notifiche Prezzi (Proposta 1 - Fase 1, punto 1).
--
-- La tabella `users` esiste già in wefuel con le colonne Laravel:
--   id, name, email (UNIQUE), email_verified_at, password, remember_token,
--   created_at, updated_at
--
-- Mappatura rispetto ai campi richiesti dal task:
--   * password_hash  -> colonna esistente `password`
--   * is_verified    -> si riusa `email_verified_at` (NULL = non verificato).
--                       NON si aggiunge un `is_verified` booleano per evitare
--                       due sorgenti di verita' in conflitto.
--
-- Colonne aggiunte (le uniche realmente mancanti):
--   * verification_token       VARCHAR(255) NULL
--   * reset_password_token     VARCHAR(255) NULL
--   * reset_password_expires   DATETIME     NULL
--
-- Idempotente: MySQL 8 non supporta ADD COLUMN IF NOT EXISTS, quindi le
-- modifiche sono racchiuse in una procedura che controlla information_schema.
-- Rieseguibile senza errori.

DELIMITER $$

DROP PROCEDURE IF EXISTS pb_migrate_users_notifiche $$
CREATE PROCEDURE pb_migrate_users_notifiche()
BEGIN
    IF NOT EXISTS (SELECT 1
                   FROM information_schema.COLUMNS
                   WHERE TABLE_SCHEMA = DATABASE()
                     AND TABLE_NAME = 'users'
                     AND COLUMN_NAME = 'verification_token') THEN
        ALTER TABLE users
            ADD COLUMN verification_token VARCHAR(255) NULL AFTER remember_token;
    END IF;

    IF NOT EXISTS (SELECT 1
                   FROM information_schema.COLUMNS
                   WHERE TABLE_SCHEMA = DATABASE()
                     AND TABLE_NAME = 'users'
                     AND COLUMN_NAME = 'reset_password_token') THEN
        ALTER TABLE users
            ADD COLUMN reset_password_token VARCHAR(255) NULL AFTER verification_token;
    END IF;

    IF NOT EXISTS (SELECT 1
                   FROM information_schema.COLUMNS
                   WHERE TABLE_SCHEMA = DATABASE()
                     AND TABLE_NAME = 'users'
                     AND COLUMN_NAME = 'reset_password_expires') THEN
        ALTER TABLE users
            ADD COLUMN reset_password_expires DATETIME NULL AFTER reset_password_token;
    END IF;

    -- Indici a supporto della verifica email e del reset password
    -- (lookup per token durante i flussi /api/auth/verify-email e reset-password).
    IF NOT EXISTS (SELECT 1
                   FROM information_schema.STATISTICS
                   WHERE TABLE_SCHEMA = DATABASE()
                     AND TABLE_NAME = 'users'
                     AND INDEX_NAME = 'idx_users_verification_token') THEN
        CREATE INDEX idx_users_verification_token ON users (verification_token);
    END IF;

    IF NOT EXISTS (SELECT 1
                   FROM information_schema.STATISTICS
                   WHERE TABLE_SCHEMA = DATABASE()
                     AND TABLE_NAME = 'users'
                     AND INDEX_NAME = 'idx_users_reset_password_token') THEN
        CREATE INDEX idx_users_reset_password_token ON users (reset_password_token);
    END IF;
END $$

DELIMITER ;

CALL pb_migrate_users_notifiche();
DROP PROCEDURE pb_migrate_users_notifiche;
