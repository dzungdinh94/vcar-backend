module.exports = {
  AppName: 'MrCoh',
  PORT: 3000,
  jwtKeyMobile: '@^$(Ujkdfasjdfjvjk)',
  jwtKeyAdmin: '@#KMWKL39578JDKWW',
  jwtSessionExpiresTime: '1h',
  algorithm: 'aes256',
  cryptoKey: 'B>x2.6BQ:G-HW,><',
  database: {
    USER: 'root',
    PASSWORD: 'motconvit',
    DATABASENAME: 'dulich',
    HOST: 'localhost',
    PORT: 3306,
    DIALECT: 'mysql'
  },
  pageLimit: 10,
  firebaseAuthorizationKey: 'AAAAAhHdXgc:APA91bEg7VRSk00rqRIlezXGQCfQysYtuQsePg-6lc1g3h4q8W9YbdbBpNdVvj7xiR8ag52rbVt6qQ6gHseDVtW6tm9nhIbxerDEGLjhujhqI4P04ZpkArGPBw2OssTdMTDigPVSvAI3',
  pingInterval: 2000, // ping request moi 2s socket io
  pingTimeout: 10000, // sau 10s bao disconnect khi mat mang,
  userType: {
    user: 1,
    driver: 2,
  },
  passvps:'GMPd9BNNs0bYDD'
}
