CREATE TABLE `users` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `oauth_id` VARCHAR(255) NULL,
  `password_hash` VARCHAR(255) NULL,
  `display_name` VARCHAR(255) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,

  UNIQUE INDEX `users_email_key`(`email`),
  UNIQUE INDEX `users_oauth_id_key`(`oauth_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `files` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `user_id` INTEGER NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `file_size` BIGINT NOT NULL,
  `file_type` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,

  INDEX `files_user_id_created_at_idx`(`user_id`, `created_at`),
  INDEX `files_user_id_file_type_idx`(`user_id`, `file_type`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `tags` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,

  UNIQUE INDEX `tags_name_key`(`name`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `file_tags` (
  `file_id` INTEGER NOT NULL,
  `tag_id` INTEGER NOT NULL,

  INDEX `file_tags_tag_id_idx`(`tag_id`),
  PRIMARY KEY (`file_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `sessions` (
  `sid` VARCHAR(191) NOT NULL,
  `data` JSON NOT NULL,
  `expires_at` DATETIME(3) NOT NULL,

  INDEX `sessions_expires_at_idx`(`expires_at`),
  PRIMARY KEY (`sid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `files`
  ADD CONSTRAINT `files_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `file_tags`
  ADD CONSTRAINT `file_tags_file_id_fkey`
  FOREIGN KEY (`file_id`) REFERENCES `files`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `file_tags`
  ADD CONSTRAINT `file_tags_tag_id_fkey`
  FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
