# Web-server

This is the web-server, which contains several applications and have an authorization

## Подготовка окружения

- Создание пользователя и базу данных
  - `psql` попадаем в командную строку PostgreSQL
  - `\password postgres` устанавливаем пароль пользователю
  - создаем нового пользователя `CREATE USER yourUser WITH PASSWORD 'yourPassword';`
  - создаем базу данных `CREATE DATABASE databaseName OWNER yourUser;`
  - `\quit` выходим
- Исполняем файл с SQL скриптом создания базы
  - `psql -U yourUser -d databaseName -a -f .\db\example.sql`
- Установка зависимостей (включая модуль `pg`) `npm i`
- Запуск `node server.js`
