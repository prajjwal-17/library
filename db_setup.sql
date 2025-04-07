-- Database setup script for Library Management System

-- Create database
CREATE DATABASE IF NOT EXISTS library_management;
USE library_management;

-- Create tables
CREATE TABLE IF NOT EXISTS books (
    book_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    isbn VARCHAR(20) UNIQUE,
    published_year INT,
    copies_available INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS members (
    member_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    join_date DATE NOT NULL,
    member_status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT,
    member_id INT,
    borrow_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    status ENUM('Borrowed', 'Returned', 'Overdue') DEFAULT 'Borrowed',
    fine DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(book_id),
    FOREIGN KEY (member_id) REFERENCES members(member_id)
);

-- Create VIEW for book details with status
CREATE OR REPLACE VIEW book_details_view AS
SELECT 
    b.book_id,
    b.title,
    b.author,
    b.genre,
    b.isbn,
    b.published_year,
    b.copies_available,
    CASE 
        WHEN b.copies_available > 0 THEN 'Available'
        ELSE 'Not Available'
    END AS availability_status
FROM books b;

-- Create VIEW for member activity
CREATE OR REPLACE VIEW member_activity_view AS
SELECT 
    m.member_id,
    m.name,
    COUNT(t.transaction_id) AS total_borrows,
    SUM(CASE WHEN t.status = 'Borrowed' THEN 1 ELSE 0 END) AS current_borrows,
    SUM(t.fine) AS total_fines
FROM members m
LEFT JOIN transactions t ON m.member_id = t.member_id
GROUP BY m.member_id, m.name;

-- Create TRIGGERs for inventory management
-- Decrease available copies when a book is borrowed
DELIMITER //
CREATE TRIGGER after_borrow_insert
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    IF NEW.status = 'Borrowed' THEN
        UPDATE books
        SET copies_available = copies_available - 1
        WHERE book_id = NEW.book_id;
    END IF;
END //
DELIMITER ;

-- Increase available copies when a book is returned
DELIMITER //
CREATE TRIGGER after_return_update
AFTER UPDATE ON transactions
FOR EACH ROW
BEGIN
    IF NEW.status = 'Returned' AND OLD.status = 'Borrowed' THEN
        UPDATE books
        SET copies_available = copies_available + 1
        WHERE book_id = NEW.book_id;
    END IF;
END //
DELIMITER ;

-- Create TRIGGER for calculating fines on returned books
DELIMITER //
CREATE TRIGGER calculate_fine_on_return
BEFORE UPDATE ON transactions
FOR EACH ROW
BEGIN
    IF NEW.status = 'Returned' AND OLD.status = 'Borrowed' THEN
        -- If returned after due date, calculate fine (€1 per day)
        IF NEW.return_date > OLD.due_date THEN
            SET NEW.fine = DATEDIFF(NEW.return_date, OLD.due_date) * 1.00;
        END IF;
    END IF;
END //
DELIMITER ;

-- Insert sample data
-- Insert sample books
INSERT INTO books (title, author, genre, isbn, published_year, copies_available) VALUES
('To Kill a Mockingbird', 'Harper Lee', 'Fiction', '9780061120084', 1960, 3),
('1984', 'George Orwell', 'Dystopian', '9780451524935', 1949, 2),
('The Great Gatsby', 'F. Scott Fitzgerald', 'Classic', '9780743273565', 1925, 4),
('Pride and Prejudice', 'Jane Austen', 'Romance', '9780141439518', 1813, 3),
('The Hobbit', 'J.R.R. Tolkien', 'Fantasy', '9780547928227', 1937, 2),
('The Catcher in the Rye', 'J.D. Salinger', 'Fiction', '9780316769488', 1951, 1),
('The Lord of the Rings', 'J.R.R. Tolkien', 'Fantasy', '9780618640157', 1954, 3),
('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', 'Fantasy', '9780590353427', 1997, 5),
('The Da Vinci Code', 'Dan Brown', 'Mystery', '9780307474278', 2003, 2),
('The Alchemist', 'Paulo Coelho', 'Fiction', '9780062315007', 1988, 4);

-- Insert sample members
INSERT INTO members (name, email, phone, address, join_date) VALUES
('John Smith', 'john@example.com', '555-1234', '123 Main St', '2023-01-15'),
('Sarah Johnson', 'sarah@example.com', '555-5678', '456 Oak Ave', '2023-02-20'),
('Michael Brown', 'michael@example.com', '555-9012', '789 Pine Rd', '2023-03-10'),
('Emily Davis', 'emily@example.com', '555-3456', '321 Elm St', '2023-04-05'),
('David Wilson', 'david@example.com', '555-7890', '654 Maple Dr', '2023-05-12');

-- Insert sample transactions
INSERT INTO transactions (book_id, member_id, borrow_date, due_date, return_date, status) VALUES
(1, 1, '2023-06-01', '2023-06-15', '2023-06-14', 'Returned'),
(2, 2, '2023-06-05', '2023-06-19', '2023-06-25', 'Returned'),
(3, 3, '2023-06-10', '2023-06-24', NULL, 'Borrowed'),
(4, 4, '2023-06-15', '2023-06-29', '2023-06-28', 'Returned'),
(5, 5, '2023-06-20', '2023-07-04', NULL, 'Borrowed');

-- The trigger would have automatically calculated a fine for the second transaction
UPDATE transactions SET fine = 6.00 WHERE transaction_id = 2;