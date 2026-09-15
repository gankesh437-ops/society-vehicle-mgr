const db = require('../config/database');

const schema = `
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    mobile VARCHAR(20),
    role VARCHAR(50) DEFAULT 'user',
    tower VARCHAR(10),
    on_duty BOOLEAN DEFAULT false,
    duty_since TIMESTAMP,
    approval_status VARCHAR(50) DEFAULT 'pending',
    photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY,
    vehicle_number VARCHAR(20) UNIQUE NOT NULL,
    tower VARCHAR(10) NOT NULL,
    floor VARCHAR(10) NOT NULL,
    flat VARCHAR(10) NOT NULL,
    vehicle_type VARCHAR(20) DEFAULT 'car',
    parking_number VARCHAR(20),
    notes TEXT,
    owner_name VARCHAR(255),
    owner_mobile VARCHAR(20),
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS vehicle_alerts (
    id UUID PRIMARY KEY,
    vehicle_id UUID,
    vehicle_number VARCHAR(20) NOT NULL,
    registered_tower VARCHAR(10) NOT NULL,
    found_tower VARCHAR(10) NOT NULL,
    message TEXT,
    reporter_id UUID,
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS duty_sessions (
    id UUID PRIMARY KEY,
    guard_id UUID NOT NULL,
    tower VARCHAR(10) NOT NULL,
    start_time TIMESTAMP DEFAULT NOW(),
    end_time TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vehicle_problems (
    id UUID PRIMARY KEY,
    vehicle_number VARCHAR(20),
    tower VARCHAR(10),
    floor VARCHAR(10),
    flat VARCHAR(10),
    reason VARCHAR(255),
    source VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_vehicles_tower ON vehicles(tower);
  CREATE INDEX IF NOT EXISTS idx_vehicles_number ON vehicles(vehicle_number);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_duty_guard ON duty_sessions(guard_id);
  CREATE INDEX IF NOT EXISTS idx_alerts_tower ON vehicle_alerts(registered_tower);
`;

(async () => {
  try {
    await db.query(schema);
    console.log('✅ Database migration completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
})();
