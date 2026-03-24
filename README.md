# Multiplayer Drawing App (Firebase)

A real-time multiplayer drawing and guessing game built with React and Firebase Realtime Database.

## Features

- Real-time multiplayer drawing synchronization
- Room-based gameplay with unique room codes
- Turn-based drawing system
- Live chat and guessing functionality
- Score tracking and game rounds
- Firebase Realtime Database integration

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Configuration
The app is already configured with Firebase. Your Firebase Realtime Database will automatically store:
- Room data at `/rooms/{roomCode}`
- Game state at `/games/{roomCode}/state`
- Drawing data at `/games/{roomCode}/drawing`
- Chat messages at `/games/{roomCode}/chat`

### 3. Start the App
```bash
npm start
```
The app will run on http://localhost:3000

## How to Play

1. **Create a Room**: Click "Create Game" and enter your name
2. **Join a Room**: Click "Join Game" and enter the room code
3. **Start Playing**: Host can start the game when ready
4. **Draw & Guess**: Take turns drawing and guessing words
5. **Score Points**: Correct guesses earn points

## Firebase Database Structure

```
/rooms/{roomCode}
├── code: "ABC123"
├── host: "PlayerName"
├── settings: { name, rounds }
├── players: {
│   ├── {playerId}: { id, name, avatar, status, isHost }
│   └── ...
├── started: false
└── createdAt: timestamp

/games/{roomCode}
├── state: { currentDrawer, currentWord, timeLeft, round }
├── drawing: { type, x, y, color, size, playerId, timestamp }
└── chat: {
    ├── {messageId}: { player, message, time, type, timestamp }
    └── ...
}
```

## Multiplayer Features

- **Real-time Drawing**: All drawing actions are synchronized via Firebase
- **Turn Management**: Automatic turn rotation between players
- **Chat System**: Live messaging and guess submission
- **Room Management**: Create/join rooms with unique codes
- **Persistent Data**: All game data stored in Firebase Realtime Database

## Technical Stack

- **Frontend**: React, Firebase SDK
- **Backend**: Firebase Realtime Database
- **Real-time Communication**: Firebase Realtime Database listeners
- **Styling**: CSS Modules

## Firebase Realtime Database Rules

Make sure your Firebase Realtime Database rules allow read/write access:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

## Development

The app uses Firebase Realtime Database for all multiplayer functionality:
- Room creation and joining
- Real-time drawing synchronization
- Chat messages
- Game state management

Players will see each other's names and can interact in real-time through the Firebase database.