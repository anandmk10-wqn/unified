import { db } from './firebase.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// --- DOM ELEMENT REFERENCES ---
const closeModalBtn = document.getElementById('close-modal-btn');
const contactModal = document.getElementById('contact-modal');
const contactModalContent = document.getElementById('contact-modal-content');
const contactForm = document.getElementById('contact-modal-form');
const successMessage = document.getElementById('success-message');

// --- FUNCTIONS TO OPEN AND CLOSE MODAL ---
function openModal() {
    if (!contactModal || !contactModalContent) return;
    contactModal.classList.remove('hidden');
    setTimeout(() => {
        contactModalContent.classList.remove('opacity-0', '-translate-y-4');
        contactModalContent.classList.add('opacity-100', 'translate-y-0');
    }, 10);
}

function closeModal() {
    if (!contactModal || !contactModalContent) return;
    contactModalContent.classList.remove('opacity-100', 'translate-y-0');
    contactModalContent.classList.add('opacity-0', '-translate-y-4');
    setTimeout(() => {
        contactModal.classList.add('hidden');
        successMessage.classList.add('hidden');
        contactForm.classList.remove('hidden');
    }, 300);
}

// --- FORM SUBMISSION HANDLER ---
async function handleModalFormSubmit(event) {
    event.preventDefault();
    const submitButton = contactForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    try {
        const formData = new FormData(event.target);
        const inquiryData = {
            enquiryDirection: formData.get('enquiryDirection'),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            enquiryType: formData.get('enquiryType'),
            message: formData.get('details'),
            newsletterOptIn: formData.get('newsletter'),
            timestamp: new Date()
        };
        await addDoc(collection(db, "inquiries"), inquiryData);
        contactForm.classList.add('hidden');
        successMessage.classList.remove('hidden');
        setTimeout(() => {
            contactForm.reset();
            closeModal();
        }, 3000);
    } catch (error) {
        console.error("Error submitting inquiry:", error);
        alert("There was an error submitting your form. Please try again.");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Enquiry';
    }
}

// --- ATTACH EVENT LISTENERS ---
const allOpenModalButtons = document.querySelectorAll('.open-modal');
allOpenModalButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    });
});

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
}

if (contactModal) {
    contactModal.addEventListener('click', (e) => {
        if (e.target === contactModal) {
            closeModal();
        }
    });
}

if (contactForm) {
    contactForm.addEventListener('submit', handleModalFormSubmit);
}
