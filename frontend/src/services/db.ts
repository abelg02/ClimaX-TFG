// frontend/src/services/db.ts
export const initDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('WeatherAppDB', 1);

    request.onerror = () => {
      reject('Error al abrir la base de datos');
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'id' });
      }
    };
  });
};

export const addUser = async (user: { id: string; name: string; email: string; password: string }) => {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction('users', 'readwrite');
    const store = transaction.objectStore('users');
    const request = store.add(user);

    request.onsuccess = () => resolve();
    request.onerror = () => reject('Error al guardar el usuario');
  });
};

export const getUserByEmail = async (email: string) => {
  const db = await initDB();
  return new Promise<{ id: string; name: string; email: string; password: string } | undefined>((resolve, reject) => {
    const transaction = db.transaction('users', 'readonly');
    const store = transaction.objectStore('users');
    const request = store.openCursor();

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        if (cursor.value.email === email) {
          resolve(cursor.value);
        } else {
          cursor.continue();
        }
      } else {
        resolve(undefined); // No se encontró el usuario
      }
    };

    request.onerror = () => reject('Error al buscar el usuario');
  });
};