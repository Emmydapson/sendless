import Joi from 'joi';

// Airtime Top-Up Validation
export const validateAirtimeTopUp = (req, res, next) => {
  const schema = Joi.object({
    provider: Joi.string().required().label('Provider'),
    phoneNumber: Joi.string().pattern(/^[0-9]+$/).required().label('Phone Number'),
    amount: Joi.number().positive().required().label('Amount'),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// Data Top-Up Validation
export const validateDataTopUp = (req, res, next) => {
  const schema = Joi.object({
    provider: Joi.string().required().label('Provider'),
    phoneNumber: Joi.string().pattern(/^[0-9]+$/).required().label('Phone Number'),
    dataBundle: Joi.string().required().label('Data Bundle'),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// Cable Subscription Validation
export const validateCableSubscription = (req, res, next) => {
  const schema = Joi.object({
    provider: Joi.string().required().label('Provider'),
    service: Joi.string().required().label('Service'),
    amount: Joi.number().positive().required().label('Amount'),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// Electricity Bill Payment Validation
export const validateElectricityBillPayment = (req, res, next) => {
  const schema = Joi.object({
    provider: Joi.string().required().label('Provider'),
    service: Joi.string().required().label('Service'),
    amount: Joi.number().positive().required().label('Amount'),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// Beneficiary Saving Validation
export const validateSaveBeneficiary = (req, res, next) => {
  const schema = Joi.object({
    provider: Joi.string().required().label('Provider'),
    phoneNumber: Joi.string().pattern(/^[0-9]+$/).optional().label('Phone Number'),
    billType: Joi.string().valid('airtime', 'data', 'cable', 'electricity').required().label('Bill Type'),
    dataBundle: Joi.string().optional().label('Data Bundle'),
    cableService: Joi.string().optional().label('Cable Service'),
    electricityService: Joi.string().optional().label('Electricity Service'),
    amount: Joi.number().positive().optional().label('Amount'),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};
