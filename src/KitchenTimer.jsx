import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import './KitchenTimer.css';
import alarmSoundFile from './assets/alarm-clock-01.mp3';

const States = {
  IDLE_ZERO: 'idle_zero',
  COUNTING_DOWN: 'counting_down',
  COUNTING_UP: 'counting_up',
  COUNT_DOWN_PAUSED: 'count_down_paused',
  COUNT_UP_PAUSED: 'count_up_paused',
  FINISH_ALARM: 'finish_alarm',
};

const timeAtom = atomWithStorage('time', 0);
const currentStateAtom = atomWithStorage('currentState', States.IDLE_ZERO);

const KitchenTimer = () => {
  const [time, setTime] = useAtom(timeAtom);
  const [currentState, setCurrentState] = useAtom(currentStateAtom);

  useEffect(() => {
    const minutes = String(Math.floor(time / 60)).padStart(2, '0');
    const seconds = String(time % 60).padStart(2, '0');
    document.title = `${minutes}:${seconds}`;
  }, [time]);

  useEffect(() => {
    let timer = null;

    if (currentState === States.COUNTING_DOWN || currentState === States.COUNTING_UP) {
      timer = setInterval(() => {
        setTime((prevTime) => {
          if (currentState === States.COUNTING_DOWN) {
            if (prevTime <= 0) {
              clearInterval(timer);
              setCurrentState(States.FINISH_ALARM);
              playAudio(alarmSoundFile, 3000);
              return 0;
            }
            return prevTime - 1;
          } else if (currentState === States.COUNTING_UP) {
            return prevTime + 1;
          }
          return prevTime;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentState, setTime]);


  useEffect(() => {
    if (currentState === States.FINISH_ALARM) {
      playAudio(alarmSoundFile, 3000);
    }
  }, [currentState]);

  const playAudio = (audioFile, duration) => {
    const audio = new Audio(audioFile);
    audio.play();
    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, duration);
  };

  const incrementMinutes = () => setTime((prev) => prev + 60);
  const decrementMinutes = () => setTime((prev) => Math.max(prev - 60, 0));
  const incrementSeconds = () => setTime((prev) => prev + 1);
  const decrementSeconds = () => setTime((prev) => Math.max(prev - 1, 0));

  const handleScroll = (e, isMinutes) => {
    if (isMinutes) {
      e.deltaY < 0 ? incrementMinutes() : decrementMinutes();
    } else {
      e.deltaY < 0 ? incrementSeconds() : decrementSeconds();
    }
  };

  const toggleTimer = () => {
    if ([States.IDLE_ZERO, States.COUNT_DOWN_PAUSED, States.COUNT_UP_PAUSED].includes(currentState)) {
      setCurrentState(time > 0 ? States.COUNTING_DOWN : States.COUNTING_UP);
    } else if (currentState === States.COUNTING_DOWN) {
      setCurrentState(States.COUNT_DOWN_PAUSED);
    } else if (currentState === States.COUNTING_UP) {
      setCurrentState(States.COUNT_UP_PAUSED);
    }
  };

  const clearTimer = () => {
    setCurrentState(States.IDLE_ZERO);
    setTime(0);
  };

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <div className="kitchen-timer">
      <div className="time-display">
        <div className="time-section" onWheel={(e) => handleScroll(e, true)}>
          <button className="button" onClick={incrementMinutes}>▲</button>
          <span>{String(minutes).padStart(2, '0')}</span>
          <button className="button" onClick={decrementMinutes}>▼</button>
        </div>
        <span>:</span>
        <div className="time-section" onWheel={(e) => handleScroll(e, false)}>
          <button className="button" onClick={incrementSeconds}>▲</button>
          <span>{String(seconds).padStart(2, '0')}</span>
          <button className="button" onClick={decrementSeconds}>▼</button>
        </div>
      </div>
      <div className="current-state">
        Current State: <strong>{currentState.replace('_', ' ').toUpperCase()}</strong>
      </div>
      <button className="start-stop-button" onClick={toggleTimer}>
        {currentState === States.COUNTING_DOWN || currentState === States.COUNTING_UP ? 'Pause' : 'Start'}
      </button>
      <button className="clear-button" onClick={clearTimer}>
        Clear
      </button>
    </div>
  );
};

export default KitchenTimer;