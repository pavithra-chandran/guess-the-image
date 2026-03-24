import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Play, Users, Target, Zap, Crown, Sparkles, Trophy } from 'lucide-react';
import { db } from '../../firebase';
import { ref, onValue, get } from 'firebase/database';
import styles from './JoinPage.module.css';

const JoinPage = () => {
  const navigate = useNavigate();
  const [joinForm, setJoinForm] = useState({
    name: '',
    roomCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [particles, setParticles] = useState([]);
  const [players, setPlayers] = useState([]);
  const [roomExists, setRoomExists] = useState(false);

  useEffect(() => {
    const newParticles = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const code = joinForm.roomCode.trim().toUpperCase();
    if (code.length >= 6) {
      // Check if room exists in Firebase
      const roomRef = ref(db, `rooms/${code}`);
      get(roomRef).then((snapshot) => {
        if (snapshot.exists()) {
          const roomData = snapshot.val();
          console.log('Room data:', roomData);
          setRoomExists(true);
          // Convert players object to array
          const playersList = roomData.players ? Object.values(roomData.players) : [];
          console.log('Players list:', playersList);
          setPlayers(playersList);
          
          // Listen for real-time updates
          const unsubscribe = onValue(roomRef, (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              console.log('Real-time room data:', data);
              const playersData = data.players ? Object.values(data.players) : [];
              console.log('Real-time players:', playersData);
              setPlayers(playersData);
            }
          });
          
          return () => unsubscribe();
        } else {
          setRoomExists(false);
          setPlayers([]);
        }
      }).catch((error) => {
        console.error('Error checking room:', error);
        setRoomExists(false);
        setPlayers([]);
      });
    } else {
      setPlayers([]);
      setRoomExists(false);
    }
  }, [joinForm.roomCode]);

  const handleSubmit = () => {
    if (joinForm.name.trim() && joinForm.roomCode.trim() && roomExists) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        // Navigate to gamecode with room code
        navigate('/gamecode', {
          state: {
            roomCode: joinForm.roomCode.toUpperCase(),
            playerName: joinForm.name.trim(),
            isHost: false
          }
        });
      }, 1500);
    }
  };

  const handleBack = () => {
    navigate('/'); // Updated to navigate to index
  };

  return (
    <div className={styles.container}>
      {/* Particles */}
      <div className={styles.particlesContainer}>
        {particles.map(particle => (
          <div
            key={particle.id}
            className={styles.particle}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              animation: `float ${particle.speed * 3}s ease-in-out infinite`
            }}
          />
        ))}
      </div>

      {/* Grid Overlay */}
      <div className={styles.gridOverlay} />

      {/* Back Button */}
      <button onClick={handleBack} className={styles.backButton}>
        <ArrowLeft size={20} />
        <span className={styles.backText}>Back</span>
      </button>

      {/* Form Container */}
      <div className={styles.formContainer}>
        <div className={styles.glowEffect} />

        {/* Header */}
        <div className={styles.formHeader}>
          <div className={styles.formIcon}>
            <Users className={styles.formIconSvg} />
          </div>
        </div>

        {/* Form Content */}
        <div className={styles.formContent}>
          {/* Name and Room Code Container */}
          <div className={styles.rowContainer}>
            {/* Name Input */}
            <div className={styles.inputField}>
              <label className={styles.inputLabel}>
                <Users size={16} className={styles.iconUsersName} />
                Your Name
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  value={joinForm.name}
                  onChange={(e) => setJoinForm({ ...joinForm, name: e.target.value })}
                  placeholder="Enter your name"
                  maxLength={20}
                  className={styles.formInput}
                />
                <div className={styles.inputGlow} />
              </div>
            </div>

            {/* Room Code Input */}
            <div className={styles.inputField}>
              <label className={styles.inputLabel}>
                <Target size={16} className={styles.iconTarget} />
                Room Code
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  value={joinForm.roomCode}
                  onChange={(e) => setJoinForm({ ...joinForm, roomCode: e.target.value })}
                  placeholder="Enter room code"
                  maxLength={10}
                  className={styles.formInput}
                />
                <div className={styles.inputGlow} />
              </div>
            </div>
          </div>
        </div>



        {/* Buttons */}
        <div className={styles.formButtons}>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !joinForm.name || !joinForm.roomCode}
            className={`${styles.primaryButton} ${isLoading ? styles.loading : ''}`}
          >
            <div className={styles.buttonContent}>
              {isLoading ? (
                <div className={styles.loadingSpinner} />
              ) : (
                <Play size={20} />
              )}
              <span>{isLoading ? 'Joining...' : 'Join Game'}</span>
            </div>
          </button>

          <button onClick={handleBack} className={styles.secondaryButton}> {/* Updated onClick */}
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinPage;
