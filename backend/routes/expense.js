const express = require('express');
const upload = require('../multerConfig');
const Expense = require('../models/Expense');
const extractTextFromImage = require('../ocrHelper');

const router = express.Router();

router.post('/upload', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const extractedText = await extractTextFromImage(req.file.path);

    res.json({
      message: 'File uploaded and processed successfully',
      filePath: req.file.path,
      extractedText: extractedText
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;