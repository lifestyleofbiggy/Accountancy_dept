// ===========================================
// GLOBAL INITIALIZATION & ERROR HANDLING
// ===========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded!");
    
    // Set current year
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Initialize auth system
    window.auth = new AuthSystem();
    
    // Check if user is logged in FIRST
    const currentUser = auth.getCurrentUser();
    
    if (currentUser) {
        // User is logged in - hide welcome portal
        document.getElementById('welcome-portal').style.display = 'none';
        
        // Load dashboard (this will handle the hash)
        loadDashboardData(currentUser);
    } else {
        // User not logged in - show welcome portal
        showWelcomePortal();
        
        // Handle welcome portal hash - but only for valid welcome views
        const hash = window.location.hash.replace('#', '');
        console.log('Welcome portal hash:', hash);
        
        // Valid welcome portal views
        const validViews = ['selector', 'login', 'forgot', 'success'];
        
        // Special handling for register - clear it on refresh
        if (hash === 'register') {
            console.log('Register hash detected on refresh - clearing to selector');
            // Clear the register hash
            history.replaceState(null, null, '#selector');
            showView('selector');
        }
        else if (hash && validViews.includes(hash)) {
            showView(hash);
        } else {
            // If hash is any other value (like dashboard hashes), redirect to selector
            if (hash && (hash.startsWith('hod-') || hash.startsWith('student-') || hash === 'dashboard')) {
                history.replaceState(null, null, '#selector');
            }
            showView('selector');
        }
    }

    // Setup form validations
    setupFormValidations();
    updateLoginState();
    
    // Setup sidebar close on outside click
    setTimeout(() => {
        if (typeof setupSidebarCloseOnClickOutside === 'function') setupSidebarCloseOnClickOutside();
        if (typeof setupNavItemCloseSidebar === 'function') setupNavItemCloseSidebar();
        if (typeof setupAdminSidebarCloseOnClickOutside === 'function') setupAdminSidebarCloseOnClickOutside();
    }, 500);
    
    // Add resize listener
    window.addEventListener('resize', function() {
        if (typeof handleResize === 'function') handleResize();
        if (typeof handleAdminResize === 'function') handleAdminResize();
    });
});

// document.addEventListener('DOMContentLoaded', function() {
//     console.log("DOM fully loaded!");
    
//     // Set current year
//     document.getElementById('current-year').textContent = new Date().getFullYear();

//     // Initialize auth system
//     window.auth = new AuthSystem();
    
//     // Check if user is logged in FIRST
//     const currentUser = auth.getCurrentUser();
    
//     if (currentUser) {
//         // User is logged in - hide welcome portal
//         document.getElementById('welcome-portal').style.display = 'none';

//         // Load dashboard (this will handle the hash)
//         loadDashboardData(currentUser);
//         // Check URL hash
//         // const hash = window.location.hash.replace('#', '');
//         // console.log('Initial hash:', hash);
        
//         // Load appropriate dashboard based on user type
//         if (currentUser.userType === 'hod' || currentUser.userType === 'admin' || currentUser.userType === 'staff') {
//             // Show HOD dashboard
//             document.getElementById('hod-dashboard').style.display = 'block';
            
//             // Load HOD data
//             if (window.hodPortal) {
//                 hodPortal.loadHODDashboard();
//             }
//             if (typeof loadHODCourses === 'function') loadHODCourses();
            
//             // Check if hash is for HOD
//             if (hash.startsWith('hod-')) {
//                 const tabName = hash.substring(4);
//                 console.log('Opening HOD tab from hash:', tabName);
                
//                 // Small delay to ensure DOM is ready
//                 setTimeout(() => {
//                     if (window.hodPortal && typeof window.hodPortal.showHODTab === 'function') {
//                         window.hodPortal.showHODTab(tabName);
//                     } else if (typeof showHODTab === 'function') {
//                         showHODTab(tabName);
//                     }
//                 }, 100);
//             } else {
//                 // Default to overview
//                 setTimeout(() => {
//                     if (window.hodPortal && typeof window.hodPortal.showHODTab === 'function') {
//                         window.hodPortal.showHODTab('overview');
//                     } else if (typeof showHODTab === 'function') {
//                         showHODTab('overview');
//                     }
//                 }, 100);
//             }
//         } else {
//             // Show student dashboard
//             document.getElementById('student-dashboard').style.display = 'block';
            
//             // Update student info
//             const studentProfile = auth.getStudentProfile(currentUser.id);
//             document.getElementById('student-name').textContent = studentProfile?.fullName || currentUser.fullName || 'Student';
//             document.getElementById('student-matric').textContent = studentProfile?.matricNumber || currentUser.matricNumber || '21/003/f/002';
//             document.getElementById('student-programme').textContent = studentProfile?.programme || currentUser.programme || 'Accountancy';

//             const avatarImg = document.querySelector('#student-avatar img');
//             if (avatarImg) {
//                 avatarImg.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentProfile.matricNumber || 'Student'}`;
//             }
            
//             if (window.studentPortal) {
//                 studentPortal.loadStudentDashboard();
//             }
//             if (typeof loadRegistrationStatus === 'function') loadRegistrationStatus();
            
//             // Check if hash is for student
//             if (hash.startsWith('student-')) {
//                 const tabName = hash.substring(8);
//                 console.log('Opening student tab from hash:', tabName);
                
//                 setTimeout(() => {
//                     showStudentTab(tabName);
//                 }, 100);
//             } else {
//                 setTimeout(() => {
//                     showStudentTab('dashboard');
//                 }, 100);
//             }
//         }
//     } else {
//         // User not logged in - show welcome portal
//         showWelcomePortal();
        
//         // Handle welcome portal hash
//         const hash = window.location.hash.replace('#', '');
//         if (hash && ['selector', 'login', 'register', 'forgot', 'success'].includes(hash)) {
//             showView(hash);
//         } else {
//             showView('selector');
//         }
//     }

//     // Setup form validations
//     setupFormValidations();
//     updateLoginState();
    
//     // Setup sidebar close on outside click
//     setTimeout(() => {
//         if (typeof setupSidebarCloseOnClickOutside === 'function') setupSidebarCloseOnClickOutside();
//         if (typeof setupNavItemCloseSidebar === 'function') setupNavItemCloseSidebar();
//         if (typeof setupAdminSidebarCloseOnClickOutside === 'function') setupAdminSidebarCloseOnClickOutside();
//     }, 500);
    
//     // Add resize listener
//     window.addEventListener('resize', function() {
//         if (typeof handleResize === 'function') handleResize();
//         if (typeof handleAdminResize === 'function') handleAdminResize();
//     });
// });

// Add error handling
window.addEventListener('error', function(e) {
    console.error('Global error caught:', e.message, e.filename, e.lineno);
});

// Handle browser back/forward buttons
window.addEventListener('popstate', function(event) {
    const hash = window.location.hash.replace('#', '');
    const currentUser = auth.getCurrentUser();
    
    if (currentUser) {
        // User is logged in - handle dashboard navigation
        if (currentUser.userType === 'hod' || currentUser.userType === 'admin' || currentUser.userType === 'staff') {
            // HOD user
            if (hash.startsWith('hod-')) {
                const tabName = hash.substring(4);
                showHODTab(tabName);
            } else {
                showHODTab('overview');
            }
        } else {
            // Student user
            if (hash.startsWith('student-')) {
                const tabName = hash.substring(8);
                showStudentTab(tabName);
            } else {
                showStudentTab('dashboard');
            }
        }
    } else {
        // Not logged in - show welcome portal
        showWelcomePortal();
        
        // Handle welcome portal hash
        const validViews = ['selector', 'login', 'register', 'forgot', 'success'];
        if (hash && validViews.includes(hash)) {
            showView(hash);
        } else {
            showView('selector');
        }
    }
});

// Prevent going back to dashboard after logout
// window.addEventListener('popstate', function(event) {
//     const hash = window.location.hash.replace('#', '');
//     const currentUser = auth.getCurrentUser();
//     if (currentUser) {
//         if (currentUser.userType === 'hod' || currentUser.userType === 'admin' || currentUser.userType === 'staff') {
//             // HOD user
//             if (hash.startsWith('hod-')) {
//                 const tabName = hash.substring(4);
//                 const validHODTabs = ['overview', 'students', 'courses', 'lecturers', 'course-forms', 
//                                       'upload-results', 'attendance', 'timetable', 'payments', 
//                                       'payment-history', 'reports', 'audit', 'profile', 'settings'];
                
//                 if (validHODTabs.includes(tabName)) {
//                     if (window.hodPortal && typeof window.hodPortal.showHODTab === 'function') {
//                         window.hodPortal.showHODTab(tabName);
//                     } else if (typeof showHODTab === 'function') {
//                         showHODTab(tabName);
//                     }
//                 } else {
//                     if (window.hodPortal && typeof window.hodPortal.showHODTab === 'function') {
//                         window.hodPortal.showHODTab('overview');
//                     } else if (typeof showHODTab === 'function') {
//                         showHODTab('overview');
//                     }
//                 }
//             } else {
//                 // Default to overview
//                 if (window.hodPortal && typeof window.hodPortal.showHODTab === 'function') {
//                     window.hodPortal.showHODTab('overview');
//                 } else if (typeof showHODTab === 'function') {
//                     showHODTab('overview');
//                 }
//             }
//         } else {
//             // Student user
//             if (hash.startsWith('student-')) {
//                 const tabName = hash.substring(8);
//                 const validTabs = ['dashboard', 'courses', 'results', 'fees', 'profile', 'registration'];
                
//                 if (validTabs.includes(tabName)) {
//                     showStudentTab(tabName);
//                 } else {
//                     showStudentTab('dashboard');
//                 }
//             } else {
//                 showStudentTab('dashboard');
//             }
//         }
//     } else {
//         // Not logged in - welcome portal
//         const validViews = ['selector', 'login', 'register', 'forgot', 'success'];
//         if (hash && validViews.includes(hash)) {
//             showView(hash);
//         } else {
//             showView('selector');
//         }
//     }
// });

