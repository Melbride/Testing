// Global variables
let selectedUserType = '';
let signupData = {};

// Kenya cities for location selection
const kenyaCities = [
    'Nairobi',
    'Mombasa', 
    'Kisumu',
    'Nakuru',
    'Eldoret',
    'Thika',
    'Machakos',
    'Meru',
    'Nyeri',
    'Kitale',
    'Garissa',
    'Kakamega',
    'Malindi',
    'Lamu',
    'Isiolo',
    'Naivasha',
    'Kericho',
    'Bomet',
    'Embu',
    'Kitui'
];

// Modal functions
function openSignupModal() {
    document.getElementById('signupModal').style.display = 'block';
    showStep('userTypeStep');
}

function closeSignupModal() {
    document.getElementById('signupModal').style.display = 'none';
    resetSignupFlow();
}

let currentLoginType = 'client';

function showLoginForm(type) {
    currentLoginType = type;
    document.getElementById('loginModalTitle').textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} Login`;
    document.getElementById('loginButtonText').textContent = `Sign In as ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    document.getElementById('loginModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('loginForm').reset();
}

function switchToSignup() {
    closeLoginModal();
    openSignupModal();
}

function showForgotPassword() {
    closeLoginModal();
    document.getElementById('forgotPasswordModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeForgotPasswordModal() {
    document.getElementById('forgotPasswordModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('forgotPasswordForm').reset();
}

function backToLogin() {
    closeForgotPasswordModal();
    showLoginForm(currentLoginType);
}

// Handle login form submission
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            // Simple validation
            if (!email || !password) {
                alert('Please enter both email and password');
                return;
            }
            
            // Use demo auth system
            const result = window.demoAuth.login(email, password);
            
            if (result.success) {
                closeLoginModal();
                
                if (result.user.userType === 'client') {
                    window.location.href = 'dashboard-client.html';
                } else {
                    window.location.href = 'dashboard-fundi.html';
                }
            } else {
                alert(result.error);
            }
        });
    }
    
    // Handle forgot password form submission
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('resetEmail').value;
            
            if (!email) {
                alert('Please enter your email address');
                return;
            }
            
            // Simulate sending reset email
            alert(`Password reset link has been sent to ${email}\n\nPlease check your email and follow the instructions to reset your password.`);
            closeForgotPasswordModal();
        });
    }
});

function openLoginModal(type) {
    showLoginForm(type);
}

// Step navigation
function showStep(stepId) {
    // Hide all steps
    const steps = document.querySelectorAll('.signup-step');
    steps.forEach(step => step.classList.remove('active'));
    
    // Show selected step
    document.getElementById(stepId).classList.add('active');
}

function resetSignupFlow() {
    selectedUserType = '';
    signupData = {};
    showStep('userTypeStep');
    
    // Clear form
    document.getElementById('signupForm').reset();
    
    // Clear user type selection
    const userTypeCards = document.querySelectorAll('.user-type-card');
    userTypeCards.forEach(card => card.classList.remove('selected'));
    
    // Clear verification codes
    const codeInputs = document.querySelectorAll('.code-input');
    codeInputs.forEach(input => input.value = '');
}

// User type selection
function selectUserType(type) {
    selectedUserType = type;
    
    // Update UI
    const userTypeCards = document.querySelectorAll('.user-type-card');
    userTypeCards.forEach(card => card.classList.remove('selected'));
    
    event.target.closest('.user-type-card').classList.add('selected');
    
    // Auto-advance after selection
    setTimeout(() => {
        showStep('registrationStep');
        updateModalTitle(type);
        setupFormForUserType(type);
    }, 500);
}

function setupFormForUserType(type) {
    // Populate location dropdown
    populateLocationDropdown();
    
    // Show/hide fundi-specific fields
    const fundiFields = document.getElementById('fundiFields');
    const serviceCategory = document.getElementById('serviceCategory');
    const hourlyRate = document.getElementById('hourlyRate');
    
    if (type === 'fundi') {
        // Show fundi fields with animation
        fundiFields.style.display = 'block';
        setTimeout(() => {
            fundiFields.style.opacity = '1';
            fundiFields.style.transform = 'translateY(0)';
            fundiFields.style.maxHeight = '500px';
        }, 10);
        serviceCategory.required = true;
        hourlyRate.required = true;
        populateServiceCategories();
    } else {
        // Hide fundi fields with animation
        fundiFields.style.opacity = '0';
        fundiFields.style.transform = 'translateY(-20px)';
        fundiFields.style.maxHeight = '0';
        setTimeout(() => {
            fundiFields.style.display = 'none';
        }, 400);
        serviceCategory.required = false;
        hourlyRate.required = false;
    }
}

