// Dark mode functionality with smooth transitions
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Function to update theme and animate transition
function updateTheme(isDark) {
    // Update body class
    body.classList.toggle('dark', isDark);
    
    // Store preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    // Animate theme transition
    const elements = document.querySelectorAll('[class*="-light"], [class*="-dark"]');
    elements.forEach(element => {
        element.style.transition = 'background-color var(--transition-normal), color var(--transition-normal), border-color var(--transition-normal)';
    });
}

// Check system preference
function getSystemThemePreference() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Initialize theme
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = getSystemThemePreference();
    const isDark = savedTheme ? savedTheme === 'dark' : systemTheme === 'dark';
    updateTheme(isDark);
}

// Theme toggle event listener with animation
themeToggle.addEventListener('click', () => {
    const isDark = !body.classList.contains('dark');
    
    // Add click animation
    themeToggle.style.transform = 'scale(0.95)';
    setTimeout(() => {
        themeToggle.style.transform = 'scale(1)';
    }, 100);

    updateTheme(isDark);
});

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        updateTheme(e.matches);
    }
});

// Initialize theme on page load
initializeTheme();