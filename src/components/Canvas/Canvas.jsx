import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Clock, Trophy, Send, Palette, Eraser, RotateCcw, Undo, CheckCircle, XCircle } from 'lucide-react';
import { db } from '../../firebase';
import { ref, onValue, push, set, update, serverTimestamp, get } from 'firebase/database';
import styles from './Canvas.module.css';

// Word list for the game
const WORDS = [
  'SUN', 'MOON', 'STAR', 'CLOUD', 'RAIN', 'SNOW', 'WIND', 'STORM', 'RAINBOW', 'LIGHTNING',
  'MOUNTAIN', 'HILL', 'VALLEY', 'RIVER', 'LAKE', 'SEA', 'OCEAN', 'ISLAND', 'BEACH', 'CAVE',
  'FOREST', 'DESERT', 'TREE', 'BUSH', 'GRASS', 'FLOWER', 'LEAF', 'SEED', 'ROOT', 'BRANCH',
  'CAT', 'DOG', 'MOUSE', 'RABBIT', 'HORSE', 'COW', 'SHEEP', 'GOAT', 'PIG', 'DEER',
  'LION', 'TIGER', 'ELEPHANT', 'ZEBRA', 'MONKEY', 'BEAR', 'FOX', 'WOLF', 'GIRAFFE', 'KANGAROO',
  'FROG', 'TURTLE', 'SNAKE', 'LIZARD', 'CROCODILE', 'DOLPHIN', 'WHALE', 'SHARK', 'OCTOPUS', 'CRAB',
  'FISH', 'SEAHORSE', 'STARFISH', 'SQUID', 'PENGUIN', 'OWL', 'EAGLE', 'PARROT', 'DUCK', 'HEN',
  'ANT', 'BEE', 'BUTTERFLY', 'SPIDER', 'LADYBUG', 'DRAGONFLY', 'MOSQUITO', 'WORM', 'SNAIL', 'BEETLE',
  'HOUSE', 'CASTLE', 'HUT', 'IGLOO', 'TENT', 'BUILDING', 'TOWER', 'BRIDGE', 'ROAD', 'PATH',
  'DOOR', 'WINDOW', 'ROOF', 'FENCE', 'GATE', 'STAIRS', 'ELEVATOR', 'ESCALATOR', 'BALCONY', 'CHIMNEY',
  'CHAIR', 'TABLE', 'BED', 'SOFA', 'CUPBOARD', 'DESK', 'LAMP', 'CLOCK', 'FAN', 'MIRROR',
  'TV', 'PHONE', 'COMPUTER', 'LAPTOP', 'KEYBOARD', 'MOUSE DEVICE', 'BOOK', 'NOTEBOOK', 'PEN', 'PENCIL',
  'ERASER', 'SHARPENER', 'BAG', 'BOTTLE', 'LUNCHBOX', 'UMBRELLA', 'GLASSES', 'WATCH', 'CAMERA', 'MICROPHONE',
  'CAR', 'BUS', 'TRAIN', 'BIKE', 'TRUCK', 'AMBULANCE', 'FIRETRUCK', 'POLICE CAR', 'SCOOTER', 'VAN',
  'SHIP', 'BOAT', 'SUBMARINE', 'AIRPLANE', 'HELICOPTER', 'ROCKET', 'SPACESHIP', 'SATELLITE', 'PARACHUTE', 'HOT AIR BALLOON',
  'APPLE', 'BANANA', 'MANGO', 'ORANGE', 'GRAPES', 'WATERMELON', 'PINEAPPLE', 'PEAR', 'PEACH', 'CHERRY',
  'STRAWBERRY', 'KIWI', 'LEMON', 'COCONUT', 'PAPAYA', 'GUAVA', 'PLUM', 'FIG', 'DATE', 'LYCHEE',
  'CARROT', 'POTATO', 'TOMATO', 'ONION', 'GARLIC', 'CABBAGE', 'CAULIFLOWER', 'BROCCOLI', 'SPINACH', 'PEAS',
  'BEANS', 'CORN', 'CUCUMBER', 'PUMPKIN', 'RADISH', 'BEETROOT', 'CHILLI', 'GINGER', 'OKRA', 'MUSHROOM',
  'CAKE', 'BREAD', 'RICE', 'NOODLES', 'PASTA', 'PIZZA', 'BURGER', 'SANDWICH', 'SOUP', 'SALAD',
  'MILK', 'JUICE', 'TEA', 'COFFEE', 'ICE CREAM', 'CHOCOLATE', 'CANDY', 'COOKIE', 'DONUT', 'PANCAKE',
  'BALL', 'BAT', 'KITE', 'DOLL', 'TEDDY', 'PUZZLE', 'BLOCKS', 'ROBOT', 'CAR TOY', 'TRAIN TOY',
  'SWING', 'SLIDE', 'SEE-SAW', 'TRAMPOLINE', 'SKATEBOARD', 'ROLLER SKATES', 'FRISBEE', 'YOYO', 'DRUM', 'PIANO',
  'GUITAR', 'VIOLIN', 'FLUTE', 'TRUMPET', 'HARP', 'BELL', 'WHISTLE', 'MIC', 'SPEAKER', 'HEADPHONES',
  'HAT', 'CAP', 'HELMET', 'CROWN', 'MASK', 'SHIRT', 'T-SHIRT', 'PANTS', 'JEANS', 'SHORTS',
  'DRESS', 'SKIRT', 'JACKET', 'COAT', 'SWEATER', 'SCARF', 'GLOVES', 'SOCKS', 'SHOES', 'BOOTS',
  'FACE', 'EYES', 'NOSE', 'MOUTH', 'EAR', 'HAIR', 'HAND', 'FINGER', 'LEG', 'FOOT',
  'SMILE', 'LAUGH', 'CRY', 'ANGRY', 'SURPRISED', 'SLEEPING', 'RUNNING', 'JUMPING', 'DANCING', 'READING',
  'WRITING', 'DRAWING', 'PAINTING', 'SINGING', 'SWIMMING', 'FLYING', 'CLIMBING', 'THINKING', 'EATING', 'DRINKING',
  'CIRCLE', 'SQUARE', 'TRIANGLE', 'RECTANGLE', 'OVAL', 'STAR SHAPE', 'HEART', 'CUBE', 'SPHERE', 'CONE',
  'CYLINDER', 'PYRAMID', 'LINE', 'DOT', 'ARROW', 'ZIGZAG', 'SPIRAL', 'WAVE', 'CROSS', 'GRID',
  'SCHOOL', 'CLASSROOM', 'TEACHER', 'STUDENT', 'BLACKBOARD', 'CHALK', 'DESK', 'PLAYGROUND', 'LIBRARY', 'LAB',
  'HOSPITAL', 'DOCTOR', 'NURSE', 'AMBULANCE', 'POLICE', 'FIRE STATION', 'POST OFFICE', 'BANK', 'SHOP', 'MARKET',
  'PARK', 'GARDEN', 'ZOO', 'MUSEUM', 'THEATER', 'CINEMA', 'RESTAURANT', 'HOTEL', 'AIRPORT', 'RAILWAY STATION',
  'KING', 'QUEEN', 'PRINCE', 'PRINCESS', 'KNIGHT', 'DRAGON', 'FAIRY', 'WIZARD', 'MAGIC WAND', 'CASTLE',
  'PIRATE', 'TREASURE', 'MAP', 'SWORD', 'SHIELD', 'ROBOT', 'ALIEN', 'MONSTER', 'ZOMBIE', 'GHOST',
  'SUPERHERO', 'VILLAIN', 'DETECTIVE', 'ASTRONAUT', 'SCIENTIST', 'CHEF', 'FARMER', 'POLICEMAN', 'FIREFIGHTER', 'TEACHER',
  'CLOCK TOWER', 'WINDMILL', 'LIGHTHOUSE', 'FERRIS WHEEL', 'ROLLER COASTER', 'CAROUSEL', 'CIRCUS', 'TENT SHOW', 'BALLOON SELLER', 'ICE CREAM TRUCK',
  'TREASURE CHEST', 'KEY', 'LOCK', 'COMPASS', 'BINOCULARS', 'BACKPACK', 'MAP ROUTE', 'SIGNBOARD', 'TRAFFIC LIGHT', 'CROSSING',
  'VOLCANO', 'EARTHQUAKE', 'FLOOD', 'TORNADO', 'GLACIER', 'ICEBERG', 'CORAL', 'REEF', 'WATERFALL', 'GEYSER',
  'BUBBLES', 'SHADOW', 'REFLECTION', 'FOOTPRINT', 'HANDPRINT', 'PUZZLE PIECE', 'MAZE', 'LABYRINTH', 'CHECKERBOARD', 'DOMINO',
  'CANDLE', 'TORCH', 'LANTERN', 'FIRE', 'SMOKE', 'ASH', 'SPARK', 'FLAME', 'MATCHSTICK', 'CAMPFIRE',
  'GARDENING', 'PLANTING', 'HARVESTING', 'FISHING', 'CAMPING', 'HIKING', 'PICNIC', 'TRAVELING', 'SHOPPING', 'COOKING'
];

const DrawingGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [gameState, setGameState] = useState('playing');
  const [gamePhase, setGamePhase] = useState('drawing'); // 'drawing' or 'guessing'
  const [currentDrawerIndex, setCurrentDrawerIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(3);
  const [currentWord, setCurrentWord] = useState('');
  const [guessInput, setGuessInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [localMessages, setLocalMessages] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [usedWords, setUsedWords] = useState(new Set());
  const [correctGuessers, setCorrectGuessers] = useState([]);
  const [roundEnded, setRoundEnded] = useState(false);
  const [revealedLetters, setRevealedLetters] = useState({}); // {playerId: {0: 'B', 3: 'T', ...}}
  const [playerWords, setPlayerWords] = useState({}); // {playerId: 'WORD'}
  const [playerDrawings, setPlayerDrawings] = useState({}); // {playerId: [drawData]}

  // Recover state from location.state (normal) or localStorage (page refresh)
  const getSavedState = () => {
    try { return JSON.parse(localStorage.getItem('drawingGameState')); } catch (e) { return null; }
  };
  const rawState = (location.state?.roomCode) ? location.state : getSavedState();
  const gameSettings = rawState?.gameSettings;
  const roomCode = rawState?.roomCode;
  const currentPlayerData = rawState?.currentPlayer;
  const [players, setPlayers] = useState(
    (rawState?.players || []).slice().sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0))
  );


  const currentPlayer = currentPlayerData || (players.length > 0 ? players[0] : null);
  
  // Get the current drawer's info from the players array using currentDrawerIndex
  const currentDrawer = players[currentDrawerIndex];
  const currentDrawerId = currentDrawer?.id;
  const currentDrawerName = currentDrawer?.name;
  
  // More reliable check: compare current player's ID with drawer's ID, also check by name as fallback
  const isCurrentPlayerDrawing = currentPlayer && (
    (currentDrawerId && currentPlayer.id === currentDrawerId) || 
    (currentDrawerName && currentPlayer.name === currentDrawerName)
  );

  // Refs to always have latest values inside async callbacks (avoid stale closures)
  const gamePhaseRef = useRef(gamePhase);
  const currentDrawerIndexRef = useRef(currentDrawerIndex);
  const roundRef = useRef(round);
  const roundEndedRef = useRef(roundEnded);
  const playersRef2 = useRef(players);

  useEffect(() => { gamePhaseRef.current = gamePhase; }, [gamePhase]);
  useEffect(() => { currentDrawerIndexRef.current = currentDrawerIndex; }, [currentDrawerIndex]);
  useEffect(() => { roundRef.current = round; }, [round]);
  useEffect(() => { roundEndedRef.current = roundEnded; }, [roundEnded]);
  useEffect(() => { playersRef2.current = players; }, [players]);

  const totalRoundsRef = useRef(3);
  // Tracks roundStartTime so we only reset the timer when a genuinely new round begins
  const lastRoundStartTimeRef = useRef(0);

  // Persist state to localStorage so the game can recover after a page refresh
  useEffect(() => {
    if (location.state?.roomCode) {
      localStorage.setItem('drawingGameState', JSON.stringify({
        roomCode: location.state.roomCode,
        currentPlayer: location.state.currentPlayer,
        players: location.state.players,
        gameSettings: location.state.gameSettings
      }));
    }
  }, [location.state?.roomCode, location.state?.currentPlayer, location.state?.players, location.state?.gameSettings]);

  // Utility functions
  const getRandomWord = useCallback(() => {
    const availableWords = WORDS.filter(word => !usedWords.has(word));
    if (availableWords.length === 0) {
      setUsedWords(new Set());
      return WORDS[Math.floor(Math.random() * WORDS.length)];
    }
    const word = availableWords[Math.floor(Math.random() * availableWords.length)];
    setUsedWords(prev => new Set([...prev, word]));
    return word;
  }, [usedWords]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const updatePlayerScore = useCallback((playerId, points) => {
    if (!roomCode) return;
    const playerScoreRef = ref(db, `rooms/${roomCode}/players/${playerId}/score`);
    get(playerScoreRef).then(snapshot => {
      const currentScore = snapshot.val() || 0;
      set(playerScoreRef, currentScore + points);
    });
  }, [roomCode]);

  const remoteLastPosRef = useRef({ x: 0, y: 0 });
  const isDrawingRef = useRef(false); // tracks if drawer is mid-stroke

  const drawOnCanvas = useCallback((data) => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (data.type === 'start') {
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(data.x, data.y);
      remoteLastPosRef.current = { x: data.x, y: data.y };
    } else if (data.type === 'draw') {
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const last = remoteLastPosRef.current;
      const midX = (last.x + data.x) / 2;
      const midY = (last.y + data.y) / 2;
      ctx.quadraticCurveTo(last.x, last.y, midX, midY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      remoteLastPosRef.current = { x: data.x, y: data.y };
    } else if (data.type === 'clear') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const nextRound = useCallback(async () => {
    if (!roomCode || !currentPlayer?.isHost) return;

    const gameStateRef = ref(db, `rooms/${roomCode}/gameState`);
    const freshSnapshot = await get(gameStateRef);
    if (!freshSnapshot.exists()) return;
    const freshState = freshSnapshot.val();

    const currentDrawerIdx = freshState.currentDrawerIndex || 0;
    const currentRoundNum = freshState.currentRound || 1;
    const currentPlayers = playersRef2.current.slice().sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
    const totalRoundsInGame = freshState.totalRounds || totalRoundsRef.current;

    // Calculate next drawer and round
    let nextDrawerIndex = (currentDrawerIdx + 1) % currentPlayers.length;
    let nextRoundNum = currentRoundNum;

    if (nextDrawerIndex === 0) {
      nextRoundNum = currentRoundNum + 1;
    }

    // Check if game is over
    if (nextRoundNum > totalRoundsInGame) {
      await update(gameStateRef, { gameOver: true });
      return;
    }

    // Assign a new word for the next drawer
    const newWord = getRandomWord();

    // Reset drawing for the next turn
    const currentDrawingRef = ref(db, `rooms/${roomCode}/drawing`);
    await set(currentDrawingRef, null);

    await update(gameStateRef, {
      currentDrawerIndex: nextDrawerIndex,
      currentRound: nextRoundNum,
      currentWord: newWord,
      timeLeft: 60,
      roundStartTime: Date.now(),
      correctGuessers: [],
      roundEnded: false,
      revealedLetters: {},
      gamePhase: 'drawing' // Ensure we stay in drawing phase for standard play
    });
  }, [roomCode, currentPlayer, getRandomWord]);

  useEffect(() => {
    if (gameSettings?.rounds) {
      const rounds = parseInt(gameSettings.rounds);
      setTotalRounds(rounds);
      totalRoundsRef.current = rounds;
    }

    if (roomCode && currentPlayer?.isHost) {
      const checkAndInitialize = async () => {
        const gameStateRef = ref(db, `rooms/${roomCode}/gameState`);
        const snapshot = await get(gameStateRef);

        if (!snapshot.exists() || snapshot.val()?.gameOver) {
          const sortedPlayers = players.slice().sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));

          const wordsForPlayers = {};
          const usedWordsLocal = new Set();
          sortedPlayers.forEach(player => {
            let available = WORDS.filter(w => !usedWordsLocal.has(w));
            if (available.length === 0) available = [...WORDS];
            const word = available[Math.floor(Math.random() * available.length)];
            usedWordsLocal.add(word);
            wordsForPlayers[player.id] = word;
          });

          const firstWord = wordsForPlayers[sortedPlayers[0]?.id] || getRandomWord();

          const rounds = parseInt(gameSettings?.rounds) || 3;

          await set(gameStateRef, {
            gamePhase: 'drawing',
            currentRound: 1,
            currentDrawerIndex: 0,
            timeLeft: 60,
            currentWord: firstWord,
            playerWords: wordsForPlayers,
            totalRounds: rounds,
            roundStartTime: Date.now(),
            correctGuessers: [],
            roundEnded: false,
            gameOver: false,
            revealedLetters: {}
          });
        } else {
          const existingState = snapshot.val();
          if (existingState.totalRounds) {
            totalRoundsRef.current = existingState.totalRounds;
          }
        }
      };
      checkAndInitialize();
    }
  }, [gameSettings, roomCode, currentPlayer, players, getRandomWord]);

  useEffect(() => {
    if (timeLeft > 0 && gameState === 'playing' && !roundEnded) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && currentPlayer?.isHost && !roundEnded) {
      // Time up: host sets roundEnded: true in Firebase to trigger advance for everyone
      if (correctGuessers.length === 0) {
        showToast('Time up! No one guessed correctly.', 'info');
      }
      
      const gameStateRef = ref(db, `rooms/${roomCode}/gameState`);
      update(gameStateRef, { roundEnded: true });
    }
  }, [timeLeft, gameState, roundEnded, correctGuessers.length, currentPlayer, roomCode]);

  // Automatically advance round when roundEnded is true
  useEffect(() => {
    if (roundEnded && currentPlayer?.isHost) {
      const advanceNextRound = () => {
        if (roundEndedRef.current) {
          nextRound();
          roundEndedRef.current = false;
        }
      };

      roundEndedRef.current = true;
      const timer = setTimeout(advanceNextRound, 2000);
      return () => clearTimeout(timer);
    }
  }, [roundEnded, currentPlayer, nextRound]);

  // Firebase listeners
  useEffect(() => {
    if (!roomCode) return;

    const playersRef = ref(db, `rooms/${roomCode}/players`);
    const unsubscribePlayers = onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const playersList = Object.values(data)
          .map(p => ({ ...p, score: p.score || 0 }))
          .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
        console.log('Players updated:', playersList.map(p => ({ id: p.id, name: p.name, joinedAt: p.joinedAt })));
        setPlayers(playersList);
      }
    });

    const drawingRef = ref(db, `rooms/${roomCode}/drawing`);
    const unsubscribeDrawing = onValue(drawingRef, (snapshot) => {
      const data = snapshot.val();
      // If the current player is drawing and is mid-stroke, skip the redraw
      // to avoid clearing their canvas while they're actively drawing
      if (isDrawingRef.current) return;

      const canvas = document.querySelector('canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (data) {
        Object.values(data).forEach(drawData => drawOnCanvas(drawData));
      }
    });

    const gameStateRef = ref(db, `rooms/${roomCode}/gameState`);
    const unsubscribeGameState = onValue(gameStateRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        console.log('GameState updated:', JSON.stringify(data, null, 2));
        
        setGamePhase(data.gamePhase || 'drawing');
        setRound(data.currentRound || 1);
        setCurrentDrawerIndex(data.currentDrawerIndex || 0);
        
        // Get the word - ensure it's always set
        const newWord = data.currentWord || '';
        console.log('Setting currentWord:', newWord, 'for round:', data.currentRound);
        setCurrentWord(newWord);
        
        if (data.roundStartTime && data.roundStartTime !== lastRoundStartTimeRef.current) {
          lastRoundStartTimeRef.current = data.roundStartTime;
          const maxTime = 60;
          const elapsed = Math.floor((Date.now() - data.roundStartTime) / 1000);
          setTimeLeft(Math.max(0, maxTime - elapsed));
          setLocalMessages([]);
          console.log('New round started, word:', newWord);
        }
        
        setCorrectGuessers(data.correctGuessers || []);
        setRevealedLetters(data.revealedLetters || {});
        if (data.totalRounds) {
          totalRoundsRef.current = data.totalRounds;
        }
        if (data.playerWords) {
          setPlayerWords(data.playerWords);
        }
        if (data.gameOver) {
          navigate('/gameover', {
            state: { 
              players: players.map(p => ({ ...p, score: p.score || 0 })),
              roomCode,
              gameSettings,
              currentPlayer
            }
          });
        }
        if (data.roundEnded) {
          setRoundEnded(true);
        } else {
          setRoundEnded(false);
          roundEndedRef.current = false;
        }
      }
    });

    const chatRef = ref(db, `rooms/${roomCode}/chat`);
    const unsubscribeChat = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messages = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
        setChatMessages(messages);
      }
    });

    return () => {
      unsubscribePlayers();
      unsubscribeDrawing();
      unsubscribeGameState();
      unsubscribeChat();
    };
  }, [roomCode, navigate, players, gameSettings, currentPlayer, drawOnCanvas]);

  const sendDrawing = (drawData) => {
    if (!roomCode) return;
    const drawingRef = ref(db, `rooms/${roomCode}/drawing`);
    push(drawingRef, {
      ...drawData,
      player: currentPlayer?.name,
      timestamp: serverTimestamp()
    });
  };

  const sendGuess = async () => {
    if (!guessInput.trim() || !roomCode || !currentPlayer) return;

    const guess = guessInput.trim().toUpperCase();
    const correctWord = currentWord;
    const isCorrect = guess === correctWord;

    // Check if player already guessed correctly
    if (isCorrect && correctGuessers.includes(currentPlayer.id)) {
      showToast('You already guessed correctly!', 'warning');
      setGuessInput('');
      return;
    }

    if (isCorrect) {
      // Award points to guesser
      updatePlayerScore(currentPlayer.id, 10);

      // Award points to the drawer
      const drawerId = players[currentDrawerIndex]?.id;
      if (drawerId && drawerId !== currentPlayer.id) {
        updatePlayerScore(drawerId, 5);
      }

      // Push correct guess to Firebase chat so all players see it
      const chatRef = ref(db, `rooms/${roomCode}/chat`);
      push(chatRef, {
        id: `correct-${Date.now()}`,
        player: currentPlayer.name,
        playerId: currentPlayer.id,
        message: guessInput.trim(),
        time: new Date().toLocaleTimeString(),
        type: 'correct',
        points: 10,
        timestamp: Date.now()
      });

      // Add to correct guessers and end round
      const newCorrectGuessers = [...correctGuessers, currentPlayer.id];
      const gameStateRef = ref(db, `rooms/${roomCode}/gameState`);
      await update(gameStateRef, {
        correctGuessers: newCorrectGuessers,
        roundEnded: true
      });

      setCorrectGuessers(newCorrectGuessers);
      setRoundEnded(true);
    } else {
      // Wrong guess: push to Firebase chat so all players see it
      const chatRef = ref(db, `rooms/${roomCode}/chat`);
      push(chatRef, {
        id: `guess-${Date.now()}`,
        player: currentPlayer.name,
        playerId: currentPlayer.id,
        message: guessInput.trim(),
        time: new Date().toLocaleTimeString(),
        type: 'guess',
        timestamp: Date.now()
      });

      // Check for correct letter positions
      const newRevealedLetters = { ...revealedLetters };
      
      if (!newRevealedLetters[currentPlayer.id]) {
        newRevealedLetters[currentPlayer.id] = {};
      }
      
      let hasNewReveals = false;
      for (let i = 0; i < Math.min(guess.length, correctWord.length); i++) {
        if (guess[i] === correctWord[i] && !newRevealedLetters[currentPlayer.id][i]) {
          newRevealedLetters[currentPlayer.id][i] = correctWord[i];
          hasNewReveals = true;
        }
      }
      
      if (hasNewReveals) {
        setRevealedLetters(newRevealedLetters);
        
        // Update Firebase
        const gameStateRef = ref(db, `rooms/${roomCode}/gameState`);
        await update(gameStateRef, { revealedLetters: newRevealedLetters });
        
        showToast('Correct letter position revealed!', 'info');
      }
    }

    setGuessInput('');
  };

  return (
    <div className={styles.gameContainer}>
      <div className={styles.gameWrapper}>
        <GameHeader
          round={round}
          totalRounds={totalRounds}
          playersLength={players.length}
          timeLeft={timeLeft}
        />

        <div className={styles.gameGrid}>
          <div>
            <PlayerList 
              players={players} 
              currentDrawerIndex={currentDrawerIndex}
            />
          </div>

          <div>
            <GameCanvas
              currentWord={currentWord}
              gamePhase={gamePhase}
              currentDrawerName={currentDrawer?.name || players[currentDrawerIndex]?.name || 'Unknown'}
              currentDrawerId={currentDrawer?.id || players[currentDrawerIndex]?.id}
              isCurrentPlayerDrawing={isCurrentPlayerDrawing}
              onSendDrawing={sendDrawing}
              revealedLetters={revealedLetters}
              currentPlayerId={currentPlayer?.id}
              currentPlayerName={currentPlayer?.name}
              round={round}
              isDrawingRef={isDrawingRef}
            />
          </div>

          <div>
            <ChatPanel
              messages={chatMessages}
              isDrawer={isCurrentPlayerDrawing}
              guessInput={guessInput}
              setGuessInput={setGuessInput}
              sendGuess={sendGuess}
              players={players}
            />
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <div className={styles.toastContainer}>
        {toasts.map(toast => (
          <Toast key={toast.id} message={toast.message} type={toast.type} />
        ))}
      </div>
    </div>
  );
};

