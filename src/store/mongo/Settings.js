
var __ip = '127.0.0.1',
    __port = 27017,
    __db,
    __connection,
    __params = {
        auto_reconnect: true,
        native_parser: true,
        w: 1
    }
    ;
    
var Settings = function(setts){
    if (setts.ip) 
        __ip = setts.ip; 
    
    if (setts.port) 
        __port = setts.port; 
    
    if (setts.db) 
        __db = setts.db;
    
    if (setts.params) 
        __params = setts.params;
    
    __connection = setts.connection;
};


function settings_getConnectionString(){
    if (__connection) 
        return __connection;
    
    if (!__db) 
        return null;
    
    return 'mongodb://'
        + __ip
        + ':'
        + __port
        + '/'
        + __db
        ;
}