const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number
  },
  merchant: {
    type: String
  },
  category: {
    type: String,
    default: 'Uncategorized'
  },
  date: {
    type: Date,
    default: Date.now
  },
  receiptImage: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);