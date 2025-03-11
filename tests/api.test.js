/**
 * Backend API tests for Meme Generator App
 */

const request = require('supertest');
const express = require('express');
const serverless = require('serverless-http');

// Mock API
jest.mock('node-fetch', () => {
  return jest.fn().mockImplementation(() => 
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        // Mock Unsplash response
        results: [
          {
            id: 'test-image-id',
            urls: {
              regular: 'https://example.com/image.jpg',
              thumb: 'https://example.com/thumb.jpg'
            },
            alt_description: 'test image',
            user: {
              name: 'Test User',
              links: {
                html: 'https://example.com/user'
              }
            }
          }
        ]
      })
    })
  );
});

// Mock env
process.env.UNSPLASH_API_KEY = 'mock-unsplash-key';

// Import handler
const { handler } = require('../netlify/functions/api');

// Test app setup
const createTestApp = () => {
  const app = express();
  app.use('/.netlify/functions/api', (req, res, next) => {
    handler(req, { 
      clientContext: {},
      awsRequestId: '123'
    }, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Server Error');
        return;
      }
      
      const { statusCode, headers, body } = result;
      res.status(statusCode).set(headers).send(body);
    });
  });
  return app;
};

describe('Meme Generator API', () => {
  let app;
  
  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });
  
  describe('GET /search-images', () => {
    test('should return 400 if query parameter is missing', async () => {
      const response = await request(app)
        .get('/.netlify/functions/api/search-images');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });
    
    test('should return images when valid query is provided', async () => {
      const response = await request(app)
        .get('/.netlify/functions/api/search-images?query=nature');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('images');
      expect(Array.isArray(response.body.images)).toBe(true);
      
      // Check image structure
      const image = response.body.images[0];
      expect(image).toHaveProperty('id');
      expect(image).toHaveProperty('url');
      expect(image).toHaveProperty('thumb');
      expect(image).toHaveProperty('alt');
      expect(image).toHaveProperty('photographer');
      expect(image).toHaveProperty('photographerUrl');
    });
  });
  
  describe('Error handling', () => {
    test('should handle API errors gracefully', async () => {
      // Force error
      require('node-fetch').mockImplementationOnce(() => {
        throw new Error('Network error');
      });
      
      const response = await request(app)
        .get('/.netlify/functions/api/search-images?query=nature');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
    
    test('should handle invalid API responses gracefully', async () => {
      // Mock error response
      require('node-fetch').mockImplementationOnce(() => Promise.resolve({
        ok: false,
        json: () => Promise.resolve({
          errors: ['Invalid API key']
        })
      }));
      
      const response = await request(app)
        .get('/.netlify/functions/api/search-images?query=nature');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 