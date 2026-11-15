const express = require('express');
const upload = require('../multerConfig');
const Expense = require('../models/Expense');
const extractTextFromImage = require('../ocrHelper');
const parseReceiptText = require('../parseReceipt');

const router = express.Router();

function parseDate(dateString) {
  if (!dateString) return new Date();

  const parts = dateString.split(/[\/\-]/).map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return new Date();

  let day = parts[0];
  let month = parts[1];
  let year = parts[2];

  if (year < 100) year += 2000;
  if (month > 12 && day <= 12) {
    const temp = day;
    day = month;
    month = temp;
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) return new Date();

  const result = new Date(year, month - 1, day);
  return isNaN(result.getTime()) ? new Date() : result;
}

router.post('/upload', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const extractedText = await extractTextFromImage(req.file.path);
    const parsedData = parseReceiptText(extractedText);

    const newExpense = new Expense({
      userId: req.body.userId,
      amount: parsedData.amount,
      merchant: parsedData.merchant,
      date: parseDate(parsedData.date),
      receiptImage: req.file.path
    });

    await newExpense.save();

    res.json({
      message: 'Expense saved successfully',
      expense: newExpense,
      extractedText: extractedText
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all expenses for a user
router.get('/all/:userId', async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;