-- src/database/create_auth_support_tables.sql

-- Script per creare le tabelle di supporto richieste da NextAuth.js
-- da eseguire DOPO aver verificato che la tabella 'users' esista già.

CREATE TABLE IF NOT EXISTS accounts
(
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    user_id             BIGINT UNSIGNED NOT NULL, -- Modificato per corrispondere al tipo di users.id
    type                VARCHAR(255)    NOT NULL,
    provider            VARCHAR(255)    NOT NULL,
    provider_account_id VARCHAR(255)    NOT NULL,
    refresh_token       TEXT,
    access_token        TEXT,
    expires_at          INT,
    token_type          VARCHAR(255),
    scope               VARCHAR(255),
    id_token            TEXT,
    session_state       VARCHAR(255),
    CONSTRAINT fk_accounts_user
        FOREIGN KEY (user_id)
            REFERENCES users (id)
            ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions
(
    id            INT AUTO_INCREMENT PRIMARY KEY,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    user_id       BIGINT UNSIGNED     NOT NULL, -- Modificato per corrispondere al tipo di users.id
    expires       DATETIME            NOT NULL,
    CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id)
            REFERENCES users (id)
            ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verification_tokens
(
    identifier VARCHAR(255)        NOT NULL,
    token      VARCHAR(255) UNIQUE NOT NULL,
    expires    DATETIME            NOT NULL,
    PRIMARY KEY (identifier, token)
);
