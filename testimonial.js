document.addEventListener('DOMContentLoaded', () => {
    const testimonials = {
        1: {
            title: "A true lifeline...",
            body: "Unified Needs has been a true lifeline for our family. Before we found them, we were struggling to get the right support for our daughter. Their team is so compassionate and knowledgeable, and they've helped us navigate a really challenging time. We're so grateful for everything they've done."
        },
        2: {
            title: "Patient and understanding...",
            body: "The mentors at Unified Needs are incredibly patient and understanding. They took the time to get to know our son and his unique needs, and they've been able to connect with him in a way that no one else has. He's made so much progress since he started working with them."
        },
        3: {
            title: "Our son is thriving...",
            body: "We were so worried about our son's future, but now we're filled with hope. He's thriving in the supportive environment at Unified Needs, and he's excited about learning again. We can't thank them enough for giving him this opportunity."
        },
        4: {
            title: "Finally, a place that gets it.",
            body: "For years, we felt like we were on our own. Unified Needs is the first place we've found that truly 'gets it.' They understand the challenges that families like ours face, and they're committed to making a real difference. We feel so lucky to have found them."
        },
        5: {
            title: "Incredible support...",
            body: "The support we've received from Unified Needs has been incredible. They've not only helped our child, but they've also provided us with the resources and guidance we need to be better advocates for him. We're so grateful for their partnership."
        }
    };

    const testimonialItems = document.querySelectorAll('.testimonial-item');
    const modal = document.getElementById('testimonial-modal');
    const modalBody = document.getElementById('testimonial-modal-body');
    const closeModalBtn = document.getElementById('close-testimonial-modal-btn');

    testimonialItems.forEach(item => {
        item.addEventListener('click', () => {
            const testimonialId = item.dataset.testimonial;
            const testimonial = testimonials[testimonialId];
            modalBody.innerHTML = `<h3 class="text-2xl font-bold mb-4">${testimonial.title}</h3><p>${testimonial.body}</p>`;
            modal.classList.remove('hidden');
        });
    });

    closeModalBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
});