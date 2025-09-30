import { db } from './firebase.js';
import { collection, query, orderBy, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// DOM References for the new modal system
const indexContainer = document.getElementById('policy-index-container');
const policyModal = document.getElementById('policy-viewer-modal');
const policyModalTitle = document.getElementById('policy-modal-title');
const policyModalContent = document.getElementById('policy-modal-content');
const closeModalBtn = document.getElementById('close-policy-modal-btn');

/**
 * Fetches all policies and builds a clickable index list.
 */
async function displayPolicyIndex() {
    try {
        const policiesQuery = query(collection(db, "policies"), orderBy("title"));
        const snapshot = await getDocs(policiesQuery);

        if (snapshot.empty) {
            indexContainer.innerHTML = '<p class="text-gray-500 col-span-full">No policies have been published yet.</p>';
            return;
        }

        const linksHTML = snapshot.docs.map(doc => {
            const policy = { id: doc.id, ...doc.data() };
            return `<a href="#" data-id="${policy.id}" class="policy-link block p-4 bg-white/50 hover:bg-white/80 rounded-lg shadow transition-all font-semibold">${policy.title}</a>`;
        }).join('');
        indexContainer.innerHTML = linksHTML;
    } catch (error) {
        console.error("Error building policy index:", error);
        indexContainer.innerHTML = '<p class="text-red-500 col-span-full">Could not load the policy index.</p>';
    }
}

/**
 * Opens the modal and displays the content for a given policy ID.
 * @param {string} policyId The ID of the policy to display.
 */
async function showPolicyInModal(policyId) {
    if (!policyId) return;

    // Show loading state
    policyModalTitle.textContent = 'Loading...';
    policyModalContent.innerHTML = '<p>Please wait...</p>';
    policyModal.classList.remove('hidden');

    try {
        const docRef = doc(db, "policies", policyId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const policy = docSnap.data();
            policyModalTitle.textContent = policy.title;

            // --- THIS IS THE NEW CODE ---
            // Create the HTML for the logo and prepend it to the policy content.
            // The `float-right` class aligns it to the right, and margins add spacing.
            const logoHTML = `<img src="static/images/unified-logo.png" alt="Unified Needs Logo" class="float-right ml-6 mb-4 w-32 h-auto">`;
            policyModalContent.innerHTML = logoHTML + policy.content;
            // --- END OF NEW CODE ---
            
            document.title = `${policy.title} - Unified Needs`; // Update page title
        } else {
            policyModalTitle.textContent = 'Policy Not Found';
            policyModalContent.innerHTML = '<p>The policy you are looking for does not exist.</p>';
        }
    } catch (error) {
        console.error("Error fetching policy for modal:", error);
        policyModalTitle.textContent = 'Error';
        policyModalContent.innerHTML = '<p>There was an error loading this policy.</p>';
    }
}

/**
 * Closes the policy viewer modal.
 */
function closePolicyModal() {
    policyModal.classList.add('hidden');
    document.title = 'Our Policies - Unified Needs'; // Reset page title
    // Clear the policy ID from the URL for a cleaner state
    window.history.pushState({}, '', window.location.pathname);
}


/**
 * Main function to initialize the policies page.
 */
function main() {
    displayPolicyIndex();

    // Check if a policy ID is in the URL on page load and show it
    const params = new URLSearchParams(window.location.search);
    const policyIdFromUrl = params.get('id');
    if (policyIdFromUrl) {
        showPolicyInModal(policyIdFromUrl);
    }

    // Event listener for clicking on a policy in the index
    indexContainer.addEventListener('click', (e) => {
        const link = e.target.closest('a.policy-link');
        if (link) {
            e.preventDefault();
            const policyId = link.dataset.id;
            // Update URL for shareability, but don't reload the page
            window.history.pushState({ policyId }, '', `?id=${policyId}`);
            showPolicyInModal(policyId);
        }
    });

    // Event listener for the modal's close button
    closeModalBtn.addEventListener('click', closePolicyModal);
    
    // Allow closing with the Escape key for better accessibility
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && !policyModal.classList.contains('hidden')) {
            closePolicyModal();
        }
    });

    // Handle browser back/forward button navigation
    window.addEventListener('popstate', (e) => {
        const params = new URLSearchParams(window.location.search);
        const policyId = params.get('id');
        if (policyId) {
            showPolicyInModal(policyId);
        } else {
            closePolicyModal();
        }
    });
}

document.addEventListener('DOMContentLoaded', main);

