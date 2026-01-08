import { graphql, http, HttpResponse } from 'msw';


export const handlers = [
  // ===== AUTH =====

  graphql.query('login', ({ variables }) => {
    const { login } = variables || {};
    const token = `mock-token-for-${login || 'user'}`;

    return HttpResponse.json({
      data: { login: token },
    });
  }),

  graphql.mutation('reg', ({ variables }) => {
    const { login } = variables || {};

    return HttpResponse.json({
      data: { createUser: { _id: '1', login } },
    });
  }),

  graphql.query('oneUser', () => {
    return HttpResponse.json({
      data: {
        UserFindOne: {
          _id: '1',
          login: 'katya',
          nick: 'Katya',
          avatar: { url: '/avatars/default.png' },
        },
      },
    });
  }),

  graphql.mutation('passwordChange', () => {
    return HttpResponse.json({
      data: { changePassword: true },
    });
  }),

  graphql.mutation('setNick', ({ variables }) => {
    const { _id, nick } = variables || {};

    return HttpResponse.json({
      data: { UserUpsert: { _id: _id || '1', nick } },
    });
  }),

  graphql.mutation('setAvatar', ({ variables }) => {
    const { idUser, idImg } = variables || {};

    return HttpResponse.json({
      data: {
        UserUpsert: {
          _id: idUser || '1',
          avatar: { _id: idImg || 'img1', url: '/avatars/default.png' },
        },
      },
    });
  }),

  // ===== TRACKS =====

  graphql.query('trackFull', () => {
    return HttpResponse.json({
      data: {
        TrackFind: [
          {
            _id: '1',
            url: '/audio/song1.mp3',
            id3: { title: 'Song 1', artist: 'Artist 1', album: 'Album 1' },
          },
          {
            _id: '2',
            url: '/audio/song2.mp3',
            id3: { title: 'Song 2', artist: 'Artist 2', album: 'Album 2' },
          },
        ],
      },
    });
  }),

  graphql.query('trackOneId', () => {
    return HttpResponse.json({
      data: {
        TrackFindOne: {
          _id: '1',
          url: '/audio/song1.mp3',
          id3: { title: 'Song 1', artist: 'Artist 1', album: 'Album 1' },
        },
      },
    });
  }),

  graphql.query('trackFind', () => {
    return HttpResponse.json({
      data: {
        TrackFind: [
          {
            _id: '1',
            url: '/audio/song1.mp3',
            id3: { title: 'Song 1', artist: 'Artist 1', album: 'Album 1' },
          },
        ],
      },
    });
  }),

  // ===== PLAYLISTS =====

  graphql.query('MyPlaylists', () => {
    return HttpResponse.json({
      data: {
        PlaylistFind: [
          {
            _id: '1',
            name: 'My Playlist',
            description: 'Cool songs',
            tracks: [],
          },
        ],
      },
    });
  }),

  graphql.query('plsFull', () => {
    return HttpResponse.json({
      data: {
        PlaylistFind: [
          {
            _id: '1',
            name: 'My Playlist',
            description: 'Cool songs',
            tracks: [
              {
                _id: '1',
                url: '/audio/song1.mp3',
                id3: { title: 'Song 1', artist: 'Artist 1', album: 'Album 1' },
              },
            ],
          },
        ],
      },
    });
  }),

  graphql.query('plsOne', () => {
    return HttpResponse.json({
      data: {
        PlaylistFindOne: {
          _id: '1',
          name: 'My Playlist',
          description: 'Cool songs',
          tracks: [
            {
              _id: '1',
              url: '/audio/song1.mp3',
              id3: { title: 'Song 1', artist: 'Artist 1', album: 'Album 1' },
            },
          ],
        },
      },
    });
  }),

  graphql.mutation('DeletePlaylist', ({ variables }) => {
    return HttpResponse.json({
      data: { PlaylistDelete: { _id: variables?.playlistId || '1' } },
    });
  }),

  graphql.mutation('UpsertPlaylist', ({ variables }) => {
    const { playlistId, namePls, descriptionPls, tracksId } = variables || {};

    const tracks =
      tracksId?.map((t, i) => ({
        _id: t?._id || `track_${i}`,
        url: `/audio/mock-${i}.mp3`,
        id3: { title: `Track ${i}`, artist: 'Mock Artist', album: 'Mock Album' },
      })) || [];

    return HttpResponse.json({
      data: {
        PlaylistUpsert: {
          _id: playlistId || '1',
          name: namePls || 'My Playlist',
          description: descriptionPls || 'Cool songs',
          tracks,
        },
      },
    });
  }),

  graphql.query('trackSearch', ({ variables }) => {
    const title = variables?.title || 'Song';

    return HttpResponse.json({
      data: {
        TrackFind: [
          {
            _id: '1',
            url: '/audio/song1.mp3',
            id3: { title, artist: 'Artist 1', album: 'Album 1' },
          },
        ],
      },
    });
  }),

  // ===== REST UPLOAD MOCKS =====

  http.post('/upload', async () => {
    return HttpResponse.json({
      _id: `img_${Date.now()}`,
      url: '/avatars/default.png',
    });
  }),

  http.post('/track', async () => {
    return HttpResponse.json({
      _id: `track_${Date.now()}`,
      url: '/audio/mock-track.mp3',
    });
  }),
];

