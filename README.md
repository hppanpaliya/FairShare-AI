# FairShare AI - Bill Splitting Made Easy

<div align="center">
  <img src="Frontend/src/favicon.svg" alt="FairShare AI Logo" width="120" height="120">
  
  <p align="center">
    <strong>An intelligent bill-splitting application with AI-powered receipt scanning</strong>
  </p>
  
  <p align="center">
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#installation">Installation</a> •
    <a href="#usage">Usage</a> •
    <a href="#api-documentation">API</a> •
    <a href="#contributing">Contributing</a>
  </p>
</div>

## 🌟 Overview

FairShare AI is a modern web application that simplifies the process of splitting restaurant bills among friends. With AI-powered receipt scanning, real-time collaboration, and flexible splitting options, it takes the hassle out of dividing expenses fairly.

## ✨ Features

### Core Features
- **📸 AI-Powered Bill Scanning**: Upload photos of receipts and let AI extract items automatically
- **🔄 Real-time Collaboration**: Multiple users can join and update the same bill simultaneously
- **👥 Flexible Splitting Options**: Split items equally or claim specific quantities
- **💰 Smart Tax & Tip Distribution**: Choose between equal or proportional distribution
- **🔗 Shareable Links**: Easy event sharing with unique URLs
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices

### Additional Features
- **Item Management**: Add, edit, and delete items manually
- **Partial Claims**: Support for decimal quantities when splitting items
- **Overclaim Detection**: Visual indicators when items are claimed beyond available quantity
- **Bulk Operations**: Select and delete multiple items at once
- **Image Compression**: Automatic image optimization before upload
- **Toast Notifications**: User-friendly feedback for all actions

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express.js** - Server framework
- **MongoDB** - Database with Mongoose ODM
- **Socket.io** - Real-time bidirectional communication
- **OpenAI API** - AI-powered receipt parsing
- **Multer** - File upload handling
- **UUID** - Unique event ID generation

### Frontend
- **React** - UI framework
- **React Router** - Client-side routing
- **Socket.io Client** - Real-time updates
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Browser Image Compression** - Client-side image optimization

## 📋 Prerequisites

Before installation, ensure you have:
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- OpenAI API key (or compatible API like OpenRouter)
- npm or yarn package manager

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/fairshare-ai.git
cd fairshare-ai
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd Backend
```

Install dependencies:
```bash
npm install
```

Create environment file:
```bash
cp .env.example .env
```

Configure your `.env` file:
```env
PORT=4000
MONGODB_URI="mongodb://localhost:27017/bill-splitter"
OPENAI_API_KEY="your-api-key-here"
OPENAI_API_BASE_URL="https://openrouter.ai/api/v1"  # Or use OpenAI's URL
OPENAI_API_MODEL="google/gemini-2.0-flash-thinking-exp:free"
OPENAI_API_TIMEOUT=10000
OPENAI_API_MAX_TOKENS=10000
OPENAI_API_TEMPERATURE=0
OPENAI_API_MAX_RETRIES=3
```

Start the backend server:
```bash
npm run dev  # Development mode with nodemon
# or
npm start    # Production mode
```

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:
```bash
cd Frontend
```

Install dependencies:
```bash
npm install
```

Create environment file:
```bash
cp .env.example .env
```

Configure your `.env` file:
```env
REACT_APP_API_BASE_URL="http://localhost:4000/api"
REACT_APP_SOCKET_URL="http://localhost:4000"
```

Start the frontend development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## 🎯 Usage

### Creating an Event

1. Navigate to the homepage
2. Enter a name for your event (e.g., "Dinner at Luigi's")
3. Click "Create Event"
4. Share the generated link with your friends

### Adding People

1. In the "People" section, enter each person's name
2. Click "Add Person" or press Enter
3. People can be removed using the Delete button

### Managing Items

#### Manual Entry
1. Enter item details: name, quantity, unit price, or total price
2. The system automatically calculates missing values
3. Click "Add Item" to add to the bill

#### AI Bill Scanning
1. Click "Upload Bill" in the Bill Image section
2. Select a photo of your receipt
3. Click "Parse with AI" to extract items automatically
4. Review and edit extracted items as needed

### Claiming Items

1. In the "Claim Items" section, select people using checkboxes
2. Click "Split Evenly" to divide among selected people
3. Or manually enter quantities for custom splitting
4. The system shows claimed vs. available quantities

### Tax & Tip

1. Enter tax and tip amounts
2. Toggle between "Split Equally" or "Split by Share"
3. The system automatically calculates each person's contribution

## 📡 API Documentation

### Events

#### Create Event
```http
POST /api/events
Content-Type: application/json

