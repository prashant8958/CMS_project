import sqlite3 from 'sqlite3';
sqlite3.verbose();
const db = new sqlite3.Database('./school.db');
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      className TEXT NOT NULL,
      subjectName TEXT NOT NULL
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      classId INTEGER,
      studentName TEXT NOT NULL,
      FOREIGN KEY (classId) REFERENCES classes(id)
    )
  `);
});
export default db;
