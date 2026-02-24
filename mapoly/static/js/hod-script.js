// ===========================================
// HOD DASHBOARD SIDEBAR FUNCTIONS
// ===========================================

// Toggle admin sidebar on mobile
function toggleAdminSidebar() {
    const sidebar = document.getElementById('admin-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
        console.log('Admin sidebar toggled:', sidebar.classList.contains('active'));
    } else {
        console.error('Admin sidebar element not found');
    }
}

// Close admin sidebar when clicking outside on mobile
function setupAdminSidebarCloseOnClickOutside() {
    const sidebar = document.getElementById('admin-sidebar');
    const menuToggle = document.querySelector('.admin-menu-toggle');
    
    if (!sidebar) return;
    
    function handleClickOutside(event) {
        // Only on mobile screens (below 1200px as per your CSS)
        if (window.innerWidth > 1199) return;
        
        if (!sidebar.classList.contains('active')) return;
        
        const isClickInsideSidebar = sidebar.contains(event.target);
        const isClickOnToggle = menuToggle && menuToggle.contains(event.target);
        
        if (!isClickInsideSidebar && !isClickOnToggle) {
            sidebar.classList.remove('active');
            console.log('Admin sidebar closed by outside click');
        }
    }
    
    document.addEventListener('click', handleClickOutside);
}

// Toggle admin user dropdown menu
function toggleAdminUserMenu() {
    const dropdown = document.getElementById('admin-user-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Toggle admin notifications panel
function toggleAdminNotifications() {
    const panel = document.getElementById('admin-notifications-panel');
    if (panel) {
        panel.classList.toggle('show');
    }
}

// Mark all HOD notifications as read
function markAllHODNotificationsRead() {
    const badge = document.getElementById('hod-notification-count');
    if (badge) {
        badge.textContent = '0';
    }
    
    const notificationsList = document.getElementById('hod-notifications-list');
    if (notificationsList) {
        notificationsList.innerHTML = `
            <div class="empty-state" style="padding: 40px; text-align: center;">
                <i class="fas fa-bell-slash" style="font-size: 40px; color: #9CA3AF;"></i>
                <p style="margin-top: 15px; color: #6B7280;">No new notifications</p>
            </div>
        `;
    }
    
    showToast('All notifications marked as read', 'success');
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    // Close user dropdown if clicked outside
    const userMenu = document.querySelector('.admin-user-menu');
    const userDropdown = document.getElementById('admin-user-dropdown');
    
    if (userMenu && userDropdown && !userMenu.contains(e.target)) {
        userDropdown.classList.remove('show');
    }
    
    // Close notifications panel if clicked outside
    const notificationsBtn = document.querySelector('.admin-notifications .admin-icon-btn');
    const notificationsPanel = document.getElementById('admin-notifications-panel');
    
    if (notificationsPanel && notificationsBtn && 
        !notificationsPanel.contains(e.target) && 
        !notificationsBtn.contains(e.target)) {
        notificationsPanel.classList.remove('show');
    }
});

// Handle window resize for admin sidebar
function handleAdminResize() {
    const sidebar = document.getElementById('admin-sidebar');
    if (!sidebar) return;
    
    if (window.innerWidth > 1199) {
        sidebar.classList.remove('active');
    }
}

// Add resize listener
window.addEventListener('resize', handleAdminResize);

// Initialize admin sidebar close on outside click when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
        setupAdminSidebarCloseOnClickOutside();
    }, 500);
});

// Add these to your window exports at the end of your script
window.toggleAdminSidebar = toggleAdminSidebar;
window.toggleAdminUserMenu = toggleAdminUserMenu;
window.toggleAdminNotifications = toggleAdminNotifications;
window.markAllHODNotificationsRead = markAllHODNotificationsRead;
window.setupAdminSidebarCloseOnClickOutside = setupAdminSidebarCloseOnClickOutside;
window.handleAdminResize = handleAdminResize;