import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Play, Users, Target, Zap, Crown, Sparkles, Trophy } from 'lucide-react';
import styles from './CreatePage.module.css';

const CreatePage = () => {
  const navigate = useNavigate();
  const [createForm, setCreateForm] = useState({
    name: '',
    rounds: '5',
    scoringRule: 'others'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [particles, setParticles] = useState([]);

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

  const handleSubmit = () => {
    if (!createForm.name.trim()) return;
    setIsLoading(true);
    // Generate random room code
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to gamecode with room code and form data
      navigate('/gamecode', {
        state: {
          roomCode,
          formData: createForm,
          isHost: true
        }
      });
    }, 1500);
  };

  const handleBack = () => {
    navigate('/');
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
              animation: `float${particle.id} ${particle.speed * 3}s ease-in-out infinite`
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
            <Pencil size={window.innerWidth < 480 ? 28 : 40} strokeWidth={3} />
          </div>
          
        </div>

        {/* Form Content */}
        <div className={styles.formContent}>
          {/* Name and Rounds Container */}
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
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Enter your name"
                  maxLength={20}
                  className={styles.formInput}
                />
                <div className={styles.inputGlow} />
              </div>
            </div>

            {/* Number of Rounds */}
            <div className={styles.inputField}>
              <label className={styles.inputLabel}>
                <Target size={16} className={styles.iconTarget} />
                Number of Rounds
              </label>
              <div className={styles.selectWrapper}>
                <select
                  value={createForm.rounds}
                  onChange={(e) => setCreateForm({ ...createForm, rounds: e.target.value })}
                  className={styles.formSelect}
                >
                  <option value="5">5 Rounds - Quick Game</option>
                  <option value="7">7 Rounds - Standard</option>
                  <option value="10">10 Rounds - Epic Battle</option>
                </select>
                <div className={styles.selectArrow} />
              </div>
            </div>
          </div>

          
        </div>

        {/* Buttons */}
        <div className={styles.formButtons}>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !createForm.name}
            className={`${styles.primaryButton} ${isLoading ? styles.loading : ''}`}
          >
            <div className={styles.buttonContent}>
              {isLoading ? (
                <div className={styles.loadingSpinner} />
              ) : (
                <Play size={20} />
              )}
              <span>{isLoading ? 'Creating...' : 'Create Room'}</span>
            </div>
          </button>

          <button onClick={handleBack} className={styles.secondaryButton}>
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
