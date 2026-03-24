import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Zap, Star, Trophy, Users, Plus, Shield, Target, Sparkles } from 'lucide-react';
import styles from './HomePage.module.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [animatedStars, setAnimatedStars] = useState([]);

  useEffect(() => {
    const stars = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 3,
    }));
    setAnimatedStars(stars);

    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.backgroundElements}>
        {animatedStars.map((star) => (
          <div
            key={star.id}
            className={styles.animatedStar}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          >
            <Star size={star.size} />
          </div>
        ))}
        <div className={styles.floatingOrbs}>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={styles.floatingOrb}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${15 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div
        className={styles.dynamicGradient}
        style={{
          background: `
            radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
              rgba(147, 51, 234, 0.4) 0%, 
              rgba(59, 130, 246, 0.2) 25%, 
              transparent 50%),
            radial-gradient(circle at ${100 - mousePosition.x}% ${100 - mousePosition.y}%, 
              rgba(236, 72, 153, 0.3) 0%, 
              transparent 40%)
          `,
        }}
      />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.iconContainer}>
            <div className={styles.gamepadIcon}>
              <div className={styles.iconGlow}>
                <Gamepad2 size={80} />
              </div>
              <div className={styles.zapIcon}>
                <Zap size={24} />
              </div>
              <div className={`${styles.sparklesIcon} ${styles.sparkles1}`}>
                <Sparkles size={16} />
              </div>
              <div className={`${styles.sparklesIcon} ${styles.sparkles2}`}>
                <Sparkles size={12} />
              </div>
            </div>
          </div>

          <h1 className={styles.title}>
            <span className={styles.titleGradient}>NEXUS</span>
            <span className={styles.titleArena}> ARENA</span>
          </h1>

          <p className={styles.subtitle}>
            <span className={styles.subtitleText}>Enter the Ultimate Gaming Experience</span>
            <div className={styles.subtitleUnderline}></div>
          </p>

          <div className={styles.tagline}>
            <Trophy size={18} />
            <span>Real-time Multiplayer Action</span>
            <Trophy size={18} />
          </div>
        </div>

        <div className={styles.buttonContainer}>
          <button onClick={() => navigate('/join')} className={`${styles.gameButton} ${styles.joinButton}`}>
            <div className={styles.buttonBg}></div>
            <div className={styles.buttonContent}>
              <div className={styles.buttonIconWrapper}>
                <Users size={32} />
              </div>
              <div className={styles.buttonText}>
                <div className={styles.buttonTitle}>Join Existing Game</div>
                <div className={styles.buttonSubtitle}>Connect with friends</div>
              </div>
            </div>
            <div className={styles.buttonGlow}></div>
            <div className={styles.buttonParticles}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.particle}></div>
              ))}
            </div>
          </button>

          <button onClick={() => navigate('/create')} className={`${styles.gameButton} ${styles.createButton}`}>
            <div className={styles.buttonBg}></div>
            <div className={styles.buttonContent}>
              <div className={styles.buttonIconWrapper}>
                <Plus size={32} />
              </div>
              <div className={styles.buttonText}>
                <div className={styles.buttonTitle}>Create New Game</div>
                <div className={styles.buttonSubtitle}>Start your adventure</div>
              </div>
            </div>
            <div className={styles.buttonGlow}></div>
            <div className={styles.buttonParticles}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.particle}></div>
              ))}
            </div>
          </button>
        </div>

       
      </div>

      <div className={styles.enhancedParticles}>
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={styles.enhancedParticle}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${4 + Math.random() * 6}s`,
            }}
          />
        ))}
      </div>

      <div className={styles.bottomEffects}>
        <div className={styles.bottomGlow}></div>
        <div className={styles.bottomWaves}></div>
      </div>
    </div>
  );
};

export default HomePage;