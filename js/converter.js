// File conversion handling
// Using the CONFIG from config.js for API endpoints

// DOM Elements
const successOverlay = document.querySelector('.success-overlay');
const downloadBtn = document.querySelector('.download-btn');
const previewPanel = document.querySelector('.preview-panel');

// Initialize confetti
const confettiConfig = {
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
};

// Convert files function
async function convertFiles() {
    if (uploadedFiles.length === 0 || !conversionType.value) return;

    const formData = new FormData();
    uploadedFiles.forEach(file => {
        formData.append('files', file);
    });
    formData.append('conversionType', conversionType.value);
    formData.append('quality', qualitySlider.value);

    // Reset UI state
    resetProgress();
    previewPanel.classList.add('hidden');
    successOverlay.classList.add('hidden');

    // Setup progress tracking
    const progressTracker = setupProgressTracking();

    try {
        convertBtn.disabled = true;
        convertBtn.textContent = 'Converting...';

        // Use the API URL from config
        const response = await fetch(CONFIG.API.getEndpoint('CONVERT'), {
            method: 'POST',
            body: formData,
            // Add upload progress tracking
            onUploadProgress: progressEvent => {
                const percentComplete = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                updateUploadProgress(percentComplete);
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Handle different response types
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            // Handle JSON response (e.g., for individual file conversions)
            const data = await response.json();
            handleConversionSuccess(data);
        } else {
            // Handle blob response (e.g., for zip downloads)
            const blob = await response.blob();
            downloadConvertedFiles(blob);
        }
    } catch (error) {
        console.error('Conversion error:', error);
        showError('File conversion failed. Please try again.');
    } finally {
        convertBtn.disabled = false;
        convertBtn.textContent = 'Convert Files';
    }
}

// Handle successful conversion
function handleConversionSuccess(data) {
    if (data.urls && data.urls.length > 0) {
        // Show success overlay with confetti
        successOverlay.classList.remove('hidden');
        confetti(confettiConfig);

        // Store URLs for download button
        downloadBtn.onclick = () => {
            if (data.urls.length === 1) {
                window.location.href = data.urls[0];
            } else {
                downloadZipFile(data.urls);
            }
        };

        // Update preview panel
        updatePreviewPanel(data);
    } else {
        showError('No converted files received.');
    }
}

// Download converted files
function downloadConvertedFiles(blob) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted_files.zip';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Download zip file
async function downloadZipFile(urls) {
    try {
        const response = await fetch(CONFIG.API.getEndpoint('DOWNLOAD_ZIP'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ urls })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        downloadConvertedFiles(blob);
    } catch (error) {
        console.error('Zip download error:', error);
        showError('Failed to download converted files.');
    }
}

// Show error message
function showError(message) {
    const errorToast = document.createElement('div');
    errorToast.className = 'error-toast';
    errorToast.textContent = message;
    document.body.appendChild(errorToast);

    // Animate in
    setTimeout(() => errorToast.classList.add('show'), 100);

    // Remove after 3 seconds
    setTimeout(() => {
        errorToast.classList.remove('show');
        setTimeout(() => document.body.removeChild(errorToast), 300);
    }, 3000);
}

// Reset progress bars
function resetProgress() {
    document.querySelectorAll('.progress-bar').forEach(bar => {
        bar.style.width = '0%';
        bar.classList.remove('complete');
    });
}

// Setup progress tracking with polling or WebSocket
function setupProgressTracking() {
    // Create a unique session ID for this conversion
    const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    let pollInterval;
    
    // Start polling for progress updates
    const startPolling = () => {
        pollInterval = setInterval(async () => {
            try {
                // In a real implementation, this would call an API endpoint
                // For now, we'll simulate progress
                simulateConversionProgress();
            } catch (error) {
                console.error('Error fetching progress:', error);
            }
        }, CONFIG.UI.PROGRESS_UPDATE_INTERVAL);
    };
    
    // Stop polling
    const stopPolling = () => {
        if (pollInterval) {
            clearInterval(pollInterval);
        }
    };
    
    // Start the polling
    startPolling();
    
    return {
        sessionId,
        stopTracking: stopPolling
    };
}

// Update upload progress (initial phase)
function updateUploadProgress(progress) {
    // Update all files with the same upload progress
    uploadedFiles.forEach((_, index) => {
        updateProgress(index, progress / 2); // Upload is first half of process
    });
}

// Simulate conversion progress after upload completes
function simulateConversionProgress() {
    uploadedFiles.forEach((_, index) => {
        const fileCard = document.querySelector(`.file-card:nth-child(${index + 1})`);
        if (!fileCard) return;
        
        const progressBar = fileCard.querySelector('.progress-bar');
        const progressText = fileCard.querySelector('.progress-text');
        
        if (progressBar && progressText) {
            // Get current progress
            const currentWidth = parseInt(progressBar.style.width) || 0;
            
            // If already complete, skip
            if (currentWidth >= 100) return;
            
            // If in upload phase (0-50%), skip - handled by upload progress
            if (currentWidth < 50) return;
            
            // Calculate new progress (conversion phase 50-100%)
            // Add a random increment to simulate varying conversion speeds
            const increment = Math.random() * 5 + 1;
            const newProgress = Math.min(currentWidth + increment, 100);
            
            // Update the progress
            updateProgress(index, newProgress);
        }
    });
}

// Update file progress
function updateProgress(fileIndex, progress) {
    const fileCard = document.querySelector(`.file-card:nth-child(${fileIndex + 1})`);
    if (!fileCard) return;

    const progressBar = fileCard.querySelector('.progress-bar');
    const progressText = fileCard.querySelector('.progress-text');

    if (progressBar && progressText) {
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;

        if (progress >= 100) {
            progressBar.classList.add('complete');
            progressText.textContent = 'Complete!';
            
            // Add a small animation to indicate completion
            fileCard.classList.add('conversion-complete');
        }
    }
}

// Update preview panel
function updatePreviewPanel(data) {
    const previewContent = document.querySelector('.preview-content');
    previewContent.innerHTML = '';

    data.urls.forEach((url, index) => {
        const preview = document.createElement('div');
        preview.className = 'preview-item';

        if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            // Image preview
            preview.innerHTML = `<img src="${url}" alt="Converted file ${index + 1}">`;
        } else if (url.match(/\.pdf$/i)) {
            // PDF preview (icon + filename)
            preview.innerHTML = `<i class="fas fa-file-pdf"></i><span>Converted PDF ${index + 1}</span>`;
        } else if (url.match(/\.(mp3|wav|ogg)$/i)) {
            // Audio preview
            preview.innerHTML = `<audio controls src="${url}"></audio>`;
        } else if (url.match(/\.(mp4|webm)$/i)) {
            // Video preview
            preview.innerHTML = `<video controls src="${url}"></video>`;
        } else {
            // Generic file preview
            preview.innerHTML = `<i class="fas fa-file"></i><span>Converted file ${index + 1}</span>`;
        }

        previewContent.appendChild(preview);
    });

    previewPanel.classList.remove('hidden');
}

// Convert button click handler with animation
convertBtn.addEventListener('click', async () => {
    // Add loading animation
    convertBtn.classList.add('loading');
    await convertFiles();
    convertBtn.classList.remove('loading');
});