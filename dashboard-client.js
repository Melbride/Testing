// Dashboard functionality for client
let currentCredits = 3;
let bookings = [];
let fundis = [
    {
        id: 1,
        name: "John Kamau",
        service: "plumbing",
        location: "nairobi",
        rating: 4.8,
        hourlyRate: 300,
        experience: "5 years",
        avatar: "JK",
        skills: ["Pipe Repairs", "Leak Fixing", "Installation"],
        available: true
    },
    {
        id: 2,
        name: "Mary Wanjiku",
        service: "electrical",
        location: "nairobi",
        rating: 4.9,
        hourlyRate: 400,
        experience: "7 years",
        avatar: "MW",
        skills: ["Wiring", "Repairs", "Installation"],
        available: true
    },
    {
        id: 3,
        name: "Peter Ochieng",
        service: "painting",
        location: "kisumu",
        rating: 4.7,
        hourlyRate: 250,
        experience: "4 years",
        avatar: "PO",
        skills: ["Interior", "Exterior", "Decorative"],
        available: false
    },
    {
        id: 4,
        name: "Grace Akinyi",
        service: "cleaning",
        location: "mombasa",
        rating: 4.6,
        hourlyRate: 200,
        experience: "3 years",
        avatar: "GA",
        skills: ["Deep Clean", "Regular", "Office"],
        available: true
    },
    {
        id: 5,
        name: "David Mwangi",
        service: "carpentry",
        location: "nakuru",
        rating: 4.9,
        hourlyRate: 350,
        experience: "8 years",
        avatar: "DM",
        skills: ["Furniture", "Doors", "Custom Work"],
        available: true
    }
];

// Navigation functions - moved to bottom with profile loading

// Search and filter fundis
function searchFundis() {
    const serviceFilter = document.getElementById('serviceFilter').value;
    const locationFilter = document.getElementById('locationFilter').value;
    
    let filteredFundis = fundis.filter(fundi => {
        const serviceMatch = !serviceFilter || fundi.service === serviceFilter;
        const locationMatch = !locationFilter || fundi.location === locationFilter;
        return serviceMatch && locationMatch;
    });
    
    displayFundis(filteredFundis);
}

function loadFundis() {
    displayFundis(fundis);
}

