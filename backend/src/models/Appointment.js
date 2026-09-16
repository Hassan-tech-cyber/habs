const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    date: {
        type: String,
        required: true
    },
    slotTime: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending_payment', 'confirmed', 'completed', 'cancelled', 'no_show'],
        default: 'pending_payment'
    },
    type: {
        type: String,
        enum: ['ROUTINE', 'URGENT', 'FOLLOW_UP', 'CONSULTATION'],
        default: 'ROUTINE'
    },
    reason: String,
    symptoms: String,
    notes: String,
    diagnosis: String,
    prescription: String,
    paymentMethod: String,
    paymentReference: String,
    paidAt: Date
}, { timestamps: true });

AppointmentSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
