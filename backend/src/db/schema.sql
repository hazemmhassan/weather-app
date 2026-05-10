-- Weather App Database Schema
-- Run this file to initialize the database

CREATE DATABASE IF NOT EXISTS weather_app;
USE weather_app;

CREATE TABLE IF NOT EXISTS weather_searches (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  location     VARCHAR(255)  NOT NULL,
  latitude     DECIMAL(10,8) NOT NULL,
  longitude    DECIMAL(11,8) NOT NULL,
  date_from    DATE          NOT NULL,
  date_to      DATE          NOT NULL,
  weather_data JSON,
  created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_location  (location(100)),
  INDEX idx_created   (created_at)
);
