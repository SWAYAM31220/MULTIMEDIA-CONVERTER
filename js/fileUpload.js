// File upload handling with preview and animations
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const filesContainer = document.getElementById('filesContainer');
const uploadBtn = document.querySelector('.upload-btn');
const conversionType = document.getElementById('conversionType');
const convertBtn = document.getElementById('convertBtn');
const qualitySlider = document.querySelector('.quality-slider');
const compressionLevel = document.getElementById('compressionLevel');
const outputFormat = document.getElementById('outputFormat');
const formatOptions = document.querySelector('.format-options');
const compressionOptions = document.querySelector('.compression-level');
const previewPanel = document.querySelector('.preview-panel');
const uploadProgress = document.querySelector('.upload-progress');

// Use configuration from config.js
const MAX_FILE_SIZE = CONFIG.UPLOAD.MAX_FILE_SIZE;
const ACCEPTED_TYPES = CONFIG.UPLOAD.ACCEPTED_TYPES;

// Output format options by conversion type
const OUTPUT_FORMATS = {
    image: [
        { value: 'jpg', label: 'JPEG (.jpg)' },
        { value: 'png', label: 'PNG (.png)' },
        { value: 'webp', label: 'WebP (.webp)' },
        { value: 'gif', label: 'GIF (.gif)' }
    ],
    pdf: [
        { value: 'pdf', label: 'PDF (.pdf)' }
    ],
    audio: [
        { value: 'mp3', label: 'MP3 (.mp3)' },
        { value: 'wav', label: 'WAV (.wav)' },
        { value: 'ogg', label: 'OGG (.ogg)' }
    ],
    video: [
        { value: 'mp4', label: 'MP4 (.mp4)' },
        { value: 'webm', label: 'WebM (.webm)' }
    ],
    compress: [
        { value: 'zip', label: 'ZIP Archive (.zip)' },
        { value: 'tar', label: 'TAR Archive (.tar)' }
    ]
};

// Store uploaded files and their previews
let uploadedFiles = [];

// Handle file selection with validation and preview
async function handleFiles(files) {
    const validFiles = Array.from(files).filter(file => {
        if (file.size > MAX_FILE_SIZE) {
            showError(`${file.name} is too large. Maximum size is 100MB`);
            return false;
        }
        return true;
    });

    uploadedFiles = validFiles;
    filesContainer.parentElement.classList.remove('hidden');
    await updateFilesDisplay();
    updateConversionOptions();
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    dropZone.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Update files display with previews
async function updateFilesDisplay() {
    const filesGrid = filesContainer.querySelector('.files-grid');
    filesGrid.innerHTML = '';
    
    for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const fileCard = document.createElement('div');
        fileCard.className = 'file-card';
        
        // Create preview based on file type
        let previewHTML = '';
        if (file.type.startsWith('image/')) {
            const imageUrl = URL.createObjectURL(file);
            previewHTML = `<img src="${imageUrl}" alt="${file.name}" class="file-preview">`;
        } else if (file.type === 'application/pdf') {
            previewHTML = `<i class="fas fa-file-pdf file-icon"></i>`;
        } else if (file.type.startsWith('video/')) {
            previewHTML = `<i class="fas fa-file-video file-icon"></i>`;
        } else if (file.type.startsWith('audio/')) {
            previewHTML = `<i class="fas fa-file-audio file-icon"></i>`;
        } else {
            previewHTML = `<i class="fas fa-file file-icon"></i>`;
        }

        fileCard.innerHTML = `
            <div class="file-preview-container">${previewHTML}</div>
            <div class="file-info">
                <div class="file-name" title="${file.name}">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
                <div class="file-progress hidden">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                    <span class="progress-text">0%</span>
                </div>
            </div>
            <button class="file-remove" onclick="removeFile(${i})">
                <i class="fas fa-times"></i>
            </button>
        `;

        filesGrid.appendChild(fileCard);
        
        // Add hover animation
        fileCard.addEventListener('mouseenter', () => {
            fileCard.style.transform = 'translateY(-4px)';
        });
        
        fileCard.addEventListener('mouseleave', () => {
            fileCard.style.transform = 'translateY(0)';
        });
    }

    // Show/hide containers based on file count
    if (uploadedFiles.length > 0) {
        document.querySelector('.conversion-panel').classList.remove('hidden');
    } else {
        document.querySelector('.conversion-panel').classList.add('hidden');
        filesContainer.parentElement.classList.add('hidden');
    }
}

