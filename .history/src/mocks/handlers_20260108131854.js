import { graphql } from 'msw';

export const handlers = [
  // login
  graphql.query('login', (req, res, ctx) => {
    const { login } = req.variables;
    return res(ctx.data({ login: `token-for-${login}` }));
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
    return res(
      ctx.data({
        PlaylistUpsert: {
          _id: playlistId || '1',
          name: namePls,
          description: descriptionPls,
          tracks: tracksId || [],
        },
      })
    );
  }),

  // searchTrack
  graphql.query('trackFind', (req, res, ctx) => {
    const title = req.variables.title ? JSON.parse(req.variables.title)[0]['id3.title'] : 'Song 1';
    return res(
      ctx.data({
        TrackFind: [
          { _id: '1', url: '/audio/song1.mp3', id3: { title, artist: 'Artist 1', album: 'Album 1' } },
        ],
      })
    );
  }),
];