function populateLocationDropdown() {
    const locationSelect = document.getElementById('signupLocation');
    
    if (!locationSelect) {
        console.error('Location select element not found!');
        return;
    }
    
    locationSelect.innerHTML = '<option value="">Select your city</option>';
    
    kenyaCities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        locationSelect.appendChild(option);
    });
    
    console.log('Location dropdown populated with', kenyaCities.length, 'cities');
    
    // Add change event listener for debugging
    locationSelect.addEventListener('change', function() {
        console.log('Location selected:', this.value);
    });
}

async function populateServiceCategories() {
    try {
        const response = await fetch('/api/service-categories');
        const categories = await response.json();
        
        const serviceSelect = document.getElementById('serviceCategory');
        serviceSelect.innerHTML = '<option value="">Select your service</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = `${category.icon} ${category.name}`;
            serviceSelect.appendChild(option);
        });
    } catch (error) {
        // Fallback to hardcoded services
        const services = [
            {id: 1, name: 'Plumbing', icon: '🔧'},
            {id: 2, name: 'Electrical', icon: '⚡'},
            {id: 3, name: 'Painting', icon: '🎨'},
            {id: 4, name: 'Carpentry', icon: '🔨'},
            {id: 5, name: 'Cleaning', icon: '🧹'},
            {id: 6, name: 'Gardening', icon: '🌱'},
            {id: 7, name: 'Repairs', icon: '🛠️'},
            {id: 8, name: 'Movers', icon: '🚚'}
        ];
        
        const serviceSelect = document.getElementById('serviceCategory');
        serviceSelect.innerHTML = '<option value="">Select your service</option>';
        
        services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = `${service.icon} ${service.name}`;
            serviceSelect.appendChild(option);
        });
    }
}

function updateModalTitle(type) {
    const title = document.getElementById('signupModalTitle');
    const typeText = type === 'client' ? 'Client' : 'Fundi';
    title.textContent = `Join FundiFix as a ${typeText} - Get 3 Free Credits!`;
}

// Form submission
document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Collect form data
    const formData = new FormData(this);
    signupData = {
        userType: selectedUserType,
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password: formData.get('password'),
        location: formData.get('location'),
        serviceCategory: formData.get('serviceCategory'),
        hourlyRate: formData.get('hourlyRate')
    };
    
    // Debug: Log collected data
    console.log('Collected signup data:', signupData);
    console.log('Location value:', signupData.location);
    console.log('Selected user type:', selectedUserType);
    
    // Validate form
    if (!validateSignupForm()) {
        return;
    }
    
    // Show phone verification step
    document.getElementById('phoneDisplay').textContent = signupData.phone;
    showStep('verificationStep');
    
    // Send SMS verification
    simulateSendSMS();
});

