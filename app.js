var http = require('http');
var mysql = require('mysql');
var request = require('request');
var APIKEY = process.env.APIKEY;
var url = "http://yunpian.com/v1/sms/send.json";
var Already = require('./already');

var mysqldb = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.MYSQL_NAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.DATABASE
});

mysqldb.connect(function (err) {
  if (err) {
    return console.log('error connecting: ' + err.stack);
  }
  return console.log('connected as id ' + mysqldb.threadId);
});


var already = [];
var amoble = '';

function checkOrder() {
  
  mysqldb.query(
    "SELECT * FROM `order` WHERE order_status = ?",
    1,
    function(err, rows){
      if(err){return console.log(err);} 
      if(rows.length){
        var send = [];
        var slices = [];
        for(var a=0; a<rows.length; a++){
          send.push(rows[a]); 
        }
        for(var b=0; b<send.length; b++){
          //send.splice(send[b].order_id.indexOf(already[b].order_id),1);
          //console.log("send.indexOf(already[b]) ", send.indexOf(already[b]));
          for(var d=0; d<already.length; d++){
            if(send[b].order_id == already[d].order_id){
              console.log("hac slice ", b);
              slices.push(b);
              
            }
          }
          
        }
        console.log(slices);
        for(var e=0; e<slices.length;e++){
          send.splice(already[e],1);
          console.log("123");
        }
        console.log("send.length", send.length);
        for(var c=0; c<send.length; c++){
          (function(c){
          mysqldb.query(
            "SELECT * FROM seller WHERE seller_id = ?",
            send[c].seller_id,
            function(err, result){
              if(err){return console.log(err);}
              console.log("for c", c);
              var time = getLocalTime(send[c].add_time);
              var text = "您有订单尚未确认，下单时间" + time + "，请登录迈卡车生活商户版查看并确认订单！【迈卡车生活】";
              var mobile = result[0].contact_phone;
              if(mobile != amoble){
                amoble = mobile;
              request.post(url,{form:{'apikey':APIKEY, 'mobile':mobile, 'text':text}}, function(err, res, body){
                if(err){console.log(err);}
                console.log(body);
                
              })}
              already.push(send[c]);
              
              console.log("push c", c);
              (function(value){
                mysqldb.query(
                  "INSERT INTO test_send (seller_id, order_id) VALUES(?,?)",
                  [already[c].seller_id, already[c].order_id],
                  function(err, doc){
                    if(err){return console.log(err);}
                    console.log(doc);
                  }
                );
              }(c));
            }
          );
          }(c));
          
        }
        
      }
    }
  );


}

function getLocalTime(nS) {
  var year = new Date(parseInt(nS) * 1000).getFullYear();
  var month = new Date(parseInt(nS) * 1000).getMonth() + 1;
  var day = new Date(parseInt(nS) * 1000).getDate();
  var hours = new Date(parseInt(nS) * 1000).getHours();
  var minu = new Date(parseInt(nS) * 1000).getMinutes();
  var time = year + '-' + month + '-' + day + ' ' + hours + ':' + minu
  return time;
}


checkOrder();

var i = setInterval(checkOrder, 10000);