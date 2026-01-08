import { graphql, http, HttpResponse } from 'msw';

export const handlers = [
  // login - это query, не mutation!
  graphql.query('login', ({ variables }) => {
    const { login, password } = req.variables;
    // Генерируем токен на основе логина
    const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOnsiaWQiOiIxIiwibG9naW4iOiI${login}`;
    return res(ctx.data({ login: token }));
  }),

  // registration
  graphql.mutation('reg', (req, res, ctx) => {
    const { login } = req.variables;
    return res(ctx.data({ createUser: { _id: '1', login } }));
  }),

  // getUserById
  graphql.query('oneUser', (req, res, ctx) => {
    return res(
      ctx.data({
        UserFindOne: {
          _id: '1',
          login: 'katya',
          nick: 'Katya',
          avatar: { url: '/avatars/default.png' },
        },
      })
    );
  }),

  // passwordChange
  graphql.mutation('passwordChange', (req, res, ctx) => {
    const { login } = req.variables;
    return res(ctx.data({ changePassword: { _id: '1', login } }));
  }),

  // setUserNick
  graphql.mutation('setNick', (req, res, ctx) => {
    const { _id, nick } = req.variables;
    return res(ctx.data({ UserUpsert: { _id, nick } }));
  }),

  // setAvatar
  graphql.mutation('setAvatar', (req, res, ctx) => {
    const { idUser, idImg } = req.variables;
    return res(
      ctx.data({
        UserUpsert: { _id: idUser, avatar: { _id: idImg, url: '/avatars/default.png' } },
      })
    );
  }),

  // getTracks
  graphql.query('trackFull', (req, res, ctx) => {
    return res(
      ctx.data({
        TrackFind: [
          { _id: '1', url: '/audio/song1.mp3', id3: { title: 'Song 1', artist: 'Artist 1', album: 'Album 1' } },
          { _id: '2', url: '/audio/song2.mp3', id3: { title: 'Song 2', artist: 'Artist 2', album: 'Album 2' } },
        ],
      })
    );
  }),

  // getTrackId
  graphql.query('trackOneId', (req, res, ctx) => {
    const { _id } = req.variables.idTrack ? JSON.parse(req.variables.idTrack)[0] : { _id: '1' };
    return res(
      ctx.data({
        TrackFindOne: { _id, url: '/audio/song1.mp3', id3: { title: 'Song 1', artist: 'Artist 1', album: 'Album 1' } },
      })
    );
  }),

  // getPlaylistsMy
  graphql.query('MyPlaylists', (req, res, ctx) => {
    return res(
      ctx.data({
        PlaylistFind: [
          {
            _id: '1',
            name: 'My Playlist',
            description: 'Cool songs',
            tracks: [],
          },
        ],
      })
    );
  }),

  // getTracksMy
  graphql.query('trackFind', (req, res, ctx) => {
    return res(
      ctx.data({
        TrackFind: [
          { _id: '1', url: '/audio/song1.mp3', id3: { title: 'Song 1', artist: 'Artist 1', album: 'Album 1' } },
        ],
      })
    );
  }),

  // getPlaylist
  graphql.query('plsFull', (req, res, ctx) => {
    return res(
      ctx.data({
        PlaylistFind: [
          {
            _id: '1',
            name: 'My Playlist',
            description: 'Cool songs',
            tracks: [
              { _id: '1', url: '/audio/song1.mp3', id3: { title: 'Song 1', artist: 'Artist 1', album: 'Album 1' } },
            ],
          },
        ],
      })
    );
  }),

  // getPlaylistId
  graphql.query('plsOne', (req, res, ctx) => {
    const _id = req.variables._id ? JSON.parse(req.variables._id)[0]._id : '1';
    return res(
      ctx.data({
        PlaylistFindOne: {
          _id,
          name: 'My Playlist',
          description: 'Cool songs',
          tracks: [
            { _id: '1', url: '/audio/song1.mp3', id3: { title: 'Song 1', artist: 'Artist 1', album: 'Album 1' } },
          ],
        },
      })
    );
  }),

  // deletePlaylist
  graphql.mutation('DeletePlaylist', (req, res, ctx) => {
    return res(ctx.data({ PlaylistDelete: { _id: req.variables.playlistId } }));
  }),

  // upsertPlaylist
  graphql.mutation('UpsertPlaylist', (req, res, ctx) => {
    const { playlistId, namePls, descriptionPls, tracksId } = req.variables;
    // Преобразуем tracksId в формат треков с полной информацией
    const tracks = (tracksId || []).map((track, index) => ({
      _id: track._id || `track_${index}`,
      url: `/audio/mock-track-${track._id || index}.mp3`,
      id3: {
        title: `Track ${track._id || index}`,
        artist: 'Mock Artist',
        album: 'Mock Album',
      },
    }));
    
    return res(
      ctx.data({
        PlaylistUpsert: {
          _id: playlistId || `playlist_${Date.now()}`,
          name: namePls,
          description: descriptionPls,
          tracks: tracks,
        },
      })
    );
  }),

  // searchTrack
  graphql.query('trackSearch', (req, res, ctx) => {
    const title = req.variables.title ? JSON.parse(req.variables.title)[0]['id3.title'] : 'Song 1';
    return res(
      ctx.data({
        TrackFind: [
          { _id: '1', url: '/audio/song1.mp3', id3: { title, artist: 'Artist 1', album: 'Album 1' } },
        ],
      })
    );
  }),

  // REST handlers для загрузки файлов
  http.post('/upload', async ({ request }) => {
    // Мокируем загрузку изображения
    const formData = await request.formData();
    const file = formData.get('photo');
    
    // Генерируем ID для изображения
    const imageId = `img_${Date.now()}`;
    
    return HttpResponse.json({
      _id: imageId,
      url: '/avatars/default.png',
    });
  }),

  http.post('/track', async ({ request }) => {
    // Мокируем загрузку аудио трека
    const formData = await request.formData();
    const file = formData.get('track');
    
    // Генерируем ID и URL для трека
    const trackId = `track_${Date.now()}`;
    const trackUrl = `/audio/mock-track-${trackId}.mp3`;
    
    return HttpResponse.json({
      _id: trackId,
      url: trackUrl,
    });
  }),
];
