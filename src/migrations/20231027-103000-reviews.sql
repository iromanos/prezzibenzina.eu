-- Migration for creating 'reviews' table and altering 'impianti' table

-- Create 'reviews' table
CREATE TABLE `reviews`
(
    `id`          BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
    `id_impianto` INT NOT NULL,
    `user_id`     BIGINT UNSIGNED, -- NULLABLE if anonymous reviews are allowed
    `rating`      TINYINT UNSIGNED NOT NULL CHECK (rating >= 1 AND rating <= 5),
    `comment`     TEXT,
    `status`      ENUM ('pending', 'approved', 'rejected', 'reported') DEFAULT 'approved',
    `created_at`  TIMESTAMP                                            DEFAULT CURRENT_TIMESTAMP,
    `updated_at`  TIMESTAMP                                            DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`id_impianto`) REFERENCES `impianti` (`id_impianto`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- Add 'average_rating' and 'total_reviews' columns to 'impianti' table
ALTER TABLE `impianti`
    ADD COLUMN `average_rating` DECIMAL(3, 2) DEFAULT 0.00,
    ADD COLUMN `total_reviews`  INT UNSIGNED  DEFAULT 0;
