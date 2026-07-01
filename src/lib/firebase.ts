import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCXSfzA3WrUgq_kS8dbYncsTF_ZKZvBukw",
  authDomain: "pruebas-bc921.firebaseapp.com",
  projectId: "pruebas-bc921",
  storageBucket: "pruebas-bc921.firebasestorage.app",
  messagingSenderId: "274041255089",
  appId: "1:274041255089:web:e4c4b605f9f4d6b6acde90",
  measurementId: "G-2JLXH9RBFJ",
};

const _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(_app);