function displayFundis(fundisToShow) {
    const fundisGrid = document.getElementById('fundisGrid');
    
    if (fundisToShow.length === 0) {
        fundisGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No fundis found</h3>
                <p>Try adjusting your search filters</p>
            </div>
        `;
        return;
    }
    
    fundisGrid.innerHTML = fundisToShow.map(fundi => `
        <div class="fundi-card ${!fundi.available ? 'unavailable' : ''}">
            <div class="fundi-header">
                <div class="fundi-avatar">
                    <span>${fundi.avatar}</span>
                </div>
                <div class="fundi-info">
                    <h3>${fundi.name}</h3>
                    <p class="service">${fundi.service.charAt(0).toUpperCase() + fundi.service.slice(1)}</p>
                    <p class="location"><i class="fas fa-map-marker-alt"></i> ${fundi.location.charAt(0).toUpperCase() + fundi.location.slice(1)}</p>
                </div>
                <div class="fundi-status">
                    <span class="status ${fundi.available ? 'available' : 'busy'}">
                        ${fundi.available ? 'Available' : 'Busy'}
                    </span>
                </div>
            </div>
            
            <div class="fundi-details">
                <div class="rating">
                    <i class="fas fa-star"></i>
                    <span>${fundi.rating}</span>
                    <small>(${fundi.experience})</small>
                </div>
                <div class="rate">
                    <strong>KSh ${fundi.hourlyRate}/hr</strong>
                </div>
            </div>
            
            <div class="fundi-skills">
                ${fundi.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
            
            <div class="fundi-actions">
                <button class="btn-contact ${!fundi.available ? 'disabled' : ''}" 
                        onclick="contactFundi(${fundi.id})" 
                        ${!fundi.available ? 'disabled' : ''}>
                    <i class="fas fa-comments"></i>
                    Contact (1 Credit)
                </button>
            </div>
        </div>
    `).join('');
}

// Contact fundi function
async function contactFundi(fundiId) {
    if (currentCredits <= 0) {
        alert('You need credits to contact fundis. Please buy more credits.');
        showSection('credits');
        return;
    }
    
    const fundi = fundis.find(f => f.id === fundiId);
    if (!fundi) return;
    
    // Use demo auth to deduct credit and create booking
    const creditResult = window.demoAuth.updateCredits(-1, `Contacted ${fundi.name} for ${fundi.service} service`);
    
    if (!creditResult.success) {
        alert('Failed to deduct credit. Please try again.');
        return;
    }
    
    // Update local credits display
    currentCredits = creditResult.newBalance;
    updateCreditsDisplay();
    
    // Create booking using demo auth
    const bookingResult = window.demoAuth.createBooking({
        fundiId: fundiId,
        fundiName: fundi.name,
        service: fundi.service,
        rate: fundi.hourlyRate
    });
    
    if (bookingResult.success) {
        bookings.push(bookingResult.booking);
        updateBookingCount();
    }
    
    // Trigger WhatsApp bot
    try {
            const response = await fetch('http://localhost:3002/api/bot/trigger-booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    clientPhone: '254700000001',
                    fundiPhone: fundi.id === 1 ? '254712345678' : '254723456789',
                    service: fundi.service,
                    clientName: 'Sarah Mwangi',
                    fundiName: fundi.name
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Open dual WhatsApp demo - shows both client and fundi sides
                window.open('http://localhost:3002', '_blank');
                
                // Auto-trigger the booking conversation after a short delay
                setTimeout(() => {
                    // This simulates the real WhatsApp bot starting the conversation
                    const demoWindow = window.open('http://localhost:3002', '_blank');
                    if (demoWindow) {
                        // Send message to demo window to auto-start booking
                        setTimeout(() => {
                            try {
                                demoWindow.postMessage({ action: 'autoStartBooking', fundi: fundi.name }, '*');
                            } catch (e) {
                                console.log('Demo window communication - normal in demo mode');
                            }
                        }, 1000);
                    }
                }, 500);
            } else {
                throw new Error('Bot API failed');
            }
        } catch (error) {
            console.error('Bot integration error:', error);
        // Still open dual WhatsApp demo
        window.open('http://localhost:3002', '_blank');
    }
}

// Booking management
function loadBookings() {
    const bookingsList = document.getElementById('bookingsList');
    
    if (bookings.length === 0) {
        bookingsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <h3>No bookings yet</h3>
                <p>Start by finding and booking a fundi for your project</p>
                <button class="btn-primary" onclick="showSection('findFundis')">
                    <i class="fas fa-search"></i>
                    Find Fundis
                </button>
            </div>
        `;
        return;
    }
    
    bookingsList.innerHTML = bookings.map(booking => `
        <div class="booking-card">
            <div class="booking-header">
                <div class="booking-info">
                    <h3>${booking.fundiName}</h3>
                    <p class="service">${booking.service.charAt(0).toUpperCase() + booking.service.slice(1)} Service</p>
                </div>
                <div class="booking-status">
                    <span class="status ${booking.status}">${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                </div>
            </div>
            <div class="booking-details">
                <p><i class="fas fa-calendar"></i> Contacted: ${booking.date}</p>
                <p><i class="fas fa-money-bill"></i> Rate: KSh ${booking.rate}/hr</p>
            </div>
            <div class="booking-actions">
                <button class="btn-secondary" onclick="viewBookingDetails(${booking.id})">
                    <i class="fas fa-eye"></i>
                    View Details
                </button>
            </div>
        </div>
    `).join('');
}

function viewBookingDetails(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
        alert(`Booking Details:\n\nFundi: ${booking.fundiName}\nService: ${booking.service}\nStatus: ${booking.status}\nDate: ${booking.date}\nRate: KSh ${booking.rate}/hr`);
    }
}

