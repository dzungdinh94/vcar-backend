var env = "server"
module.exports = {
  AppName: 'MrCoh',
  PORT: 3000,
  jwtKeyMobile: '@^$(Ujkdfasjdfjvjk)',
  jwtKeyAdmin: '@#KMWKL39578JDKWW',
  jwtSessionExpiresTime: '1h',
  algorithm: 'aes256',
  cryptoKey: 'B>x2.6BQ:G-HW,><',
  database: {
    USER: 'vcar',
    PASSWORD: 'Vcar123456@',
    DATABASENAME: 'dulich',
    HOST: env === "server"?'localhost':'128.199.236.30',
    PORT: 3306,
    DIALECT: 'mysql'
  },
  pageLimit: 10,
  firebaseAuthorizationKey: 'AAAAqKO_otQ:APA91bEQHv0tz4aWNkV0e5nkGEeMMmTSSmcg2wTJlfcYYGcj5tBX3C6gK4yQQ8ajQ1DMTgW7pKF2p4UGrQ7Evupxx-mPXSi0_iXNasrzre9p9NAvcZnV6VvCFotH2HJH3lzQk3a2Acvw',
  pingInterval: 2000, // ping request moi 2s socket io
  pingTimeout: 10000, // sau 10s bao disconnect khi mat mang,
  userType: {
    user: 1,
    driver: 2,
  },
  passvps:'GMPd9BNNs0bYDD'
}
