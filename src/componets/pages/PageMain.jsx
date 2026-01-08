import React from "react";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CssBaseline from '@mui/material/CssBaseline';
import PageRegister from "./PageRegister";



const PageMain = (prop) => {

    const isLoggedIn = prop.props;

    return (
        <>
            {isLoggedIn && (
                <Grid container component="main" sx={{ height: '100vh', justifyContent: 'space-around', marginTop: "80px" }}>
                    <CssBaseline />
                    <Typography variant="h4" textAlign="center" sx={{ marginTop: "80px" }}>
                        Ласкаво просимо на сайт!
                    </Typography>
                </Grid>
            )}
            {!isLoggedIn && (
                <Grid container component="main" sx={{ height: '100hv', justifyContent: 'space-around', marginTop: "50px" }}>
                    <CssBaseline />
                    <Box sx={{ height: '100hv', justifyContent: 'space-around', marginTop: "50px" }}>
                    < Typography variant="h3" textAlign="center" marginTop="80px">
                        Ласкаво просимо на сайт!
                        </Typography>
                    < Typography variant="h4" textAlign="center" marginTop="80px">
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