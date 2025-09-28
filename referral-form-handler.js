import { db } from './firebase.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const referralForm = document.getElementById('referral-page-form');
const successMessage = document.getElementById('referral-success-message-section');

async function handleReferralSubmit(event) {
    event.preventDefault();
    const submitButton = referralForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    try {
        const formData = new FormData(event.target);
        const referralData = {
            referrerName: formData.get('referrerName'),
            referrerEmail: formData.get('referrerEmail'),
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
            successMessage.classList.add('hidden');
            referralForm.classList.remove('hidden');
        }, 5000); // Hide success message and show form again after 5 seconds

    } catch (error) {
        console.error("Error submitting referral:", error);
        alert("There was an error submitting your referral. Please try again.");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Referral';
    }
}

if (referralForm) {
    referralForm.addEventListener('submit', handleReferralSubmit);
}
