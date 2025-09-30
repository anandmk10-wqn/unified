import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { collection, getDocs, query, orderBy, doc, getDoc, setDoc, addDoc, deleteDoc, runTransaction } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// --- GLOBAL STATE & DOM REFERENCES ---
let quill;
let currentEditContext = {}; // Holds info about the item being edited in the modal

const dom = {
    logoutButton: document.getElementById('logout-btn'),
    adminTabs: document.getElementById('admin-tabs'),
    editModal: document.getElementById('edit-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalForm: document.getElementById('modal-form'),
    modalFormFields: document.getElementById('modal-form-fields'),
    modalCancelBtn: document.getElementById('modal-cancel-btn'),
    // Tab-specific containers
    blocksContainer: document.getElementById('blocks-container'),
    policiesTableContainer: document.getElementById('policies-table-container'),
    navItemsTableContainer: document.getElementById('nav-items-table-container'),
    inquiriesContainer: document.getElementById('inquiries-container'),
    referralsContainer: document.getElementById('referrals-container'), // NEW
    // Buttons and Forms
    addPolicyBtn: document.getElementById('add-policy-btn'),
    navItemForm: document.getElementById('nav-item-form'),
    cancelNavEditBtn: document.getElementById('cancel-nav-edit-btn'),
    // Add Block elements
    addBlockBtn: document.getElementById('add-block-btn'),
    addBlockDropdown: document.getElementById('add-block-dropdown')
};

// --- INITIALIZATION & AUTHENTICATION ---
onAuthStateChanged(auth, (user) => user ? initializeAdminDashboard() : (window.location.href = 'login.html'));

function initializeAdminDashboard() {
    attachEventListeners();
    // Load data for all tabs
    displayHomePageBlocks();
    displayPolicies();
    displayInquiries();
    displayReferrals(); // NEW
    displayNavItems();
    // Set initial state
    switchTab('content');
    resetNavForm();
}

function attachEventListeners() {
    dom.logoutButton.addEventListener('click', () => signOut(auth));
    dom.adminTabs.addEventListener('click', (e) => { e.preventDefault(); if (e.target.classList.contains('tab-link')) switchTab(e.target.dataset.tab); });
    dom.modalCancelBtn.addEventListener('click', () => dom.editModal.classList.add('hidden'));
    dom.modalForm.addEventListener('submit', handleModalFormSubmit);

    // Event delegation for dynamically created content
    dom.blocksContainer.addEventListener('click', handleBlockActions);
    dom.policiesTableContainer.addEventListener('click', handlePoliciesTableClick);
    dom.navItemsTableContainer.addEventListener('click', handleNavTableClick);

    // Static elements
    dom.addPolicyBtn.addEventListener('click', () => openEditModal({ type: 'policy' }));
    dom.navItemForm.addEventListener('submit', handleNavFormSubmit);
    dom.cancelNavEditBtn.addEventListener('click', resetNavForm);

    // Add Block listeners
    dom.addBlockBtn.addEventListener('click', () => dom.addBlockDropdown.classList.toggle('hidden'));
    dom.addBlockDropdown.addEventListener('click', handleAddBlockClick);
    window.addEventListener('click', (e) => {
        if (!dom.addBlockBtn.parentElement.contains(e.target)) {
            dom.addBlockDropdown.classList.add('hidden');
        }
    });
}


// --- TAB & MODAL MANAGEMENT ---
function switchTab(tabName) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('.tab-link').forEach(l => {
        l.classList.remove('active-tab', 'border-teal-500', 'text-teal-600');
        l.classList.add('border-transparent', 'text-gray-500');
    });
    const panel = document.getElementById(`tab-${tabName}`);
    if (panel) panel.classList.remove('hidden');
    const link = document.querySelector(`.tab-link[data-tab='${tabName}']`);
    if (link) link.classList.add('active-tab', 'border-teal-500', 'text-teal-600');
}

