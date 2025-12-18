const express = require("express");
const app = express();
const port = 3000;

// middleware to parse json bodies
app.use(express.json());

// in-memory storage for URLs
const urlMap = new Map();

function generateShortUrl() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let shortUrl = '';
    for (let i = 0; i < 6; i++) {
        shortUrl += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return shortUrl;
}

// POST endpoint to shorten a URL
app.post("/api/urls/shorten", (req, res) => {
    const { longUrl } = req.body;

    if (!longUrl) {
        return res.status(400).json({ error: "Long URL is required" });
    }

    // generate a unique short URL
    let shortUrl;
    do {
        shortUrl = generateShortUrl();
    } while (urlMap.has(shortUrl));

    // store the mapping
    urlMap.set(shortUrl, longUrl);

    res.json({
        shortUrl,
        longUrl
    });
});

// GET endpoint to redirect to the original URL
app.get("/api/urls/:shortUrl", (req, res) => {
    const { shortUrl } = req.params;
    const longUrl = urlMap.get(shortUrl);

    if (!longUrl) {
        return res.status(404).json({ error: "Short URL not found" });
    }

    res.redirect(longUrl);
});

app.listen(port, () => {
    console.log(`URL shortener service running at http://localhost:${port}`);
});

setInterval(() => {
    console.log("every second flush at", new Date().toISOString());
    // flush logic
}, 1000);

// to test - in terminal:
// POST (shorten a URL)
// curl -X POST http://localhost:3000/api/urls/shorten \
//   -H "Content-Type: application/json" \
//   -d '{"longUrl":"https://www.google.com"}'

// GET (redirect)
// curl -v http://localhost:3000/api/urls/9pRN6v 
// (replace string with what was generated from POST)

// to demonstrate successful redirect in browser:
// http://localhost:3000/api/urls/9pRN6v
// (replace string with what was generated from POST)
