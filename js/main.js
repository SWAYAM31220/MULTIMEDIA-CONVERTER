// Main application initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    initializeApp();
});

function initializeApp() {
    console.log('Initializing application...');
    // Initialize UI components
    initializeUI();
    
    // Check if the API server is running
    checkServerStatus();

    // Setup event listeners
    setupEventListeners();

    // Initialize animations
    initializeAnimations();
}

function checkServerStatus() {
    const apiStatusElement = document.getElementById('apiStatus');
    if (!apiStatusElement) return;
    
    updateApiStatus('checking');
    
    const apiUrl = CONFIG.USE_PRODUCTION ? CONFIG.BASE_URL : CONFIG.LOCAL_URL;
    const statusEndpoint = apiUrl + CONFIG.ENDPOINTS.STATUS;
    
    console.log(`Checking server status at: ${statusEndpoint}`);
    
    fetch(statusEndpoint, { method: 'GET' })
        .then(response => {
            if (response.ok) {
                updateApiStatus('online');
                return response.json();
            } else {
                throw new Error('API server is not responding');
            }
        })
        .then(data => {
            console.log('API server status:', data);
        })
        .catch(error => {
            console.error('API server error:', error);
            updateApiStatus('offline');
        });
}

// Update API status indicator
function updateApiStatus(status) {
    const apiStatusElement = document.getElementById('apiStatus');
    if (!apiStatusElement) return;
    
    const iconElement = apiStatusElement.querySelector('i');
    const textElement = apiStatusElement.querySelector('span');
    
    apiStatusElement.className = 'api-status';
    
    switch (status) {
        case 'online':
            apiStatusElement.classList.add('online');
            iconElement.className = 'fas fa-circle';
            textElement.textContent = 'API Online';
            break;
        case 'offline':
            apiStatusElement.classList.add('offline');
            iconElement.className = 'fas fa-exclamation-circle';
            textElement.textContent = 'API Offline';
            break;
        case 'checking':
            iconElement.className = 'fas fa-sync fa-spin';
            textElement.textContent = 'Checking API...';
            break;
    }
}

function initializeUI() {
    console.log('Initializing UI components...');
    
    // Initialize quality slider
    const qualitySlider = document.getElementById('qualitySlider');
    if (qualitySlider) {
        qualitySlider.addEventListener('input', (e) => {
            const value = e.target.value;
            qualitySlider.style.setProperty('--value', value);
            qualitySlider.style.setProperty('--thumb-rotate', `${(value - 50) * 0.2}deg`);
        });
    }

    // Initialize success overlay close button
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            successOverlay.classList.add('hidden');
            resetUI();
        });
    }
    
    // Initialize environment toggle
    const envToggle = document.getElementById('envToggle');
    if (envToggle) {
        envToggle.checked = CONFIG.USE_PRODUCTION;
        envToggle.addEventListener('change', function() {
            CONFIG.USE_PRODUCTION = this.checked;
            updateApiStatus('checking');
            checkServerStatus();
            console.log(`Switched to ${CONFIG.USE_PRODUCTION ? 'production' : 'local'} API`);
        });
    }
    
    // Initialize responsive layout
    adjustLayoutForScreenSize();
}

function initializeAnimations() {
    // Add entrance animations to cards
    document.querySelectorAll('.file-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('animate-in');
    });

    // Initialize button hover effects
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseover', () => btn.classList.add('hover'));
        btn.addEventListener('mouseout', () => btn.classList.remove('hover'));
    });
}

function resetUI() {
    // Reset all UI elements to initial state
    document.querySelectorAll('.progress-bar').forEach(bar => {
        bar.style.width = '0%';
        bar.classList.remove('complete');
    });
    previewPanel.classList.add('hidden');
    uploadedFiles = [];
    updateFilesDisplay();
}

function setupEventListeners() {
    // Set up global event listeners
    console.log('Setting up event listeners...');
    
    // Network status listeners
    window.addEventListener('online', () => {
        checkServerStatus();
        showSuccess('Network connection restored');
    });
    
    window.addEventListener('offline', () => {
        updateApiStatus('offline');
        showError('Network connection lost');
    });
    
    // Window resize listener for responsive layout
    window.addEventListener('resize', adjustLayoutForScreenSize);
}

// Show success toast
function showSuccess(message, duration = CONFIG.SUCCESS_TOAST_DURATION) {
    const toast = document.createElement('div');
    toast.className = 'toast success-toast';
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Adjust layout based on screen size
function adjustLayoutForScreenSize() {
    const isMobile = window.innerWidth < 768;
    document.body.classList.toggle('mobile-view', isMobile);
    
    // Adjust elements for mobile view
    if (isMobile) {
        // Mobile-specific adjustments
    } else {
        // Desktop-specific adjustments
    }
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showError('An unexpected error occurred. Please try again.');
});

// Global unhandled rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showError('An unexpected error occurred. Please try again.');
});

// Initial layout adjustment
adjustLayoutForScreenSize();