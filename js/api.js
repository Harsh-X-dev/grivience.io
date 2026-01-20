/**
 * Mock API Module
 * Simulates backend interaction and authentication.
 */

const MOCK_USERS = [
    {
        id: "U-1001",
        name: "Demo Student",
        email: "student@demo.com",
        password: "demo",
        role: "student",
        department: "Computer Science",
        phone: "+91 98765 43210"
    },
    {
        id: "U-2001",
        name: "Warden Smith",
        email: "admin@demo.com",
        password: "demo",
        role: "admin",
        department: "Hostel"
    },
    {
        id: "U-3001",
        name: "Dr. A. Sharma",
        email: "super@demo.com",
        password: "demo",
        role: "superadmin"
    }
];

const API = {
    /**
     * Simulates a login request
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<{success: boolean, user?: object, message?: string}>}
     */
    login: async (email, password) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = MOCK_USERS.find(u => u.email === email && u.password === password);
                if (user) {
                    API.saveSession(user);
                    resolve({ success: true, user });
                } else {
                    resolve({ success: false, message: "Invalid credentials" });
                }
            }, 500); // Simulate network delay
        });
    },

    /**
     * Simulates a registration request
     * @param {object} userData 
     * @returns {Promise<{success: boolean, user?: object, message?: string}>}
     */
    register: async (userData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const existing = MOCK_USERS.find(u => u.email === userData.email);
                if (existing) {
                    resolve({ success: false, message: "Email already exists" });
                } else {
                    const newUser = {
                        id: `U-${Math.floor(Math.random() * 10000)}`,
                        role: 'student', // Default to student
                        ...userData
                    };
                    // In a real app, we'd add to MOCK_USERS, but persistence across reloads 
                    // would require localStorage for the user list too. 
                    // For this demo, we'll just log them in.
                    API.saveSession(newUser);
                    resolve({ success: true, user: newUser });
                }
            }, 500);
        });
    },

    /**
     * logout the current user
     */
    logout: () => {
        localStorage.removeItem('grievance_session');
    },

    /**
     * Get the current session
     * @returns {object|null}
     */
    getSession: () => {
        const session = localStorage.getItem('grievance_session');
        return session ? JSON.parse(session) : null;
    },

    /**
     * Save user session
     * @param {object} user 
     */
    saveSession: (user) => {
        localStorage.setItem('grievance_session', JSON.stringify(user));
    },

    /**
     * Get user details (simulated)
     */
    getCurrentUser: () => {
        return API.getSession();
    },
    
    /**
     * DEBUG: Helper to check if debug mode is on
     */
    log: (msg, data = '') => {
        if(window.ANTIGRAVITY_DEBUG) {
            console.log(`[API] ${msg}`, data);
        }
    }
};

// Expose API globally for easier access in console debugging
window.API = API;

export default API;
