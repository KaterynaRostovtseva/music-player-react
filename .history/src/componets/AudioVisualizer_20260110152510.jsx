import React, { useEffect, useRef, useState } from 'react';
import {audio, getAnalyser} from '../redux/slice/playerSlice'
import {useSelector} from 'react-redux';
import store from "../redux/store";
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Box } from '@mui/material';

const AudioVisualizer = () => {
    audio.crossOrigin = "anonymous";
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const canvasRef = useRef(null);
    const animationFrameRef = useRef(null);
    const isPlaying = useSelector(state => state.persistedReducer.player.isPlaying);
    const [canvasSize, setCanvasSize] = useState({ width: 1600, height: 200 });
    
    useEffect(() => {
        const updateCanvasSize = () => {
            if (!canvasRef.current) return;
            
            if (isMobile) {
                const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 320;
                const width = Math.max(viewportWidth, 320);
                const height = 50;
                
                setCanvasSize({ width, height });
                canvasRef.current.width = width;
                canvasRef.current.height = height;
                canvasRef.current.style.width = '100vw';
                canvasRef.current.style.maxWidth = '100vw';
                canvasRef.current.style.minWidth = '100vw';
                canvasRef.current.style.display = 'block';
                canvasRef.current.style.margin = '0';
                canvasRef.current.style.padding = '0';
                canvasRef.current.style.position = 'relative';
                canvasRef.current.style.left = '0';
                canvasRef.current.style.right = '0';
                canvasRef.current.style.boxSizing = 'border-box';
            } else {
                const width = 1600;
                const height = 200;
                setCanvasSize({ width, height });
                canvasRef.current.width = width;
                canvasRef.current.height = height;
                canvasRef.current.style.width = '100%';
            }
        };
        const rafId = requestAnimationFrame(() => {
            updateCanvasSize();
        });
        
        const timeoutId = setTimeout(updateCanvasSize, 150);

        let resizeObserver = null;
        if (window.ResizeObserver && canvasRef.current) {
            resizeObserver = new ResizeObserver(() => {
                updateCanvasSize();
            });
            if (canvasRef.current.parentElement) {
                resizeObserver.observe(canvasRef.current.parentElement);
            }
            if (isMobile) {
                resizeObserver.observe(document.body);
            }
        }
        
        window.addEventListener('resize', updateCanvasSize);
        window.addEventListener('orientationchange', () => {
            setTimeout(updateCanvasSize, 200);
        });
        
        return () => {
            cancelAnimationFrame(rafId);
            clearTimeout(timeoutId);
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
            window.removeEventListener('resize', updateCanvasSize);
            window.removeEventListener('orientationchange', updateCanvasSize);
        };
    }, [isMobile]);
    
    useEffect(() => {
        if (!canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        const updateSizes = () => {
            if (canvasRef.current) {
                canvasRef.current.width = canvasSize.width;
                canvasRef.current.height = canvasSize.height;
            }
        };
        
        updateSizes();
        
        const WIDTH = canvasSize.width;
        const HEIGHT = canvasSize.height;
        const barWidth = isMobile ? (WIDTH / 64) * 1.2 : (WIDTH / 256) * 2.5;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        const renderFrame = () => {
            if (!canvasRef.current || !getAnalyser()) return;
            
            const bufferLength = getAnalyser()?.frequencyBinCount || 256;
            const dataArray = new Uint8Array(bufferLength);
            getAnalyser()?.getByteFrequencyData(dataArray);

            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, WIDTH, HEIGHT);

            let x = 0;
            const skipStep = isMobile ? 3 : 1;
            const maxBars = isMobile ? Math.min(bufferLength, 48) : bufferLength;
            
            for (let i = 0; i < maxBars; i += skipStep) {
                const barHeight = dataArray[i] || 0;
                const adjustedHeight = isMobile ? (barHeight * HEIGHT / 255) * 0.8 : (barHeight * HEIGHT / 255);
                const r = barHeight + (25 * (i / maxBars));
                const g = 250 * (i / maxBars);
                const b = 50;
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x, HEIGHT - adjustedHeight, barWidth, adjustedHeight);
                x += barWidth + (isMobile ? 0.5 : 1);
            }

            if (isPlaying) {
                animationFrameRef.current = requestAnimationFrame(renderFrame);
            }
        };
    
       
        const unsubscribe = store.subscribe(() => {
            if(isPlaying) {
                renderFrame();
            }
        })
         
        if (isPlaying) {
            renderFrame();
        }
     
        return () => {
            cancelAnimationFrame(animationFrameRef.current);
            audio.removeEventListener('play',  renderFrame);
            unsubscribe();
        };
    }, [audio, isPlaying, isMobile, canvasSize]);

    return (
        <Box sx={{ 
            opacity: 1, 
            backgroundColor: '#000',
            width: isMobile ? '100vw' : '100%',
            maxWidth: isMobile ? '100vw' : '100%',
            minWidth: isMobile ? '100vw' : '100%',
            overflow: 'hidden',
            position: 'relative',
            margin: 0,
            padding: 0,
            left: 0,
            right: 0,
            boxSizing: 'border-box',
            transform: 'translateX(0)'
        }}>
            <canvas 
                ref={canvasRef} 
                width={canvasSize.width} 
                height={canvasSize.height} 
                style={{ 
                    opacity: 1, 
                    backgroundColor: '#000', 
                    display: 'block',
                    width: isMobile ? '100vw' : '100%',
                    height: isMobile ? '50px' : '200px',
                    maxWidth: isMobile ? '100vw' : '100%',
                    minWidth: isMobile ? '100vw' : '100%',
                    objectFit: 'cover',
                    margin: 0,
                    padding: 0,
                    position: 'relative',
                    boxSizing: 'border-box',
                    transform: 'translateX(0)'
                }}
            />
        </Box>
    );
};

export default AudioVisualizer;

