import { graphql, http, HttpResponse } from 'msw';
import { saveTrack, saveImage, getAllTracks, deleteTrack,
  upsertPlaylist, getAllPlaylists, getPlaylist, deletePlaylist, getTrack } from './indexedDB';

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
        const tracks = await getAllTracks();
        const defaultTracks = [
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
        ];
        return HttpResponse.json({
          data: {
            TrackFind: tracks.length > 0 ? tracks : defaultTracks,
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

      // Handle trackFind query (для "Мої треки" - фильтр по владельцу)
      if (operationName === 'trackFind') {
        // В реальном API это бы фильтровало по ___owner
        // Для моков просто возвращаем все загруженные треки
        const tracks = await getAllTracks();
        return HttpResponse.json({
          data: {
            TrackFind: tracks.length > 0 ? tracks : [],
          },
        });
      }

      // Handle MyPlaylists query - return playlists from IndexedDB
      if (operationName === 'MyPlaylists') {
        const pls = await getAllPlaylists();
        const defaultPls = [
          {
            _id: '1',
            name: 'My Playlist',
            description: 'Cool songs',
            tracks: [],
          },
        ];
        return HttpResponse.json({
          data: {
            PlaylistFind: pls && pls.length > 0 ? pls : defaultPls,
          },
        });
      }

      // Handle plsFull query - return full playlists (with tracks) from IndexedDB
      if (operationName === 'plsFull') {
        const pls = await getAllPlaylists();
        if (pls && pls.length > 0) {
          // ensure tracks are full objects (try to resolve by id)
          const resolved = await Promise.all(pls.map(async (p) => {
            const tracks = await Promise.all((p.tracks || []).map(async (t) => {
              const id = t && t._id ? t._id : (typeof t === 'string' ? t : null);
              if (id) {
                const full = await getTrack(id);
                return full || { _id: id, url: TEST_AUDIO_URL, id3: { title: 'Unknown', artist: 'Unknown', album: '' } };
              }
              return t;
            }));
            return { ...p, tracks };
          }));

          return HttpResponse.json({ data: { PlaylistFind: resolved } });
        }

        // fallback default
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

      // Handle plsOne query - return single playlist from IndexedDB
      if (operationName === 'plsOne') {
        const id = variables?.playlistId;
        if (id) {
          const p = await getPlaylist(id);
          if (p) {
            // resolve tracks
            const tracks = await Promise.all((p.tracks || []).map(async (t) => {
              const tid = t && t._id ? t._id : (typeof t === 'string' ? t : null);
              if (tid) return (await getTrack(tid)) || { _id: tid, url: TEST_AUDIO_URL, id3: { title: 'Unknown' } };
              return t;
            }));
            return HttpResponse.json({ data: { PlaylistFindOne: { ...p, tracks } } });
          }
        }

        // fallback
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

      // Handle DeletePlaylist mutation - remove from IndexedDB
      if (operationName === 'DeletePlaylist') {
        const id = variables?.playlistId;
        if (id) {
          await deletePlaylist(id);
          return HttpResponse.json({ data: { PlaylistDelete: { _id: id } } });
        }
        return HttpResponse.json({ data: { PlaylistDelete: { _id: '1' } } });
      }

      // Handle UpsertPlaylist mutation - save to IndexedDB
      if (operationName === 'UpsertPlaylist') {
        const { playlistId, namePls, descriptionPls, tracksId } = variables || {};
        const _id = playlistId || `pls_${Date.now()}`;

        const tracks = await Promise.all((tracksId || []).map(async (t, i) => {
          const tid = t && t._id ? t._id : (typeof t === 'string' ? t : null);
          if (tid) {
            const full = await getTrack(tid);
            return full || { _id: tid, url: TEST_AUDIO_URL, id3: { title: `Track ${i}`, artist: 'Unknown' } };
          }
          return {
            _id: `track_temp_${i}`,
            url: TEST_AUDIO_URL,
            id3: { title: `Track ${i}`, artist: 'Unknown' },
          };
        }));

        const playlist = {
          _id,
          name: namePls || 'My Playlist',
          description: descriptionPls || 'Cool songs',
          tracks,
        };

        await upsertPlaylist(playlist);

        return HttpResponse.json({ data: { PlaylistUpsert: playlist } });
      }

      // Handle trackSearch query
      if (operationName === 'trackSearch') {
        const title = variables?.title || 'Song';
        const tracks = await getAllTracks();
        
        const filtered = tracks.filter(t => 
          t.id3?.title?.toLowerCase().includes(title.toLowerCase())
        );
        
        const result = filtered.length > 0 ? filtered : [
          {
            _id: '1',
            url: TEST_AUDIO_URL,
            id3: { title, artist: 'Artist 1', album: 'Album 1' },
          },
        ];
        
        return HttpResponse.json({
          data: {
            TrackFind: result,
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
      // find first File value in formData regardless of field name
      let file = null;
      for (const pair of formData.entries()) {
        const [, value] = pair;
        if (value && value instanceof File) {
          file = value;
          break;
        }
      }

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
      // accept any field name containing the file
      let file = null;
      for (const pair of formData.entries()) {
        const [, value] = pair;
        if (value && value instanceof File) {
          file = value;
          break;
        }
      }

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
  // DELETE track by id
  http.delete('/track', async ({ request }) => {
    try {
      const body = await request.json();
      const id = body?._id;
      if (!id) {
        return HttpResponse.json({ error: 'No id provided' }, { status: 400 });
      }
      await deleteTrack(id);
      return HttpResponse.json({ _id: id });
    } catch (error) {
      console.error('Track delete error:', error);
      return HttpResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
  }),
];

