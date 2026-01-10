import { graphql, http, HttpResponse } from 'msw';
import { saveTrack, saveImage } from './indexedDB';

// Простой тестовый audio Data URL (1 секунда тишины в WAV формате)
const TEST_AUDIO_URL = 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==';

// Helper function to handle GraphQL requests
const handleGraphQL = (request, handlers) => {
  // handlers is an object mapping operationName to handler function
  return request.json().then(({ operationName, variables }) => {
    const handler = handlers[operationName];
    if (handler) {
      return handler({ variables });
    }
    return HttpResponse.json({
      errors: [{ message: `Unknown operation: ${operationName}` }],
    }, { status: 400 });
  });
};

export const handlers = [
  // ===== GraphQL Endpoint =====
  http.post('/graphql', async (info) => {
    const { request } = info;
    
    try {
      const body = await request.json();
      const { operationName, variables } = body;

      // Handle login query
      if (operationName === 'login') {
        const { login } = variables || {};
        // Создаём валидный JWT: header.payload.signature
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({ 
          login, 
          _id: '1',
          iat: Math.floor(Date.now() / 1000) 
        }));
        const signature = 'mock-signature';
        const token = `${header}.${payload}.${signature}`;
        
        return HttpResponse.json({
          data: { login: token },
        });
      }

      // Handle registration mutation
      if (operationName === 'reg') {
        const { login } = variables || {};
        return HttpResponse.json({
          data: { createUser: { _id: '1', login } },
        });
      }

      // Handle oneUser query
      if (operationName === 'oneUser') {
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
      }

      // Handle passwordChange mutation
      if (operationName === 'passwordChange') {
        return HttpResponse.json({
          data: { changePassword: true },
        });
      }

      // Handle setNick mutation
      if (operationName === 'setNick') {
        const { _id, nick } = variables || {};
        return HttpResponse.json({
          data: { UserUpsert: { _id: _id || '1', nick } },
        });
      }

      // Handle setAvatar mutation
      if (operationName === 'setAvatar') {
        const { idUser, idImg } = variables || {};
        return HttpResponse.json({
          data: {
            UserUpsert: {
              _id: idUser || '1',
              avatar: { _id: idImg || 'img1', url: '/avatars/default.png' },
            },
          },
        });
      }

      // Handle trackFull query
      if (operationName === 'trackFull') {
        return HttpResponse.json({
          data: {
            TrackFind: [
              {
                _id: '1',
                url: TEST_AUDIO_URL,
                id3: { title: 'Song 1', artist: 'Artist 1', album: 'Album 1' },
              },
              {
                _id: '2',
                url: TEST_AUDIO_URL,
                id3: { title: 'Song 2', artist: 'Artist 2', album: 'Album 2' },
              },
            ],
          },
        });
      }

      // Handle trackOneId query
      if (operationName === 'trackOneId') {
        return HttpResponse.json({
          data: {
            TrackFindOne: {
              _id: '1',
              url: TEST_AUDIO_URL,
              id3: { title: 'Song 1', artist: 'Artist 1', album: 'Album 1' },
            },
          },
        });
      }

      // Handle trackFind query
      if (operationName === 'trackFind') {
        return HttpResponse.json({
          data: {
            TrackFind: [
              {
                _id: '1',
                url: TEST_AUDIO_URL,
                id3: { title: 'Song 1', artist: 'Artist 1', album: 'Album 1' },
              },
            ],
          },
        });
      }

      // Handle MyPlaylists query
      if (operationName === 'MyPlaylists') {
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
      }

      // Handle plsFull query
      if (operationName === 'plsFull') {
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
                    url: TEST_AUDIO_URL,
                    id3: { title: 'Song 1', artist: 'Artist 1', album: 'Album 1' },
                  },
                ],
              },
            ],
          },
        });
      }

      // Handle plsOne query
      if (operationName === 'plsOne') {
        return HttpResponse.json({
          data: {
            PlaylistFindOne: {
              _id: '1',
              name: 'My Playlist',
              description: 'Cool songs',
              tracks: [
                {
                  _id: '1',
                  url: TEST_AUDIO_URL,
                  id3: { title: 'Song 1', artist: 'Artist 1', album: 'Album 1' },
                },
              ],
            },
          },
        });
      }

      // Handle DeletePlaylist mutation
      if (operationName === 'DeletePlaylist') {
        return HttpResponse.json({
          data: { PlaylistDelete: { _id: variables?.playlistId || '1' } },
        });
      }

      // Handle UpsertPlaylist mutation
      if (operationName === 'UpsertPlaylist') {
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
      }

      // Handle trackSearch query
      if (operationName === 'trackSearch') {
        const title = variables?.title || 'Song';
        return HttpResponse.json({
          data: {
            TrackFind: [
              {
                _id: '1',
                url: TEST_AUDIO_URL,
                id3: { title, artist: 'Artist 1', album: 'Album 1' },
              },
            ],
          },
        });
      }

      // Unknown operation
      return HttpResponse.json({
        errors: [{ message: `Unknown operation: ${operationName}` }],
      }, { status: 400 });
    } catch (error) {
      return HttpResponse.json({
        errors: [{ message: 'Failed to parse GraphQL request' }],
      }, { status: 400 });
    }
  }),



  // ===== REST UPLOAD MOCKS =====

  http.post('/upload', async ({ request }) => {
    try {
      const formData = await request.formData();
      const file = formData.get('file');
      
      if (file) {
        const imageData = await saveImage(file);
        return HttpResponse.json({
          _id: imageData._id,
          url: imageData.url,
        });
      }
      
      return HttpResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    } catch (error) {
      console.error('Upload error:', error);
      return HttpResponse.json(
        { error: 'Upload failed' },
        { status: 500 }
      );
    }
  }),

  http.post('/track', async ({ request }) => {
    try {
      const formData = await request.formData();
      const file = formData.get('file');
      
      if (file) {
        const trackData = await saveTrack(file);
        return HttpResponse.json({
          _id: trackData._id,
          url: trackData.url,
          id3: trackData.id3,
        });
      }
      
      return HttpResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    } catch (error) {
      console.error('Track upload error:', error);
      return HttpResponse.json(
        { error: 'Upload failed' },
        { status: 500 }
      );
    }
  }),
];

