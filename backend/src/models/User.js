const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['patient', 'doctor', 'admin', 'system_admin'],
        default: 'patient'
    },
    name: String,
    phone: String,
    dob: String,
    gender: String,
    
    
    emergencyContactName: String,
    emergencyContactPhone: String,
    emergencyContactRelation: String,
    
    
    allergies: String,
    chronicConditions: String,
    currentMedications: String,
    
    
    specialization: String,
    qualifications: [String],
    experienceYears: Number,
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    consultationFee: {
        type: Number
    },
    slotDurationMinutes: {
        type: Number,
        default: 30
    },
    workingHours: mongoose.Schema.Types.Mixed,
    isAvailable: {
        type: Boolean,
        default: true
    },

    
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });


UserSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
    }
});

module.exports = mongoose.model('User', UserSchema);
