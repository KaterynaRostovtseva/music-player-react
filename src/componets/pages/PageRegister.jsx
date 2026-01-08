import React, { useState } from 'react';
import { useRegistrationMutation, useLoginMutation } from '../../redux/api';
import { useDispatch } from 'react-redux';
import { logIn } from '../../redux/slice/authSlice';
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Fade from '@mui/material/Fade';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';



function validateLogin(login) {
    return login.length > 0;
}

function validatePassword(password) {
    return password.length >= 6;
}

function validateRepeatPassword(password, repeatPassword) {
    return password === repeatPassword;
}

export default function PageRegister(prop) {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
    const [loginError, setLoginError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [repeatPasswordError, setRepeatPasswordError] = useState(false);
    const [loginQuery] = useLoginMutation();
    const [registrationMutation] = useRegistrationMutation();
    const [selectLog, selectOnLog] = useState(false);
    const [loading, setLoading] = React.useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onReg = async () => {
        setLoading(true);
        try {
            const response = await registrationMutation({ login, password });
            if (response.data.createUser !== null) {
                const res = await loginQuery({ login, password });
                setLoading(false);
                if (res.data) {
                    dispatch(logIn(res.data.login));
                    setLogin('');
                    setPassword('');
                    navigate("/");
                }
            }
        } catch (error) {
            console.error('Помилка авторизації', error);
            setLoading(false);
        }
    };

    const onLogin = async () => {
        setLoading(true);
        try {
            const response = await loginQuery({ login, password });
            setLoading(false);
            if (response.data) {
                dispatch(logIn(response.data.login));
                setLogin('');
                setPassword('');
                navigate("/");
            }
        } catch (error) {
            console.error('Помилка авторизації', error);
            setLoading(false);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // Перевірка валідації перед відправленням даних
        if (selectLog) {
            if (validateLogin(login) && validatePassword(password)) {
                onLogin(login, password);
            } else {
                setLoginError(!validateLogin(login));
                setPasswordError(!validatePassword(password));
            }
        } else {
            if (validateLogin(login) && validatePassword(password) && validateRepeatPassword(password, repeatPassword)) {
                onReg(login, password);
            }
            else {
                setLoginError(!validateLogin(login));
                setPasswordError(!validatePassword(password));
                setRepeatPasswordError(!validateRepeatPassword(password, repeatPassword));
            }
        }
    };

    const handleLoginChange = (e) => {
        const value = e.target.value;
        setLogin(value);
        if (validateLogin(value)) {
            setLoginError(false);
        }
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        if (validatePassword(value)) {
            setPasswordError(false);
        }
    };

    const handleRepeatPasswordChange = (e) => {
        const value = e.target.value;
        setRepeatPassword(value);
        if (validateRepeatPassword(password, value)) {
            setRepeatPasswordError(false);
        }
    };

    return (
        <Grid item md={4} component={Paper} elevation={6} square>
            <Box sx={{ height: 40 }}>
                <Fade
                    in={loading}
                    style={{
                        transitionDelay: loading ? '800ms' : '0ms',
                    }}
                    unmountOnExit
                >
                    <CircularProgress />
                </Fade>
            </Box>
            <Box sx={{ my: 8, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <LockOutlinedIcon />
                <Typography component="h1" variant="h5">
                    {selectLog ? 'Авторизація' : 'Реєстрація'}
                </Typography>
                <Box component="form" noValidate onSubmit={(e) => handleSubmit(e)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                name="login"
                                label="Логін"
                                type="login"
                                autoComplete="login"
                                value={login}
                                onChange={handleLoginChange}
                                error={loginError}
                                helperText={loginError ? 'Логін не може бути пустим' : ''}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                name="password"
                                label="Пароль"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                value={password}
                                onChange={handlePasswordChange}
                                error={passwordError}
                                helperText={passwordError ? 'Пароль повинен бути не менше 6 символів' : ''}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            {selectLog ? null :
                                <TextField
                                    required
                                    fullWidth
                                    name="repeatPassword"
                                    label="Повторіть пароль"
                                    type={showRepeatPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    value={repeatPassword}
                                    onChange={handleRepeatPasswordChange}
                                    error={repeatPasswordError}
                                    helperText={repeatPasswordError ? 'Паролі не співпадають' : ''}
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton
                                                onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                                                edge="end"
                                            >
                                                {showRepeatPassword ? <Visibility /> : <VisibilityOff />}
                                            </IconButton>
                                        ),
                                    }}
                                />
                            }

                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, ml: 2 }}
                        >
                            {selectLog ? 'Авторизуватися' : 'Зареєструватися'}
                        </Button>
                        <Grid item>
                            Вже є обліковий запис?
                            {!selectLog ? <Button onClick={() => selectOnLog(true)} variant="body2" sx={{ ml: 2, color: '#304ffe' }}>Увійти</Button>
                                : <Button onClick={() => selectOnLog(false)} variant="body2" sx={{ ml: 2, color: '#304ffe' }}> Зареструватися</Button>}
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Grid>
    )
}

