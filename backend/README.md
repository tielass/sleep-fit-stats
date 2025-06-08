# Sleep-Fit-Stats Backend

This is the backend API for the Sleep-Fit-Stats application, providing endpoints for tracking sleep and fitness data with Fitbit integration.

## Tech Stack

- **Node.js** with **Express** - API server
- **TypeScript** - Type safety
- **MongoDB** with **Mongoose** - Database and ORM
- **Passport.js** - Authentication with local strategy and Fitbit OAuth2
- **JWT** - Token-based authentication
- **Axios** - HTTP client for Fitbit API integration

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Fitbit Developer Account (for Fitbit API integration)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/sleep-fit-stats.git
cd sleep-fit-stats/backend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

Copy the example .env file and update it with your settings:

```bash
cp .env.example .env
```

Update the values in `.env` with your specific configuration:

```
# MongoDB URI
MONGODB_URI=mongodb://localhost:27017/sleep-fit-stats

# JWT Secret for authentication
JWT_SECRET=your_jwt_secret_key

# Fitbit API credentials
FITBIT_CLIENT_ID=your_fitbit_client_id
FITBIT_CLIENT_SECRET=your_fitbit_client_secret
FITBIT_CALLBACK_URL=http://localhost:3001/api/auth/fitbit/callback

# Frontend URL for redirects
FRONTEND_URL=http://localhost:3000
```

### Development

Run the development server:

```bash
npm run dev
```

The server will start on http://localhost:3001 with automatic reloading on file changes.

### Building for Production

1. Build the TypeScript code:

```bash
npm run build
```

2. Start the production server:

```bash
npm start
```

### Database Seeding

For development and testing, you can seed the database with sample data:

```bash
npm run seed
```

This creates a test user with the following credentials:

- Email: test@example.com
- Password: password123

It also generates 30 days of sample sleep and fitness data.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info
- `GET /api/auth/fitbit` - Initiate Fitbit OAuth flow
- `GET /api/auth/fitbit/callback` - Fitbit OAuth callback

### User

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/preferences` - Update user preferences

### Sleep

- `GET /api/sleep/:userId` - Get sleep entries by date range
- `GET /api/sleep/statistics/:userId` - Get sleep statistics
- `POST /api/sleep` - Create a new sleep entry
- `PUT /api/sleep/:id` - Update a sleep entry
- `DELETE /api/sleep/:id` - Delete a sleep entry

### Fitness

- `GET /api/fitness/activities/:userId` - Get fitness activities
- `GET /api/fitness/summaries/:userId` - Get daily fitness summaries
- `POST /api/fitness/activities` - Create a new fitness activity
- `PUT /api/fitness/activities/:id` - Update a fitness activity
- `DELETE /api/fitness/activities/:id` - Delete a fitness activity

### Fitbit Integration

- `GET /api/fitbit/status` - Check Fitbit connection status
- `POST /api/fitbit/sync/sleep` - Sync sleep data from Fitbit
- `POST /api/fitbit/sync/activity` - Sync activity data from Fitbit
- `POST /api/fitbit/sync/all` - Sync all data from Fitbit
- `DELETE /api/fitbit/disconnect` - Disconnect Fitbit

## Author

Your Name
