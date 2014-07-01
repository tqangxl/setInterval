var http = require('http');
var mysql = require('mysql');
var request = require('request');
var APIKEY = process.env.APIKEY;
var url = "http://yunpian.com/v1/sms/send.json";
var Already = require('./already');

var mysqldb = mysql.createConnection({
  host: process.env.MYSQL_HOST,
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
    "SELECT order_id, seller_id from test_send",
    function(err, rows){
      if(err){console.log(err);}
      //将已经发送过和排除饿赋给
      already = rows;
      mysqldb.query(
        "SELECT order_id, add_time, seller_id FROM `order` WHERE order_status = ?",
        1,
        function(err, status){
          if(err){console.log(err);}
          //如果找到有待确认的订单
          console.log("待确认status",status);
          if(status.length){
            var send = [];
            var sliceArry = [];
            var currTime = Date.parse(new Date())/1000;
            //将找的的值赋给要发送的数组
            for(var a=0; a<status.length; a++){
              if(currTime - status[a].add_time >=900){
                console.log(status[a].add_time);
                send.push(status[a]);
                for(var b=0; b<already.length; b++){
                  if(send[a].order_id == already[b].order_id){
                    sliceArry.push(a);
                  }
                }                
              }

            }
            //剔除已经发送过的和排除的
            var i =0;
            for(var c=0; c<sliceArry.length; c++){
              send.splice(sliceArry[c-i],1);
              i++;
            }
            console.log("send.length ", send.length);
            console.log(send);
            
            //如果剔除后还有新的
            for(var d=0; d<send.length; d++){
              (function(value){
              mysqldb.query(
                "SELECT contact_phone FROM seller WHERE seller_id = ?",
                [send[value].seller_id],
                function(err, seller){
                  if(err){return console.log(err);}
                  var time = getLocalTime(send[value].add_time);
                  var text = "您有订单尚未确认，下单时间" + time + "，请登录迈卡车生活商户版查看并确认订单！【迈卡车生活】";
                  var mobile = seller.contact_phone;
                  //如果要发送的号码和已发送的不一样
                  if(mobile != amoble){
                    amoble = mobile;
                    request(url, {form:{'apikey':APIKEY, 'mobile':mobile, 'text':text}}, function(err,res,body){
                      console.log(body); 
                    });
                    
                  }
                  mysqldb.query(
                    "INSERT INTO test_send (order_id, seller_id) VALUES(?,?)",
                    [send[value].order_id, send[value].seller_id],
                    function(err, test_send){
                      if(err){console.log(err);}
                      console.log(test_send);
                    }
                  );
                  
                  
                }
              ); 
              }(d));
              
            }
            
          }
        }
      );
      
      
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

var i = setInterval(checkOrder, 50000);