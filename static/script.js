// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Close alert messages
    const closeButtons = document.querySelectorAll('.close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.parentElement.style.display = 'none';
        });
    });
    
    // Modal functionality for Add Book
    const addBookModal = document.getElementById('addBookModal');
    const showAddBookBtn = document.getElementById('showAddBookModal');
    const cancelAddBookBtn = document.getElementById('cancelAddBook');
    const closeAddBookBtn = addBookModal?.querySelector('.close');
    
    if (showAddBookBtn && addBookModal) {
        showAddBookBtn.addEventListener('click', function() {
            addBookModal.style.display = 'block';
        });
        
        if (closeAddBookBtn) {
            closeAddBookBtn.addEventListener('click', function() {
                addBookModal.style.display = 'none';
            });
        }
        
        if (cancelAddBookBtn) {
            cancelAddBookBtn.addEventListener('click', function() {
                addBookModal.style.display = 'none';
            });
        }
    }
    
    // Modal functionality for Add Member
    const addMemberModal = document.getElementById('addMemberModal');
    const showAddMemberBtn = document.getElementById('showAddMemberModal');
    const cancelAddMemberBtn = document.getElementById('cancelAddMember');
    const closeAddMemberBtn = addMemberModal?.querySelector('.close');
    
    if (showAddMemberBtn && addMemberModal) {
        showAddMemberBtn.addEventListener('click', function() {
            addMemberModal.style.display = 'block';
        });
        
        if (closeAddMemberBtn) {
            closeAddMemberBtn.addEventListener('click', function() {
                addMemberModal.style.display = 'none';
            });
        }
        
        if (cancelAddMemberBtn) {
            cancelAddMemberBtn.addEventListener('click', function() {
                addMemberModal.style.display = 'none';
            });
        }
    }
    
    // Modal functionality for Borrow Book
    const borrowBookModal = document.getElementById('borrowBookModal');
    const showBorrowBtn = document.getElementById('showBorrowModal');
    const cancelBorrowBtn = document.getElementById('cancelBorrow');
    const closeBorrowBtn = borrowBookModal?.querySelector('.close');
    
    if (showBorrowBtn && borrowBookModal) {
        showBorrowBtn.addEventListener('click', function() {
            borrowBookModal.style.display = 'block';
            
            // Set default due date (2 weeks from now)
            const dueDate = document.getElementById('due_date');
            if (dueDate) {
                const today = new Date();
                const twoWeeksLater = new Date(today.setDate(today.getDate() + 14));
                const formattedDate = twoWeeksLater.toISOString().substr(0, 10);
                dueDate.value = formattedDate;
            }
        });
        
        if (closeBorrowBtn) {
            closeBorrowBtn.addEventListener('click', function() {
                borrowBookModal.style.display = 'none';
            });
        }
        
        if (cancelBorrowBtn) {
            cancelBorrowBtn.addEventListener('click', function() {
                borrowBookModal.style.display = 'none';
            });
        }
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === addBookModal) {
            addBookModal.style.display = 'none';
        }
        if (event.target === addMemberModal) {
            addMemberModal.style.display = 'none';
        }
        if (event.target === borrowBookModal) {
            borrowBookModal.style.display = 'none';
        }
    });
    
    // Book search/filter functionality
    const bookSearchInput = document.getElementById('bookSearchInput');
    const genreFilter = document.getElementById('genreFilter');
    const availabilityFilter = document.getElementById('availabilityFilter');
    
    if (bookSearchInput && genreFilter && availabilityFilter) {
        const filterBooks = () => {
            const searchValue = bookSearchInput.value.toLowerCase();
            const genreValue = genreFilter.value.toLowerCase();
            const availabilityValue = availabilityFilter.value.toLowerCase();
            
            const rows = document.querySelectorAll('.books-container table tbody tr');
            
            rows.forEach(row => {
                const title = row.cells[1].textContent.toLowerCase();
                const author = row.cells[2].textContent.toLowerCase();
                const genre = row.cells[3].textContent.toLowerCase();
                const status = row.cells[7].textContent.trim().toLowerCase();
                
                const matchesSearch = title.includes(searchValue) || author.includes(searchValue);
                const matchesGenre = !genreValue || genre === genreValue;
                const matchesAvailability = !availabilityValue || status === availabilityValue;
                
                if (matchesSearch && matchesGenre && matchesAvailability) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        };
        
        bookSearchInput.addEventListener('input', filterBooks);
        genreFilter.addEventListener('change', filterBooks);
        availabilityFilter.addEventListener('change', filterBooks);
    }
    
    // Member search functionality
    const memberSearchInput = document.getElementById('memberSearchInput');
    
    if (memberSearchInput) {
        memberSearchInput.addEventListener('input', function() {
            const searchValue = this.value.toLowerCase();
            const rows = document.querySelectorAll('.members-container table tbody tr');
            
            rows.forEach(row => {
                const name = row.cells[1].textContent.toLowerCase();
                const email = row.cells[2].textContent.toLowerCase();
                
                if (name.includes(searchValue) || email.includes(searchValue)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
    
    // Transaction filter functionality
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    
    if (statusFilter && dateFilter) {
        const filterTransactions = () => {
            const statusValue = statusFilter.value.toLowerCase();
            const dateValue = dateFilter.value;
            
            const rows = document.querySelectorAll('.transactions-container table tbody tr');
            
            rows.forEach(row => {
                const status = row.cells[6].textContent.trim().toLowerCase();
                const borrowDate = row.cells[3].textContent;
                
                const matchesStatus = !statusValue || status.includes(statusValue);
                const matchesDate = !dateValue || borrowDate === dateValue;
                
                if (matchesStatus && matchesDate) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        };
        
        statusFilter.addEventListener('change', filterTransactions);
        dateFilter.addEventListener('change', filterTransactions);
    }
    
    // Set minimum date for due date input to today
    const dueDateInput = document.getElementById('due_date');
    if (dueDateInput) {
        const today = new Date().toISOString().split('T')[0];
        dueDateInput.setAttribute('min', today);
    }
    
    // Edit book functionality (can be expanded)
    const editBookBtns = document.querySelectorAll('.books-container .edit-btn');
    editBookBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const bookId = this.getAttribute('data-id');
            alert('Edit functionality for book ID: ' + bookId + ' can be implemented here.');
            // In a real application, you would fetch the book details and populate a form
        });
    });
    
    // View member details (can be expanded)
    const viewMemberBtns = document.querySelectorAll('.members-container .view-btn');
    viewMemberBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const memberId = this.getAttribute('data-id');
            alert('View functionality for member ID: ' + memberId + ' can be implemented here.');
            // In a real application, you would fetch the member details and display them
        });
    });
    
    // View transaction details (can be expanded)
    const viewTransactionBtns = document.querySelectorAll('.transactions-container .view-btn');
    viewTransactionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const transactionId = this.getAttribute('data-id');
            alert('View functionality for transaction ID: ' + transactionId + ' can be implemented here.');
            // In a real application, you would fetch the transaction details and display them
        });
    });
});
                