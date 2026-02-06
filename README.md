# Job Portal - Job Seeker Registration

A modern job portal application with secure email OTP verification for job seeker registration.

## Features

- ✅ Email OTP verification for secure registration
- ✅ Clean and modern UI with Tailwind CSS
- ✅ Step-by-step registration flow
- ✅ Password validation and confirmation
- ✅ MongoDB database integration
- ✅ RESTful API architecture

## Tech Stack

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Nodemailer for email service

### Frontend
- React
- Tailwind CSS
- Fetch API for HTTP requests

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB
- Gmail account (for sending OTP emails)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
PORT=5000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES=1d
JWT_REFRESH_SECRET=your_refresh_secret

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

**Important:** For Gmail, you need to:
- Enable 2-factor authentication
- Generate an App Password (not your regular Gmail password)
- Use the App Password in `EMAIL_PASSWORD`

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Usage

### Job Seeker Registration Flow

1. **Enter Email**: User enters their email address
2. **Send OTP**: Click "Send OTP" button to receive a 5-digit OTP via email
3. **Verify OTP**: Enter the OTP received in email (valid for 10 minutes)
4. **Complete Registration**: After OTP verification, fill in:
   - Full Name
   - Password (minimum 6 characters)
   - Confirm Password
   - Mobile Number
   - Address
   - Gender
5. **Submit**: Click "Register" to complete registration

## API Endpoints

### Job Seeker Authentication

- **POST** `/api/jobseeker/send-otp`
  - Send OTP to email
  - Body: `{ "email": "user@example.com" }`

- **POST** `/api/jobseeker/verify-otp`
  - Verify OTP
  - Body: `{ "email": "user@example.com", "otp": "12345" }`

- **POST** `/api/jobseeker/register`
  - Complete registration
  - Body: `{ "name", "email", "password", "mobileNumber", "address", "gender" }`

## Project Structure

```
JOB PORTAL/
├── backend/
│   ├── models/
│   │   └── JobSeeker.js
│   ├── routes/
│   │   └── jobSeekerAuth.js
│   ├── utils/
│   │   └── mail.js
│   ├── server.js
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Register.js
    │   ├── App.js
    │   └── index.css
    ├── tailwind.config.js
    └── package.json
```

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- OTP expiration (10 minutes)
- Email verification required before registration
- Duplicate email prevention
- Input validation on both frontend and backend

## Next Steps

- [ ] Implement login functionality
- [ ] Add employer registration
- [ ] Create job posting features
- [ ] Build job search and application system
- [ ] Add user dashboard

## Troubleshooting

### Email not sending
- Verify Gmail credentials in `.env`
- Ensure you're using an App Password, not your regular password
- Check if 2-factor authentication is enabled

### MongoDB connection error
- Verify MongoDB connection string
- Check network access settings in MongoDB Atlas
- Ensure IP address is whitelisted

### CORS errors
- Verify backend is running on port 5000
- Check CORS configuration in `server.js`
- Ensure frontend proxy is set correctly

## License

ISC
