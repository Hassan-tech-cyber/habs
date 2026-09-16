const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
require('dotenv').config();

async function seedAdmin() {
    try {
        const email = process.env.EMAIL_USER || 'habsadmin@gmail.com';
        const rawPassword = process.env.EMAIL_PASS || 'truebadfrosh';

        console.log(`Checking if admin exists for email: ${email}...`);

        const existingAdmin = await prisma.user.findUnique({
            where: { email }
        });

        if (existingAdmin) {
            console.log('Admin account already exists. Skipping seed.');
            process.exit(0);
        }

        const passwordHash = await bcrypt.hash(rawPassword, 10);

        const newAdmin = await prisma.user.create({
            data: {
                role: 'admin',
                name: 'System Administrator',
                email: email,
                phone: 'N/A',
                passwordHash: passwordHash
            }
        });

        console.log(`Successfully seeded admin account with ID: ${newAdmin.id}`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin account:', error);
        process.exit(1);
    }
}

seedAdmin();
