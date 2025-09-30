import { db } from './firebase.js';
import { doc, getDoc, collection, addDoc, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

async function populateNavigationMenu(container, linkClass) {
    if (!container) return;
    try {
        const navQuery = query(collection(db, "navigation"), orderBy("order"));
        const querySnapshot = await getDocs(navQuery);
        const linksHTML = querySnapshot.docs.map(doc => {
            const item = doc.data();
            return `<a href="${item.url}" class="${linkClass}">${item.text}</a>`;
        }).join('');
        container.innerHTML = linksHTML;
    } catch (error) {
        console.error("Error populating navigation:", error);
    }
}

async function populatePoliciesMenu() {
    const container = document.getElementById('policies-links-container');
    if (!container) return;
    try {
        const policiesQuery = query(collection(db, "policies"), orderBy("title"));
        const querySnapshot = await getDocs(policiesQuery);
        if (querySnapshot.empty) {
            container.innerHTML = '<p class="text-gray-500 text-sm">No policies available.</p>';
            return;
        }
        const linksHTML = querySnapshot.docs.map(doc => `<a href="policies.html?id=${doc.id}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">${doc.data().title}</a>`).join('');
        container.innerHTML = linksHTML;
    } catch (error) {
        console.error("Error populating policies menu:", error);
    }
}

/**
 * CORRECTED FUNCTION: Fetches content from Firestore and populates the hero section.
 */
async function loadLegacyContent() {
    try {
        const contentRef = doc(db, "content", "home_page");
        const docSnap = await getDoc(contentRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const heroTitle = document.getElementById('hero-title');
            if (heroTitle) {
                heroTitle.querySelector('.hero-title-color').textContent = data.hero_title_part1 || 'Alternative Provision where';
                heroTitle.querySelector('.text-teal-700').textContent = data.hero_title_part2 || 'children are supported to learn, grow and thrive.';
            }
            const heroSubtitle = document.getElementById('hero-subtitle');
            if (heroSubtitle) heroSubtitle.textContent = data.hero_subtitle || "At 'Unified Needs', We envision a future where families of children with special needs are fully integrated and supported within their communities.";
            
            const missionText = document.getElementById('our-mission-text');
            if (missionText) missionText.textContent = data.our_mission_text || '';
        } else {
             console.log("Home page content document does not exist in Firestore.");
        }
    } catch (error) {
        console.error("Error fetching legacy content:", error);
    }
}


function initializeMobileMenu() {
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            const isOpen = !mobileMenu.classList.contains('hidden');
            if (isOpen) {
                menuButton.innerHTML = `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
            } else {
                menuButton.innerHTML = `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>`;
            }
        });
    }
}

async function handleStaticFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    try {
        await addDoc(collection(db, "inquiries"), {
            name: form.name.value,
            email: form.email.value,
            message: form.details.value,
            timestamp: new Date()
        });
        alert('Thank you for your message! We will get back to you soon.');
        form.reset();
    } catch (e) {
        console.error("Error adding document from static form: ", e);
        alert('There was an error sending your message.');
    }
}

function main() {
    populateNavigationMenu(document.getElementById('main-nav-links'), 'parallelogram-btn');
    populateNavigationMenu(document.getElementById('mobile-nav-links'), 'hover:text-teal-600');
    populatePoliciesMenu();
    loadLegacyContent(); 
    initializeMobileMenu();
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleStaticFormSubmit);
    }
}

document.addEventListener('DOMContentLoaded', main);

