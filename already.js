var mongodb = require("./db");

function Already(order){
  //console.log(order);
  this.order_id = order.order_id;
  this.seller_id = order.seller_id;
}

module.exports = Already;

Already.prototype.save = function save(callback){
    var already = {
      order_id : this.order_id,
      seller_id : this.seller_id
    };
    
    mongodb.close();
    mongodb.open(function(err, db){
      if(err){
        return callback(err); 
      }
      db.collection('order', function(err, collection){
        if(err){
          mongodb.close();
          return callback(err);
        }
        
/*        collection.ensureIndex('order_id', {unique: true}, function(err){
          if(err){
            mongodb.close();
            return callback(err);
          }
        });*/
        
        collection.insert(already, {safe:true}, function(err, docs){
          mongodb.close();
          if(err){
            return callback(err);
          }
          callback(null, docs); 
        });
        
      });
      
    });
  
  
}