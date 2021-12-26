const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://limpid-a4db3-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.firestore();

module.exports = {db}

// db.collection("clients").add({
//     name : "Andrei",
//     password : "$3Cret"
// })
// where