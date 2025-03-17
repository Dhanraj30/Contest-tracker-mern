
# Contest Tracker

**Contest Tracker** is a web application designed for competitive programmers to browse, track, and manage programming contests from platforms like Codeforces, Codechef, and Leetcode. Built with a React frontend and a Node.js backend, the app fetches contest data using the CLIST API, stores it in MongoDB, and provides a user-friendly interface to view upcoming and past contests, bookmark contests, and manage solution links. The app includes a secure authentication system with JWT, theme switching (light, dark, system), and an admin dashboard for managing solution videos.

## Features

- **Browse Contests**: View upcoming and past contests from Codeforces, Codechef, and Leetcode with details like start time, platform, and duration.
- **Platform Filters**: Filter contests by platform to focus on your preferred coding platforms.
- **Bookmark Contests**: Save contests to quickly access them later.
- **Solution Videos**: View YouTube solution videos for past contests and add new solutions (admin-only feature).
- **Theme Switching**: Toggle between light, dark, and system themes for a personalized user experience.
- **Admin Dashboard**: Admins can add, edit, and delete solution links for contests, restricted to users with admin privileges.
- **Responsive Design**: Built with Tailwind CSS for a clean, responsive UI that works on desktop and mobile devices.

## Tech Stack

- **Frontend**: React, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express
- **Database**: MongoDB (using Mongoose)
- **API**: CLIST API for fetching contest data and Youtube api key to fetch vedio solution
- **Other Libraries**: Axios (API requests)

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (local installation or MongoDB Atlas)
- [Git](https://git-scm.com/) (for cloning the repository)

You'll also need an API key from [CLIST](https://clist.by/) to fetch contest data.

## Installation

Follow these steps to set up the project locally:

### 1. Clone the Repository
```bash
git clone https://github.com/dhanraj30/contest-tracker-mern.git

```

### 2. Set Up the Backend
Navigate to the `server` directory and install dependencies:

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory with the following environment variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/contest-tracker
YOUTUBE_API_KEY
```

### 3. Set Up the Frontend
Navigate to the `client` directory and install dependencies:

```bash
cd ../client
npm install
```

### 4. Configure the CLIST API
The backend uses the CLIST API to fetch contest data. You'll need to update the API credentials in `server/controllers/contestController.js`:

```javascript
const response = await axios.get('https://clist.by/api/v4/contest/', {
  params: {
    username: 'your-clist-username', // Replace with your CLIST username
    api_key: 'your-clist-api-key',   // Replace with your CLIST API key
    // ... other params
  },
});
```

To obtain a CLIST API key:
1. Sign up at [CLIST](https://clist.by/).
2. Go to your account settings and generate an API key.
3. Replace the `username` and `api_key` in the code with your credentials.

### 5. Run the Application

#### Start MongoDB
Ensure MongoDB is running on your machine. If using a local MongoDB instance:
```bash
mongod
```

#### Start the Backend
In the `server` directory:
```bash
npm run start:dev
```

The backend should start on `http://localhost:5000`.

#### Start the Frontend
In the `client` directory:
```bash
npm start
```

The frontend should start on `http://localhost:3000`.

## Usage


### 1. Browse Contests
- After logging in, you’ll be redirected to the homepage (`/`).
- Use the tabs to switch between **Upcoming Contests** and **Past Contests**.
- Filter contests by platform using the checkboxes (Codeforces, Codechef, Leetcode).
- Bookmark contests by clicking the bookmark icon on a contest card.

### 2. View and Add Solutions
- In the **Past Contests** tab, click "View Solution" to watch a YouTube video of a contest solution (if available).
- Regular users can add solution links by pasting a YouTube URL and clicking "Add" (optional: restrict this to admins in production).

### 3. Admin Dashboard
- (future advancement)Log in with the admin email (e.g., `admin@example.com`) to access the admin dashboard (`/admin`).
- **Add Solution**: Select a past contest, enter a YouTube solution link, and submit.
- **Manage Solutions**: View all solution links, edit existing ones, or delete them as needed.
- Only users with `isAdmin: true` (set during registration if the email matches `ADMIN_EMAIL`) can access this page.

### 4. Theme Switching
- Use the theme toggle in the header to switch between light, dark, and system themes.
- The app dynamically updates the UI using custom Tailwind CSS variables.

## Project Structure

```
contest-tracker/
├── client/                 # Frontend (React)
│   ├── src/
│   │   ├── components/     # Reusable components (e.g., ThemeProvider, ModeToggle)
│   │   ├── pages/          # Page components (Home, Admin, Login)
│   │   ├── App.js          # Main app component with routing and ThemeProvider
│   │   ├── index.js        # Entry point, imports index.css
│   │   └── index.css       # Tailwind CSS styles
├── server/                 # Backend (Node.js/Express)
│   ├── controllers/        # API logic (e.g., contestController)
│   ├── middleware/         # Authentication middleware (auth, admin)
│   ├── models/             # Mongoose models (Contest, SolutionLink, User)
│   ├── routes/             # API routes (contestRoutes, authRoutes)
│   ├── .env                # Environment variables (MongoDB URI, JWT secret, etc.)
│   └── index.js            # Server entry point
├── README.md               # Project documentation
└── package.json            # Project metadata and dependencies
```

## Authentication System(future advancement)

- **JWT Authentication**: Users must log in to access the app. A JWT token is stored in `localStorage` upon successful login.
- **Role-Based Access**: The `User` model includes an `isAdmin` field. Only users with the email matching `ADMIN_EMAIL` are marked as admins during registration.
- **Protected Routes**:
  - `/admin`: Accessible only to authenticated admin users (protected by `authMiddleware` and `adminMiddleware`).
  - `/`: Accessible to all authenticated users.
- **Password Security**: Passwords are hashed using `bcrypt` before being stored in the database.

## Screenshots

### Homepage (Dark Theme)
![Homepage Dark](https://github.com/Dhanraj30/Contest-tracker-mern/blob/main/Screenshot%202025-03-17%20184546.png)

### Homepage (Light Theme)
![Homepage](s)

### Admin Dashboard
![Admin Dashboard](screenshots/admin-dashboard.png)


## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and commit them (`git commit -m "Add your feature"`).
4. Push to your branch (`git push origin feature/your-feature`).
5. Open a pull request with a detailed description of your changes.

Please ensure your code follows the project’s style guidelines and includes appropriate tests.

## Known Issues

- **CLIST API Rate Limits**: The CLIST API may occasionally hit rate limits, causing contest data to fail loading. Consider adding retry logic or caching in production.
- **Solution Link Permissions**: Currently, regular users can add solution links. In a production environment, you may want to restrict this to admins only.
- **Error Handling**: Some error messages (e.g., network failures) could be more user-friendly.

## Future Improvements
- Add role based authentication system
- Add user profiles to track contest participation history.
- Implement pagination for large lists of contests.
- Add notifications for upcoming contests.
- Enhance security with refresh tokens and stricter password policies.
- Deploy the app to a cloud platform (e.g., Vercel for the frontend, Heroku for the backend).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For questions or feedback, feel free to reach out:

- **Email**: dhanraj30102002@gmail.com


---

 **License File**:
   - Create a `LICENSE` file in the root directory with the MIT License text if you choose to use it:
     ```
     MIT License

     Copyright (c) 2025 [Your Name]

     Permission is hereby granted, free of charge, to any person obtaining a copy
     of this software and associated documentation files (the "Software"), to deal
     in the Software without restriction, including without limitation the rights
     to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     copies of the Software, and to permit persons to whom the Software is
     furnished to do so, subject to the following conditions:

     The above copyright notice and this permission notice shall be included in all
     copies or substantial portions of the Software.

     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     SOFTWARE.
     ```
