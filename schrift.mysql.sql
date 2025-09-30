-- Script SQL pour MySQL

CREATE TABLE guildes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL
);

CREATE TABLE membres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  actif BOOLEAN DEFAULT TRUE,
  guilde_id INT,
  FOREIGN KEY (guilde_id) REFERENCES guildes(id)
);

CREATE TABLE rotations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  guilde_id INT,
  semaine DATE NOT NULL,
  date_validation DATETIME,
  FOREIGN KEY (guilde_id) REFERENCES guildes(id)
);

CREATE TABLE rotation_membres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rotation_id INT,
  membre_id INT,
  role ENUM('chef', 'sous-chef', 'membre'),
  present BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (rotation_id) REFERENCES rotations(id),
  FOREIGN KEY (membre_id) REFERENCES membres(id)
);

CREATE TABLE scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  membre_id INT,
  rotation_id INT,
  score1 INT,
  score2 INT,
  FOREIGN KEY (membre_id) REFERENCES membres(id),
  FOREIGN KEY (rotation_id) REFERENCES rotations(id)
);

-- Index pour accélérer les recherches
CREATE INDEX idx_scores_membre ON scores(membre_id);
CREATE INDEX idx_scores_rotation ON scores(rotation_id);
CREATE INDEX idx_rotation_membres_rotation ON rotation_membres(rotation_id);
CREATE INDEX idx_rotation_membres_membre ON rotation_membres(membre_id);
