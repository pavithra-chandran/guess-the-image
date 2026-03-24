# Quick Start Guide

## Step 1: Configure Firebase Rules (CRITICAL!)

**This MUST be done first or nothing will work!**

1. Go to https://console.firebase.google.com/
2. Select project: **draw-and-guess-afb75**
3. Click **"Realtime Database"** in left sidebar
4. Click **"Rules"** tab at the top
5. Replace all content with:

```json
{
  "rules": {
    "rooms": {
      "$roomCode": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

6. Click **"Publish"** button
7. Wait for "Rules published successfully" message

## Step 2: Start the Application

```bash
cd "C:\Users\dell\Downloads\drawing-app (2)\drawing-app\drawing-app"
npm start
```

Wait for browser to open at http://localhost:3000

## Step 3: Test as Host

1. Click **"Create Room"** button
2. Enter your name (e.g., "Host Player")
3. Select number of rounds (default: 5)
4. Click **"Create Room"**
5. **WAIT** - You should see a loading spinner briefly
6. **EXPECTED**: Game lobby page appears with:
   - A 6-character room code (e.g., "ABC123")
   - Your name with 👑 crown icon in player list
   - "Start Game Now" button at bottom

### If you see an error or blank page:
- Press F12 to open DevTools
- Check Console tab for error messages
- See DEBUG_GAMECODE.md for troubleshooting

## Step 4: Test Joining as Player

1. **Copy the room code** from host's screen
2. Open a NEW browser window (Ctrl+Shift+N for incognito)
3. Go to http://localhost:3000
4. Click **"Join Game"**
5. Enter a different name (e.g., "Player 2")
6. Paste the room code
7. **WAIT** - You should see the host appear in a preview
8. Click **"Join Game"**
9. **EXPECTED**: Game lobby page appears with:
   - Same room code
   - Both players listed (host with 👑, you with 🎮)
   - "Waiting for host to start the game..." message

### Verify Both Screens:
- **Host screen**: Should now show 2 players
- **Player screen**: Should show 2 players
- Both should update in real-time!

## Step 5: Start the Game

1. Go to **HOST's browser window**
2. Click **"Start Game Now"** button
3. **EXPECTED on BOTH screens**:
   - Large number appears: **5**
   - Then: **4**
   - Then: **3**
   - Then: **2**
   - Then: **1**
   - Then: Both players navigate to game canvas

## Step 6: Verify Game Canvas

After countdown, you should see:
- Drawing canvas in center
- Player list on left
- Chat panel on right
- Timer showing **30 seconds**
- Round 1 of [selected rounds]

## Troubleshooting

### "No room code provided" error
- You navigated directly to /gamecode
- Solution: Start from home page, use Create or Join buttons

### Stuck on loading spinner
- Firebase rules not configured
- Solution: Go back to Step 1

### Room not found when joining
- Wrong room code
- Host didn't create room successfully
- Solution: Check Firebase Console to see if room exists

### Players not appearing
- Firebase rules issue
- Solution: Re-publish Firebase rules from Step 1

### Countdown not working
- Only host can start game
- Need at least 1 player in room
- Check browser console for errors

## Check Firebase Database

To verify data is being written:

1. Go to https://console.firebase.google.com/
2. Select project: **draw-and-guess-afb75**
3. Click **"Realtime Database"**
4. Click **"Data"** tab
5. You should see:
   ```
   rooms
     └─ ABC123 (your room code)
         ├─ host: "Host Player"
         ├─ countdown: null
         ├─ players
         │   ├─ 1736699123456
         │   │   ├─ id: "1736699123456"
         │   │   ├─ name: "Host Player"
         │   │   ├─ avatar: "👑"
         │   │   ├─ isHost: true
         │   │   └─ score: 0
         │   └─ 1736699234567
         │       ├─ id: "1736699234567"
         │       ├─ name: "Player 2"
         │       ├─ avatar: "🎮"
         │       ├─ isHost: false
         │       └─ score: 0
         └─ settings
             └─ rounds: "5"
   ```

If you don't see this structure, check:
- Firebase rules are published
- No console errors
- Internet connection is working

## What's Fixed

✅ Firebase database null issue - now writes data correctly
✅ Host creates room with proper structure
✅ Players can join existing rooms
✅ Real-time player list updates
✅ 5-second synchronized countdown
✅ All players navigate together to game
✅ 30-second game timer

## Need Help?

See these files for more details:
- **FIREBASE_SETUP.md** - Complete Firebase configuration
- **DEBUG_GAMECODE.md** - Detailed debugging steps
- **firebase-rules.json** - Database rules to copy

## Quick Commands

```bash
# Start app
npm start

# Clear cache and restart
rm -rf node_modules/.cache
npm start

# Check for errors
# (Open browser DevTools with F12)
```
