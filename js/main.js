// प्रमाणीकरण प्रणाली
class AuthSystem {
    constructor() {
        this.adminPassword = 'abcd@1';
        this.userPassword = 'khadak1';
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkExistingSession();
    }

    setupEventListeners() {
        // लगइन फारम
        const loginBtn = document.getElementById('login-btn');
        const passwordInput = document.getElementById('password');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.handleLogin());
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleLogin();
                }
            });
        }

        // लगआउट बटन
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }

    checkExistingSession() {
        const userData = localStorage.getItem('constructionUser');
        if (userData) {
            const user = JSON.parse(userData);
            if (user && user.isAuthenticated) {
                this.currentUser = user;
                this.showApp();
                this.updateUIForUser(user.role);
            }
        }
    }

    handleLogin() {
        const passwordInput = document.getElementById('password');
        const messageDiv = document.getElementById('auth-message');
        
        if (!passwordInput) return;
        
        const password = passwordInput.value.trim();
        
        if (!password) {
            this.showMessage('कृपया पासवर्ड प्रविष्ट गर्नुहोस्', 'error');
            return;
        }
        
        let userRole = null;
        
        if (password === this.adminPassword) {
            userRole = 'admin';
        } else if (password === this.userPassword) {
            userRole = 'user';
        } else {
            this.showMessage('गलत पासवर्ड। कृपया पुन: प्रयास गर्नुहोस्', 'error');
            return;
        }
        
        // प्रयोगकर्ता डाटा सेभ गर्ने
        this.currentUser = {
            role: userRole,
            isAuthenticated: true,
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('constructionUser', JSON.stringify(this.currentUser));
        
        // एप्लिकेसन देखाउने
        this.showApp();
        this.updateUIForUser(userRole);
        
        // गतिविधि लग थप्ने
        this.logActivity(`${userRole === 'admin' ? 'एडमिन' : 'यूजर'} लगइन गर्नुभयो`);
        
        // फारम खाली गर्ने
        passwordInput.value = '';
        this.showMessage('', '');
    }

    handleLogout() {
        // प्रयोगकर्ता डाटा मेटाउने
        localStorage.removeItem('constructionUser');
        
        // गतिविधि लग थप्ने
        this.logActivity(`${this.currentUser.role === 'admin' ? 'एडमिन' : 'यूजर'} लगआउट गर्नुभयो`);
        
        this.currentUser = null;
        
        // लगइन पृष्ठ देखाउने
        this.showLogin();
        
        // UI रिसेट गर्ने
        this.updateUIForUser(null);
    }

    showLogin() {
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        if (authContainer) authContainer.classList.remove('hidden');
        if (appContainer) appContainer.classList.add('hidden');
    }

    showApp() {
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        if (authContainer) authContainer.classList.add('hidden');
        if (appContainer) appContainer.classList.remove('hidden');
    }

    updateUIForUser(role) {
        const userRoleElement = document.getElementById('user-role');
        const adminElements = document.querySelectorAll('.admin-only');
        
        if (userRoleElement) {
            userRoleElement.textContent = role === 'admin' ? 'एडमिन' : 'यूजर';
        }
        
        // एडमिन विकल्पहरू देखाउने वा लुकाउने
        adminElements.forEach(element => {
            if (role === 'admin') {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        });
    }

    showMessage(message, type) {
        const messageDiv = document.getElementById('auth-message');
        if (!messageDiv) return;
        
        messageDiv.textContent = message;
        messageDiv.className = 'auth-message';
        
        if (type) {
            messageDiv.classList.add(type);
        }
        
        // त्रुटि सन्देश स्वचालित रूपमा हटाउने
        if (type === 'error') {
            setTimeout(() => {
                messageDiv.textContent = '';
                messageDiv.className = 'auth-message';
            }, 5000);
        }
    }

    logActivity(activity) {
        const activities = JSON.parse(localStorage.getItem('constructionActivities') || '[]');
        activities.unshift({
            activity,
            timestamp: new Date().toISOString(),
            user: this.currentUser?.role || 'unknown'
        });
        
        // केवल 50 भन्दा बढी गतिविधिहरू राख्ने
        if (activities.length > 50) {
            activities.pop();
        }
        
        localStorage.setItem('constructionActivities', JSON.stringify(activities));
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAdmin() {
        return this.currentUser?.role === 'admin';
    }

    isAuthenticated() {
        return this.currentUser?.isAuthenticated === true;
    }
}

// प्रमाणीकरण प्रणाली सुरु गर्ने
const auth = new AuthSystem();