function setupFormValidations() {
    // Setup phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            // Format to Nigerian number
            if (value.length === 11 && value.startsWith('0')) {
                // Convert 08123456789 to +2348123456789
                value = '+234' + value.substring(1);
            } else if (value.length === 13 && value.startsWith('234')) {
                // Convert 2348123456789 to +2348123456789
                value = '+' + value;
            } else if (value.length === 14 && value.startsWith('+234')) {
                // Already in correct format
                value = '+' + value.substring(1);
            } else if (value.length === 10) {
                // Assume it's the local part without code
                value = '+234' + value;
            }
            e.target.value = value;
        });

        // Add blur event to validate on exit
        phoneInput.addEventListener('blur', function(e) {
            const phone = e.target.value;
            const phoneRegex = /^\+234[0-9]{10}$/;
            if (phone && !phoneRegex.test(phone)) {
                showToast('Please enter a valid Nigerian phone number (e.g., +2348012345678)', 'warning');
            }
        });
    }
    
    // Setup password strength checker
    const passwordInput = document.getElementById('register-password');
    if (passwordInput) {
        passwordInput.addEventListener('input', checkPasswordStrength);
    }
    
    const confirmInput = document.getElementById('confirm-password');
    if (confirmInput) {
        confirmInput.addEventListener('input', checkPasswordMatch);
    }
}
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/check-auth/');
        const data = await response.json();
        
        if (data.authenticated) {
            showDashboard();
            loadDashboardData(data.user);
        } else {
            showWelcomePortal();
        }
    } catch (error) {
        console.log('Auth check failed, showing welcome portal');
        showWelcomePortal();
    }
}
// ===========================================
// AUTHENTICATION & DATA STORAGE SYSTEM
// ===========================================

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.students = [];
        this.init();
    }
    init() {
        // Load users from localStorage
        this.loadFromStorage();
        this.checkAuth();
    }
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('mapoly_users');
            if (stored) {
                this.students = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading from storage:', error);
            this.students = [];
        }
    }
    saveToStorage() {
        try {
            localStorage.setItem('mapoly_users', JSON.stringify(this.students));
        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    }
    async checkAuth() {
        try {
            const response = await fetch('/api/check-auth/');
            const data = await response.json();
            
            if (data.authenticated) {
                this.currentUser = data.user;
                this.isLoggedIn = true;
                
                // If user is on welcome portal, redirect to dashboard
                if (document.getElementById('welcome-portal').style.display !== 'none') {
                    showDashboard();
                    loadDashboardData(this.currentUser);
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        }
    }
    getStudentProfile(userId) {
        // Try to get from current user first
        if (this.currentUser && this.currentUser.id === userId) {
            return {
                id: this.currentUser.id,
                fullName: this.currentUser.fullName,
                matricNumber: this.currentUser.matricNumber,
                email: this.currentUser.email,
                department: this.currentUser.department,
                programme: this.currentUser.programme,
                level: this.currentUser.level,
                cgpa: this.currentUser.cgpa || '0.00',
                status: this.currentUser.status || 'active'
            };
        }
        // Fallback to stored students
        const student = this.student.find(s => s.id === userId);
        if (student) {
            return student;
        }
        // Return default profile
        return {
            id: userId,
            fullName: 'Student User',
            matricNumber: '21/003/f/002',
            email: '',
            department: 'Accountancy',
            programme: 'ND Accountancy',
            level: 'ND I',
            cgpa: '0.00',
            status: 'active'
        };
    }
    async sendVerificationCode(email) {
        try {
            const response = await fetch('/api/send-verification-code/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken(),
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            return data
        } catch (error) {
            console.error('Error sending verification code:', error);
            return { success: false, message: 'Network error' };
        }
    }
    // Verify email code
    async verifyEmailCode(email, code) {
        try {
            const response = await fetch('/api/verify-code/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken(),
                },
                body: JSON.stringify({ email, code })
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error verifying code:', error);
            return { success: false, message: 'Network error' };
        }
    }
    // Register new user
    async register(userData) {
        console.log('AuthSystem.register() called with:', userData);
        
        try {
            const response = await fetch('/api/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken(),
                },
                body: JSON.stringify(userData)
            });
            console.log('Register response status:', response.status);
            console.log('Register response headers:', response.headers);

            // Try to parse the response as JSON
            let data;
            try {
                data = await response.json();
            } catch (e) {
                // If response is not JSON, get the text
                const text = await response.text();
                console.error('Response not JSON:', text);
                return {
                    success: false,
                    message: `Server error: ${response.status} - ${text.substring(0, 100)}`
                };
            }

            console.log('Registration API response:', data);
            
            // Check if response was successful
            if (!response.ok) {
                // Return the error message from server if available
                return {
                    success: false,
                    message: data.message || `Registration failed with status ${response.status}`
                };
            }

            if (data.success) {
                // Store user locally
                const newUser = {
                    id: data.user.id,
                    fullName: data.user.fullName,
                    email: data.user.email,
                    matricNumber: data.user.matricNumber,
                    department: data.user.department,
                    programme: data.user.programme,
                    level: data.user.level,
                    password: userData.password, // For demo only
                    cgpa: '0.00',
                    status: 'active'
                };
                
                // Add to local storage (optional)
                if (!this.students) this.students = [];
                this.students.push(newUser);
                this.saveToStorage();
            }
            
            return data;
            
        } catch (error) {
            console.error('Network error in AuthSystem.register():', error);
            return { 
                success: false, 
                message: 'Network error. Please check your connection.' 
            };
        }
    }

    // Login user
    async login(matricNumber, password, userType) {
        try {
            const response = await fetch('/api/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken(),
                },
                body: JSON.stringify({ matricNumber, password, userType })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.currentUser = data.user;
                this.isLoggedIn = true;
                // Store in session
                sessionStorage.setItem('currentUser', JSON.stringify(data.user));
            }
            
            return data;
        } catch (error) {
            console.error('Error logging in:', error);
            return { success: false, message: 'Network error' };
        }
    }
    // Logout user
    async logout() {
        try {
            const response = await fetch('/api/logout/', {
                headers: {
                    'X-CSRFToken': getCSRFToken(),
                }
            });
            const data = await response.json();
            
            this.currentUser = null;
            this.isLoggedIn = false;
            sessionStorage.removeItem('currentUser');
            
            return data;
        } catch (error) {
            console.error('Error logging out:', error);
            return { success: false, message: 'Network error' };
        }
    }
    // Forgot password
    async forgotPassword(email) {
        try {
            const response = await fetch('/api/forgot-password/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken(),
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error sending forgot password:', error);
            return { success: false, message: 'Network error' };
        }
    }
    getCurrentUser() {
        // Try to get from memory first
        if (this.currentUser) {
            return this.currentUser;
        }
        // Then try session storage
        const stored = sessionStorage.getItem('currentUser');
        if (stored) {
            try {
                this.currentUser = JSON.parse(stored);
                this.isLoggedIn = true;
                return this.currentUser;
            } catch (e) {
                console.error('Error parsing stored user:', e);
                // If there's an error, clear the corrupted data
                sessionStorage.removeItem('currentUser');
            }
        }
        return null;
    }
}
// Initialize auth system
const auth = new AuthSystem();
// CSRF Token helper
function getCSRFToken() {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    // If not in cookie, try to get from meta tag
    if (!cookieValue) {
        const csrfMeta = document.querySelector('meta[name="csrf-token"]');
        if (csrfMeta) {
            cookieValue = csrfMeta.getAttribute('content');
        }
    }
    
    console.log('CSRF Token:', cookieValue ? 'Found' : 'Not found');
    return cookieValue;
}
// ===========================================
// DASHBOARD SYSTEM
// ===========================================
class DashboardSystem {
    constructor() {
        this.currentTab = 'dashboard';
        this.notifications = [];
        this.init();
    }
    init() {
        this.loadNotifications();
    }
    loadNotifications() {
        this.notifications = [
            {
                id: 1,
                type: 'success',
                title: 'Welcome to MAPOLY Portal',
                message: 'Your account has been successfully activated.',
                time: '2 hours ago',
                read: false
            },
            {
                id: 2,
                type: 'warning',
                title: 'Course Registration',
                message: 'Course registration for new session starts next week.',
                time: '1 day ago',
                read: false
            },
            {
                id: 3,
                type: 'info',
                title: 'Fee Payment Reminder',
                message: 'Last date for fee payment is approaching.',
                time: '2 days ago',
                read: false
            }
        ];
        this.updateNotificationDisplay();
    }
    updateNotificationDisplay() {
        const notificationList = document.querySelector('.notifications-list');
        const notificationCount = document.querySelectorAll('.notification-count');
        
        if (!notificationList) return;
        notificationList.innerHTML = '';
        this.notifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = `notification-item ${notification.read ? '' : 'unread'}`;
            notificationItem.innerHTML = `
                <h4>${notification.title}</h4>
                <p>${notification.message}</p>
                <small>${notification.time}</small>
            `;
            notificationItem.addEventListener('click', () => {
                notification.read = true;
                this.updateNotificationDisplay();
            });
            notificationList.appendChild(notificationItem);
        });
        const unreadCount = this.notifications.filter(n => !n.read).length;
        notificationCount.forEach(countElement => {
            countElement.textContent = unreadCount;
        });
    }
    setActiveTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`.nav-item[onclick*="${tabName}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const activeTab = document.getElementById(`${tabName}-tab`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        this.loadTabContent(tabName);
    }
    loadTabContent(tabName) {
        const tabContent = document.getElementById(`${tabName}-tab`);
        if (!tabContent) return;
        const currentUser = auth.getCurrentUser();
        const studentProfile = auth.getStudentProfile(currentUser?.id);
        switch (tabName) {
            case 'dashboard':
                tabContent.innerHTML = `
                    <div class="dashboard-grid">
                        <div class="dashboard-card">
                            <div class="card-header">
                                <h3><i class="fas fa-user-graduate"></i> Welcome Back!</h3>
                            </div>
                            <div class="card-content">
                                <p>Welcome to your academic dashboard, ${studentProfile?.fullName?.split(' ')[0] || 'Student'}!</p>
                                <div class="stats-row">
                                    <div class="stat-item">
                                        <span class="stat-value">${studentProfile?.cgpa || '0.00'}</span>
                                        <span class="stat-label">CGPA</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-value">${studentProfile?.level || 'ND I'}</span>
                                        <span class="stat-label">Level</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'profile':
                tabContent.innerHTML = `
                    <div class="dashboard-card">
                        <div class="card-header">
                            <h3><i class="fas fa-user-circle"></i> Profile Information</h3>
                        </div>
                        <div class="card-content">
                            <p><strong>Name:</strong> ${studentProfile?.fullName || 'N/A'}</p>
                            <p><strong>Matric Number:</strong> ${studentProfile?.matricNumber || 'N/A'}</p>
                            <p><strong>Email:</strong> ${studentProfile?.email || 'N/A'}</p>
                            <p><strong>Programme:</strong> ${studentProfile?.programme || 'N/A'}</p>
                            <p><strong>Level:</strong> ${studentProfile?.level || 'N/A'}</p>
                            <p><strong>Status:</strong> <span class="badge active">${studentProfile?.status || 'Active'}</span></p>
                        </div>
                    </div>
                `;
                break;
        }
    }
}
// Initialize dashboard system
const dashboard = new DashboardSystem();
// ===========================================
// SPA DASHBOARD SYSTEM
// ===========================================
class StudentPortal {
    constructor() {
        this.currentStudentTab = 'overview';
        this.selectedCourses = [];
        this.currentUser = null;
    }
    async loadStudentDashboard() {
        try {
            console.log('Loading student dashboard...');
            
            // Show loading
            document.getElementById('dashboard-loading').style.display = 'flex';
            
            // Load dashboard data
            const response = await fetch('/api/student/dashboard/', {
                headers: {
                    'X-CSRFToken': getCSRFToken(),
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.currentUser = data.dashboard.student;
                this.renderStudentDashboard(data.dashboard);
                this.showStudentTab('overview');
                
                // Hide loading
                document.getElementById('dashboard-loading').style.display = 'none';
                
                // Show student dashboard
                document.getElementById('student-dashboard').style.display = 'block';
                document.getElementById('hod-dashboard').style.display = 'none';
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            showToast('Failed to load dashboard: ' + error.message, 'error');
            
            // Hide loading
            document.getElementById('dashboard-loading').style.display = 'none';
        }
    }
    renderStudentDashboard(dashboard) {
        // Update student info
        document.getElementById('student-name').textContent = dashboard.student.fullName;
        document.getElementById('student-matric').textContent = dashboard.student.matricNumber;
        document.getElementById('student-programme').textContent = dashboard.student.programme;
        
        // Update avatar with student name
        const avatarImg = document.querySelector('#student-avatar img');
        if (avatarImg) {
            avatarImg.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${dashboard.student.matricNumber}`;
        }
        
        // Update quick stats
        this.renderQuickStats(dashboard);
        
        // Update overview tab
        this.renderOverviewTab(dashboard);
        
        // Update notification count
        const unreadCount = dashboard.notifications.filter(n => !n.read).length;
        document.getElementById('student-notification-count').textContent = unreadCount;
    }
    renderQuickStats(dashboard) {
        const quickStats = document.getElementById('student-quick-stats');
        if (!quickStats) return;
        
        quickStats.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1);">
                    <i class="fas fa-graduation-cap" style="color: #10B981;"></i>
                </div>
                <div class="stat-content">
                    <h3>${dashboard.academic.cgpa || '0.00'}</h3>
                    <p>CGPA</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(59, 130, 246, 0.1);">
                    <i class="fas fa-book" style="color: #3B82F6;"></i>
                </div>
                <div class="stat-content">
                    <h3>${dashboard.academic.totalCourses}</h3>
                    <p>Current Courses</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(168, 85, 247, 0.1);">
                    <i class="fas fa-wallet" style="color: #A855F7;"></i>
                </div>
                <div class="stat-content">
                    <h3>₦${dashboard.financial.feesPaid.toLocaleString()}</h3>
                    <p>Fees Paid</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(239, 68, 68, 0.1);">
                    <i class="fas fa-exclamation-triangle" style="color: #EF4444;"></i>
                </div>
                <div class="stat-content">
                    <h3>${dashboard.financial.feesStatus === 'paid' ? 'Paid' : 'Pending'}</h3>
                    <p>Fee Status</p>
                </div>
            </div>
        `;
    }
    renderOverviewTab(dashboard) {
        // Academic Summary
        const academicSummary = document.getElementById('academic-summary');
        if (academicSummary) {
            academicSummary.innerHTML = `
                <div class="info-row">
                    <span class="label">Current Level:</span>
                    <span class="value">${dashboard.student.level}</span>
                </div>
                <div class="info-row">
                    <span class="label">Programme:</span>
                    <span class="value">${dashboard.student.programme}</span>
                </div>
                <div class="info-row">
                    <span class="label">Department:</span>
                    <span class="value">${dashboard.student.department}</span>
                </div>
                <div class="info-row">
                    <span class="label">Current Semester:</span>
                    <span class="value">${dashboard.academic.currentSemester}</span>
                </div>
                <div class="info-row">
                    <span class="label">Academic Year:</span>
                    <span class="value">${dashboard.academic.currentYear}</span>
                </div>
                <div class="info-row">
                    <span class="label">Status:</span>
                    <span class="value badge ${dashboard.student.status === 'active' ? 'active' : 'inactive'}">
                        ${dashboard.student.status}
                    </span>
                </div>
            `;
        }
        
        // Financial Status
        const financialStatus = document.getElementById('financial-status');
        if (financialStatus) {
            const feesStatus = dashboard.financial.feesStatus;
            const statusColor = feesStatus === 'paid' ? '#10B981' : 
                            feesStatus === 'partial' ? '#F59E0B' : '#EF4444';
            
            financialStatus.innerHTML = `
                <div class="info-row">
                    <span class="label">Total Required:</span>
                    <span class="value">₦${dashboard.financial.feesRequired.toLocaleString()}</span>
                </div>
                <div class="info-row">
                    <span class="label">Total Paid:</span>
                    <span class="value">₦${dashboard.financial.feesPaid.toLocaleString()}</span>
                </div>
                <div class="info-row">
                    <span class="label">Balance:</span>
                    <span class="value" style="color: ${dashboard.financial.feesBalance > 0 ? '#EF4444' : '#10B981'}">
                        ₦${dashboard.financial.feesBalance.toLocaleString()}
                    </span>
                </div>
                <div class="info-row">
                    <span class="label">Status:</span>
                    <span class="value badge" style="background: ${statusColor}20; color: ${statusColor}">
                        ${feesStatus.toUpperCase()}
                    </span>
                </div>
                ${dashboard.financial.feesBalance > 0 ? `
                <button class="btn btn-primary" onclick="showPaymentModal()" style="margin-top: 15px; width: 100%;">
                    <i class="fas fa-credit-card"></i> Pay Now
                </button>
                ` : ''}
            `;
        }
        
        // Recent Notifications
        const recentNotifications = document.getElementById('recent-notifications');
        if (recentNotifications && dashboard.notifications.length > 0) {
            recentNotifications.innerHTML = dashboard.notifications.map(notification => `
                <div class="notification-item ${notification.read ? '' : 'unread'}" onclick="markNotificationAsRead('${notification.id}')">
                    <div class="notification-icon ${notification.type}">
                        <i class="fas fa-${notification.type === 'success' ? 'check-circle' : 
                                        notification.type === 'warning' ? 'exclamation-triangle' : 
                                        notification.type === 'error' ? 'times-circle' : 'info-circle'}"></i>
                    </div>
                    <div class="notification-content">
                        <h4>${notification.title}</h4>
                        <p>${notification.message}</p>
                        <small>${notification.time}</small>
                    </div>
                </div>
            `).join('');
        } else {
            recentNotifications.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell-slash"></i>
                    <p>No notifications</p>
                </div>
            `;
        }
    }
    async loadStudentCourses() {
        try {
            const semester = document.getElementById('course-semester-filter').value;
            let url = '/api/student/courses/';
            if (semester) {
                url += `?semester=${semester}`;
            }
            
            const response = await fetch(url, {
                headers: {
                    'X-CSRFToken': getCSRFToken(),
                }
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            
            if (data.success) {
                this.renderCoursesList(data.courses);
            }
        } catch (error) {
            console.error('Error loading courses:', error);
            showToast('Failed to load courses', 'error');
        }
    }
    renderCoursesList(courses) {
        const coursesList = document.getElementById('courses-list');
        if (!coursesList) return;
        
        if (courses.length === 0) {
            coursesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book"></i>
                    <p>No courses found</p>
                </div>
            `;
            return;
        }
        
        coursesList.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Course Code</th>
                        <th>Course Title</th>
                        <th>Credit Units</th>
                        <th>Semester</th>
                        <th>Grade</th>
                        <th>Grade Point</th>
                    </tr>
                </thead>
                <tbody>
                    ${courses.map(course => `
                        <tr>
                            <td>${course.code}</td>
                            <td>${course.title}</td>
                            <td>${course.creditUnits}</td>
                            <td>Semester ${course.semester}</td>
                            <td class="grade-${course.grade.toLowerCase()}">${course.grade}</td>
                            <td>${course.gradePoint}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    async loadStudentResults() {
        console.log('Loading student results...');
        const resultsTab = document.getElementById('results-tab');
        if (!resultsTab) {
            console.error('Results tab element not found');
            return;
        }
        
        try {
            resultsTab.innerHTML = `
            <div style="text-align: center; padding: 60px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 48px; color: #003366;"></i>
                <p style="margin-top: 20px; color: #6B7280; font-size: 16px;">Loading your results...</p>
            </div>
            `;
            // Fetch results from API
            const response = await fetch('/api/student/results/', {
                headers: {
                    'X-CSRFToken': getCSRFToken(),
                }
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            
            if (data.success) {
                this.renderResultsTab(data.results);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error loading results:', error);
            resultsTab.innerHTML = `
            <div style="text-align: center; padding: 60px;">
                <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #EF4444;"></i>
                <p style="margin-top: 20px; color: #6B7280; font-size: 16px;">Failed to load results. Please try again.</p>
                <button onclick="loadStudentResults()" class="btn btn-primary" style="margin-top: 20px; width: auto; padding: 12px 30px;">
                    <i class="fas fa-sync-alt"></i> Retry
                </button>
            </div>
            `
            showToast('Failed to load results', 'error');
        }
    }
    renderResultsList(results) {
        const resultsList = document.getElementById('results-list');
        if (!resultsList) return;
        
        if (results.length === 0) {
            resultsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-line"></i>
                    <p>No results published yet</p>
                </div>
            `;
            return;
        }
        
        resultsList.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Academic Year</th>
                        <th>Semester</th>
                        <th>GPA</th>
                        <th>Credit Units</th>
                        <th>Quality Points</th>
                        <th>Status</th>
                        <th>Published Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map(result => `
                        <tr>
                            <td>${result.academicYear}</td>
                            <td>Semester ${result.semester}</td>
                            <td><strong>${result.gpa.toFixed(2)}</strong></td>
                            <td>${result.totalCreditUnits}</td>
                            <td>${result.totalQualityPoints.toFixed(2)}</td>
                            <td>
                                <span class="badge ${result.isPublished ? 'active' : 'pending'}">
                                    ${result.isPublished ? 'Published' : 'Pending'}
                                </span>
                            </td>
                            <td>${result.publishedAt || 'Not published'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    showStudentTab(tabName) {
        // Update active tab button
        document.querySelectorAll('#student-dashboard .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`#student-dashboard .tab-btn[onclick*="${tabName}"]`).classList.add('active');
        
        // Update active tab content
        document.querySelectorAll('#student-dashboard .tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`student-${tabName}-tab`).classList.add('active');
        
        // Load tab data
        switch (tabName) {
            case 'courses':
                this.loadStudentCourses();
                break;
            case 'results':
                this.loadStudentResults();
                break;
            case 'fees':
                this.loadStudentPayments();
                break;
            case 'registration':
                this.loadCourseRegistration();
                break;
            case 'profile':
                this.loadProfile();
                break;
        }
    }
}
// Load student courses
async function loadStudentCourses() {
    console.log('Loading student courses...');
    
    const coursesTab = document.getElementById('courses-tab');
    if (!coursesTab) {
        console.error('Courses tab element not found');
        return};
    
    try {
        // Show loading state
        coursesTab.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 40px; color: #003366;"></i>
                <p style="margin-top: 20px; color: #6B7280;">Loading your courses...</p>
            </div>
        `;
        
        // Fetch courses from API
        const response = await fetch('/api/student/courses/', {
            headers: {
                'X-CSRFToken': getCSRFToken(),
            }
        });
        
        if (!response.ok) throw new Error('Failed to load courses');
        
        const data = await response.json();
        
        if (data.success) {
            renderCoursesList(data.courses);
        } else {
            throw new Error(data.message);
        }
        
    } catch (error) {
        console.error('Error loading courses:', error);
        coursesTab.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #EF4444;"></i>
                <p style="margin-top: 20px; color: #6B7280;">Failed to load courses. Please try again.</p>
                <button onclick="loadStudentCourses()" class="btn btn-primary" style="margin-top: 20px; width: auto; padding: 10px 30px;">
                    <i class="fas fa-sync-alt"></i> Retry
                </button>
            </div>
        `;
    }
}
// Load course registration page
async function loadCourseRegistration() {
    console.log('Loading course registration...');
    
    const registrationTab = document.getElementById('registration-tab');
    if (!registrationTab) return;
    
    try {
        // Show loading state
        registrationTab.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 40px; color: #003366;"></i>
                <p style="margin-top: 20px; color: #6B7280;">Loading available courses...</p>
            </div>
        `;
        
        // Fetch available courses
        const response = await fetch('/api/student/available-courses/', {
            headers: {
                'X-CSRFToken': getCSRFToken(),
            }
        });
        
        if (!response.ok) throw new Error('Failed to load courses');
        
        const data = await response.json();
        
        if (data.success) {
            renderRegistrationForm(data);
        } else {
            throw new Error(data.message);
        }
        
    } catch (error) {
        console.error('Error loading registration:', error);
        registrationTab.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #EF4444;"></i>
                <p style="margin-top: 20px; color: #6B7280;">Failed to load courses. Please try again.</p>
                <button onclick="loadCourseRegistration()" class="btn btn-primary" style="margin-top: 20px; width: auto; padding: 10px 30px;">
                    <i class="fas fa-sync-alt"></i> Retry
                </button>
            </div>
        `;
    }
}
function renderRegistrationForm(data) {
    const registrationTab = document.getElementById('registration-tab');
    const courses = data.courses || [];
    const session = data.session || { name: '2024/2025', semester: 1 };
    
    let html = `
        <div class="dashboard-card">
            <div class="card-header">
                <h3><i class="fas fa-clipboard-list"></i> Course Registration</h3>
                <div class="semester-info">
                    <span style="background: #003366; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px;">
                        ${session.name} - Semester ${session.semester}
                    </span>
                </div>
            </div>
            <div class="card-content">
    `;
    
    if (courses.length === 0) {
        html += `
            <div class="empty-state" style="padding: 40px; text-align: center;">
                <i class="fas fa-book" style="font-size: 48px; color: #9CA3AF;"></i>
                <p style="margin-top: 15px; color: #6B7280;">No courses available for registration at this time.</p>
            </div>
        `;
    } else {
        html += `
            <p style="margin-bottom: 20px; color: #4B5563;">Select the courses you want to register for:</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; margin-bottom: 25px;" id="courses-grid">
        `;
        
        courses.forEach(course => {
            html += `
                <div style="border: 1px solid #E5E7EB; border-radius: 10px; padding: 15px; background: ${course.isRegistered ? '#F3F4F6' : 'white'};">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <h4 style="font-weight: 600; color: #003366; margin-bottom: 5px;">${course.code}</h4>
                            <p style="font-size: 14px; color: #4B5563; margin-bottom: 8px;">${course.title}</p>
                            <span style="font-size: 13px; color: #6B7280;">Credit Units: ${course.creditUnits}</span>
                            ${course.isElective ? '<span style="margin-left: 10px; background: #FEF3C7; color: #D97706; padding: 2px 8px; border-radius: 12px; font-size: 11px;">Elective</span>' : ''}
                        </div>
                        <div>
                            ${course.isRegistered ? 
                                '<span style="background: #10B981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">Registered</span>' : 
                                `<input type="checkbox" class="course-checkbox" value="${course.id}" style="width: 20px; height: 20px; cursor: pointer;">`
                            }
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
            </div>
            
            <div style="margin-top: 20px; padding: 20px; background: #F9FAFB; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span style="font-weight: 600; color: #1F2937;">Selected: <span id="selected-count">0</span> courses</span>
                </div>
                <div style="display: flex; gap: 15px;">
                    <button class="btn btn-outline" onclick="clearSelection()" style="width: auto; padding: 10px 20px;">
                        <i class="fas fa-times"></i> Clear
                    </button>
                    <button class="btn btn-primary" onclick="submitCourseRegistration()" style="width: auto; padding: 10px 30px;">
                        <i class="fas fa-check-circle"></i> Submit Registration
                    </button>
                </div>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    registrationTab.innerHTML = html;
    
    // Add event listeners to checkboxes
    document.querySelectorAll('.course-checkbox').forEach(cb => {
        cb.addEventListener('change', updateSelectedCount);
    });
}
function updateSelectedCount() {
    const count = document.querySelectorAll('.course-checkbox:checked').length;
    const counter = document.getElementById('selected-count');
    if (counter) counter.textContent = count;
}
function clearSelection() {
    document.querySelectorAll('.course-checkbox:checked').forEach(cb => {
        cb.checked = false;
    });
    updateSelectedCount();
}
function renderCoursesList(courses) {
    const coursesTab = document.getElementById('courses-tab');
    
    if (!courses || courses.length === 0) {
        coursesTab.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-book-open" style="font-size: 48px; color: #9CA3AF;"></i>
                <h3 style="margin-top: 20px; color: #1F2937;">No Courses Found</h3>
                <p style="margin-top: 10px; color: #6B7280;">You haven't registered for any courses yet.</p>
                <button onclick="showStudentTab('registration')" class="btn btn-primary" style="margin-top: 20px; width: auto; padding: 12px 30px;">
                    <i class="fas fa-plus-circle"></i> Register for Courses
                </button>
            </div>
        `;
        return;
    }
    // Group courses by semester
    const semester1 = courses.filter(c => c.semester === 1);
    const semester2 = courses.filter(c => c.semester === 2);
    
    let html = `
        <div style="margin-bottom: 30px;">
            <h2 style="font-size: 24px; font-weight: 700; color: #1F2937; margin-bottom: 20px;">
                <i class="fas fa-book-open" style="color: #003366; margin-right: 10px;"></i>
                My Courses
            </h2>
            
            <!- Semester Filter ->
            <div style="display: flex; gap: 15px; margin-bottom: 25px; align-items: center;">
                <label style="font-weight: 600; color: #374151;">Filter by Semester:</label>
                <select id="course-filter" onchange="filterCoursesBySemester()" style="padding: 8px 16px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 14px;">
                    <option value="all">All Semesters</option>
                    <option value="1">First Semester</option>
                    <option value="2">Second Semester</option>
                </select>
            </div>
    `;
    
    // First Semester
    html += `
        <div class="semester-section" data-semester="1" style="margin-bottom: 30px;">
            <h3 style="font-size: 18px; font-weight: 600; color: #003366; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #E5E7EB;">
                <i class="fas fa-sun" style="margin-right: 8px;"></i> First Semester
            </h3>
    `;
    
    if (semester1.length > 0) {
        html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px;">`;
        semester1.forEach(course => {
            html += createCourseCard(course);
        });
        html += `</div>`;
    } else {
        html += `<p style="color: #9CA3AF; padding: 20px; text-align: center; background: #F9FAFB; border-radius: 8px;">No courses registered for first semester</p>`;
    }
    html += `</div>`;
    
    // Second Semester
    html += `
        <div class="semester-section" data-semester="2" style="margin-bottom: 30px;">
            <h3 style="font-size: 18px; font-weight: 600; color: #003366; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #E5E7EB;">
                <i class="fas fa-moon" style="margin-right: 8px;"></i> Second Semester
            </h3>
    `;
    
    if (semester2.length > 0) {
        html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px;">`;
        semester2.forEach(course => {
            html += createCourseCard(course);
        });
        html += `</div>`;
    } else {
        html += `<p style="color: #9CA3AF; padding: 20px; text-align: center; background: #F9FAFB; border-radius: 8px;">No courses registered for second semester</p>`;
    }
    html += `</div>`;
    
    // Summary
    html += `
        <div style="margin-top: 30px; padding: 20px; background: #F3F4F6; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <p style="color: #4B5563;"><i class="fas fa-chart-line" style="color: #003366; margin-right: 8px;"></i> Total Courses: <strong>${courses.length}</strong></p>
                <p style="color: #4B5563; margin-top: 5px;"><i class="fas fa-calculator" style="color: #003366; margin-right: 8px;"></i> Total Credit Units: <strong>${courses.reduce((sum, c) => sum + c.creditUnits, 0)}</strong></p>
            </div>
            <button onclick="window.print()" class="btn btn-outline" style="width: auto; padding: 10px 20px;">
                <i class="fas fa-print"></i> Print Course List
            </button>
        </div>
    </div>`;
    
    coursesTab.innerHTML = html;
}
function createCourseCard(course) {
    const gradeColor = {
        'A': '#10B981',
        'B': '#3B82F6',
        'C': '#F59E0B',
        'D': '#EF4444',
        'F': '#DC2626',
        '-': '#9CA3AF'
    }[course.grade] || '#9CA3AF';

    return `
        <div style="background: white; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                <div>
                    <h4 style="font-size: 18px; font-weight: 700; color: #003366; margin-bottom: 5px;">${course.code}</h4>
                    <p style="font-size: 14px; color: #4B5563; margin-bottom: 8px;">${course.title}</p>
                </div>
                <span style="background: ${gradeColor}20; color: ${gradeColor}; padding: 4px 12px; border-radius: 20px; font-weight: 600; font-size: 14px;">
                    ${course.grade !== '-' ? course.grade : 'Not Graded'}
                </span>
            </div>
            
            <div style="display: flex; gap: 15px; margin-bottom: 15px; padding: 10px 0; border-top: 1px solid #F3F4F6; border-bottom: 1px solid #F3F4F6;">
                <div style="text-align: center;">
                    <span style="font-size: 12px; color: #6B7280;">Credit Units</span>
                    <p style="font-weight: 700; color: #1F2937;">${course.creditUnits}</p>
                </div>
                ${course.grade !== '-' ? `
                <div style="text-align: center;">
                    <span style="font-size: 12px; color: #6B7280;">Grade Point</span>
                    <p style="font-weight: 700; color: #1F2937;">${course.gradePoint}</p>
                </div>
                <div style="text-align: center;">
                    <span style="font-size: 12px; color: #6B7280;">Quality Point</span>
                    <p style="font-weight: 700; color: #1F2937;">${course.qualityPoint}</p>
                </div>
                ` : ''}
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 13px; color: #6B7280;">
                    <i class="fas fa-calendar"></i> ${course.academicYear}
                </span>
                ${course.score ? `
                    <span style="font-size: 13px; font-weight: 600; color: #1F2937;">Score: ${course.score}%</span>
                ` : ''}
            </div>
        </div>
    `;
}
function filterCoursesBySemester() {
    const filter = document.getElementById('course-filter').value;
    const sections = document.querySelectorAll('.semester-section');
    
    sections.forEach(section => {
        if (filter === 'all' || section.dataset.semester === filter) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
}
// ===========================================
// HOD PORTAL
// ===========================================
class HODPortal {
    constructor() {
        this.currentHODTab = 'overview';
    }
    async loadHODDashboard() {
        try {
            console.log('Loading HOD dashboard...');
            
            // Show loading
            document.getElementById('dashboard-loading').style.display = 'flex';
            
            const response = await fetch('/api/hod/dashboard/', {
                headers: {
                    'X-CSRFToken': getCSRFToken(),
                }
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Dashboard data received:', data);
            
            if (data.success) {
                console.log('Calling renderHODDashboard with:', data.dashboard);
                this.renderHODDashboard(data.dashboard);
                this.showHODTab('overview');
                
                // Hide loading
                document.getElementById('dashboard-loading').style.display = 'none';
                
                // Show HOD dashboard
                document.getElementById('hod-dashboard').style.display = 'block';
                document.getElementById('student-dashboard').style.display = 'none';
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('🔴Error loading HOD dashboard:', error);
            showToast('Failed to load HOD dashboard: ' + error.message, 'error');
            
            // Hide loading
            document.getElementById('dashboard-loading').style.display = 'none';
        }
    }
    renderHODDashboard(dashboard) {
        console.log('renderHODDashboard called with:', dashboard);
    
        // Update HOD name in top bar
        const hodNameElement = document.getElementById('hod-name');
        const hodWelcomeName = document.getElementById('hod-welcome-name');
        const hodSidebarName = document.getElementById('hod-sidebar-name');
        const hodSidebarDept = document.getElementById('hod-sidebar-dept');
        
        // Get user from auth system as fallback
        const user = auth.getCurrentUser();
        const fullName = dashboard.user?.fullName || user?.fullName || 'Dr. Adebayo';
        const firstName = fullName.split(' ')[0];
        const department = dashboard.user?.department || user?.department || 'Accountancy';
        
        console.log('Setting HOD name to:', fullName);
        console.log('Elements found:', {
            hodName: !!hodNameElement,
            hodWelcomeName: !!hodWelcomeName,
            hodSidebarName: !!hodSidebarName,
            hodSidebarDept: !!hodSidebarDept
        });
        
        if (hodNameElement) hodNameElement.textContent = fullName;
        if (hodWelcomeName) hodWelcomeName.textContent = firstName;
        if (hodSidebarName) hodSidebarName.textContent = fullName;
        if (hodSidebarDept) hodSidebarDept.textContent = department;

        // Update HOD quick stats
        this.updateHODStats(dashboard);
        
        // Update pending forms count badge in sidebar
        const pendingBadge = document.getElementById('pending-forms-count');
        if (pendingBadge) {
            pendingBadge.textContent = dashboard.stats?.pendingForms || 0;
        }
    }
    updateHODStats(dashboard) {
        const hodStats = document.getElementById('hod-quick-stats');
        if (!hodStats) {
            console.warn('hod-quick-stats element not found');
            return;
        }
        
        const stats = dashboard.stats || {};
        
        hodStats.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1);">
                    <i class="fas fa-users" style="color: #10B981;"></i>
                </div>
                <div class="stat-content">
                    <h3>${stats.totalStudents || 0}</h3>
                    <p>Total Students</p>
                    <span class="admin-stat-trend positive">
                        <i class="fas fa-arrow-up"></i> +${stats.newStudents || 0} this semester
                    </span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(59, 130, 246, 0.1);">
                    <i class="fas fa-user-check" style="color: #3B82F6;"></i>
                </div>
                <div class="stat-content">
                    <h3>${stats.activeStudents || 0}</h3>
                    <p>Active Students</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(245, 158, 11, 0.1);">
                    <i class="fas fa-clipboard-list" style="color: #F59E0B;"></i>
                </div>
                <div class="stat-content">
                    <h3>${stats.pendingForms || 0}</h3>
                    <p>Pending Forms</p>
                    ${stats.pendingForms > 0 ? 
                        `<span class="admin-stat-trend warning">
                            <i class="fas fa-clock"></i> Needs approval
                        </span>` : ''
                    }
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(168, 85, 247, 0.1);">
                    <i class="fas fa-user-graduate" style="color: #A855F7;"></i>
                </div>
                <div class="stat-content">
                    <h3>${stats.graduated || 0}</h3>
                    <p>Graduated</p>
                </div>
            </div>
        `;
    }
    renderHODOverview(dashboard) {
        const overviewTab = document.getElementById('hod-overview-tab');
        if (!overviewTab) return;
        
        overviewTab.innerHTML = `
            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3><i class="fas fa-chart-bar"></i> Department Statistics</h3>
                    </div>
                    <div class="card-content">
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="label">Total Students:</span>
                                <span class="value">${dashboard.stats.totalStudents}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Active Students:</span>
                                <span class="value">${dashboard.stats.activeStudents}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Pending Forms:</span>
                                <span class="value">${dashboard.stats.pendingForms}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Graduated:</span>
                                <span class="value">${dashboard.stats.graduated}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3><i class="fas fa-history"></i> Recent Payments</h3>
                    </div>
                    <div class="card-content">
                        ${dashboard.recentPayments.length > 0 ? `
                            <div class="payment-list">
                                ${dashboard.recentPayments.map(payment => `
                                    <div class="payment-item">
                                        <div class="payment-info">
                                            <h4>${payment.studentName}</h4>
                                            <p>${payment.matricNumber} • ${payment.type}</p>
                                        </div>
                                        <div class="payment-amount">
                                            <strong>₦${payment.amount.toLocaleString()}</strong>
                                            <small>${payment.date}</small>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="empty-state">
                                <i class="fas fa-wallet"></i>
                                <p>No recent payments</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    }
    async loadHODStudents() {
        try {
            const response = await fetch('/api/hod/students/', {
                headers: {
                    'X-CSRFToken': getCSRFToken(),
                }
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            
            if (data.success) {
                this.renderHODStudents(data.students);
            }
        } catch (error) {
            console.error('Error loading HOD students:', error);
            showToast('Failed to load students', 'error');
        }
    }
    renderHODStudents(students) {
        const studentsTab = document.getElementById('hod-students-tab');
        if (!studentsTab) return;
        
        studentsTab.innerHTML = `
            <div class="dashboard-card">
                <div class="card-header">
                    <h3><i class="fas fa-users"></i> Department Students</h3>
                    <div class="search-box">
                        <input type="text" placeholder="Search students..." id="search-students" onkeyup="filterStudents()">
                    </div>
                </div>
                <div class="card-content">
                    ${students.length > 0 ? `
                        <div class="students-table-container">
                            <table class="data-table" id="students-table">
                                <thead>
                                    <tr>
                                        <th>Matric Number</th>
                                        <th>Full Name</th>
                                        <th>Programme</th>
                                        <th>Level</th>
                                        <th>CGPA</th>
                                        <th>Fee Status</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${students.map(student => `
                                        <tr>
                                            <td>${student.matricNumber}</td>
                                            <td>${student.fullName}</td>
                                            <td>${student.programme}</td>
                                            <td>${student.level}</td>
                                            <td>${student.cgpa}</td>
                                            <td>
                                                <span class="badge ${student.feesStatus === 'paid' ? 'active' : 
                                                                student.feesStatus === 'partial' ? 'warning' : 'error'}">
                                                    ${student.feesStatus}
                                                </span>
                                            </td>
                                            <td>
                                                <span class="badge ${student.isActive ? 'active' : 'error'}">
                                                    ${student.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <button class="btn-sm" onclick="viewStudent('${student.id}')">
                                                    <i class="fas fa-eye"></i> View
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <div class="empty-state">
                            <i class="fas fa-users-slash"></i>
                            <p>No students found</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    }
    async loadHODCourseForms() {
        try {
            const response = await fetch('/api/hod/course-forms/', {
                headers: {
                    'X-CSRFToken': getCSRFToken(),
                }
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            
            if (data.success) {
                this.renderHODCourseForms(data.forms);
            }
        } catch (error) {
            console.error('Error loading course forms:', error);
            showToast('Failed to load course forms', 'error');
        }
    }
    renderHODCourseForms(forms) {
        const formsTab = document.getElementById('hod-course-forms-tab');
        if (!formsTab) return;
        
        formsTab.innerHTML = `
            <div class="dashboard-card">
                <div class="card-header">
                    <h3><i class="fas fa-clipboard-check"></i> Pending Course Forms</h3>
                </div>
                <div class="card-content">
                    ${forms.length > 0 ? `
                        <div class="course-forms-list">
                            ${forms.map(form => `
                                <div class="course-form-item">
                                    <div class="form-header">
                                        <div class="form-student-info">
                                            <h4>${form.studentName}</h4>
                                            <p>${form.matricNumber} • ${form.level} • ${form.academicYear} Semester ${form.semester}</p>
                                        </div>
                                        <div class="form-meta">
                                            <small>Submitted: ${form.submittedAt}</small>
                                            <span class="badge warning">${form.coursesCount} courses</span>
                                        </div>
                                    </div>
                                    <div class="form-actions">
                                        <button class="btn btn-primary" onclick="approveCourseForm('${form.id}')">
                                            <i class="fas fa-check"></i> Approve
                                        </button>
                                        <button class="btn btn-outline" onclick="rejectCourseForm('${form.id}')">
                                            <i class="fas fa-times"></i> Reject
                                        </button>
                                        <button class="btn" onclick="viewCourseForm('${form.id}')">
                                            <i class="fas fa-eye"></i> View Details
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="empty-state">
                            <i class="fas fa-clipboard-check"></i>
                            <p>No pending course forms</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    }
    showHODTab(tabName) {
        showHODTab(tabName);
    }
}

// ===========================================
// GLOBAL INSTANCES
// ===========================================
const studentPortal = new StudentPortal();
const hodPortal = new HODPortal();

// ===========================================
// HOD TAB FUNCTIONS
// ===========================================
// Load course forms
async function loadHODCourseForms() {
    console.log('Loading course forms...');
    const tab = document.getElementById('hod-course-forms-tab');
    if (!tab) return;
    
    try {
        tab.innerHTML = `
            <div class="admin-tab-header">
                <h2><i class="fas fa-clipboard-check"></i> Course Forms</h2>
            </div>
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 40px; color: #003366;"></i>
                <p style="margin-top: 20px; color: #6B7280;">Loading course forms...</p>
            </div>
        `;
        
        const response = await fetch('/api/hod/course-forms/', {
            headers: {
                'X-CSRFToken': getCSRFToken(),
            }
        });
        
        if (!response.ok) throw new Error('Failed to load course forms');
        
        const data = await response.json();
        
        if (data.success) {
            renderCourseForms(data.forms);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error loading course forms:', error);
        tab.innerHTML = `
            <div class="admin-tab-header">
                <h2><i class="fas fa-clipboard-check"></i> Course Forms</h2>
            </div>
            <div style="background: white; border-radius: 20px; padding: 40px; text-align: center;">
                <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #EF4444;"></i>
                <p style="margin-top: 20px; color: #6B7280;">Failed to load course forms. Please try again.</p>
                <button onclick="loadHODCourseForms()" class="admin-btn-primary" style="margin-top: 20px;">
                    <i class="fas fa-sync-alt"></i> Retry
                </button>
            </div>
        `;
    }
}

function renderCourseForms(forms) {
    const tab = document.getElementById('hod-course-forms-tab');
    
    let html = `
        <div class="admin-tab-header">
            <h2><i class="fas fa-clipboard-check"></i> Course Forms</h2>
        </div>
    `;
    
    if (!forms || forms.length === 0) {
        html += `
            <div style="background: white; border-radius: 20px; padding: 60px; text-align: center;">
                <i class="fas fa-check-circle" style="font-size: 64px; color: #9CA3AF;"></i>
                <h3 style="margin-top: 20px; color: #1F2937;">No Pending Course Forms</h3>
                <p style="margin-top: 10px; color: #6B7280;">All course registrations have been processed.</p>
            </div>
        `;
        tab.innerHTML = html;
        return;
    }
    
    html += `<div style="display: grid; gap: 20px;">`;
    
    forms.forEach(form => {
        html += `
            <div style="background: white; border-radius: 15px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 15px;">
                    <div>
                        <h3 style="font-size: 18px; font-weight: 600; color: #1F2937; margin-bottom: 5px;">${form.studentName}</h3>
                        <p style="color: #6B7280; font-size: 14px; margin-bottom: 8px;">
                            ${form.matricNumber} • ${form.level} • ${form.programme}
                        </p>
                        <p style="color: #6B7280; font-size: 13px;">
                            <i class="fas fa-calendar"></i> Submitted: ${form.submittedAt}
                        </p>
                    </div>
                    <span style="background: #FEF3C7; color: #D97706; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                        ${form.coursesCount} Courses
                    </span>
                </div>
                
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #E5E7EB;">
                    <p style="font-weight: 600; color: #374151; margin-bottom: 10px;">Selected Courses:</p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px;">
                        ${form.courses ? form.courses.map(course => `
                            <span style="background: #F3F4F6; padding: 4px 10px; border-radius: 6px; font-size: 13px; color: #4B5563;">
                                ${course.code}
                            </span>
                        `).join('') : '<span>No courses listed</span>'}
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button class="admin-btn-primary" onclick="approveCourseForm('${form.id}')" style="padding: 8px 20px;">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="admin-btn-secondary" onclick="rejectCourseForm('${form.id}')" style="padding: 8px 20px;">
                        <i class="fas fa-times"></i> Reject
                    </button>
                    <button class="admin-btn-sm" onclick="viewCourseFormDetails('${form.id}')" style="background: #E5E7EB;">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            </div>
        `;
    });
    
    html += `</div>`;
    tab.innerHTML = html;
}

// Load upload results
async function loadUploadResults() {
    console.log('Loading upload results...');
    const tab = document.getElementById('hod-upload-results-tab');
    if (!tab) return;
    
    // The HTML is already there, just make sure it's visible
    // You can add logic here to load courses for the dropdowns
    loadResultCourses();
}

async function loadResultCourses() {
    // This will be called when programme/level changes
    const programme = document.getElementById('result-programme')?.value;
    const level = document.getElementById('result-level')?.value;
    const semester = document.getElementById('result-semester')?.value;
    const academicYear = document.getElementById('result-academic-year')?.value;
    
    if (programme && level && semester && academicYear) {
        document.getElementById('course-results-container').style.display = 'block';
        // Here you would fetch students for the selected course
        // For now, show demo data
        document.getElementById('results-table-body').innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px;">
                    <i class="fas fa-info-circle" style="color: #3B82F6;"></i>
                    <p style="margin-top: 10px; color: #6B7280;">Select a course to load students</p>
                </td>
            </tr>
        `;
    }
}

// Load attendance management
async function loadAttendanceManagement() {
    console.log('Loading attendance management...');
    const tab = document.getElementById('hod-attendance-tab');
    if (!tab) return;
    
    // Load courses for dropdown
    try {
        const response = await fetch('/api/hod/courses/');
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('attendance-course');
            select.innerHTML = '<option value="">Choose Course</option>';
            
            // Add courses from all levels
            const levels = ['ND I', 'ND II', 'HND I', 'HND II'];
            levels.forEach(level => {
                const sem1 = data.courses[level]?.semester1 || [];
                const sem2 = data.courses[level]?.semester2 || [];
                [...sem1, ...sem2].forEach(course => {
                    if (course.isActive) {
                        select.innerHTML += `<option value="${course.id}">${course.code} - ${course.title} (${level})</option>`;
                    }
                });
            });
        }
    } catch (error) {
        console.error('Error loading courses for attendance:', error);
    }
}

// Load reports
async function loadReports() {
    console.log('Loading reports...');
    const tab = document.getElementById('hod-reports-tab');
    if (!tab) return;
    
    // The HTML is already there, you can add logic to fetch report data
    // For now, just show the existing structure
}

// Load HOD profile
async function loadHODProfile() {
    console.log('Loading HOD profile...');
    const tab = document.getElementById('hod-profile-tab');
    if (!tab) {
        // Create profile tab if it doesn't exist
        createHODProfileTab();
    }
    
    const user = auth.getCurrentUser();
    
    document.getElementById('hod-profile-tab').innerHTML = `
        <div class="admin-tab-header">
            <h2><i class="fas fa-user-circle"></i> My Profile</h2>
        </div>
        <div style="background: white; border-radius: 20px; padding: 30px;">
            <div style="display: flex; align-items: center; gap: 30px; margin-bottom: 30px; flex-wrap: wrap;">
                <div style="position: relative;">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName || 'HOD'}" 
                         style="width: 120px; height: 120px; border-radius: 50%; border: 4px solid #003366;">
                    <span style="position: absolute; bottom: 5px; right: 5px; width: 20px; height: 20px; background: #10B981; border-radius: 50%; border: 3px solid white;"></span>
                </div>
                <div>
                    <h2 style="font-size: 28px; color: #1F2937; margin-bottom: 5px;">${user?.fullName || 'Dr. Adebayo'}</h2>
                    <p style="color: #003366; font-weight: 600; margin-bottom: 10px;">Head of Department</p>
                    <p style="color: #6B7280;"><i class="fas fa-envelope"></i> ${user?.email || 'hod@mapoly.edu.ng'}</p>
                    <p style="color: #6B7280;"><i class="fas fa-phone"></i> ${user?.phone || '+234 803 123 4567'}</p>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                <div style="background: #F9FAFB; padding: 20px; border-radius: 12px;">
                    <h3 style="font-size: 16px; font-weight: 600; color: #1F2937; margin-bottom: 15px;">Department Information</h3>
                    <p style="margin-bottom: 10px;"><span style="color: #6B7280;">Department:</span> <span style="font-weight: 500;">Accountancy</span></p>
                    <p style="margin-bottom: 10px;"><span style="color: #6B7280;">Faculty:</span> <span style="font-weight: 500;">Management Sciences</span></p>
                    <p style="margin-bottom: 10px;"><span style="color: #6B7280;">Staff ID:</span> <span style="font-weight: 500;">HOD/ACC/001</span></p>
                    <p><span style="color: #6B7280;">Since:</span> <span style="font-weight: 500;">2020</span></p>
                </div>
                
                <div style="background: #F9FAFB; padding: 20px; border-radius: 12px;">
                    <h3 style="font-size: 16px; font-weight: 600; color: #1F2937; margin-bottom: 15px;">Quick Stats</h3>
                    <p style="margin-bottom: 10px;"><span style="color: #6B7280;">Total Students:</span> <span style="font-weight: 600;" id="profile-total-students">0</span></p>
                    <p style="margin-bottom: 10px;"><span style="color: #6B7280;">Active Courses:</span> <span style="font-weight: 600;" id="profile-active-courses">0</span></p>
                    <p style="margin-bottom: 10px;"><span style="color: #6B7280;">Pending Forms:</span> <span style="font-weight: 600;" id="profile-pending-forms">0</span></p>
                    <p><span style="color: #6B7280;">Lecturers:</span> <span style="font-weight: 600;">12</span></p>
                </div>
            </div>
        </div>
    `;
}

function createHODProfileTab() {
    const mainContent = document.getElementById('admin-main-content');
    if (mainContent && !document.getElementById('hod-profile-tab')) {
        const profileTab = document.createElement('div');
        profileTab.id = 'hod-profile-tab';
        profileTab.className = 'admin-tab-content';
        mainContent.appendChild(profileTab);
    }
}
// ===========================================
// GLOBAL FUNCTIONS
// ===========================================
async function login() {
    const matricNumber = document.getElementById('matric-number').value;
    const password = document.getElementById('login-password').value;
    const userType = document.getElementById('login-type').value; // Get selected user type
    
    if (!matricNumber || !password) {
        showToast('Please enter your credentials.', 'error');
        return;
    }
    console.log('Attempting login with:', { matricNumber, password });
    
    try {
        const result = await auth.login(matricNumber, password, userType);  // Pass userType to auth.login
        
        if (result.success) {
            showSuccess('Access Granted!', 'Welcome to MAPOLY Accountancy Portal', 'Loading your dashboard...');
            
            setTimeout(() => {
                showDashboard();
                loadDashboardData(result.user);
            }, 2000);
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Login failed: ' + error.message, 'error');
    }
}
function updateLoginState() {
    const isLoggedIn = window.auth ? (window.auth.isLoggedIn || sessionStorage.getItem('currentUser') !== null) : false;
    const logoutLink = document.getElementById('logout-link');
    const mobileLogout = document.getElementById('mobile-logout')
    
    if (logoutLink) {
        logoutLink.style.display = isLoggedIn ? 'inline-block' : 'none';
    }
    if (mobileLogout) {
        mobileLogout.style.display = isLoggedIn ? 'block' : 'none';
    }
    // Update footer links
    const loginLinks = document.querySelectorAll('.footer-links a[onclick*="login"]');
    const registerLinks = document.querySelectorAll('.footer-links a[onclick*="register"]');
    
    if (isLoggedIn) {
        loginLinks.forEach(link => link.style.display = 'none');
        registerLinks.forEach(link => link.style.display = 'none');
    } else {
        loginLinks.forEach(link => link.style.display = 'inline-block');
        registerLinks.forEach(link => link.style.display = 'inline-block');
    }
}
// function showStudentTab(tabName) {
//     studentPortal.showStudentTab(tabName);
// }
// Update your existing showStudentTab function
function showStudentTab(tabName) {
    console.log('Showing tab:', tabName);
    // Update URL hash without triggering navigation
    history.pushState({ tab: tabName }, '', `#student-${tabName}`);
    
    // Update sidebar navigation items (the vertical menu)
    document.querySelectorAll('#dashboard-section .nav-item, #student-dashboard .nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Find and activate the clicked sidebar item
    const sidebarItem = document.querySelector(`#dashboard-section .nav-item[onclick*="'${tabName}'"], #student-dashboard .nav-item[onclick*="'${tabName}'"]`);
    if (sidebarItem) {
        sidebarItem.classList.add('active');
    }
    // FIRST: Hide ALL possible content areas
    // Hide dashboard grid
    const dashboardGrid = document.getElementById('dashboard-grid');
    if (dashboardGrid) {
        dashboardGrid.style.display = 'none';
    }
    
    // Hide all tab contents
    document.querySelectorAll('#student-dashboard .tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.style.display = 'none';
    });
    // SPECIAL HANDLING FOR DASHBOARD TAB
    if (tabName === 'dashboard') {
        // Show the dashboard-grid
        if (dashboardGrid) {
            dashboardGrid.style.display = 'grid';
            dashboardGrid.classList.add('active');
            // Load dashboard content
            if (typeof loadDashboardOverview === 'function') loadDashboardOverview();
        }
        return;
    }
    // Handle special case for registration tab (which might not have a matching ID)
    let tabId = tabName;
    if (tabName === 'registration') {
        tabId = 'registration'; // Make sure this matches your HTML ID
    }
    
    // Show the selected tab content
    const activeTab = document.getElementById(`${tabId}-tab`);
    if (activeTab) {
        activeTab.classList.add('active');
        activeTab.style.display = 'block';
        
        // Load data based on tab
        switch(tabName) {
            case 'courses':
                if (typeof loadStudentCourses === 'function') loadStudentCourses();
                break;
            case 'results':
                console.log('Results tab clicked');
                if (typeof loadStudentResults === 'function') loadStudentResults();
                break;
            case 'fees':
                console.log('Fees tab clicked - to be implemented');
                // You can add loadStudentPayments(); here later
                activeTab.innerHTML = `
                    <div style="text-align: center; padding: 40px;">
                        <i class="fas fa-credit-card" style="font-size: 48px; color: #9CA3AF;"></i>
                        <h3 style="margin-top: 20px; color: #1F2937;">Fees & Payments</h3>
                        <p style="margin-top: 10px; color: #6B7280;">Your fee payment history will appear here.</p>
                    </div>
                `;
                break;
            case 'profile':
                console.log('Profile tab clicked');
                if (typeof loadStudentProfile === 'function') loadStudentProfile();
                break;
            case 'registration':
                if (typeof loadCourseRegistration === 'function') loadCourseRegistration();
                break;
            default:
                console.log('Unknown tab:', tabName);
                break;
        }
    } else {
        console.error(`Tab with id "${tabId}-tab" not found`);
        // If registration tab doesn't exist, create it on the fly
        if (tabName === 'registration' && typeof createRegistrationTab === 'function') {
            createRegistrationTab();
            if (typeof loadCourseRegistration === 'function') loadCourseRegistration();
        }
    }
}
// Helper function to create registration tab if it doesn't exist
function createRegistrationTab() {
    const dashboardContent = document.querySelector('.dashboard-content-area');
    if (dashboardContent && !document.getElementById('registration-tab')) {
        const newTab = document.createElement('div');
        newTab.id = 'registration-tab';
        newTab.className = 'tab-content';
        dashboardContent.appendChild(newTab);
        console.log('Created registration tab dynamically');
    }
}
// Load student profile
async function loadStudentProfile() {
    console.log('Loading student profile...');
    
    const profileTab = document.getElementById('profile-tab');
    if (!profileTab) return;
    
    try {
        const user = auth.getCurrentUser();
        const studentProfile = auth.getStudentProfile(user?.id);
        
        profileTab.innerHTML = `
            <div class="dashboard-card">
                <div class="card-header">
                    <h3><i class="fas fa-user-circle"></i> Profile Information</h3>
                </div>
                <div class="card-content" style="padding: 20px;">
                    <div style="display: flex; align-items: center; gap: 30px; margin-bottom: 30px; flex-wrap: wrap;">
                        <div style="position: relative;">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${studentProfile?.matricNumber || 'student'}" 
                                style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid #003366;">
                            <span style="position: absolute; bottom: 5px; right: 5px; width: 15px; height: 15px; background: #10B981; border-radius: 50%; border: 2px solid white;"></span>
                        </div>
                        <div>
                            <h2 style="font-size: 24px; color: #1F2937; margin-bottom: 5px;">${studentProfile?.fullName || 'N/A'}</h2>
                            <p style="color: #6B7280;">${studentProfile?.matricNumber || 'N/A'}</p>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                        <div style="background: #F9FAFB; padding: 15px; border-radius: 8px;">
                            <p style="color: #6B7280; font-size: 13px; margin-bottom: 5px;">Email Address</p>
                            <p style="color: #1F2937; font-weight: 500;">${studentProfile?.email || user?.email || 'N/A'}</p>
                        </div>
                        <div style="background: #F9FAFB; padding: 15px; border-radius: 8px;">
                            <p style="color: #6B7280; font-size: 13px; margin-bottom: 5px;">Phone Number</p>
                            <p style="color: #1F2937; font-weight: 500;">${studentProfile?.phone || user?.phone || 'N/A'}</p>
                        </div>
                        <div style="background: #F9FAFB; padding: 15px; border-radius: 8px;">
                            <p style="color: #6B7280; font-size: 13px; margin-bottom: 5px;">Department</p>
                            <p style="color: #1F2937; font-weight: 500;">${studentProfile?.department || 'Accountancy'}</p>
                        </div>
                        <div style="background: #F9FAFB; padding: 15px; border-radius: 8px;">
                            <p style="color: #6B7280; font-size: 13px; margin-bottom: 5px;">Programme</p>
                            <p style="color: #1F2937; font-weight: 500;">${studentProfile?.programme || 'ND Accountancy'}</p>
                        </div>
                        <div style="background: #F9FAFB; padding: 15px; border-radius: 8px;">
                            <p style="color: #6B7280; font-size: 13px; margin-bottom: 5px;">Current Level</p>
                            <p style="color: #1F2937; font-weight: 500;">${studentProfile?.level || 'ND II'}</p>
                        </div>
                        <div style="background: #F9FAFB; padding: 15px; border-radius: 8px;">
                            <p style="color: #6B7280; font-size: 13px; margin-bottom: 5px;">CGPA</p>
                            <p style="color: #1F2937; font-weight: 500;">${studentProfile?.cgpa || '0.00'}</p>
                        </div>
                        <div style="background: #F9FAFB; padding: 15px; border-radius: 8px;">
                            <p style="color: #6B7280; font-size: 13px; margin-bottom: 5px;">Status</p>
                            <p><span class="badge active">${studentProfile?.status || 'Active'}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading profile:', error);
        profileTab.innerHTML = `<p>Error loading profile</p>`;
    }
}
// Make sure this function is globally available
function showHODTab(tabName) {
    console.log('Showing HOD tab:', tabName);
    
    // Update URL hash - THIS IS THE KEY LINE
    history.pushState({ tab: tabName, userType: 'hod' }, '', `#hod-${tabName}`);
    
    // Update active nav item
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Try different selector patterns
    const activeNav = document.querySelector(`.admin-nav-item[onclick*="'${tabName}'"]`) || 
                      document.querySelector(`.admin-nav-item[onclick*="${tabName}"]`) ||
                      document.querySelector(`.admin-nav-item a[href="#${tabName}"]`);
    
    if (activeNav) {
        activeNav.classList.add('active');
    } else {
        // Fallback: find by text content
        document.querySelectorAll('.admin-nav-item').forEach(item => {
            const span = item.querySelector('span');
            if (span && span.textContent.toLowerCase().includes(tabName.replace('-', ' '))) {
                item.classList.add('active');
            }
        });
    }
    
    // Hide all tab contents
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    const activeTab = document.getElementById(`hod-${tabName}-tab`);
    if (activeTab) {
        activeTab.classList.add('active');
        
        // Load data based on tab
        switch(tabName) {
            case 'students':
                if (typeof loadHODStudents === 'function') {
                    console.log('Loading students...');
                    loadHODStudents();
                }
                break;
            case 'courses':
                if (typeof loadHODCourses === 'function') {
                    console.log('Loading courses...');
                    loadHODCourses();
                }
                break;
            case 'course-forms':
                if (typeof loadHODCourseForms === 'function') {
                    console.log('Loading course forms...');
                    loadHODCourseForms();
                }
                break;
            case 'upload-results':
                if (typeof loadUploadResults === 'function') {
                    console.log('Loading upload results...');
                    loadUploadResults();
                }
                break;
            case 'attendance':
                if (typeof loadAttendanceManagement === 'function') {
                    console.log('Loading attendance...');
                    loadAttendanceManagement();
                }
                break;
            case 'reports':
                if (typeof loadReports === 'function') {
                    console.log('Loading reports...');
                    loadReports();
                }
                break;
            case 'profile':
                if (typeof loadHODProfile === 'function') {
                    console.log('Loading profile...');
                    loadHODProfile();
                }
                break;
            default:
                // Overview tab - already has content
                console.log('Showing overview tab');
                break;
        }
    } else {
        console.error(`Tab with id "hod-${tabName}-tab" not found`);
    }
}
// Payment Modal
function showPaymentModal() {
    const modalContent = `
        <div class="modal">
            <div class="modal-header">
                <h3><i class="fas fa-credit-card"></i> Make Payment</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Payment Type *</label>
                    <select class="form-input" id="payment-type">
                        <option value="school_fees">School Fees</option>
                        <option value="department_fees">Department Fees</option>
                        <option value="acceptance_fee">Acceptance Fee</option>
                        <option value="hostel_fee">Hostel Fee</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Amount (₦) *</label>
                    <input type="number" class="form-input" id="payment-amount" placeholder="Enter amount">
                </div>
                <div class="form-group">
                    <label>Academic Year *</label>
                    <select class="form-input" id="payment-year">
                        <option value="2023/2024">2023/2024</option>
                        <option value="2024/2025">2024/2025</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Semester *</label>
                    <select class="form-input" id="payment-semester">
                        <option value="1">First Semester</option>
                        <option value="2">Second Semester</option>
                    </select>
                </div>
                <button class="btn btn-primary" onclick="processPayment()">
                    <i class="fas fa-lock"></i> Proceed to Payment
                </button>
                <p class="modal-note">
                    <i class="fas fa-info-circle"></i>
                    You will be redirected to a secure payment gateway
                </p>
            </div>
        </div>
    `;
    
    document.getElementById('modal-container').innerHTML = modalContent;
    document.getElementById('modal-container').style.display = 'flex';
}
// Course Form Approval
async function approveCourseForm(formId) {
    if (!confirm('Approve this course form?')) return;
    
    try {
        const response = await fetch('/api/hod/approve-form/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({
                form_id: formId,
                action: 'approve'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            hodPortal.loadHODCourseForms();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        console.error('Error approving form:', error);
        showToast('Failed to approve form', 'error');
    }
}
async function rejectCourseForm(formId) {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
        const response = await fetch('/api/hod/approve-form/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({
                form_id: formId,
                action: 'reject',
                reason: reason
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            hodPortal.loadHODCourseForms();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        console.error('Error rejecting form:', error);
        showToast('Failed to reject form', 'error');
    }
}
// Print Transcript
function printTranscript() {
    window.open('/api/student/print-transcript/', '_blank');
}
// ===========================================
// GLOBAL FUNCTIONS
// ===========================================
// Show view function
function showView(viewName, event) {
    console.log('showView called with:', viewName);

    // Prevent default anchor behavior if event exists
    if (event) {
        event.preventDefault();
    }
    
    console.log('showView called with:', viewName);

    // Double-check if user is logged in by checking storage directly
    const hasSession = sessionStorage.getItem('currentUser') !== null;
    const hasLocalUser = window.auth && window.auth.currentUser !== null;
    
    // If any storage indicates user is logged in, clear it and refresh
    if (hasSession || hasLocalUser) {
        console.log('Found leftover session data, clearing...');
        sessionStorage.clear();
        localStorage.clear();
        if (window.auth) {
            window.auth.currentUser = null;
            window.auth.isLoggedIn = false;
        }
    }
    
    // Only proceed if user is not logged in
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    const targetView = document.getElementById(`${viewName}-view`)
    if (targetView) {
        targetView.classList.add('active');
        // Update URL for welcome portal only
        history.pushState({ view: viewName }, '', `#${viewName}`);
    }
    
    // Close mobile menu
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.classList.remove('active');
    }
    
    // Reset registration steps if going back to selector
    if (viewName === 'selector') {
        currentRegisterStep = 1;
        updateRegisterProgress();
    }

    // If we're showing register, reset the form
    if (viewName === 'register') {
        resetRegistrationForm();
    }
}

// Add this function to reset the registration form
function resetRegistrationForm() {
    // Reset to step 1
    currentRegisterStep = 1;
    updateRegisterProgress();
    
    // Clear all input fields
    document.getElementById('full-name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('register-password').value = '';
    document.getElementById('confirm-password').value = '';
    document.getElementById('register-matric').value = '';
    document.getElementById('department').value = '';
    document.getElementById('programme').value = '';
    document.getElementById('level').value = '';
    document.getElementById('terms').checked = false;
    
    // Hide verification section
    document.getElementById('verification-section').style.display = 'none';
    
    // Clear any stored verification data
    sessionStorage.removeItem('email_verified');
    sessionStorage.removeItem('verified_email');
    
    // Reset password strength indicators
    if (typeof checkPasswordStrength === 'function') checkPasswordStrength();
    if (typeof checkPasswordMatch === 'function') checkPasswordMatch();
}

// Toggle mobile menu
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('active');
}
// Update toggle function
function toggleDashboardSidebar() {
    console.log('toggleDashboardSidebar called');
    
    const sidebar = document.getElementById('dashboardSidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
        console.log('Sidebar toggled. Active:', sidebar.classList.contains('active'));
    } else {
        console.error('Sidebar element not found');
    }
}
// Close sidebar when clicking outside on mobile
function setupSidebarCloseOnClickOutside() {
    console.log('Setting up sidebar close on outside click');
    const sidebar = document.getElementById('dashboardSidebar');
    const menuToggle = document.querySelector('.mobile-sidebar-toggle');
    
    if (!sidebar) {
        console.error('Sidebar element not found in setup');
        return
    };
    function handleOutsideClick(event) {
        // Only on mobile screens (below 992px as per your CSS)
        if (window.innerWidth > 991) return;
        // If sidebar is not active, do nothing
        if (!sidebar.classList.contains('active')) return;
        // Check if click is outside sidebar and not on the toggle button
        const isClickInsideSidebar = sidebar.contains(event.target);
        const isClickOnToggle = menuToggle && menuToggle.contains(event.target);
        if (!isClickInsideSidebar && !isClickOnToggle) {
            sidebar.classList.remove('active');
            console.log('Sidebar closed by outside click');
        }
    }
    
    // Remove any existing event listener first to avoid duplicates
    document.removeEventListener('click', handleOutsideClick);
    
    // Add new event listener
    document.addEventListener('click', handleOutsideClick);
}
// Also close sidebar when window is resized above mobile breakpoint
function handleResize() {
    const sidebar = document.getElementById('dashboardSidebar');
    if (!sidebar) return;
    
    if (window.innerWidth > 991) {
        // On desktop, ensure sidebar is visible and remove active class
        sidebar.classList.remove('active');
    }
}
// Add this function to close sidebar on nav item click (mobile only)
function setupNavItemCloseSidebar() {
    const navItems = document.querySelectorAll('#dashboard-section .nav-item, #student-dashboard .nav-item, #dashboard-section .action-btn, #student-dashboard .action-btn');
    const sidebar = document.querySelector('#dashboardSidebar, .sidebar');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Only on mobile
            if (window.innerWidth <= 991 && sidebar) {
                setTimeout(() => {
                    console.log('Removing sidebar');
                    sidebar.classList.remove('active');
                }, 100); // Small delay to allow navigation first
            }
        });
    });
    console.log('Nav item close sidebar handler attached');
}
// Toggle notifications
function toggleNotifications() {
    const panel = document.getElementById('notifications-panel');
    panel.classList.toggle('show');
}
// Show toast notification
function showToast(message, type = 'success') {
    console.log('Showing toast:', { message, type });
    const toast = document.getElementById('toast');
    if (!toast) {
        console.error('Toast element not found!');
        return;
    }
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    console.log('Toast content set:', toast.textContent);
    console.log('Toast class:', toast.className);
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}
// Open modal
function openModal(modalType) {
    const modalContainer = document.getElementById('modal-container');
    
    let modalContent = '';
    switch (modalType) {
        case 'course-reg':
            modalContent = `
                <div class="modal">
                    <div class="modal-header">
                        <h3><i class="fas fa-plus-circle"></i> Course Registration</h3>
                        <button class="modal-close" onclick="closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>Course registration functionality will be implemented here.</p>
                        <button class="btn btn-primary" onclick="closeModal()">Close</button>
                    </div>
                </div>
            `;
            break;
        case 'result-check':
            modalContent = `
                <div class="modal">
                    <div class="modal-header">
                        <h3><i class="fas fa-search"></i> Check Result</h3>
                        <button class="modal-close" onclick="closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>Result checking functionality will be implemented here.</p>
                        <button class="btn btn-primary" onclick="closeModal()">Close</button>
                    </div>
                </div>
            `;
            break;
    }
    
    modalContainer.innerHTML = modalContent;
    modalContainer.style.display = 'flex';
}
// Close modal
function closeModal() {
    document.getElementById('modal-container').style.display = 'none';
}
// Mark all notifications as read
function markAllAsRead() {
    dashboard.notifications.forEach(notification => {
        notification.read = true;
    });
    dashboard.updateNotificationDisplay();
    showToast('All notifications marked as read.', 'success');
}
// Quick Actions Functions
function quickCourseReg() {
    showStudentTab('registration');
}

function quickCheckResult() {
    showStudentTab('results');
}

function quickPrintForm() {
    // Check if there's an approved registration ready for printing
    checkRegistrationStatusForPrint();
}

function quickViewAttendance() {
    showToast('Attendance feature coming soon', 'info');
}

// Function to check registration status and show print button
async function checkRegistrationStatusForPrint() {
    try {
        const response = await fetch('/api/student/registration-status/');
        const data = await response.json();
        
        const printBtn = document.getElementById('print-form-btn');
        if (printBtn) {
            if (data.hasRegistration && data.registration.status === 'approved') {
                printBtn.style.display = 'flex';
                printBtn.onclick = () => printCourseForm(data.registration.id);
            }
        }
    } catch (error) {
        console.error('Error checking registration status:', error);
    }
}

// Update the updateQuickActions function to show fee badge
function updateQuickActions(dashboard) {
    const financial = dashboard.financial || {};
    const feeBadge = document.getElementById('fee-badge');
    const printBtn = document.getElementById('print-form-btn');
    
    // Show fee badge if fees are due
    if (financial.feesStatus === 'unpaid' || financial.feesStatus === 'partial') {
        if (feeBadge) {
            feeBadge.style.display = 'inline-block';
            feeBadge.textContent = financial.feesStatus === 'unpaid' ? 'Due' : 'Partial';
        }
    }
    
    // Check if there's an approved registration ready for printing
    checkRegistrationStatusForPrint();
}

// Print course form
async function printCourseForm(registrationId) {
    try {
        window.open(`/api/student/print-course-form/${registrationId}/`, '_blank');
        showToast('Course form generated successfully', 'success');
    } catch (error) {
        console.error('Error printing course form:', error);
        showToast('Failed to generate course form', 'error');
    }
}
// ===========================================
// REGISTRATION FUNCTIONS
// ===========================================
let currentRegisterStep = 1;
function nextRegisterStep() {
    if (currentRegisterStep < 3) {
        // Check if step 1 needs verification
        if (currentRegisterStep === 1) {
            const email = document.getElementById('email').value;
            const isVerified = sessionStorage.getItem('email_verified') === 'true' && sessionStorage.getItem('verified_email') === email;
            if (!isVerified) {
                showToast('Please verify your email first.', 'error');
                return;
            }
        }
        if (!validateCurrentStep()) {
            showToast('Please complete all required fields.', 'error');
            return;
        }
        currentRegisterStep++;
        updateRegisterProgress();
    }
}
function prevRegisterStep() {
    if (currentRegisterStep > 1) {
        currentRegisterStep--;
        updateRegisterProgress();
    }
}
function validateCurrentStep() {
    switch (currentRegisterStep) {
        case 1:
            const email = document.getElementById('email').value;
            const fullName = document.getElementById('full-name').value;
            const phone = document.getElementById('phone').value;
            
            if (!email || !fullName || !phone) {
                return false;
            }
            
            const verificationSection = document.getElementById('verification-section');
            if (verificationSection.style.display === 'block') {
                const verificationCode = document.getElementById('verification-code').value;
                if (!verificationCode || verificationCode.length !== 6) {
                    return false;
                }
            }
            return true;
            
        case 2:
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (!password || password.length < 8) {
                return false;
            }
            
            if (password !== confirmPassword) {
                return false;
            }
            return true;
            
        case 3:
            const matric = document.getElementById('register-matric').value;
            const department = document.getElementById('department').value;
            const programme = document.getElementById('programme').value;
            const level = document.getElementById('level').value;
            const terms = document.getElementById('terms').checked;
            
            if (!matric || !department || !programme || !level || !terms) {
                return false;
            }
            return true;
    }
    return true;
}
function updateRegisterProgress() {
    // Update progress steps
    document.querySelectorAll('.register-step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById(`register-step${currentRegisterStep}`).classList.add('active');
    
    // Update progress visual
    const progressSteps = document.querySelectorAll('.progress-step');
    progressSteps.forEach((step, index) => {
        if (index + 1 <= currentRegisterStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // Update progress line
    const progressLine = document.querySelector('.progress-fill');
    if (progressLine) {
        progressLine.style.width = `${((currentRegisterStep - 1) / 2) * 100}%`;
    }
}
async function sendVerificationCode() {
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    
    if (!email || !email.includes('@')) {
        showToast('Please enter a valid email address.', 'error');
        return;
    }

    if (!phone || phone.length < 11) {
        showToast('Please enter a valid phone number.', 'error');
        return;
    }

    // Show loading state on button
    const sendBtn = document.querySelector('#register-step1 .btn-secondary');
    const originalText = sendBtn.innerHTML;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
    sendBtn.disabled = true;

    try {
        // FIRST: Check if email is already registered
        const emailCheckResponse = await fetch('/api/check-email/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({ email: email })
        });

        const emailCheckData = await emailCheckResponse.json();

        if(emailCheckData.exists) {
            // Email already exists - show erro and don't send code
            showToast('This email is already registered. Please use a different email or login.', 'error');
            sendBtn.innerHTML = originalText;
            sendBtn.disabled = false;
            return
        }

        // SECOND: Check if phone is already registered
        const phoneCheckResponse = await fetch('/api/check-phone/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({ phone: phone })
        });
        
        const phoneCheckData = await phoneCheckResponse.json();
        
        if (phoneCheckData.exists) {
            showToast('This phone number is already registered. Please use a different number.', 'error');
            sendBtn.innerHTML = originalText;
            sendBtn.disabled = false;
            return;
        }

        // If email is available, proceed with sending verification code
        const result = await auth.sendVerificationCode(email);

        if (result.success) {
            // Show verification section
            const verificationSection = document.getElementById('verification-section');
            verificationSection.style.display = 'block';
            
            showToast('Verification code sent to your email!', 'success');
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        console.error('Error checking email:', error);
        showToast('Network error. Please try again.', 'error');
    } finally {
        sendBtn.innerHTML = originalText;
        sendBtn.disabled = false;
    }
}
// Add CSRF token helper function
function getCSRFToken() {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
async function verifyEmailCode() {
    const email = document.getElementById('email').value;
    const code = document.getElementById('verification-code').value;
    console.log('=== DEBUG verifyEmailCode ===');
    console.log('Email:', email);
    console.log('Code:', code);
    
    if (!email || !code || code.length !== 6) {
        console.log("Validation failed");
        showToast('Please enter the 6-digit verification code.', 'error');
        return;
    }
    console.log('Verifying code:', { email, code });
    
    try {
        const response = await fetch('/api/verify-code/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({ email, code })
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        const text = await response.text();
        console.log('Raw response text:', text);
        
        let result;
        try {
            result = JSON.parse(text);
            console.log('Parsed JSON:', result);
            showToast('Parsed JSON:', 'success')
        } catch (e) {
            console.error('Failed to parse JSON:', e);
            console.log('Response was not JSON:', text.substring(0, 100));
            showToast('Server returned invalid response', 'error')
        }
        
        if (result.success) {
            console.log('Success! Proceeding to next step');
            showToast(result.message || 'Email verified successfully!', 'success');
            // Store verification status
            sessionStorage.setItem('email_verified', 'true');
            sessionStorage.setItem('verified_email', email);
            nextRegisterStep();
        } else {
            showToast(result.message || 'Verification failed', 'error');
        }
    } catch (error) {
        console.error('Error in verifyEmailCode:', error);
        showToast('Network error. Please try again.', 'error');
    }
}
async function register() {
    console.log('=== Starting registration ===');
    // Temporary debug - add this at the beginning of your register() function
    // console.log('=== MAIN REGISTER FUNCTION CALLED ===');
    // console.log('Is function async?', register.constructor.name === 'AsyncFunction');
    // console.log('Function toString:', register.toString().substring(0, 100));
    
    // Collect form data
    const userData = {
        fullName: document.getElementById('full-name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        password: document.getElementById('register-password').value,
        matricNumber: document.getElementById('register-matric').value,
        department: document.getElementById('department').value,
        programme: document.getElementById('programme').value,
        level: document.getElementById('level').value
    };
    console.log('User data:', userData);
    
    // Check terms agreement
    if (!document.getElementById('terms').checked) {
        showToast('You must agree to the Terms of Service.', 'error');
        return;
    }
    // Validate all fields
    for (const [key, value] of Object.entries(userData)) {
        if (!value || value.trim() === '') {
            showToast(`Please fill in the ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`, 'error');
            return;
        }
    }

    // Validate phone number format (Nigerian numbers)
    const phoneRegex = /^\+234[0-9]{10}$/;
    if (!phoneRegex.test(userData.phone)) {
        showToast('Please enter a valid Nigerian phone number in format: +2348012345678', 'error');
        return;
    }

    try {
        console.log('Calling auth.register() with:', userData);
        const result = await auth.register(userData);
        console.log('Regisition result:', result);

        if (result && result.success) {
            showSuccess('Registration Complete!', 'Your account has been created successfully.', 'Redirecting to login...');
            
            setTimeout(() => {
                // Clear the register hash first
                history.replaceState(null, null, '#login');
                showView('login');
                document.getElementById('matric-number').value = userData.matricNumber;
            }, 3000);
        } else {
            // Handle undefined or failed result
            const errorMessage = result ? result.message : 'Registration failed. Please try again.';
            console.error('Registration failed:', errorMessage);
            showToast(errorMessage, 'error');
        }   
    } catch (error) {
        console.error('Registration error:', error);
        showToast('Registration failed due to a network error.', 'error');
    }
}
// ===========================================
// LOGIN FUNCTIONS
// ===========================================
let currentLoginStep = 1;
function nextLoginStep() {
    console.log("currentLoginStep before function:", currentLoginStep);
    
    const matricNumber = document.getElementById('matric-number').value;
    const userType = document.getElementById('login-type').value;

    if (!matricNumber) {
        showToast('Please enter your matriculation number.', 'error');
        return;
    }

    // Optional: Quick check if matric format matches user type
    // This is just a helpful hint, not a strict validation
    if (userType === 'student' && !matricNumber.includes('/')) {
        showToast('Student matric numbers usually contain "/" (e.g., 21/003/f/002)', 'warning');
    } else if (userType === 'hod' && !matricNumber.startsWith('HOD/')) {
        showToast('HOD matric numbers usually start with "HOD/"', 'warning');
    } else if (userType === 'admin' && !matricNumber.startsWith('ADMIN/')) {
        showToast('Admin matric numbers usually start with "ADMIN/"', 'warning');
    }
    
    currentLoginStep = 2;
    updateLoginProgress();
}
function updateLoginProgress() {
    document.getElementById('login-step1').classList.remove('active');
    document.getElementById('login-step2').classList.add('active');
    
    document.getElementById('login-step-1').classList.remove('active');
    document.getElementById('login-step-2').classList.add('active');
    
    setTimeout(() => {
        document.getElementById('login-password').focus();
    }, 100);
}
// ===========================================
// FORGOT PASSWORD FUNCTIONS
// ===========================================
function sendPasswordReset() {
    const matric = document.getElementById('forgot-matric').value;
    const email = document.getElementById('forgot-email').value;
    
    if (!matric || !email) {
        showToast('Please enter your matriculation number and email.', 'error');
        return;
    }
    
    const result = auth.forgotPassword(email);
    
    if (result.success) {
        showToast('Password reset instructions sent! Check your email.', 'success');
        setTimeout(() => {
            showView('login');
        }, 3000);
    } else {
        showToast(result.message, 'error');
    }
}
// ===========================================
// DASHBOARD FUNCTIONS
// ===========================================
function showWelcomePortal() {
    document.getElementById('welcome-portal').style.display = 'block';
    document.getElementById('dashboard-section').style.display = 'none';
    document.getElementById('student-dashboard').style.display = 'none';
    document.getElementById('hod-dashboard').style.display = 'none';

    // Show selector view
    showView('selector');
    
    // Update login state
    if (typeof window.updateLoginState === 'function') {
        window.updateLoginState();
    }
}

function showDashboard() {
    document.getElementById('welcome-portal').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
    document.getElementById('dashboard-loading').style.display = 'none';
    updateLoginState()
}

async function loadDashboardData(user) {
    console.log('Loading dashboard for user:', user);

    // Hide loading screen
    const loadingScreen = document.getElementById('dashboard-loading');
    if (loadingScreen) loadingScreen.style.display = 'none';

    // Hide all dashboard sections first
    document.getElementById('dashboard-section').style.display = 'none';
    document.getElementById('student-dashboard').style.display = 'none';
    document.getElementById('hod-dashboard').style.display = 'none';

    // Check user type and load appropriate dashboard
    if (user.userType === 'hod' || user.userType === 'admin' || user.userType === 'staff') {
        console.log('Loading HOD dashboard...');
        document.getElementById('hod-dashboard').style.display = 'block';

        // Set HOD name immediately from user object (don't wait for API)
        const hodNameElement = document.getElementById('hod-name');
        const hodWelcomeName = document.getElementById('hod-welcome-name');
        const hodSidebarName = document.getElementById('hod-sidebar-name');
        const hodSidebarDept = document.getElementById('hod-sidebar-dept');
        
        if (hodNameElement) hodNameElement.textContent = user.fullName || 'Loading';
        if (hodWelcomeName) hodWelcomeName.textContent = (user.fullName || 'Loading').split(' ')[0];
        if (hodSidebarName) hodSidebarName.textContent = user.fullName || 'Loading';
        if (hodSidebarDept) hodSidebarDept.textContent = user.department || 'Loading';
        
        // Load HOD dashoard
        if (window.hodPortal) {
            await hodPortal.loadHODDashboard();   
        }
        // Load pending registrations
        if (typeof loadPendingRegistrations === 'function') loadPendingRegistrations();
        // Load courses
        if (typeof loadHODCourses === 'function') loadHODCourses();

        // Check URL hash for which tab to show
        const hash = window.location.hash.replace('#', '');
        console.log('Current hash:', hash);

        if (hash.startsWith('hod-')) {
            const tabName = hash.substring(4); // Remove 'hod-' prefix
            console.log('Opening HOD tab:', tabName);
            
            // Use the correct function
            if (typeof showHODTab === 'function') {
                showHODTab(tabName);
            } else if (window.hodPortal && typeof window.hodPortal.showHODTab === 'function') {
                window.hodPortal.showHODTab(tabName);
            }
        } else {
            // No hash or invalid hash, default to overview
            if (window.hodPortal && typeof window.hodPortal.showHODTab === 'function') {
                window.hodPortal.showHODTab('overview')
            } else if (typeof showHODTab === 'function') {
                showHODTab('overview');
            }
        }
    } else {
        console.log('Loading student dashboard...');
        // Load student dashboard
        document.getElementById('student-dashboard').style.display = 'block';
        // Update student info
        const studentProfile = auth.getStudentProfile(user.id);
        document.getElementById('student-name').textContent = studentProfile?.fullName || user.fullName || 'Student';
        document.getElementById('student-matric').textContent = studentProfile?.matricNumber || user.matricNumber || '21/003/f/002';
        document.getElementById('student-programme').textContent = studentProfile?.programme || user.programme || 'Accountancy';
        // Update avatar with student's matric number
        const avatarImg = document.querySelector('#student-avatar img');
        if (avatarImg) {
            avatarImg.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentProfile.matricNumber || 'Student'}`;
        }
        
        // Load student dashboard data if studentPortal exists
        if (window.studentPortal) {
            await window.studentPortal.loadStudentDashboard();
        }
        // Load registration status
        if (typeof loadRegistrationStatus === 'function') loadRegistrationStatus();
        
        // Determine which tab to show based on URL hash
        // Check URL hash for student tab
        const hash = window.location.hash.replace('#', '');

        if (hash.startsWith('student-')) {
            // Extract tab name without the 'student-' prefix
            const tabName = hash.substring(8);
            if (typeof showStudentTab === 'function') {
                // Show the tab from URL hash
                showStudentTab(tabName);
            } else {
                // Default to dashboard
                showStudentTab('dashboard');
            }
        } else {
            showStudentTab('dashboard');
        }
    }
    updateLoginState();
}
async function logout() {
    return performLogout()
}
// Separate function for logout
// async function performLogout() {
//     if (confirm('Are you sure you want to logout?')) {
//         try {
//             const response = await fetch('/api/logout/', {
//                 method: 'POST',
//                 headers: {
//                     'X-CSRFToken': window.getCSRFToken() ? window.getCSRFToken() : '',
//                 }
//             });
            
//             const data = await response.json();
            
//             if (data.success) {
//                 showToast('Logged out successfully!', 'success');
//             }
//         } catch (error) {
//             console.error('Logout error:', error);
//         } finally {
//             // Clear all stored data
//             if (window.auth) {
//                 window.auth.currentUser = null;
//                 window.auth.isLoggedIn = false;
//             }
//             sessionStorage.clear();
//             localStorage.clear();

//             //IMPORTANT: Clear the hash from URL
//             history.pushState(null, null, ' '); // Clears the hash
//             // or use: window.location.hash = '';
            
//             // Show welcome portal
//             window.showWelcomePortal();
//         }
//     }
// }
// Separate function for logout
async function performLogout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            const response = await fetch('/api/logout/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': window.getCSRFToken ? window.getCSRFToken() : '',
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                showToast('Logged out successfully!', 'success');
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear ALL stored data
            if (window.auth) {
                window.auth.currentUser = null;
                window.auth.isLoggedIn = false;
            }
            
            // Clear all storage
            sessionStorage.clear();
            localStorage.clear();
            
            // Clear any cookies related to session (if any)
            document.cookie.split(";").forEach(function(c) { 
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
            
            // IMPORTANT: Clear the hash and redirect to selector
            window.location.hash = '';
            
            // Use a slight delay to ensure everything is cleared
            setTimeout(() => {
                // Force show welcome portal
                document.getElementById('welcome-portal').style.display = 'block';
                document.getElementById('dashboard-section').style.display = 'none';
                document.getElementById('student-dashboard').style.display = 'none';
                document.getElementById('hod-dashboard').style.display = 'none';
                
                // Show selector view
                showView('selector');
                
                // Update login state
                updateLoginState();
            }, 100);
        }
    }
}
function setActiveTab(tabName) {
    dashboard.setActiveTab(tabName);
}
// ===========================================
// PASSWORD STRENGTH FUNCTIONS
// ===========================================
function checkPasswordStrength() {
    const password = document.getElementById('register-password').value;
    const strengthFill = document.getElementById('strength-fill');
    const strengthText = document.getElementById('strength-text');
    
    if (!password) {
        strengthFill.style.width = '0%';
        strengthFill.style.background = '#EF4444';
        strengthText.textContent = 'Weak';
        return;
    }
    
    let strength = 0;
    
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    strength = Math.min(strength, 100);
    
    strengthFill.style.width = strength + '%';
    
    if (strength < 50) {
        strengthFill.style.background = '#EF4444';
        strengthText.textContent = 'Weak';
    } else if (strength < 75) {
        strengthFill.style.background = '#F59E0B';
        strengthText.textContent = 'Fair';
    } else {
        strengthFill.style.background = '#10B981';
        strengthText.textContent = 'Strong';
    }
}
function checkPasswordMatch() {
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const matchStatus = document.getElementById('password-match');
    
    if (!confirmPassword) {
        matchStatus.className = 'match-status';
        return;
    }
    
    if (password === confirmPassword) {
        matchStatus.className = 'match-status show valid';
        matchStatus.innerHTML = '<i class="fas fa-check-circle"></i> Passwords match';
    } else {
        matchStatus.className = 'match-status show invalid';
        matchStatus.innerHTML = '<i class="fas fa-times-circle"></i> Passwords do not match';
    }
}
// ===========================================
// HELPER FUNCTIONS
// ===========================================
function showSuccess(title, message, redirectMessage) {
    const successView = document.getElementById('success-view');
    document.getElementById('success-title').textContent = title;
    document.getElementById('success-message').textContent = message;
    document.getElementById('redirect-message').textContent = redirectMessage;
    showView('success');
}

// ===========================================
// UPDATED FUNCTIONS FOR REAL DATA
// ===========================================
// Print Transcript - Generate real PDF
window.printTranscript = async function() {
    try {
        const response = await fetch('/api/student/results/');
        const data = await response.json();
        
        if (!data.success) {
            showToast('Failed to load results', 'error');
            return;
        }
        
        const student = auth.getCurrentUser();
        const results = data.results;
        
        // Calculate CGPA
        let totalCredits = 0;
        let totalPoints = 0;
        results.forEach(r => {
            totalCredits += r.totalCreditUnits;
            totalPoints += r.totalQualityPoints;
        });
        const cgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Academic Transcript - ${student.fullName}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .title { font-size: 24px; font-weight: bold; color: #003366; }
                    .institution { font-size: 16px; color: #666; margin-top: 5px; }
                    .student-info { margin: 20px 0; padding: 20px; background: #f5f5f5; border-radius: 8px; }
                    .info-row { display: flex; margin-bottom: 10px; }
                    .info-label { width: 150px; font-weight: bold; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background: #003366; color: white; padding: 12px; text-align: left; }
                    td { padding: 10px; border-bottom: 1px solid #ddd; }
                    .summary { margin-top: 30px; text-align: right; }
                    .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
                    .print-btn { padding: 10px 20px; background: #003366; color: white; border: none; border-radius: 5px; cursor: pointer; margin-bottom: 20px; }
                    @media print {
                        .print-btn { display: none; }
                        body { padding: 20px; }
                    }
                </style>
            </head>
            <body>
                <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
                
                <div class="header">
                    <div class="title">MOSHOOD ABIOLA POLYTECHNIC</div>
                    <div class="institution">Department of Accountancy</div>
                    <div style="margin-top: 20px; font-size: 20px; font-weight: bold;">ACADEMIC TRANSCRIPT</div>
                </div>
                
                <div class="student-info">
                    <div class="info-row">
                        <span class="info-label">Student Name:</span>
                        <span>${student.fullName}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Matric Number:</span>
                        <span>${student.matricNumber}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Programme:</span>
                        <span>${student.programme || 'Accountancy'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Current Level:</span>
                        <span>${student.level || 'ND II'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">CGPA:</span>
                        <span style="font-weight: bold; color: #003366;">${cgpa}</span>
                    </div>
                </div>
                
                ${results.map(result => `
                    <h3 style="margin-top: 30px; color: #003366;">${result.academicYear} - Semester ${result.semester}</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Course Code</th>
                                <th>Course Title</th>
                                <th>Credit Unit</th>
                                <th>Grade</th>
                                <th>Grade Point</th>
                                <th>Quality Point</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${result.courses ? result.courses.map(course => `
                                <tr>
                                    <td>${course.code}</td>
                                    <td>${course.title}</td>
                                    <td>${course.creditUnits}</td>
                                    <td style="font-weight: bold; color: ${
                                        course.grade === 'A' ? '#10B981' :
                                        course.grade === 'B' ? '#3B82F6' :
                                        course.grade === 'C' ? '#F59E0B' :
                                        course.grade === 'D' ? '#EF4444' :
                                        course.grade === 'F' ? '#DC2626' : '#6B7280'
                                    }">${course.grade}</td>
                                    <td>${course.gradePoint}</td>
                                    <td>${course.qualityPoint}</td>
                                </tr>
                            `).join('') : `
                                <tr>
                                    <td colspan="6" style="text-align: center;">No courses found for this semester</td>
                                </tr>
                            `}
                            <tr style="background: #f8fafc; font-weight: bold;">
                                <td colspan="3">Semester GPA: ${result.gpa.toFixed(2)}</td>
                                <td colspan="3">Total Credit Units: ${result.totalCreditUnits}</td>
                            </tr>
                        </tbody>
                    </table>
                `).join('')}
                
                <div class="summary">
                    <p style="font-size: 18px;"><strong>Cumulative GPA (CGPA):</strong> ${cgpa}</p>
                    <p><strong>Classification:</strong> ${
                        parseFloat(cgpa) >= 4.5 ? 'Distinction' :
                        parseFloat(cgpa) >= 3.5 ? 'Upper Credit' :
                        parseFloat(cgpa) >= 2.5 ? 'Lower Credit' :
                        parseFloat(cgpa) >= 2.0 ? 'Pass' : 'Fail'
                    }</p>
                </div>
                
                <div class="footer">
                    <p>This is an official transcript from Moshood Abiola Polytechnic, Abeokuta</p>
                    <p>Generated on ${new Date().toLocaleString()}</p>
                    <p style="margin-top: 20px;">_________________________</p>
                    <p>Head of Department</p>
                </div>
                
                <script>
                    setTimeout(() => { window.print(); }, 500);
                <\/script>
            </body>
            </html>
        `);
        printWindow.document.close();
        
    } catch (error) {
        console.error('Error generating transcript:', error);
        showToast('Failed to generate transcript', 'error');
    }
};
// Load dashboard overview
async function loadDashboardOverview() {
    console.log('Loading dashboard overview...');
    
    const dashboardGrid = document.getElementById('dashboard-grid');
    if (!dashboardGrid) {
        console.error('Dashboard grid element not found');
        return;
    }
    
    try {
        // Show loading state
        dashboardGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 40px; color: #003366;"></i>
                <p style="margin-top: 20px; color: #6B7280;">Loading your dashboard...</p>
            </div>
        `;
        
        // Fetch dashboard data
        const response = await fetch('/api/student/dashboard/', {
            headers: {
                'X-CSRFToken': getCSRFToken(),
            }
        });
        
        if (!response.ok) throw new Error('Failed to load dashboard');
        
        const data = await response.json();
        
        if (data.success) {
            renderDashboardOverview(data.dashboard);
            updateQuickActions(dashboard);
        } else {
            throw new Error(data.message);
        }
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        
        // Fallback to showing data from studentPortal if available
        if (window.studentPortal && studentPortal.currentUser) {
            const dashboard = {
                student: {
                    fullName: studentPortal.currentUser.fullName,
                    level: studentPortal.currentUser.level,
                    programme: studentPortal.currentUser.programme
                },
                academic: {
                    cgpa: '0.00',
                    totalCourses: 0
                },
                financial: {
                    feesPaid: 0,
                    feesRequired: 150000,
                    feesBalance: 150000,
                    feesStatus: 'unpaid'
                },
                notifications: []
            };
            renderDashboardOverview(dashboard);
            updateQuickActions(dashboard);
        } else {
            dashboardGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #EF4444;"></i>
                    <p style="margin-top: 20px; color: #6B7280;">Failed to load dashboard. Please try again.</p>
                    <button onclick="loadDashboardOverview()" class="btn btn-primary" style="margin-top: 20px; width: auto; padding: 10px 30px;">
                        <i class="fas fa-sync-alt"></i> Retry
                    </button>
                </div>
            `;
        }
    }
}
function renderDashboardOverview(dashboard) {
    const dashboardGrid = document.getElementById('dashboard-grid');
    
    const student = dashboard.student || {};
    const academic = dashboard.academic || {};
    const financial = dashboard.financial || {};
    const notifications = dashboard.notifications || [];
    
    // Get current user for welcome message
    const user = auth.getCurrentUser();
    const firstName = student.fullName?.split(' ')[0] || user?.fullName?.split(' ')[0] || 'Student';
    
    // Determine fee status color
    const feeStatusColor = financial.feesStatus === 'paid' ? '#10B981' : 
                        financial.feesStatus === 'partial' ? '#F59E0B' : '#EF4444';
    
    let html = `
        <!- Welcome Card ->
        <div class="dashboard-card" style="grid-column: 1/-1; background: linear-gradient(135deg, #003366 0%, #001a33 100%); color: white;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
                <div>
                    <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 10px; color: white;">Welcome back, ${firstName}! 👋</h2>
                    <p style="opacity: 0.9; color: rgba(255,255,255,0.9);">${student.programme || 'Accountancy'} • Level ${student.level || 'ND II'}</p>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px 25px; border-radius: 12px; text-align: center;">
                    <p style="font-size: 14px; opacity: 0.9; margin-bottom: 5px; color: white;">Current Session</p>
                    <p style="font-size: 18px; font-weight: 600; color: white;">${academic.currentYear || '2024/2025'}</p>
                </div>
            </div>
        </div>
        
        <!- Quick Stats Cards ->
        <div class="stat-card" style="background: white; border-radius: 12px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="width: 60px; height: 60px; background: rgba(16, 185, 129, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-graduation-cap" style="font-size: 28px; color: #10B981;"></i>
                </div>
                <div>
                    <p style="font-size: 14px; color: #6B7280; margin-bottom: 5px;">Current CGPA</p>
                    <h3 style="font-size: 32px; font-weight: 700; color: #1F2937;">${academic.cgpa || '0.00'}</h3>
                </div>
            </div>
        </div>
        
        <div class="stat-card" style="background: white; border-radius: 12px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="width: 60px; height: 60px; background: rgba(59, 130, 246, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-book" style="font-size: 28px; color: #3B82F6;"></i>
                </div>
                <div>
                    <p style="font-size: 14px; color: #6B7280; margin-bottom: 5px;">Current Courses</p>
                    <h3 style="font-size: 32px; font-weight: 700; color: #1F2937;">${academic.totalCourses || 0}</h3>
                </div>
            </div>
        </div>
        
        <div class="stat-card" style="background: white; border-radius: 12px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="width: 60px; height: 60px; background: rgba(168, 85, 247, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-wallet" style="font-size: 28px; color: #A855F7;"></i>
                </div>
                <div>
                    <p style="font-size: 14px; color: #6B7280; margin-bottom: 5px;">Fees Paid</p>
                    <h3 style="font-size: 32px; font-weight: 700; color: #1F2937;">₦${(financial.feesPaid || 0).toLocaleString()}</h3>
                </div>
            </div>
        </div>
        
        <div class="stat-card" style="background: white; border-radius: 12px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="width: 60px; height: 60px; background: ${feeStatusColor}20; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-${financial.feesStatus === 'paid' ? 'check-circle' : 'exclamation-triangle'}" style="font-size: 28px; color: ${feeStatusColor};"></i>
                </div>
                <div>
                    <p style="font-size: 14px; color: #6B7280; margin-bottom: 5px;">Fee Status</p>
                    <h3 style="font-size: 24px; font-weight: 700; color: ${feeStatusColor};">${(financial.feesStatus || 'unpaid').toUpperCase()}</h3>
                </div>
            </div>
        </div>
    `;
    
    // Academic Summary Card
    html += `
        <div class="dashboard-card" style="grid-column: span 2;">
            <div class="card-header">
                <h3 style="display: flex; align-items: center; gap: 8px; color: #1F2937;">
                    <i class="fas fa-user-graduate" style="color: #003366;"></i> Academic Summary
                </h3>
            </div>
            <div class="card-content">
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                    <div>
                        <p style="color: #6B7280; font-size: 13px; margin-bottom: 5px;">Current Level</p>
                        <p style="color: #1F2937; font-weight: 600;">${student.level || 'ND II'}</p>
                    </div>
                    <div>
                        <p style="color: #6B7280; font-size: 13px; margin-bottom: 5px;">Programme</p>
                        <p style="color: #1F2937; font-weight: 600;">${student.programme || 'Accountancy'}</p>
                    </div>
                    <div>
                        <p style="color: #6B7280; font-size: 13px; margin-bottom: 5px;">Department</p>
                        <p style="color: #1F2937; font-weight: 600;">${student.department || 'Accountancy'}</p>
                    </div>
                    <div>
                        <p style="color: #6B7280; font-size: 13px; margin-bottom: 5px;">Current Semester</p>
                        <p style="color: #1F2937; font-weight: 600;">Semester ${academic.currentSemester || 1}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Financial Status Card
    html += `
        <div class="dashboard-card">
            <div class="card-header">
                <h3 style="display: flex; align-items: center; gap: 8px; color: #1F2937;">
                    <i class="fas fa-wallet" style="color: #003366;"></i> Financial Status
                </h3>
            </div>
            <div class="card-content">
                <div style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #6B7280; font-size: 14px;">Total Required:</span>
                        <span style="color: #1F2937; font-weight: 600;">₦${(financial.feesRequired || 150000).toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #6B7280; font-size: 14px;">Total Paid:</span>
                        <span style="color: #1F2937; font-weight: 600;">₦${(financial.feesPaid || 0).toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-top: 8px; border-top: 1px solid #E5E7EB;">
                        <span style="color: #6B7280; font-size: 14px;">Balance:</span>
                        <span style="color: ${(financial.feesBalance || 150000) > 0 ? '#EF4444' : '#10B981'}; font-weight: 700;">
                            ₦${((financial.feesBalance) || 150000).toLocaleString()}
                        </span>
                    </div>
                </div>
                ${(financial.feesBalance || 150000) > 0 ? `
                    <button class="btn btn-primary" onclick="showPaymentModal()" style="width: 100%;">
                        <i class="fas fa-credit-card"></i> Pay Now
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    // Recent Notifications Card
    html += `
        <div class="dashboard-card" style="grid-column: span 2;">
            <div class="card-header">
                <h3 style="display: flex; align-items: center; gap: 8px; color: #1F2937;">
                    <i class="fas fa-bell" style="color: #003366;"></i> Recent Notifications
                </h3>
                <button class="btn-sm" onclick="markAllAsRead()">Mark All Read</button>
            </div>
            <div class="card-content" id="recent-notifications-dashboard">
    `;
    
    if (notifications.length > 0) {
        notifications.slice(0, 3).forEach(notification => {
            const iconColor = notification.type === 'success' ? '#10B981' :
                            notification.type === 'warning' ? '#F59E0B' :
                            notification.type === 'error' ? '#EF4444' : '#3B82F6';
            
            html += `
                <div style="display: flex; gap: 15px; padding: 15px; border-bottom: 1px solid #F3F4F6;">
                    <div style="width: 40px; height: 40px; background: ${iconColor}20; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-${notification.type === 'success' ? 'check-circle' : 
                                        notification.type === 'warning' ? 'exclamation-triangle' : 
                                        notification.type === 'error' ? 'times-circle' : 'info-circle'}" 
                        style="color: ${iconColor};"></i>
                    </div>
                    <div style="flex: 1;">
                        <h4 style="font-size: 15px; font-weight: 600; color: #1F2937; margin-bottom: 4px;">${notification.title}</h4>
                        <p style="font-size: 13px; color: #6B7280; margin-bottom: 4px;">${notification.message}</p>
                        <small style="font-size: 11px; color: #9CA3AF;">${notification.time}</small>
                    </div>
                    ${!notification.read ? '<span style="width: 8px; height: 8px; background: #3B82F6; border-radius: 50%;"></span>' : ''}
                </div>
            `;
        });
    } else {
        html += `
            <div style="text-align: center; padding: 30px;">
                <i class="fas fa-bell-slash" style="font-size: 40px; color: #9CA3AF;"></i>
                <p style="margin-top: 15px; color: #6B7280;">No new notifications</p>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    dashboardGrid.innerHTML = html;
    dashboardGrid.style.display = 'grid';
}
// Load available courses for registration
window.loadAvailableCourses = async function() {
    try {
        const response = await fetch('/api/student/available-courses/');
        const data = await response.json();
        
        if (!data.success) {
            showToast(data.message, 'error');
            return;
        }
        
        const container = document.getElementById('available-courses');
        if (!container) return;
        
        if (data.courses.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-book"></i><p>No courses available for registration at this time.</p></div>';
            return;
        }
        
        container.innerHTML = `
            <h4 style="margin-bottom: 15px; color: #2D3748;">Available Courses for ${data.session.name} - Semester ${data.session.semester}</h4>
            <div class="courses-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px;">
                ${data.courses.map(course => `
                    <div class="course-card" style="border: 1px solid #E5E7EB; border-radius: 8px; padding: 15px; ${course.isRegistered ? 'background: #F3F4F6; opacity: 0.7;' : ''}">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div>
                                <h5 style="font-weight: 600; color: #003366; margin-bottom: 5px;">${course.code}</h5>
                                <p style="font-size: 14px; color: #4B5563; margin-bottom: 5px;">${course.title}</p>
                                <span style="font-size: 12px; color: #6B7280;">Credit Units: ${course.creditUnits}</span>
                                ${course.isElective ? '<span style="margin-left: 10px; font-size: 11px; padding: 2px 8px; background: #FEF3C7; color: #D97706; border-radius: 12px;">Elective</span>' : ''}
                            </div>
                            <div>
                                ${course.isRegistered ? 
                                    '<span style="font-size: 12px; padding: 4px 8px; background: #10B981; color: white; border-radius: 12px;">Registered</span>' : 
                                    `<input type="checkbox" class="course-checkbox" value="${course.id}" style="width: 20px; height: 20px; cursor: pointer;">`
                                }
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div style="margin-top: 20px; text-align: right;">
                <button class="btn btn-primary" onclick="submitCourseRegistration()" style="width: auto; padding: 12px 30px;">
                    <i class="fas fa-check-circle"></i> Submit Registration
                </button>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading courses:', error);
        showToast('Failed to load available courses', 'error');
    }
};
// Load student results
async function loadStudentResults() {
    console.log('Loading student results...');
    
    const resultsTab = document.getElementById('results-tab');
    if (!resultsTab) {
        console.error('Results tab element not found');
        return;
    }
    
    try {
        // Show loading state
        resultsTab.innerHTML = `
            <div style="text-align: center; padding: 60px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 48px; color: #003366;"></i>
                <p style="margin-top: 20px; color: #6B7280; font-size: 16px;">Loading your results...</p>
            </div>
        `;
        
        // Fetch results from API
        const response = await fetch('/api/student/results/', {
            headers: {
                'X-CSRFToken': getCSRFToken(),
            }
        });
        
        if (!response.ok) throw new Error('Failed to load results');
        
        const data = await response.json();
        
        if (data.success) {
            renderResultsTab(data);
        } else {
            throw new Error(data.message);
        }
        
    } catch (error) {
        console.error('Error loading results:', error);
        resultsTab.innerHTML = `
            <div style="text-align: center; padding: 60px;">
                <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #EF4444;"></i>
                <p style="margin-top: 20px; color: #6B7280; font-size: 16px;">Failed to load results. Please try again.</p>
                <button onclick="loadStudentResults()" class="btn btn-primary" style="margin-top: 20px; width: auto; padding: 12px 30px;">
                    <i class="fas fa-sync-alt"></i> Retry
                </button>
            </div>
        `;
    }
}
function renderResultsTab(data) {
    const resultsTab = document.getElementById('results-tab');
    const results = data.results || [];
    const cgpa = data.cgpa || 0;
    const totalSemesters = data.totalSemesters || 0;
    
    // Calculate classification
    let classification = '';
    if (cgpa >= 4.5) classification = 'Distinction';
    else if (cgpa >= 3.5) classification = 'Upper Credit';
    else if (cgpa >= 2.5) classification = 'Lower Credit';
    else if (cgpa >= 2.0) classification = 'Pass';
    else classification = 'Fail';
    
    // Determine classification color
    const classColor = {
        'Distinction': '#10B981',
        'Upper Credit': '#3B82F6',
        'Lower Credit': '#F59E0B',
        'Pass': '#6B7280',
        'Fail': '#EF4444'
    }[classification] || '#6B7280';
    
    let html = `
        <div style="margin-bottom: 30px;">
            <h2 style="font-size: 24px; font-weight: 700; color: #1F2937; margin-bottom: 20px;">
                <i class="fas fa-chart-line" style="color: #003366; margin-right: 10px;"></i>
                Results & GPA
            </h2>
            
            <!- CGPA Summary Card ->
            <div style="background: linear-gradient(135deg, #003366 0%, #001a33 100%); border-radius: 16px; padding: 30px; margin-bottom: 30px; color: white;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
                    <div>
                        <p style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Cumulative GPA (CGPA)</p>
                        <div style="display: flex; align-items: baseline; gap: 15px;">
                            <span style="font-size: 48px; font-weight: 800;">${cgpa.toFixed(2)}</span>
                            <span style="font-size: 18px; opacity: 0.9;">/ 5.00</span>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <p style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Classification</p>
                        <span style="display: inline-block; padding: 8px 20px; background: ${classColor}; color: white; border-radius: 30px; font-weight: 600; font-size: 16px;">
                            ${classification}
                        </span>
                    </div>
                </div>
                <div style="display: flex; gap: 30px; margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
                    <div>
                        <p style="font-size: 13px; opacity: 0.8;">Total Semesters</p>
                        <p style="font-size: 20px; font-weight: 600;">${totalSemesters}</p>
                    </div>
                    <div>
                        <p style="font-size: 13px; opacity: 0.8;">Total Credit Units</p>
                        <p style="font-size: 20px; font-weight: 600;">${results.reduce((sum, r) => sum + r.totalCreditUnits, 0)}</p>
                    </div>
                </div>
            </div>
    `;
    
    if (results.length === 0) {
        html += `
            <div style="text-align: center; padding: 60px; background: #F9FAFB; border-radius: 12px;">
                <i class="fas fa-file-alt" style="font-size: 64px; color: #9CA3AF;"></i>
                <h3 style="margin-top: 20px; color: #1F2937; font-size: 20px;">No Results Published</h3>
                <p style="margin-top: 10px; color: #6B7280;">Your results will appear here once they are published.</p>
            </div>
        `;
    } else {
        // Results by semester
        results.forEach((result, index) => {
            const semesterName = result.semester === 1 ? 'First' : 'Second';
            const gpaColor = result.gpa >= 3.5 ? '#10B981' : 
                            result.gpa >= 2.5 ? '#F59E0B' : 
                            result.gpa >= 2.0 ? '#3B82F6' : '#EF4444';
            
            html += `
                <div style="background: white; border-radius: 12px; padding: 25px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #F3F4F6;">
                        <div>
                            <h3 style="font-size: 18px; font-weight: 700; color: #003366;">
                                ${result.academicYear} - ${semesterName} Semester
                            </h3>
                            <p style="font-size: 13px; color: #6B7280; margin-top: 5px;">
                                Published: ${result.publishedAt || 'N/A'}
                            </p>
                        </div>
                        <div style="text-align: right;">
                            <span style="font-size: 14px; color: #6B7280;">GPA</span>
                            <div style="display: flex; align-items: baseline; gap: 5px;">
                                <span style="font-size: 28px; font-weight: 700; color: ${gpaColor};">${result.gpa.toFixed(2)}</span>
                                <span style="font-size: 14px; color: #9CA3AF;">/5.00</span>
                            </div>
                        </div>
                    </div>
                    
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #F9FAFB;">
                                <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #4B5563;">Course Code</th>
                                <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #4B5563;">Course Title</th>
                                <th style="padding: 12px; text-align: center; font-size: 13px; font-weight: 600; color: #4B5563;">Credit</th>
                                <th style="padding: 12px; text-align: center; font-size: 13px; font-weight: 600; color: #4B5563;">Score</th>
                                <th style="padding: 12px; text-align: center; font-size: 13px; font-weight: 600; color: #4B5563;">Grade</th>
                                <th style="padding: 12px; text-align: center; font-size: 13px; font-weight: 600; color: #4B5563;">GP</th>
                                <th style="padding: 12px; text-align: center; font-size: 13px; font-weight: 600; color: #4B5563;">QP</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            result.courses.forEach(course => {
                const gradeColor = {
                    'A': '#10B981',
                    'B': '#3B82F6',
                    'C': '#F59E0B',
                    'D': '#EF4444',
                    'F': '#DC2626',
                    '-': '#9CA3AF'
                }[course.grade] || '#9CA3AF';
                
                html += `
                    <tr style="border-bottom: 1px solid #F3F4F6;">
                        <td style="padding: 12px; font-weight: 500; color: #1F2937;">${course.code}</td>
                        <td style="padding: 12px; color: #4B5563;">${course.title}</td>
                        <td style="padding: 12px; text-align: center; color: #4B5563;">${course.creditUnits}</td>
                        <td style="padding: 12px; text-align: center; font-weight: 500; color: #1F2937;">${course.score || '-'}</td>
                        <td style="padding: 12px; text-align: center; font-weight: 700; color: ${gradeColor};">${course.grade}</td>
                        <td style="padding: 12px; text-align: center; color: #4B5563;">${course.gradePoint}</td>
                        <td style="padding: 12px; text-align: center; color: #4B5563;">${course.qualityPoint.toFixed(1)}</td>
                    </tr>
                `;
            });
            
            html += `
                        </tbody>
                        <tfoot>
                            <tr style="background: #F9FAFB; font-weight: 600;">
                                <td colspan="2" style="padding: 12px; color: #1F2937;">Semester Total</td>
                                <td style="padding: 12px; text-align: center; color: #1F2937;">${result.totalCreditUnits}</td>
                                <td style="padding: 12px; text-align: center;"></td>
                                <td style="padding: 12px; text-align: center;"></td>
                                <td style="padding: 12px; text-align: center;"></td>
                                <td style="padding: 12px; text-align: center; color: #1F2937;">${result.totalQualityPoints.toFixed(1)}</td>
                            </tr>
                        </tfoot>
                    </table>
                    
                    <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
                        <button class="btn-sm" onclick="printSemesterResult('${result.id}')" style="background: #003366; color: white; border: none;">
                            <i class="fas fa-print"></i> Print Semester Result
                        </button>
                    </div>
                </div>
            `;
        });
    }
    
    // Add Print Transcript button at the bottom
    html += `
        <div style="margin-top: 30px; display: flex; justify-content: center;">
            <button class="btn btn-primary" onclick="printTranscript()" style="width: auto; padding: 15px 40px;">
                <i class="fas fa-file-pdf"></i> Print Full Transcript
            </button>
        </div>
    `;
    
    resultsTab.innerHTML = html;
}
// Function to print individual semester result
function printSemesterResult(resultId) {
    // This will be implemented later - can generate a PDF for a single semester
    console.log('Print semester result:', resultId);
    showToast('Print functionality coming soon', 'info');
}
// Submit course registration
window.submitCourseRegistration = async function() {
    const checkboxes = document.querySelectorAll('.course-checkbox:checked');
    const courseIds = Array.from(checkboxes).map(cb => cb.value);
    
    if (courseIds.length === 0) {
        showToast('Please select at least one course', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/student/register-courses/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({ course_ids: courseIds })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            // Reload registration status
            loadRegistrationStatus();
            // Switch to overview tab
            showStudentTab('overview');
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        console.error('Error submitting registration:', error);
        showToast('Failed to submit registration', 'error');
    }
};
// Load registration status
window.loadRegistrationStatus = async function() {
    try {
        const response = await fetch('/api/student/registration-status/');
        const data = await response.json();
        
        const statusContainer = document.getElementById('registration-status');
        if (!statusContainer) return;
        
        if (data.hasRegistration) {
            const reg = data.registration;
            let statusColor = '#6B7280';
            let statusIcon = 'fa-clock';
            
            if (reg.status === 'approved') {
                statusColor = '#10B981';
                statusIcon = 'fa-check-circle';
            } else if (reg.status === 'rejected') {
                statusColor = '#EF4444';
                statusIcon = 'fa-times-circle';
            } else if (reg.status === 'printed') {
                statusColor = '#3B82F6';
                statusIcon = 'fa-print';
            }
            
            statusContainer.innerHTML = `
                <div style="background: ${statusColor}10; border: 1px solid ${statusColor}30; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                        <div style="width: 50px; height: 50px; background: ${statusColor}20; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <i class="fas ${statusIcon}" style="font-size: 24px; color: ${statusColor};"></i>
                        </div>
                        <div>
                            <h4 style="font-size: 18px; font-weight: 600; color: #2D3748; margin-bottom: 5px;">
                                Registration ${reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                            </h4>
                            <p style="color: #6B7280;">Submitted on ${reg.submittedAt}</p>
                        </div>
                    </div>
                    
                    <div style="margin-top: 15px;">
                        <h5 style="font-weight: 600; color: #2D3748; margin-bottom: 10px;">Registered Courses (${reg.courses.length})</h5>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px;">
                            ${reg.courses.map(course => `
                                <div style="background: #F9FAFB; padding: 10px; border-radius: 6px;">
                                    <span style="font-weight: 600; color: #003366;">${course.code}</span>
                                    <span style="font-size: 13px; color: #6B7280; margin-left: 8px;">${course.creditUnits} units</span>
                                    <p style="font-size: 13px; color: #4B5563; margin-top: 4px;">${course.title}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    ${reg.status === 'approved' ? `
                        <div style="margin-top: 20px; text-align: right;">
                            <button class="btn btn-primary" onclick="printCourseForm('${reg.id}')" style="width: auto; padding: 10px 20px;">
                                <i class="fas fa-print"></i> Print Course Form
                            </button>
                        </div>
                    ` : ''}
                    
                    ${reg.status === 'rejected' && reg.rejectionReason ? `
                        <div style="margin-top: 20px; background: #FEF2F2; border: 1px solid #FEE2E2; border-radius: 6px; padding: 15px;">
                            <p style="color: #DC2626; font-weight: 600; margin-bottom: 5px;">Rejection Reason:</p>
                            <p style="color: #6B7280;">${reg.rejectionReason}</p>
                        </div>
                    ` : ''}
                </div>
            `;
        } else {
            statusContainer.innerHTML = `
                <div class="empty-state" style="background: #F9FAFB; border-radius: 8px; padding: 40px;">
                    <i class="fas fa-clipboard-list" style="font-size: 48px; color: #9CA3AF;"></i>
                    <p style="margin-top: 15px; color: #6B7280;">You haven't registered for any courses this semester.</p>
                    <button class="btn btn-primary" onclick="showStudentTab('registration')" style="margin-top: 20px; width: auto; padding: 12px 30px;">
                        <i class="fas fa-plus-circle"></i> Register Now
                    </button>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error loading registration status:', error);
    }
};
// Print course form
window.printCourseForm = async function(registrationId) {
    try {
        window.open(`/api/student/print-course-form/${registrationId}/`, '_blank');
        showToast('Course form generated successfully', 'success');
    } catch (error) {
        console.error('Error printing course form:', error);
        showToast('Failed to generate course form', 'error');
    }
};
// ===========================================
// HOD FUNCTIONS - REAL IMPLEMENTATION
// ===========================================
// Load courses for HOD
async function loadHODCourses() {
    console.log('Loading HOD courses...');
    
    const courseSections = {
        'nd1-courses': document.getElementById('nd1-courses'),
        'nd2-courses': document.getElementById('nd2-courses'),
        'hnd1-courses': document.getElementById('hnd1-courses'),
        'hnd2-courses': document.getElementById('hnd2-courses')
    };
    
    // Check if elements exist
    for (const [id, element] of Object.entries(courseSections)) {
        if (element) {
            element.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <i class="fas fa-spinner fa-spin" style="color: #003366;"></i>
                    <p style="margin-top: 10px; color: #6B7280;">Loading courses...</p>
                </div>
            `;
        }
    }
    try {
        const response = await fetch('/api/hod/courses/', {
            headers: {
                'X-CSRFToken': getCSRFToken(),
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            throw new Error(`HTTP ${response.status}`)
        }
        
        const data = await response.json();
        
        if (data.success) {
            renderHODCourses(data.courses);
        } else {
            showToast(data.message || 'Failed to load courses', 'error');
            throw new Error(data.message || 'Failed to load courses');
        }
    } catch (error) {
        console.error('Error loading HOD courses:', error);
        showToast('Failed to load courses', 'error');

        // Show error in all course sections
        for (const [id, element] of Object.entries(courseSections)) {
            if (element) {
                element.innerHTML = `
                    <div style="text-align: center; padding: 30px; background: #FEF2F2; border-radius: 8px;">
                        <i class="fas fa-exclamation-circle" style="font-size: 24px; color: #EF4444;"></i>
                        <p style="margin-top: 10px; color: #DC2626;">Failed to load courses</p>
                        <button onclick="loadHODCourses()" class="admin-btn-sm" style="margin-top: 10px;">
                            <i class="fas fa-sync-alt"></i> Retry
                        </button>
                    </div>
                `;
            }
        }
    }
};

// Render courses in the HOD view
function renderHODCourses(courses) {
    // ND I Courses
    const nd1Container = document.getElementById('nd1-courses');
    if (nd1Container) {
        const nd1Sem1 = courses['ND I']?.semester1 || [];
        const nd1Sem2 = courses['ND I']?.semester2 || [];
        
        nd1Container.innerHTML = `
            <h4 style="color: #003366; margin: 15px 0 10px;">First Semester</h4>
            ${nd1Sem1.length > 0 ? nd1Sem1.map(course => createCourseListItem(course)).join('') : '<p style="color: #9CA3AF; padding: 10px;">No courses added yet</p>'}
            
            <h4 style="color: #003366; margin: 25px 0 10px;">Second Semester</h4>
            ${nd1Sem2.length > 0 ? nd1Sem2.map(course => createCourseListItem(course)).join('') : '<p style="color: #9CA3AF; padding: 10px;">No courses added yet</p>'}
        `;
    }
    
    // ND II Courses
    const nd2Container = document.getElementById('nd2-courses');
    if (nd2Container) {
        const nd2Sem1 = courses['ND II']?.semester1 || [];
        const nd2Sem2 = courses['ND II']?.semester2 || [];
        
        nd2Container.innerHTML = `
            <h4 style="color: #003366; margin: 15px 0 10px;">First Semester</h4>
            ${nd2Sem1.length > 0 ? nd2Sem1.map(course => createCourseListItem(course)).join('') : '<p style="color: #9CA3AF; padding: 10px;">No courses added yet</p>'}
            
            <h4 style="color: #003366; margin: 25px 0 10px;">Second Semester</h4>
            ${nd2Sem2.length > 0 ? nd2Sem2.map(course => createCourseListItem(course)).join('') : '<p style="color: #9CA3AF; padding: 10px;">No courses added yet</p>'}
        `;
    }
    
    // HND I Courses
    const hnd1Container = document.getElementById('hnd1-courses');
    if (hnd1Container) {
        const hnd1Sem1 = courses['HND I']?.semester1 || [];
        const hnd1Sem2 = courses['HND I']?.semester2 || [];
        
        hnd1Container.innerHTML = `
            <h4 style="color: #003366; margin: 15px 0 10px;">First Semester</h4>
            ${hnd1Sem1.length > 0 ? hnd1Sem1.map(course => createCourseListItem(course)).join('') : '<p style="color: #9CA3AF; padding: 10px;">No courses added yet</p>'}
            
            <h4 style="color: #003366; margin: 25px 0 10px;">Second Semester</h4>
            ${hnd1Sem2.length > 0 ? hnd1Sem2.map(course => createCourseListItem(course)).join('') : '<p style="color: #9CA3AF; padding: 10px;">No courses added yet</p>'}
        `;
    }
    
    // HND II Courses
    const hnd2Container = document.getElementById('hnd2-courses');
    if (hnd2Container) {
        const hnd2Sem1 = courses['HND II']?.semester1 || [];
        const hnd2Sem2 = courses['HND II']?.semester2 || [];
        
        hnd2Container.innerHTML = `
            <h4 style="color: #003366; margin: 15px 0 10px;">First Semester</h4>
            ${hnd2Sem1.length > 0 ? hnd2Sem1.map(course => createCourseListItem(course)).join('') : '<p style="color: #9CA3AF; padding: 10px;">No courses added yet</p>'}
            
            <h4 style="color: #003366; margin: 25px 0 10px;">Second Semester</h4>
            ${hnd2Sem2.length > 0 ? hnd2Sem2.map(course => createCourseListItem(course)).join('') : '<p style="color: #9CA3AF; padding: 10px;">No courses added yet</p>'}
        `;
    }
}

// Load students for HOD view
async function loadHODStudents() {
    console.log('Loading students...');
    
    const tableBody = document.getElementById('students-table-body');
    if (!tableBody) {
        console.error('student-table-body element not found');
        return
    };
    
    try {
        // Show loading state
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #003366;"></i>
                    <p style="margin-top: 10px; color: #6B7280;">Loading students...</p>
                </td>
            </tr>
        `;
        
        // Get filter values
        const programme = document.getElementById('student-programme-filter')?.value || '';
        const level = document.getElementById('student-level-filter')?.value || '';
        const status = document.getElementById('student-status-filter')?.value || '';
        const search = document.getElementById('student-search-input')?.value || '';
        
        // Build query string
        const params = new URLSearchParams();
        if (programme) params.append('programme', programme);
        if (level) params.append('level', level);
        if (status) params.append('status', status);
        if (search) params.append('search', search);

        const url = `/api/hod/students/?${params.toString()}`
        console.log(`Fetching: ${url}`)
        
        const response = await fetch(url, {
            headers: {
                'X-CSRFToken': getCSRFToken(),
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            throw new Error(`Failed to load students (${response.status})`)
        };
        
        const data = await response.json();
        console.log('Students data:', data);
        
        if (data.success) {
            renderStudentsTable(data.students);
        } else {
            throw new Error(data.message || 'Failed to load students');
        }
        
    } catch (error) {
        console.error('Error loading students:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px;">
                    <i class="fas fa-exclamation-circle" style="font-size: 24px; color: #EF4444;"></i>
                    <p style="margin-top: 10px; color: #6B7280;">Failed to load students. Please try again.</p>
                    <button onclick="loadHODStudents()" class="btn btn-primary" style="margin-top: 10px; width: auto; padding: 8px 20px;">
                        <i class="fas fa-sync-alt"></i> Retry
                    </button>
                </td>
            </tr>
        `;
    }
}

// Render students table
function renderStudentsTable(students) {
    const tableBody = document.getElementById('students-table-body');
    
    if (!students || students.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px;">
                    <i class="fas fa-users-slash" style="font-size: 40px; color: #9CA3AF;"></i>
                    <p style="margin-top: 15px; color: #6B7280;">No students found</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = students.map(student => {
        // Determine fee status badge color
        const feeStatusColor = student.feesStatus === 'paid' ? '#10B981' :
                              student.feesStatus === 'partial' ? '#F59E0B' : '#EF4444';
        
        const feeStatusBg = student.feesStatus === 'paid' ? 'rgba(16, 185, 129, 0.1)' :
                           student.feesStatus === 'partial' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)';
        
        // Determine active status badge
        const activeStatusColor = student.isActive ? '#10B981' : '#EF4444';
        const activeStatusBg = student.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
        
        return `
            <tr>
                <td style="font-weight: 500; color: #1F2937;">${student.matricNumber}</td>
                <td>${student.fullName}</td>
                <td>${student.programme}</td>
                <td>${student.level}</td>
                <td style="font-weight: 600;">${student.cgpa}</td>
                <td>
                    <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: ${feeStatusBg}; color: ${feeStatusColor};">
                        ${student.feesStatus.toUpperCase()}
                    </span>
                </td>
                <td>
                    <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: ${activeStatusBg}; color: ${activeStatusColor};">
                        ${student.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="admin-btn-sm" onclick="viewStudent('${student.id}')" style="background: #E5E7EB; color: #1F2937;">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="admin-btn-sm" onclick="editStudent('${student.id}')" style="background: #003366; color: white;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="admin-btn-sm" onclick="toggleStudentStatus('${student.id}', ${!student.isActive})" style="background: ${student.isActive ? '#FEE2E2' : '#D1FAE5'}; color: ${student.isActive ? '#DC2626' : '#059669'};">
                            <i class="fas fa-${student.isActive ? 'ban' : 'check'}"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Filter students
function filterStudents() {
    loadHODStudents();
}

// View student details
function viewStudent(studentId) {
    // You can implement a modal to view student details
    showToast('View student feature coming soon', 'info');
}

// Edit student
function editStudent(studentId) {
    // You can implement an edit modal
    showToast('Edit student feature coming soon', 'info');
}

// Toggle student active status
async function toggleStudentStatus(studentId, newStatus) {
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (!confirm(`Are you sure you want to ${action} this student?`)) return;
    
    try {
        const response = await fetch(`/api/hod/students/${studentId}/deactivate/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCSRFToken(),
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`Student ${action}d successfully`, 'success');
            loadHODStudents(); // Reload the list
        } else {
            showToast(data.message || `Failed to ${action} student`, 'error');
        }
    } catch (error) {
        console.error(`Error ${action}ing student:`, error);
        showToast(`Network error. Please try again.`, 'error');
    }
}

function openAddStudentModal() {
    const modalContent = `
        <div class="modal">
            <div class="modal-header">
                <h3><i class="fas fa-user-plus"></i> Add New Student</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="add-student-form" onsubmit="event.preventDefault(); addStudent();">
                    <div class="form-group">
                        <label>Full Name *</label>
                        <input type="text" class="form-input" id="student-fullname" required>
                    </div>
                    <div class="form-group">
                        <label>Email *</label>
                        <input type="email" class="form-input" id="student-email" required>
                    </div>
                    <div class="form-group">
                        <label>Matric Number *</label>
                        <input type="text" class="form-input" id="matricNumber" required>
                    </div>
                    <div class="form-group">
                        <label>Phone Number</label>
                        <input type="tel" class="form-input" id="student-phone">
                    </div>
                    <div class="form-group">
                        <label>Programme *</label>
                        <select class="form-input" id="programme" required onchange="document.getElementById('programme-hidden').value = this.value;">
                            <option value="">Select Programme</option>
                            <option value="ND Accountancy">ND Accountancy</option>
                            <option value="HND Accountancy">HND Accountancy</option>
                        </select>
                        <input type="hidden" id="programme-hidden" value="">
                    </div>
                    <div class="form-group">
                        <label>Level *</label>
                        <select class="form-input" id="student-level" required onchange="document.getElementById('level-hidden').value = this.value;">
                            <option value="">Select Level</option>
                            <option value="ND I">ND I</option>
                            <option value="ND II">ND II</option>
                            <option value="HND I">HND I</option>
                            <option value="HND II">HND II</option>
                        </select>
                        <input type="hidden" id="level-hidden" value="">
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button type="button" class="btn btn-outline" onclick="closeModal()" style="flex: 1; background: #f3f4f6; color: #333; border: 1px solid #ccc;">Cancel</button>
                        <button type="submit" class="btn btn-primary" style="flex: 1; background: #003366; color: white;">
                            <i class="fas fa-save"></i> Add Student
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.getElementById('modal-container').innerHTML = modalContent;
    document.getElementById('modal-container').style.display = 'flex';
}

// Add student - SIMPLIFIED
async function addStudent() {
    console.log('addStudent called');
    
    // Get values
    const fullName = document.getElementById('student-fullname')?.value;
    const email = document.getElementById('student-email')?.value;
    const matricNumber = document.getElementById('matricNumber')?.value;
    const phone = document.getElementById('student-phone')?.value;
    const programme = document.getElementById('programme-hidden')?.value;
    const level = document.getElementById('level-hidden')?.value;
    
    console.log('Form values:', {fullName, email, matricNumber, phone, programme, level});
    
    // Simple validation
    if (!fullName || !email || !matricNumber || !programme || !level) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    // Email validation
    if (!email.includes('@')) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    const studentData = {
        fullName: fullName.trim(),
        email: email.trim(),
        matricNumber: matricNumber.trim(),
        phone: phone ? phone.trim() : '',
        programme: programme,
        level: level
    };

    //Show loading state
    const submitBtn = document.querySelector('#add-student-form button[type="submit"]');
    const originalText = submitBtn?.innerHTML || 'Submit';
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        submitBtn.disabled = true;
    }
    
    // Submit
    try {
        const response = await fetch('/api/hod/students/add/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify(studentData)
        });
        
        const data = await response.json();
        console.log('Add student response:', data);
        
        if (data.success) {
            showToast('Student added successfully!', 'success');
            closeModal();
            loadHODStudents();

            // IMPORTANT: Show the temporary password to the HOD
            if (data.student?.tempPassword) {
                // Show in a nice modal/popup
                showTemporaryPasswordModal(
                    data.student.fullName,
                    data.student.matricNumber,
                    data.student.tempPassword
                );

                // Also log to console for development
                console.log('🔐 TEMPORARY PASSWORD:', data.student.tempPassword);
                console.log('📧 Email to send to student:', data.student.email);
            }
        } else {
            showToast(data.message || 'Failed to add student', 'error');
        }
    } catch (error) {
        console.error('Error adding student:', error);
        showToast('Network error. Please try again.', 'error');
    } finally {
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
}

// Function to show temporary password in a modal
function showTemporaryPasswordModal(name, matric, password) {
    const modalContent = `
        <div class="modal">
            <div class="modal-header">
                <h3><i class="fas fa-key" style="color: #003366;"></i> Student Account Created</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div style="text-align: center; padding: 10px;">
                    <div style="background: #10B981; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                        <i class="fas fa-check" style="font-size: 30px; color: white;"></i>
                    </div>
                    
                    <h3 style="color: #1F2937; margin-bottom: 10px;">Student Added Successfully!</h3>
                    <p style="color: #6B7280; margin-bottom: 20px;">Please save these login details and share them with the student.</p>
                    
                    <div style="background: #F3F4F6; padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: left;">
                        <p style="margin-bottom: 10px;"><strong style="color: #374151;">Name:</strong> <span style="color: #1F2937;">${name}</span></p>
                        <p style="margin-bottom: 10px;"><strong style="color: #374151;">Matric Number:</strong> <span style="color: #1F2937;">${matric}</span></p>
                        <p style="margin-bottom: 10px;"><strong style="color: #374151;">Email:</strong> <span style="color: #1F2937;">${document.getElementById('student-email')?.value}</span></p>
                        <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin-top: 15px;">
                            <p style="color: #D97706; font-weight: 600; margin-bottom: 5px;">🔐 Temporary Password</p>
                            <p style="font-family: monospace; font-size: 20px; font-weight: bold; color: #1F2937; letter-spacing: 2px;">${password}</p>
                            <p style="color: #6B7280; font-size: 12px; margin-top: 10px;">Student will be required to change this on first login.</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-primary" onclick="copyToClipboard('${password}')" style="flex: 1;">
                            <i class="fas fa-copy"></i> Copy Password
                        </button>
                        <button class="btn btn-outline" onclick="closeModal()" style="flex: 1;">Done</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modal-container').innerHTML = modalContent;
    document.getElementById('modal-container').style.display = 'flex';
}

// Helper function to copy password to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Password copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Password copied to clipboard!', 'success');
    });
}

// Export students list
function exportStudents() {
    // In a real app, this would generate a CSV/Excel file
    showToast('Export feature coming soon', 'info');
}

// Helper function to create a course list item
function createCourseListItem(course) {
    return `
        <div class="admin-course-item" style="background: #F9FAFB; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid ${course.isElective ? '#D4AF37' : '#003366'};">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <h5 style="font-weight: 600; color: #1F2937; margin-bottom: 5px;">${course.code} - ${course.title}</h5>
                    <p style="font-size: 13px; color: #6B7280;">
                        Credit Units: ${course.creditUnits} • ${course.isElective ? 'Elective' : 'Core'} • ${course.isActive ? 'Active' : 'Inactive'}
                    </p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="admin-btn-sm" onclick="editCourse('${course.id}')" style="padding: 6px 12px; background: #E5E7EB; border: none; border-radius: 6px; cursor: pointer;">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="admin-btn-sm" onclick="toggleCourseStatus('${course.id}', ${!course.isActive})" style="padding: 6px 12px; background: ${course.isActive ? '#FEE2E2' : '#D1FAE5'}; border: none; border-radius: 6px; cursor: pointer;">
                        <i class="fas fa-${course.isActive ? 'times' : 'check'}"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Edit course (opens modal with pre-filled data)
async function editCourse(courseId) {
    // You'll need an API endpoint to get single course details
    showToast('Edit functionality coming soon', 'info');
}

// Toggle course active status
async function toggleCourseStatus(courseId, newStatus) {
    try {
        const response = await fetch(`/api/hod/courses/${courseId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({ isActive: newStatus })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`Course ${newStatus ? 'activated' : 'deactivated'} successfully`, 'success');
            loadHODCourses(); // Reload the list
        } else {
            showToast(data.message || 'Failed to update course', 'error');
        }
    } catch (error) {
        console.error('Error toggling course status:', error);
        showToast('Network error. Please try again.', 'error');
    }
}

// Add new course
function openAddCourseModal() {
    const modalContent = `
        <div class="modal">
            <div class="modal-header">
                <h3><i class="fas fa-plus-circle"></i> Add New Course</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="add-course-form" onsubmit="event.preventDefault(); addCourse();">
                    <div class="form-group">
                        <label>Course Code *</label>
                        <input type="text" class="form-input" id="course-code" placeholder="e.g., ACC211" required>
                    </div>
                    <div class="form-group">
                        <label>Course Title *</label>
                        <input type="text" class="form-input" id="course-title" placeholder="e.g., Financial Accounting" required>
                    </div>
                    <div class="form-group">
                        <label>Credit Units *</label>
                        <input type="number" class="form-input" id="course-credit" min="1" max="6" placeholder="e.g., 3" required>
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Level *</label>
                            <select class="form-input" id="course-level" required>
                                <option value="">Select Level</option>
                                <option value="ND I">ND I</option>
                                <option value="ND II">ND II</option>
                                <option value="HND I">HND I</option>
                                <option value="HND II">HND II</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Semester *</label>
                            <select class="form-input" id="course-semester" required>
                                <option value="">Select Semester</option>
                                <option value="1">First Semester</option>
                                <option value="2">Second Semester</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="course-elective">
                            <span>This is an elective course</span>
                        </label>
                    </div>
                    <div class="form-actions" style="margin-top: 30px;">
                        <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Save Course
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.getElementById('modal-container').innerHTML = modalContent;
    document.getElementById('modal-container').style.display = 'flex';
};
// Add course API call
async function addCourse() {
    const courseData = {
        code: document.getElementById('course-code')?.value,
        title: document.getElementById('course-title')?.value,
        creditUnits: document.getElementById('course-credit')?.value,
        level: document.getElementById('course-level')?.value,
        semester: document.getElementById('course-semester')?.value,
        isElective: document.getElementById('course-elective')?.checked || false
    };
    
    // Validate
    for (const [key, value] of Object.entries(courseData)) {
        if (key !== 'isElective' && !value) {
            showToast(`Please enter ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'error');
            return;
        }
    }

    // Show loading state on button
    const submitBtn = document.querySelector('#add-course-form button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/hod/courses/add/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify(courseData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Course added successfully!', 'success');
            closeModal();
            loadHODCourses(); // Reload courses
        } else {
            showToast(data.message || 'Failed to add course', 'error');
        }
    } catch (error) {
        console.error('Error adding course:', error);
        showToast('Network error. Please try again.', 'error');
    } finally {
        // Restore button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
};
window.goToRegistration = function() {
    console.log('Navigating to registration tab');
    showStudentTab('registration');
}
// Load pending registrations for HOD
window.loadPendingRegistrations = async function() {
    try {
        const response = await fetch('/api/hod/registrations/?status=submitted');
        const data = await response.json();
        
        if (!data.success) {
            showToast('Failed to load registrations', 'error');
            return;
        }
        
        const container = document.getElementById('pending-approvals-list');
        if (!container) return;
        
        if (data.registrations.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-check-circle"></i><p>No pending registrations</p></div>';
            return;
        }
        
        container.innerHTML = data.registrations.map(reg => `
            <div class="admin-approval-item" style="background: white; border: 1px solid #E5E7EB; border-radius: 10px; padding: 15px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h4 style="font-weight: 600; color: #1F2937; margin-bottom: 5px;">${reg.studentName}</h4>
                        <p style="font-size: 13px; color: #6B7280; margin-bottom: 8px;">
                            ${reg.matricNumber} • ${reg.level} • ${reg.coursesCount} courses
                        </p>
                        <p style="font-size: 12px; color: #9CA3AF;">
                            <i class="fas fa-calendar"></i> Submitted: ${reg.submittedAt}
                        </p>
                    </div>
                    <span class="badge warning" style="background: #FEF3C7; color: #D97706;">Pending</span>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button class="btn-sm btn-primary" onclick="viewRegistrationDetail('${reg.id}')" style="background: #003366; color: white;">
                        <i class="fas fa-eye"></i> Review
                    </button>
                    <button class="btn-sm" onclick="approveRegistration('${reg.id}')" style="background: #10B981; color: white;">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn-sm" onclick="rejectRegistration('${reg.id}')" style="background: #EF4444; color: white;">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            </div>
        `).join('');
        
        // Update badge count
        const badge = document.getElementById('pending-forms-count');
        if (badge) badge.textContent = data.registrations.length;
        
    } catch (error) {
        console.error('Error loading registrations:', error);
    }
};
// Approve registration
window.approveRegistration = async function(registrationId) {
    if (!confirm('Approve this course registration?')) return;
    
    try {
        const response = await fetch(`/api/hod/registrations/${registrationId}/approve/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({ action: 'approve' })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            loadPendingRegistrations();
            loadHODDashboard(); // Refresh dashboard
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        console.error('Error approving registration:', error);
        showToast('Failed to approve registration', 'error');
    }
};
// Reject registration
window.rejectRegistration = async function(registrationId) {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
        const response = await fetch(`/api/hod/registrations/${registrationId}/approve/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({ 
                action: 'reject',
                reason: reason 
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            loadPendingRegistrations();
            loadHODDashboard();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        console.error('Error rejecting registration:', error);
        showToast('Failed to reject registration', 'error');
    }
};


// Helper function to show "coming soon" content
function showTempContent(tabElement, title, message) {
    tabElement.innerHTML = `
        <div class="admin-tab-header">
            <h2><i class="fas fa-${getIconForTab(title)}"></i> ${title}</h2>
        </div>
        <div style="background: white; border-radius: 20px; padding: 60px; text-align: center;">
            <i class="fas fa-tools" style="font-size: 64px; color: #9CA3AF;"></i>
            <h3 style="margin-top: 20px; color: #1F2937;">${title} ${message}</h3>
            <p style="margin-top: 10px; color: #6B7280;">This feature is currently under development.</p>
        </div>
    `;
}

function getIconForTab(title) {
    const icons = {
        'Lecturer Management': 'chalkboard-teacher',
        'Timetable Management': 'clock',
        'Department Fees': 'credit-card',
        'Payment History': 'history',
        'Audit Trail': 'shield-alt',
        'Settings': 'cog'
    };
    return icons[title] || 'code';
}

// Make functions globally available
window.addCourse = addCourse;
window.addStudent = addStudent;
window.checkRegistrationStatusForPrint = checkRegistrationStatusForPrint;
window.closeModal = closeModal;
window.createCourseCard = createCourseCard;
window.createRegistrationTab = createRegistrationTab;
window.editCourse = editCourse;
window.editStudent = editStudent;
window.exportStudents = exportStudents;
window.filterCoursesBySemester = filterCoursesBySemester;
window.filterStudents = filterStudents;
// window.goToRegistration = goToRegistration;
window.handleResize = handleResize;
window.loadAttendanceManagement = loadAttendanceManagement;
window.loadDashboardData = loadDashboardData;
window.loadHODCourseForms = loadHODCourseForms;
window.loadHODCourses = loadHODCourses;
window.loadHODProfile = loadHODProfile;
window.loadHODStudents = loadHODStudents;
window.loadReports = loadReports;
window.loadResultCourses = loadResultCourses;
window.loadStudentCourses = loadStudentCourses;
window.loadStudentProfile = loadStudentProfile;
window.loadStudentResults = loadStudentResults;
window.loadUploadResults = loadUploadResults;
window.login = login;
window.markAllAsRead = markAllAsRead;
window.nextLoginStep = nextLoginStep;
window.nextRegisterStep = nextRegisterStep;
window.logout = performLogout;
window.openAddCourseModal = openAddCourseModal;
window.openAddStudentModal = openAddStudentModal;
window.openModal = openModal;
window.performLogout = performLogout;
window.prevRegisterStep = prevRegisterStep;
window.printSemesterResult = printSemesterResult;
window.quickCourseReg = quickCourseReg;
window.quickCheckResult = quickCheckResult;
window.quickPrintForm = quickPrintForm;
window.quickViewAttendance = quickViewAttendance;
window.register = register;
window.renderCoursesList = renderCoursesList;
window.renderResultsTab = renderResultsTab;
window.renderStudentsTable = renderStudentsTable;
window.sendPasswordReset = sendPasswordReset;
window.setActiveTab = setActiveTab;
window.setupNavItemCloseSidebar = setupNavItemCloseSidebar;
window.setupSidebarCloseOnClickOutside = setupSidebarCloseOnClickOutside;
window.sendVerificationCode = sendVerificationCode;
window.showDashboard = showDashboard;
window.showHODTab = showHODTab;
window.showStudentTab = showStudentTab;
window.showTempContent = showTempContent;
window.showWelcomePortal = showWelcomePortal;
window.showView = showView;
window.toggleCourseStatus = toggleCourseStatus;
window.toggleDashboardSidebar = toggleDashboardSidebar;
window.toggleMobileMenu = toggleMobileMenu;
window.toggleNotifications = toggleNotifications;
window.toggleStudentStatus = toggleStudentStatus;
window.updateQuickActions = updateQuickActions;
window.updateLoginState = updateLoginState
window.verifyEmailCode = verifyEmailCode;
window.viewStudent = viewStudent;

// Add this temporarily to debug
window.addEventListener('hashchange', function() {
    console.log('Hash changed to:', window.location.hash);
    console.log('Current user type:', auth.getCurrentUser()?.userType);
});

// Also add this to check all click handlers
document.addEventListener('click', function(e) {
    if (e.target.closest('.admin-nav-item')) {
        const item = e.target.closest('.admin-nav-item');
        console.log('Admin nav item clicked:', item);
        console.log('Onclick attribute:', item.getAttribute('onclick'));
    }
});