{
  "name": "Restaurant Name"
}
```

#### Get Event
```http
GET /api/events/:eventId
```

#### Update Event
```http
PUT /api/events/:eventId
Content-Type: application/json

{
  "tax": 10.50,
  "tip": 15.00,
  "taxSplitEqually": true,
  "tipSplitEqually": false
}
```

### People

#### Add Person
```http
POST /api/events/:eventId/people
Content-Type: application/json

{
  "name": "John Doe"
}
```

#### Delete Person
```http
DELETE /api/people/:personId
```

### Items

#### Add Item
```http
POST /api/events/:eventId/items
Content-Type: application/json

{
  "name": "Pizza",
  "quantity": 1,
  "unitPrice": 15.99,
  "totalPrice": 15.99
}
```

#### Update Item
```http
PUT /api/items/:itemId
Content-Type: application/json

{
  "name": "Large Pizza",
  "quantity": 2,
  "unitPrice": 15.99,
  "totalPrice": 31.98
}
```

#### Update Claims
```http
PUT /api/items/:itemId/claims
Content-Type: application/json

{
  "personId": "person-id",
  "quantity": 0.5
}
```

### Bill Image

#### Upload Image
```http
POST /api/uploads/:eventId/bill
Content-Type: multipart/form-data

billImage: <file>
```

#### Parse Bill
```http
POST /api/uploads/:eventId/parse-bill
```

## 📁 Project Structure

```
fairshare-ai/
├── Backend/
│   ├── config/
│   │   ├── db.js           # MongoDB connection
│   │   └── socket.js       # Socket.io configuration
│   ├── models/
│   │   ├── Event.js        # Event schema
│   │   ├── Item.js         # Item schema
│   │   └── Person.js       # Person schema
│   ├── routes/
│   │   ├── events.js       # Event endpoints
│   │   ├── items.js        # Item endpoints
│   │   ├── people.js       # People endpoints
│   │   └── uploads.js      # File upload endpoints
│   ├── utils/
│   │   └── openaiParser.js # AI bill parsing logic
│   ├── uploads/            # Uploaded bill images
│   ├── server.js           # Express server setup
│   └── package.json
│
└── Frontend/
    ├── public/
    │   ├── favicon.svg     # App icon
    │   └── manifest.json   # PWA manifest
    ├── src/
    │   ├── components/
    │   │   ├── BillImage.js
    │   │   ├── EventCreation.js
    │   │   ├── ItemClaims.js
    │   │   ├── ItemsList.js
    │   │   ├── PeopleList.js
    │   │   ├── TaxAndTip.js
    │   │   └── ...
    │   ├── context/
    │   │   └── ToastProvider.js
    │   ├── hooks/
    │   │   ├── useEventData.js
    │   │   └── useSocketConnection.js
    │   ├── services/
    │   │   └── api.js      # API client
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## 🔧 Configuration

### MongoDB Setup

For local development:
```bash
mongod --dbpath /path/to/your/data
```

For production, use MongoDB Atlas:
1. Create a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Update `MONGODB_URI` in your `.env` file

### OpenAI Configuration

The app supports multiple AI providers:
- **OpenAI**: Set `OPENAI_API_BASE_URL` to `https://api.openai.com/v1`
- **OpenRouter**: Use `https://openrouter.ai/api/v1` for access to multiple models
- **Custom**: Any OpenAI-compatible API endpoint

### Socket.io CORS

Update CORS settings in production:
```javascript
// Backend/config/socket.js
cors: {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}
```

## 🚢 Deployment

### Backend Deployment (Heroku/Railway)

1. Set environment variables on your hosting platform
2. Ensure MongoDB connection string uses SSL for production
3. Update `FRONTEND_URL` for CORS

### Frontend Deployment (Vercel/Netlify)

1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Set environment variables for API URLs
3. Deploy the `build` folder

### Environment Variables for Production

Backend:
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
FRONTEND_URL=https://your-frontend-domain.com
```

Frontend:
```env
REACT_APP_API_BASE_URL=https://your-backend-domain.com/api
REACT_APP_SOCKET_URL=https://your-backend-domain.com
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Run `npm run format` before committing
- Follow the existing code structure
- Add comments for complex logic
- Update tests for new features

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Ensure MongoDB is running locally
- Check connection string format
- Verify network access for MongoDB Atlas

**AI Parsing Not Working**
- Verify OpenAI API key is valid
- Check API quota/limits
- Ensure image quality is sufficient

**Socket Connection Issues**
- Verify backend URL in frontend config
- Check CORS settings
- Ensure WebSocket support on hosting platform

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for powerful receipt parsing capabilities
- Socket.io for seamless real-time updates
- Tailwind CSS for beautiful, responsive design
- The open-source community for inspiration and tools

---

<div align="center">
  Made with ❤️
</div>