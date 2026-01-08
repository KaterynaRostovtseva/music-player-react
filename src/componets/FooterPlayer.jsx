import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { play, pause, stop, nextTrack, prevTrack, setCurrentTime, setVolume } from '../redux/slice/playerSlice';
import { Box, Typography } from "@mui/material";
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
    <>  
    <Box sx={{ marginTop:'200px' }}  />
        <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0}}>
          <Box sx={{ position: 'relative', zIndex: 50, marginTop:'20px' }}>
              <Box sx={{my:1, width: '100%', display: "flex", justifyContent: "space-evenly", alignItems: 'center', color:'white' }}>
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
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: 'space-around' }}>
                  <Box >
                      <IconButton onClick={handlePrevTrack}><FastRewindRounded /> </IconButton>
                      {playerState.isPlaying === true ? <IconButton onClick={handlePause}> <PauseRounded /></IconButton>
                          : <IconButton onClick={handlePlay}> <PlayArrowRounded /></IconButton>
                      }
                      <IconButton onClick={handleNextTrack}><FastForwardRounded /></IconButton>
                      <IconButton onClick={handleStop}><Stop /></IconButton>
                  </Box>
                  <Box sx={{color:'white' }}>
                      <Typography style={{ textAlign: "center", padding: "0 5px" }}>
                          {data && data.id3 && data.id3.title || 'Назву не вказано'}
                      </Typography>
                      <Typography style={{ textAlign: "center", padding: "0 5px" }}>
                          {data && data.id3 && data.id3.artist || 'Виконавця не вказано'}
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
          <Box sx={{position: 'absolute', top: '0px', zIndex: '49',  marginTop:'20px'}}>
              <AudioVisualizer />
          </Box>
        </Box>
  </>
  )
}
export default FooterPlayer;
