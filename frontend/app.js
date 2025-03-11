// Meme Generator App JavaScript

// DOM Elements
const imageUploadInput = document.getElementById('image-upload');
const imageSearchInput = document.getElementById('image-search');
const searchBtn = document.getElementById('search-btn');
const searchResults = document.getElementById('search-results');
const topText = document.getElementById('top-text');
const bottomText = document.getElementById('bottom-text');
const fontSelect = document.getElementById('font-select');
const textColor = document.getElementById('text-color');
const strokeColor = document.getElementById('stroke-color');
const textSize = document.getElementById('text-size');
const textSizeValue = document.getElementById('text-size-value');
const effectGrayscale = document.getElementById('effect-grayscale');
const effectInvert = document.getElementById('effect-invert');
const effectSepia = document.getElementById('effect-sepia');
const generateBtn = document.getElementById('generate-btn');
const downloadBtn = document.getElementById('download-btn');
const memeCanvas = document.getElementById('meme-canvas');
const noImageMessage = document.getElementById('no-image-message');
const imageAttribution = document.getElementById('image-attribution');
const loadingSpinner = document.getElementById('loading-spinner');

// Canvas Context
const ctx = memeCanvas.getContext('2d');

// State
let currentImage = null;
let imageSource = null;
let selectedImageData = null;

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
    // Event listeners
    imageUploadInput.addEventListener('change', handleImageUpload);
    searchBtn.addEventListener('click', searchImages);
    imageSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchImages();
    });
    textSize.addEventListener('input', updateTextSizeValue);
    generateBtn.addEventListener('click', generateMeme);
    downloadBtn.addEventListener('click', downloadMeme);
    
    // Keyboard nav
    window.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-user');
        }
    });
    
    window.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-user');
    });
    
    updateTextSizeValue();
}

function updateTextSizeValue() {
    textSizeValue.textContent = `${textSize.value}px`;
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
        imageSource = 'upload';
        selectedImageData = null;
        loadImage(event.target.result);
    };
    
    reader.readAsDataURL(file);
}

async function searchImages() {
    const query = imageSearchInput.value.trim();
    if (!query) {
        searchResults.innerHTML = '<p>Please enter a search term</p>';
        return;
    }
    
    try {
        showLoading(true);
        searchResults.innerHTML = '<p>Searching...</p>';
        
        let response;
        try {
            response = await fetch(`/.netlify/functions/api/search-images?query=${encodeURIComponent(query)}`);
        } catch (networkError) {
            console.error('Network error:', networkError);
            throw new Error(`Network error: ${networkError.message}`);
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API error:', response.status, errorText);
            throw new Error(`API error (${response.status}): ${errorText || 'Unknown error'}`);
        }
        
        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            console.error('JSON error:', jsonError);
            throw new Error(`Error parsing response: ${jsonError.message}`);
        }
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        if (!data.images || data.images.length === 0) {
            searchResults.innerHTML = '<p>No images found. Try a different search term.</p>';
            return;
        }
        
        searchResults.innerHTML = '';
        
        data.images.forEach(image => {
            const imgElement = document.createElement('img');
            imgElement.src = image.thumb;
            imgElement.alt = image.alt;
            imgElement.className = 'search-image';
            imgElement.addEventListener('click', () => {
                document.querySelectorAll('.search-image').forEach(img => {
                    img.classList.remove('selected');
                });
                
                imgElement.classList.add('selected');
                
                imageSource = 'search';
                selectedImageData = image;
                
                loadImage(image.url);
                
                imageAttribution.innerHTML = `Photo by <a href="${image.photographerUrl}" target="_blank" rel="noopener">${image.photographer}</a> on Unsplash`;
            });
            
            imgElement.onerror = () => {
                imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSI+SW1hZ2UgZXJyb3I8L3RleHQ+PC9zdmc+';
                imgElement.alt = 'Image failed to load';
            };
            
            searchResults.appendChild(imgElement);
        });
    } catch (error) {
        console.error('Search error:', error);
        searchResults.innerHTML = `<p>Error: ${error.message || 'Failed to search images'}</p>`;
    } finally {
        showLoading(false);
    }
}

