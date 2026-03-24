import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, Zap } from 'lucide-react';
import styles from './CountdownPage.module.css';

const CountdownPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(5);
  const roomCode = location.state?.roomCode;
  const players = location.state?.players || [];
  const gameSettings = location.state?.gameSettings;
  const currentPlayer = location.state?.currentPlayer;

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Navigate to canvas when countdown reaches 0
      navigate('/canvas', {
        state: {
          players,
          gameSettings,
          roomCode,
          currentPlayer
        }
      });
    }
  }, [countdown, navigate, players, gameSettings, roomCode, currentPlayer]);

  return (
    <div className={styles.countdownContainer}>
      <div className={styles.countdownWrapper}>
        <div className={styles.countdownContent}>
          <div className={styles.iconContainer}>
            <Zap className={styles.zapIcon} />
          </div>

          <h1 className={styles.title}>Get Ready!</h1>

          <div className={styles.countdownDisplay}>
            <div className={styles.numberCircle}>
              <span className={styles.countdownNumber}>{countdown}</span>
            </div>
          </div>

          <p className={styles.subtitle}>Game starting in...</p>

          <div className={styles.playersPreview}>
            <h3 className={styles.playersTitle}>Players Ready:</h3>
            <div className={styles.playersList}>
              {players.map((player, index) => (
                <div key={player.id} className={styles.playerItem}>
                  <span className={styles.playerAvatar}>{player.avatar}</span>
                  <span className={styles.playerName}>{player.name}</span>
                  {index === 0 && <span className={styles.firstDrawer}>Draws First</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownPage;