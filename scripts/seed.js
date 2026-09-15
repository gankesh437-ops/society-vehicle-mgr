const db = require('../config/database');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');

const seedData = async () => {
  try {
    // Create sample users
    const adminId = uuid.v4();
    const guard1Id = uuid.v4();
    const guard2Id = uuid.v4();

    const adminPassword = await bcrypt.hash('admin123', 10);
    const guardPassword = await bcrypt.hash('guard123', 10);

    await db.query(
      `INSERT INTO users (id, name, email, password, mobile, role, approval_status, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT DO NOTHING`,
      [adminId, 'Admin User', 'admin@society.com', adminPassword, '9999999999', 'admin', 'approved']
    );

    await db.query(
      `INSERT INTO users (id, name, email, password, mobile, role, tower, approval_status, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       ON CONFLICT DO NOTHING`,
      [guard1Id, 'Guard Rajesh', 'rajesh@guard.com', guardPassword, '9876543210', 'user', 'A', 'approved']
    );

    await db.query(
      `INSERT INTO users (id, name, email, password, mobile, role, tower, approval_status, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       ON CONFLICT DO NOTHING`,
      [guard2Id, 'Guard Priya', 'priya@guard.com', guardPassword, '9123456789', 'user', 'B', 'approved']
    );

    // Create sample vehicles
    const vehicles = [
      { tower: 'A', floor: 'Ground', flat: '0001', vehicle_number: 'RJ11AB1234', owner: 'Rajesh Kumar' },
      { tower: 'A', floor: '1', flat: '0101', vehicle_number: 'RJ11CD5678', owner: 'Priya Singh' },
      { tower: 'B', floor: 'Ground', flat: '0001', vehicle_number: 'RJ11EF9012', owner: 'Amit Patel' },
      { tower: 'B', floor: '2', flat: '0201', vehicle_number: 'RJ11GH3456', owner: 'Sneha Sharma' }
    ];

    for (const v of vehicles) {
      await db.query(
        `INSERT INTO vehicles (id, vehicle_number, tower, floor, flat, owner_name, created_by, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT DO NOTHING`,
        [uuid.v4(), v.vehicle_number, v.tower, v.floor, v.flat, v.owner, adminId]
      );
    }

    console.log('✅ Database seeded successfully');
    console.log('\n📝 Sample Credentials:');
    console.log('Admin: admin@society.com / admin123');
    console.log('Guard 1: rajesh@guard.com / guard123');
    console.log('Guard 2: priya@guard.com / guard123');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
