import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy, Home, RotateCcw } from 'lucide-react';
import { db } from '../../firebase';
import { ref, set, update, onValue } from 'firebase/database';
import styles from './GameOverPage.module.css';

const GameOverPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const players = location.state?.players || [];
  const roomCode = location.state?.roomCode;
  const gameSettings = location.state?.gameSettings;
  const currentPlayer = location.state?.currentPlayer;

  useEffect(() => {
    if (!roomCode || !currentPlayer) return;
    const roomRef = ref(db, `rooms/${roomCode}/restartSignal`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        navigate('/gamecode', {
          state: {
            roomCode,
            playerName: currentPlayer.name,
            isHost: currentPlayer.isHost || false,
            formData: currentPlayer.isHost ? { name: currentPlayer.name, rounds: gameSettings?.rounds || '5' } : null
          }
        });
      }
    });
    return () => unsubscribe();
  }, [roomCode, currentPlayer, navigate, gameSettings]);

  // Sort players by score and find winner
  const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
  const winner = sortedPlayers.length > 0 ? sortedPlayers[0] : null;

  const handleRestart = async () => {
    if (!roomCode || !currentPlayer) return;

    const roomRef = ref(db, `rooms/${roomCode}`);
    
    try {
      const updates = {};
      players.forEach(player => {
        updates[`players/${player.id}/score`] = 0;
        updates[`players/${player.id}/isReady`] = false;
      });
      
      await update(roomRef, {
        ...updates,
        gameStarted: false,
        countdown: null,
        restartSignal: Date.now()
      });
      
      await set(ref(db, `rooms/${roomCode}/gameState`), null);
      await set(ref(db, `rooms/${roomCode}/drawing`), null);
      await set(ref(db, `rooms/${roomCode}/chat`), null);
      await set(ref(db, `rooms/${roomCode}/playerDrawings`), null);
      
    } catch (error) {
      console.error('Error restarting game:', error);
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className={styles.gameOverContainer}>
      <div className={styles.gameOverWrapper}>
        {/* Winner Section */}
        <div className={styles.winnerSection}>
          <Trophy className={styles.trophyIcon} />
          <h1 className={styles.winnerTitle}>Game Over!</h1>
          {winner && (
            <div className={styles.winnerCard}>
              <span className={styles.winnerAvatar}>{winner.avatar}</span>
              <div>
                <h2 className={styles.winnerName}>{winner.name}</h2>
                <p className={styles.winnerScore}>{winner.score || 0} points</p>
              </div>
            </div>
          )}
        </div>

        {/* Players List */}
        <div className={styles.playersSection}>
          <h3 className={styles.playersTitle}>Final Scores</h3>
          <div className={styles.playersList}>
            {sortedPlayers.map((player, index) => (
              <div key={player.id} className={`${styles.playerCard} ${winner && player.id === winner.id ? styles.playerWinner : ''}`}>
                <div className={styles.playerRank}>#{index + 1}</div>
                <span className={styles.playerAvatar}>{player.avatar}</span>
                <div className={styles.playerInfo}>
                  <p className={styles.playerName}>{player.name}</p>
                  <p className={styles.playerScore}>{player.score || 0} points</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionsSection}>
          <button onClick={handleGoBack} className={styles.homeButton}>
            <Home />
            Go to Home
          </button>
          <button onClick={handleRestart} className={styles.restartButton}>
            <RotateCcw />
            Restart Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverPage;