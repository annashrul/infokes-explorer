CREATE TABLE IF NOT EXISTS folders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  parent_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE,
  INDEX idx_parent_id (parent_id)
);

CREATE TABLE IF NOT EXISTS files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  folder_id INT NOT NULL,
  size BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE,
  INDEX idx_folder_id (folder_id)
);

-- Sample data
INSERT INTO folders (id, name, parent_id) VALUES
(1, 'Root', NULL),
(2, 'Documents', 1),
(3, 'Pictures', 1),
(4, 'Videos', 1),
(5, 'Work', 2),
(6, 'Personal', 2),
(7, 'Projects', 5),
(8, 'Reports', 5),
(9, 'Vacation', 3),
(10, 'Family', 3),
(11, 'Project A', 7),
(12, 'Project B', 7),
(13, 'Q1', 8),
(14, 'Q2', 8),
(15, 'Letters', 6),
(16, 'Receipts', 6);

INSERT INTO files (name, folder_id, size) VALUES
('readme.txt', 1, 1024),
('contract.pdf', 5, 204800),
('invoice.pdf', 6, 102400),
('photo1.jpg', 9, 2048000),
('photo2.jpg', 9, 1536000),
('video1.mp4', 4, 10485760),
('report.docx', 13, 51200),
('presentation.pptx', 11, 307200);
