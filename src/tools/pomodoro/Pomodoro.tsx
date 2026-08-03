import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX, CheckCircle, Settings, Bell } from 'lucide-react';
import confetti from 'canvas-confetti';

type Mode = 'work' | 'shortBreak' | 'longBreak';

interface ModeConfig {
  name: string;
  defaultTime: number; // in seconds
  color: string;
}

const MODES: Record<Mode, ModeConfig> = {
  work: { name: 'Focus Time', defaultTime: 25 * 60, color: '#6366f1' },
  shortBreak: { name: 'Short Break', defaultTime: 5 * 60, color: '#10b981' },
  longBreak: { name: 'Long Break', defaultTime: 15 * 60, color: '#06b6d4' },
};

export const PomodoroTool: React.FC = () => {
  const [mode, setMode] = useState<Mode>('work');
  const [workTime, setWorkTime] = useState<number | string>(25);
  const [shortBreakTime, setShortBreakTime] = useState<number | string>(5);
  const [longBreakTime, setLongBreakTime] = useState<number | string>(15);

  const getSanitizedMinutes = (val: number | string, fallback: number): number => {
    if (val === '') return fallback;
    const parsed = typeof val === 'number' ? val : parseInt(val, 10);
    return isNaN(parsed) || parsed <= 0 ? fallback : parsed;
  };

  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Store target end timestamp (in ms) to prevent tab throttling slowdowns
  const targetEndTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  // Request browser desktop notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Web Audio API sound chime
  const playAlertSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }, [soundEnabled]);

  const sendDesktopNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon: './favicon.svg' });
      } catch (e) {
        console.warn('Desktop notification error', e);
      }
    }
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Update browser tab title with current timer
  useEffect(() => {
    if (isRunning) {
      document.title = `(${formatTime(timeLeft)}) ${MODES[mode].name} - Utility Hub`;
    } else {
      document.title = 'Utility Hub - Fast, Private Browser Tools';
    }
    return () => {
      document.title = 'Utility Hub - Fast, Private Browser Tools';
    };
  }, [timeLeft, isRunning, mode]);

  // Handle session completion logic
  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    playAlertSound();

    if (mode === 'work') {
      const newCount = completedSessions + 1;
      setCompletedSessions(newCount);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
      sendDesktopNotification('Focus Session Complete!', 'Great job! Time to take a well-deserved break.');

      if (newCount % 4 === 0) {
        setMode('longBreak');
      } else {
        setMode('shortBreak');
      }
    } else {
      sendDesktopNotification('Break Over!', 'Time to get back to focus time.');
      setMode('work');
    }
  }, [mode, completedSessions, playAlertSound, sendDesktopNotification]);

  // Sync initial mode duration when idle
  useEffect(() => {
    if (!isRunning) {
      if (mode === 'work') setTimeLeft(getSanitizedMinutes(workTime, 25) * 60);
      else if (mode === 'shortBreak') setTimeLeft(getSanitizedMinutes(shortBreakTime, 5) * 60);
      else if (mode === 'longBreak') setTimeLeft(getSanitizedMinutes(longBreakTime, 15) * 60);
    }
  }, [mode, workTime, shortBreakTime, longBreakTime, isRunning]);

  // Wall-Clock Timestamp Timer Tick (Resistant to browser tab background throttling)
  useEffect(() => {
    if (isRunning) {
      if (!targetEndTimeRef.current) {
        targetEndTimeRef.current = Date.now() + timeLeft * 1000;
      }

      const updateTimer = () => {
        if (!targetEndTimeRef.current) return;
        const now = Date.now();
        const diffMs = targetEndTimeRef.current - now;
        const remainingSecs = Math.max(0, Math.ceil(diffMs / 1000));

        setTimeLeft(remainingSecs);

        if (remainingSecs <= 0) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          handleSessionComplete();
        }
      };

      // Tick every 250ms for accuracy
      timerIntervalRef.current = window.setInterval(updateTimer, 250);

      // Handle tab visibility change (instant catch-up when tab comes back into focus)
      const handleVisibilityChange = () => {
        if (!document.hidden && isRunning && targetEndTimeRef.current) {
          updateTimer();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else {
      targetEndTimeRef.current = null;
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  }, [isRunning, handleSessionComplete]);

  const handleStartPause = () => {
    if (isRunning) {
      // Pausing: save exact time left and clear target end time
      setIsRunning(false);
      targetEndTimeRef.current = null;
    } else {
      // Starting: set new target end timestamp based on current time left
      targetEndTimeRef.current = Date.now() + timeLeft * 1000;
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    if (mode === 'work') setTimeLeft(getSanitizedMinutes(workTime, 25) * 60);
    else if (mode === 'shortBreak') setTimeLeft(getSanitizedMinutes(shortBreakTime, 5) * 60);
    else if (mode === 'longBreak') setTimeLeft(getSanitizedMinutes(longBreakTime, 15) * 60);
  };

  const handleSkip = () => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    if (mode === 'work') setMode('shortBreak');
    else setMode('work');
  };

  const totalModeDuration =
    (mode === 'work'
      ? getSanitizedMinutes(workTime, 25)
      : mode === 'shortBreak'
      ? getSanitizedMinutes(shortBreakTime, 5)
      : getSanitizedMinutes(longBreakTime, 15)) * 60;
  const progressPercent = Math.min(100, Math.max(0, ((totalModeDuration - timeLeft) / (totalModeDuration || 1)) * 100));

  return (
    <div className="tool-container" style={{ maxWidth: '520px', margin: '0 auto' }}>
      {/* Mode Selector Tabs */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          backgroundColor: 'var(--bg-subtle)',
          padding: '0.35rem',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setIsRunning(false);
              targetEndTimeRef.current = null;
              setMode(m);
            }}
            style={{
              flex: 1,
              padding: '0.6rem 0.5rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: mode === m ? 'var(--bg-card)' : 'transparent',
              color: mode === m ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontWeight: mode === m ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: mode === m ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            {MODES[m].name}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div
        style={{
          position: 'relative',
          width: '260px',
          height: '260px',
          margin: '1rem auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="260" height="260" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="130"
            cy="130"
            r="110"
            stroke="var(--border-color)"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="130"
            cy="130"
            r="110"
            stroke={MODES[mode].color}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 110}
            strokeDashoffset={(2 * Math.PI * 110 * (100 - (isNaN(progressPercent) ? 0 : progressPercent))) / 100}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
          />
        </svg>

        <div
          style={{
            position: 'absolute',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '3.25rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              lineHeight: 1,
            }}
          >
            {formatTime(timeLeft)}
          </span>
          <span
            style={{
              fontSize: '0.85rem',
              color: MODES[mode].color,
              fontWeight: 600,
              marginTop: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {MODES[mode].name}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="btn-secondary"
          style={{ padding: '0.75rem', borderRadius: 'var(--radius-full)' }}
          title={soundEnabled ? 'Mute Chime' : 'Unmute Chime'}
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>

        <button
          onClick={handleStartPause}
          className="btn-primary"
          style={{
            padding: '0.85rem 2rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '1.1rem',
            minWidth: '140px',
            backgroundColor: MODES[mode].color,
          }}
        >
          {isRunning ? <Pause size={22} /> : <Play size={22} />}
          {isRunning ? 'Pause' : 'Start'}
        </button>

        <button
          onClick={handleReset}
          className="btn-secondary"
          style={{ padding: '0.75rem', borderRadius: 'var(--radius-full)' }}
          title="Reset Timer"
        >
          <RotateCcw size={20} />
        </button>

        <button
          onClick={handleSkip}
          className="btn-secondary"
          style={{ padding: '0.75rem', borderRadius: 'var(--radius-full)' }}
          title="Skip Session"
        >
          <SkipForward size={20} />
        </button>
      </div>

      {/* Stats & Settings Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1rem',
          marginTop: '0.5rem',
        }}
      >
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="btn-secondary"
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
        >
          <Settings size={14} /> Settings
        </button>
      </div>

      {/* Custom Time Settings Panel */}
      {showSettings && (
        <div
          style={{
            backgroundColor: 'var(--bg-subtle)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            marginTop: '0.5rem',
          }}
        >
          <div className="tool-input-group">
            <label className="tool-label">Focus (min)</label>
            <input
              type="number"
              min="1"
              max="90"
              value={workTime}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  setWorkTime('');
                } else {
                  const parsed = parseInt(val, 10);
                  setWorkTime(isNaN(parsed) ? '' : parsed);
                }
              }}
              onBlur={() => {
                if (workTime === '' || Number(workTime) < 1) {
                  setWorkTime(25);
                }
              }}
              className="tool-input-field"
            />
          </div>

          <div className="tool-input-group">
            <label className="tool-label">Short (min)</label>
            <input
              type="number"
              min="1"
              max="30"
              value={shortBreakTime}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  setShortBreakTime('');
                } else {
                  const parsed = parseInt(val, 10);
                  setShortBreakTime(isNaN(parsed) ? '' : parsed);
                }
              }}
              onBlur={() => {
                if (shortBreakTime === '' || Number(shortBreakTime) < 1) {
                  setShortBreakTime(5);
                }
              }}
              className="tool-input-field"
            />
          </div>

          <div className="tool-input-group">
            <label className="tool-label">Long (min)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={longBreakTime}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  setLongBreakTime('');
                } else {
                  const parsed = parseInt(val, 10);
                  setLongBreakTime(isNaN(parsed) ? '' : parsed);
                }
              }}
              onBlur={() => {
                if (longBreakTime === '' || Number(longBreakTime) < 1) {
                  setLongBreakTime(15);
                }
              }}
              className="tool-input-field"
            />
          </div>
        </div>
      )}
    </div>
  );
};
