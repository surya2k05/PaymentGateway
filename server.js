const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path');
const app = express();
const port = 3200;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define Merchant Key and Salt
const MERCHANT_KEY = 'jt3gkm';
const MERCHANT_SALT = 'yPiPnPzBQjEG3MSk22nDPbZTBZpFMBBK';

// Generate SHA-512 hash
const generateHash = (key, txnid, amount, productinfo, firstname, email) => {
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${MERCHANT_SALT}`;
    console.log('Hash String:', hashString);  // Log the string used for hash generation
    return crypto.createHash('sha512').update(hashString).digest('hex');
};

// Generate unique txnid
const generateUniqueTxnid = () => {
    return 'txn_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
};

// API to generate hash and txnid
app.post('/generate-hash', (req, res) => {
    const { amount, productinfo, firstname, email } = req.body;
    const txnid = generateUniqueTxnid(); // Generate unique txnid

    const hash = generateHash(MERCHANT_KEY, txnid, amount, productinfo, firstname, email);
    console.log('Generated Hash:', hash);  // Log the generated hash

    res.json({ hash, txnid });
});

// Handle payment form submission
app.post('/payment', (req, res) => {
    const { txnid, amount, productinfo, firstname, email, hash } = req.body;

    // Validate hash
    const validHash = generateHash(MERCHANT_KEY, txnid, amount, productinfo, firstname, email);
    console.log('Valid Hash:', validHash);  // Log the valid hash
    console.log('Submitted Hash:', hash);  // Log the submitted hash

    if (hash === validHash) {
        // Redirect to success page
        res.redirect('/success');
    } else {
        // Handle hash mismatch
        console.error("Hash mismatch: Expected", validHash, "Received", hash);
        res.redirect('/failure');
    }
});

// Serve the HTML file at the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Success and Failure routes
app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'success.html'));
});

app.get('/failure', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'failure.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
