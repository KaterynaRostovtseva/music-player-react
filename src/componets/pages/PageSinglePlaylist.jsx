import React, { useEffect, useState } from "react";
import { useGetPlaylistIdQuery } from '../../redux/api';
import { CircularProgress, Grid, Box, Typography, CardContent, TableBody, TableRow, TableCell, Table, TableHead, TableContainer, Paper, useMediaQuery, useTheme } from "@mui/material";
import { useParams } from "react-router-dom";
import { IconButton } from "@mui/material";
import { PlayArrow } from "@mui/icons-material";
import { useDispatch, useSelector } from 'react-redux';
import { setTrack, play, stop, setPlaylist } from '../../redux/slice/playerSlice';
import PauseRounded from '@mui/icons-material/PauseRounded';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";


const PageSinglePlaylist = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { id } = useParams();
    const { data, isLoading } = useGetPlaylistIdQuery({ _id: id });
    const playerState = useSelector(state => state.persistedReducer.player);
    const [playlist, setMyPlaylist] = useState(null);
    const [track, setTrackById] = useState(playerState.track);
    const [tracks, setTracks] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        if (data?.PlaylistFindOne) {
            setMyPlaylist(data);
            dispatch(setPlaylist(data?.PlaylistFindOne))
            setTracks(data?.PlaylistFindOne?.tracks || []);
        }
    }, [data])

    const handlePlay = (track) => {
        setTrackById(track);
        dispatch(setTrack(track));
        dispatch(play());
    };

    const handleStop = () => {
        dispatch(stop());
    };

    const handleDragEnd = (result) => {
        if (!result.destination) {
            return;
        }
        const newTracks = [...tracks];
        const [reorderedItem] = newTracks.splice(result.source.index, 1);
        newTracks.splice(result.destination.index, 0, reorderedItem);
        setTracks(newTracks);
    };


    return isLoading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '100px' }}>
            <CircularProgress />
        </Box>
    ) : (
        <>
            <Box sx={{ mx: { xs: 1, md: 1 } }}>
                <Box sx={{ mx: { xs: 2, md: 5 }, my: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column' }}>
                    <Typography gutterBottom variant="h4" component="div" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                        {playlist?.PlaylistFindOne.name || 'Немає назви'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '0.875rem' } }}>
                        {data?.PlaylistFindOne?.description || 'Немає опису'}
                    </Typography>
                </Box>
                <Box sx={{ mx: { xs: 1, md: 1 } }}>
                    <Typography gutterBottom variant="h6" component="div" sx={{ mx: { xs: 2, md: 5 }, my: 1, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>Треки</Typography>
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <TableContainer component={Paper} sx={{ mx: { xs: 1, sm: 3, md: 5 }, my: 2, width: { xs: '95%', sm: '90%' }, overflowX: 'auto' }}>
                            <Table aria-label="simple table" size={isMobile ? 'small' : 'medium'}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ padding: { xs: '8px', md: '16px' } }}><IconButton size={isMobile ? 'small' : 'medium'} /></TableCell>
                                        <TableCell sx={{ padding: { xs: '8px', md: '16px' }, fontSize: { xs: '0.875rem', md: '1rem' } }}>Назва</TableCell>
                                        {!isMobile && <TableCell sx={{ padding: { xs: '8px', md: '16px' } }}>Альбом</TableCell>}
                                        <TableCell sx={{ padding: { xs: '8px', md: '16px' }, fontSize: { xs: '0.875rem', md: '1rem' } }}>Виконавець</TableCell>
                                    </TableRow>
                                </TableHead>
                                <Droppable droppableId="droppable">
                                    {(provided) => (
                                        <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                                            {tracks.map((item, index) => (
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
                                                                {playerState.track?._id === item._id && playerState.isPlaying === true ?
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
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </TableBody>
                                    )}
                                </Droppable>
                            </Table>
                        </TableContainer>
                    </DragDropContext>
                </Box>
            </Box>
            <Box sx={{ height: { xs: '150px', md: '210px' }, width: '100%' }}></Box>
        </>
    )
};

export default PageSinglePlaylist;