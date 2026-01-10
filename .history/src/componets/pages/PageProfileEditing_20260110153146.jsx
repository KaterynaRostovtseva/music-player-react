import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import EditIcon from '@mui/icons-material/Edit';
import Basic from '../Dropzone/Basic';
import { useNavigate } from 'react-router-dom';
import { useSetUserNickMutation, useSetAvatarMutation, useGetUserByIdQuery, usePasswordChangeMutation, api } from '../../redux/api';
import { setAboutMe } from "../../redux/slice/authSlice";
import store from '../../redux/store';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';


const PageProfileEditing = () => {

    const stateAuth = useSelector((state) => state.persistedReducer.auth);
    const userId = stateAuth?.payload?._id || stateAuth?.payload?.sub?.id;
    const user = stateAuth.aboutMe || {};
    const [showNikInput, setShowNikInput] = useState(false);
    const [showAvatarInput, setShowAvatarInput] = useState(false);
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [newNick, setNewNick] = useState(user.nick || '');
    const [newAvatar, setNewAvatar] = useState('');
    const [newAvatarUrl, setNewAvatarUrl] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
    const [avatarMutation] = useSetAvatarMutation();
    const [setPasswordChangeMutation] = usePasswordChangeMutation();
    const [setUserNickMutation] = useSetUserNickMutation();
    const { data, isLoading, refetch } = useGetUserByIdQuery({ _id: userId });

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        if (!isLoading && data && !isUpdatingAvatar) {
            dispatch(setAboutMe(data.UserFindOne));
        }
    }, [data, isLoading, dispatch, isUpdatingAvatar]);

    const saveNick = async () => {
        if (!newNick.trim()) {
            alert('Нікнейм не може бути порожнім');
            return;
        }
        try {
            const res = await setUserNickMutation({ _id: userId, nick: newNick });
            if (res && !res.error && res.data?.UserUpsert) {
                const updatedUser = {
                    ...user,
                    nick: res.data.UserUpsert.nick
                };
                dispatch(setAboutMe(updatedUser));
                setShowNikInput(false);
            } else {
                alert('Помилка при збереженні нікнейма');
            }
        } catch (error) {
            console.error('Помилка при збереженні нікнейма:', error);
            alert('Помилка при збереженні нікнейма');
        }
    }

    const getNewAvatar = (result, url) => {
        setNewAvatar(result);
        if (url) {
            setNewAvatarUrl(url);
        }
    }

    const saveAvatar = async () => {
        if (!newAvatar) {
            alert('Будь ласка, спочатку завантажте зображення');
            return;
        }
        try {
            setIsUpdatingAvatar(true);
            let res = await avatarMutation({ idUser: userId, idImg: newAvatar });
            console.log('Avatar mutation response:', res);
            if (res && !res.error) {
                if (res.data?.UserUpsert?.avatar && userId) {
                    const userAvatars = JSON.parse(localStorage.getItem('userAvatars') || '{}');
                    const avatarData = {
                        _id: res.data.UserUpsert.avatar._id,
                        url: res.data.UserUpsert.avatar.url
                    };
                    userAvatars[userId] = avatarData;
                    userAvatars[String(userId)] = avatarData; 
                    if (user._id) {
                        userAvatars[user._id] = avatarData;
                        userAvatars[String(user._id)] = avatarData;
                    }
                    userAvatars['1'] = avatarData; 
                    localStorage.setItem('userAvatars', JSON.stringify(userAvatars));
                    console.log('Saved avatar to localStorage for userId:', userId, 'user._id:', user._id, 'data:', avatarData);
                    console.log('All userAvatars:', userAvatars);
                } else {
                    console.error('Cannot save avatar: userId is', userId, 'avatar:', res.data?.UserUpsert?.avatar);
                }
                
                if (res.data?.UserUpsert?.avatar) {
                    const updatedUser = {
                        ...user,
                        avatar: res.data.UserUpsert.avatar
                    };
                    console.log('Updating aboutMe with:', updatedUser);
                    dispatch(setAboutMe(updatedUser));
                }
                setIsUpdatingAvatar(false);
                setNewAvatar('');
                setNewAvatarUrl('');
            } else {
                setIsUpdatingAvatar(false);
            }
        } catch (error) {
            console.error('Помилка при збереженні аватара:', error);
            alert('Помилка при збереженні аватара');
            setIsUpdatingAvatar(false);
        }
        setShowAvatarInput(false);
    }

    const savePassword = async () => {
        if (!password.trim()) {
            alert('Будь ласка, введіть поточний пароль');
            return;
        }
        if (!newPassword.trim()) {
            alert('Будь ласка, введіть новий пароль');
            return;
        }
        if (newPassword.length < 6) {
            alert('Новий пароль повинен містити мінімум 6 символів');
            return;
        }
        if (password === newPassword) {
            alert('Новий пароль повинен відрізнятися від поточного');
            return;
        }
        
        try {
            const res = await setPasswordChangeMutation({ 
                login: user.login, 
                password: password, 
                newPassword: newPassword 
            });
            
            if (res && !res.error) {
                alert('Пароль успішно змінено');
                setNewPassword('');
                setPassword('');
                setShowPasswordInput(false);
            } else {
                alert('Помилка при зміні пароля. Перевірте поточний пароль.');
            }
        } catch (error) {
            console.error('Помилка при зміні пароля:', error);
            alert('Помилка при зміні пароля');
        }
    }


    return (
        <Grid item xs={12} md={10} sx={{ my: { xs: 2, md: 3 }, mx: { xs: 1, sm: 2, md: 10 }, boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)' }}>
            <Box sx={{ mx: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column' }}>
                <Typography component="h1" variant="h4" sx={{ my: { xs: 3, md: 5 }, mx: { xs: 0, md: 4 }, textAlign: 'center', fontSize: { xs: '1.5rem', md: '2.125rem' }}}>
                    Редагування особистих данних
                </Typography>
                <Box component="form" sx={{ width: { xs: '100%', sm: '100%', md: '600px' }, maxWidth: '100%' }} >
                    <Grid container sx={{ my: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, gap: { xs: 2, md: 0 } }} >
                        <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                <Typography sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>Редагувати аватар:</Typography>
                                {user.avatar?.url && (
                                    <Avatar src={user.avatar.url} alt="Поточний аватар" sx={{ width: { xs: 48, md: 64 }, height: { xs: 48, md: 64 } }}/>
                                )}
                            </Box>
                        </Grid>
                        {showAvatarInput ?
                            <Grid item xs={12} md={8}>
                                <Basic uploadResult={(result, url) => getNewAvatar(result, url)}></Basic>
                                {newAvatarUrl && (
                                    <Box sx={{ my: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                        <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>Прев'ю нового аватара:</Typography>
                                        <Avatar src={newAvatarUrl} alt="Новий аватар" sx={{ width: { xs: 48, md: 64 }, height: { xs: 48, md: 64 } }}/>
                                    </Box>
                                )}
                                <Box sx={{ display: 'flex', gap: 2, my: 2, flexWrap: 'wrap' }}>
                                    <Button variant="contained" onClick={() => saveAvatar()} disabled={!newAvatar} size={isMobile ? 'small' : 'medium'}>
                                        Зберегти
                                    </Button>
                                    <Button variant="outlined" 
                                        onClick={() => {
                                            setShowAvatarInput(false);
                                            setNewAvatar('');
                                            setNewAvatarUrl('');
                                        }} size={isMobile ? 'small' : 'medium'}>
                                        Скасувати
                                    </Button>
                                </Box>
                            </Grid>
                            :
                            <Grid item xs={12} md={1}>
                                <IconButton onClick={() => setShowAvatarInput(true)} sx={{ p: 0 }}>
                                    <EditIcon />
                                </IconButton>
                            </Grid>
                        }
                    </Grid>
                    <Grid container sx={{ my: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'baseline' }, gap: { xs: 2, md: 0 } }}>
                        <Grid item xs={12} md={4}>
                            <Typography sx={{ fontSize: { xs: '0.9rem', md: '1rem' }, wordBreak: 'break-word' }}>
                                Редагувати нікнейм: {user.nick ? `${user.nick}` : 'Нікнейм не призначений'}
                            </Typography>
                        </Grid>
                        {showNikInput ?
                            <Grid item xs={12} md={6}>
                                <TextField fullWidth label="Нікнейм" value={newNick} onChange={(e) => setNewNick(e.target.value)} size={window.innerWidth < 600 ? 'small' : 'medium'} />
                                <Box sx={{ display: 'flex', gap: 2, my: 2, flexWrap: 'wrap' }}>
                                    <Button variant="contained" onClick={() => saveNick()} size={isMobile ? 'small' : 'medium'}>
                                        Зберегти
                                    </Button>
                                    <Button variant="outlined" onClick={() => setShowNikInput(false)} size={isMobile ? 'small' : 'medium'}>
                                        Скасувати
                                    </Button>
                                </Box>
                            </Grid>
                            :
                            <Grid item xs={12} md={1}>
                                <IconButton onClick={() => setShowNikInput(true)} sx={{ p: 0 }}>
                                    <EditIcon />
                                </IconButton>
                            </Grid>
                        }

                    </Grid>
                    <Grid container sx={{ my: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'baseline' }, gap: { xs: 2, md: 0 } }} >
                        <Grid item xs={12} md={4}>
                            <Typography sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>Редагувати пароль:</Typography>
                        </Grid>
                        {showPasswordInput ?
                            <Grid item xs={12} md={6}>
                                <TextField
                                    sx={{ my: 1 }}
                                    required
                                    fullWidth
                                    type="password"
                                    label="Поточний пароль"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    size={window.innerWidth < 600 ? 'small' : 'medium'}
                                />
                                <TextField
                                    required
                                    fullWidth
                                    type="password"
                                    label="Новий пароль"
                                    autoComplete="new-password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    helperText="Мінімум 6 символів"
                                    size={window.innerWidth < 600 ? 'small' : 'medium'}
                                />
                                <Box sx={{ display: 'flex', gap: 2, my: 2, flexWrap: 'wrap' }}>
                                    <Button variant="contained" onClick={() => savePassword()} size={isMobile ? 'small' : 'medium'}>
                                        Зберегти
                                    </Button>
                                    <Button 
                                        variant="outlined" 
                                        onClick={() => setShowPasswordInput(false)}
                                        size={isMobile ? 'small' : 'medium'}
                                    >
                                        Скасувати
                                    </Button>
                                </Box>
                            </Grid>
                            :
                            <Grid item xs={12} md={1}>
                                <IconButton onClick={() => setShowPasswordInput(true)} sx={{ p: 0 }}>
                                    <EditIcon />
                                </IconButton>
                            </Grid>
                        }
                    </Grid>
                </Box>
                <Grid sx={{ my: { xs: 4, md: 6 }, display: 'flex', justifyContent: 'center' }}>
                    <Button 
                        variant="contained" 
                        onClick={() => navigate(-1)}
                        size={window.innerWidth < 600 ? 'small' : 'medium'}
                    >
                        Вийти
                    </Button>
                </Grid>
            </Box>
        </Grid>
    )
}

export default PageProfileEditing;