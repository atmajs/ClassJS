
var __ip = '127.0.0.1',
    __port = 27017,
    __db = 'test',
    Settings = function(setts){
        if (setts.ip) 
            __ip = setts.ip; 
        
        if (setts.port) 
            __port = setts.port; 
        
    };