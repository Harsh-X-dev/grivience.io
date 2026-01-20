import API from './api.js';
import Core from './core.js';
import CaseSystem from './case.js';

/**
 * Admin Dashboard Logic
 */

const AdminApp = {
    currentCaseId: null,
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

        setTimeout(() => AdminApp.hideToast(), 4000);
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
        AdminApp.confirmCallback = callback;

        modal.style.display = 'flex';
        modal.classList.remove('hidden');
    },

    hideConfirm: () => {
        const modal = document.getElementById('confirm-modal');
        if(modal) {
            modal.style.display = 'none';
            modal.classList.add('hidden');
        }
        AdminApp.confirmCallback = null;
    },

    // ===== INIT =====
    init: () => {
        Core.log("Initializing Admin Dashboard");
        const user = API.getCurrentUser();
        if(!user) return;

        AdminApp.loadDepartmentCases(user.department);
        AdminApp.bindDashboardOpenButtons();

        // Bind Back Button
        const btnBack = document.getElementById('btn-back-to-list');
        if(btnBack) btnBack.onclick = () => Core.navTo('cases');

        // Bind View All Cases button
        const btnViewAll = document.getElementById('btn-view-all-cases');
        if(btnViewAll) btnViewAll.onclick = () => Core.navTo('cases');

        // Bind Chat Send
        const btnChatSend = document.getElementById('btn-chat-send');
        if(btnChatSend) {
            btnChatSend.onclick = (e) => {
                e.preventDefault();
                AdminApp.sendMessage();
            };
        }

        // Bind Quick Action buttons
        const btnEscalate = document.getElementById('btn-action-escalate');
        if(btnEscalate) btnEscalate.onclick = () => AdminApp.showEscalateModal();

        const btnResolve = document.getElementById('btn-action-resolve');
        if(btnResolve) btnResolve.onclick = () => AdminApp.handleResolveCase();

        // Bind Escalate Modal
        const btnEscalateCancel = document.getElementById('btn-escalate-cancel');
        if(btnEscalateCancel) btnEscalateCancel.onclick = () => AdminApp.hideEscalateModal();

        const btnEscalateConfirm = document.getElementById('btn-escalate-confirm');
        if(btnEscalateConfirm) btnEscalateConfirm.onclick = () => AdminApp.confirmEscalation();

        // Bind Status Change Modal
        const btnChangeStatus = document.getElementById('btn-change-status');
        if(btnChangeStatus) btnChangeStatus.onclick = () => AdminApp.showStatusModal();

        const btnStatusCancel = document.getElementById('btn-status-cancel');
        if(btnStatusCancel) btnStatusCancel.onclick = () => AdminApp.hideStatusModal();

        const btnStatusConfirm = document.getElementById('btn-status-confirm');
        if(btnStatusConfirm) btnStatusConfirm.onclick = () => AdminApp.confirmStatusChange();

        // Bind Password Modal
        const btnChangePassword = document.getElementById('btn-change-password');
        if(btnChangePassword) btnChangePassword.onclick = () => AdminApp.showPasswordModal();

        const btnPasswordCancel = document.getElementById('btn-password-cancel');
        if(btnPasswordCancel) btnPasswordCancel.onclick = () => AdminApp.hidePasswordModal();

        const btnPasswordConfirm = document.getElementById('btn-password-confirm');
        if(btnPasswordConfirm) btnPasswordConfirm.onclick = () => AdminApp.confirmPasswordChange();

        // Bind Confirm Modal
        const btnConfirmNo = document.getElementById('btn-confirm-no');
        if(btnConfirmNo) btnConfirmNo.onclick = () => AdminApp.hideConfirm();

        const btnConfirmYes = document.getElementById('btn-confirm-yes');
        if(btnConfirmYes) {
            btnConfirmYes.onclick = () => {
                if(AdminApp.confirmCallback) AdminApp.confirmCallback();
                AdminApp.hideConfirm();
            };
        }

        // Bind Toast Close
        const toastClose = document.getElementById('toast-close');
        if(toastClose) toastClose.onclick = () => AdminApp.hideToast();

        AdminApp.fillProfile(user);
    },

    bindDashboardOpenButtons: () => {
        document.querySelectorAll('.btn-open-case').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                AdminApp.openCase(btn.dataset.id);
            };
        });
    },

    loadDepartmentCases: (dept) => {
        const department = dept || 'Hostel';
        const cases = CaseSystem.getByDepartment(department);
        const tbody = document.getElementById('case-list');
        
        if (tbody) {
            if(cases.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-gray-500">No cases found for ${department} department.</td></tr>`;
                return;
            }

            tbody.innerHTML = cases.map(c => `
                <tr class="hover:bg-gray-50 transition border-b border-gray-100 last:border-0 cursor-pointer" data-case-id="${c.id}">
                    <td class="px-6 py-4 font-mono font-bold text-gray-500">#${c.id}</td>
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">${c.studentName.charAt(0)}</div>
                            <div>
                                <p class="font-bold text-sm text-gray-900">${c.studentName}</p>
                                <p class="text-xs text-gray-400">${c.category || 'Student'}</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 font-medium text-black">${c.subject}</td>
                    <td class="px-6 py-4"><span class="${CaseSystem.getStatusColor(c.status)} bg-gray-100 px-2 py-1 rounded text-[10px] font-bold uppercase">${c.status}</span></td>
                    <td class="px-6 py-4"><span class="${CaseSystem.getPriorityColor(c.priority).replace('border', 'bg').replace('500', '100')} ${CaseSystem.getPriorityColor(c.priority).replace('border', 'text').replace('500', '600')} px-2 py-1 rounded text-[10px] font-bold">${c.priority.toUpperCase()}</span></td>
                    <td class="px-6 py-4"><span class="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Active</span></td>
                    <td class="px-6 py-4 text-right">
                        <button class="bg-black text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-gray-800 manage-btn" data-id="${c.id}">Manage</button>
                    </td>
                </tr>
            `).join('');

            tbody.querySelectorAll('tr').forEach(row => {
                row.onclick = (e) => {
                    if(e.target.classList.contains('manage-btn')) return;
                    AdminApp.openCase(row.dataset.caseId);
                };
            });

            tbody.querySelectorAll('.manage-btn').forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    AdminApp.openCase(btn.dataset.id);
                };
            });
        }
    },

    openCase: (id) => {
        const c = CaseSystem.getById(id);
        if(!c) return;

        AdminApp.currentCaseId = id;

        const detailId = document.getElementById('detail-id');
        if(detailId) detailId.innerText = '#' + c.id;
        
        const detailTitle = document.getElementById('detail-title');
        if(detailTitle) detailTitle.innerText = c.subject;

        const detailDesc = document.getElementById('detail-desc');
        if(detailDesc) detailDesc.innerText = c.description || 'No description provided.';

        const chatContainer = document.getElementById('chat-thread');
        CaseSystem.renderChat(c.messages, chatContainer);

        Core.navTo('case-detail');
    },

    sendMessage: () => {
        const input = document.getElementById('input-chat-reply');
        const text = input?.value?.trim();
        if(!text || !AdminApp.currentCaseId) return;

        CaseSystem.addMessage(AdminApp.currentCaseId, 'Admin', text);
        const c = CaseSystem.getById(AdminApp.currentCaseId);
        const chatContainer = document.getElementById('chat-thread');
        CaseSystem.renderChat(c.messages, chatContainer);
        input.value = '';
        AdminApp.showToast('Message Sent', 'Your reply has been sent.');
    },

    // ===== ESCALATE MODAL =====
    showEscalateModal: () => {
        const modal = document.getElementById('escalate-modal');
        if(modal) { modal.style.display = 'flex'; modal.classList.remove('hidden'); }
    },

    hideEscalateModal: () => {
        const modal = document.getElementById('escalate-modal');
        if(modal) { modal.style.display = 'none'; modal.classList.add('hidden'); }
    },

    confirmEscalation: () => {
        if(AdminApp.currentCaseId) {
            const c = CaseSystem.getById(AdminApp.currentCaseId);
            if(c) {
                c.status = 'Escalated';
                c.priority = 'Critical';
                AdminApp.showToast('Case Escalated', 'Forwarded to higher authority.');
                AdminApp.hideEscalateModal();
                Core.navTo('cases');
                AdminApp.loadDepartmentCases('Hostel');
            }
        }
    },

    handleResolveCase: () => {
        AdminApp.showConfirm('Resolve Case?', 'Mark this case as resolved?', () => AdminApp.resolveCase());
    },

    resolveCase: () => {
        if(AdminApp.currentCaseId) {
            const c = CaseSystem.getById(AdminApp.currentCaseId);
            if(c) {
                c.status = 'Resolved';
                AdminApp.showToast('Case Resolved', 'Marked as resolved.');
                Core.navTo('cases');
                AdminApp.loadDepartmentCases('Hostel');
            }
        }
    },

    // ===== STATUS MODAL =====
    showStatusModal: () => {
        const modal = document.getElementById('status-modal');
        if(modal) { modal.style.display = 'flex'; modal.classList.remove('hidden'); }
    },

    hideStatusModal: () => {
        const modal = document.getElementById('status-modal');
        if(modal) { modal.style.display = 'none'; modal.classList.add('hidden'); }
    },

    confirmStatusChange: () => {
        const newStatus = document.getElementById('select-new-status')?.value;
        const remark = document.getElementById('input-status-remark')?.value?.trim();

        if(!remark) {
            AdminApp.showToast('Remark Required', 'Please add a remark.', 'error');
            return;
        }

        if(AdminApp.currentCaseId) {
            const c = CaseSystem.getById(AdminApp.currentCaseId);
            if(c) {
                c.status = newStatus;
                CaseSystem.addMessage(AdminApp.currentCaseId, 'Admin', `[Status: ${newStatus}] ${remark}`);
                AdminApp.showToast('Status Updated', `Changed to "${newStatus}".`);
                AdminApp.hideStatusModal();
                document.getElementById('input-status-remark').value = '';
                const chatContainer = document.getElementById('chat-thread');
                CaseSystem.renderChat(c.messages, chatContainer);
            }
        }
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
            AdminApp.showToast('Missing Fields', 'Please fill all fields.', 'error');
            return;
        }
        if(newPass !== confirm) {
            AdminApp.showToast('Mismatch', 'Passwords do not match.', 'error');
            return;
        }
        if(newPass.length < 6) {
            AdminApp.showToast('Too Short', 'Min 6 characters.', 'error');
            return;
        }

        AdminApp.showToast('Password Changed', 'Updated successfully.');
        AdminApp.hidePasswordModal();
        document.getElementById('input-current-password').value = '';
        document.getElementById('input-new-password').value = '';
        document.getElementById('input-confirm-password').value = '';
    },

    fillProfile: (user) => {
        const profileName = document.getElementById('admin-profile-name');
        const profileDept = document.getElementById('admin-profile-dept');
        const profileEmail = document.getElementById('admin-profile-email');

        if(profileName) profileName.innerText = user.name || 'Admin User';
        if(profileDept) profileDept.innerText = (user.department || 'General') + ' Department';
        if(profileEmail) profileEmail.innerText = user.email || '';
    }
};

window.AdminApp = AdminApp;

if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', AdminApp.init);
} else {
    AdminApp.init();
}
