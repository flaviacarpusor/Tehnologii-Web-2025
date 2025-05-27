<?php

// 1. Date conexiune MySQL
define('DB_HOST',    '127.0.0.1');    // gazda bazei de date
define('DB_PORT',    '3307');         // portul MySQL (3306 implicit, la tine 3307)
define('DB_NAME',    'ret');          // numele bazei de date
define('DB_USER',    'root');         // user-ul MySQL
define('DB_PASS',    '');             // parola MySQL
define('DB_CHARSET', 'utf8mb4');      // charset recomandat

// 2. Mediu și debugging
define('ENVIRONMENT', 'development');            // 'production' când dai live
define('DEBUG',       ENVIRONMENT === 'development');

// 3. URL și căi de lucru
define('BASE_URL',   'http://localhost/Tehnologii-Web-2025/');  // URL-ul de bază al aplicației
define('UPLOAD_DIR', __DIR__ . '/../uploads/');                // directorul unde salvezi fișierele încărcate

// 4. Constante generale
define('ITEMS_PER_PAGE',   20);             // nr. implicit de elemente pe pagină la paginare
define('MAX_UPLOAD_SIZE',  5 * 1024 * 1024); // 5 MB în bytes, pentru validări upload

