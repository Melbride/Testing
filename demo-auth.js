// Demo Authentication System - Simulates real backend
class DemoAuth {
    constructor() {
        this.users = {
            // Demo users for testing
            'john@client.com': {
                id: 'client-001',
                firstName: 'John',
                lastName: 'Mwangi',
                email: 'john@client.com',
                phone: '254712345678',
                userType: 'client',
                location: 'nairobi',
                credits: 5,
                password: 'demo123',
                joinDate: '2024-01-15'
            },
            'mary@fundi.com': {
                id: 'fundi-001',
                firstName: 'Mary',
                lastName: 'Wanjiku',
                email: 'mary@fundi.com',
                phone: '254723456789',
                userType: 'fundi',
                location: 'nairobi',
                serviceCategory: 'electrical',
                hourlyRate: 400,
                rating: 4.9,
                totalJobs: 127,
                password: 'demo123',
                joinDate: '2024-01-10'
            }
        };
        
        this.currentUser = this.loadCurrentUser();
    }
    
    // Load user from localStorage
    loadCurrentUser() {
        const userData = localStorage.getItem('fundifix_user');
        return userData ? JSON.parse(userData) : null;
    }
    
    // Save user to localStorage
    saveCurrentUser(user) {
        localStorage.setItem('fundifix_user', JSON.stringify(user));
        this.currentUser = user;
    }
    
    // Login simulation
    login(email, password) {
        const user = this.users[email];
        
        if (!user || user.password !== password) {
            return {
                success: false,
                error: 'Invalid email or password'
            };
        }
        
        // Simulate successful login
        const loginData = {
            ...user,
            lastLogin: new Date().toISOString(),
            loginCount: (user.loginCount || 0) + 1
        };
        
        this.saveCurrentUser(loginData);
        
        return {
            success: true,
            user: loginData,
            message: `Welcome back, ${user.firstName}!`
        };
    }
    
    // Register simulation
    register(userData) {
        const { email, password, firstName, lastName, phone, userType, location, serviceCategory, hourlyRate } = userData;
        
        // Check if user exists
        if (this.users[email]) {
            return {
                success: false,
                error: 'User already exists'
            };
        }
        
        // Create new user
        const newUser = {
            id: `${userType}-${Date.now()}`,
            firstName,
            lastName,
            email,
            phone,
            userType,
            location,
            password,
            credits: userType === 'client' ? 3 : 0,
            joinDate: new Date().toISOString(),
            ...(userType === 'fundi' && {
                serviceCategory,
                hourlyRate: parseFloat(hourlyRate),
                rating: 0,
                totalJobs: 0
            })
        };
        
        // Save to demo users
        this.users[email] = newUser;
        this.saveCurrentUser(newUser);
        
        return {
            success: true,
            user: newUser,
            message: `Welcome to FundiFix, ${firstName}!`
        };
    }
    
    // Logout
    logout() {
        localStorage.removeItem('fundifix_user');
        this.currentUser = null;
        return { success: true };
    }
    
    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }
    
    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }
    
    // Update user profile
    updateProfile(updates) {
        if (!this.currentUser) {
            return { success: false, error: 'Not logged in' };
        }
        
        // Update current user
        const updatedUser = { ...this.currentUser, ...updates };
        this.saveCurrentUser(updatedUser);
        
        // Update in users database
        this.users[this.currentUser.email] = updatedUser;
        
        return {
            success: true,
            user: updatedUser,
            message: 'Profile updated successfully!'
        };
    }
    
    // Update credits
    updateCredits(amount, description) {
        if (!this.currentUser) {
            return { success: false, error: 'Not logged in' };
        }
        
        const newCredits = Math.max(0, this.currentUser.credits + amount);
        const updatedUser = { ...this.currentUser, credits: newCredits };
        
        this.saveCurrentUser(updatedUser);
        this.users[this.currentUser.email] = updatedUser;
        
        // Save transaction
        this.saveTransaction({
            type: amount > 0 ? 'earned' : 'spent',
            amount: Math.abs(amount),
            description,
            timestamp: new Date().toISOString(),
            balanceAfter: newCredits
        });
        
        return {
            success: true,
            newBalance: newCredits,
            message: description
        };
    }
    
    // Save transaction to localStorage
    saveTransaction(transaction) {
        const transactions = JSON.parse(localStorage.getItem('fundifix_transactions') || '[]');
        transactions.unshift({ ...transaction, id: Date.now() });
        localStorage.setItem('fundifix_transactions', JSON.stringify(transactions.slice(0, 50))); // Keep last 50
    }
    
    // Get transaction history
    getTransactions() {
        return JSON.parse(localStorage.getItem('fundifix_transactions') || '[]');
    }
    
    // Create booking
    createBooking(bookingData) {
        const booking = {
            id: `booking-${Date.now()}`,
            clientId: this.currentUser?.id,
            clientName: this.currentUser?.firstName + ' ' + this.currentUser?.lastName,
            ...bookingData,
            status: 'initiated',
            createdAt: new Date().toISOString()
        };
        
        const bookings = JSON.parse(localStorage.getItem('fundifix_bookings') || '[]');
        bookings.unshift(booking);
        localStorage.setItem('fundifix_bookings', JSON.stringify(bookings.slice(0, 20))); // Keep last 20
        
        return { success: true, booking };
    }
    
    // Get bookings
    getBookings() {
        return JSON.parse(localStorage.getItem('fundifix_bookings') || '[]');
    }
}

// Create global instance
window.demoAuth = new DemoAuth();