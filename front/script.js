document.addEventListener('DOMContentLoaded', () => {
    const bookList = document.getElementById('book-list');
    const authorFilterInput = document.getElementById('authorFilter');
    const genreFilterInput = document.getElementById('genreFilter');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    const logoutBtn = document.getElementById('logoutBtn'); 
    const API_URL = 'http://localhost:3000/books';

    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = 'login.html';
        return; 
    }

    fetchBooks();

    async function fetchBooks(filters = {}) {
        const currentToken = localStorage.getItem('jwtToken');
        if (!currentToken) {
            window.location.href = 'login.html'; 
            return;
        }
        const queryParams = new URLSearchParams();
        if (filters.author) queryParams.append('author', filters.author);
        if (filters.genre) queryParams.append('genre', filters.genre);

        const url = `${API_URL}?${queryParams.toString()}`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentToken}`
                }
            });

            if (response.status === 401 || response.status === 403) {
                 localStorage.removeItem('jwtToken');
                 window.location.href = 'login.html';
                 return;
            }

            if (!response.ok) {
                let errorData;
                try {
                     errorData = await response.json();
                } catch(e) {
                    errorData = { message: `Error: ${response.statusText}`};
                }
                throw new Error(errorData.message || `Unknown error to man.`);
            }

            const books = await response.json();
            displayBooks(books);

        } catch (error) {
            console.error('Books could not be loaded:', error);
            displayMessage(`Books could not be loaded: ${error.message}`, true);
        }
    }

    function displayBooks(books) {
        bookList.innerHTML = '';

        if (!books || books.length === 0) {
            displayMessage('No books found.');
            return;
        }

        books.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.classList.add('book-card');
            bookCard.dataset.id = book.id;

            bookCard.innerHTML = `
                <h3>${book.title}</h3>
                <p class="author">Author: ${book.author}</p>
                ${book.genre ? `<span class="genre">${book.genre}</span>` : ''}
                <p class="description">${book.description || 'No description.'}</p>
                <div class="book-actions">
                    <button class="btn details" onclick="viewDetails('${book.id}')">Details</button>
                    <button class="btn read" onclick="startReading('${book.id}')">Start reading</button>
                </div>
            `;
            bookList.appendChild(bookCard);
        });
    }

    function displayMessage(message, isError = false) {
        bookList.innerHTML = '';
        const messageElement = document.createElement('p');
        messageElement.textContent = message;
        if (isError) {
            messageElement.classList.add('error');
        }
        bookList.appendChild(messageElement);
    }

    applyFiltersBtn.addEventListener('click', () => {
        const filters = {
            author: authorFilterInput.value.trim(),
            genre: genreFilterInput.value.trim()
        };
        fetchBooks(filters);
    });

    clearFiltersBtn.addEventListener('click', () => {
        authorFilterInput.value = '';
        genreFilterInput.value = '';
        fetchBooks();
    });

    authorFilterInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            applyFiltersBtn.click();
        }
    });

    genreFilterInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            applyFiltersBtn.click();
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('jwtToken'); 
        window.location.href = 'login.html'; 
    });

    window.viewDetails = function(bookId) {
        alert(`Read book details by ID: ${bookId}\n(Not present yet)`);
    }

    window.startReading = function(bookId) {
         const currentToken = localStorage.getItem('jwtToken');
         if (!currentToken) {
            alert('Session over. Please log in again.');
            window.location.href = 'login.html';
            return;
         }
        alert(`Start reading book by ID: ${bookId}\n(Not present yet)`);
    }
});