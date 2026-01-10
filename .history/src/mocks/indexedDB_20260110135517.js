const DB_NAME = 'MusicPlayerDB';
const STORE_TRACKS = 'tracks';
const STORE_IMAGES = 'images';
const STORE_PLAYLISTS = 'playlists';

let db = null;

const INITIAL_TRACKS = [
  {
    _id: 'default_track_1',
    url: '/music/track1.mp3', 
    ownerId: 'global',
    id3: {
      title: 'Baby dont hurt me',
      artist: 'David Guetta',
      album: 'Демо',
    },
  },
  {
    _id: 'default_track_2',
    url: '/music/track2.mp3',
    ownerId: 'global',
    id3: {
      title: 'Tattoo',
      artist: 'loreen',
      album: 'Демо',
    },
  },
   {
    _id: 'default_track_3',
    url: '/music/track.mp3',
    ownerId: 'global',
    id3: {
      title: 'Titanium',
      artist: 'David Guetta',
      album: 'Демо',
    },
  }
];

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      
      if (!database.objectStoreNames.contains(STORE_TRACKS)) {
        database.createObjectStore(STORE_TRACKS, { keyPath: '_id' });
      }
      
      if (!database.objectStoreNames.contains(STORE_IMAGES)) {
        database.createObjectStore(STORE_IMAGES, { keyPath: '_id' });
      }
      
        if (!database.objectStoreNames.contains(STORE_PLAYLISTS)) {
          database.createObjectStore(STORE_PLAYLISTS, { keyPath: '_id' });
        }
    };
  });
};

export const saveTrack = (file, ownerId = null) => {
  return initDB().then(() => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const _id = `track_${Date.now()}`;
        const transaction = db.transaction([STORE_TRACKS], 'readwrite');
        const store = transaction.objectStore(STORE_TRACKS);
        
        // Парсим имя файла: если содержит " - ", разделяем на исполнителя и название
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        let artist = 'Unknown';
        let title = fileName;
        
        if (fileName.includes(' - ')) {
          const parts = fileName.split(' - ');
          if (parts.length >= 2) {
            artist = parts[0].trim();
            title = parts.slice(1).join(' - ').trim();
          }
        }
        
        const trackData = {
          _id,
          url: reader.result, // Data URL
          ownerId: ownerId || null,
          id3: {
            title: title,
            artist: artist,
            album: 'Uploads',
          },
        };
        
        store.add(trackData);
        
        transaction.oncomplete = () => resolve(trackData);
        transaction.onerror = () => reject(transaction.error);
      };
      
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  });
};

export const saveImage = (file) => {
  return initDB().then(() => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const _id = `img_${Date.now()}`;
        const transaction = db.transaction([STORE_IMAGES], 'readwrite');
        const store = transaction.objectStore(STORE_IMAGES);
        
        let imageUrl = reader.result; // Data URL
        
        // Очищаем URL от имени файла, если оно присутствует
        // Проверяем, есть ли имя файла перед Data URL (например, "filename.jpgdata:...")
        if (imageUrl && typeof imageUrl === 'string') {
          // Сначала проверяем расширения файлов (в разных регистрах) перед "data:"
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
          // Если URL не начинается с "data:", но содержит "data:", значит есть имя файла перед ним
          if (!imageUrl.startsWith('data:') && imageUrl.includes('data:')) {
            const dataUrlIndex = imageUrl.indexOf('data:');
            imageUrl = imageUrl.substring(dataUrlIndex);
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
        
        const imageData = {
          _id,
          url: imageUrl,
        };
        
        store.add(imageData);
        
        transaction.oncomplete = () => resolve(imageData);
        transaction.onerror = () => reject(transaction.error);
      };
      
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  });
};

export const getTrack = (_id) => {
  return initDB().then(() => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_TRACKS], 'readonly');
      const store = transaction.objectStore(STORE_TRACKS);
      const request = store.get(_id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
};

export const getAllTracks = () => {
  return initDB().then(() => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_TRACKS], 'readonly');
      const store = transaction.objectStore(STORE_TRACKS);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
};

export const getImage = (_id) => {
  return initDB().then(() => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_IMAGES], 'readonly');
      const store = transaction.objectStore(STORE_IMAGES);
      const request = store.get(_id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
};

export const deleteTrack = (_id) => {
  return initDB().then(() => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_TRACKS], 'readwrite');
      const store = transaction.objectStore(STORE_TRACKS);
      const request = store.delete(_id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
};

export const upsertPlaylist = (playlist) => {
  return initDB().then(() => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_PLAYLISTS], 'readwrite');
      const store = transaction.objectStore(STORE_PLAYLISTS);
      const request = store.put(playlist);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
};

// allow upsert with ownerId param
export const upsertPlaylistWithOwner = (playlist, ownerId = null) => {
  return initDB().then(() => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_PLAYLISTS], 'readwrite');
      const store = transaction.objectStore(STORE_PLAYLISTS);
      const toSave = { ...playlist, ownerId: ownerId || null };
      const request = store.put(toSave);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
};

export const getPlaylist = (_id) => {
  return initDB().then(() => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_PLAYLISTS], 'readonly');
      const store = transaction.objectStore(STORE_PLAYLISTS);
      const request = store.get(_id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
};

export const getAllPlaylists = () => {
  return initDB().then(() => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_PLAYLISTS], 'readonly');
      const store = transaction.objectStore(STORE_PLAYLISTS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
};

export const getAllPlaylistsByOwner = (ownerId) => {
  return getAllPlaylists().then((all) => {
    if (!all) return [];
    return all.filter(p => !p.ownerId || p.ownerId === 'global' || p.ownerId === ownerId);
  });
};

export const getAllTracksByOwner = (ownerId) => {
  return getAllTracks().then((all) => {
    if (!all) return [];
    return all.filter(t => !t.ownerId || t.ownerId === 'global' || t.ownerId === ownerId);
  });
};

export const deletePlaylist = (_id) => {
  return initDB().then(() => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_PLAYLISTS], 'readwrite');
      const store = transaction.objectStore(STORE_PLAYLISTS);
      const request = store.delete(_id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
};
