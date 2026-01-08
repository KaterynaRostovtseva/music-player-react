import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { play, pause, stop, nextTrack, prevTrack, setCurrentTime, setVolume } from '../redux/slice/playerSlice';
import { Grid, Box, Typography } from "@mui/material";
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

const MusicPlayerSlider = () => {

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

  const handleStop = () => {
    dispatch(stop());
  };

  const handleVolumeChange = e => {
    const newVolume = parseFloat(e / 100);
    dispatch(setVolume(newVolume));
  };

  const handleNextTrack = () => {
    dispatch(nextTrack());
    if (playerState.playlist && playerState.playlist.tracks[playerState.playlistIndex]) {
      dispatch(play());
    } else {
      dispatch(stop());
    }
  };

  const handlePrevTrack = () => {
    dispatch(prevTrack());
    if (playerState.playlist && playerState.playlist.tracks[playerState.playlistIndex]) {
      dispatch(play());
    } else {
      dispatch(stop());
    }
  };

  return (
    <Grid container sx={{ mx: 5, my: 3, display: "flex", flexDirection: 'column', width: '90%' }}>
      <Box sx={{ my: 1 }}>
        <Typography component="h1" variant="h4" sx={{ marginBottom: '30px' }}>Плеєр</Typography>
        <Typography variant="body2" sx={{ marginBottom: '30px' }}>Поточний трек:</Typography>
        <Typography variant="h6" sx={{ marginBottom: '30px' }}>
          {data && data.id3.title || 'Назва відсутня'}
        </Typography>
      </Box>
      <Box >
        <AudioVisualizer />
      </Box>
      <Box sx={{ boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)'}}>
        <Box>
          <Box sx={{ mx: 2, my:2, width: '100%', display: "flex", flexDirection: 'space-between', alignItems: 'center' }}>
            {`${Math.floor(currentTime / 60) < 10 ? "0" : ""}${Math.floor(currentTime / 60)} : ${Math.round(currentTime % 60) < 10 ? "0" : ""}${Math.round(currentTime % 60)}`}
            <Slider
              sx={{ mx: 2, width: '85%', color: "#c0c0c0fff" }}
              step={1}
              min={0}
              max={duration}
              value={currentTime}
              name='slider'
              onChange={(e, newValue) => handleTimeUpdate(newValue)}
              onChangeCommitted={() => handlePlay()}
            />
            {`${Math.floor(duration / 60) < 10 ? "0" : ""}${Math.floor(duration / 60)} : ${Math.round(duration % 60) < 10 ? "0" : ""}${Math.round(duration % 60)}`}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: 'space-between' }}>
            <Box >
              <IconButton onClick={handlePrevTrack}><FastRewindRounded /> </IconButton>
              {playerState.isPlaying === true ? <IconButton onClick={handlePause}> <PauseRounded /></IconButton>
                : <IconButton onClick={handlePlay}> <PlayArrowRounded /></IconButton>
              }
              <IconButton onClick={handleNextTrack}><FastForwardRounded /></IconButton>
              <IconButton onClick={handleStop}><Stop /></IconButton>
            </Box>
            <Box>
              <Typography style={{ textAlign: "center", padding: "0 5px" }}>
             {data && data.id3 && data.id3.artist || 'Виконавець не вказаний'}
              </Typography>
              <Typography style={{ textAlign: "center", padding: "0 5px" }}>
                {data && data.id3 && data.id3.album || 'Альбом не вказаний'}
              </Typography>
            </Box>
            <Box sx={{ width: '300px' }}>
              <Stack spacing={1} direction="row" sx={{ mb: 1 }} alignItems="center">
                <VolumeDownRounded />
                <Slider aria-label="Volume" value={volume * 100} onChange={(event, newVolume) => handleVolumeChange(newVolume)} style={{ color: "#c0c0c0fff" }} />
                <VolumeUpRounded />
              </Stack>
            </Box>
          </Box>
        </Box>
      </Box>
    </Grid>
  )
};

export default MusicPlayerSlider;
