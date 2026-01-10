import React from "react";
import Album from '@mui/icons-material/Album';
import Audiotrack from '@mui/icons-material/Audiotrack';
// import Radio from '@mui/icons-material/Radio';
import { NavLink, Outlet } from "react-router-dom";
import Grid from '@mui/material/Grid';
import { Box, Drawer, useMediaQuery, useTheme } from "@mui/material";
import AudiotrackOutlinedIcon from '@mui/icons-material/AudiotrackOutlined';
import AlbumOutlinedIcon from '@mui/icons-material/AlbumOutlined';
import { useDrawer } from './DrawerContext';


const Aside = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { mobileOpen, setMobileOpen, toggleDrawer } = useDrawer();

    const menuContent = (
        <Box sx={{
            width: { xs: 250, sm: 300 },
            height: { xs: '100%', md: '1000px' },
            padding: { xs: 2, md: '30px' },
            opacity: '0.8',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: { xs: 0, md: '4px' },
            boxShadow: { xs: 'none', md: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)' }
        }}>
            <p style={{ fontSize: { xs: '18px', md: '20px' }, fontWeight: '500', marginBottom: '20px' }}>Меню</p>
            <Box className='icon'>
                <Album />
                <NavLink to="/playlists" className='link' onClick={() => isMobile && setMobileOpen(false)}>Плейлисти</NavLink>
            </Box>
            <Box className='icon'>
                <Audiotrack />
                <NavLink to="/tracks" className='link' onClick={() => isMobile && setMobileOpen(false)}>Треки</NavLink>
            </Box>
            <p style={{ fontSize: { xs: '18px', md: '20px' }, fontWeight: '500', marginBottom: '20px', marginTop: '20px' }}>Моя медіатека</p>
            <Box className='icon'>
                <AlbumOutlinedIcon/>
                <NavLink to="/myPlaylist" className='link' onClick={() => isMobile && setMobileOpen(false)}>Мої плейлисти</NavLink>
            </Box>
            <Box className='icon'>
                <AudiotrackOutlinedIcon />
                <NavLink to="/myTracks" className='link' onClick={() => isMobile && setMobileOpen(false)}>Мої треки</NavLink>
            </Box>
        </Box>
    );

    return (
        <Grid container sx={{ my: { xs: 1, md: '5px' }, height: { xs: 'auto', md: '1000px' }, display: "flex", flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
            {isMobile ? (
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={toggleDrawer}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
                    }}
                >
                    {menuContent}
                </Drawer>
            ) : (
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    {menuContent}
                </Box>
            )}
            <Grid item xs={12} md={10} sx={{ width: { xs: '100%', md: 'auto' } }}>
                <Outlet />
            </Grid>
        </Grid>
    )
}

export default Aside;