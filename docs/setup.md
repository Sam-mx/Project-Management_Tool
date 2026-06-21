Setup Guide: Samwise PM Platform
This guide provides step-by-step instructions for setting up and running the Samwise project locally.

` You can run Samwise locally using either Docker (recommended) or npm.`

### Prerequisites

- Node.js (v16+)

- MongoDB Atlas Account (or local Mongo instance)

- Google Cloud Console Project (for OAuth)

- Google Gemini API Key

### Method 1: Docker (Quick Start)

1. Clone the repository:

```

git clone https://github.com/Sam-mx/Project-Management_Tool.git
cd samwise-project

```

2. Create Environment Variables: Create a `.env` file in the root directory and populate it (see Environment Variables section below).

3. Run with Docker Compose:

```

docker-compose up --build

```

The app will be available at http://localhost:3000.

### Method 2: Manual Setup

1. Backend Setup:

```

cd server

npm install

# Create server/.env file

npm run dev

```

2. Frontend Setup:

```

cd client

npm install

# Create client/.env file

npm run dev

```

## 🔑 Environment Variables

Server (`server/.env`)

```
PORT=5000

MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/samwise

JWT_SECRET=your_super_secret_key

REFRESH_TOKEN_SECRET=your_refresh_secret_key

GOOGLE_CLIENT_ID=your_google_client_id

GOOGLE_CLIENT_SECRET=your_google_client_secret

GEMINI_API_KEY=your_gemini_api_key

CLIENT_URL=http://localhost:3000
```

Client (`client/.env`)

```
VITE_API_BASE_URL=http://localhost:5000/api

VITE_GOOGLE_CLIENT_ID=your_google_client_id

VITE_UNSPLASH_ACCESS_KEY=your_unsplash_key
```

## 🧪 Testing

To run the test suite (Unit & Integration):

```
cd client
npm test
```
