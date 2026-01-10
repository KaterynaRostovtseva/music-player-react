import { graphql, http, HttpResponse } from 'msw';
import { saveTrack, saveImage, getAllTracks, deleteTrack,
  upsertPlaylist, getAllPlaylists, getPlaylist, deletePlaylist, getTrack,
  getAllTracksByOwner, getAllPlaylistsByOwner, upsertPlaylistWithOwner, getImage } from './indexedDB';

// Простой тестовый audio Data URL (1 секунда тишины в WAV формате)
const TEST_AUDIO_URL = 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==';

// Extract user id from Authorization header (Bearer token or token)
const getUserIdFromRequest = (req) => {
  try {
    const auth = (req.headers && req.headers.get && req.headers.get('authorization')) || '';
    const token = auth.split(' ').pop();
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload._id || (payload.sub && payload.sub.id) || null;
  } catch (e) {
    return null;
  }
};

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
      let { operationName, variables } = body;
      const doc = body.document || body.query || '';
      if (!operationName) {
        const m = doc.match(/(?:mutation|query)\s+([_A-Za-z0-9]+)/);
        if (m && m[1]) operationName = m[1];
      }
      const opName = operationName;
      const opMatches = (name) => (opName === name) || (doc && typeof doc === 'string' && doc.indexOf(name) !== -1);

      // Handle login query
      if (opMatches('login')) {
        const { login } = variables || {};
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
      if (opMatches('reg') || opMatches('createUser')) {
        const { login } = variables || {};
        return HttpResponse.json({
          data: { createUser: { _id: '1', login } },
        });
      }

      // Handle oneUser query
      if (opMatches('oneUser') || opMatches('UserFindOne')) {
        let userId = variables?._id || '1';
        if (!userId || userId === '1') {
          try {
            if (variables?.query) {
              const queryArray = JSON.parse(variables.query);
              if (Array.isArray(queryArray) && queryArray.length > 0 && queryArray[0]._id) {
                userId = queryArray[0]._id;
              }
            }
          } catch (e) {
            console.error('Error parsing query in oneUser:', e, variables);
          }
        }
        
        const userAvatars = JSON.parse(localStorage.getItem('userAvatars') || '{}');
        const userAvatar = userAvatars[userId];
        
        let avatarUrl = userAvatar?.url || '/avatars/default.png';
        const avatarId = userAvatar?._id;
        
        if (avatarUrl && typeof avatarUrl === 'string') {
          const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.bmp',
                                   '.JPG', '.JPEG', '.PNG', '.GIF', '.SVG', '.WEBP', '.BMP'];
          for (const ext of imageExtensions) {
            const pattern = ext + 'data:';
            if (avatarUrl.includes(pattern)) {
              const extIndex = avatarUrl.indexOf(pattern);
              avatarUrl = avatarUrl.substring(extIndex + ext.length);
              break;
            }
          }

          if (!avatarUrl.startsWith('data:') && avatarUrl.includes('data:')) {
            const dataUrlIndex = avatarUrl.indexOf('data:');
            avatarUrl = avatarUrl.substring(dataUrlIndex);
          }
        }
        
        const avatarObject = avatarUrl && avatarUrl !== '/avatars/default.png' 
          ? { _id: avatarId || 'img1', url: avatarUrl }
          : null;
        
        console.log('oneUser - returning avatar:', avatarObject);
        
        return HttpResponse.json({
          data: {
            UserFindOne: {
              _id: userId,
              login: 'katya',
              nick: 'Katya',
              avatar: avatarObject,
            },
          },
        });
      }

      // Handle passwordChange mutation
      if (opMatches('passwordChange') || opMatches('changePassword')) {
        return HttpResponse.json({
          data: { changePassword: true },
        });
      }

      // Handle setAvatar mutation (
      if (opMatches('setAvatar') || (opMatches('UserUpsert') && variables?.idImg && !variables?.nick)) {
        const { idUser, idImg } = variables || {};
        const image = await getImage(idImg);
        let avatarUrl = image?.url || '/avatars/default.png';
        if (avatarUrl && typeof avatarUrl === 'string') {
          const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.bmp',
                                   '.JPG', '.JPEG', '.PNG', '.GIF', '.SVG', '.WEBP', '.BMP'];
          for (const ext of imageExtensions) {
            const pattern = ext + 'data:';
            if (avatarUrl.includes(pattern)) {
              const extIndex = avatarUrl.indexOf(pattern);
              avatarUrl = avatarUrl.substring(extIndex + ext.length);
              break;
            }
          }
          if (!avatarUrl.startsWith('data:') && avatarUrl.includes('data:')) {
            const dataUrlIndex = avatarUrl.indexOf('data:');
            avatarUrl = avatarUrl.substring(dataUrlIndex);
          }
        }
        
        if (idUser && idImg) {
          const userAvatars = JSON.parse(localStorage.getItem('userAvatars') || '{}');
          userAvatars[idUser] = { _id: idImg, url: avatarUrl };
          localStorage.setItem('userAvatars', JSON.stringify(userAvatars));
        }
        
        return HttpResponse.json({
          data: {
            UserUpsert: {
              _id: idUser || '1',
              avatar: { _id: idImg || 'img1', url: avatarUrl },
            },
          },
        });
      }

      // Handle setNick mutation
      if (opMatches('setNick') || (opMatches('UserUpsert') && variables?.nick && !variables?.idImg)) {
        const { _id, nick } = variables || {};
        return HttpResponse.json({
          data: { UserUpsert: { _id: _id || '1', nick } },
        });
      }

      // Handle trackSearch query 
      if (opMatches('trackSearch')) {
        let searchTerm = '';
        
        if (variables?.title) {
          try {
            const parsed = JSON.parse(variables.title);
            if (Array.isArray(parsed) && parsed[0] && parsed[0]['id3.title']) {
              const regexStr = parsed[0]['id3.title'];
              searchTerm = regexStr.replace(/^\/|\/$/g, ''); 
            } else {
              searchTerm = variables.title;
            }
          } catch (e) {
            searchTerm = variables.title;
          }
        }
            
        const userId = getUserIdFromRequest(request);
        const tracks = await getAllTracksByOwner(userId);
        if (!searchTerm || searchTerm.trim() === '') {
          return HttpResponse.json({
            data: {
              TrackFind: [],
            },
          });
        }

        const searchLower = searchTerm.toLowerCase().trim();
        const filtered = tracks.filter(t => {
          const title = t.id3?.title?.toLowerCase() || '';
          const artist = t.id3?.artist?.toLowerCase() || '';
          const album = t.id3?.album?.toLowerCase() || '';
          
          const matches = title.includes(searchLower) || 
                         artist.includes(searchLower) || 
                         album.includes(searchLower);
          
          if (matches) {
            console.log('Найден трек:', { title: t.id3?.title, artist: t.id3?.artist, album: t.id3?.album });
          }
          
          return matches;
        });
        
        console.log('trackSearch - найдено треков:', filtered.length);

        return HttpResponse.json({
          data: {
            TrackFind: filtered || [],
          },
        });
      }

      // Handle trackFull query
      if (opMatches('trackFull') || (opMatches('TrackFind') && !opMatches('trackSearch'))) {
        const userId = getUserIdFromRequest(request);
        const tracks = await getAllTracksByOwner(userId);
        return HttpResponse.json({
          data: {
            TrackFind: tracks || [],
          },
        });
      }

      // Handle trackOneId query
      if (opMatches('trackOneId') || opMatches('TrackFindOne')) {
        const { idTrack } = variables || {};
        if (idTrack) {
          try {
            const query = JSON.parse(idTrack);
            const trackId = query[0]?._id;
            if (trackId) {
              const track = await getTrack(trackId);
              if (track) {
                return HttpResponse.json({
                  data: {
                    TrackFindOne: track,
                  },
                });
              }
            }
          } catch (e) {
            // Invalid query format
          }
        }
        return HttpResponse.json({
          data: {
            TrackFindOne: null,
          },
        });
      }

      // Handle trackFind query (для "Мої треки" - фильтр по владельцу)
      if (opMatches('trackFind') || (opMatches('TrackFind') && !opMatches('trackSearch'))) {
        const userId = getUserIdFromRequest(request);
        const tracks = await getAllTracksByOwner(userId);
        return HttpResponse.json({
          data: {
            TrackFind: tracks.length > 0 ? tracks : [],
          },
        });
      }

      // Handle plsOne query - return single playlist from IndexedDB
      // ВАЖНО: Проверяем PlaylistFindOne ПЕРВЫМ, так как PlaylistFindOne содержит подстроку PlaylistFind
      if (opMatches('plsOne') || opMatches('PlaylistFindOne')) {
        const userId = getUserIdFromRequest(request);
        const { _id } = variables || {};
        let playlistId = null;
        
        // Try to parse _id if it's a JSON string (format: "[{_id: '...'}]")
        if (_id) {
          try {
            const query = JSON.parse(_id);
            playlistId = query[0]?._id;
          } catch (e) {
            // If not JSON, use as is
            playlistId = _id;
          }
        }
        
        if (playlistId) {
          const p = await getPlaylist(playlistId);
          if (p) {
            // resolve tracks - загружаем полные данные треков
            const tracks = await Promise.all((p.tracks || []).map(async (t) => {
              const tid = t && t._id ? t._id : (typeof t === 'string' ? t : null);
              if (tid) {
                const fullTrack = await getTrack(tid);
                // Если трек найден, возвращаем его с полными данными
                if (fullTrack) {
                  return fullTrack;
                }
                // Если трек не найден, возвращаем объект с минимальными данными
                return { 
                  _id: tid, 
                  url: TEST_AUDIO_URL, 
                  id3: { 
                    title: 'Unknown', 
                    artist: 'Unknown', 
                    album: '' 
                  } 
                };
              }
              // Если трек уже полный объект, возвращаем его
              return t;
            }));
            // if playlist is not global and not owned by user, return not found
            if (p.ownerId && p.ownerId !== 'global' && p.ownerId !== userId) {
              return HttpResponse.json({ data: { PlaylistFindOne: null } });
            }
            return HttpResponse.json({ data: { PlaylistFindOne: { ...p, tracks } } });
          }
        }

        return HttpResponse.json({
          data: {
            PlaylistFindOne: null,
          },
        });
      }

      // Handle MyPlaylists query - return playlists from IndexedDB
      if (opMatches('MyPlaylists') || (opMatches('PlaylistFind') && !opMatches('PlaylistFindOne'))) {
        const userId = getUserIdFromRequest(request);
        const pls = await getAllPlaylistsByOwner(userId);
        return HttpResponse.json({
          data: {
            PlaylistFind: pls || [],
          },
        });
      }

      // Handle plsFull query - return full playlists (with tracks) from IndexedDB
      if (opMatches('plsFull') || (opMatches('PlaylistFind') && !opMatches('PlaylistFindOne'))) {
        const userId = getUserIdFromRequest(request);
        const pls = await getAllPlaylistsByOwner(userId);
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

        return HttpResponse.json({
          data: {
            PlaylistFind: [],
          },
        });
      }

      // Handle DeletePlaylist mutation - remove from IndexedDB
      if (opMatches('DeletePlaylist') || opMatches('PlaylistDelete')) {
        const id = variables?.playlistId;
        if (id) {
          await deletePlaylist(id);
          return HttpResponse.json({ data: { PlaylistDelete: { _id: id } } });
        }
        return HttpResponse.json({ data: { PlaylistDelete: { _id: '1' } } });
      }

      // Handle UpsertPlaylist mutation - save to IndexedDB
      if (opMatches('UpsertPlaylist') || opMatches('PlaylistUpsert')) {
        const { playlistId, namePls, descriptionPls, tracksId } = variables || {};
        const userId = getUserIdFromRequest(request);
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
          ownerId: userId || null,
        };

        await upsertPlaylistWithOwner(playlist, userId);

        return HttpResponse.json({ data: { PlaylistUpsert: playlist } });
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
        let imageUrl = imageData.url || '/avatars/default.png';
        
        // Очищаем URL от имени файла, если оно присутствует
        // Проверяем, есть ли имя файла перед Data URL (например, "filename.jpgdata:...")
        if (imageUrl && typeof imageUrl === 'string') {
          // Если URL не начинается с "data:", но содержит "data:", значит есть имя файла перед ним
          if (!imageUrl.startsWith('data:') && imageUrl.includes('data:')) {
            const dataUrlIndex = imageUrl.indexOf('data:');
            imageUrl = imageUrl.substring(dataUrlIndex);
          }
          // Дополнительная проверка: если URL содержит расширения файлов перед "data:"
          // (например, "filename.jpgdata:" или "81QwcvumW-L.jpgdata:")
          const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.bmp',
                                   '.JPG', '.JPEG', '.PNG', '.GIF', '.SVG', '.WEBP', '.BMP'];
          let foundExtension = false;
          for (const ext of imageExtensions) {
            const pattern = ext + 'data:';
            if (imageUrl.includes(pattern)) {
              const extIndex = imageUrl.indexOf(pattern);
              imageUrl = imageUrl.substring(extIndex + ext.length);
              foundExtension = true;
              break;
            }
          }
          // Убеждаемся, что URL начинается с "data:"
          // Если все еще не начинается с "data:", пытаемся найти паттерн data URL в строке
          if (!imageUrl.startsWith('data:')) {
            // Пытаемся найти паттерн data URL в строке (data:...;base64,... или data:...;charset=...)
            const dataUrlMatch = imageUrl.match(/data:[^,;]*[;,][^\s]*/);
            if (dataUrlMatch) {
              imageUrl = dataUrlMatch[0];
            }
          }
        }
        
        return HttpResponse.json({
          _id: imageData._id,
          url: imageUrl,
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
        const userId = getUserIdFromRequest(request);
        const trackData = await saveTrack(file, userId);
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

