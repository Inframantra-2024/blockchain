const express = require('express');
const router = express.Router();
const feeController = require('../controller/feeController');
const {
  createFeeValidator,
  updateFeeValidator,
  feeIdValidator,
  paginationValidator,
} = require('../validations/feevalidation');
const { validateRequest } = require('../middleware/validateIncomingRequest');
const { protect, authorizeRoles } = require('../middleware/routeProtector')

// All routes require admin or superadmin
router.use(protect, authorizeRoles('admin', 'superadmin'));

router.post('/', createFeeValidator, validateRequest, feeController.createFee);
router.get('/', paginationValidator, validateRequest, feeController.getFees);
router.get('/:id', feeIdValidator, validateRequest, feeController.getFeeById);
router.put('/:id', updateFeeValidator, validateRequest, feeController.updateFee);
router.delete('/:id', feeIdValidator, validateRequest, feeController.deleteFee);

module.exports = router;
