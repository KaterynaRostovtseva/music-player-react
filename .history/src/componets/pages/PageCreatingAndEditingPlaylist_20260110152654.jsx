import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Basic from '../Dropzone/Basic';
import { useNavigate } from 'react-router-dom';
import { useUpsertPlaylistMutation } from '../../redux/api';
import { Input } from '@mui/base/Input';
import { useParams } from "react-router-dom";
import { useGetPlaylistIdQuery } from '../../redux/api';
import { Grid, Table, TableCell, TableContainer, TableRow, TableHead, Box, Paper, Typography, TableBody, useMediaQuery, useTheme } from "@mui/material";
import { IconButton } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { CircularProgress } from "@mui/material";
import Modal from '@mui/material/Modal';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import { useSearchTrackQuery } from '../../redux/api';
import { setSearchResults } from '../../redux/slice/searchSlice';
import AddCircleSharpIcon from '@mui/icons-material/AddCircleSharp';

const PageCreatingAndEditingPlaylist = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const dispatch = useDispatch();

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: 500 },
        maxWidth: '90%',
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: { xs: 2, md: 4 },
    };
    const [upsertPlaylistMutation] = useUpsertPlaylistMutation();
    let [tracksId, setTracksId] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const { id: idParam } = useParams();
    const id = idParam || '';
    const { data: searchData, isLoading: isLoadingSearch } = useSearchTrackQuery(
        { title: debouncedSearchQuery },
        { skip: !debouncedSearchQuery || debouncedSearchQuery.trim() === '' }
    );
    const [searchResults, setSearchTracks] = useState([]);
    const { data, isLoading, refetch, error } = useGetPlaylistIdQuery(
        { _id: id },
        { skip: !id || id === '' }
    );
    const [playlist, setMyPlaylist] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    let [tracks, setTracks] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    let [loadFile, setLoadFile] = useState(false);

    useEffect(() => {
        // console.log('PageCreatingAndEditingPlaylist - id:', id);
        // console.log('PageCreatingAndEditingPlaylist - isLoading:', isLoading);
        // console.log('PageCreatingAndEditingPlaylist - data:', data);
        // console.log('PageCreatingAndEditingPlaylist - error:', error);
    }, [id, isLoading, data, error]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (searchData?.TrackFind) {
            console.log('Оновлені результати пошуку:', searchData.TrackFind);
            setSearchTracks(searchData.TrackFind || []);
            dispatch(setSearchResults(searchData.TrackFind || []));
        } else if (!debouncedSearchQuery || debouncedSearchQuery.trim() === '') {
            setSearchTracks([]);
            dispatch(setSearchResults([]));
        }
    }, [searchData, debouncedSearchQuery, dispatch]);

    useEffect(() => {
        let playlistData = null;

        if (data?.PlaylistFindOne) {
            playlistData = data.PlaylistFindOne;
        } else if (data?.PlaylistFind && Array.isArray(data.PlaylistFind) && data.PlaylistFind.length > 0) {
            playlistData = data.PlaylistFind[0];
        }

        if (playlistData) {
            if (playlistData.tracks && playlistData.tracks.length > 0) {
            }
            setMyPlaylist(playlistData);
            setName(playlistData.name || '');
            setDescription(playlistData.description || '');
            setTracks(playlistData.tracks || []);
            const tracksArrId = (playlistData.tracks || []).map(i => i._id).filter(Boolean);
            setTracksId(tracksArrId);
        } else if (id && id !== '' && !isLoading && !playlistData) {
            console.warn('Плейлист не знайдено:', id, 'data:', data);
        }
    }, [data, id, isLoading]);

    const handleUploadResult = (id) => {
        setTracksId(prev => [...prev, id]);
    };

    const navigate = useNavigate();

    const creatPlaylist = async () => {
        try {
            let playlistId;
            if (id !== undefined && id !== '') {
                playlistId = id;
            } else {
                playlistId = '';
            }
            let newTracksId = tracksId.map(i => { let item = { _id: i }; return item });
            const res = await upsertPlaylistMutation({ playlistId: playlistId, namePls: name, descriptionPls: description, tracksId: newTracksId });
            if (res?.data?.PlaylistUpsert) {
                if (res.data.PlaylistUpsert.tracks) {
                    setTracks(res.data.PlaylistUpsert.tracks);
                }

                if (id === '' || id === undefined) {
                    navigate(`/playlist/${res.data.PlaylistUpsert._id}/edit`);
                } else {
                    setName(res.data.PlaylistUpsert.name || '');
                    setDescription(res.data.PlaylistUpsert.description || '');
                    setOpenModal(true);
                    setLoadFile(true);
                    await refetch();
                }
            }
            if (id === '' || id === undefined) {
                setName('');
                setDescription('');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const addTrack = async (track) => {
        const trackId = track?._id || track;
        const newIds = [...tracksId, trackId];
        setTracksId(newIds);

        if (track && track._id && track.id3) {
            setTracks(prev => {
                if (prev.some(t => t._id === trackId)) {
                    return prev;
                }
                return [...prev, track];
            });
        }

        try {
            const playlistId = id || '';
            const newTracksId = newIds.map(i => ({ _id: i }));

            const result = await upsertPlaylistMutation({
                playlistId,
                namePls: name,
                descriptionPls: description,
                tracksId: newTracksId
            });

            if (result?.data?.PlaylistUpsert?.tracks) {
                setTracks(result.data.PlaylistUpsert.tracks);
            }

            if (!id && result?.data?.PlaylistUpsert?._id) {
                id = result.data.PlaylistUpsert._id;
            }

            await refetch();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (trackId) => {
        try {
            const updatedTracks = tracks.filter(i => i._id !== trackId);
            const updatedTracksId = updatedTracks.map(i => ({ _id: i._id }));
            await upsertPlaylistMutation({
                playlistId: id,
                namePls: name,
                descriptionPls: description,
                tracksId: updatedTracksId
            });
            setTracks(updatedTracks);
            await refetch();
        } catch (error) {
            console.error("Не вдалося видалити трек", error);
        }
    };

    return (id && id !== '' && isLoading) ?
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: { xs: '50px', md: '100px' } }}>
            <CircularProgress />
        </Box> :
        <Grid item xs={12} md={12} sx={{ mx: { xs: 0, md: 1 } }}>
            <Box sx={{ mx: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column' }}>
                <>
                    {id !== '' ?
                        <Typography component="h1" variant="h4" sx={{ my: { xs: 3, md: 5 }, mx: { xs: 0, md: 4 }, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                            Редагування плейлиста
                        </Typography>
                        :
                        <Typography component="h1" variant="h4" sx={{ my: { xs: 3, md: 5 }, mx: { xs: 0, md: 4 }, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                            Створення плейлиста
                        </Typography>
                    }
                </>
                {id !== '' ?
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: '1px solid grey',
                        width: { xs: '100%', sm: '100%', md: '500px' },
                        borderRadius: '5px',
                        my: { xs: 2, md: 0 }
                    }}>
                        <Box>
                            <SearchIcon sx={{ mx: 1, color: 'text.secondary' }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <InputBase
                                sx={{ width: { xs: '100%', md: '400px' }, fontSize: { xs: '0.875rem', md: '1rem' } }}
                                placeholder="Пошук музики…"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value) }}
                            />
                        </Box>
                        <Box>
                            <IconButton sx={{ padding: '1px' }} onClick={() => { setSearchQuery(''); setSearchTracks([]); }} size={isMobile ? 'small' : 'medium'}>
                                <CloseOutlinedIcon />
                            </IconButton>
                        </Box>
                    </Box>
                    : null}
                <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                    <Table aria-label="simple table" size={isMobile ? 'small' : 'medium'}>
                        <TableHead>
                        </TableHead>
                        <TableBody>
                            {searchResults?.map((item, index) =>
                                <TableRow key={index}>
                                    <TableCell sx={{ padding: { xs: '8px', md: '16px' } }}>
                                        <IconButton onClick={() => { addTrack(item) }} size={isMobile ? 'small' : 'medium'}>
                                            <AddCircleSharpIcon />
                                        </IconButton>
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

                <Box component="form" sx={{ width: { xs: '100%', sm: '100%', md: '600px' }, maxWidth: '100%' }} >
                    <Box sx={{ my: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'flex-start' }, gap: { xs: 2, md: 0 } }} >
                        <Box>
                            <Typography variant="body2" sx={{ my: { xs: 2, md: 5 }, textAlign: { xs: 'left', md: 'center' }, fontSize: { xs: '0.875rem', md: '0.875rem' } }}>
                                Завантажити трек:
                            </Typography>
                        </Box>
                        <Box sx={{ mx: { xs: 0, md: 9 }, width: { xs: '100%', md: '300px' } }}>
                            <Basic uploadResult={handleUploadResult} prop={loadFile} />
                        </Box>
                    </Box>
                    <Grid container sx={{ my: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'flex-start' }, gap: { xs: 2, md: 0 } }}>
                        <Grid item xs={12} md={4}>
                            <Typography sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
                                Назва плейлиста:
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Додати назву"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                size={isMobile ? 'small' : 'medium'}
                            />

                        </Grid>
                    </Grid>
                    <Grid container sx={{ my: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'flex-start' }, gap: { xs: 2, md: 0 } }} >
                        <Grid item xs={12} md={4}>
                            <Typography sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
                                Опис плейлиста:
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Input
                                aria-label="Demo input"
                                multiline placeholder="Додати опис…"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Grid>
                    </Grid>
                    <Box sx={{ my: { xs: 3, md: 5 }, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <Button variant="contained" onClick={() => creatPlaylist()} size={isMobile ? 'small' : 'medium'}>Зберегти</Button>
                        <Button variant="contained" onClick={() => navigate(-1)} size={isMobile ? 'small' : 'medium'}>Вийти</Button>
                    </Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Список треків:
                    </Typography>
                    <TableContainer component={Paper} sx={{ width: { xs: '100%', md: '1000px' }, overflowX: 'auto' }} >
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
                                {tracks?.map((item, index) =>
                                    <TableRow key={index}>
                                        <TableCell sx={{ padding: { xs: '8px', md: '16px' } }}>
                                            <IconButton onClick={() => { handleDelete(item._id) }} size={isMobile ? 'small' : 'medium'}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                        <TableCell sx={{ padding: { xs: '8px', md: '16px' }, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                                            {(() => {
                                                if (!item.id3) return 'Без назви';
                                                if (item.id3.title && item.id3.title.includes(' - ')) {
                                                    const parts = item.id3.title.split(' - ');
                                                    return parts.length > 1 ? parts[1] : item.id3.title;
                                                }
                                                return item.id3.title || 'Без назви';
                                            })()}
                                        </TableCell>
                                        {!isMobile && (
                                            <TableCell sx={{ padding: { xs: '8px', md: '16px' } }}>
                                                {!item.id3 ? 'Без назви' : (item.id3.album || 'Без назви')}
                                            </TableCell>
                                        )}
                                        <TableCell sx={{ padding: { xs: '8px', md: '16px' }, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                                            {(() => {
                                                if (!item.id3) return 'Без назви';
                                                if (!item.id3.artist && item.id3.title && item.id3.title.includes(' - ')) {
                                                    const parts = item.id3.title.split(' - ');
                                                    return parts[0] || 'Без назви';
                                                }
                                                return item.id3.artist || 'Без назви';
                                            })()}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Modal
                        open={openModal}
                        onClose={() => { setOpenModal(false); setLoadFile(false) }}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={style} >
                            <IconButton sx={{ padding: '1px', position: 'absolute', right: '0', top: '0' }} onClick={() => { setOpenModal(false); setLoadFile(false) }}>
                                <CloseOutlinedIcon />
                            </IconButton>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                Данні плейлиста успішно збережені.
                            </Typography>

                        </Box>
                    </Modal>
                </Box>
            </Box>
        </Grid>
}

export default PageCreatingAndEditingPlaylist;