function validateSignupForm() {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'password', 'location'];
    
    for (let field of requiredFields) {
        if (!signupData[field] || signupData[field].trim() === '') {
            alert(`Please fill in your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
            return false;
        }
    }
    
    // Validate fundi-specific fields
    if (selectedUserType === 'fundi') {
        if (!signupData.serviceCategory) {
            alert('Please select the service you offer');
            return false;
        }
        if (!signupData.hourlyRate || signupData.hourlyRate < 100) {
            alert('Please enter a valid hourly rate (minimum KSh 100)');
            return false;
        }
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupData.email)) {
        alert('Please enter a valid email address');
        return false;
    }
    
    // Validate phone (Kenyan format)
    const phoneRegex = /^254[0-9]{9}$/;
    if (!phoneRegex.test(signupData.phone.replace(/\s+/g, ''))) {
        alert('Please enter a valid Kenyan phone number (254XXXXXXXXX)');
        return false;
    }
    
    // Check terms agreement
    if (!document.getElementById('agreeTerms').checked) {
        alert('Please agree to the Terms of Service and Privacy Policy');
        return false;
    }
    
    return true;
}

async function simulateSendSMS() {
    try {
        console.log('Sending verification SMS to:', signupData.phone);
        
        const response = await fetch('/api/auth/send-verification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phone: signupData.phone
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Verification request successful:', result.message);
            console.log('Response data:', result);
            
            if (result.demoCode || result.isDemoMode) {
                // Demo mode - show the actual code
                console.log('Demo code received:', result.demoCode);
                showDemoCode(result.demoCode);
            } else {
                // Real SMS sent - show success message
                const verificationStep = document.getElementById('verificationStep');
                const stepHeader = verificationStep.querySelector('.step-header');
                
                // Remove any existing messages
                const existingMessage = stepHeader.querySelector('.sms-success-message');
                if (existingMessage) {
                    existingMessage.remove();
                }
                
                const successMessage = document.createElement('div');
                successMessage.className = 'sms-success-message';
                successMessage.style.cssText = `
                    background: #d1fae5;
                    border: 1px solid #10b981;
                    border-radius: 8px;
                    padding: 1rem;
                    margin: 1rem 0;
                    text-align: center;
                    color: #1f2937;
                    font-weight: 500;
                `;
                successMessage.innerHTML = `
                    <i class="fas fa-check-circle" style="color: #10b981; margin-right: 0.5rem;"></i>
                    <strong>SMS Sent!</strong> Check your phone for the verification code
                `;
                
                stepHeader.appendChild(successMessage);
            }
        } else {
            console.error('SMS sending failed:', result.error);
            showDemoCode(); // Fallback to demo
        }
    } catch (error) {
        console.error('SMS request failed:', error);
        showDemoCode(); // Fallback to demo
    }
}

function showDemoCode(code = '123456') {
    console.log('Demo mode - Verification code:', code);
    
    const verificationStep = document.getElementById('verificationStep');
    const stepHeader = verificationStep.querySelector('.step-header');
    
    // Remove existing demo message if any
    const existingMessage = stepHeader.querySelector('.demo-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const demoMessage = document.createElement('div');
    demoMessage.className = 'demo-message';
    demoMessage.style.cssText = `
        background: #e0f2fe;
        border: 1px solid #3b82f6;
        border-radius: 8px;
        padding: 1rem;
        margin: 1rem 0;
        text-align: center;
        color: #1f2937;
        font-weight: 500;
    `;
    demoMessage.innerHTML = `
        <i class="fas fa-exclamation-triangle" style="color: #f59e0b; margin-right: 0.5rem;"></i>
        <strong>DEMO MODE - NO SMS SENT</strong><br>
        <span style="font-size: 1.2em; color: #1f2937; margin-top: 0.5rem; display: block;">
            Enter this code: <strong style="font-size: 1.5em; color: #dc2626;">${code}</strong>
        </span>
    `;
    
    stepHeader.appendChild(demoMessage);
}

// Phone verification
function moveToNext(input, index) {
    if (input.value.length === 1 && index < 5) {
        const nextInput = document.querySelectorAll('.code-input')[index + 1];
        if (nextInput) {
            nextInput.focus();
        }
    }
    
    // Auto-verify if all fields are filled
    const codeInputs = document.querySelectorAll('.code-input');
    const allFilled = Array.from(codeInputs).every(input => input.value.length === 1);
    
    if (allFilled) {
        setTimeout(verifyPhone, 500);
    }
}

async function verifyPhone() {
    const codeInputs = document.querySelectorAll('.code-input');
    const enteredCode = Array.from(codeInputs).map(input => input.value).join('');
    
    if (enteredCode.length !== 6) {
        alert('Please enter the complete 6-digit verification code');
        return;
    }
    
    // Try to verify with backend first, fallback to demo
    const isValid = await verifyWithBackend(enteredCode) || enteredCode === '123456';
    
    if (isValid) {
        try {
            // Create account first
            await createAccount();
            
            // Only show welcome step if account creation succeeds
            showStep('welcomeStep');
        } catch (error) {
            // Account creation failed - show creative error and redirect
            console.error('Account creation failed:', error);
            showAccountCreationError(error.message);
        }
    } else {
        showVerificationError();
        // Clear inputs
        codeInputs.forEach(input => input.value = '');
        codeInputs[0].focus();
    }
}

function resendCode() {
    alert('Verification code resent to ' + signupData.phone);
    simulateSendSMS();
}

async function createAccount() {
    try {
        console.log('Creating demo account...');
        
        // Use demo auth system instead of real API
        const result = window.demoAuth.register({
            firstName: signupData.firstName,
            lastName: signupData.lastName,
            email: signupData.email,
            phone: signupData.phone,
            password: signupData.password,
            userType: selectedUserType,
            location: signupData.location,
            serviceCategory: signupData.serviceCategory,
            hourlyRate: signupData.hourlyRate
        });
        
        if (result.success) {
            console.log('✅ Demo account created successfully:', result.user);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('❌ Account creation failed:', error);
        alert('Account Creation Failed: ' + error.message);
        throw error;
    }
}

function completeSignup() {
    // Close modal
    closeSignupModal();
    
    // Debug logging
    console.log('completeSignup called');
    console.log('selectedUserType:', selectedUserType);
    console.log('signupData:', signupData);
    
    // Recover data from localStorage if variables are empty
    if (!selectedUserType) {
        selectedUserType = localStorage.getItem('selectedUserType');
        console.log('Recovered selectedUserType from localStorage:', selectedUserType);
    }
    
    if (!signupData || Object.keys(signupData).length === 0) {
        const storedSignupData = localStorage.getItem('signupData');
        if (storedSignupData) {
            signupData = JSON.parse(storedSignupData);
            console.log('Recovered signupData from localStorage:', signupData);
        }
    }
    
    // Small delay to ensure modal closes properly
    setTimeout(() => {
        if (selectedUserType === 'client') {
            console.log('Redirecting to client dashboard');
            window.location.href = 'dashboard-client.html';
        } else if (selectedUserType === 'fundi') {
            console.log('Redirecting to fundi dashboard');
            window.location.href = 'dashboard-fundi.html';
        } else {
            console.log('Unknown user type, defaulting to client dashboard');
            window.location.href = 'dashboard-client.html';
        }
    }, 100);
}

function updateUIForLoggedInUser() {
    try {
        // Update navigation to show logged-in state
        const authButtons = document.querySelector('.auth-buttons');
        if (authButtons) {
            authButtons.innerHTML = `
                <div class="user-menu">
                    <span>Welcome, ${signupData.firstName || 'User'}!</span>
                    <button class="btn-dashboard" onclick="openDashboard()">Dashboard</button>
                    <button class="btn-logout" onclick="logout()">Logout</button>
                </div>
            `;
        }
        
        // Keep fundis section as login buttons on main page
        // Search functionality will be in dashboard
    } catch (error) {
        console.error('Error updating UI for logged in user:', error);
    }
}

function updateFundisSection() {
    // Don't update the fundis section on the main page
    // This will be handled in the dashboard
    console.log('Fundis section will show login buttons only');
}

function openDashboard() {
    alert('Dashboard functionality will be implemented in the next phase');
}

function logout() {
    // Clear stored data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Reset UI to logged-out state
    location.reload();
}

function switchToLogin() {
    closeSignupModal();
    alert('Login functionality will be implemented in the next phase');
}

// Helper functions for backend integration
async function verifyWithBackend(code) {
    try {
        console.log('Verifying with backend:', { phone: signupData.phone, code: code });
        
        const response = await fetch('/api/auth/verify-phone', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phone: signupData.phone,
                code: code
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.log('Verification error:', errorData);
        }
        
        return response.ok;
    } catch (error) {
        console.log('Verification fallback to demo mode:', error);
        return false;
    }
}

async function addWelcomeCredits(userId) {
    try {
        await fetch('/api/credits/add-welcome-bonus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                userId: userId,
                credits: 3,
                reason: 'Welcome bonus'
            })
        });
    } catch (error) {
        console.log('Credits will be added manually');
    }
}

function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
        try {
            const user = JSON.parse(userData);
            selectedUserType = user.userType || user.type;
            
            // Handle different user data structures
            let firstName = '';
            if (user.firstName) {
                firstName = user.firstName;
            } else if (user.name && typeof user.name === 'string') {
                firstName = user.name.split(' ')[0];
            }
            
            signupData = { firstName: firstName };
            updateUIForLoggedInUser();
        } catch (error) {
            console.error('Error parsing user data:', error);
            // Clear invalid data
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
        }
    }
}

// Utility functions
function scrollToServices() {
    document.getElementById('services').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Password toggle functionality
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = document.getElementById(inputId + '-icon');
    
    if (passwordInput.type === 'password') {
        // Show password
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    } else {
        // Hide password
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('signupModal');
    if (event.target === modal) {
        closeSignupModal();
    }
}

// Keyboard navigation
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeSignupModal();
    }
});

// Creative Error Handling Functions
function showAccountCreationError(errorMessage) {
    const verificationStep = document.getElementById('verificationStep');
    
    // Create error overlay
    const errorOverlay = document.createElement('div');
    errorOverlay.className = 'error-overlay';
    errorOverlay.innerHTML = `
        <div class="error-card">
            <div class="error-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Account Creation Failed</h3>
            <p class="error-message">${errorMessage}</p>
            <div class="error-actions">
                <button class="btn-try-again" onclick="handleAccountError()">
                    <i class="fas fa-redo"></i>
                    Try Again
                </button>
                <button class="btn-contact-support" onclick="contactSupport()">
                    <i class="fas fa-headset"></i>
                    Contact Support
                </button>
            </div>
        </div>
    `;
    
    verificationStep.appendChild(errorOverlay);
    
    // Animate in
    setTimeout(() => {
        errorOverlay.style.opacity = '1';
        errorOverlay.querySelector('.error-card').style.transform = 'translateY(0) scale(1)';
    }, 10);
}

function showVerificationError() {
    const verificationStep = document.getElementById('verificationStep');
    const stepHeader = verificationStep.querySelector('.step-header');
    
    // Remove existing error messages
    const existingError = stepHeader.querySelector('.verification-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Create error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'verification-error';
    errorMessage.innerHTML = `
        <i class="fas fa-times-circle"></i>
        <span>Invalid verification code. Please check and try again.</span>
    `;
    
    stepHeader.appendChild(errorMessage);
    
    // Animate in
    setTimeout(() => {
        errorMessage.style.opacity = '1';
        errorMessage.style.transform = 'translateY(0)';
    }, 10);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (errorMessage.parentNode) {
            errorMessage.style.opacity = '0';
            errorMessage.style.transform = 'translateY(-10px)';
            setTimeout(() => errorMessage.remove(), 300);
        }
    }, 5000);
}

function handleAccountError() {
    // Remove error overlay
    const errorOverlay = document.querySelector('.error-overlay');
    if (errorOverlay) {
        errorOverlay.style.opacity = '0';
        setTimeout(() => errorOverlay.remove(), 300);
    }
    
    // Go back to registration step with pre-filled data
    setTimeout(() => {
        showStep('registrationStep');
        
        // Pre-fill form with previous data
        if (signupData.firstName) document.getElementById('firstName').value = signupData.firstName;
        if (signupData.lastName) document.getElementById('lastName').value = signupData.lastName;
        if (signupData.email) document.getElementById('signupEmail').value = signupData.email;
        if (signupData.phone) document.getElementById('phoneNumber').value = signupData.phone;
        if (signupData.location) document.getElementById('signupLocation').value = signupData.location;
        
        // Show helpful message
        showHelpfulMessage('Please check your information and try again. Make sure all fields are filled correctly.');
    }, 400);
}

function contactSupport() {
    // Create support modal or redirect
    const supportMessage = `
        Need help? Contact our support team:
        
        📧 Email: support@fundifix.co.ke
        📱 WhatsApp: +254 700 000 001
        📞 Phone: +254 700 000 000
        
        We're here to help you get started!
    `;
    
    alert(supportMessage);
}

function showHelpfulMessage(message) {
    const registrationStep = document.getElementById('registrationStep');
    const stepHeader = registrationStep.querySelector('.step-header');
    
    const helpMessage = document.createElement('div');
    helpMessage.className = 'helpful-message';
    helpMessage.innerHTML = `
        <i class="fas fa-info-circle"></i>
        <span>${message}</span>
    `;
    
    stepHeader.appendChild(helpMessage);
    
    // Animate in
    setTimeout(() => {
        helpMessage.style.opacity = '1';
        helpMessage.style.transform = 'translateY(0)';
    }, 10);
    
    // Remove after 8 seconds
    setTimeout(() => {
        if (helpMessage.parentNode) {
            helpMessage.style.opacity = '0';
            setTimeout(() => helpMessage.remove(), 300);
        }
    }, 8000);
}

// Smooth scroll to sections
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Add click handlers to navigation links
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                const sectionId = href.substring(1);
                scrollToSection(sectionId);
            }
        });
    });
});

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('FundiFix loaded successfully');
    
    // Keep main page simple - no auto-login check
    
    // Add smooth scrolling to navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});