/**
 * SENTIA Mock Database using localStorage
 */

const DB_KEY = 'sentia_db';

// Initial Seed Data
const initialDB = {
  users: [
    {
      id: 1,
      name: 'Test User',
      country: 'USA',
      phone: '1234567890',
      email: 'test@example.com',
      password: 'password',
      currentNode: 1,
      completedNodes: [],
      streak: 0,
      lastStreakDate: null,
      currentMood: null
    }
  ],
  session: null // Will store the user ID if logged in
};

function initDB() {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    localStorage.setItem(DB_KEY, JSON.stringify(initialDB));
  }
}

function getDB() {
  initDB();
  return JSON.parse(localStorage.getItem(DB_KEY));
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

const DB = {
  signup: (userData) => {
    const db = getDB();
    if (db.users.find(u => u.email === userData.email)) {
      return false; // Email already exists
    }
    const newUser = {
      id: Date.now(),
      name: userData.name,
      country: userData.country,
      phone: userData.phone,
      email: userData.email,
      password: userData.password,
      currentNode: 1,
      completedNodes: [],
      streak: 0,
      lastStreakDate: null,
      currentMood: null
    };
    db.users.push(newUser);
    db.session = newUser.id;
    saveDB(db);
    return true;
  },

  updateUser: (userData) => {
    const db = getDB();
    if (!db.session) return false;
    const userIndex = db.users.findIndex(u => u.id === db.session);
    if (userIndex !== -1) {
      db.users[userIndex] = { ...db.users[userIndex], ...userData };
      saveDB(db);
      return true;
    }
    return false;
  },

  deleteUser: () => {
    const db = getDB();
    if (!db.session) return false;
    db.users = db.users.filter(u => u.id !== db.session);
    db.session = null;
    saveDB(db);
    return true;
  },

  setCurrentMood: (mood) => {
    const db = getDB();
    if (!db.session) return false;
    const userIndex = db.users.findIndex(u => u.id === db.session);
    if (userIndex !== -1) {
      db.users[userIndex].currentMood = mood;
      saveDB(db);
      return true;
    }
    return false;
  },

  login: (email, password) => {
    const db = getDB();
    const user = db.users.find(u => u.email === email && u.password === password);
    if (user) {
      db.session = user.id;
      saveDB(db);
      return true;
    }
    return false;
  },

  logout: () => {
    const db = getDB();
    db.session = null;
    saveDB(db);
  },

  getCurrentUser: () => {
    const db = getDB();
    if (!db.session) return null;
    return db.users.find(u => u.id === db.session);
  },

  completeNode: (nodeId) => {
    const db = getDB();
    if (!db.session) return;
    
    const userIndex = db.users.findIndex(u => u.id === db.session);
    if (userIndex !== -1) {
      let user = db.users[userIndex];
      
      // Add to completed if not already there
      if (!user.completedNodes.includes(nodeId)) {
        user.completedNodes.push(nodeId);
      }

      // If they just completed their current active node, bump them to the next one
      if (user.currentNode === nodeId && nodeId < 4) {
        user.currentNode = nodeId + 1;
      }
      
      // Update Daily Streak
      const today = new Date().toDateString();
      if (user.lastStreakDate !== today) {
        if (user.lastStreakDate) {
          const lastDate = new Date(user.lastStreakDate);
          const currentDate = new Date(today);
          const diffDays = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            // Consecutive day
            user.streak = (user.streak || 0) + 1;
          } else if (diffDays > 1) {
            // Missed a day, reset streak
            user.streak = 1;
          }
        } else {
          // First time completing an activity
          user.streak = 1;
        }
        user.lastStreakDate = today;
      }
      
      db.users[userIndex] = user;
      saveDB(db);
    }
  }
};

// Initialize DB on script load
initDB();
