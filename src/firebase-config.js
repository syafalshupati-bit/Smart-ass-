// firebase-config.js
// ملف تهيئة الإتصال الآمن بقاعدة بيانات Firebase Realtime Database للرفع والتشغيل المباشر

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue, set, push, update, remove, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// إعدادات الاتصال الآمنة - تدعم قراءة المتغيرات البيئية للتكامل مع Netlify/GitHub بشكل آمن
const firebaseConfig = {
  apiKey: (typeof process !== "undefined" && process.env?.VITE_FIREBASE_API_KEY) || "",
  authDomain: (typeof process !== "undefined" && process.env?.VITE_FIREBASE_AUTH_DOMAIN) || "smart-reference-default.firebaseapp.com",
  databaseURL: "https://smart-reference-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "smart-reference-default",
  storageBucket: "smart-reference-default.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:1234567890"
};

// تهيئة الاتصاص بقاعدة بيانات Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

console.log("🟢 [Firebase] Database config loaded successfully: " + firebaseConfig.databaseURL);

export { app, db, ref, onValue, set, push, update, remove, get };

