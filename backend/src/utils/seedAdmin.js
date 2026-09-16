const { db } = require('../config/firebase');
const bcrypt = require('bcrypt');

const seedAdmin = async () => {
    try {
        const email = 'habsadmin01@gmail.com';
        const password = 'truebadfrosh';
        const role = 'admin';

        // Check if admin already exists
        const adminRef = db.collection('users').where('email', '==', email);
        const snapshot = await adminRef.get();

        if (!snapshot.empty) {
            console.log('Admin already exists! Deleting old record...');
            const batch = db.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create admin user
        const docRef = await db.collection('users').add({
            email,
            passwordHash: hashedPassword,
            role,
            name: 'System Admin',
            createdAt: new Date().toISOString(),
            isActive: true
        });
        
        await docRef.update({ uid: docRef.id });

        console.log('Admin seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
