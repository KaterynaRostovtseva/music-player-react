import React, { useState } from "react";
import { useGetTracksQuery } from '../../redux/api';
import { CircularProgress, CardContent, Grid, Table, TableCell, TableContainer, TableRow, TableHead, Box, Paper, Typography, TableBody, useMediaQuery, useTheme } from "@mui/material";
import { useDispatch, useSelector } from 'react-redux';
import { IconButton } from "@mui/material";
import { PlayArrow } from "@mui/icons-material";
import PauseRounded from '@mui/icons-material/PauseRounded';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { setTrack, play, stop } from '../../redux/slice/playerSlice';

const PageTracks = () => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
        <Box sx={{ mx: { xs: 2, sm: 3, md: 5 }, width: { xs: '95%', sm: '90%' }, maxWidth: '100%' }}>
            <Box>
                <CardContent md={12} sx={{ my: 1, width: '100%' }} >
                    <Typography component="h1" variant="h4" sx={{ marginBottom: '10px', fontSize: { xs: '1.5rem', md: '2.125rem' } }}>Треки</Typography>
                </CardContent>
            </Box>
            <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto' }} >
                <Table aria-label="simple table" size={isMobile ? 'small' : 'medium'}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ padding: { xs: '8px', md: '16px' } }}><IconButton size={isMobile ? 'small' : 'medium'} /></TableCell>
                            <TableCell sx={{ padding: { xs: '8px', md: '16px' }, fontSize: { xs: '0.875rem', md: '1rem' } }}>Назва</TableCell>
                            {!isMobile && <TableCell sx={{ padding: { xs: '8px', md: '16px' } }}>Альбом</TableCell>}
                            <TableCell sx={{ padding: { xs: '8px', md: '16px' }, fontSize: { xs: '0.875rem', md: '1rem' } }}>Виконавець</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tracksToDisplay.map((item, index) =>
                            <TableRow key={index}>
                                <TableCell sx={{ padding: { xs: '8px', md: '16px' } }}>
                                    {playerState?.track?._id === item._id && playerState?.isPlaying === true ?
                                        <IconButton onClick={() => { handleStop() }} size={isMobile ? 'small' : 'medium'}>
                                            <PauseRounded />
                                        </IconButton>
                                        :
                                        <IconButton onClick={() => { handlePlay(item) }} size={isMobile ? 'small' : 'medium'}>
                                            <PlayArrow />
                                        </IconButton>
                                    }
                                </TableCell>
                                <TableCell sx={{ padding: { xs: '8px', md: '16px' }, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                                    {item.id3 === null ? 'Без назви' : item.id3.title !== null ? item.id3.title : 'Без назви'}
                                </TableCell>
                                {!isMobile && (
                                    <TableCell sx={{ padding: { xs: '8px', md: '16px' } }}>
                                        {item.id3 === null ? 'Без назви' : item.id3.album !== null ? item.id3.album : 'Без назви'}
                                    </TableCell>
                                )}
                                <TableCell sx={{ padding: { xs: '8px', md: '16px' }, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                                    {item.id3 === null ? 'Без назви' : item.id3.artist !== null ? item.id3.artist : 'Без назви'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', my: 2 }}>
                <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    size={isMobile ? 'small' : 'medium'}
                />
            </Box>
        </Box>
}

export default PageTracks;