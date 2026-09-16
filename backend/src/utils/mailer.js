const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendWelcomeEmail = async (email, name, role, rawPassword) => {
    const mailOptions = {
        from: `"HABS Admin" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Welcome to HABS - Your ${role} Account`,
        html: `
            <h3>Hello ${name},</h3>
            <p>Your ${role} account has been created successfully.</p>
            <p><strong>Login Details:</strong></p>
            <ul>
                <li>Email: ${email}</li>
                <li>Temporary Password: <strong>${rawPassword}</strong></li>
            </ul>
            <p>Please log in and change your password as soon as possible.</p>
            <br>
            <p>Regards,<br>HABS Administration</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${email}`);
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
};

const sendAppointmentConfirmation = async (patient, doctor, date, slotTime) => {
    const patientMailOptions = {
        from: `"HABS Appointments" <${process.env.EMAIL_USER}>`,
        to: patient.email,
        subject: `Appointment Confirmed - Dr. ${doctor.name}`,
        html: `
            <h3>Hello ${patient.name},</h3>
            <p>Your appointment with <strong>Dr. ${doctor.name}</strong> has been confirmed.</p>
            <p><strong>Details:</strong></p>
            <ul>
                <li>Date: ${date}</li>
                <li>Time: ${slotTime}</li>
            </ul>
            <p>Please arrive 10 minutes early.</p>
            <br>
            <p>Regards,<br>HABS Administration</p>
        `
    };

    const doctorMailOptions = {
        from: `"HABS Appointments" <${process.env.EMAIL_USER}>`,
        to: doctor.email,
        subject: `New Appointment Booking - ${patient.name}`,
        html: `
            <h3>Hello Dr. ${doctor.name},</h3>
            <p>A new appointment has been booked and confirmed.</p>
            <p><strong>Details:</strong></p>
            <ul>
                <li>Patient: ${patient.name}</li>
                <li>Date: ${date}</li>
                <li>Time: ${slotTime}</li>
            </ul>
            <br>
            <p>Regards,<br>HABS Administration</p>
        `
    };

    try {
        await transporter.sendMail(patientMailOptions);
        await transporter.sendMail(doctorMailOptions);
        console.log(`Appointment confirmation emails sent to ${patient.email} and ${doctor.email}`);
    } catch (error) {
        console.error('Error sending appointment emails:', error);
    }
};

const sendPatientWelcomeEmail = async (email, name) => {
    const mailOptions = {
        from: `"HABS Registration" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Welcome to HABS, ${name}!`,
        html: `
            <h3>Hello ${name},</h3>
            <p>Welcome to the Hospital Appointment Booking System (HABS)!</p>
            <p>Your patient account has been created successfully. You can now log in to view available doctors, book appointments, and manage your health records.</p>
            <br>
            <p>Stay healthy,</p>
            <p><strong>The HABS Team</strong></p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Patient welcome email sent to ${email}`);
    } catch (error) {
        console.error('Error sending patient welcome email:', error);
    }
};

const sendAppointmentCancellation = async (patient, doctor, date, slotTime) => {
    const patientMailOptions = {
        from: `"HABS Appointments" <${process.env.EMAIL_USER}>`,
        to: patient.email,
        subject: `Appointment Cancelled - Dr. ${doctor.name}`,
        html: `
            <h3>Hello ${patient.name},</h3>
            <p>Your appointment with <strong>Dr. ${doctor.name}</strong> on ${date} at ${slotTime} has been cancelled.</p>
            <p>If you have already made a payment, please contact support for a refund or rescheduling.</p>
            <br>
            <p>Regards,<br>HABS Administration</p>
        `
    };

    const doctorMailOptions = {
        from: `"HABS Appointments" <${process.env.EMAIL_USER}>`,
        to: doctor.email,
        subject: `Appointment Cancelled - ${patient.name}`,
        html: `
            <h3>Hello Dr. ${doctor.name},</h3>
            <p>An appointment has been cancelled.</p>
            <p><strong>Details:</strong></p>
            <ul>
                <li>Patient: ${patient.name}</li>
                <li>Date: ${date}</li>
                <li>Time: ${slotTime}</li>
            </ul>
            <br>
            <p>Regards,<br>HABS Administration</p>
        `
    };

    try {
        await transporter.sendMail(patientMailOptions);
        await transporter.sendMail(doctorMailOptions);
        console.log(`Appointment cancellation emails sent to ${patient.email} and ${doctor.email}`);
    } catch (error) {
        console.error('Error sending appointment cancellation emails:', error);
    }
};

module.exports = { sendWelcomeEmail, sendAppointmentConfirmation, sendPatientWelcomeEmail, sendAppointmentCancellation };
