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
    PASSWORD: 'toanpro01',
    DATABASENAME: 'dulich',
    HOST: 'localhost',
    PORT: 3306,
    DIALECT: 'mysql'
  },
  pageLimit: 10,
  firebaseAuthorizationKey: 'AAAAGvkuEn4:APA91bGE7kwF7tXuWOkLKZPpi7G00i1YjtPWEoguj1S3hj3YV1Qbl7AdAjnC3zpolguUiD_sZ-FZa8tNySdFcXH3la7nektOQH_h2Itbrf_C8FcCfH4zV_Q-HpU9QpCtWi3hc9I7s7-q',
  pingInterval: 2000, // ping request moi 2s socket io
  pingTimeout: 10000, // sau 10s bao disconnect khi mat mang,
  userType: {
    user: 1,
    driver: 2,
  },
  passvps:'GMPd9BNNs0bYDD'
}
