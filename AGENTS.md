# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Start the React dev server (http://localhost:3000)
npm start

# Production build
npm run build

# Run all tests (Jest + React Testing Library via react-scripts)
npm test

# Run a single test file
npm test -- --testPathPattern="ComponentName"

# Run tests matching a specific name
npm test -- --testNamePattern="test description"

# Clear build cache and restart (use when hot reload breaks)
rm -rf node_modules/.cache && npm start
```

> Note: `npm run server` references a `server.js` that does not exist. The `express`, `socket.io`, and `socket.io-client` packages in `package.json` are unused legacy dependencies. Similarly, `redux`, `react-redux`, and `zustand` are listed as dependencies but are not imported anywhere in the codebase.

## Architecture

### Tech stack
- **React 19** SPA bootstrapped with `react-scripts` (Create React App)
- **Firebase Realtime Database** for all multiplayer state — there is no custom backend
- **React Router v7** for client-side routing; all inter-route data is passed via `location.state` (not a global store)
- **CSS Modules** for per-component styling (`.module.css` files co-located with each component)
- Tailwind CSS is in `devDependencies` but is **not used** in any component

### Route flow
```
/ (HomePage)
  → /create (CreatePage)  →  /gamecode (Gamecode/GameLobby)
  → /join   (JoinPage)    →  /gamecode
                                ↓ (host triggers countdown)
                             /canvas (Canvas/DrawingGame)
                                ↓ (gameOver flag in Firebase)
                             /gameover (GameOverPage)
                                ↓ (restart)
                             /gamecode
```

### Firebase database layout (`src/firebase.js` exports `db`)
```
rooms/{roomCode}
  ├── host: "HostName"
  ├── settings: { rounds, scoringRule }
  ├── players: { [playerId]: { id, name, avatar, isHost, score, joinedAt } }
  ├── gameStarted: false
  ├── countdown: null | 0-5         ← host writes to trigger synchronized countdown
  ├── gameState:
  │     gamePhase: "drawing" | "guessing"
  │     currentRound, currentDrawerIndex, currentGuessingPlayerIndex
  │     timeLeft, currentWord, playerWords: { [playerId]: "WORD" }
  │     correctGuessers: [], revealedLetters: {}, roundEnded, roundStartTime, gameOver
  ├── drawing: { [pushId]: { type, x, y, color, size, player, timestamp } }
  ├── playerDrawings: { [playerId]: { [pushId]: drawData } }
  └── chat: { [pushId]: { player, message, time, type, timestamp } }
```

### Game logic (Canvas component)
The game has two sequential phases:
1. **Drawing phase** — every player gets a secret word and draws it on the canvas while others guess in real time. Each player draws for 30 seconds; turns rotate until all players have drawn.
2. **Guessing phase** — saved drawings are replayed one at a time; other players guess the word. Each guessing turn is 60 seconds. A correct guess earns the guesser 10 points and ends the round immediately.

Only the **host** writes game-state transitions to Firebase (next round, game over). All other clients are read-only listeners that react to Firebase updates.

Drawing data is pushed to `rooms/{roomCode}/drawing` on every mouse event. Non-drawing clients re-render the canvas from Firebase. The drawing player renders locally for responsiveness and only listens for `clear` commands.

Incorrect guesses in guessing phase reveal correctly positioned letters in the word hint.

### State management pattern
There is no global state store. Each page component:
- Receives initial data from `location.state` on navigation
- Subscribes to Firebase `onValue` listeners in `useEffect` for live updates
- Uses `useRef` to hold latest values inside async callbacks (avoiding stale closures — see the ref pattern extensively in `Canvas.jsx`)

### Styling conventions
- Each component has a co-located `ComponentName.module.css`; access via `styles.className`
- `Gamecode.jsx` is an exception — it uses inline `<style>` tags with plain class names instead of CSS Modules

### Firebase configuration
The Firebase project is `draw-and-guess-afb75`. Config is hardcoded in `src/firebase.js`. The Realtime Database rules must grant read/write on `rooms/{roomCode}` for the app to function — see `firebase-rules.json` for the required rules.
