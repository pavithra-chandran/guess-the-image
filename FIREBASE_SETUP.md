# Firebase Setup Instructions

## Problem
The Firebase Realtime Database is showing `null` because the database rules need to be configured properly.

## Solution - Configure Firebase Database Rules

### Step 1: Open Firebase Console
1. Go to https://console.firebase.google.com/
2. Select your project: **draw-and-guess-afb75**

### Step 2: Configure Realtime Database Rules
1. In the left sidebar, click on **"Realtime Database"**
2. Click on the **"Rules"** tab at the top
3. Replace the existing rules with the content from `firebase-rules.json`:

```json
{
  "rules": {
    "rooms": {
      "$roomCode": {
        ".read": true,
        ".write": true,
        "players": {
          ".indexOn": ["joinedAt", "name"]
        },
        "drawing": {
          ".indexOn": ["timestamp"]
        },
        "chat": {
          ".indexOn": ["timestamp"]
        }
      }
    }
  }
}
```

4. Click **"Publish"** to save the rules

### Step 3: Verify Database URL
Make sure your Firebase config in `src/firebase.js` has the correct `databaseURL`:
```
databaseURL: "https://draw-and-guess-afb75-default-rtdb.firebaseio.com"
```

## Features Implemented

### 1. ✅ Host Creates Room
- Host enters their name and selects number of rounds
- A random 6-character room code is generated
- Room is created in Firebase with host as first player

### 2. ✅ Players Can Join
- Players enter their name and the room code
- Room existence is checked in Firebase
- Players can see other players in real-time before joining
- Upon joining, player is added to the Firebase room

### 3. ✅ Real-time Player List
- All players (host and joined players) can see each other in real-time
- Players are displayed with avatars and names
- Host is marked with 👑 crown icon
- Player list updates automatically when new players join

### 4. ✅ 5-Second Countdown
- When host clicks "Start Game", a 5-second countdown begins
- Countdown is synchronized across all players via Firebase
- All players see the countdown: 5, 4, 3, 2, 1

### 5. ✅ Game Starts After Countdown
- After countdown reaches 0, all players are automatically redirected to the game canvas
- Game settings and player list are passed to the canvas

### 6. ✅ 30-Second Timer Per Round
- Each round has 30 seconds (changed from 60)
- Timer is displayed at the top of the canvas
- Warning color when time is running low (≤10 seconds)

## How to Test

### Test 1: Create and Join
1. Run the app: `npm start`
2. Click "Create Room"
3. Enter a name and click "Create Room"
4. Copy the room code
5. Open another browser window (incognito/private mode)
6. Click "Join Game"
7. Enter a name and paste the room code
8. You should see both players in the lobby

### Test 2: Countdown and Game Start
1. With multiple players in the lobby
2. As the host, click "Start Game Now"
3. All players should see the countdown: 5, 4, 3, 2, 1
4. After countdown, all players are taken to the game canvas

### Test 3: Check Firebase Database
1. Go to Firebase Console > Realtime Database > Data tab
2. You should see structure like:
```
rooms/
  ABCD12/
    host: "Player Name"
    settings:
      rounds: "5"
    players:
      123456789:
        id: "123456789"
        name: "Player Name"
        avatar: "👑"
        isHost: true
        score: 0
    countdown: null (or 0-5 when starting)
```

## Troubleshooting

### Issue: "Permission denied" or data not writing
**Solution**: Make sure you've updated the Firebase Realtime Database rules as shown in Step 2 above.

### Issue: Players not seeing each other
**Solution**: 
1. Check browser console for errors
2. Verify Firebase config in `src/firebase.js`
3. Make sure database rules are published

### Issue: Countdown not working
**Solution**: Make sure all browser tabs are using the same room code and the database rules allow writes.

### Issue: Room not found when joining
**Solution**: 
1. Make sure the room code is correct (case-sensitive)
2. Verify the host has successfully created the room
3. Check Firebase console to see if room exists

## Security Note
⚠️ **Important**: The current rules allow anyone to read/write to the database. For production:
1. Add authentication
2. Restrict writes to authenticated users
3. Add validation rules
4. Implement proper access control

Example production rules:
```json
{
  "rules": {
    "rooms": {
      "$roomCode": {
        ".read": "auth != null",
        ".write": "auth != null",
        ".validate": "newData.hasChildren(['host', 'players', 'settings'])"
      }
    }
  }
}
```
