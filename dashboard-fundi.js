// Dashboard functionality for fundi
let totalEarnings = 0;
let completedJobs = 0;
let averageRating = 0;
let leads = [
    {
        id: 1,
        clientName: "Sarah Mwangi",
        service: "plumbing",
        location: "nairobi",
        description: "Need urgent pipe repair in kitchen",
        budget: "KSh 2000-3000",
        urgency: "urgent",
        contactedAt: new Date().toLocaleDateString(),
        status: "new"
    },
    {
        id: 2,
        clientName: "James Ochieng",
        service: "electrical",
        location: "kisumu", 
        description: "House wiring for new extension",
        budget: "KSh 15000-20000",
        urgency: "normal",
        contactedAt: new Date().toLocaleDateString(),
        status: "new"
    }
];
let jobs = [];
let fundiProfile = {
    name: "",
    email: "",
    phone: "",
    service: "",
    hourlyRate: 0,
    location: "",
    experience: "",
    skills: [],
    available: true,
    profileComplete: false
};

// Navigation functions
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
    if (event && event.target) {
        event.target.closest('.nav-item').classList.add('active');
    }
    
    // Load section-specific content
    if (sectionName === 'leads') {
        loadLeads();
    } else if (sectionName === 'jobs') {
        loadJobs();
    } else if (sectionName === 'earnings') {
        loadEarnings();
    }
}

// Load client leads
function loadLeads() {
    const leadsList = document.getElementById('leadsList');
    
    if (leads.length === 0) {
        leadsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>No leads yet</h3>
                <p>Complete your profile to start receiving client leads</p>
                <button class="btn-primary" onclick="showSection('profile')">
                    <i class="fas fa-user-edit"></i>
                    Complete Profile
                </button>
            </div>
        `;
        return;
    }
    
    leadsList.innerHTML = leads.map(lead => `
        <div class="lead-card">
            <div class="lead-header">
                <div class="lead-info">
                    <h3>${lead.clientName}</h3>
                    <p class="service">${lead.service.charAt(0).toUpperCase() + lead.service.slice(1)} Service</p>
                    <p class="location"><i class="fas fa-map-marker-alt"></i> ${lead.location.charAt(0).toUpperCase() + lead.location.slice(1)}</p>
                </div>
                <div class="lead-status">
                    <span class="urgency ${lead.urgency}">${lead.urgency.charAt(0).toUpperCase() + lead.urgency.slice(1)}</span>
                    <span class="status ${lead.status}">${lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}</span>
                </div>
            </div>
            
            <div class="lead-details">
                <p class="description">${lead.description}</p>
                <div class="lead-meta">
                    <span class="budget"><i class="fas fa-money-bill"></i> ${lead.budget}</span>
                    <span class="date"><i class="fas fa-calendar"></i> ${lead.contactedAt}</span>
                </div>
            </div>
            
            <div class="lead-actions">
                <button class="btn-primary" onclick="respondToLead(${lead.id})">
                    <i class="fas fa-reply"></i>
                    Respond to Lead
                </button>
                <button class="btn-secondary" onclick="viewLeadDetails(${lead.id})">
                    <i class="fas fa-eye"></i>
                    View Details
                </button>
            </div>
        </div>
    `).join('');
}

// Respond to client lead
function respondToLead(leadId) {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    
    const confirmed = confirm(`Respond to ${lead.clientName}'s request for ${lead.service} services?\n\nThis will connect you through our WhatsApp bot to discuss the project details.`);
    
    if (confirmed) {
        // Update lead status
        lead.status = 'responded';
        
        // Create job entry
        const job = {
            id: Date.now(),
            leadId: leadId,
            clientName: lead.clientName,
            service: lead.service,
            description: lead.description,
            budget: lead.budget,
            status: 'in_discussion',
            startDate: new Date().toLocaleDateString(),
            estimatedRate: fundiProfile.hourlyRate || 250
        };
        
        jobs.push(job);
        updateJobsCount();
        
        // Open WhatsApp directly - simulate real WhatsApp experience
        window.open('http://localhost:3002', '_blank');
        
        // Auto-trigger fundi notification after short delay
        setTimeout(() => {
            const demoWindow = window.open('http://localhost:3002', '_blank');
            if (demoWindow) {
                setTimeout(() => {
                    try {
                        demoWindow.postMessage({ action: 'autoShowFundiNotification', client: lead.clientName }, '*');
                    } catch (e) {
                        console.log('Demo window communication - normal in demo mode');
                    }
                }, 1000);
            }
        }, 500);
        
        // Refresh leads display
        loadLeads();
    }
}

function viewLeadDetails(leadId) {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
        alert(`Lead Details:\n\nClient: ${lead.clientName}\nService: ${lead.service}\nLocation: ${lead.location}\nDescription: ${lead.description}\nBudget: ${lead.budget}\nUrgency: ${lead.urgency}\nDate: ${lead.contactedAt}`);
    }
}

