import { auth } from './firebase.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const loginForm = document.getElementById('login-form');
const errorMessageDiv = document.getElementById('error-message');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = loginForm.email.value;
    const password = loginForm.password.value;

    try {
        // Hide error message initially
        errorMessageDiv.classList.add('hidden');

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Signed in
        const user = userCredential.user;
        console.log('User signed in:', user);

        // Redirect to admin page on successful login
        window.location.href = 'admin.html';

    } catch (error) {
        console.error('Login Error:', error);
        // Show error message
        errorMessageDiv.querySelector('span').textContent = error.message;
        errorMessageDiv.classList.remove('hidden');
    }
});
