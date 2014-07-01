var http = require('http');
var mysql = require('mysql');
var schedule = require('node-schedule');

var db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.MYSQL_NAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.DATABASE
});

var rule =new schedule.RecurrenceRule();
rule.minute = 12;

var j = schedule.scheduleJob(rule, function(){
  console.log("i do it");
  
});

