import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

const timeAtom = atomWithStorage('time', 0);
const isRunningAtom = atomWithStorage('isRunning', false);
const isCountingDownAtom = atomWithStorage('isCountingDown', false);

const KitchenTimer = () => {
    const [time, setTime] = useAtom(timeAtom);
    const [isRunning, setIsRunning] = useAtom(isRunningAtom);
    const [isCountingDown, setIsCountingDown] = useAtom(isCountingDownAtom);

    const alarmSound = new Audio('https://www.soundjay.com/button/beep-07.wav'); // Free alarm sound
    const tickSound = new Audio('https://www.soundjay.com/clock/clock-ticking-1.mp3'); // Free ticking sound

    useEffect(() => {
        let timer = null;

        if (isRunning) {
            timer = setInterval(() => {
                setTime((prevTime) => {
                    if (isCountingDown) {
                        if (prevTime <= 0) {
                            clearInterval(timer);
                            setIsRunning(false);
                            alarmSound.play();
                            setTimeout(() => alarmSound.pause(), 3000); // Stop sound after 3 seconds
                            return 0;
                        }
                        return prevTime - 1;
                    } else {
                        return prevTime + 1;
                    }
                });
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isRunning, isCountingDown, setTime, setIsRunning, alarmSound]);

    useEffect(() => {
        if (time > 0 && time % (5 * 60) === 0) {
            tickSound.play();
        }
    }, [time, tickSound]);

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
        if (!isRunning) {
            setIsCountingDown(time > 0);
        }
        setIsRunning((prev) => !prev);
    };

    const clearTimer = () => {
        setIsRunning(false);
        setTime(0);
    };

    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    const styles = {
        kitchenTimer: {
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif',
            border: '2px solid black',
            borderRadius: '10px',
            padding: '20px',
            width: '300px',
            margin: '20px auto',
        },
        timeDisplay: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '2rem',
            fontFamily: '"Digital-7", monospace',
        },
        timeSection: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: '0 10px',
        },
        button: {
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
        },
        startStopButton: {
            marginTop: '20px',
            padding: '10px 20px',
            fontSize: '1rem',
            cursor: 'pointer',
        },
        clearButton: {
            marginTop: '10px',
            padding: '10px 20px',
            fontSize: '1rem',
            cursor: 'pointer',
            backgroundColor: 'red',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
        },
    };

    return (
        <div style={styles.kitchenTimer}>
            <div style={styles.timeDisplay}>
                <div style={styles.timeSection} onWheel={(e) => handleScroll(e, true)}>
                    <button style={styles.button} onClick={incrementMinutes}>▲</button>
                    <span>{String(minutes).padStart(2, '0')}</span>
                    <button style={styles.button} onClick={decrementMinutes}>▼</button>
                </div>
                <span>:</span>
                <div style={styles.timeSection} onWheel={(e) => handleScroll(e, false)}>
                    <button style={styles.button} onClick={incrementSeconds}>▲</button>
                    <span>{String(seconds).padStart(2, '0')}</span>
                    <button style={styles.button} onClick={decrementSeconds}>▼</button>
                </div>
            </div>
            <button style={styles.startStopButton} onClick={toggleTimer}>
                {isRunning ? 'Stop' : 'Start'}
            </button>
            <button style={styles.clearButton} onClick={clearTimer}>
                Clear
            </button>
        </div>
    );
};

export default KitchenTimer;