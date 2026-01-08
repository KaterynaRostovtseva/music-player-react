import React, { useEffect, useState } from 'react';
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
import InputBase from '@mui/material/InputBase';
import Avatar from '@mui/material/Avatar';
import { logout} from '../redux/slice/authSlice';
import { useSearchTrackQuery } from '../redux/api';
import {backendUrl} from '../redux/slice/playerSlice';
import { useGetUserByIdQuery } from '../redux/api';
import { setAboutMe } from "../redux/slice/authSlice";
import { setSearchResults } from '../redux/slice/searchSlice';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { setCurrentTime } from '../redux/slice/playerSlice';


const Header = (prop) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const stateAuth = useSelector((state) => state.persistedReducer.auth)
  const id = stateAuth?.payload?.sub.id;
  const { data, isLoading } = useGetUserByIdQuery({ _id: id });
  const [searchResults, setSearchTracks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const isLoggedIn = prop.props
  const { isLoadingSerch, refetch } = useSearchTrackQuery({ title: searchQuery })
  
  useEffect(() => {
   
    if (!isLoading && data) {
      dispatch(setAboutMe(data.UserFindOne));
    }
    
  }, [data, isLoading, dispatch, searchResults, searchQuery, stateAuth]);

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
    refetch({title: searchQuery}).then((res) =>  {
      setSearchTracks(res.data?.TrackFind);
      const searchResults = res.data?.TrackFind;
      console.log(searchResults)
      dispatch(setSearchResults(searchResults));
    })
    navigate("/search");
  };

  return (
    <Box sx={{ flexGrow: 1}}>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography component="h1" variant="h5" > МійЗвук </Typography>
          {isLoggedIn ? 
          <Box sx={{display:'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor:'#ffffffeb', width:'500px', borderRadius:'5px' }}>
            <Box>
              <IconButton sx={{padding: '1px'}} onClick={() => handleSearch()}>
                    <SearchIcon/>
                </IconButton>
              </Box>
            <Box>
              <InputBase
                sx={{width: '400px'}}
                placeholder="Пошук музики…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Box>
            <Box>
              <IconButton  sx={{padding: '1px'}} onClick={() => setSearchQuery('')}>
                <CloseOutlinedIcon />
              </IconButton>
            </Box>
          </Box> 
          : null
          }
          {stateAuth.token? 
            <Box sx={{ flexGrow: 0 }}>
              <Box sx={{ display:'flex', alignItems:'center' }}>
                <Box sx={{ display:'flex', flexDirection: 'column' }}>
                  <Box sx={{ marginRight:'5px'}}>
                  Логін: {stateAuth.payload.sub.login} 
                  </Box>
                  <Box sx={{ marginRight:'5px'}}> 
                  Нікнейм: {stateAuth.aboutMe?.nick}
                  </Box>
                </Box>
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="Cindy Baker" src={`${backendUrl}${stateAuth.aboutMe?.avatar?.url}`} /> 
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