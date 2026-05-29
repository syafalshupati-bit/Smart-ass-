// firebase-config.ts (or firebase-config.js in imports)
// اتصال Realtime Database والتهيئة الكاملة بأحدث إصدار Firebase SDK

import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, push, update, remove, get, child, query, orderByChild, equalTo, startAt, endAt, limitToFirst } from "firebase/database";

const firebaseConfig = {
  // @ts-ignore
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "", 
  // @ts-ignore
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "smart-reference-default.firebaseapp.com",
  databaseURL: "https://smart-reference-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "smart-reference-default",
  storageBucket: "smart-reference-default.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:1234567890"
};

// تهيئة تطبيق الفايربيز
const app = initializeApp(firebaseConfig);

// الحصول على اتصال بقاعدة البيانات الفورية
export const db = getDatabase(app);

// تصدير دوال قاعدة البيانات لتسهيل الاستخدام في جميع أقسام المنصة
export { ref, onValue, set, push, update, remove, get, child, query, orderByChild, equalTo, startAt, endAt, limitToFirst };

console.log("🟢 [Firebase] Connected to Realtime Database at:", firebaseConfig.databaseURL);
