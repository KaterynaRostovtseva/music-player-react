import React, { useState } from "react";
import { useGetTracksQuery } from '../../redux/api';
import { CircularProgress, CardContent, Grid, Table, TableCell, TableContainer, TableRow, TableHead, Box, Paper, Typography, TableBody } from "@mui/material";
import { useDispatch, useSelector } from 'react-redux';
import { IconButton } from "@mui/material";
import { PlayArrow } from "@mui/icons-material";
import PauseRounded from '@mui/icons-material/PauseRounded';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { setTrack, play, stop } from '../../redux/slice/playerSlice';

const PageTracks = () => {
    const dispatch = useDispatch();
    const playerState = useSelector(state => state.persistedReducer.player);
    const [track, setTrackById] = useState(playerState.track);
    const { data, isLoading } = useGetTracksQuery()

    let playlist;
    if (!isLoading) {
        playlist = data;
    }

    const totalTracks = playlist?.TrackFind.length || 0;
    const tracksPerPage = 50;
    const totalPages = Math.ceil(totalTracks / tracksPerPage);
    const [currentPage, setCurrentPage] = useState(1); // Стан для відстеження поточної сторінки
    const startIndex = (currentPage - 1) * tracksPerPage; // Обчислюємо індекси треків, які мають відображатись на поточній сторінці
    const endIndex = startIndex + tracksPerPage;
    const tracksToDisplay = playlist?.TrackFind.slice(startIndex, endIndex);

    const handlePageChange = (event, newPage) => {
        setCurrentPage(newPage);
    };

    const handlePlay = (track) => {
        setTrackById(track);
        dispatch(setTrack(track));
        dispatch(play());
    };

    const handleStop = () => {
        dispatch(stop());
    };
   
    return isLoading ?
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '100px' }}>
            <CircularProgress />
        </Box>
        :
        <Box sx={{ mx: 5, width: '90%' }}>
            <Box>
                <CardContent md={12} sx={{ my: 1, width: '100%' }} >
                    <Typography component="h1" variant="h4" sx={{ marginBottom: '10px' }}>Треки</Typography>
                </CardContent>
            </Box>
            <TableContainer component={Paper} sx={{ width: '100%' }} >
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell><IconButton /></TableCell>
                            <TableCell>Назва</TableCell>
                            <TableCell>Альбом</TableCell>
                            <TableCell>Виконавець</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tracksToDisplay.map((item, index) =>
                            <TableRow key={index}>
                                <TableCell >
                                    {playerState?.track?._id === item._id && playerState?.isPlaying === true ?
                                        <IconButton onClick={() => { handleStop() }}>
                                            <PauseRounded />
                                        </IconButton>
                                        :
                                        <IconButton onClick={() => { handlePlay(item) }}>
                                            <PlayArrow />
                                        </IconButton>
                                    }
                                </TableCell>
                                <TableCell >
                                    {item.id3 === null ? 'Без назви' : item.id3.title !== null ? item.id3.title : 'Без назви'}
                                </TableCell>
                                <TableCell >
                                    {item.id3 === null ? 'Без назви' : item.id3.album !== null ? item.id3.album : 'Без назви'}
                                </TableCell>
                                <TableCell >
                                    {item.id3 === null ? 'Без назви' : item.id3.artist !== null ? item.id3.artist : 'Без назви'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <Stack spacing={2} >
                <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                />
            </Stack>
        </Box>
}

export default PageTracks;