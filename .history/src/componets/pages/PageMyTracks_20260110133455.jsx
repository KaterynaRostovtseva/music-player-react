import React, { useEffect, useState } from "react";
import { useGetTracksMyQuery } from '../../redux/api';
import { CircularProgress, CardContent, Grid, Table, TableCell, TableContainer, TableRow, TableHead, Box, Paper, Typography, TableBody, useMediaQuery, useTheme } from "@mui/material";
import { useDispatch, useSelector } from 'react-redux';
import { IconButton } from "@mui/material";
import { PlayArrow } from "@mui/icons-material";
import PauseRounded from '@mui/icons-material/PauseRounded';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { setTrack, play, stop } from '../../redux/slice/playerSlice';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DeleteIcon from '@mui/icons-material/Delete';


const PageMyTracks = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const dispatch = useDispatch();
    const authPayload = useSelector(store => store.persistedReducer.auth.payload);
    const idUser = authPayload?._id || authPayload?.sub?.id;
    const playerState = useSelector(state => state.persistedReducer.player);
    const [, setTrackById] = useState(playerState.track);
    const { isLoading: isLoadingMyTracks, data: myTracksData, refetch } = useGetTracksMyQuery({ idUser: idUser }, { skip: !idUser });
    const [tracks, setTracks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (!isLoadingMyTracks && myTracksData) {
            setTracks(myTracksData.TrackFind);
        }
    }, [isLoadingMyTracks, myTracksData]);

    const handleDragEnd = (result) => {
        if (!result.destination) {
            return;
        }

        const newTracks = [...tracks];
        if (currentPage === 1) {
            const [reorderedItem] = newTracks.splice(result.source.index, 1);
            newTracks.splice(result.destination.index, 0, reorderedItem);
        }
        if (currentPage !== 1) {
            let num = currentPage - 1;
            num = num * 50;
            const [reorderedItem] = newTracks.splice(result.source.index + num, 1);
            newTracks.splice(result.destination.index + num, 0, reorderedItem);
        }

        setTracks(newTracks);
    };

    const handlePageChange = (event, newPage) => {
        setCurrentPage(newPage);
    };

    const totalTracks = tracks.length || 0;
    const tracksPerPage = 50;
    const startIndex = (currentPage - 1) * tracksPerPage;
    const endIndex = startIndex + tracksPerPage;
    const tracksToDisplay = tracks.slice(startIndex, endIndex);

    const handlePlay = (track) => {
        setTrackById(track);
        dispatch(setTrack(track));
        dispatch(play());
    };

    const handleStop = () => {
        dispatch(stop());
    };

    return (
        isLoadingMyTracks ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '100px' }}>
                <CircularProgress />
            </Box>
        ) : (
            <Grid container sx={{ mx: { xs: 2, sm: 3, md: 5 }, width: { xs: '92%', sm: '90%' }, maxWidth: '100%' }}>
                <Box>
                    <CardContent md={12} sx={{ my: 1, width: '100%' }}>
                        <Typography component="h1" variant="h4" sx={{ marginBottom: '10px', fontSize: { xs: '1.5rem', md: '2.125rem' } }}>Мої треки</Typography>
                    </CardContent>
                </Box>
                <DragDropContext onDragEnd={handleDragEnd}>
                    <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto' }}>
                        <Table aria-label="simple table" size={isMobile ? 'small' : 'medium'}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ padding: { xs: '8px', md: '16px' } }}><IconButton size={isMobile ? 'small' : 'medium'} /></TableCell>
                                    <TableCell sx={{ padding: { xs: '8px', md: '16px' }, fontSize: { xs: '0.875rem', md: '1rem' } }}>Назва</TableCell>
                                    {!isMobile && <TableCell sx={{ padding: { xs: '8px', md: '16px' } }}>Альбом</TableCell>}
                                    <TableCell sx={{ padding: { xs: '8px', md: '16px' }, fontSize: { xs: '0.875rem', md: '1rem' } }}>Виконавець</TableCell>
                                    <TableCell sx={{ padding: { xs: '8px', md: '16px' } }}></TableCell>
                                </TableRow>
                            </TableHead>
                            <Droppable droppableId="droppable">
                                {(provided) => (
                                    <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                                        {tracksToDisplay.map((item, index) => (
                                            <Draggable key={item._id} draggableId={item._id} index={index}>
                                                {(provided, snapshot) => (
                                                    <TableRow
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={{
                                                            ...provided.draggableProps.style,
                                                            backgroundColor: snapshot.isDragging ? 'lightgrey' : 'inherit',
                                                        }}
                                                    >
                                                        <TableCell sx={{ padding: { xs: '8px', md: '16px' } }}>
                                                            {playerState?.track?._id === item._id && playerState?.isPlaying === true ? (
                                                                <IconButton onClick={() => { handleStop() }} size={isMobile ? 'small' : 'medium'}>
                                                                    <PauseRounded />
                                                                </IconButton>
                                                            ) : (
                                                                <IconButton onClick={() => { handlePlay(item) }} size={isMobile ? 'small' : 'medium'}>
                                                                    <PlayArrow />
                                                                </IconButton>
                                                            )}
                                                        </TableCell>
                                                        <TableCell sx={{ padding: { xs: '8px', md: '16px' }, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                                                            {item.id3?.title || 'Без назви'}
                                                        </TableCell>
                                                        {!isMobile && (
                                                            <TableCell sx={{ padding: { xs: '8px', md: '16px' } }}>
                                                                {item.id3?.album || 'Без назви'}
                                                            </TableCell>
                                                        )}
                                                        <TableCell sx={{ padding: { xs: '8px', md: '16px' }, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                                                            {item.id3?.artist || 'Без назви'}
                                                        </TableCell>
                                                        <TableCell sx={{ padding: { xs: '8px', md: '16px' } }}>
                                                            <IconButton onClick={async () => {
                                                                try {
                                                                    const response = await fetch('/track', {
                                                                        method: 'DELETE',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify({ _id: item._id })
                                                                    });
                                                                    if (response.ok) {
                                                                        await refetch();
                                                                        setTracks(prev => prev.filter(t => t._id !== item._id));
                                                                    } else {
                                                                        console.error('Delete failed', await response.text());
                                                                    }
                                                                } catch (err) {
                                                                    console.error('Delete error', err);
                                                                }
                                                            }} size={isMobile ? 'small' : 'medium'}>
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </TableBody>
                                )}
                            </Droppable>
                        </Table>
                    </TableContainer>
                </DragDropContext>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', my: 2 }}>
                    <Pagination
                        count={Math.ceil(totalTracks / tracksPerPage)}
                        page={currentPage}
                        onChange={handlePageChange}
                        size={isMobile ? 'small' : 'medium'}
                    />
                </Box>
                <div style={{ height: { xs: '150px', md: '210px' }, width: '100%' }}></div>
            </Grid>
        )
    );
};

export default PageMyTracks;