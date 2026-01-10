import React from "react";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CssBaseline from '@mui/material/CssBaseline';
import PageRegister from "./PageRegister";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import image from '../assets/image';


const PageMain = (prop) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isLoggedIn = prop.props;

    return (
        <>
            {isLoggedIn && (
                <Grid container component="main" sx={{
                    height: { xs: 'auto', md: '100vh' },
                    justifyContent: 'space-around',
                    marginTop: { xs: "40px", md: "80px" },
                    padding: { xs: 2, md: 0 }
                }}>
                    <CssBaseline />
                    <Typography variant="h4" textAlign="center" sx={{
                        marginTop: { xs: "40px", md: "80px" },
                        fontSize: { xs: '1.5rem', md: '2.125rem' },
                        px: { xs: 2, md: 0 }
                    }}>
                        Ласкаво просимо на сайт!
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
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            Ласкаво просимо на сайт!
                            <img
                                src="image"
                                style={{ marginLeft: '15px', height: '1em' }} // '1em' підлаштує розмір під текст
                                alt="logo"
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