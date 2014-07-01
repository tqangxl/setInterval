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

//var send = [];
var already = [];

function checkOrder() {
  mysqldb.query(
    "SELECT * FROM `order` WHERE order_status = ?",
    1,
    function (err, rows) {
      if (err) {
        console.log(err);
      }
      //如果查询到
      if (rows.length) {
        var send = [];
        for(var a=0; a<rows.length; a++){
          send.push(rows[a]);
          console.log("push a% s", a);
        }
        for(var c=0; c<already.length; c++){
          send.splice(send.indexOf(already[c]),1);
          console.log("indexOf");
        }
        console.log("send.length", send.length);
/*        for (a in rows) {
          console.log(a);
          send.push(rows[a]);
          for(c in already){
            console.log(a);
             if(send[a].order_id == already[c].order_id){
              var d=send.slice(send.indexOf(already[c]),1); 
              console.log(already[c]);
              console.log("123");
              console.log(d); 
               send.pop();
             }
          
          }
          
          
        }*/
        //console.log(send);
        for (b in send) {
          /*for(var b=0; b<send.length; b++){*/
          //console.log(b);
          (function (value) {
            mysqldb.query(
              "SELECT * FROM seller WHERE seller_id = ?",
              send[value].seller_id,
              function (error, result) {
                if (error) {
                  return console.log(error);
                }
               // console.log(result);
                //console.log(value);
                //console.log(send);
                console.log(send[value].seller_id);
                console.log(send[value].add_time);
                console.log(result[0].contact_phone);
                var time = getLocalTime(send[value].add_time)
                var text = "您有订单尚未确认，下单时间" + time + "，请登录迈卡车生活商户版查看并确认订单！【迈卡车生活】";
                console.log(text);
                var mobile = result[0].contact_phone;
                request(url, {
                  form: {
                    'apikey': APIKEY,
                    'mobile': mobile,
                    "text": text
                  }
                }, function (e, res, body) {
                  if (e) {
                    console.log(e);
                  }
                  console.log(body);
                  already.push(send[value]);
                  console.log("push value", value);
                  //console.log(already[value].seller_id);
/*                  var newAllreay = new Already(already[value]);
                  newAllreay.save(function(err, doc){
                    if(err){
                      console.log(err); 
                    }
                    console.log(doc);
                  });*/
                });


              }
            );
          }(b));
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


function queryStatus() {
  db.query(
    "SELECT * FROM `order` WHERE order_status = ?",
    1,
    function (err, rows) {
      if (err) {
        return console.log(err);
      }
      return rows;

    }
  )

}

checkOrder();

var i = setInterval(checkOrder, 10000);