import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { CircularProgress, useMediaQuery, useTheme } from "@mui/material";
import { useDeletePlaylistMutation, useGetPlaylistsMyQuery } from '../../redux/api';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { IconButton } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/Delete';


export default function PageMyPlaylist() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const authPayload = useSelector(store => store.persistedReducer.auth.payload);
    const idUser = authPayload?._id || authPayload?.sub?.id;
    const { isLoading, data, refetch } = useGetPlaylistsMyQuery({ idUser }, { skip: !idUser })
    const [playlistDelete] = useDeletePlaylistMutation()
    const navigate = useNavigate();
    const [myPlaylists, setMyPlaylists] = useState({ PlaylistFind: [] });

    useEffect(() => {
        if (data) {
            setMyPlaylists(data)
        }
        if (idUser && typeof refetch === 'function') {
            refetch();
        }
    }, [data, idUser]);

    const handleDelete = async (id) => {
        try {
            await playlistDelete({ playlistId: id });
            const updatedPlaylists = myPlaylists.PlaylistFind.filter(i => i._id !== id);
            setMyPlaylists({ PlaylistFind: updatedPlaylists });
        } catch (error) {
            console.error("Не вдалося видалити список відтворення", error);
        }
    };

    const toPlaylist = async (id) => {
        navigate(`/playlist/${id}`);
        localStorage.setItem('Playlist', 'MyPlaylist')
    };

    const showLoader = isLoading && (!myPlaylists || myPlaylists.PlaylistFind.length === 0);

    return showLoader ?
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '100px' }}>
            <CircularProgress />
        </Box> :
        <Grid container >
            <Box sx={{ margin: { xs: 2, md: '30px' }, display: 'flex', flexDirection: 'column', width: '100%' }}>
                <Typography component="h2" variant="h4" sx={{ 
                    marginBottom: { xs: '15px', md: '30px' },
                    fontSize: { xs: '1.5rem', md: '2.125rem' }
                }}>
                    Мої плейлисти
                </Typography>
                <Button 
                    variant="contained" 
                    sx={{ marginBottom: { xs: '15px', md: '30px' }, width: { xs: '100%', md: 'auto' } }} 
                    onClick={() => { navigate(`/creatingPlaylist`) }}
                    size={isMobile ? 'small' : 'medium'}
                >
                    Створити плейлист
                </Button>
            </Box>
            <Grid container spacing={2} sx={{ px: { xs: 1, md: 4 } }}>
                {myPlaylists?.PlaylistFind?.map((playlist, index) => (
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
                                <CardActions sx={{ flexWrap: 'wrap', gap: { xs: 1, md: 0 } }}>
                                    <Button sx={{ mx: { xs: 0, md: 2 } }} size={isMobile ? 'small' : 'medium'} onClick={() => { toPlaylist(playlist._id) }}>Детальніше</Button>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <IconButton onClick={() => { navigate(`/editPlaylist/${playlist._id}`) }} size={isMobile ? 'small' : 'medium'}>
                                            <EditOutlinedIcon />
                                        </IconButton>
                                        <IconButton onClick={() => { handleDelete(playlist._id) }} size={isMobile ? 'small' : 'medium'}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </CardActions>
                            </Card>
                        </Grid>
                    : null
                ))}
            </Grid>
        </Grid>
}