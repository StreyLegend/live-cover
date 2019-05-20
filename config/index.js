var nconf = require('nconf');
var path = require('path');


var app_config = {
   port: 8080, // порт на котором будет запущенно приложение


   /** ==================
    * НАСТРОЙКИ ДЛЯ БАЗЫ ДАННЫХ
   ================== */
   db_perfix: "cover_", // префикс в названии таблиц (пишите что хотите)
   db_host: "localhost", // host базы, обычно "localhost"
   db_name: "covers", // название базы
   db_user: "root", // имя пользователя
   db_password: "S9|HmDQ%g", // пароль пользователя
   connectionLimit: 50,
   acquireTimeout: 1000000,



   /** ==================
    * ДОСТУПЫ К РАЗЛИЧНЫМ API
   ================== */
   openexchangerates_app_id: 'XXXXXXXXXXXXXXXXXXXXXX', // финансы / https://openexchangerates.org/
   yandex_translate_api: 'XXXXXXXXXXXXXXXXXXXXXX', // https://translate.yandex.ru/developers/keys
   openweathermap_appid: 'XXXXXXXXXXXXXXXXXXXXXX', // погода / https://openweathermap.org/
   youtube_api_key: 'XXXXXXXXXXXXXXXXXXXXXX', // https://developers.google.com/youtube/v3/getting-started?refresh=1



   /** ==================
    * ДАННЫЕ ДЛЯ РАБОТЫ С VK
   ================== */
   vk_clientID: 6941984, // ID приложения / https://vk.com/apps?act=manage
   vk_clientSecret: "5POVt2KCdlxuhHlH2hQc", // Защищённый ключ / https://vk.com/apps?act=manage
   vk_group_token: "b4117c41185181e6ec819b05ea8b8e165ffdab649e56c1c5b589d58e8bc7bbb3c2423ae4e16376aa99519", // ключ доступа группы с правами на отправку сообщений, нужен для рассылок уведомлений / брать в настройках группы



   /** ==================
    * НАСТРОЙКИ ПРИЕМА ПЛАТЯЖЕЙ
   ================== */
   free_kassa_id: 'XXXXXXXXXXXXXXXXXXXXXXX', // https://www.free-kassa.ru/
   free_kassa_secret_1: 'XXXXXXXXXXXXXXXXXXXXXXX',
   free_kassa_secret_2: 'XXXXXXXXXXXXXXXXXXXXXXX',
   webmoney_secret: "XXXXXXXXXXXXXXXXXXXXXXX", 
   yandex_money_secret: "XXXXXXXXXXXXXXXXXXXXXXX", // https://money.yandex.ru/settings?_openstat=template%3Bipulldown%3Bsettings&w=other
};
nconf.defaults(app_config);


module.exports = nconf;