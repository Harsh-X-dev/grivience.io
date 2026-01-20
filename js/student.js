import API from './api.js';
import Core from './core.js';
import CaseSystem from './case.js';

/**
 * Student Dashboard Logic
 */

const StudentApp = {
    currentCaseId: null,

    init: () => {
        Core.log("Initializing Student Dashboard");
        
        const user = API.getCurrentUser();
        if(!user) return;

        // 1. Load Statistics (Mock)
        StudentApp.loadStats();

        // 2. Load My Cases
        StudentApp.loadMyCases(user.id);

        // 3. Bind Grievance Form
        const form = document.getElementById('grievance-form');
        if(form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                StudentApp.handleFileGrievance(user);
            });
        }
        
        // 4. Fill Profile Data
        StudentApp.fillProfile(user);

        // 5. Bind Back Button
        const btnBack = document.getElementById('btn-back-to-cases');
        if(btnBack) {
            btnBack.onclick = () => Core.navTo('my-cases');
        }

        // 6. Bind Chat Send
        const chatForm = document.querySelector('#view-case-detail form');
        if(chatForm) {
            chatForm.addEventListener('submit', (e) => {
                e.preventDefault();
                StudentApp.sendMessage();
            });
        }

        // 7. Bind Check buttons in dashboard table
        document.querySelectorAll('[id^="btn-check-"]').forEach(btn => {
            btn.onclick = () => {
                const caseId = btn.id.replace('btn-check-', 'G-');
                StudentApp.openCaseDetail(caseId);
            };
        });

        // 8. Bind View All button
        const btnViewAll = document.getElementById('btn-view-all-update');
        if(btnViewAll) {
            btnViewAll.onclick = () => Core.navTo('my-cases');
        }

        // 9. Bind Cancel button on grievance form
        const btnCancel = document.getElementById('btn-cancel-grievance');
        if(btnCancel) {
            btnCancel.onclick = () => Core.navTo('dashboard');
        }
    },

    loadStats: () => {
        // Future: Update stat cards dynamically
    },

    loadMyCases: (studentId) => {
        const cases = CaseSystem.getByStudent(studentId);
        const container = document.getElementById('case-list');
        
        if (container && container.tagName === 'TBODY') {
            // Render as table rows
            container.innerHTML = cases.map(c => `
                <tr class="hover:bg-gray-50/50 cursor-pointer" data-case-id="${c.id}">
                    <td class="px-6 py-4 font-mono text-xs font-bold">#${c.id}</td>
                    <td class="px-6 py-4 font-medium text-black">${c.subject}</td>
                    <td class="px-6 py-4">${c.category}</td>
                    <td class="px-6 py-4">${new Date(c.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                    <td class="px-6 py-4"><span class="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold">${c.status}</span></td>
                    <td class="px-6 py-4 text-right"><button class="text-xs underline view-case-btn" data-id="${c.id}">View</button></td>
                </tr>
            `).join('');

            // Bind view buttons
            container.querySelectorAll('.view-case-btn').forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    StudentApp.openCaseDetail(btn.dataset.id);
                };
            });

            // Bind row clicks
            container.querySelectorAll('tr').forEach(row => {
                row.onclick = () => StudentApp.openCaseDetail(row.dataset.caseId);
            });
        }
    },

    handleFileGrievance: (user) => {
        const category = document.getElementById('category')?.value || 'General';
        const subject = document.getElementById('input-grievance-subject')?.value || '';
        const description = document.getElementById('input-grievance-description')?.value || '';
        const prioritySelect = document.getElementById('input-grievance-priority');
        let priority = prioritySelect?.value || 'medium';

        if(priority === 'high') priority = 'High';
        else if(priority === 'critical') priority = 'Critical';
        else priority = 'Medium';

        if(!subject.trim()) {
            alert("Please enter a subject.");
            return;
        }

        const newCase = CaseSystem.create({
            category,
            subject,
            description,
            priority,
            studentId: user.id,
            studentName: user.name,
            department: category.split(' ')[0]
        });

        alert("Grievance Filed Successfully! Case ID: " + newCase.id);
        
        // Clear form
        document.getElementById('input-grievance-subject').value = '';
        document.getElementById('input-grievance-description').value = '';
        
        // Refresh List
        StudentApp.loadMyCases(user.id);
        
        // Navigate to list
        Core.navTo('my-cases');
    },

    openCaseDetail: (id) => {
        const c = CaseSystem.getById(id);
        if(!c) {
            console.warn('[StudentApp] Case not found:', id);
            return;
        }

        StudentApp.currentCaseId = id;

        // Populate Detail View
        const detailId = document.getElementById('detail-id');
        const detailTitle = document.getElementById('detail-title');
        
        if(detailId) detailId.innerText = 'Case #' + c.id;
        if(detailTitle) detailTitle.innerText = c.subject + ' • ' + c.category;
        
        // Render Chat
        const chatContainer = document.getElementById('chat-thread');
        CaseSystem.renderChat(c.messages, chatContainer);

        Core.navTo('case-detail');
    },

    sendMessage: () => {
        const input = document.getElementById('input-chat-message');
        const text = input?.value?.trim();
        
        if(!text || !StudentApp.currentCaseId) return;

        CaseSystem.addMessage(StudentApp.currentCaseId, 'Student', text);
        
        // Re-render chat
        const c = CaseSystem.getById(StudentApp.currentCaseId);
        const chatContainer = document.getElementById('chat-thread');
        CaseSystem.renderChat(c.messages, chatContainer);
        
        // Clear input
        input.value = '';
    },
    
    fillProfile: (user) => {
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');
        const profileAvatar = document.getElementById('profile-avatar');
        
        if(profileName) profileName.innerText = user.name;
        if(profileEmail) profileEmail.innerText = user.email || '';
        if(profileAvatar && user.name) {
            const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
            profileAvatar.innerText = initials;
        }
    }
};

// Expose globally for any inline handlers
window.StudentApp = StudentApp;

// Start
if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', StudentApp.init);
} else {
    StudentApp.init();
}

