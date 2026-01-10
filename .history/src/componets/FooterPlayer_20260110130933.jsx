import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { play, pause, stop, nextTrack, prevTrack, setCurrentTime, setVolume } from '../redux/slice/playerSlice';
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import Slider from '@mui/material/Slider';
import PauseRounded from '@mui/icons-material/PauseRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import FastForwardRounded from '@mui/icons-material/FastForwardRounded';
import FastRewindRounded from '@mui/icons-material/FastRewindRounded';
import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';
import VolumeDownRounded from '@mui/icons-material/VolumeDownRounded';
import Stop from '@mui/icons-material/Stop';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import AudioVisualizer from './AudioVisualizer';


const FooterPlayer = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const playerState = useSelector(state => state.persistedReducer.player);
  const currentTime = useSelector(state => state.persistedReducer.player.currentTime);
  const duration = useSelector(state => state.persistedReducer.player.duration);
  const volume = useSelector(state => state.persistedReducer.player.volume);
  const data = useSelector(state => state.persistedReducer.player.track);

  const handleTimeUpdate = (newValue) => {
    dispatch(setCurrentTime(newValue));
  };

  const handlePlay = () => {
    dispatch(play());
  };

  const handlePause = () => {
    dispatch(pause());
  };

  const handleStop = () => {
    dispatch(stop());
  };

  const handleVolumeChange = e => {
    const newVolume = parseFloat(e / 100);
    dispatch(setVolume(newVolume));
  };

  const handleNextTrack = () => {
    const newTime = Math.min(currentTime + 10, duration);
    dispatch(setCurrentTime(newTime));
  };

  const handlePrevTrack = () => {
    const newTime = Math.max(currentTime - 10, 0);
    dispatch(setCurrentTime(newTime));
  };


  return (
    <>
      <Box sx={{ marginTop: { xs: '180px', sm: '150px', md: '120px' } }} />

      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, width: '100vw', backgroundColor: 'rgba(0, 0, 0, 0.95)', backdropFilter: 'blur(10px)', zIndex: 1000 }}>

        {/* Визуализатор */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          // Поднимаем zIndex выше фона, но оставляем ниже кнопок (или выше, если хотите поверх)
          zIndex: 51,
          // Увеличим немного высоту на md, чтобы линии было видно
          height: { xs: '60px', sm: '50px', md: '150px' },
          overflow: 'hidden',
          display: 'block',
          opacity: 0.8,pointerEvents: 'none'}}>
          <AudioVisualizer />
        </Box>
        {/* Контейнер управления */}
        <Box sx={{
          position: 'relative',
          zIndex: 60, // Кнопки должны быть выше визуализатора, чтобы нажиматься
          // Увеличим marginTop на md, чтобы текст не наезжал на начало визуализатора
          marginTop: { xs: '35px', sm: '25px', md: '20px' },
          padding: { xs: '8px 8px', sm: '8px', md: '0px 12px 4px 12px' },
          width: '100%',
        }}>

          {/* Слайдер времени */}
          <Box sx={{
            my: 0,
            width: '100%',
            display: "flex",
            justifyContent: "space-between",
            alignItems: 'center',
            color: 'white',
            gap: 1,
            px: { xs: 2, md: 4 }
          }}>
            <Typography sx={{ fontSize: '0.75rem', minWidth: '40px' }}>
              {/* Функция форматирования времени */}
              {`${Math.floor(currentTime / 60)}:${Math.round(currentTime % 60).toString().padStart(2, '0')}`}
            </Typography>
            <Slider
              sx={{
                mx: 2,
                flex: 1,
                color: "#fff",
                // Делаем слайдер тоньше на десктопе
                padding: { md: '13px 0' }
              }}
              step={1}
              min={0}
              max={duration}
              value={currentTime}
              onChange={(e, newValue) => handleTimeUpdate(newValue)}
              onChangeCommitted={() => handlePlay()}
              size="small"
            />
            <Typography sx={{ fontSize: '0.75rem', minWidth: '40px' }}>
              {`${Math.floor(duration / 60)}:${Math.round(duration % 60).toString().padStart(2, '0')}`}
            </Typography>
          </Box>

          {/* Основные элементы управления */}
          <Box sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: { xs: '20px', md: '5px' }, // Больше места снизу на мобилках
            px: { xs: 1, md: 3 }
          }}>
            {/* Группа кнопок */}
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <IconButton onClick={handlePrevTrack} sx={{ color: 'white' }}>
                <FastRewindRounded />
              </IconButton>

              <IconButton
                onClick={playerState.isPlaying ? handlePause : handlePlay}
                sx={{ color: 'white', mx: 1 }}
              >
                {playerState.isPlaying ? <PauseRounded fontSize="large" /> : <PlayArrowRounded fontSize="large" />}
              </IconButton>

              <IconButton onClick={handleNextTrack} sx={{ color: 'white' }}>
                <FastForwardRounded />
              </IconButton>
            </Box>

            {/* Информация о треке (Центр) */}
            <Box sx={{
              color: 'white',
              textAlign: 'center',
              flex: 2,
              minWidth: 0,
            }}>
              <Typography noWrap sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                {data?.id3?.title || 'Назву не вказано'}
              </Typography>
              <Typography noWrap sx={{ opacity: 0.7, fontSize: '0.8rem' }}>
                {data?.id3?.artist || 'Виконавця не вказано'}
              </Typography>
            </Box>

            {/* Громкость (Правая часть) */}
            <Box sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'flex-end',
              // Прячем ползунок на совсем маленьких экранах
              display: { xs: 'none', sm: 'flex' }
            }}>
              <Stack spacing={2} direction="row" alignItems="center" sx={{ width: 150 }}>
                <VolumeDownRounded sx={{ color: 'white' }} />
                <Slider
                  value={volume * 100}
                  onChange={(e, v) => handleVolumeChange(v)}
                  sx={{ color: "#fff" }}
                  size="small"
                />
                <VolumeUpRounded sx={{ color: 'white' }} />
              </Stack>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  )
}
export default FooterPlayer;