// Load jobs
function loadJobs() {
    const jobsList = document.getElementById('jobsList');
    
    if (jobs.length === 0) {
        jobsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-briefcase"></i>
                <h3>No jobs yet</h3>
                <p>Respond to client leads to start getting jobs</p>
                <button class="btn-primary" onclick="showSection('leads')">
                    <i class="fas fa-users"></i>
                    View Leads
                </button>
            </div>
        `;
        return;
    }
    
    jobsList.innerHTML = jobs.map(job => `
        <div class="job-card">
            <div class="job-header">
                <div class="job-info">
                    <h3>${job.clientName}</h3>
                    <p class="service">${job.service.charAt(0).toUpperCase() + job.service.slice(1)} Project</p>
                </div>
                <div class="job-status">
                    <span class="status ${job.status}">${job.status.replace('_', ' ').charAt(0).toUpperCase() + job.status.replace('_', ' ').slice(1)}</span>
                </div>
            </div>
            
            <div class="job-details">
                <p class="description">${job.description}</p>
                <div class="job-meta">
                    <span class="budget"><i class="fas fa-money-bill"></i> ${job.budget}</span>
                    <span class="rate"><i class="fas fa-clock"></i> KSh ${job.estimatedRate}/hr</span>
                    <span class="date"><i class="fas fa-calendar"></i> ${job.startDate}</span>
                </div>
            </div>
            
            <div class="job-actions">
                <button class="btn-primary" onclick="updateJobStatus(${job.id})">
                    <i class="fas fa-edit"></i>
                    Update Status
                </button>
                <button class="btn-secondary" onclick="viewJobDetails(${job.id})">
                    <i class="fas fa-eye"></i>
                    View Details
                </button>
            </div>
        </div>
    `).join('');
}

function updateJobStatus(jobId) {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    
    const newStatus = prompt(`Update job status for ${job.clientName}:\n\n1. in_discussion\n2. accepted\n3. in_progress\n4. completed\n5. cancelled\n\nEnter new status:`);
    
    if (newStatus && ['in_discussion', 'accepted', 'in_progress', 'completed', 'cancelled'].includes(newStatus)) {
        job.status = newStatus;
        
        // If completed, add to earnings
        if (newStatus === 'completed') {
            const earnings = prompt('Enter the amount you earned for this job (KSh):');
            if (earnings && !isNaN(earnings)) {
                totalEarnings += parseInt(earnings);
                completedJobs++;
                updateEarningsDisplay();
                alert(`Congratulations! Job completed and KSh ${earnings} added to your earnings.`);
            }
        }
        
        loadJobs();
        alert(`Job status updated to: ${newStatus.replace('_', ' ')}`);
    }
}

function viewJobDetails(jobId) {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
        alert(`Job Details:\n\nClient: ${job.clientName}\nService: ${job.service}\nDescription: ${job.description}\nBudget: ${job.budget}\nStatus: ${job.status}\nStart Date: ${job.startDate}\nEstimated Rate: KSh ${job.estimatedRate}/hr`);
    }
}

// Load earnings
function loadEarnings() {
    // Update earnings display is handled by updateEarningsDisplay()
}

// Profile management
function updateFundiProfile() {
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const serviceCategory = document.getElementById('serviceCategory').value;
    const hourlyRate = document.getElementById('hourlyRate').value;
    const location = document.getElementById('location').value;
    const experience = document.getElementById('experience').value;
    const skills = document.getElementById('skills').value;
    const availability = document.getElementById('availability').checked;
    
    if (!fullName || !email || !phone || !serviceCategory || !hourlyRate || !location || !experience) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Update profile
    fundiProfile = {
        name: fullName,
        email: email,
        phone: phone,
        service: serviceCategory,
        hourlyRate: parseInt(hourlyRate),
        location: location,
        experience: experience,
        skills: skills.split(',').map(s => s.trim()),
        available: availability,
        profileComplete: true
    };
    
    // Show success message briefly
    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> Profile Updated!';
    button.style.background = '#10b981';
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = '';
    }, 2000);
    
    // Update rating display
    document.getElementById('ratingDisplay').textContent = `${fundiProfile.service.charAt(0).toUpperCase() + fundiProfile.service.slice(1)} Fundi`;
}

// Utility functions
function updateLeadsCount() {
    const newLeads = leads.filter(lead => lead.status === 'new').length;
    document.getElementById('leadsCount').textContent = `${newLeads} New Leads`;
}

function updateJobsCount() {
    const activeJobs = jobs.filter(job => ['accepted', 'in_progress'].includes(job.status)).length;
    document.getElementById('jobsCount').textContent = `${activeJobs} Active Jobs`;
}

function updateEarningsDisplay() {
    document.getElementById('earningsTotal').textContent = `KSh ${totalEarnings.toLocaleString()}`;
    
    // Update earnings overview if section is visible
    const summaryItems = document.querySelectorAll('.summary-item h3');
    if (summaryItems.length >= 3) {
        summaryItems[0].textContent = `KSh ${totalEarnings.toLocaleString()}`;
        summaryItems[1].textContent = completedJobs.toString();
        summaryItems[2].textContent = averageRating.toFixed(1);
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Fundi Dashboard loaded');
    
    // Check if user is logged in
    if (!window.demoAuth.isLoggedIn()) {
        alert('Please login first');
        window.location.href = 'index.html';
        return;
    }
    
    // Get current user and personalize dashboard
    const user = window.demoAuth.getCurrentUser();
    if (user && user.userType === 'fundi') {
        document.getElementById('welcomeMessage').textContent = `Welcome back, ${user.firstName}!`;
    }
    
    updateLeadsCount();
    updateJobsCount();
    updateEarningsDisplay();
    loadLeads();
});