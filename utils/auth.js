const admin = require('firebase-admin');
admin.initializeApp();

module.exports.whois = req => {
  if (!!req.headers.authorization) {
    return admin.auth().verifyIdToken(req.headers.authorization).then(tkn => tkn.uid);
  } else {
    return undefined;
  }
}