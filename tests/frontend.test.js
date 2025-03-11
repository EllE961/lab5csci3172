/**
 * Frontend tests for Meme Generator App
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Load HTML
const html = fs.readFileSync(path.resolve(__dirname, '../frontend/index.html'), 'utf8');

// Test setup
let dom, window, document;

beforeEach(() => {
  dom = new JSDOM(html, {
    runScripts: 'dangerously',
    resources: 'usable',
    url: 'http://localhost'
  });
  
  window = dom.window;
  document = window.document;
  
  // Mock canvas
  window.HTMLCanvasElement.prototype.getContext = function() {
    return {
      fillText: jest.fn(),
      strokeText: jest.fn(),
      drawImage: jest.fn(),
      getImageData: jest.fn().mockReturnValue({
        data: new Uint8ClampedArray(100)
      }),
      putImageData: jest.fn(),
      measureText: jest.fn().mockReturnValue({ width: 100 })
    };
  };
  
  // Mock fetch
  global.fetch = jest.fn().mockImplementation(() => 
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        images: [
          { 
            id: '123', 
            url: 'https://example.com/image.jpg',
            thumb: 'https://example.com/thumb.jpg',
            alt: 'test image',
            photographer: 'Test User',
            photographerUrl: 'https://example.com/user'
          }
        ]
      })
    })
  );
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('DOM Elements', () => {
  test('Header exists and contains title', () => {
    const header = document.querySelector('header');
    expect(header).not.toBeNull();
    expect(header.textContent).toContain('Meme Generator');
  });
  
  test('Image upload input exists', () => {
    const uploadInput = document.getElementById('image-upload');
    expect(uploadInput).not.toBeNull();
    expect(uploadInput.type).toBe('file');
  });
  
  test('Image search input exists', () => {
    const searchInput = document.getElementById('image-search');
    expect(searchInput).not.toBeNull();
    expect(searchInput.placeholder).toContain('Search for images');
  });
  
  test('Text inputs for top and bottom text exist', () => {
    const topTextInput = document.getElementById('top-text');
    const bottomTextInput = document.getElementById('bottom-text');
    
    expect(topTextInput).not.toBeNull();
    expect(bottomTextInput).not.toBeNull();
  });
  
  test('Font selection exists and has options', () => {
    const fontSelect = document.getElementById('font-select');
    expect(fontSelect).not.toBeNull();
    expect(fontSelect.tagName).toBe('SELECT');
    expect(fontSelect.options.length).toBeGreaterThan(1);
  });
  
  test('Color pickers exist', () => {
    const textColor = document.getElementById('text-color');
    const strokeColor = document.getElementById('stroke-color');
    
    expect(textColor).not.toBeNull();
    expect(strokeColor).not.toBeNull();
    expect(textColor.type).toBe('color');
    expect(strokeColor.type).toBe('color');
  });
  
  test('Effect checkboxes exist', () => {
    const grayscale = document.getElementById('effect-grayscale');
    const invert = document.getElementById('effect-invert');
    const sepia = document.getElementById('effect-sepia');
    
    expect(grayscale).not.toBeNull();
    expect(invert).not.toBeNull();
    expect(sepia).not.toBeNull();
    expect(grayscale.type).toBe('checkbox');
  });
  
  test('Generate and download buttons exist', () => {
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');
    
    expect(generateBtn).not.toBeNull();
    expect(downloadBtn).not.toBeNull();
    expect(generateBtn.textContent).toBe('Generate Meme');
    expect(downloadBtn.textContent).toBe('Download Meme');
  });
  
  test('Canvas element exists', () => {
    const canvas = document.getElementById('meme-canvas');
    expect(canvas).not.toBeNull();
    expect(canvas.tagName).toBe('CANVAS');
  });
});

describe('Accessibility', () => {
  test('Images have alt text', () => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      expect(img.hasAttribute('alt')).toBe(true);
    });
  });
  
  test('Form controls have associated labels', () => {
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
      if (input.id) {
        const label = document.querySelector(`label[for="${input.id}"]`);
        expect(label).not.toBeNull();
      }
    });
  });
  
  test('Interactive elements have aria attributes when needed', () => {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      if (!button.textContent.trim()) {
        expect(button.hasAttribute('aria-label')).toBe(true);
      }
    });
  });
});

describe('Responsive Design', () => {
  test('Viewport meta tag exists', () => {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    expect(viewportMeta).not.toBeNull();
    expect(viewportMeta.getAttribute('content')).toContain('width=device-width');
  });
});

// Note: These tests are basic structural tests
// For more comprehensive testing, we would need to:
// 1. Mock the canvas and image loading functionality more extensively
// 2. Test actual image manipulation and drawing
// 3. Test API interactions with proper mocking
// 4. Test user interactions like clicking buttons and entering text 