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
    // Перемотка назад на 10 секунд
    const newTime = Math.max(currentTime - 10, 0);
    dispatch(setCurrentTime(newTime));
  };

  return (
    <>  
    <Box sx={{ marginTop: { xs: '150px', sm: '150px', md: '200px' } }}  />
        <Box sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0,
          width: '100vw',
          maxWidth: '100vw',
          minWidth: '100vw',
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(10px)',
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
          transform: 'translateX(0)'
        }}>
          {/* Визуализатор - адаптированный для всех устройств */}
          <Box sx={{
            position: { xs: 'fixed', md: 'absolute' }, 
            top: { xs: 'auto', md: '0px' },
            bottom: { xs: 'auto', md: 'auto' },
            left: { xs: 0, md: 0 },
            right: { xs: 0, md: 0 },
            width: { xs: '100vw', md: '100%' },
            maxWidth: { xs: '100vw', md: '100%' },
            minWidth: { xs: '100vw', md: '100%' },
            zIndex: '49',  
            marginTop: { xs: 0, md: '20px' },
            marginBottom: { xs: isMobile ? '140px' : 'auto', md: 0 },
            marginLeft: 0,
            marginRight: 0,
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
            paddingBottom: 0,
            opacity: 1,
            height: { xs: '50px', sm: '70px', md: '100px' },
            overflow: 'hidden',
            display: 'block',
            boxSizing: 'border-box',
            transform: 'translateX(0)'
          }}>
              <AudioVisualizer />
          </Box>
          
          <Box sx={{ 
            position: 'relative', 
            zIndex: 50, 
            marginTop: { xs: '55px', sm: '75px', md: '120px' }, 
            padding: { xs: '8px 4px', sm: '8px', md: '12px' },
            width: '100%',
            maxWidth: '100%'
          }}>
              {/* Слайдер времени */}
              <Box sx={{
                my: { xs: 0.5, md: 1 }, 
                width: '100%', 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: 'center', 
                color: 'white',
                gap: { xs: 0.5, md: 1 },
                px: { xs: 1, md: 0 }
              }}>
                  <Typography sx={{ 
                    fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' }, 
                    minWidth: { xs: '38px', sm: '45px', md: 'auto' },
                    textAlign: 'center'
                  }}>
                    {`${Math.floor(currentTime / 60) < 10 ? "0" : ""}${Math.floor(currentTime / 60)} : ${Math.round(currentTime % 60) < 10 ? "0" : ""}${Math.round(currentTime % 60)}`}
                  </Typography>
                  <Slider
                      sx={{ 
                        mx: { xs: 0.5, sm: 1, md: 2 }, 
                        flex: 1,
                        color: "#c0c0c0fff" 
                      }}
                      step={1}
                      min={0}
                      max={duration}
                      value={currentTime}
                      name='slider'
                      onChange={(e, newValue) => handleTimeUpdate(newValue)}
                      onChangeCommitted={() => handlePlay()}
                      size={isMobile ? 'small' : 'medium'}
                  />
                  <Typography sx={{ 
                    fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' }, 
                    minWidth: { xs: '38px', sm: '45px', md: 'auto' },
                    textAlign: 'center'
                  }}>
                    {`${Math.floor(duration / 60) < 10 ? "0" : ""}${Math.floor(duration / 60)} : ${Math.round(duration % 60) < 10 ? "0" : ""}${Math.round(duration % 60)}`}
                  </Typography>
              </Box>
              
              {/* Основные элементы управления */}
              <Box sx={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: { xs: 'space-between', md: 'space-around' },
                flexWrap: { xs: 'nowrap', md: 'nowrap' },
                gap: { xs: 0.5, sm: 1, md: 0 },
                padding: { xs: '4px 0', md: '8px 0' }
              }}>
                  {/* Кнопки управления воспроизведением */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: { xs: 0, sm: 0.5 }
                  }}>
                      <IconButton 
                        onClick={handlePrevTrack} 
                        size={isMobile ? 'small' : 'medium'}
                        sx={{ color: 'white', padding: { xs: '4px', md: '8px' } }}
                      >
                        <FastRewindRounded sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
                      </IconButton>
                      {playerState.isPlaying === true ? 
                        <IconButton 
                          onClick={handlePause} 
                          size={isMobile ? 'medium' : 'large'}
                          sx={{ color: 'white', padding: { xs: '6px', md: '12px' } }}
                        > 
                          <PauseRounded sx={{ fontSize: { xs: '1.8rem', md: '2rem' } }} />
                        </IconButton>
                        : <IconButton 
                          onClick={handlePlay} 
                          size={isMobile ? 'medium' : 'large'}
                          sx={{ color: 'white', padding: { xs: '6px', md: '12px' } }}
                        > 
                          <PlayArrowRounded sx={{ fontSize: { xs: '1.8rem', md: '2rem' } }} />
                        </IconButton>
                      }
                      <IconButton 
                        onClick={handleNextTrack} 
                        size={isMobile ? 'small' : 'medium'}
                        sx={{ color: 'white', padding: { xs: '4px', md: '8px' } }}
                      >
                        <FastForwardRounded sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
                      </IconButton>
                      {!isMobile && (
                        <IconButton 
                          onClick={handleStop} 
                          size="medium"
                          sx={{ color: 'white', ml: 0.5 }}
                        >
                          <Stop />
                        </IconButton>
                      )}
                  </Box>
                  
                  {/* Информация о треке */}
                  <Box sx={{ 
                    color: 'white', 
                    flex: { xs: 1, md: '0 0 auto' }, 
                    textAlign: 'center',
                    px: { xs: 0.5, md: 1 },
                    minWidth: 0,
                    overflow: 'hidden'
                  }}>
                      <Typography sx={{ 
                        fontSize: { xs: '0.7rem', sm: '0.8rem', md: '1rem' },
                        fontWeight: { xs: 500, md: 400 },
                        padding: { xs: "0 2px", md: "0 5px" },
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: { xs: '120px', sm: '200px', md: 'none' }
                      }}>
                          {data && data.id3 && data.id3.title || 'Назву не вказано'}
                      </Typography>
                      <Typography sx={{ 
                        fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.875rem' },
                        padding: { xs: "0 2px", md: "0 5px" },
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: { xs: '120px', sm: '200px', md: 'none' },
                        opacity: 0.8
                      }}>
                          {data && data.id3 && data.id3.artist || 'Виконавця не вказано'}
                      </Typography>
                  </Box>
                  
                  {/* Регулятор громкости */}
                  <Box sx={{ 
                    width: { xs: '80px', sm: '120px', md: '200px' },
                    display: { xs: isMobile ? 'none' : 'block', sm: 'block' }
                  }}>
                      <Stack spacing={0.5} direction="row" sx={{ mb: 0.5 }} alignItems="center">
                          <VolumeDownRounded sx={{ 
                            fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' },
                            color: 'white'
                          }} />
                          <Slider 
                            aria-label="Volume" 
                            value={volume * 100} 
                            onChange={(event, newVolume) => handleVolumeChange(newVolume)} 
                            sx={{ color: "#c0c0c0fff" }}
                            size={isMobile ? 'small' : 'medium'}
                          />
                          <VolumeUpRounded sx={{ 
                            fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' },
                            color: 'white'
                          }} />
                      </Stack>
                  </Box>
                  
                  {/* Кнопка громкости для очень маленьких экранов */}
                  {isMobile && (
                    <IconButton
                      sx={{ color: 'white', padding: '4px' }}
                      onClick={() => {
                        const prevVolume = volume;
                        handleVolumeChange(prevVolume > 0 ? 0 : (prevVolume === 0 ? 50 : prevVolume * 100));
                      }}
                    >
                      {volume > 0 ? (
                        <VolumeUpRounded sx={{ fontSize: '1.2rem' }} />
                      ) : (
                        <VolumeDownRounded sx={{ fontSize: '1.2rem' }} />
                      )}
                    </IconButton>
                  )}
              </Box>
          </Box>
        </Box>
  </>
  )
}
export default FooterPlayer;