// Credits management
function buyCredits() {
    const amount = prompt('How many credits would you like to buy?\n\n1 Credit = KSh 50\n5 Credits = KSh 200\n10 Credits = KSh 350');
    
    if (amount && !isNaN(amount) && parseInt(amount) > 0) {
        const credits = parseInt(amount);
        const cost = credits <= 1 ? credits * 50 : credits <= 5 ? credits * 40 : credits * 35;
        
        const confirmed = confirm(`Purchase ${credits} credits for KSh ${cost}?`);
        if (confirmed) {
            // Use demo auth to add credits
            const result = window.demoAuth.updateCredits(credits, `Purchased ${credits} credits for KSh ${cost}`);
            
            if (result.success) {
                currentCredits = result.newBalance;
                updateCreditsDisplay();
                alert(result.message);
            } else {
                alert('Failed to purchase credits: ' + result.error);
            }
        }
    }
}

// Profile management
function updateProfile() {
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const location = document.getElementById('location').value;
    
    if (!fullName || !email || !phone || !location) {
        alert('Please fill in all fields');
        return;
    }
    
    // Update profile using demo auth
    const [firstName, lastName] = fullName.split(' ');
    const result = window.demoAuth.updateProfile({
        firstName: firstName || fullName,
        lastName: lastName || '',
        email: email,
        phone: phone,
        location: location
    });
    
    if (result.success) {
        // Show success message briefly
        const button = event.target;
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Profile Updated!';
        button.style.background = '#10b981';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
        }, 2000);
        
        // Update welcome message if name changed
        document.getElementById('welcomeMessage').textContent = `Welcome back, ${result.user.firstName}!`;
    } else {
        alert('Failed to update profile: ' + result.error);
    }
}

// Utility functions
function updateCreditsDisplay() {
    document.getElementById('creditsCount').textContent = `${currentCredits} Credits`;
    const balanceElement = document.querySelector('.credit-balance h3');
    if (balanceElement) {
        balanceElement.textContent = `${currentCredits} Credits Available`;
    }
}

function updateBookingCount() {
    document.getElementById('bookingCount').textContent = `${bookings.length} Bookings`;
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Client Dashboard loaded');
    
    // Check if user is logged in
    if (!window.demoAuth.isLoggedIn()) {
        alert('Please login first');
        window.location.href = 'index.html';
        return;
    }
    
    // Get current user and personalize dashboard
    const user = window.demoAuth.getCurrentUser();
    if (user) {
        // Update welcome message
        document.getElementById('welcomeMessage').textContent = `Welcome back, ${user.firstName}!`;
        
        // Update credits display with real data
        currentCredits = user.credits;
        updateCreditsDisplay();
        
        // Load user's bookings
        loadUserBookings();
    }
    
    loadFundis();
});

// Load user's actual bookings
function loadUserBookings() {
    const userBookings = window.demoAuth.getBookings();
    bookings = userBookings;
    updateBookingCount();
}

// Load user profile data into form
function loadProfileData() {
    const user = window.demoAuth.getCurrentUser();
    if (user) {
        document.getElementById('fullName').value = `${user.firstName} ${user.lastName || ''}`;
        document.getElementById('email').value = user.email || '';
        document.getElementById('phone').value = user.phone || '';
        document.getElementById('location').value = user.location || '';
    }
}

// Logout function
function logout() {
    const confirmed = confirm('Are you sure you want to logout?');
    if (confirmed) {
        window.demoAuth.logout();
        alert('Logged out successfully!');
        window.location.href = 'index.html';
    }
}

// Load profile data when profile section is shown
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.section-content');
    sections.forEach(section => section.style.display = 'none');
    
    // Remove active class from all nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    // Add active class to clicked nav item
    const clickedNav = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (clickedNav) {
        clickedNav.classList.add('active');
    }
    
    // Load section-specific content
    if (sectionName === 'findFundis') {
        loadFundis();
    } else if (sectionName === 'bookings') {
        loadBookings();
    } else if (sectionName === 'profile') {
        loadProfileData();
    }
}