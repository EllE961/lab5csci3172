# Lab 5: Meme Generator App

A web-based meme generator that allows users to upload images, add custom text, and apply effects. This project was created for CSCI 3172 Lab 5.

- _Date Created_: 8 Mar 2025
- _Last Modification Date_: 10 Mar 2025
- _Lab URL_: []
- _GitLab URL_: [https://git.cs.dal.ca/salmi/csci3172/-/tree/main/labs/lab5/](https://git.cs.dal.ca/salmi/csci3172/-/tree/main/labs/lab5/)

## Authors

- **Yahya Al Salmi** ([yh247885@dal.ca](mailto:yh247885@dal.ca)) - Developer

## Built With

- [HTML5](https://developer.mozilla.org/en-US/docs/Web/HTML) - Frontend structure
- [CSS3](https://developer.mozilla.org/en-US/docs/Web/CSS) - Styling and responsive design
- [JavaScript ES6](https://developer.mozilla.org/en-US/docs/Web/JavaScript) - Frontend logic and Canvas API
- [Node.js](https://nodejs.org/) - Backend environment
- [Express.js](https://expressjs.com/) - Backend API framework
- [Netlify Functions](https://www.netlify.com/products/functions/) - Serverless deployment
- [Unsplash API](https://unsplash.com/developers) - Image search integration
- [Jest](https://jestjs.io/) - Testing framework

## Description

This meme generator application allows users to create custom memes by either uploading their own images or searching for images via the Unsplash API. Users can add top and bottom text to their images, customize font style, color, and size, and apply visual effects (grayscale, invert, sepia). The generated memes can be downloaded.

Key features include:

- Image upload and search functionality
- Text customization with multiple Google Fonts
- Visual effects for image processing
- Responsive design for mobile and desktop
- WCAG-compliant accessibility features
- Error handling for API integrations

## Sources Used

### netlify/functions/api.js

_Lines 18-57_

```javascript
router.get("/search-images", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    console.log(
      `Searching Unsplash for: ${query} with key: ${UNSPLASH_API_KEY.substring(
        0,
        5
      )}...`
    );

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query
      )}&per_page=20`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_API_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors || "Error fetching images");
    }

    const images = data.results.map((image) => ({
      id: image.id,
      url: image.urls.regular,
      thumb: image.urls.thumb,
      alt: image.alt_description || "image",
      photographer: image.user.name,
      photographerUrl: image.user.links.html,
    }));

    console.log(`Found ${images.length} images for query: ${query}`);
    res.json({ images });
  } catch (error) {
    console.error("Image search error:", error);
    res.status(500).json({ error: "Failed to fetch images: " + error.message });
  }
});
```

The code above was created by adapting the code in [Unsplash API Documentation](https://unsplash.com/documentation) as shown below:

```javascript
// Example from Unsplash documentation
fetch("https://api.unsplash.com/search/photos?query=minimal", {
  headers: {
    Authorization: "Client-ID YOUR_ACCESS_KEY",
  },
})
  .then((response) => response.json())
  .then((data) => {
    // Handle data
  });
```

- The code from Unsplash documentation was implemented by using their API endpoint and authentication approach.
- Unsplash's code was used because it's the official way to integrate with their image search API.
- Unsplash's code was modified by adding error handling, mapping results to a cleaner format, and using async/await instead of promises.

### frontend/app.js

_Lines 186-223_

```javascript
function applyEffects(imageData) {
  const pixels = imageData.data;

  // Grayscale
  if (effectGrayscale.checked) {
    for (let i = 0; i < pixels.length; i += 4) {
      const avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
      pixels[i] = avg; // R
      pixels[i + 1] = avg; // G
      pixels[i + 2] = avg; // B
    }
  }

  // Invert
  if (effectInvert.checked) {
    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = 255 - pixels[i]; // R
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

      pixels[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189); // R
      pixels[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168); // G
      pixels[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131); // B
    }
  }

  return imageData;
}
```

The code above was created by adapting the code in [MDN Web Docs - Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas) as shown below:

```javascript
// Example from MDN
function grayscale(pixels) {
  var d = pixels.data;
  for (var i = 0; i < d.length; i += 4) {
    var r = d[i];
    var g = d[i + 1];
    var b = d[i + 2];
    // CIE luminance for the RGB
    var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  return pixels;
}
```

- The code from MDN Web Docs was implemented by using their approach to pixel manipulation with the Canvas API.
- MDN's code was used because it demonstrates best practices for image processing in JavaScript.
- MDN's code was modified by implementing multiple effects (grayscale, invert, sepia) and using simpler averaging for grayscale.

## Acknowledgments

- [Unsplash](https://unsplash.com/) for providing their image API
- [Google Fonts](https://fonts.google.com/) for font selection
- [Font Awesome](https://fontawesome.com/) for icons
- [MDN Web Docs](https://developer.mozilla.org/) for Canvas API tutorials
- Special thanks to Dalhousie University for providing a strong foundation in web development best practices.
