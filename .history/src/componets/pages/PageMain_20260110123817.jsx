import React from "react";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CssBaseline from '@mui/material/CssBaseline';
import PageRegister from "./PageRegister";
import image from '../assets/image/image.jpg';


const PageMain = (prop) => {
    const isLoggedIn = prop.props;

    return (
        <>
            {isLoggedIn && (
                <Grid container component="main" sx={{
                    height: { xs: 'auto', md: '100vh' },
                    justifyContent: 'space-around', marginTop: { xs: "40px", md: "80px" }, padding: { xs: 2, md: 0 }}}>
                    <CssBaseline />
                    <Typography variant="h3" textAlign="center" sx={{fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' }, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2}}>
                        Ласкаво просимо на сайт!
                        <Box component="img" src={image} alt="Banner" sx={{marginTop: '15px', height: { xs: '200px', md: '300px' }, width: { xs: '100%', md: '600px' },    }}/>
                    </Typography>
                </Grid>
            )}
            {!isLoggedIn && (
                <Grid container component="main" sx={{
                    height: { xs: 'auto', md: '100vh' },
                    flexWrap: { xs: "wrap", md: " nowrap" },
                    display: "flex",
                    justifyContent: "space-around",
                    padding: { xs: 2, md: 4 }
                }}>
                    <CssBaseline />
                    <Box sx={{
                        height: { xs: 'auto', md: '100hv' },
                        marginTop: { xs: "20px", md: "50px" },
                        width: { xs: "100%", md: "50%" }
                    }}>
                        <Typography variant="h3" textAlign="center" sx={{
                            marginTop: { xs: "20px", md: "80px" },
                            fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' },
                            display: 'flex',       
                            flexDirection: 'column',
                            alignItems: 'center',     
                            justifyContent: 'center',
                            gap: 2         
                        }}>
                            Ласкаво просимо на сайт!
                            <Box
                                component="img"
                                src={image}
                                alt="Banner"
                                sx={{
                                    marginTop: '15px',
                                    height: { xs: '60px', md: '100px' }, 
                                    width: 'auto',
                                    maxWidth: '100%'
                                }}
                            />
                        </Typography>
                        <Typography variant="h4" textAlign="center" sx={{
                            marginTop: { xs: "20px", md: "80px" },
                            fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2.125rem' },
                            px: { xs: 2, md: 0 }
                        }}>
                            Будь ласка, увійдіть або зареєструйтесь.
                        </Typography>
                    </Box>
                    <PageRegister />
                </Grid>
            )}
        </>

    )
}

export default PageMain;