/**
 * Configuration file for the File Converter Hub frontend
 * Contains environment variables and settings
 */

const CONFIG = {
    // API Configuration
    API: {
        // Base URL for API endpoints
        // Change this when deploying to production
        BASE_URL: 'https://file-converter-hub-api.onrender.com/api',
        
        // Fallback to localhost for development
        LOCAL_URL: 'http://localhost:3000/api',
        
        // Set to true to use the production API
        USE_PRODUCTION: false,
        
        // Get the active API URL based on environment setting
        get URL() {
            return this.USE_PRODUCTION ? this.BASE_URL : this.LOCAL_URL;
        },
        
        // API Endpoints
        ENDPOINTS: {
            STATUS: '/status',
            CONVERT: '/convert',
            DOWNLOAD_ZIP: '/download-zip'
        },
        
        // Full endpoint URLs
        getEndpoint(endpoint) {
            return `${this.URL}${this.ENDPOINTS[endpoint]}`;
        }
    },
    
    // Upload Configuration
    UPLOAD: {
        MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
        CHUNK_SIZE: 5 * 1024 * 1024, // 5MB chunks for large file uploads
        ACCEPTED_TYPES: {
            IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
            PDF: ['application/pdf'],
            AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
            VIDEO: ['video/mp4', 'video/webm', 'video/quicktime'],
            ARCHIVE: ['application/zip', 'application/x-rar-compressed']
        }
    },
    
    // UI Configuration
    UI: {
        PROGRESS_UPDATE_INTERVAL: 500, // ms between progress updates
        ERROR_TOAST_DURATION: 3000, // ms to show error toast
        SUCCESS_TOAST_DURATION: 3000 // ms to show success toast
    }
};

// Export the configuration
window.CONFIG = CONFIG;