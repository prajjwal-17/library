# app.py - Main Flask Application
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
import mysql.connector
from mysql.connector import Error
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'library_secret_key'

# Database connection function
def create_connection():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='root',  # replace with your MySQL username
            password='pawnstar1234',  # replace with your MySQL password
            database='library_management'
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

# Home route
@app.route('/')
def index():
    return render_template('index.html')

# Books routes
@app.route('/books')
def books():
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Using a cursor view to get book information
    cursor.execute("SELECT * FROM book_details_view")
    books = cursor.fetchall()
    
    cursor.close()
    conn.close()
    return render_template('books.html', books=books)

@app.route('/books/add', methods=['POST'])
def add_book():
    if request.method == 'POST':
        title = request.form['title']
        author = request.form['author']
        genre = request.form['genre']
        isbn = request.form['isbn']
        published_year = request.form['published_year']
        copies = request.form['copies']
        
        conn = create_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "INSERT INTO books (title, author, genre, isbn, published_year, copies_available) VALUES (%s, %s, %s, %s, %s, %s)",
                (title, author, genre, isbn, published_year, copies)
            )
            conn.commit()
            flash('Book added successfully!', 'success')
        except Error as e:
            flash(f'Error adding book: {e}', 'danger')
        finally:
            cursor.close()
            conn.close()
    
    return redirect(url_for('books'))

@app.route('/books/delete/<int:book_id>', methods=['POST'])
def delete_book(book_id):
    conn = create_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("DELETE FROM books WHERE book_id = %s", (book_id,))
        conn.commit()
        flash('Book deleted successfully!', 'success')
    except Error as e:
        flash(f'Error deleting book: {e}', 'danger')
    finally:
        cursor.close()
        conn.close()
    
    return redirect(url_for('books'))

# Members routes
@app.route('/members')
def members():
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT * FROM members")
    members = cursor.fetchall()
    
    cursor.close()
    conn.close()
    return render_template('members.html', members=members)

@app.route('/members/add', methods=['POST'])
def add_member():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        phone = request.form['phone']
        address = request.form['address']
        
        conn = create_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "INSERT INTO members (name, email, phone, address, join_date) VALUES (%s, %s, %s, %s, %s)",
                (name, email, phone, address, datetime.now())
            )
            conn.commit()
            flash('Member added successfully!', 'success')
        except Error as e:
            flash(f'Error adding member: {e}', 'danger')
        finally:
            cursor.close()
            conn.close()
    
    return redirect(url_for('members'))

# Transactions routes
@app.route('/transactions')
def transactions():
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Using a cursor to join tables and get transaction details
    cursor.execute("""
        SELECT t.transaction_id, b.title as book_title, m.name as member_name, 
               t.borrow_date, t.due_date, t.return_date, t.status
        FROM transactions t
        JOIN books b ON t.book_id = b.book_id
        JOIN members m ON t.member_id = m.member_id
        ORDER BY t.borrow_date DESC
    """)
    transactions = cursor.fetchall()
    
    # Get books and members for the dropdown menus
    cursor.execute("SELECT book_id, title FROM books WHERE copies_available > 0")
    available_books = cursor.fetchall()
    
    cursor.execute("SELECT member_id, name FROM members")
    all_members = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return render_template('transactions.html', 
                          transactions=transactions,
                          books=available_books,
                          members=all_members)

@app.route('/transactions/borrow', methods=['POST'])
def borrow_book():
    if request.method == 'POST':
        book_id = request.form['book_id']
        member_id = request.form['member_id']
        due_date = request.form['due_date']
        
        conn = create_connection()
        cursor = conn.cursor()
        
        try:
            # Insert transaction - the trigger will update the books table
            cursor.execute(
                """INSERT INTO transactions 
                   (book_id, member_id, borrow_date, due_date, status) 
                   VALUES (%s, %s, %s, %s, 'Borrowed')""",
                (book_id, member_id, datetime.now(), due_date)
            )
            conn.commit()
            flash('Book borrowed successfully!', 'success')
        except Error as e:
            flash(f'Error recording transaction: {e}', 'danger')
        finally:
            cursor.close()
            conn.close()
    
    return redirect(url_for('transactions'))

@app.route('/transactions/return/<int:transaction_id>', methods=['POST'])
def return_book(transaction_id):
    conn = create_connection()
    cursor = conn.cursor()
    
    try:
        # First get the book_id from the transaction
        cursor.execute("SELECT book_id FROM transactions WHERE transaction_id = %s", (transaction_id,))
        book_id = cursor.fetchone()[0]
        
        # Update transaction - the trigger will update the books table
        cursor.execute(
            "UPDATE transactions SET return_date = %s, status = 'Returned' WHERE transaction_id = %s",
            (datetime.now(), transaction_id)
        )
        conn.commit()
        flash('Book returned successfully!', 'success')
    except Error as e:
        flash(f'Error updating transaction: {e}', 'danger')
    finally:
        cursor.close()
        conn.close()
    
    return redirect(url_for('transactions'))

# Reports route
@app.route('/reports')
def reports():
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Books per genre
    cursor.execute("SELECT genre, COUNT(*) as count FROM books GROUP BY genre")
    books_by_genre = cursor.fetchall()
    
    # Overdue books
    cursor.execute("""
        SELECT b.title, m.name, t.due_date
        FROM transactions t
        JOIN books b ON t.book_id = b.book_id
        JOIN members m ON t.member_id = m.member_id
        WHERE t.status = 'Borrowed' AND t.due_date < CURDATE()
    """)
    overdue_books = cursor.fetchall()
    
    # Popular books
    cursor.execute("""
        SELECT b.title, COUNT(t.transaction_id) as borrow_count
        FROM books b
        JOIN transactions t ON b.book_id = t.book_id
        GROUP BY b.book_id
        ORDER BY borrow_count DESC
        LIMIT 5
    """)
    popular_books = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return render_template('reports.html', 
                          books_by_genre=books_by_genre,
                          overdue_books=overdue_books,
                          popular_books=popular_books)

if __name__ == '__main__':
    app.run(debug=True)