var fs = require('fs'),
    util = require('util'),
    lib = require('./lib'),
    positions,
    data;

exports.load=function(indexFile,dataFile,hashWidth,callback){
    positions = new Array((1<<hashWidth));
    data = fs.openSync(dataFile,'r');
    var cumulativeTotal=0;
    util.log('Started reading in index');
    fs.createReadStream(indexFile)
      .on('data',function(index){
        for (var i=0;i<index.length;i=i+8){
            var hash = lib.readInt32(index,i),
                length = lib.readInt32(index,i+4);
            positions[hash]=cumulativeTotal;
            if (hash==10917973 ||hash==10917974 || hash==11094359 || hash==11094360){
                util.log('Hash: '+hash+' Cumulative Total: '+cumulativeTotal+' Position: '+positions[hash]);   
            }
            cumulativeTotal+=length;
        }
    }).on('end',function(){
        util.log('Begin Patching');
        for(var i=1;i<(1<<hashWidth);i++){
            if (positions[i]==0){
                var offset=1;
                while(true){
                    var next=positions[i+offset];
                    if (next==0){
                        offset++                    
                    }
                    else{
                        util.log("Patching "+i+" with "+next);  
                        positions[i]=next;
                        break;
                    }
                }       
            }       
        }       
        util.log('Finished reading in index');
        callback();
    }).on('error',function(exception){
        util.log(exception);
    })
}

exports.searchString=function(string,number,threshold,callback){
    exports.search(lib.hashString(string.toLowerCase(),15),number,threshold,callback);
}

exports.search=function(hashes,number,threshold,callback){
    var bag={},
        results={},
        resultCount=0;
    util.log('Starting Read');
    
    function processResults(buffer){
        return function(err,bytesRead){
            util.log("Buffer Length: "+buffer.length+" Bytes Read:"+bytesRead);
            lib.decodeDeltaVarInt32(results,bag,threshold,buffer);
            resultCount++;
            if (resultCount==hashes.length){
                util.log('Finished Read');
                callback(results.most_common(number));      
            }
        }
    }
    
    for (var i=0,l=hashes.length;i<l;i++){
        var offset=positions[hashes[i]],
            length=positions[hashes[i]+1]-offset,
            buffer=new Buffer(length);
        util.log('Hash: '+hashes[i]+' Offset: '+offset+' Length: '+length);
        fs.read(data,buffer,0,length,offset,processResults(buffer));
    }
}



