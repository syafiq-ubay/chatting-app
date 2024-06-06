import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAl6Y6ZbikNYPMTddc16SvQpvNnCKmsHPs",
  authDomain: "chatingsapp-1719f.firebaseapp.com",
  projectId: "chatingsapp-1719f",
  storageBucket: "chatingsapp-1719f.appspot.com",
  messagingSenderId: "1044934053058",
  appId: "1:1044934053058:web:6a5d782fbfe9fb80d9ff5b",
  measurementId: "G-Z65KX2BF53"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, app };
