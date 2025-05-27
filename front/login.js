document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessageDiv = document.getElementById('errorMessage');
    const loginButton = document.getElementById('loginButton');

    const API_LOGIN_URL = 'http://localhost:3000/auth/login'; 

    if (localStorage.getItem('jwtToken')) {
        window.location.href = 'index.html';
    }

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); 

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            showError('Please enter your password and email.');
            return;
        }

        hideError(); 
        loginButton.disabled = true; 

        try {
            const response = await fetch(API_LOGIN_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json',},
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Error: ${response.status}`);
            }

            if (data.access_token) {
                localStorage.setItem('jwtToken', data.access_token); // save token 
                window.location.href = 'index.html'; 
            } else {
                throw new Error('Cound not get token.');
            }

        } catch (error) {
            console.error('Error:', error);
            showError(error.message || 'Something went wrong, try again.');
            loginButton.disabled = false; 
            loginButton.textContent = 'Увійти';
        }
    });

    function showError(message) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.classList.add('show');
    }

    function hideError() {
         errorMessageDiv.classList.remove('show');
         errorMessageDiv.textContent = '';
    }
});