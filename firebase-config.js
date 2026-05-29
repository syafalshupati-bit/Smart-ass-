// firebase-config.js
// ملف تهيئة الإتصال التلقائي بقاعدة بيانات Firebase Realtime Database للمنصة التعليمية

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, onValue, set, push, update, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const firebaseConfig = {
  databaseURL: "https://smart-reference-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// تهيئة الاتصال المباشر
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

console.log("🟢 [Firebase] Realtime Database config loaded successfully: " + firebaseConfig.databaseURL);

export { app, db, ref, onValue, set, push, update, remove };
