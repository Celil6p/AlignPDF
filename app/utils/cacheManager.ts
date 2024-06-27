// utils/cacheManager.ts

export async function clearAppCache(retainedCookies: string[] = []) {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      } catch (err) {
        console.error('Failed to clear caches:', err);
      }
    }
  
    // Clear localStorage except for specific items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !retainedCookies.includes(key)) {
        localStorage.removeItem(key);
      }
    }
  
    // Clear sessionStorage
    sessionStorage.clear();
  
    // Clear IndexedDB
    const databases = await window.indexedDB.databases();
    databases.forEach(db => {
      if (db.name) window.indexedDB.deleteDatabase(db.name);
    });
  
    // Clear cookies except for the ones you want to retain
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (!retainedCookies.includes(name)) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    }
  
    console.log('App cache cleared successfully');
  }