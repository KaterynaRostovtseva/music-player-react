import React, { useState } from 'react';
import { CardContent, IconButton, Grid, Table, TableCell, TableContainer, TableRow, TableHead, Box, Paper, Typography, TableBody, useMediaQuery, useTheme } from "@mui/material";
import { useDispatch, useSelector } from 'react-redux';
import { PlayArrow } from "@mui/icons-material";
import PauseRounded from '@mui/icons-material/PauseRounded';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { setTrack, play, stop } from '../../redux/slice/playerSlice';

const PageSearchTracks = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const dispatch = useDispatch();
    const playerState = useSelector(state => state.persistedReducer.player);
    const tracks = useSelector((state) => state.persistedReducer.search.searchTracks);
    const [track, setTrackById] = useState(playerState.track);
    
    const totalTracks = tracks?.length || 0;
    const tracksPerPage = 50;
    const totalPages = Math.ceil(totalTracks / tracksPerPage);
    const [currentPage, setCurrentPage] = useState(1); 
    const startIndex = (currentPage - 1) * tracksPerPage; 
    const endIndex = startIndex + tracksPerPage;
    const tracksToDisplay = tracks?.slice(startIndex, endIndex) || [];
  
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

    return (
        <Grid container sx={{ mx: { xs: 1, sm: 3, md: 5 }, my: { xs: 2, md: 3 }, width: { xs: '95%', sm: '90%', md: '80%' }, maxWidth: '100%' }}>
            {!tracksToDisplay || tracksToDisplay.length <= 0 ?
                <Box>
                    <CardContent md={12} sx={{ width: '100%' }} >
                        <Typography component="h1" variant="h4" sx={{ marginBottom: '30px', fontSize: { xs: '1.5rem', md: '2.125rem' } }}>Жодного треку за запитом не знайдено</Typography>
                    </CardContent>
                </Box>
                :
                <>
                    <Box>
                        <CardContent md={12} sx={{ width: '100%' }} >
                            <Typography component="h1" variant="h4" sx={{ marginBottom: '30px', fontSize: { xs: '1.5rem', md: '2.125rem' } }}>Знайдено такі треки</Typography>
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
                                {tracksToDisplay?.map((result, index) =>
                                    <TableRow key={index}>
                                        <TableCell sx={{ padding: { xs: '8px', md: '16px' } }}>
                                            {playerState?.track?._id === result._id && playerState?.isPlaying === true ?
                                                <IconButton onClick={() => { handleStop() }} size={isMobile ? 'small' : 'medium'}>
                                                    <PauseRounded />
                                                </IconButton>
                                                :
                                                <IconButton onClick={() => { handlePlay(result) }} size={isMobile ? 'small' : 'medium'}>
                                                    <PlayArrow />
                                                </IconButton>
                                            }
                                        </TableCell>
                                        <TableCell sx={{ padding: { xs: '8px', md: '16px' }, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                                            {result.id3 === null ? 'Без назви' : result.id3.title !== null ? result.id3.title : 'Без назви'}
                                        </TableCell>
                                        {!isMobile && (
                                            <TableCell sx={{ padding: { xs: '8px', md: '16px' } }}>
                                                {result.id3 === null ? 'Без назви' : result.id3.album !== null ? result.id3.album : 'Без назви'}
                                            </TableCell>
                                        )}
                                        <TableCell sx={{ padding: { xs: '8px', md: '16px' }, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                                            {result.id3 === null ? 'Без назви' : result.id3.artist !== null ? result.id3.artist : 'Без назви'}
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
                </>
            }
        </Grid>
    )
}

export default PageSearchTracks;