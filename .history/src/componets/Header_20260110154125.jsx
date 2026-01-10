import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {  useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import InputBase from '@mui/material/InputBase';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { logout} from '../redux/slice/authSlice';
import { useSearchTrackQuery } from '../redux/api';
import {backendUrl} from '../redux/slice/playerSlice';
import { useGetUserByIdQuery } from '../redux/api';
import { setAboutMe } from "../redux/slice/authSlice";
import { setSearchResults } from '../redux/slice/searchSlice';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { setCurrentTime } from '../redux/slice/playerSlice';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Modal from '@mui/material/Modal';
import { useDrawer } from './DrawerContext';


const Header = (prop) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMobileMenu = useMediaQuery(theme.breakpoints.down('md'));
  const { toggleDrawer } = useDrawer();
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const stateAuth = useSelector((state) => state.persistedReducer.auth)
  const id = stateAuth?.payload?._id || stateAuth?.payload?.sub?.id;
  const { data, isLoading, refetch } = useGetUserByIdQuery(
    { _id: id }, 
    { 
      skip: !id,
      refetchOnMountOrArgChange: false 
    }
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchBoxRef = useRef(null);
  const isLoggedIn = prop.props
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const shouldSkip = !debouncedSearchQuery || debouncedSearchQuery.trim() === '';
  const { data: searchData, isLoading: isLoadingSearch, error: searchError } = useSearchTrackQuery(
    { title: debouncedSearchQuery },
    { skip: shouldSkip }
  );
  
  useEffect(() => {
    if (searchData?.TrackFind) {
      dispatch(setSearchResults(searchData.TrackFind));
      if (searchData.TrackFind.length > 0 && searchQuery.trim() !== '') {
        setShowDropdown(true);
      }
    } else if (shouldSkip) {
      dispatch(setSearchResults([]));
      setShowDropdown(false);
    }
  }, [searchData, shouldSkip, dispatch, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);
  
  useEffect(() => {
    if (!isLoading && data && data.UserFindOne) {
      const currentAvatar = stateAuth.aboutMe?.avatar;
      const currentAvatarUrl = currentAvatar?.url;
      const newAvatar = data.UserFindOne?.avatar;
      const newAvatarUrl = newAvatar?.url;
      const hasCurrentAvatar = currentAvatarUrl && 
                                currentAvatarUrl !== '/avatars/default.png' && 
                                currentAvatarUrl.startsWith('data:');
 
      if (hasCurrentAvatar && (!newAvatar || !newAvatarUrl || newAvatarUrl === '/avatars/default.png')) {
        const updatedUser = {
          ...data.UserFindOne,
          avatar: currentAvatar
        };
        dispatch(setAboutMe(updatedUser));
        return;
      }
      
      if (newAvatarUrl && currentAvatarUrl !== newAvatarUrl) {
        dispatch(setAboutMe(data.UserFindOne));
      }
      else if (!hasCurrentAvatar && newAvatarUrl) {
        dispatch(setAboutMe(data.UserFindOne));
      }
      else if (currentAvatarUrl === newAvatarUrl && newAvatarUrl) {
        const currentNick = stateAuth.aboutMe?.nick;
        const newNick = data.UserFindOne?.nick;
        if (currentNick !== newNick || stateAuth.aboutMe?._id !== data.UserFindOne?._id) {
          dispatch(setAboutMe(data.UserFindOne));
        }
      }
      else if (!hasCurrentAvatar && !newAvatarUrl) {
        dispatch(setAboutMe(data.UserFindOne));
      }
    }
  }, [data, isLoading, dispatch, stateAuth.aboutMe?.avatar]);

  useEffect(() => {
  }, [stateAuth.aboutMe?.avatar]);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
    navigate("/profileEditing");
  };
 
  const logOut = async () => {
      dispatch(logout());
      dispatch(setCurrentTime(0))
      handleCloseUserMenu();
      navigate("/");
  };

  const handleSearch = () => {
    setShowDropdown(false);
    navigate("/search");
  };

  const handleTrackClick = (track) => {
    setShowDropdown(false);
    navigate("/search");
  };

  return (
    <Box sx={{ flexGrow: 1}}>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          {isLoggedIn && isMobileMenu && (
            <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={toggleDrawer} sx={{ mr: 1, display: { md: 'none' }, color: 'white'}}>
              <MenuIcon sx={{ color: 'white' }} />
            </IconButton>
          )}
          <Typography component="h1" variant="h5" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}> 
            МійЗвук 
          </Typography>
          {isLoggedIn ? 
          <>
            {isMobile ? (
              <>
                <IconButton  onClick={() => setMobileSearchOpen(true)} sx={{ order: { xs: 2, sm: 2 }, color: 'inherit' }}>
                  <SearchIcon sx={{ color: 'white' }} />
                </IconButton>
                <Modal
                  open={mobileSearchOpen}
                  onClose={() => {
                    setMobileSearchOpen(false);
                    setShowDropdown(false);
                  }}
                  sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'flex-start', justifyContent: 'center', pt: 8 }}>
                  <Paper sx={{ width: '90%', maxWidth: '500px', p: 2, borderRadius: 2, position: 'relative'}}>
                    <Box sx={{ position: 'relative' }} ref={searchBoxRef}>
                      <Box sx={{ display:'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor:'#ffffffeb', width: '100%',  borderRadius:'5px', border: '1px solid #ccc'}}>
                        <Box>
                          {isLoadingSearch ? (
                            <CircularProgress size={20} sx={{ mx: 1 }} />
                          ) : (
                            <SearchIcon sx={{ mx: 1, color: 'primary.main' }} />
                          )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <InputBase
                            sx={{width: '100%', fontSize: '1rem'}}
                            placeholder="Пошук музики…"
                            value={searchQuery}
                            autoFocus
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                            }}
                            onFocus={() => {
                              if (searchData?.TrackFind && searchData.TrackFind.length > 0 && searchQuery.trim() !== '') {
                                setShowDropdown(true);
                              }
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleSearch();
                                setMobileSearchOpen(false);
                              }
                            }}
                          />
                        </Box>
                        {searchQuery.trim() !== '' && (
                          <Box>
                            <IconButton sx={{padding: '1px'}} onClick={() => { 
                              setSearchQuery(''); 
                              setDebouncedSearchQuery('');
                              dispatch(setSearchResults([]));
                              setShowDropdown(false);
                            }}>
                              <CloseOutlinedIcon />
                            </IconButton>
                          </Box>
                        )}
                      </Box>

                      {showDropdown && searchData?.TrackFind && searchData.TrackFind.length > 0 && (
                        <Paper sx={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, maxHeight: '400px', overflow: 'auto', mt: 1, boxShadow: 3,}}>
                          <List dense>
                            {searchData.TrackFind.slice(0, 10).map((track, index) => (
                              <ListItem
                                key={track._id || index}
                                button
                                onClick={() => {
                                  handleTrackClick(track);
                                  setMobileSearchOpen(false);
                                }}
                                sx={{
                                  '&:hover': {
                                    backgroundColor: 'action.hover',
                                  },
                                }}
                              >
                                <ListItemText
                                  primary={track.id3?.title || 'Без назви'}
                                  secondary={
                                    track.id3?.album
                                      ? `${track?.id3?.artist || 'Невідомий виконавець'} • ${track.id3.album}`
                                      : track?.id3?.artist || 'Невідомий виконавець'
                                  }
                                />
                              </ListItem>
                            ))}
                            {searchData.TrackFind.length > 10 && (
                              <ListItem button onClick={() => {
                                  handleSearch();
                                  setMobileSearchOpen(false);
                                }}
                                sx={{
                                  '&:hover': {
                                    backgroundColor: 'action.hover',
                                  },
                                }}
                              >
                                <ListItemText
                                  primary={`Показати всі результати (${searchData.TrackFind.length})...`}
                                  primaryTypographyProps={{
                                    style: { fontWeight: 'bold', color: 'primary.main' }
                                  }}
                                />
                              </ListItem>
                            )}
                          </List>
                        </Paper>
                      )}
                    </Box>
                  </Paper>
                </Modal>
              </>
            ) : (
              /* Десктопная версия - полное поле поиска */
              <Box sx={{ position: 'relative', width: { xs: '100%', sm: 'auto' }, order: { xs: 3, sm: 2 } }} ref={searchBoxRef}>
                <Box sx={{
                  display:'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  backgroundColor:'#ffffffeb', 
                  width: { xs: '100%', sm: '400px', md: '500px' }, 
                  borderRadius:'5px',
                  minWidth: { xs: '200px', sm: '300px' }
                }}>
                  <Box>
                    {isLoadingSearch ? (
                      <CircularProgress size={20} sx={{ mx: 1 }} />
                    ) : (
                      <SearchIcon sx={{ mx: 1, color: 'primary.main' }} />
                    )}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <InputBase
                      sx={{width: '100%', fontSize: { xs: '0.875rem', sm: '1rem' }}}
                      placeholder="Пошук музики…"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                      }}
                      onFocus={() => {
                        if (searchData?.TrackFind && searchData.TrackFind.length > 0 && searchQuery.trim() !== '') {
                          setShowDropdown(true);
                        }
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch();
                        }
                      }}
                    />
                  </Box>
                  {searchQuery.trim() !== '' && (
                    <Box>
                      <IconButton sx={{padding: '1px'}} onClick={() => { 
                        setSearchQuery(''); 
                        setDebouncedSearchQuery('');
                        dispatch(setSearchResults([]));
                        setShowDropdown(false);
                      }}>
                        <CloseOutlinedIcon />
                      </IconButton>
                    </Box>
                  )}
                </Box>
                {/* Выпадающий список с результатами поиска для десктопа */}
                {showDropdown && searchData?.TrackFind && searchData.TrackFind.length > 0 && (
                  <Paper
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 1000,
                      maxHeight: '400px',
                      overflow: 'auto',
                      mt: 1,
                      boxShadow: 3,
                    }}
                  >
                    <List dense>
                      {searchData.TrackFind.slice(0, 10).map((track, index) => (
                        <ListItem
                          key={track._id || index}
                          button
                          onClick={() => handleTrackClick(track)}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            },
                          }}
                        >
                          <ListItemText
                            primary={track.id3?.title || 'Без назви'}
                            secondary={
                              track.id3?.album
                                ? `${track.id3?.artist || 'Невідомий виконавець'} • ${track.id3.album}`
                                : track.id3?.artist || 'Невідомий виконавець'
                            }
                          />
                        </ListItem>
                      ))}
                      {searchData.TrackFind.length > 10 && (
                        <ListItem
                          button
                          onClick={handleSearch}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            },
                          }}
                        >
                          <ListItemText
                            primary={`Показати всі результати (${searchData.TrackFind.length})...`}
                            primaryTypographyProps={{
                              style: { fontWeight: 'bold', color: 'primary.main' }
                            }}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Paper>
                )}
              </Box>
            )}
          </> 
          : null
          }
          {stateAuth.token? 
            <Box sx={{ flexGrow: 0, order: { xs: 2, sm: 3 } }}>
              <Box sx={{ display:'flex', alignItems:'center', gap: { xs: 1, sm: 2 } }}>
                {!isMobile && (
                  <Box sx={{ display:'flex', flexDirection: 'column', marginRight:'5px' }}>
                    <Box sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Логін: {stateAuth.payload?.login || stateAuth.payload?.sub?.login} 
                    </Box>
                    <Box sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}> 
                      Нікнейм: {stateAuth.aboutMe?.nick}
                    </Box>
                  </Box>
                )}
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar 
                  key={`avatar-${stateAuth.aboutMe?.avatar?._id || 'default'}-${stateAuth.aboutMe?.avatar?.url?.substring(0, 50) || ''}`}
                  alt="User Avatar" 
                  src={
                    (() => {
                      let avatarUrl = stateAuth.aboutMe?.avatar?.url || '';
                      
                      // Очищаем URL от имени файла, если оно присутствует
                      if (avatarUrl && typeof avatarUrl === 'string') {
                        // Сначала проверяем расширения файлов (в разных регистрах) перед "data:"
                        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.bmp',
                                                 '.JPG', '.JPEG', '.PNG', '.GIF', '.SVG', '.WEBP', '.BMP'];
                        for (const ext of imageExtensions) {
                          const pattern = ext + 'data:';
                          if (avatarUrl.includes(pattern)) {
                            const extIndex = avatarUrl.indexOf(pattern);
                            avatarUrl = avatarUrl.substring(extIndex + ext.length);
                            break;
                          }
                        }
                        // Если URL не начинается с "data:", но содержит "data:", значит есть имя файла перед ним
                        if (!avatarUrl.startsWith('data:') && avatarUrl.includes('data:')) {
                          const dataUrlIndex = avatarUrl.indexOf('data:');
                          avatarUrl = avatarUrl.substring(dataUrlIndex);
                        }
                        // Если все еще не начинается с "data:", пытаемся найти паттерн data URL в строке
                        if (!avatarUrl.startsWith('data:')) {
                          const dataUrlMatch = avatarUrl.match(/data:[^,;]*[;,][^\s]*/);
                          if (dataUrlMatch) {
                            avatarUrl = dataUrlMatch[0];
                          }
                        }
                      }
                      
                      // Если URL начинается с Data URL, используем его напрямую
                      if (avatarUrl && avatarUrl.startsWith('data:')) {
                        return avatarUrl;
                      }
                      
                      // Иначе используем обычный путь с backendUrl
                      if (avatarUrl) {
                        return `${backendUrl}${avatarUrl}`;
                      }
                      
                      return '';
                    })()
                  } 
                /> 
                </IconButton>
              </Box>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                  <MenuItem onClick={handleCloseUserMenu}>
                    <Typography textAlign="center">Профіль</Typography>
                  </MenuItem>
                  <MenuItem onClick={() => logOut()}>
                    <Typography textAlign="center">Вийти</Typography>
                  </MenuItem>
              </Menu>
            </Box>
          : null}
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default Header;