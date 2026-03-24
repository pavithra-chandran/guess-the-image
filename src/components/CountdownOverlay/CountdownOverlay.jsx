import React from 'react';
import styles from './CountdownOverlay.module.css';

const CountdownOverlay = ({ countdown }) => {
  if (countdown === null || countdown <= 0) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.countdownContainer}>
        <div className={styles.countdownNumber}>
          {countdown}
        </div>
        <div className={styles.countdownText}>
          Game starting...
        </div>
      </div>
    </div>
  );
};

export default CountdownOverlay;