async function openEditModal({ type, id = null }) {
    let data = {};
    let collectionName;

    if (type === 'policy') {
        collectionName = 'policies';
    } else {
        collectionName = 'home_page_blocks';
        if (type === 'hero' || type === 'about') {
            collectionName = 'content';
            id = 'home_page';
        }
    }

    if (id) {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            data = docSnap.data();
        }
    }

    currentEditContext = { type, id, data, collectionName };
    const titleAction = id ? 'Edit' : 'Create New';
    dom.modalTitle.textContent = `${titleAction} ${type.replace(/_/g, ' ')}`;
    buildEditForm(type, data);
    dom.editModal.classList.remove('hidden');
}


// --- DYNAMIC FORM & SUBMIT LOGIC ---
function buildEditForm(type, data) {
    let fieldsHTML = '';
    const content = (type === 'hero' || type === 'about') ? data : data.content || {};

    switch (type) {
        case 'policy':
             fieldsHTML = `<div><label for="modal-title-input" class="block font-medium text-gray-700">Title</label><input id="modal-title-input" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" type="text" value="${data.title || ''}" required></div><div><div class="flex justify-between items-center mb-1"><label class="block font-medium text-gray-700">Content</label><button type="button" id="toggle-html-btn" class="text-sm text-blue-600 hover:underline">Edit HTML</button></div><div id="modal-quill-editor" style="height:250px;"></div><textarea id="modal-html-editor" class="hidden mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" style="height: 250px; font-family: monospace;"></textarea></div>`;
            break;
        case 'hero':
            fieldsHTML = `<div><label for="f-title1" class="block font-medium text-gray-700">Title 1</label><input id="f-title1" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" type="text" value="${content.hero_title_part1 || ''}"></div><div><label for="f-title2" class="block font-medium text-gray-700">Title 2 (Colored)</label><input id="f-title2" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" type="text" value="${content.hero_title_part2 || ''}"></div><div><label for="f-subtitle" class="block font-medium text-gray-700">Subtitle</label><textarea id="f-subtitle" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">${content.hero_subtitle || ''}</textarea></div>`;
            break;
        case 'about':
             fieldsHTML = `<div><label for="f-mission" class="block font-medium text-gray-700">Mission</label><textarea id="f-mission" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">${content.our_mission_text || ''}</textarea></div>`;
            break;
        case 'resources': case 'contact':
            fieldsHTML = `<div><label for="f-title" class="block font-medium text-gray-700">Title</label><input id="f-title" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" type="text" value="${content.title || ''}"></div>`;
            break;
    }
    dom.modalFormFields.innerHTML = fieldsHTML;

    if (type === 'policy') {
        if (quill) quill = null;
        quill = new Quill('#modal-quill-editor', { theme: 'snow' });
        if (data.content) quill.root.innerHTML = data.content;
        document.getElementById('toggle-html-btn').addEventListener('click', toggleHtmlEditor);
    }
}


function toggleHtmlEditor() {
    const quillContainer = document.querySelector('#modal-quill-editor').parentElement;
    const htmlEditor = document.getElementById('modal-html-editor');
    const toggleBtn = document.getElementById('toggle-html-btn');

    if (quillContainer.classList.contains('hidden')) {
        quill.root.innerHTML = htmlEditor.value;
        quillContainer.classList.remove('hidden');
        htmlEditor.classList.add('hidden');
        toggleBtn.textContent = 'Edit HTML';
    } else {
        htmlEditor.value = quill.root.innerHTML;
        quillContainer.classList.add('hidden');
        htmlEditor.classList.remove('hidden');
        toggleBtn.textContent = 'Back to Visual Editor';
    }
}

async function handleModalFormSubmit(e) {
    e.preventDefault();
    const { type, id, data: originalData, collectionName } = currentEditContext;
    let dataToSave;

    try {
        switch (type) {
            case 'policy':
                const htmlEditor = document.getElementById('modal-html-editor');
                const isHtmlMode = !htmlEditor.classList.contains('hidden');
                dataToSave = { title: dom.modalForm.elements['modal-title-input'].value, content: isHtmlMode ? htmlEditor.value : quill.root.innerHTML };
                break;
            case 'hero':
                dataToSave = {
                    ...originalData,
                    hero_title_part1: dom.modalForm.elements['f-title1'].value,
                    hero_title_part2: dom.modalForm.elements['f-title2'].value,
                    hero_subtitle: dom.modalForm.elements['f-subtitle'].value
                };
                break;
            case 'about':
                dataToSave = {
                    ...originalData,
                    our_mission_text: dom.modalForm.elements['f-mission'].value,
                };
                break;
            case 'resources': case 'contact':
                dataToSave = { ...originalData, content: { title: dom.modalForm.elements['f-title'].value }};
                break;
        }

        const docRef = id ? doc(db, collectionName, id) : doc(collection(db, collectionName));
        await setDoc(docRef, dataToSave, { merge: true });

        dom.editModal.classList.add('hidden');
        if (type === 'policy') displayPolicies();
        else displayHomePageBlocks();
    } catch (err) {
        console.error(`Error saving ${type}:`, err);
        alert(`Error: Could not save ${type}.`);
    }
}


// --- DATA DISPLAY & ACTIONS ---

async function displayHomePageBlocks() {
    const q = query(collection(db, "home_page_blocks"), orderBy("order"));
    const snapshot = await getDocs(q);
    const blocks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const availableBlocks = ['hero', 'about', 'resources', 'contact'];
    const existingBlockTypes = blocks.map(b => b.type);
    const blocksToAdd = availableBlocks.filter(b => !existingBlockTypes.includes(b));

    dom.addBlockDropdown.innerHTML = blocksToAdd.map(type =>
        `<a href="#" data-type="${type}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">${type.charAt(0).toUpperCase() + type.slice(1)}</a>`
    ).join('') || `<p class="px-4 py-2 text-sm text-gray-500">All blocks added.</p>`;

    dom.blocksContainer.innerHTML = blocks.map((block, index) => `
        <div class="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
            <div>
                <p class="font-bold text-lg capitalize">${block.type.replace(/_/g, ' ')}</p>
                <p class="text-sm text-gray-500">Order: ${block.order}</p>
            </div>
            <div>
                <button ${index === 0 ? 'disabled' : ''} data-id="${block.id}" data-order="${block.order}" data-direction="up" class="move-block-btn p-2 rounded-full hover:bg-gray-200 disabled:opacity-50" title="Move Up">▲</button>
                <button ${index === blocks.length - 1 ? 'disabled' : ''} data-id="${block.id}" data-order="${block.order}" data-direction="down" class="move-block-btn p-2 rounded-full hover:bg-gray-200 disabled:opacity-50" title="Move Down">▼</button>
                <button data-id="${block.id}" data-type="${block.type}" class="edit-block-btn text-blue-600 hover:underline ml-4">Edit</button>
                <button data-id="${block.id}" class="delete-block-btn text-red-600 hover:underline ml-4">Delete</button>
            </div>
        </div>
    `).join('') || '<p class="text-gray-500">No content blocks found. Use the "+ Add Block" button to add a section.</p>';
}

async function handleAddBlockClick(e) {
    e.preventDefault();
    const type = e.target.dataset.type;
    if (!type) return;

    const q = query(collection(db, "home_page_blocks"), orderBy("order", "desc"));
    const snapshot = await getDocs(q);
    const lastOrder = snapshot.empty ? 0 : snapshot.docs[0].data().order;

    const newBlock = { type: type, order: lastOrder + 1, content: {} };
    if (type !== 'hero' && type !== 'about') {
        newBlock.content = { title: `New ${type} Section` };
    }

    try {
        await addDoc(collection(db, "home_page_blocks"), newBlock);
        await displayHomePageBlocks();
        dom.addBlockDropdown.classList.add('hidden');
    } catch (error) {
        console.error("Error adding new block:", error);
    }
}

async function handleBlockActions(e) {
    const target = e.target.closest('button');
    if (!target) return;
    const id = target.dataset.id;

    if (target.classList.contains('edit-block-btn')) {
        openEditModal({ type: target.dataset.type, id });
    }
    if (target.classList.contains('delete-block-btn')) {
        if (confirm('Are you sure you want to delete this block? This cannot be undone.')) {
            await deleteDoc(doc(db, "home_page_blocks", id));
            await displayHomePageBlocks();
        }
    }
    if (target.classList.contains('move-block-btn')) {
        const direction = target.dataset.direction;
        const currentOrder = parseInt(target.dataset.order, 10);
        const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;

        const q = query(collection(db, "home_page_blocks"), orderBy("order"));
        const snapshot = await getDocs(q);
        const blocks = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        const currentBlock = blocks.find(b => b.order === currentOrder);
        const swapBlock = blocks.find(b => b.order === newOrder);

        if (!currentBlock || !swapBlock) return;

        try {
            await runTransaction(db, async (transaction) => {
                transaction.update(doc(db, "home_page_blocks", currentBlock.id), { order: newOrder });
                transaction.update(doc(db, "home_page_blocks", swapBlock.id), { order: currentOrder });
            });
            await displayHomePageBlocks();
        } catch (error) {
            console.error("Error reordering blocks: ", error);
        }
    }
}

// --- INQUIRIES ---
async function displayInquiries() {
    const q = query(collection(db, "inquiries"), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    const container = dom.inquiriesContainer;
    if (snapshot.empty) {
        container.innerHTML = '<p class="text-gray-500">No inquiries found.</p>';
        return;
    }
    let tableHTML = `<table class="min-w-full bg-white text-sm"><thead><tr class="text-left"><th class="py-2 px-4 border-b">Date</th><th class="py-2 px-4 border-b">Name</th><th class="py-2 px-4 border-b">Email</th><th class="py-2 px-4 border-b">Message</th></tr></thead><tbody>`;
    snapshot.forEach(doc => {
        const inquiry = doc.data();
        const date = inquiry.timestamp ? inquiry.timestamp.toDate().toLocaleString() : 'N/A';
        tableHTML += `<tr class="hover:bg-gray-50"><td class="py-2 px-4 border-b align-top">${date}</td><td class="py-2 px-4 border-b align-top">${inquiry.name}</td><td class="py-2 px-4 border-b align-top"><a href="mailto:${inquiry.email}" class="text-teal-600 hover:underline">${inquiry.email}</a></td><td class="py-2 px-4 border-b align-top whitespace-pre-wrap">${inquiry.message}</td></tr>`;
    });
    container.innerHTML = tableHTML + '</tbody></table>';
}

// --- REFERRALS (NEW) ---
async function displayReferrals() {
    const q = query(collection(db, "referrals"), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    const container = dom.referralsContainer;

    if (snapshot.empty) {
        container.innerHTML = '<p class="text-gray-500">No referrals found.</p>';
        return;
    }

    let html = `<div class="space-y-4">`;
    snapshot.forEach(doc => {
        const ref = doc.data();
        const date = ref.timestamp ? ref.timestamp.toDate().toLocaleString() : 'N/A';
        const consentText = ref.hasConsent ? '<span class="text-green-600 font-bold">Yes</span>' : '<span class="text-red-600 font-bold">No</span>';

        html += `
            <div class="bg-gray-50 border rounded-lg p-4">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p class="font-bold text-gray-500">Date</p>
                        <p>${date}</p>
                    </div>
                    <div>
                        <p class="font-bold text-gray-500">Referred Child</p>
                        <p>${ref.childName} (Age: ${ref.childAge})</p>
                    </div>
                    <div>
                        <p class="font-bold text-gray-500">Referrer</p>
                        <p>${ref.referrerName} (<a href="mailto:${ref.referrerEmail}" class="text-teal-600 hover:underline">${ref.referrerEmail}</a>)</p>
                        <p class="text-xs text-gray-500">(${ref.referrerRelationship})</p>
                    </div>
                    <div>
                        <p class="font-bold text-gray-500">Consent Obtained</p>
                        <p>${consentText}</p>
                    </div>
                </div>
                <div class="mt-4 pt-4 border-t">
                    <p class="font-bold text-gray-500 text-sm">Reason for Referral</p>
                    <p class="text-gray-800 whitespace-pre-wrap mt-1">${ref.referralReason}</p>
                </div>
            </div>
        `;
    });
    container.innerHTML = html + `</div>`;
}

// --- POLICIES ---
async function displayPolicies() {
    const q = query(collection(db, "policies"), orderBy("title"));
    const snapshot = await getDocs(q);
    const container = dom.policiesTableContainer;
    if (snapshot.empty) {
        container.innerHTML = '<p class="text-gray-500">No policies found. Click "Add New Policy" to create one.</p>';
        return;
    }
    let tableHTML = `<table class="min-w-full bg-white text-sm"><thead><tr class="text-left"><th class="py-2 px-4 border-b">Policy Title</th><th class="py-2 px-4 border-b text-right">Actions</th></tr></thead><tbody>`;
    snapshot.forEach(doc => {
        const policy = { id: doc.id, ...doc.data() };
        tableHTML += `<tr><td class="py-2 px-4 border-b">${policy.title}</td><td class="py-2 px-4 border-b text-right"><button class="edit-policy-btn text-blue-600 hover:underline" data-id="${policy.id}">Edit</button><button class="delete-policy-btn text-red-600 hover:underline ml-4" data-id="${policy.id}">Delete</button></td></tr>`;
    });
    container.innerHTML = tableHTML + '</tbody></table>';
}

async function handlePoliciesTableClick(e) {
    const target = e.target.closest('button');
    if (!target) return;
    const id = target.dataset.id;
    if (target.classList.contains('edit-policy-btn')) {
        openEditModal({ type: 'policy', id });
    }
    if (target.classList.contains('delete-policy-btn')) {
        if (confirm('Are you sure you want to delete this policy?')) {
            await deleteDoc(doc(db, "policies", id));
            await displayPolicies();
        }
    }
}

// --- NAVIGATION ---
async function displayNavItems() {
    const q = query(collection(db, "navigation"), orderBy("order"));
    const snapshot = await getDocs(q);
    const container = dom.navItemsTableContainer;
    let tableHTML = `<table class="min-w-full bg-white text-sm"><thead><tr class="text-left"><th class="py-2 px-4 border-b">Order</th><th class="py-2 px-4 border-b">Text</th><th class="py-2 px-4 border-b">URL</th><th class="py-2 px-4 border-b text-right">Actions</th></tr></thead><tbody>`;
    if (snapshot.empty) {
        tableHTML += `<tr><td colspan="4" class="text-center py-4 text-gray-500">No navigation items found.</td></tr>`;
    } else {
        snapshot.forEach(doc => {
            const item = { id: doc.id, ...doc.data() };
            tableHTML += `<tr><td class="py-2 px-4 border-b">${item.order}</td><td class="py-2 px-4 border-b">${item.text}</td><td class="py-2 px-4 border-b">${item.url}</td><td class="py-2 px-4 border-b text-right"><button class="edit-nav-btn text-blue-600 hover:underline" data-id="${item.id}">Edit</button><button class="delete-nav-btn text-red-600 hover:underline ml-4" data-id="${item.id}">Delete</button></td></tr>`;
        });
    }
    container.innerHTML = tableHTML + '</tbody></table>';
}

function resetNavForm() {
    dom.navItemForm.reset();
    document.getElementById('nav-item-id').value = '';
    document.getElementById('nav-form-title').textContent = 'Add New Menu Item';
    dom.cancelNavEditBtn.classList.add('hidden');
}

async function handleNavFormSubmit(e) {
    e.preventDefault();
    const navId = document.getElementById('nav-item-id').value;
    const data = {
        text: document.getElementById('nav-item-text').value,
        url: document.getElementById('nav-item-url').value,
        order: Number(document.getElementById('nav-item-order').value)
    };
    const docRef = navId ? doc(db, "navigation", navId) : doc(collection(db, "navigation"));
    await setDoc(docRef, data);
    resetNavForm();
    await displayNavItems();
}

async function handleNavTableClick(e) {
    const target = e.target.closest('button');
    if (!target) return;
    const id = target.dataset.id;
    if (target.classList.contains('edit-nav-btn')) {
        const docRef = doc(db, "navigation", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const item = docSnap.data();
            document.getElementById('nav-item-id').value = docSnap.id;
            document.getElementById('nav-item-text').value = item.text;
            document.getElementById('nav-item-url').value = item.url;
            document.getElementById('nav-item-order').value = item.order;
            document.getElementById('nav-form-title').textContent = 'Edit Menu Item';
            dom.cancelNavEditBtn.classList.remove('hidden');
        }
    }
    if (target.classList.contains('delete-nav-btn')) {
        if (confirm('Are you sure you want to delete this menu item?')) {
            await deleteDoc(doc(db, "navigation", id));
            await displayNavItems();
        }
    }
}