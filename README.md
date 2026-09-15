# Society Vehicle Manager - Complete Backend

🏢 Real Production-Ready Society Vehicle Management System

## Features

✅ **Authentication & Authorization**
- User registration with admin approval workflow
- JWT-based authentication
- Role-based access control (Admin, Guard, User)

✅ **Vehicle Management**
- Add, edit, delete vehicles
- Track by tower, floor, flat
- Duplicate detection
- Parking assignment

✅ **Alert System**
- Real-time alerts when vehicle found in wrong tower
- WebSocket integration for instant notifications
- Alert resolution tracking

✅ **Duty Management**
- Track guard duty schedules
- Tower slot management (2 guards per tower max)
- Attendance records

✅ **Admin Panel**
- Approve/reject new guards
- Dashboard with statistics
- Manage all users and vehicles

## Setup Instructions

### Prerequisites
- Node.js v14+
- PostgreSQL 12+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/gankesh437-ops/society-vehicle-mgr.git
cd society-vehicle-mgr
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=society_vehicle_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_key
PORT=5000
```

5. Create database
```bash
createdb society_vehicle_db
```

6. Run migrations
```bash
npm run migrate
```

7. Seed sample data
```bash
npm run seed
```

8. Start the server
```bash
npm run dev
```

Server will run on `http://localhost:5000`

## API Documentation

### Authentication

**Register**
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Guard",
  "email": "john@guard.com",
  "password": "secure123",
  "mobile": "9876543210"
}
```

**Login**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@guard.com",
  "password": "secure123"
}

Response:
{
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "name": "John Guard",
    "role": "user",
    "tower": "A"
  }
}
```

### Vehicles

**Get All Vehicles**
```
GET /api/vehicles?tower=A&floor=1
Authorization: Bearer <token>
```

**Add Vehicle**
```
POST /api/vehicles
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicle_number": "RJ11AB1234",
  "tower": "A",
  "floor": "1",
  "flat": "0101",
  "vehicle_type": "car",
  "parking_number": "P-01"
}
```

**Update Vehicle**
```
PUT /api/vehicles/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Delete Vehicle**
```
DELETE /api/vehicles/:id
Authorization: Bearer <token>
```

### Alerts

**Send Alert**
```
POST /api/alerts/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicle_number": "RJ11AB1234",
  "registered_tower": "A",
  "found_tower": "B",
  "message": "Found in visitor parking"
}
```

**Get Alerts**
```
GET /api/alerts?status=open
Authorization: Bearer <token>
```

**Resolve Alert**
```
PUT /api/alerts/:id/resolve
Authorization: Bearer <token>
```

### Duty Management

**Start Duty**
```
POST /api/duty/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "tower": "A"
}
```

**End Duty**
```
POST /api/duty/end
Authorization: Bearer <token>
```

**Get Attendance**
```
GET /api/duty/attendance/:guardId
Authorization: Bearer <token>
```

### Admin

**Get Dashboard Stats**
```
GET /api/admin/stats
Authorization: Bearer <token>
```

**Get Pending Approvals**
```
GET /api/admin/pending
Authorization: Bearer <token>
```

**Approve User**
```
POST /api/users/:id/approve
Authorization: Bearer <token>
```

## Database Schema

### users
- id (UUID)
- name, email, password
- role (user, admin, super_admin)
- tower, on_duty, duty_since
- approval_status (pending, approved, rejected)

### vehicles
- id (UUID)
- vehicle_number (unique)
- tower, floor, flat
- vehicle_type, parking_number
- owner_name, owner_mobile

### vehicle_alerts
- id (UUID)
- vehicle_id, vehicle_number
- registered_tower, found_tower
- message, reporter_id
- status (open, resolved)

### duty_sessions
- id (UUID)
- guard_id, tower
- start_time, end_time

## Real-Time Features

Using Socket.IO for real-time updates:

```javascript
// Client-side
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected');
  socket.emit('join-tower', 'A');
});

socket.on('vehicle-changed', (data) => {
  console.log('Vehicle updated:', data);
});

socket.on('new-alert', (alert) => {
  console.log('Alert received:', alert);
});
```

## Deployment

### Docker

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Variables (Production)

```env
NODE_ENV=production
DB_HOST=your_prod_db_host
DB_USER=prod_user
DB_PASSWORD=very_secure_password
JWT_SECRET=production_secret_key
JWT_EXPIRE=7d
FRONTEND_URL=https://yourdomain.com
```

## Sample Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@society.com | admin123 |
| Guard | rajesh@guard.com | guard123 |
| Guard | priya@guard.com | guard123 |

## Testing

```bash
# Quick API test with curl
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@society.com","password":"admin123"}'
```

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check DB credentials in `.env`
- Verify database exists: `psql -U postgres -l`

### Port Already in Use
- Change PORT in `.env`
- Or kill process: `lsof -ti:5000 | xargs kill -9`

### Migration Issues
- Run: `npm run migrate`
- Check database schema: `psql -U postgres -d society_vehicle_db`

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use in your projects

## Support

For issues and questions, create an issue in the GitHub repository.

---

**Made with ❤️ for better society management**