const GameHeader = ({ round, totalRounds, playersLength, timeLeft }) => {
  const getPhaseText = () => {
    return `Round ${round} of ${totalRounds}`;
  };
  
  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Trophy />
          </div>
          <div>
            <h1 className={styles.headerTitle}>Guess The Image</h1>
            <p className={styles.headerSubtitle}>{getPhaseText()}</p>
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.timerBox}>
            <Clock />
            <span className={`${styles.timerText} ${timeLeft <= 10 ? styles.timerWarning : ''}`}>
              {timeLeft}s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlayerList = ({ players, currentDrawerIndex }) => {
  const getPlayerLabel = (index) => {
    if (index === currentDrawerIndex) {
      return ' ✏️ Drawing';
    }
    return '';
  };
  
  const isActivePlayer = (index) => {
    return index === currentDrawerIndex;
  };
  
  return (
    <div className={styles.playerPanel}>
      <div className={styles.playerHeader}>
        <Users />
        <h2 className={styles.playerTitle}>Players</h2>
      </div>
      
      <div className={styles.playerList}>
        {players.map((player, index) => (
          <div
            key={player.id}
            className={`${styles.playerItem} ${
              isActivePlayer(index) ? styles.playerItemActive : styles.playerItemInactive
            }`}
          >
            <div className={styles.playerInfo}>
              <span className={styles.playerAvatar}>{player.avatar}</span>
              <div>
                <p className={`${styles.playerName} ${isActivePlayer(index) ? styles.playerNameActive : ''}`}>
                  {player.name}
                  {getPlayerLabel(index)}
                </p>
                <p className={styles.playerScore}>{player.score || 0} points</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const GameCanvas = ({ 
  currentWord, 
  gamePhase,
  currentDrawerName, 
  currentDrawerId,
  isCurrentPlayerDrawing, 
  onSendDrawing,
  revealedLetters,
  currentPlayerId,
  currentPlayerName,
  round,
  isDrawingRef
}) => {
  // More robust check: verify drawer identity using both ID and name
  // Also compare names as a fallback
  const isDrawer = (currentPlayerId && currentDrawerId && currentPlayerId === currentDrawerId) || 
                  (currentPlayerName && currentDrawerName && currentPlayerName === currentDrawerName);
  
  // Debug logging
  console.log('GameCanvas check:', {
    currentPlayerId,
    currentDrawerId,
    currentPlayerName,
    currentDrawerName,
    isDrawer,
    currentWord: currentWord || '(empty)',
    round
  });
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#000000');
  const [tool, setTool] = useState('brush');
  const [isDrawing, setIsDrawing] = useState(false);

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];

  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  // Generate word hint with underscores for guessers, showing revealed letters
  const getWordHint = (word, playerId) => {
    // If no word yet, show waiting message
    if (!word) return 'Waiting for word...';
    // If word is empty string, also show waiting
    if (word === '') return 'Waiting for word...';
    const playerRevealed = revealedLetters[playerId] || {};
    return word.split('').map((char, index) => {
      if (playerRevealed[index]) {
        return playerRevealed[index];
      }
      return '_';
    }).join(' ');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && !currentWord) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [currentWord]);

  // Clear canvas when round changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [currentWord]); // Clear when word changes (new round)

  const startDrawing = (e) => {
    if (!isDrawer || gamePhase !== 'drawing') return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctxRef.current = ctx;

    const { x, y } = getCanvasPos(e);
    lastPosRef.current = { x, y };

    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : brushColor;
    ctx.lineWidth = tool === 'eraser' ? brushSize * 2 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);

    if (isDrawingRef) isDrawingRef.current = true;
    setIsDrawing(true);
    onSendDrawing({ type: 'start', x, y, color: tool === 'eraser' ? '#FFFFFF' : brushColor, size: brushSize });
  };

  const draw = (e) => {
    if (!isDrawing || !isDrawer || gamePhase !== 'drawing') return;
    e.preventDefault();

    const { x, y } = getCanvasPos(e);
    const ctx = ctxRef.current;
    if (!ctx) return;

    const last = lastPosRef.current;
    const midX = (last.x + x) / 2;
    const midY = (last.y + y) / 2;

    ctx.quadraticCurveTo(last.x, last.y, midX, midY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(midX, midY);

    lastPosRef.current = { x, y };
    onSendDrawing({ type: 'draw', x, y, color: tool === 'eraser' ? '#FFFFFF' : brushColor, size: brushSize });
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    if (ctxRef.current) {
      const { x, y } = lastPosRef.current;
      ctxRef.current.lineTo(x, y);
      ctxRef.current.stroke();
    }
    if (isDrawingRef) isDrawingRef.current = false;
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!isDrawer || gamePhase !== 'drawing') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    onSendDrawing({ type: 'clear' });
  };

  // Debug logging
  console.log('GameCanvas render:', {
    isDrawer,
    isCurrentPlayerDrawing,
    currentPlayerId,
    currentDrawerId,
    currentWord: currentWord ? currentWord : '(empty)',
    round
  });

  return (
    <div className={styles.canvasPanel}>
      <div className={styles.wordDisplay}>
        <div className={styles.wordBox}>
          <h3 className={styles.wordTitle}>
            {/* Use isDrawer for more reliable check - compare IDs directly */}
            {isDrawer && currentWord ? (
              <>
                <div>✏️ You're drawing!</div>
                <div style={{ fontSize: '2rem', marginTop: '0.5rem', fontWeight: 'bold' }}>
                  {currentWord}
                </div>
              </>
            ) : (
              <>
                <div>🎨 {currentDrawerName || 'Someone'} is drawing...</div>
                <div style={{ fontSize: '1.5rem', marginTop: '0.5rem', letterSpacing: '0.3rem' }}>
                  {getWordHint(currentWord, currentPlayerId)}
                </div>
              </>
            )}
          </h3>
        </div>
      </div>

      {/* Show tools only to the actual drawer - use isDrawer for reliable check */}
      {isDrawer && gamePhase === 'drawing' && (
        <div className={styles.toolsContainer}>
          <div className={styles.colorPalette}>
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setBrushColor(color)}
                className={`${styles.colorButton} ${brushColor === color ? styles.colorButtonActive : ''}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <div className={styles.toolButtons}>
            {tool !== 'eraser' && (
              <button
                onClick={() => setTool('eraser')}
                className={styles.toolButton}
                title="Eraser"
              >
                <Eraser />
              </button>
            )}
            {tool === 'eraser' && (
              <button
                onClick={() => setTool('brush')}
                className={`${styles.toolButton} ${styles.toolButtonActive}`}
                title="Pencil"
              >
                <Palette />
              </button>
            )}
            <button onClick={clearCanvas} className={styles.toolButton}>
              <RotateCcw />
            </button>
          </div>

          <div className={styles.brushSizeContainer}>
            <span className={styles.brushSizeLabel}>Size:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(e.target.value)}
              className={styles.brushSizeSlider}
            />
            <span className={styles.brushSizeLabel}>{brushSize}px</span>
          </div>
        </div>
      )}

      <div className={styles.canvasContainer}>
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className={styles.canvas}
          style={{ touchAction: 'none', cursor: tool === 'eraser' ? 'cell' : 'crosshair' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
    </div>
  );
};

const ChatPanel = ({ 
  messages,
  isDrawer, 
  guessInput, 
  setGuessInput, 
  sendGuess,
  players = []
}) => {
  const getScore = (playerId) => {
    const p = players.find(p => p.id === playerId);
    return p?.score || 0;
  };

  return (
    <div className={styles.chatPanel}>
      <div className={styles.chatHeader}>
        <h3 className={styles.chatTitle}>Guesses</h3>
      </div>

      <div className={styles.chatMessages}>
        {messages.map((msg) => (
          <div key={msg.id} className={styles.messageContainer}>
            <div className={styles.messageHeader}>
              <span className={styles.messageSender}>{msg.player}</span>
              <span className={styles.messageScore}>{getScore(msg.playerId)} pts</span>
              <span className={styles.messageTime}>{msg.time}</span>
            </div>
            <div className={`${styles.messageContent} ${msg.type === 'correct' ? styles.correctGuess : styles.wrongGuess}`}>
              {msg.type === 'correct' && <span className={styles.correctIcon}>✅ </span>}
              {msg.message}
              {msg.type === 'correct' && <span className={styles.pointsBadge}> +10</span>}
            </div>
          </div>
        ))}
      </div>

      {!isDrawer ? (
        <div className={styles.guessInputContainer}>
          <input
            type="text"
            value={guessInput}
            onChange={(e) => setGuessInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendGuess()}
            placeholder="Type your guess..."
            className={styles.guessInput}
            autoFocus
          />
          <button onClick={sendGuess} className={styles.guessButton}>
            <Send size={18} />
          </button>
        </div>
      ) : (
        <div className={styles.drawerMessage} />
      )}
    </div>
  );
};

const Toast = ({ message, type }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'warning':
        return <XCircle size={20} />;
      case 'info':
        return <Trophy size={20} />;
      default:
        return <CheckCircle size={20} />;
    }
  };

  return (
    <div className={`${styles.toast} ${styles[`toast${type.charAt(0).toUpperCase() + type.slice(1)}`]}`}>
      {getIcon()}
      <span>{message}</span>
    </div>
  );
};

export default DrawingGame;