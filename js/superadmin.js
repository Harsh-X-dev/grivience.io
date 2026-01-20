import API from './api.js';
import Core from './core.js';
import CaseSystem from './case.js';

/**
 * Super Admin Dashboard Logic
 */

const SuperAdminApp = {
    currentCaseId: null,
    currentAdminId: null,
    currentAdminName: null,
    confirmCallback: null,

    // ===== TOAST NOTIFICATION =====
    showToast: (title, message, type = 'success') => {
        const toast = document.getElementById('toast');
        const toastIcon = document.getElementById('toast-icon');
        const toastTitle = document.getElementById('toast-title');
        const toastMessage = document.getElementById('toast-message');

        if(!toast) return;

        toastTitle.innerText = title;
        toastMessage.innerText = message;

        if(type === 'success') {
            toastIcon.className = 'w-10 h-10 rounded-full flex items-center justify-center text-lg bg-green-100 text-green-600';
            toastIcon.innerText = '✓';
        } else if(type === 'error') {
            toastIcon.className = 'w-10 h-10 rounded-full flex items-center justify-center text-lg bg-red-100 text-red-600';
            toastIcon.innerText = '✕';
        } else if(type === 'warning') {
            toastIcon.className = 'w-10 h-10 rounded-full flex items-center justify-center text-lg bg-yellow-100 text-yellow-600';
            toastIcon.innerText = '⚠';
        }

        toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
        toast.classList.add('translate-y-0', 'opacity-100');

        setTimeout(() => SuperAdminApp.hideToast(), 4000);
    },

    hideToast: () => {
        const toast = document.getElementById('toast');
        if(toast) {
            toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
            toast.classList.remove('translate-y-0', 'opacity-100');
        }
    },

    // ===== CONFIRM DIALOG =====
    showConfirm: (title, message, callback) => {
        const modal = document.getElementById('confirm-modal');
        const confirmTitle = document.getElementById('confirm-title');
        const confirmMessage = document.getElementById('confirm-message');

        if(!modal) return;

        confirmTitle.innerText = title;
        confirmMessage.innerText = message;
        SuperAdminApp.confirmCallback = callback;

        modal.style.display = 'flex';
        modal.classList.remove('hidden');
    },

    hideConfirm: () => {
        const modal = document.getElementById('confirm-modal');
        if(modal) {
            modal.style.display = 'none';
            modal.classList.add('hidden');
        }
        SuperAdminApp.confirmCallback = null;
    },

    // ===== INIT =====
    init: () => {
        Core.log("Initializing SuperAdmin Dashboard");
        const user = API.getCurrentUser();
        if(!user) return;

        SuperAdminApp.loadEscalatedCases();
        SuperAdminApp.loadAllCases();

        // Bind Back Button
        const btnBack = document.getElementById('btn-back-to-escalated');
        if(btnBack) btnBack.onclick = () => Core.navTo('escalated');

        // Bind Chat Send
        const btnChatSend = document.getElementById('btn-chat-send');
        if(btnChatSend) {
            btnChatSend.onclick = (e) => {
                e.preventDefault();
                SuperAdminApp.sendMessage();
            };
        }

        // Bind Add Admin Button
        const btnAddAdmin = document.getElementById('btn-add-new-admin');
        if(btnAddAdmin) btnAddAdmin.onclick = () => SuperAdminApp.showAddAdminModal();

        // Bind Add Admin Modal Buttons
        const btnCancelAdmin = document.getElementById('btn-cancel-admin-modal');
        if(btnCancelAdmin) btnCancelAdmin.onclick = () => SuperAdminApp.hideAddAdminModal();

        const btnCreateAdmin = document.getElementById('btn-create-admin-modal');
        if(btnCreateAdmin) btnCreateAdmin.onclick = () => SuperAdminApp.createAdmin();

        // Bind Resolve Case Button
        const btnResolve = document.getElementById('btn-resolve-case');
        if(btnResolve) btnResolve.onclick = () => SuperAdminApp.handleResolveCase();

        // Bind Change Password Button
        const btnChangePassword = document.getElementById('btn-change-password');
        if(btnChangePassword) btnChangePassword.onclick = () => SuperAdminApp.showPasswordModal();

        // Bind Password Modal Buttons
        const btnPasswordCancel = document.getElementById('btn-password-cancel');
        if(btnPasswordCancel) btnPasswordCancel.onclick = () => SuperAdminApp.hidePasswordModal();

        const btnPasswordConfirm = document.getElementById('btn-password-confirm');
        if(btnPasswordConfirm) btnPasswordConfirm.onclick = () => SuperAdminApp.confirmPasswordChange();

        // Bind Edit Admin Modal Buttons
        const btnEditAdminCancel = document.getElementById('btn-edit-admin-cancel');
        if(btnEditAdminCancel) btnEditAdminCancel.onclick = () => SuperAdminApp.hideEditAdminModal();

        const btnEditAdminConfirm = document.getElementById('btn-edit-admin-confirm');
        if(btnEditAdminConfirm) btnEditAdminConfirm.onclick = () => SuperAdminApp.confirmEditAdmin();

        // Bind Confirm Modal
        const btnConfirmNo = document.getElementById('btn-confirm-no');
        if(btnConfirmNo) btnConfirmNo.onclick = () => SuperAdminApp.hideConfirm();

        const btnConfirmYes = document.getElementById('btn-confirm-yes');
        if(btnConfirmYes) {
            btnConfirmYes.onclick = () => {
                if(SuperAdminApp.confirmCallback) SuperAdminApp.confirmCallback();
                SuperAdminApp.hideConfirm();
            };
        }

        // Bind Toast Close
        const toastClose = document.getElementById('toast-close');
        if(toastClose) toastClose.onclick = () => SuperAdminApp.hideToast();

        // Bind Admin Card Buttons
        SuperAdminApp.bindAdminCardButtons();
    },

    loadEscalatedCases: () => {
        const cases = CaseSystem.getAll().filter(c => c.priority === 'Critical' || c.status === 'Escalated');
        const tbody = document.getElementById('case-list-escalated');
        
        if (tbody) {
            if(cases.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500">No escalated cases.</td></tr>`;
                return;
            }

            tbody.innerHTML = cases.map(c => `
                <tr class="hover:bg-gray-50 transition cursor-pointer" data-case-id="${c.id}">
                    <td class="px-6 py-4 font-mono font-bold text-gray-500">${c.id}</td>
                    <td class="px-6 py-4 font-bold text-black">${c.subject}</td>
                    <td class="px-6 py-4">${c.department}</td>
                    <td class="px-6 py-4"><span class="bg-red-100 text-red-600 px-2 py-1 rounded text-[10px] font-bold">${c.priority.toUpperCase()}</span></td>
                    <td class="px-6 py-4 text-right"><button class="bg-black text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-gray-800 manage-btn" data-id="${c.id}">Manage</button></td>
                </tr>
            `).join('');

            SuperAdminApp.bindTableClicks(tbody, true);
        }
    },

    loadAllCases: () => {
        const cases = CaseSystem.getAll();
        const tbody = document.getElementById('case-list');
        
        if (tbody) {
            if(cases.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500">No cases found.</td></tr>`;
                return;
            }

            // Read-only view
            tbody.innerHTML = cases.map(c => `
                <tr class="hover:bg-gray-50/50 transition" data-case-id="${c.id}">
                    <td class="px-6 py-4 font-mono font-bold text-gray-500">${c.id}</td>
                    <td class="px-6 py-4 font-medium text-black">${c.subject}</td>
                    <td class="px-6 py-4">${c.department}</td>
                    <td class="px-6 py-4"><span class="${CaseSystem.getStatusColor(c.status)} bg-gray-100 px-2 py-1 rounded text-[10px] font-bold">${c.status.toUpperCase()}</span></td>
                    <td class="px-6 py-4 text-right text-xs text-gray-400">${c.priority}</td>
                </tr>
            `).join('');
        }
    },

    bindTableClicks: (tbody, allowManage = false) => {
        if(!allowManage) return;

        tbody.querySelectorAll('tr').forEach(row => {
            row.onclick = (e) => {
                if(e.target.classList.contains('manage-btn')) return;
                SuperAdminApp.openCase(row.dataset.caseId);
            };
        });

        tbody.querySelectorAll('.manage-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                SuperAdminApp.openCase(btn.dataset.id);
            };
        });
    },

    bindAdminCardButtons: () => {
        document.querySelectorAll('.btn-edit-admin').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const card = btn.closest('.admin-card');
                SuperAdminApp.currentAdminId = card?.dataset?.adminId;
                SuperAdminApp.currentAdminName = card?.dataset?.adminName || 'Admin';
                SuperAdminApp.showEditAdminModal();
            };
        });

        document.querySelectorAll('.btn-delete-admin').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const card = btn.closest('.admin-card');
                const adminId = card?.dataset?.adminId;
                const adminName = card?.dataset?.adminName || 'Admin';
                SuperAdminApp.handleDeleteAdmin(adminId, adminName);
            };
        });
    },

    openCase: (id) => {
        const c = CaseSystem.getById(id);
        if(!c) return;

        SuperAdminApp.currentCaseId = id;

        const detailId = document.getElementById('detail-id');
        if(detailId) detailId.innerText = '#' + c.id;
        
        const detailTitle = document.getElementById('detail-title');
        if(detailTitle) detailTitle.innerText = c.subject;

        const chatContainer = document.getElementById('chat-thread');
        CaseSystem.renderChat(c.messages, chatContainer);

        Core.navTo('case-detail');
    },

    sendMessage: () => {
        const input = document.getElementById('input-chat-reply');
        const text = input?.value?.trim();
        if(!text || !SuperAdminApp.currentCaseId) return;

        CaseSystem.addMessage(SuperAdminApp.currentCaseId, 'SuperAdmin', text);
        const c = CaseSystem.getById(SuperAdminApp.currentCaseId);
        const chatContainer = document.getElementById('chat-thread');
        CaseSystem.renderChat(c.messages, chatContainer);
        input.value = '';
        SuperAdminApp.showToast('Message Sent', 'Your reply has been sent.');
    },

    handleResolveCase: () => {
        SuperAdminApp.showConfirm('Resolve Case?', 'Mark this case as resolved?', () => SuperAdminApp.resolveCase());
    },

    resolveCase: () => {
        if(SuperAdminApp.currentCaseId) {
            const c = CaseSystem.getById(SuperAdminApp.currentCaseId);
            if(c) {
                c.status = 'Resolved';
                SuperAdminApp.showToast('Case Resolved', 'Marked as resolved.');
                Core.navTo('escalated');
                SuperAdminApp.loadEscalatedCases();
                SuperAdminApp.loadAllCases();
            }
        }
    },

    // ===== ADD ADMIN MODAL =====
    showAddAdminModal: () => {
        const modal = document.getElementById('add-admin-modal');
        if(modal) modal.classList.add('active');
    },

    hideAddAdminModal: () => {
        const modal = document.getElementById('add-admin-modal');
        if(modal) modal.classList.remove('active');
    },

    createAdmin: () => {
        const name = document.getElementById('input-admin-name')?.value?.trim();
        const email = document.getElementById('input-admin-email')?.value?.trim();
        const dept = document.getElementById('input-admin-dept')?.value;

        if(!name || !email) {
            SuperAdminApp.showToast('Missing Fields', 'Please fill all required fields.', 'error');
            return;
        }

        SuperAdminApp.showToast('Admin Created', `"${name}" added to ${dept} department.`);
        SuperAdminApp.hideAddAdminModal();
        
        // Clear fields
        document.getElementById('input-admin-name').value = '';
        document.getElementById('input-admin-email').value = '';
    },

    // ===== EDIT ADMIN MODAL =====
    showEditAdminModal: () => {
        const modal = document.getElementById('edit-admin-modal');
        const subtitle = document.getElementById('edit-admin-subtitle');
        if(subtitle) subtitle.innerText = `Update details for ${SuperAdminApp.currentAdminName}.`;
        if(modal) { modal.style.display = 'flex'; modal.classList.remove('hidden'); }
    },

    hideEditAdminModal: () => {
        const modal = document.getElementById('edit-admin-modal');
        if(modal) { modal.style.display = 'none'; modal.classList.add('hidden'); }
    },

    confirmEditAdmin: () => {
        SuperAdminApp.showToast('Admin Updated', `${SuperAdminApp.currentAdminName}'s profile updated.`);
        SuperAdminApp.hideEditAdminModal();
    },

    handleDeleteAdmin: (adminId, adminName) => {
        SuperAdminApp.showConfirm(
            'Delete Admin?',
            `Are you sure you want to remove "${adminName}"?`,
            () => SuperAdminApp.deleteAdmin(adminId, adminName)
        );
    },

    deleteAdmin: (adminId, adminName) => {
        const card = document.querySelector(`.admin-card[data-admin-id="${adminId}"]`);
        if(card) card.remove();
        SuperAdminApp.showToast('Admin Removed', `"${adminName}" has been deleted.`);
    },

    // ===== PASSWORD MODAL =====
    showPasswordModal: () => {
        const modal = document.getElementById('password-modal');
        if(modal) { modal.style.display = 'flex'; modal.classList.remove('hidden'); }
    },

    hidePasswordModal: () => {
        const modal = document.getElementById('password-modal');
        if(modal) { modal.style.display = 'none'; modal.classList.add('hidden'); }
    },

    confirmPasswordChange: () => {
        const current = document.getElementById('input-current-password')?.value;
        const newPass = document.getElementById('input-new-password')?.value;
        const confirm = document.getElementById('input-confirm-password')?.value;

        if(!current || !newPass || !confirm) {
            SuperAdminApp.showToast('Missing Fields', 'Please fill all fields.', 'error');
            return;
        }
        if(newPass !== confirm) {
            SuperAdminApp.showToast('Mismatch', 'Passwords do not match.', 'error');
            return;
        }
        if(newPass.length < 6) {
            SuperAdminApp.showToast('Too Short', 'Min 6 characters.', 'error');
            return;
        }

        SuperAdminApp.showToast('Password Changed', 'Updated successfully.');
        SuperAdminApp.hidePasswordModal();
        document.getElementById('input-current-password').value = '';
        document.getElementById('input-new-password').value = '';
        document.getElementById('input-confirm-password').value = '';
    }
};

window.SuperAdminApp = SuperAdminApp;

if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', SuperAdminApp.init);
} else {
    SuperAdminApp.init();
}
