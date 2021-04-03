const admin = require("firebase-admin");
admin.initializeApp();

module.exports.makeAdmin = (email) => {
  return admin
    .auth()
    .getUserByEmail(email)
    .then((user) =>
      admin.auth().setCustomUserClaims(user.uid, { admin: true })
    );
};

module.exports.whois = async (req) => {
  if (!!req.headers.authorization) {
    return admin
      .auth()
      .verifyIdToken(req.headers.authorization)
      .then((tkn) => ({ uid: tkn.uid, admin: tkn.admin }));
  } else {
    return {};
  }
};
