import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { play, pause, setCurrentTime, setVolume } from '../redux/slice/playerSlice';
import { Box, Typography,  } from "@mui/material";
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


const FooterPlayer = () => {
  const dispatch = useDispatch();
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
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 51, height: { xs: '60px', sm: '50px', md: '150px' }, overflow: 'hidden', display: 'block', opacity: 0.8, pointerEvents: 'none'}}>
          <AudioVisualizer />
        </Box>
        <Box sx={{ position: 'relative', zIndex: 60, marginTop: { xs: '35px', sm: '25px', md: '20px' }, padding: { xs: '8px 8px', sm: '8px', md: '0px 12px 4px 12px' }, width: '100%',}}>
          <Box sx={{ my: 0, width: '100%', display: "flex", justifyContent: "space-between", alignItems: 'center', color: 'white', gap: 1, px: { xs: 2, md: 4 }}}>
            <Typography sx={{ fontSize: '0.75rem', minWidth: '40px' }}>
              {`${Math.floor(currentTime / 60)}:${Math.round(currentTime % 60).toString().padStart(2, '0')}`}
            </Typography>
            <Slider
              sx={{ mx: 2, flex: 1, color: "#fff", padding: { md: '13px 0' }}}
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

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: { xs: '20px', md: '5px' }, px: { xs: 1, md: 3 }}}>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <IconButton onClick={handlePrevTrack} sx={{ color: 'white' }}>
                <FastRewindRounded />
              </IconButton>

              <IconButton onClick={playerState.isPlaying ? handlePause : handlePlay} sx={{ color: 'white', mx: 1 }}>
                {playerState.isPlaying ? <PauseRounded fontSize="large" /> : <PlayArrowRounded fontSize="large" />}
              </IconButton>

              <IconButton onClick={handleNextTrack} sx={{ color: 'white' }}>
                <FastForwardRounded />
              </IconButton>
            </Box>

            <Box sx={{ color: 'white', textAlign: 'center', flex: 2, minWidth: 0,}}>
              <Typography noWrap sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                {data?.id3?.title || 'Назву не вказано'}
              </Typography>
              <Typography noWrap sx={{ opacity: 0.7, fontSize: '0.8rem' }}>
                {data?.id3?.artist || 'Виконавця не вказано'}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', display: { xs: 'none', sm: 'flex' }}}>
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
