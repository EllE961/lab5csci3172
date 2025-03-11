const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
// Use node-fetch v2 for CommonJS
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const router = express.Router();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API key
const UNSPLASH_API_KEY = process.env.UNSPLASH_API_KEY;

// Search images endpoint
router.get('/search-images', async (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }
  
  try {
    console.log(`Searching Unsplash for: ${query} with key: ${UNSPLASH_API_KEY.substring(0, 5)}...`);
    
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_API_KEY}`
        }
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.errors || 'Error fetching images');
    }
    
    const images = data.results.map(image => ({
      id: image.id,
      url: image.urls.regular,
      thumb: image.urls.thumb,
      alt: image.alt_description || 'image',
      photographer: image.user.name,
      photographerUrl: image.user.links.html
    }));
    
    console.log(`Found ${images.length} images for query: ${query}`);
    res.json({ images });
  } catch (error) {
    console.error('Image search error:', error);
    res.status(500).json({ error: 'Failed to fetch images: ' + error.message });
  }
});

// Mount router
app.use('/', router);
app.use('/.netlify/functions/api', router);

// Export handler
module.exports.handler = serverless(app);
