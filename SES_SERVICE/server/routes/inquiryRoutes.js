const express = require('express');
const router = express.Router();
const { createInquiry, getInquiries, deleteInquiry, updateStatus } = require('../controllers/inquiryController');

router.post('/', createInquiry);
router.get('/', getInquiries);
router.delete('/:id', deleteInquiry);
router.patch('/:id/status', updateStatus);

module.exports = router;
