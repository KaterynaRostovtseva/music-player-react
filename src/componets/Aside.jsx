import React from "react";
import Album from '@mui/icons-material/Album';
import Audiotrack from '@mui/icons-material/Audiotrack';
// import Radio from '@mui/icons-material/Radio';
import { NavLink, Outlet } from "react-router-dom";
import Grid from '@mui/material/Grid';
import { Box } from "@mui/material";
import AudiotrackOutlinedIcon from '@mui/icons-material/AudiotrackOutlined';
import AlbumOutlinedIcon from '@mui/icons-material/AlbumOutlined';


const Aside = () => {

return (
    <Grid container sx={{my:'5px', height: '1000px', display:"flex", flexWrap: 'nowrap'}}>
            <Box style={{width: '300px', height: '1000px', padding: '30px', opacity: '0.8', display: 'flex', flexDirection: 'column',
                borderRadius: '4px', boxShadow:'0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',}}>
                <p  style={{fontSize: '20px', fontWeight: '500', marginBottom: '20px'}}>Меню</p>
                <Box className='icon'>
                    <Album />
                    < NavLink to="/playlists" className='link'>Плейлисти</ NavLink>
                </Box>
                <Box className='icon'>
                    <Audiotrack />
                    < NavLink to="/tracks" className='link'>Треки</ NavLink>
                </Box>
                {/* <Box className='icon'>
                    <Radio />
                    < NavLink to="/player" className='link'>Плеєр</ NavLink>
                </Box> */}
                <p  style={{fontSize: '20px', fontWeight: '500', marginBottom: '20px'}}>Моя медіатека</p>
                <Box className='icon'>
                    <AlbumOutlinedIcon/>
                    < NavLink to="/myPlaylist" className='link'>Мої плейлисти</ NavLink>
                </Box>
                <Box className='icon'>
                    < AudiotrackOutlinedIcon  />
                    < NavLink to="/myTracks" className='link'>Мої треки</ NavLink>
                </Box>
            </Box>
            <Grid item md={10}>
                <Outlet />
            </Grid>
    </Grid>
    )
}

export default Aside;