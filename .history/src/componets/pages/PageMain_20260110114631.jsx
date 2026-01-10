import React from "react";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CssBaseline from '@mui/material/CssBaseline';
import PageRegister from "./PageRegister";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';



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
                    justifyContent: 'space-around',
                    flexWrap: { xs: "wrap", md: " nowrap" },
                    marginTop: { xs: "20px", md: "50px" },
                    padding: { xs: 2, md: 0 }
                }}>
                    <CssBaseline />
                    <Box sx={{ 
                        height: { xs: 'auto', md: '100hv' }, 
                        justifyContent: 'space-around', 
                        marginTop: { xs: "20px", md: "50px" },
                        width: '100%'
                    }}>
                        <Typography variant="h3" textAlign="center" sx={{ 
                            marginTop: { xs: "20px", md: "80px" },
                            fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' },
                            px: { xs: 2, md: 0 }
                        }}>
                            Ласкаво просимо на сайт!
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