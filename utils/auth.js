const admin = require('firebase-admin');
admin.initializeApp();

module.exports.jwtTokenAsync = req => admin.auth().verifyIdToken(req.headers.authorization);