import { db } from './firebase.js';
import { collection, query, orderBy, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const testimonialTrack = document.querySelector('.testimonial-track');
    const modal = document.getElementById('testimonial-modal');
    const modalBody = document.getElementById('testimonial-modal-body');
    const closeModalBtn = document.getElementById('close-testimonial-modal-btn');

    async function loadTestimonials() {
        if (!testimonialTrack) return;

        try {
            const testimonialsQuery = query(collection(db, "testimonials"), orderBy("title"));
            const snapshot = await getDocs(testimonialsQuery);

            if (snapshot.empty) {
                testimonialTrack.innerHTML = '<p class="text-gray-500">No testimonials available.</p>';
                return;
            }

            let testimonialsHTML = '';
            const testimonialsData = [];

            snapshot.forEach(doc => {
                const testimonial = { id: doc.id, ...doc.data() };
                testimonialsData.push(testimonial);
                testimonialsHTML += `
                    <div class="testimonial-item" data-id="${testimonial.id}">
                        <h3>"${testimonial.title}"</h3>
                    </div>
                `;
            });

            // Duplicate for seamless scrolling effect
            testimonialTrack.innerHTML = testimonialsHTML + testimonialsHTML;

        } catch (error) {
            console.error("Error loading testimonials:", error);
            testimonialTrack.innerHTML = '<p class="text-red-500">Could not load testimonials.</p>';
        }
    }

    testimonialTrack.addEventListener('click', async (e) => {
        const item = e.target.closest('.testimonial-item');
        if (item) {
            const testimonialId = item.dataset.id;
            try {
                const docRef = doc(db, "testimonials", testimonialId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const testimonial = docSnap.data();
                    modalBody.innerHTML = `<h3 class="text-2xl font-bold mb-4">"${testimonial.title}"</h3><p>${testimonial.body}</p>`;
                    modal.classList.remove('hidden');
                }
            } catch (error) {
                console.error("Error fetching testimonial details:", error);
            }
        }
    });

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }

    loadTestimonials();
});