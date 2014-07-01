var Db  = require("mongodb").Db,
    Connection = require("mongodb").Connection,
    Server     = require("mongodb").Server;
module.exports = new Db('OrderRemind', new Server('localhost', Connection.DEFAULT_PORT), {safe:true});
