# Collaborative Coding Interview Platform

<div align="center">

![Talent IQ Logo](https://img.shields.io/badge/Talent%20IQ-Code%20Together-blue?style=for-the-badge&logo=react)

**A modern, real-time collaborative coding interview platform that connects interviewers and candidates through live coding sessions, video calls, and instant messaging.**

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

[Live Demo](#) • [Report Bug](#) • [Request Feature](#)

</div>

## 📋 Table of Contents

- [About The Project](#-about-the-project)
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Environment Setup](#️-environment-setup)
- [📁 Project Structure](#-project-structure)
- [🔧 API Endpoints](#-api-endpoints)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)

## 🌟 About The Project

Talent IQ is a comprehensive coding interview platform designed to streamline technical interviews. It provides a seamless experience for both interviewers and candidates with real-time collaboration tools, making remote technical interviews as effective as in-person sessions.

### Key Problem Solved
- **Remote Interview Challenges**: Makes remote technical interviews engaging and effective
- **Real-time Collaboration**: Enables pair programming and live code review
- **Streamlined Process**: Reduces setup time and technical friction during interviews

## ✨ Features

### 👥 User Management
- **Secure Authentication**: Powered by Clerk for seamless user registration and login
- **Profile Management**: Customizable user profiles with profile images
- **Role-based Access**: Different experiences for interviewers and candidates

### 💻 Coding Environment
- **Interactive Code Editor**: Monaco Editor with syntax highlighting and IntelliSense
- **Multi-language Support**: JavaScript, Python, and more
- **Real-time Code Collaboration**: Live code sharing and editing
- **Problem Library**: Curated collection of coding challenges with varying difficulties

### 📹 Video & Communication
- **Video Calling**: Integrated video calls using Stream Video SDK
- **Real-time Chat**: Instant messaging during interview sessions
- **Screen Sharing**: Share coding screen for better collaboration

### 📊 Session Management
- **Interview Sessions**: Create and manage interview sessions
- **Session Status Tracking**: Active and completed session states
- **Participant Management**: Host and participant coordination

### 🎨 User Experience
- **Modern UI**: Beautiful, responsive design using Tailwind CSS and DaisyUI
- **Smooth Animations**: Framer Motion for engaging interactions
- **Mobile Friendly**: Fully responsive design for all devices

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with latest features
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library for Tailwind
- **Monaco Editor** - VS Code editor in the browser
- **Clerk** - Authentication and user management
- **Stream Video SDK** - Video calling functionality
- **React Query** - Data fetching and state management
- **Framer Motion** - Animation library

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Clerk Express** - Backend authentication
- **Stream Node SDK** - Video calling backend
- **Inngest** - Background job processing
- **CORS** - Cross-origin resource sharing

### Development Tools
- **ESLint** - Code linting and formatting
- **Nodemon** - Auto-restart development server
- **Git** - Version control

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB database
- Clerk account
- Stream account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shivraj-yadav/InterviewOS.git
   cd InterviewOS
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend environment
   cd backend
   cp .env.example .env
   # Edit .env with your credentials

   # Frontend environment
   cd ../frontend
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Start the development servers**
   ```bash
   # Start backend (port 3000)
   cd backend
   npm run dev

   # Start frontend (port 5173) - in a new terminal
   cd frontend
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## ⚙️ Environment Setup

### Backend Environment Variables (.env)
```env
PORT=3000
NODE_ENV=development

DB_URL=your_mongodb_connection_url

INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key

STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret

CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

CLIENT_URL=http://localhost:5173
```

### Frontend Environment Variables (.env)
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_STREAM_API_KEY=your_stream_api_key
VITE_API_URL=http://localhost:3000
```

### Required Services Setup

1. **MongoDB**
   - Create a free MongoDB Atlas account
   - Set up a cluster and get the connection string
   - Add the connection string to your `.env` file

2. **Clerk Authentication**
   - Create a Clerk account at [clerk.com](https://clerk.com)
   - Set up a new application
   - Get your Publishable and Secret keys
   - Configure redirect URLs in Clerk dashboard

3. **Stream Video & Chat**
   - Create a Stream account at [getstream.io](https://getstream.io)
   - Create a new video application
   - Get your API Key and Secret
   - Configure permissions and settings

4. **Inngest (Optional)**
   - Create an Inngest account for background job processing
   - Get your Event Key and Signing Key
   - Set up Inngest Dev Server for local development

## 📁 Project Structure

```
InterviewOS/
├── backend/                 # Node.js Express server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── lib/            # Utility functions
│   │   ├── middleware/     # Express middleware
│   │   ├── model/          # MongoDB models
│   │   ├── routes/         # API routes
│   │   └── server.js       # Server entry point
│   ├── .env.example        # Environment variables template
│   └── package.json        # Backend dependencies
├── frontend/                # React Vite application
│   ├── src/
│   │   ├── api/           # API utility functions
│   │   ├── components/    # Reusable React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Frontend utilities
│   │   ├── pages/         # Page components
│   │   ├── data/          # Static data (problems)
│   │   ├── App.jsx        # Main App component
│   │   └── main.jsx       # React entry point
│   ├── public/            # Static assets
│   ├── .env.example       # Environment variables template
│   └── package.json       # Frontend dependencies
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## 🔧 API Endpoints

### Authentication (handled by Clerk)
- User registration and login managed by Clerk

### Sessions
- `GET /api/sessions` - Get all sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get session by ID
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session

### Chat
- `GET /api/chat/:sessionId` - Get chat messages for session
- `POST /api/chat/:sessionId` - Send message in session

### Health Check
- `GET /api/health` - Backend health status
- `GET /api/inngest/health` - Inngest health status

### Data Models

#### User
```javascript
{
  name: String,
  email: String,
  profileImage: String,
  clerkId: String
}
```

#### Session
```javascript
{
  problem: String,
  difficulty: String, // 'easy', 'medium', 'hard'
  host: ObjectId, // User ID
  participant: ObjectId, // User ID
  status: String, // 'active', 'completed'
  callId: String
}
```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

### How to Contribute

1. **Fork the Project**
   ```bash
   git clone https://github.com/your-username/InterviewOS.git
   ```

2. **Create your Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Commit your Changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

4. **Push to the Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📝 License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Clerk](https://clerk.com) for providing excellent authentication services
- [Stream](https://getstream.io) for video and chat infrastructure
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the powerful code editor
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [React](https://reactjs.org) for the amazing UI library

## 📞 Contact

- **Project Link**: [https://github.com/shivraj-yadav/InterviewOS](https://github.com/shivraj-yadav/InterviewOS)
- **Issues**: [GitHub Issues](https://github.com/shivraj-yadav/InterviewOS/issues)

---

<div align="center">

**Made with ❤️ by [Shivraj Yadav](https://github.com/shivraj-yadav)**

[⭐ Star this repo](https://github.com/shivraj-yadav/InterviewOS) if it helped you!

</div>
