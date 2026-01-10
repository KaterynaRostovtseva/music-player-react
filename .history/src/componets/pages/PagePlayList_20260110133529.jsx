import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { CircularProgress, useMediaQuery, useTheme } from "@mui/material";
import { useGetPlaylistQuery } from '../../redux/api';
import { useNavigate } from "react-router-dom";


export default function PagePlaylist() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isLoading, data } = useGetPlaylistQuery();

  const navigate = useNavigate();

  const toPlaylist = async (id) => {
    navigate(`/playlist/${id}`);
    localStorage.setItem('Playlist', 'StrangerPlaylist')
  };

  return isLoading ?
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '100px' }}>
            <CircularProgress />
          </Box> :
          <>
            <Box sx={{ margin: { xs: 2, md: '40px' } }}>
              <Typography component="h1" variant="h4" sx={{ marginBottom: '5px', fontSize: { xs: '1.5rem', md: '2.125rem' } }}>Плейлисти</Typography>
            </Box>
            <Grid container spacing={2} sx={{ px: { xs: 2, md: 4 } }}>
              {data?.PlaylistFind?.map((playlist, index) => (
                playlist._id && playlist.name ?
                  <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                    <Card sx={{ 
                      maxWidth: { xs: '100%', md: 300 }, 
                      height: { xs: 'auto', md: 180 },
                      width: '100%'
                    }} >
                      <CardContent>
                        <Typography gutterBottom variant="h5" component="div" sx={{ fontSize: { xs: '1.1rem', md: '1.5rem' } }}>
                          {playlist.name ? playlist.name : 'Назви немає'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                          {playlist.description || `Description`}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size={isMobile ? 'small' : 'medium'} onClick={() => { toPlaylist(playlist._id) }}>Детальніше</Button>
                      </CardActions>
                    </Card>
                  </Grid>
                  : null
              ))}
            </Grid>
          </>
}