function loadImage(src) {
    showLoading(true);
    
    currentImage = new Image();
    currentImage.crossOrigin = 'anonymous';
    
    currentImage.onload = () => {
        memeCanvas.style.display = 'block';
        noImageMessage.style.display = 'none';
        
        generateBtn.disabled = false;
        generateMeme();
        
        showLoading(false);
    };
    
    currentImage.onerror = () => {
        console.error('Error loading image');
        memeCanvas.style.display = 'none';
        noImageMessage.style.display = 'block';
        noImageMessage.textContent = 'Error loading image. Please try again.';
        showLoading(false);
    };
    
    currentImage.src = src;
}

function applyEffects(imageData) {
    const pixels = imageData.data;
    
    // Grayscale
    if (effectGrayscale.checked) {
        for (let i = 0; i < pixels.length; i += 4) {
            const avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
            pixels[i] = avg;     // R
            pixels[i + 1] = avg; // G
            pixels[i + 2] = avg; // B
        }
    }
    
    // Invert
    if (effectInvert.checked) {
        for (let i = 0; i < pixels.length; i += 4) {
            pixels[i] = 255 - pixels[i];         // R
            pixels[i + 1] = 255 - pixels[i + 1]; // G
            pixels[i + 2] = 255 - pixels[i + 2]; // B
        }
    }
    
    // Sepia
    if (effectSepia.checked) {
        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            
            pixels[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));     // R
            pixels[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168)); // G
            pixels[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131)); // B
        }
    }
    
    return imageData;
}

function generateMeme() {
    if (!currentImage) return;
    
    const fontFamily = fontSelect.value;
    const fontSize = parseInt(textSize.value);
    const color = textColor.value;
    const strokeCol = strokeColor.value;
    
    const maxWidth = 800;
    const maxHeight = 800;
    
    let width = currentImage.width;
    let height = currentImage.height;
    
    if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = height * ratio;
    }
    
    if (height > maxHeight) {
        const ratio = maxHeight / height;
        height = maxHeight;
        width = width * ratio;
    }
    
    memeCanvas.width = width;
    memeCanvas.height = height;
    
    // Draw image
    ctx.drawImage(currentImage, 0, 0, width, height);
    
    // Apply effects
    if (effectGrayscale.checked || effectInvert.checked || effectSepia.checked) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const processedImageData = applyEffects(imageData);
        ctx.putImageData(processedImageData, 0, 0);
    }
    
    // Text style
    ctx.textAlign = 'center';
    ctx.font = `bold ${fontSize}px "${fontFamily}", Impact, sans-serif`;
    ctx.fillStyle = color;
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = fontSize / 15;
    
    // Top text
    const topTextValue = topText.value || '';
    if (topTextValue) {
        drawText(topTextValue, width / 2, fontSize + 10);
    }
    
    // Bottom text
    const bottomTextValue = bottomText.value || '';
    if (bottomTextValue) {
        drawText(bottomTextValue, width / 2, height - fontSize / 2);
    }
    
    downloadBtn.disabled = false;
}

function drawText(text, x, y) {
    const lineHeight = parseInt(textSize.value) * 1.2;
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];
    
    // Break text into lines
    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        
        if (width < memeCanvas.width * 0.9) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    
    // Draw lines
    for (let i = 0; i < lines.length; i++) {
        const lineY = y + (i * lineHeight);
        ctx.strokeText(lines[i], x, lineY);
        ctx.fillText(lines[i], x, lineY);
    }
}

function downloadMeme() {
    const dataURL = memeCanvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = dataURL;
    downloadLink.download = 'meme.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('hidden');
    } else {
        loadingSpinner.classList.add('hidden');
    }
} 