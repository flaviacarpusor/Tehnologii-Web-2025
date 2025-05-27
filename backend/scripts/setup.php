<?php
$dbFile = __DIR__ . '/../../database/ret.db';
$sqlFile = __DIR__ . '/../../database/init.sql';

// Creăm BD dacă nu există deja
$db = new SQLite3($dbFile);
$sql = file_get_contents($sqlFile);
$db->exec($sql);

// Date de test (opțional)
$adminPass = password_hash('admin123', PASSWORD_DEFAULT);
$db->exec("INSERT OR IGNORE INTO users(username, password_hash, role) VALUES('admin', '$adminPass', 'admin')");

echo "Baza de date a fost creată și populată cu succes.\n";