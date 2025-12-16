const { body, param, validationResult } = require('express-validator');

/**
 * Validation middleware factory
 */
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  };
};

/**
 * Validation rules
 */
const validations = {
  createTasks: [
    body('variants')
      .isArray({ min: 1 })
      .withMessage('Variants must be a non-empty array'),
    body('variants.*.format')
      .isIn(['V1', 'V2'])
      .withMessage('Format must be V1 or V2'),
    body('variants.*.profile')
      .isIn(['P1', 'P2', 'P3'])
      .withMessage('Profile must be P1, P2, or P3')
  ],
  
  videoId: [
    param('videoId')
      .isMongoId()
      .withMessage('Invalid video ID')
  ],
  
  taskId: [
    param('taskId')
      .isMongoId()
      .withMessage('Invalid task ID')
  ]
};

module.exports = { validate, validations };