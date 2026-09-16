const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');

const seedData = async () => {
    try {
        const departments = [
            { name: 'Cardiology', description: 'Heart and cardiovascular diseases' },
            { name: 'Neurology', description: 'Brain and nervous system' },
            { name: 'Pediatrics', description: 'Child health and diseases' },
            { name: 'Orthopedics', description: 'Bones and muscles' },
            { name: 'General Surgery', description: 'Surgical procedures' },
            { name: 'Dermatology', description: 'Skin, hair, and nails' }
        ];

        const deptIds = [];
        for (const dept of departments) {
            const newDept = await prisma.department.create({
                data: dept
            });
            deptIds.push(newDept.id);
            console.log(`Created department: ${dept.name}`);
        }

        const doctors = [
            {
                name: 'Dr Khalid Adam',
                email: 'somtoarinde@gmail.com',
                phone: '08000000001',
                password: 'somtoakth',
                departmentId: deptIds[0],
                specialty: 'Cardiologist',
                consultationFee: 15000,
                role: 'doctor',
                isActive: true,
                workingHours: {},
                slotDurationMinutes: 30
            },
            {
                name: 'Dr Daniels Sam',
                email: 'ehimenaudu@gmail.com',
                phone: '08000000002',
                password: 'ehi5687011',
                departmentId: deptIds[1],
                specialty: 'Neurologist',
                consultationFee: 20000,
                role: 'doctor',
                isActive: true,
                workingHours: {},
                slotDurationMinutes: 30
            }
        ];

        for (const doc of doctors) {
            const passwordHash = await bcrypt.hash(doc.password, 10);
            
            const userData = { ...doc };
            delete userData.password;
            userData.passwordHash = passwordHash;

            const newUser = await prisma.user.create({
                data: userData
            });
            console.log(`Created doctor: ${doc.name}`);
        }

        console.log('Seeding complete.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
