# Library Management System

A Flask-MySQL web application for managing a library's books, members, and transactions with SQL features including Cursors, Views, and Triggers.

## Features

- **Book Management:** Add, view, and delete books
- **Member Management:** Register and manage library members
- **Transaction System:** Borrow and return books with automatic inventory updates
- **Reporting:** View statistics and reports on library activity
- **SQL Features:**
  - **Views:** Book details and member activity views
  - **Triggers:** Automatic inventory management and fine calculation
  - **Cursors:** Used for complex data retrieval and joins

## Technologies Used

- **Backend:** Flask (Python)
- **Database:** MySQL
- **Frontend:** HTML, CSS, JavaScript
- **UI Framework:** Custom CSS with responsive design

## Project Structure

```
library_management_system/
    ├── app.py                 # Main Flask application
    ├── db_setup.sql           # Database setup script
    ├── static/
    │   ├── styles.css         # CSS styles
    │   └── script.js          # JavaScript functionality
    └── templates/
        ├── base.html          # Base template
        ├── index.html         # Dashboard
        ├── books.html         # Book management
        ├── members.html       # Member management
        ├── transactions.html  # Transaction management
        └── reports.html       # Reports and statistics
```

## Setup Instructions

### 1. Prerequisites

- Python 3.6+
- MySQL 5.7+ or MariaDB 10.2+
- pip (Python package manager)

### 2. Database Setup

1. Log in to MySQL:
   ```
   mysql -u root -p
   ```

2. Run the database setup script:
   ```
   mysql -u root -p < db_setup.sql
   ```
   
   Alternatively, you can copy and paste the contents of `db_setup.sql` directly into your MySQL client.

### 3. Python Environment Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

3. Install required packages:
   ```
   pip install flask mysql-connector-python
   ```

### 4. Application Configuration

1. Open `app.py` and update the database connection settings:
   ```python
   def create_connection():
       try:
           connection = mysql.connector.connect(
               host='localhost',       # Update if needed
               user='your_username',   # Update with your MySQL username
               password='your_password', # Update with your MySQL password
               database='library_management'
           )
           return connection
       except Error as e:
           print(f"Error connecting to MySQL: {e}")
           return None
   ```

### 5. Running the Application

1. From the project directory with your virtual environment activated, run:
   ```
   python app.py
   ```

2. Open your web browser and navigate to:
   ```
   http://localhost:5000
   ```

## Database Schema

### Tables

1. **books**
   - book_id (PK)
   - title
   - author
   - genre
   - isbn
   - published_year
   - copies_available
   - created_at

2. **members**
   - member_id (PK)
   - name
   - email
   - phone
   - address
   - join_date
   - member_status
   - created_at

3. **transactions**
   - transaction_id (PK)
   - book_id (FK)
   - member_id (FK)
   - borrow_date
   - due_date
   - return_date
   - status
   - fine
   - created_at

### Views

1. **book_details_view**
   - Shows book details with availability status

2. **member_activity_view**
   - Shows member activity statistics

### Triggers

1. **after_borrow_insert**
   - Decreases available copies when a book is borrowed

2. **after_return_update**
   - Increases available copies when a book is returned

3. **calculate_fine_on_return**
   - Calculates fines for overdue books upon return

## Extending the Application

- Add authentication and user roles
- Implement book reservation system
- Create email notifications for due dates
- Add barcode scanning functionality
- Implement advanced search and filtering
- Create a recommendation system
