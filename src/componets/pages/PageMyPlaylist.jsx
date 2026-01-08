import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { CircularProgress } from "@mui/material";
import { useDeletePlaylistMutation, useGetPlaylistsMyQuery } from '../../redux/api';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';


export default function PageMyPlaylist() {

    const idUser = useSelector(store => store.persistedReducer.auth.payload.sub.id);
    const { isLoading, data, refetch } = useGetPlaylistsMyQuery({ idUser })
    const [playlistDelete] = useDeletePlaylistMutation()
    const navigate = useNavigate();
    const [myPlaylists, setMyPlaylists] = useState();

    useEffect(() => {
        if (data) {
            setMyPlaylists(data)
        }
        refetch();
    }, [data]);

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

    return isLoading || !myPlaylists ?
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '100px' }}>
            <CircularProgress />
        </Box> :
        <Grid container >
            <Box sx={{ margin: '30px', display: 'flex', flexDirection: 'column' }}>
                <Typography component="h2" variant="h4" sx={{ marginBottom: '30px' }}>Мої плейлисти</Typography>
                <Button variant="contained" sx={{ marginBottom: '30px' }} onClick={() => { navigate(`/creatingPlaylist`) }}>Створити плейлист</Button>
            </Box>
            <Grid item md={12} sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {myPlaylists?.PlaylistFind?.map((playlist, index) => (
                    playlist._id && playlist.name ?
                        <Grid item md={3} key={index} sx={{ margin: '30px' }}>
                            <Card sx={{ maxWidth: 300, height: 180 }} >
                                <CardContent>
                                    <Typography gutterBottom variant="h5" component="div">
                                        {playlist.name ? playlist.name : 'Назви немає'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {playlist.description || `Description`}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button sx={{ mx: 2 }} size="small" onClick={() => { toPlaylist(playlist._id) }}>Детальніше</Button>
                                    <IconButton sx={{ mx: 2 }} onClick={() => { navigate(`/editPlaylist/${playlist._id}`) }}>
                                        <EditOutlinedIcon />
                                    </IconButton>
                                    <IconButton onClick={() => { handleDelete(playlist._id) }}>
                                        <DeleteIcon />
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    : null
                ))}
            </Grid>
        </Grid>
}