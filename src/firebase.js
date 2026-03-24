import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyD7BMLhiwVjfQMls24EGcI-OVu8oUyZ4mg",
  authDomain: "draw-and-guess-afb75.firebaseapp.com",
  databaseURL: "https://draw-and-guess-afb75-default-rtdb.firebaseio.com",
  projectId: "draw-and-guess-afb75",
  storageBucket: "draw-and-guess-afb75.firebasestorage.app",
  messagingSenderId: "934470495234",
  appId: "1:934470495234:web:f852f80ae4508b0cad4b1b",
  measurementId: "G-XHXWT2BV5C"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
