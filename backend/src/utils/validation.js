const Joi = require('joi');

const patientSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|`~]).*$/).required().messages({
    'string.pattern.base': 'Password must contain at least one letter, one number, and one special symbol.'
  }),
  dob: Joi.date().iso().required(),
  gender: Joi.string().valid('male', 'female', 'other').required(),
  emergencyContactName: Joi.string().required(),
  emergencyContactPhone: Joi.string().required(),
  emergencyContactRelation: Joi.string().required(),
  allergies: Joi.string().allow('').optional(),
  chronicConditions: Joi.string().allow('').optional(),
  currentMedications: Joi.string().allow('').optional()
});

const doctorSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|`~]).*$/).required().messages({
    'string.pattern.base': 'Password must contain at least one letter, one number, and one special symbol.'
  }), // temporary password provided by admin
  departmentId: Joi.string().required(),
  specialty: Joi.string().required(),
  qualifications: Joi.string().required(),
  experienceYears: Joi.number().min(0).required(),
  bio: Joi.string().allow('').optional(),
  consultationFee: Joi.number().min(0).required(),
  slotDurationMinutes: Joi.number().valid(15, 20, 30, 45, 60).required()
});

const adminSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|`~]).*$/).required().messages({
    'string.pattern.base': 'Password must contain at least one letter, one number, and one special symbol.'
  })
});

const profileUpdateSchema = Joi.object({
  name: Joi.string().optional(),
  phone: Joi.string().optional()
});

const departmentSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow('').optional()
});

const doctorUpdateSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  departmentId: Joi.string().optional(),
  specialty: Joi.string().optional(),
  consultationFee: Joi.number().min(0).optional(),
  slotDurationMinutes: Joi.number().valid(15, 20, 30, 45, 60).optional(),
  isActive: Joi.boolean().optional(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|`~]).*$/).optional().messages({
    'string.pattern.base': 'Password must contain at least one letter, one number, and one special symbol.'
  })
});

const daySchema = Joi.object({
  start: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
  end: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
  active: Joi.boolean().required()
});

const workingHoursSchema = Joi.object({
  workingHours: Joi.object({
    mon: daySchema,
    tue: daySchema,
    wed: daySchema,
    thu: daySchema,
    fri: daySchema,
    sat: daySchema,
    sun: daySchema
  }).required(),
  slotDurationMinutes: Joi.number().valid(15, 20, 30, 45, 60).required()
});

const appointmentBookingSchema = Joi.object({
  doctorId: Joi.string().required(),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  slotTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
  reason: Joi.string().allow('').optional()
});

const paymentSchema = Joi.object({
  paymentMethod: Joi.string().valid('card', 'transfer', 'cash', 'paystack').required(),
  reference: Joi.string().optional() 
});

module.exports = {
  patientSchema,
  doctorSchema,
  adminSchema,
  profileUpdateSchema,
  departmentSchema,
  doctorUpdateSchema,
  workingHoursSchema,
  appointmentBookingSchema,
  paymentSchema
};
