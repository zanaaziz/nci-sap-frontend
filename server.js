const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist/nci-sap-frontend/browser')));

// Handle all routes by serving index.html (for client-side routing)
app.get(/(.*)/, (req, res) => {
	res.sendFile(path.join(__dirname, 'dist/nci-sap-frontend/browser/index.html'));
});

// Use the PORT provided by Heroku or default to 8080 locally
const port = process.env.PORT || 8080;
app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
