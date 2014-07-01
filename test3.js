var request = require('request');
/*
var r = request.post('http://yunpian.com/v1/sms/send.json', function(error, httpResponse, body){
  if(error){
    return console.log(error); 
  }          
  console.log("ok");
  console.log(body);
  //console.log(httpResponse);
});
var form = r.form();
form.append("apikey", "");
form.append("mobile", "");
form.append("text", "您有订单尚未确认，下单时间6月12点31分，请登录迈卡车生活商户版查看并确认订单！【迈卡车生活】");
         
*/

request.post('http://yunpian.com/v1/sms/send.json',{form:{"apikey":"",
                                                          "mobile":"",
                                                          "text":"您有订单尚未确认，下单时间6月12点32分，请登录迈卡车生活商户版查看并确认订单！【迈卡车生活】"
                                                         
                                                         }}, function(err, res, body){
                                                    console.log(body);
                                                    //console.log(res);
                                                   });