# Debugging Gamecode Page

## Common Issues and Solutions

### Issue 1: Page shows "No room code provided"
**Cause**: Navigation state is missing
**Solution**: Make sure you're navigating from CreatePage or JoinPage with proper state

### Issue 2: Page is blank or shows loading forever
**Possible Causes**:
1. Firebase rules not configured
2. Network error
3. Invalid room code

**Debug Steps**:
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for Firebase requests
4. Look for these console logs:
   - "Players updated: [...]" should appear

### Issue 3: Players not showing up
**Possible Causes**:
1. Firebase database rules
2. Data structure mismatch

**Debug Steps**:
1. Open Firebase Console
2. Go to Realtime Database > Data
3. Check if data exists under `rooms/YOUR_CODE/players`
4. Verify structure:
```
rooms/
  ABC123/
    players/
      1234567890/
        id: "1234567890"
        name: "Player Name"
        avatar: "👑"
        isHost: true
        score: 0
```

### Issue 4: Countdown not starting
**Possible Causes**:
1. Not the host
2. Firebase write permission denied

**Debug Steps**:
1. Check console for errors when clicking "Start Game"
2. Verify you're the host (created the room)
3. Check Firebase rules are published

## Manual Testing Steps

### Test as Host:
1. Start the app: `npm start`
2. Open browser DevTools (F12)
3. Click "Create Room"
4. Enter name: "Host Player"
5. Click "Create Room"
6. **Expected**: Should see Gamecode page with your player listed
7. **Check Console**: Should see "Players updated: [...]"
8. **Check Firebase**: Open Firebase Console, verify room exists

### Test as Player:
1. Copy room code from host
2. Open new browser window (Incognito/Private)
3. Open DevTools (F12)
4. Click "Join Game"
5. Enter name: "Player 2"
6. Paste room code
7. **Expected**: Should see "Room exists" indicator and host in player list
8. Click "Join Game"
9. **Expected**: Should see Gamecode page with both players
10. **Check Console**: Should see "Players updated: [...]"

### Test Countdown:
1. As host, with at least 1 player in lobby
2. Click "Start Game Now"
3. **Expected**: 
   - Countdown appears: 5, 4, 3, 2, 1
   - All players see the countdown simultaneously
   - After 0, navigate to Canvas page
4. **Check Console**: Should see navigation logs

## Browser Console Commands

To manually check state, paste these in console:

```javascript
// Check current room in Firebase (replace ABC123 with your room code)
firebase.database().ref('rooms/ABC123').once('value').then(snap => console.log(snap.val()))

// Check all rooms
firebase.database().ref('rooms').once('value').then(snap => console.log(snap.val()))
```

## Fix Common Errors

### Error: "Permission denied"
```bash
# Go to Firebase Console
# Realtime Database > Rules
# Replace with:
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
# Click "Publish"
```

### Error: "Failed to connect to room"
1. Check internet connection
2. Verify Firebase config in `src/firebase.js`
3. Make sure Firebase project is active

### Error: Room not found
1. Verify room code is correct (case-sensitive)
2. Check if host successfully created room in Firebase Console
3. Room might have expired (implement cleanup if needed)

## Quick Fixes

### Clear localStorage and try again:
```javascript
// In browser console:
localStorage.clear();
location.reload();
```

### Reset Firebase (use with caution):
1. Go to Firebase Console
2. Realtime Database > Data
3. Click the X on "rooms" node to delete all rooms
4. Try creating a new room

## What Should Happen (Normal Flow)

### Host Creates Room:
1. ✅ Navigate to `/gamecode` with state
2. ✅ Page shows loading spinner
3. ✅ Firebase creates room with host player
4. ✅ Loading stops, game code displays
5. ✅ Host appears in player list with 👑
6. ✅ "Start Game Now" button is enabled

### Player Joins:
1. ✅ Enter room code on Join page
2. ✅ See host in player preview
3. ✅ Click "Join Game"
4. ✅ Navigate to `/gamecode` with state
5. ✅ Page shows loading spinner
6. ✅ Firebase adds player to room
7. ✅ Loading stops, game code displays
8. ✅ Both players visible in list
9. ✅ See "Waiting for host..." message

### Host Starts Game:
1. ✅ Host clicks "Start Game Now"
2. ✅ Countdown appears: 5
3. ✅ All players see countdown
4. ✅ Countdown: 4, 3, 2, 1, 0
5. ✅ All players navigate to Canvas
6. ✅ Canvas shows game with 30-second timer

## Still Not Working?

If you're still having issues:

1. **Check React DevTools**:
   - Install React DevTools extension
   - Check component state for Gamecode component
   - Verify props and state values

2. **Check Network Tab**:
   - Look for failed Firebase requests
   - Check response codes (should be 200)

3. **Simplify Test**:
   - Create room with just host
   - Don't join with another player yet
   - Verify host shows up correctly first

4. **Firebase Logs**:
   - Go to Firebase Console
   - Check usage/logs for errors

5. **Console Logs Added**:
   - Look for "Players updated:" messages
   - Should show player array each time it updates

## Report Issue

If issue persists, provide:
1. Browser console output (full errors)
2. Network tab screenshot showing Firebase requests
3. Firebase Console screenshot showing data structure
4. Steps you took before issue occurred
