import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Copy, Check, Play, Users, Gamepad2, Zap, Trophy, Target } from 'lucide-react';
import { db } from '../../firebase';
import { ref, set, onValue, update, get, remove } from 'firebase/database';
import CountdownOverlay from '../CountdownOverlay/CountdownOverlay.jsx';

const GameLobby = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [gameCode, setGameCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [gameSettings, setGameSettings] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const playerDataRef = useRef(null);

  // Check if all players are ready
  const allPlayersReady = players.length > 0 && players.every(p => p.isReady === true);

  useEffect(() => {
    const roomCode = location.state?.roomCode;
    const formData = location.state?.formData;
    const playerName = location.state?.playerName;
    const hostFlag = location.state?.isHost;

    if (!roomCode) {
      setError('No room code provided');
      setTimeout(() => navigate('/'), 2000);
      return;
    }

    setGameCode(roomCode);
    setIsHost(hostFlag === true);

    const roomRef = ref(db, `rooms/${roomCode}`);
    let hasInitialized = false;

    // Initialize room or join
    const initializeRoom = async () => {
      if (hasInitialized) return;
      hasInitialized = true;
      
      try {
        const snapshot = await get(roomRef);
        
        if (formData && hostFlag) {
          // Host creating room
          const playerId = Date.now().toString();
          const playerData = { id: playerId, name: formData.name, avatar: '👑', isHost: true };
          playerDataRef.current = playerData;
          
          await set(roomRef, {
            host: formData.name,
            settings: {
              rounds: formData.rounds || '5',
              scoringRule: formData.scoringRule || 'others'
            },
            players: {
              [playerId]: {
                ...playerData,
                score: 0,
                isReady: false, // Host needs to click ready too
                joinedAt: Date.now()
              }
            },
            gameStarted: false,
            countdown: null,
            createdAt: Date.now()
          });
          setCurrentPlayer(playerData);
          setGameSettings({ rounds: formData.rounds, scoringRule: formData.scoringRule });
          setLoading(false);
        } else if (playerName && !hostFlag) {
          // Player joining room
          if (!snapshot.exists()) {
            setError('Room not found');
            setTimeout(() => navigate('/'), 2000);
            return;
          }

          const roomData = snapshot.val();
          const existingPlayers = roomData.players ? Object.values(roomData.players) : [];
          const existingPlayer = existingPlayers.find(p => p.name === playerName);

          if (existingPlayer) {
            playerDataRef.current = existingPlayer;
            setCurrentPlayer(existingPlayer);
          } else {
            const playerId = `player_${Date.now()}`;
            const avatars = ['🎮', '🎲', '🎯', '🏆', '🌟', '✨', '💥', '🔥'];
            const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
            const playerData = { id: playerId, name: playerName, avatar: randomAvatar, isHost: false, isReady: false, joinedAt: Date.now(), score: 0 };
            // Set ref BEFORE writing to Firebase so onValue can find it
            playerDataRef.current = playerData;
            setCurrentPlayer(playerData);
            await set(ref(db, `rooms/${roomCode}/players/${playerId}`), playerData);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing room:', error);
        setError('Failed to connect to room: ' + error.message);
        setLoading(false);
      }
    };

    initializeRoom();

    // Listen to room changes
    let isInitialized = false;
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const roomData = snapshot.val();
      if (roomData) {
        isInitialized = true;
        const playersList = roomData.players
          ? Object.values(roomData.players).sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0))
          : [];

        // Deduplicate: one entry per name (keep earliest joinedAt), also dedup by id
        const seenIds = new Set();
        const seenNames = new Map();
        playersList.forEach(player => {
          if (!player.id || seenIds.has(player.id)) return;
          seenIds.add(player.id);
          const key = (player.name || '').trim().toLowerCase();
          if (!seenNames.has(key)) {
            seenNames.set(key, player);
          } else {
            // Remove the duplicate (later entry) from Firebase
            remove(ref(db, `rooms/${roomCode}/players/${player.id}`));
          }
        });
        const dedupedPlayers = Array.from(seenNames.values()).sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));

        setPlayers(dedupedPlayers);
        setGameSettings(roomData.settings);

        // Sync current player's ready status and update playerDataRef with latest data
        if (playerDataRef.current) {
          // Find by id first, then fall back to name match (in case dedup changed the id)
          let me = dedupedPlayers.find(p => p.id === playerDataRef.current.id);
          if (!me) {
            const key = (playerDataRef.current.name || '').trim().toLowerCase();
            me = dedupedPlayers.find(p => (p.name || '').trim().toLowerCase() === key);
            if (me) playerDataRef.current = me;
          }
          if (me) {
            playerDataRef.current = { ...playerDataRef.current, ...me };
            setIsReady(!!me.isReady);
          }
        }

        if (roomData.countdown !== null && roomData.countdown !== undefined) {
          setCountdown(roomData.countdown);
          if (roomData.countdown === 0) {
            const canvasState = {
              players: dedupedPlayers,
              gameSettings: roomData.settings,
              roomCode,
              currentPlayer: playerDataRef.current
            };
            localStorage.setItem('drawingGameState', JSON.stringify(canvasState));
            navigate('/canvas', { state: canvasState });
          }
        } else {
          setCountdown(null);
        }
      } else if (isInitialized) {
        setError('Room no longer exists');
      }
    });

    return () => unsubscribe();
  }, [location.state, navigate]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(gameCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleReady = async () => {
    if (!gameCode || !playerDataRef.current) return;

    const newReadyState = !isReady;
    setIsReady(newReadyState);

    await update(ref(db, `rooms/${gameCode}/players/${playerDataRef.current.id}`), {
      isReady: newReadyState
    });
  };

  const startGame = async () => {
    if (isHost && gameCode && players.length >= 1) {
      // Check if all players are ready
      if (!allPlayersReady) {
        setError('Waiting for all players to be ready!');
        setTimeout(() => setError(''), 3000);
        return;
      }
      
      const roomRef = ref(db, `rooms/${gameCode}`);

      // Start countdown from 5
      await update(roomRef, { countdown: 5 });

      // Countdown timer
      let count = 5;
      const countdownInterval = setInterval(async () => {
        count--;
        if (count >= 0) {
          await update(roomRef, { countdown: count });
        }
        if (count < 0) {
          clearInterval(countdownInterval);
        }
      }, 1000);
    }
  };

  const displayPlayers = players.length > 0 ? players : [];

  // Show loading state
  if (loading && !error) {
    return (
      <div className="game-container">
        <style>{`
          .game-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .loading-spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'white', fontSize: '1.2rem' }}>Loading game lobby...</p>
        </div>
      </div>
    );
  }

  // Show error if exists
  if (error) {
    return (
      <div className="game-container">
        <style>{`
          .game-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}</style>
        <div style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌ Error: {error}</h2>
          <p style={{ fontSize: '1.1rem' }}>Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          overflow-x: hidden;
        }

        .game-container {
          min-height: 100vh;
          background: #0f0c29;
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          padding: 2rem;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: relative;
          overflow: hidden;
        }

        .content-wrapper {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
        }

        .header {
          text-align: center;
          margin-bottom: 3rem;
          animation: slideDown 0.8s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .header h1 {
          color: white;
          font-size: 3.5rem;
          font-weight: 900;
          text-shadow: 
            0 0 20px rgba(255,255,255,0.5),
            0 0 40px rgba(120, 119, 198, 0.6),
            0 5px 10px rgba(0,0,0,0.3);
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          letter-spacing: 2px;
        }

        .subtitle {
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.2rem;
          font-weight: 500;
          letter-spacing: 1px;
        }

        .main-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .code-section {
          background: rgba(15, 12, 41, 0.6);
          border: 2px solid rgba(120, 119, 198, 0.3);
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.4),
            0 0 80px rgba(120, 119, 198, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
        }

        .code-label {
          font-size: 1.3rem;
          color: #8b87e8;
          font-weight: 700;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .code-display {
          background: linear-gradient(135deg, rgba(120, 119, 198, 0.4) 0%, rgba(78, 205, 196, 0.3) 100%);
          padding: 2rem;
          border-radius: 16px;
          border: 2px solid rgba(120, 119, 198, 0.4);
          margin-bottom: 1.5rem;
        }

        .code-text {
          font-size: 3rem;
          font-weight: 900;
          color: white;
          letter-spacing: 0.5rem;
          text-shadow: 
            0 0 20px rgba(255, 255, 255, 0.5),
            0 2px 10px rgba(0,0,0,0.5);
          font-family: 'Courier New', monospace;
          text-align: center;
        }

        .copy-button {
          background: linear-gradient(135deg, #7877c6 0%, #5856a6 100%);
          border: 2px solid rgba(255, 255, 255, 0.2);
          padding: 1rem 2rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.7rem;
          font-weight: 700;
          color: white;
          width: 100%;
          font-size: 1.1rem;
        }

        .copy-button:hover {
          transform: translateY(-3px);
          background: linear-gradient(135deg, #8b87e8 0%, #6b69c6 100%);
        }

        .players-section {
          background: rgba(15, 12, 41, 0.6);
          border: 2px solid rgba(120, 119, 198, 0.3);
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.4),
            0 0 80px rgba(120, 119, 198, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
        }

        .players-header {
          font-size: 1.8rem;
          color: white;
          font-weight: 800;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .players-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .player-card {
          background: linear-gradient(135deg, rgba(120, 119, 198, 0.15) 0%, rgba(78, 205, 196, 0.08) 100%);
          border: 2px solid rgba(120, 119, 198, 0.3);
          border-radius: 16px;
          padding: 1rem 1.5rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .player-card.ready {
          border-color: rgba(34, 197, 94, 0.6);
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%);
        }

        .player-avatar {
          font-size: 2rem;
          flex-shrink: 0;
          width: 2.5rem;
          text-align: center;
        }

        .player-info {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          overflow: visible;
        }

        .player-name {
          font-size: 1rem;
          font-weight: 700;
          color: white;
          word-break: break-word;
        }

        .player-badges {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.25rem 0.6rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .badge-host {
          background: rgba(251, 191, 36, 0.2);
          border: 1px solid rgba(251, 191, 36, 0.5);
          color: #fbbf24;
        }

        .badge-player {
          background: rgba(120, 119, 198, 0.2);
          border: 1px solid rgba(120, 119, 198, 0.4);
          color: #a5b4fc;
        }

        .badge-ready {
          background: rgba(34, 197, 94, 0.2);
          border: 1px solid rgba(34, 197, 94, 0.5);
          color: #4ade80;
        }

        .badge-waiting {
          background: rgba(156, 163, 175, 0.15);
          border: 1px solid rgba(156, 163, 175, 0.3);
          color: #9ca3af;
        }

        .ready-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4ade80;
          animation: pulse-dot 1.5s infinite;
        }

        .waiting-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #9ca3af;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .start-button {
          width: 60%;
          max-width: 500px;
          background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
          border: 3px solid rgba(255, 255, 255, 0.3);
          padding: 1.8rem;
          border-radius: 20px;
          color: white;
          font-weight: 900;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.4s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin: 0 auto;
        }

        .start-button:hover {
          transform: translateY(-5px) scale(1.02);
        }

        .waiting-message {
          width: 60%;
          max-width: 500px;
          background: rgba(255, 107, 107, 0.1);
          border: 2px solid rgba(255, 107, 107, 0.3);
          padding: 1.8rem;
          border-radius: 20px;
          color: white;
          font-weight: 900;
          font-size: 1.2rem;
          text-align: center;
          margin: 0 auto;
        }


        .start-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 1024px) {
          .main-grid {
            grid-template-columns: 1fr;
          }
          .players-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="content-wrapper">
        <div className="header">
          <h1>
            <Gamepad2 size={52} />
            GAME LOBBY
            <Gamepad2 size={52} />
          </h1>
          <p className="subtitle">Get ready for an epic battle!</p>
        </div>

        <div className="main-grid">
          <div className="code-section">
            <div className="code-label">
              <Zap size={26} />
              Your Game Code
            </div>
            <div className="code-display">
              <div className="code-text">{gameCode}</div>
            </div>
            <button className="copy-button" onClick={copyToClipboard}>
              {copied ? <Check size={24} /> : <Copy size={24} />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          <div className="players-section">
            <div className="players-header">
              <Users size={32} />
              Players ({displayPlayers.length})
            </div>
            <div className="players-grid">
              {displayPlayers.map((player) => (
                <div key={player.id} className={`player-card ${player.isReady ? 'ready' : ''}`}>
                  <div className="player-avatar">{player.avatar}</div>
                  <div className="player-info">
                    <span style={{ color: 'white', fontWeight: '700', fontSize: '1rem' }}>
                      {player.name || player.id}{player.isHost ? ' 👑' : ''}
                    </span>
                    {player.isReady ? (
                      <span className="badge badge-ready">
                        <span className="ready-dot"></span>
                        Ready
                      </span>
                    ) : (
                      <span className="badge badge-waiting">
                        <span className="waiting-dot"></span>
                        Waiting
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          {/* Ready button for all players including host */}
          <button 
            className="ready-button" 
            onClick={toggleReady}
            style={{
              padding: '1rem 2rem',
              borderRadius: '1rem',
              border: 'none',
              background: isReady ? '#22c55e' : 'rgba(139, 92, 246, 0.5)',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isReady ? '✓ Ready!' : 'Click when Ready'}
          </button>
          
          {isHost ? (
            allPlayersReady ? (
              <button 
                className="start-button" 
                onClick={startGame} 
                style={{
                  padding: '1rem 2rem',
                  borderRadius: '1rem',
                  border: 'none',
                  background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s ease',
                  width: 'auto',
                  minWidth: '250px'
                }}
              >
                <Play size={24} fill="white" />
                Start Game Now
              </button>
            ) : null
          ) : (
            <div className="waiting-message">
              {allPlayersReady ? 'All players ready! Waiting for host...' : 'Waiting for players to be ready...'}
            </div>
          )}
        </div>

        <CountdownOverlay countdown={countdown} />
      </div>
    </div>
  );
};

export default GameLobby;