// Remove file from list
function removeFile(index) {
    uploadedFiles.splice(index, 1);
    updateFilesDisplay();
    updateConversionOptions();
}

// Update conversion options based on uploaded files
function updateConversionOptions() {
    convertBtn.disabled = uploadedFiles.length === 0 || !conversionType.value;
    
    if (uploadedFiles.length > 0) {
        const fileTypes = uploadedFiles.map(file => file.type);
        
        // Enable relevant conversion options
        Array.from(conversionType.options).forEach(option => {
            if (option.value === '') return;
            
            const isValid = fileTypes.some(type => {
                // Check if this file type is accepted for this conversion option
                for (const acceptedType of Object.values(ACCEPTED_TYPES)) {
                    if (acceptedType.includes(type)) {
                        return true;
                    }
                }
                return false;
            });
            
            option.disabled = !isValid;
            if (option.disabled) {
                option.style.display = 'none';
            } else {
                option.style.display = '';
            }
        });

        // Update UI based on selected conversion type
        updateConversionUI();
    }
}

// Update UI based on conversion type
function updateConversionUI() {
    // Hide all option groups first
    qualitySlider.classList.add('hidden');
    compressionOptions.classList.add('hidden');
    formatOptions.classList.add('hidden');
    
    // Show relevant options based on conversion type
    if (!conversionType.value) return;
    
    // Update output format options
    if (OUTPUT_FORMATS[conversionType.value]) {
        // Clear existing options
        outputFormat.innerHTML = '';
        
        // Add new options
        OUTPUT_FORMATS[conversionType.value].forEach(format => {
            const option = document.createElement('option');
            option.value = format.value;
            option.textContent = format.label;
            outputFormat.appendChild(option);
        });
        
        // Show format options
        formatOptions.classList.remove('hidden');
    }
    
    // Show quality slider for image and video conversions
    if (conversionType.value === 'image' || conversionType.value === 'video') {
        qualitySlider.classList.remove('hidden');
    }
    
    // Show compression level for compress option
    if (conversionType.value === 'compress') {
        compressionOptions.classList.remove('hidden');
    }

}

// Drag and drop handlers with animations
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
    dropZone.querySelector('.upload-content').style.transform = 'scale(1.02)';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
    dropZone.querySelector('.upload-content').style.transform = 'scale(1)';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    dropZone.querySelector('.upload-content').style.transform = 'scale(1)';
    handleFiles(e.dataTransfer.files);
});

// File input change handler with progress animation
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
    simulateUploadProgress();
});

// Upload button click handler with animation
uploadBtn.addEventListener('click', () => {
    uploadBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        uploadBtn.style.transform = 'scale(1)';
        fileInput.click();
    }, 100);
});

// Conversion type change handler
conversionType.addEventListener('change', () => {
    updateConversionUI();
    convertBtn.disabled = !conversionType.value;
});

// Quality slider change handler
if (qualitySlider) {
    const qualityValue = document.querySelector('.quality-value');
    document.getElementById('quality').addEventListener('input', (e) => {
        qualityValue.textContent = `${e.target.value}%`;
    });
}

// Simulate upload progress
function simulateUploadProgress() {
    uploadProgress.classList.remove('hidden');
    const progressFill = uploadProgress.querySelector('.progress-fill');
    const progressText = uploadProgress.querySelector('.progress-text');
    let progress = 0;

    const interval = setInterval(() => {
        progress += 5;
        if (progress <= 100) {
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `Uploading... ${progress}%`;
        } else {
            clearInterval(interval);
            setTimeout(() => {
                uploadProgress.classList.add('hidden');
                progressFill.style.width = '0%';
                progressText.textContent = 'Uploading... 0%';
            }, 500);
        }
    }, 100);
}

// Conversion type change handler
conversionType.addEventListener('change', () => {
    updateConversionOptions();
});