import { db } from './firebase.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// --- DOM ELEMENT REFERENCES ---
const closeModalBtn = document.getElementById('close-referral-modal-btn');
const referralModal = document.getElementById('referral-modal');
const referralModalContent = document.getElementById('referral-modal-content');
const referralForm = document.getElementById('referral-modal-form');
const successMessage = document.getElementById('referral-success-message');

// --- FUNCTIONS TO OPEN AND CLOSE MODAL ---
function openModal() {
    if (!referralModal || !referralModalContent) return;
    referralModal.classList.remove('hidden');
    setTimeout(() => {
        referralModalContent.classList.remove('opacity-0', '-translate-y-4');
        referralModalContent.classList.add('opacity-100', 'translate-y-0');
    }, 10);
}

function closeModal() {
    if (!referralModal || !referralModalContent) return;
    referralModalContent.classList.remove('opacity-100', 'translate-y-0');
    referralModalContent.classList.add('opacity-0', '-translate-y-4');
    setTimeout(() => {
        referralModal.classList.add('hidden');
        successMessage.classList.add('hidden');
        referralForm.classList.remove('hidden');
    }, 300);
}

// --- FORM SUBMISSION HANDLER ---
async function handleReferralFormSubmit(event) {
    event.preventDefault();
    const submitButton = referralForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    try {
        const formData = new FormData(event.target);
        const referralData = {
            referrerName: formData.get('referrerName'),
            referrerEmail: formData.get('referrerEmail'),
            referrerPhone: formData.get('referrerPhone'), // Capturing the new phone field
            referrerRelationship: formData.get('referrerRelationship'),
            childName: formData.get('childName'),
            childAge: formData.get('childAge'),
            referralReason: formData.get('referralReason'),
            hasConsent: formData.get('hasConsent') === 'on',
            timestamp: serverTimestamp()
        };

        await addDoc(collection(db, "referrals"), referralData);
        
        referralForm.classList.add('hidden');
        successMessage.classList.remove('hidden');
        
        setTimeout(() => {
            referralForm.reset();
            closeModal();
        }, 4000);

    } catch (error) {
        console.error("Error submitting referral:", error);
        alert("There was an error submitting your referral. Please try again.");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Referral';
    }
}

// --- ATTACH EVENT LISTENERS (CORRECTED) ---
const openModalButtons = document.querySelectorAll('.open-referral-modal');
openModalButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    });
});


if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
}

if (referralModal) {
    referralModal.addEventListener('click', (e) => {
        if (e.target === referralModal) {
            closeModal();
        }
    });
}

if (referralForm) {
    referralForm.addEventListener('submit', handleReferralFormSubmit);
}

