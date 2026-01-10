// IndexedDB для сохранения загруженных файлов локально
const DB_NAME = 'MusicPlayerDB';
const STORE_TRACKS = 'tracks';
const STORE_IMAGES = 'images';
const STORE_PLAYLISTS = 'playlists';

let db = null;

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

export const saveTrack = (file) => {
  return initDB().then(() => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const _id = `track_${Date.now()}`;
        const transaction = db.transaction([STORE_TRACKS], 'readwrite');
        const store = transaction.objectStore(STORE_TRACKS);
        
        const trackData = {
          _id,
          url: reader.result, // Data URL
          id3: {
            title: file.name.replace(/\.[^/.]+$/, ''),
            artist: 'Unknown',
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
        
        const imageData = {
          _id,
          url: reader.result, // Data URL
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
