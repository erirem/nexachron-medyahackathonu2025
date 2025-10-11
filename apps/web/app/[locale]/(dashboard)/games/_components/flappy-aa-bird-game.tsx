'use client';

import { useState, useEffect, useRef, useCallback, type JSX } from 'react';

interface FlappyAABirdGameProps {
  onComplete: (score: number) => void;
  onClose: () => void;
}

interface Bird {
  x: number;
  y: number;
  velocity: number;
  size: number;
}

interface Pipe {
  x: number;
  topHeight: number;
  bottomY: number;
  width: number;
  gap: number;
  id: number; // Add unique ID for each pipe
}

export function FlappyAABirdGame({ onComplete, onClose }: FlappyAABirdGameProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'gameOver'>('waiting');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [bird, setBird] = useState<Bird>({
    x: 200,
    y: 350,
    velocity: 0,
    size: 40, // Reduced from 50 to 40 (smaller bird)
  });
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [gameSpeed, setGameSpeed] = useState(1.5); // Reduced initial speed from 2 to 1.5
  const [particles, setParticles] = useState<Array<{x: number, y: number, vx: number, vy: number, life: number}>>([]);
  const [mascotImage, setMascotImage] = useState<HTMLImageElement | null>(null);
  const [scoredPipes, setScoredPipes] = useState<Set<number>>(new Set()); // Track which pipes have been scored
  const pipeIdCounter = useRef(0); // Counter for unique pipe IDs

  const GRAVITY = 0.2; // Further reduced from 0.3 to 0.2 (much slower falling)
  const JUMP_FORCE = -6; // Reduced from -8 to -6 (gentler jump)
  const PIPE_WIDTH = 50; // Reduced from 60 to 50 (narrower pipes)
  const PIPE_GAP = 180; // Increased from 150 to 180 (bigger gap)
  const PIPE_SPACING = 350; // Increased from 300 to 350 (more space between pipes)

  // Load mascot image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setMascotImage(img);
    img.src = '/mascot.svg';
  }, []);

  // Initialize game
  const initGame = useCallback(() => {
    setBird({
      x: 200,
      y: 350,
      velocity: 0,
      size: 40, // Reduced from 50 to 40 (smaller bird)
    });
    setPipes([]);
    setScore(0);
    setGameState('waiting');
    setParticles([]);
    setGameSpeed(1.5); // Reduced initial speed from 2 to 1.5
    setScoredPipes(new Set()); // Reset scored pipes
    pipeIdCounter.current = 0; // Reset pipe ID counter
  }, []);

  // Jump function
  const jump = useCallback(() => {
    if (gameState === 'waiting') {
      setGameState('playing');
    }
    if (gameState === 'playing') {
      setBird(prev => ({ ...prev, velocity: JUMP_FORCE }));
      
      // Add particle effect
      const newParticles = Array.from({ length: 5 }, () => ({
        x: bird.x + bird.size / 2,
        y: bird.y + bird.size / 2,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 30
      }));
      setParticles(prev => [...prev, ...newParticles]);
    }
  }, [gameState, bird.x, bird.y, bird.size]);

  // Check collision
  const checkCollision = useCallback((bird: Bird, pipes: Pipe[]): boolean => {
    // Ground collision
    if (bird.y + bird.size >= 600) {
      return true;
    }

    // Pipe collision
    for (const pipe of pipes) {
      if (
        bird.x + bird.size > pipe.x &&
        bird.x < pipe.x + pipe.width &&
        (bird.y < pipe.topHeight || bird.y + bird.size > pipe.bottomY)
      ) {
        return true;
      }
    }

    return false;
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    setBird(prev => {
      const newBird = {
        ...prev,
        y: prev.y + prev.velocity,
        velocity: prev.velocity + GRAVITY,
      };

      // Check collision
      if (checkCollision(newBird, pipes)) {
        setGameState('gameOver');
        const newScore = Math.max(score, highScore);
        setHighScore(newScore);
        // Don't call onComplete here - it will be called in useEffect
        return prev;
      }

      return newBird;
    });

    // Move pipes and update score in the same state update
    setPipes(prev => {
      const newPipes = prev
        .map(pipe => ({ ...pipe, x: pipe.x - gameSpeed }))
        .filter(pipe => pipe.x + pipe.width > 0);

      // Add new pipes
      const lastPipe = newPipes[newPipes.length - 1];
      if (!lastPipe || lastPipe.x < 800 - PIPE_SPACING) {
        const topHeight = Math.random() * (500 - PIPE_GAP) + 50;
        pipeIdCounter.current += 1;
        newPipes.push({
          x: 800,
          topHeight,
          bottomY: topHeight + PIPE_GAP,
          width: PIPE_WIDTH,
          gap: PIPE_GAP,
          id: pipeIdCounter.current, // Add unique ID
        });
      }

      // Update score - check each pipe individually using the new pipes array
      let newScore = score;
      const newScoredPipes = new Set(scoredPipes);
      
      newPipes.forEach((pipe) => {
        // If pipe has passed the bird and hasn't been scored yet
        if (pipe.x + pipe.width < bird.x && !newScoredPipes.has(pipe.id)) {
          newScoredPipes.add(pipe.id);
          newScore += 1;
          console.log(`Score increased! New score: ${newScore}, Pipe ID: ${pipe.id}, Pipe X: ${pipe.x}`);
        }
      });
      
      // Update score if it changed
      if (newScore > score) {
        setScore(newScore);
        setScoredPipes(newScoredPipes);
      }

      return newPipes;
    });

    // Update particles
    setParticles(prev => 
      prev
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          life: particle.life - 1
        }))
        .filter(particle => particle.life > 0)
    );

    // Increase game speed gradually (slower progression)
    if (score > 0 && score % 8 === 0) { // Changed from every 5 points to every 8 points
      setGameSpeed(prev => Math.min(prev + 0.05, 2.5)); // Reduced speed increase from 0.1 to 0.05 and max speed from 4 to 2.5
    }
  }, [gameState, pipes, gameSpeed, bird.x, score, checkCollision, highScore, scoredPipes]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [jump]);


  // Handle game completion
  useEffect(() => {
    if (gameState === 'gameOver') {
      onComplete(score);
    }
  }, [gameState, score, onComplete]);

  // Game loop effect
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(() => {
        gameLoop();
        if (gameState === 'playing') {
          gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
      });
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, gameLoop]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 580, canvas.width, 20);

    // Draw pipes with gradient
    pipes.forEach(pipe => {
      // Top pipe
      const topGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
      topGradient.addColorStop(0, '#32CD32');
      topGradient.addColorStop(1, '#228B22');
      ctx.fillStyle = topGradient;
      ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
      
      // Bottom pipe
      const bottomGradient = ctx.createLinearGradient(pipe.x, pipe.bottomY, pipe.x + pipe.width, pipe.bottomY);
      bottomGradient.addColorStop(0, '#32CD32');
      bottomGradient.addColorStop(1, '#228B22');
      ctx.fillStyle = bottomGradient;
      ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, 600 - pipe.bottomY);
    });

    // Draw particles
    particles.forEach(particle => {
      const alpha = particle.life / 30;
      ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw bird (using mascot)
    ctx.save();
    ctx.translate(bird.x + bird.size / 2, bird.y + bird.size / 2);
    ctx.rotate(bird.velocity * 0.1);
    
    if (mascotImage) {
      // Draw mascot image scaled to bird size
      // Make the mascot slightly smaller than the collision box for better gameplay
      const mascotSize = bird.size * 0.8;
      ctx.drawImage(
        mascotImage,
        -mascotSize / 2,
        -mascotSize / 2,
        mascotSize,
        mascotSize
      );
    } else {
      // Fallback: Draw simple bird if mascot not loaded
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.ellipse(0, 0, bird.size / 2, bird.size / 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw bird head
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(0, -8, bird.size / 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-6, -10, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(6, -10, 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw beak
      ctx.fillStyle = '#FFA500';
      ctx.beginPath();
      ctx.moveTo(8, -5);
      ctx.lineTo(12, -3);
      ctx.lineTo(12, 1);
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.restore();

    // Draw score
    ctx.fillStyle = '#000';
    ctx.font = '24px Arial';
    ctx.fillText(`Skor: ${score}`, 10, 30);

    // Draw high score
    ctx.font = '16px Arial';
    ctx.fillText(`En İyi: ${highScore}`, 10, 50);

    // Draw instructions
    if (gameState === 'waiting') {
      ctx.fillStyle = '#000';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Başlamak için SPACE veya W tuşuna basın!', canvas.width / 2, canvas.height / 2);
      ctx.textAlign = 'left';
    }

    if (gameState === 'gameOver') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#fff';
      ctx.font = '32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Oyun Bitti!', canvas.width / 2, canvas.height / 2 - 20);
      
      ctx.font = '20px Arial';
      ctx.fillText(`Final Skoru: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
      ctx.fillText('Tekrar oynamak için SPACE tuşuna basın', canvas.width / 2, canvas.height / 2 + 50);
      ctx.textAlign = 'left';
    }
  }, [bird, pipes, score, highScore, gameState, particles, mascotImage]);

  const handleRestart = () => {
    initGame();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Flappy AA Kuşu</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="text-center mb-4">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border border-gray-300 rounded-lg bg-sky-200"
            onClick={jump}
          />
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            AA Kuşu'nu uçurmak için SPACE, W tuşuna basın veya tıklayın!
          </p>
          <p className="text-sm text-gray-600">
            Borulardan kaçının ve puan toplayın.
          </p>
          
          {gameState === 'gameOver' && (
            <button
              onClick={handleRestart}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Tekrar Oyna
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
