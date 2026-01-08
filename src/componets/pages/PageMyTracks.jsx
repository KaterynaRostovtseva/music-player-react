import React, { useEffect, useState } from "react";
import { useGetTracksMyQuery } from '../../redux/api';
import { CircularProgress, CardContent, Grid, Table, TableCell, TableContainer, TableRow, TableHead, Box, Paper, Typography, TableBody } from "@mui/material";
import { useDispatch, useSelector } from 'react-redux';
import { IconButton } from "@mui/material";
import { PlayArrow } from "@mui/icons-material";
import PauseRounded from '@mui/icons-material/PauseRounded';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { setTrack, play, stop } from '../../redux/slice/playerSlice';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";


const PageMyTracks = () => {

    const dispatch = useDispatch();
    const idUser = useSelector(store => store.persistedReducer.auth.payload.sub.id);
    const playerState = useSelector(state => state.persistedReducer.player);
    const [, setTrackById] = useState(playerState.track);
    const { isLoading: isLoadingMyTracks, data: myTracksData } = useGetTracksMyQuery({ idUser: idUser });
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
            <Grid container sx={{ mx: 5, width: '90%' }}>
                <Box>
                    <CardContent md={12} sx={{ my: 1, width: '100%' }}>
                        <Typography component="h1" variant="h4" sx={{ marginBottom: '10px' }}>Мої треки</Typography>
                    </CardContent>
                </Box>
                <DragDropContext onDragEnd={handleDragEnd}>
                    <TableContainer component={Paper} sx={{ width: '100%' }}>
                        <Table aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell><IconButton /></TableCell>
                                    <TableCell>Назва</TableCell>
                                    <TableCell>Альбом</TableCell>
                                    <TableCell>Виконавець</TableCell>
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
                                                        <TableCell>
                                                            {playerState?.track?._id === item._id && playerState?.isPlaying === true ? (
                                                                <IconButton onClick={() => { handleStop() }}>
                                                                    <PauseRounded />
                                                                </IconButton>
                                                            ) : (
                                                                <IconButton onClick={() => { handlePlay(item) }}>
                                                                    <PlayArrow />
                                                                </IconButton>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {item.id3?.title || 'Без назви'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {item.id3?.album || 'Без назви'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {item.id3?.artist || 'Без назви'}
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
                <Stack spacing={2}>
                    <Pagination
                        count={Math.ceil(totalTracks / tracksPerPage)}
                        page={currentPage}
                        onChange={handlePageChange}
                    />
                </Stack>
                <div style={{ height: '210px', width: '100%' }}></div>
            </Grid>
        )
    );
};

export default PageMyTracks;