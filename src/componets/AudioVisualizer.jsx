import React, { useEffect, useRef } from 'react';
import {audio, getAnalyser} from '../redux/slice/playerSlice'
import {useSelector} from 'react-redux';
import store from "../redux/store";

const AudioVisualizer = () => {
    audio.crossOrigin = "anonymous";
    const canvasRef = useRef(null);
    const animationFrameRef = useRef(null);
    const isPlaying = useSelector(state => state.persistedReducer.player.isPlaying);
    
    useEffect(() => {
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;
        const barWidth = (WIDTH / 256) * 2.5;

        const renderFrame = () => {//функція для малювання візуалізації:
            const bufferLength = getAnalyser()?.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            getAnalyser()?.getByteFrequencyData(dataArray);

            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, WIDTH, HEIGHT);

            let x = 0;
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = dataArray[i];
                const r = barHeight + (25 * (i / bufferLength));
                const g = 250 * (i / bufferLength);
                const b = 50;
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }

            animationFrameRef.current = requestAnimationFrame(renderFrame);
        };
    
       
        const unsubscribe = store.subscribe(() => {
            if(isPlaying) {
                renderFrame();
            }
        })
         
     
        return () => {//відключаємо всі з'єднання та закриваємо аудіо контекст
            cancelAnimationFrame(animationFrameRef.current);
            audio.removeEventListener('play',  renderFrame);
            unsubscribe();
        };
    }, [audio, isPlaying]);

    return (
        <div>
            <canvas ref={canvasRef} width={1600} height={200}></canvas>
        </div>
    );
};

export default AudioVisualizer;

