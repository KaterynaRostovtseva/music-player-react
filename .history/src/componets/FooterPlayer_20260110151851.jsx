import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { play, pause, setCurrentTime, setVolume } from '../redux/slice/playerSlice';
import { Box, Typography, } from "@mui/material";
import Slider from '@mui/material/Slider';
import PauseRounded from '@mui/icons-material/PauseRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import FastForwardRounded from '@mui/icons-material/FastForwardRounded';
import FastRewindRounded from '@mui/icons-material/FastRewindRounded';
import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';
import VolumeDownRounded from '@mui/icons-material/VolumeDownRounded';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import AudioVisualizer from './AudioVisualizer';
import { useTheme, useMediaQuery } from '@mui/material';

const FooterPlayer = () => {
  const dispatch = useDispatch();
  const playerState = useSelector(state => state.persistedReducer.player);
  const currentTime = useSelector(state => state.persistedReducer.player.currentTime);
  const duration = useSelector(state => state.persistedReducer.player.duration);
  const volume = useSelector(state => state.persistedReducer.player.volume);
  const data = useSelector(state => state.persistedReducer.player.track);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTimeUpdate = (newValue) => {
    dispatch(setCurrentTime(newValue));
  };

  const handlePlay = () => {
    dispatch(play());
  };

  const handlePause = () => {
    dispatch(pause());
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
      <Box sx={{ height: { xs: '120px', md: '100px' } }} />

      <Box component="footer" sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        backgroundColor: 'rgba(18, 18, 18, 0.98)', // Более глубокий темный цвет
        backdropFilter: 'blur(15px)',
        zIndex: 1000,
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>

      <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: { xs: '60px', sm: '150px' },
          opacity: 0.9,
          pointerEvents: 'none',
          overflow: 'hidden'
        }}>
          <AudioVisualizer />
        </Box>

        <Box sx={{ position: 'relative', zIndex: 60, p: { xs: 1, md: 2 } }}>

          {/* Слайдер времени - выносим в самый верх плеера без лишних Box */}
          <Box sx={{
            display: "flex",
            alignItems: 'center',
            color: 'white',
            px: { xs: 1, md: 4 },
            mt: { xs: -1, md: 0 } // Поднимаем чуть выше на мобилках
          }}>
            <Typography sx={{ fontSize: '0.7rem', minWidth: '35px', opacity: 0.8 }}>
              {`${Math.floor(currentTime / 60)}:${Math.round(currentTime % 60).toString().padStart(2, '0')}`}
            </Typography>
            <Slider
              sx={{
                mx: 1.5,
                flex: 1,
                color: "#fff",
                '& .MuiSlider-thumb': { width: 12, height: 12 }, // Меньше точка на мобилке
                padding: '13px 0'
              }}
              step={1}
              min={0}
              max={duration}
              value={currentTime}
              onChange={(e, newValue) => handleTimeUpdate(newValue)}
              onChangeCommitted={() => handlePlay()}
              size="small"
            />
            <Typography sx={{ fontSize: '0.7rem', minWidth: '35px', opacity: 0.8 }}>
              {`${Math.floor(duration / 60)}:${Math.round(duration % 60).toString().padStart(2, '0')}`}
            </Typography>
          </Box>

          {/* Основной контент */}
          <Box sx={{
            display: "flex",
            flexDirection: { xs: 'column', sm: 'row' }, // Столбик на мобилке
            alignItems: "center",
            justifyContent: "space-between",
            gap: { xs: 1, md: 0 }
          }}>

            {/* Название трека - теперь сверху на мобилках */}
            <Box sx={{
              color: 'white',
              textAlign: { xs: 'center', sm: 'center' },
              order: { xs: 1, sm: 2 }, // Порядок
              width: '100%',
              maxWidth: { xs: '250px', sm: '300px' },
              minWidth: 0
            }}>
              <Typography noWrap sx={{ fontWeight: 600, fontSize: { xs: '0.85rem', md: '1rem' } }}>
                {data?.id3?.title || 'Назву не вказано'}
              </Typography>
              <Typography noWrap sx={{ opacity: 0.6, fontSize: '0.75rem' }}>
                {data?.id3?.artist || 'Виконавця не вказано'}
              </Typography>
            </Box>

            {/* Кнопки управления */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              order: { xs: 2, sm: 1 },
              flex: 1
            }}>
              <IconButton onClick={handlePrevTrack} sx={{ color: 'white' }}>
                <FastRewindRounded fontSize={isMobile ? "medium" : "large"} />
              </IconButton>

              <IconButton
                onClick={playerState.isPlaying ? handlePause : handlePlay}
                sx={{
                  color: 'black',
                  bgcolor: 'white', // Инверсия цвета для акцента на Play
                  mx: 2,
                  '&:hover': { bgcolor: '#ddd' },
                  width: { xs: 45, md: 50 },
                  height: { xs: 45, md: 50 }
                }}
              >
                {playerState.isPlaying ? <PauseRounded fontSize="large" /> : <PlayArrowRounded fontSize="large" />}
              </IconButton>

              <IconButton onClick={handleNextTrack} sx={{ color: 'white' }}>
                <FastForwardRounded fontSize={isMobile ? "medium" : "large"} />
              </IconButton>
            </Box>

            {/* Громкость (скрыта на мобилках) */}
            <Box sx={{
              flex: 1,
              display: { xs: 'none', sm: 'flex' },
              justifyContent: 'flex-end',
              order: 3
            }}>
              <Stack spacing={2} direction="row" alignItems="center" sx={{ width: 250 }}>
                <VolumeDownRounded sx={{ color: 'white', fontSize: 24 }} />
                <Slider
                  value={volume * 100}
                  onChange={(e, v) => handleVolumeChange(v)}
                  sx={{ color: "#fff" }}
                  size="small"
                />
                <VolumeUpRounded sx={{ color: 'white', fontSize: 24 }} />
              </Stack>
            </Box>

          </Box>
        </Box>
      </Box>
    </>
  );
}
export default FooterPlayer;
