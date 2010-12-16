var fs = require('fs'),
    util = require('util'),
    lib = require('./lib'),
    positions,
    data;

exports.load=function(indexFile,dataFile,hashWidth,callback){
    positions = new Buffer((1<<hashWidth)*8);
    data = fs.openSync(dataFile,'r');
    var cumulativeTotal=0;
    util.log('Started reading in index');
    fs.createReadStream(indexFile)
      .on('data',function(index){
        for (var i=0;i<index.length;i=i+8){
            var hash = lib.readInt32(index,i),
                length = lib.readInt32(index,i+4);
            lib.writeInt64(positions,hash*8,cumulativeTotal);
            cumulativeTotal+=length;
        }
    }).on('end',function(){
        util.log('Begin Patching');
        for(var i=1;i<(1<<hashWidth);i++){
            if (lib.readInt64(positions,i*8)==0){
                var offset=1;
                while(true){
                    var next=lib.readInt64(positions,(i+offset)*8);
                    if (next==0){
                        offset++                    
                    }
                    else{
                        util.log("Patching "+i+" with "+next);  
                        lib.writeInt64(positions,i*8,next);
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

exports.searchString=function(string,callback){
    exports.search(lib.hashString(string.toLowerCase(),15),callback);
}

exports.search=function(hashes,callback){
    var results={},
        resultCount=0,
        offsets=new Array(hashes.length),
        lengths=new Array(hashes.length),
        bufferLength=0,
        bufferOffset=0;
    for (var i=0,l=hashes.length;i<l;i++){
        offsets[i]=lib.readInt64(positions,hashes[i]*8);
        lengths[i]=lib.readInt64(positions,(hashes[i]+1)*8)-offsets[i];
        bufferLength+=lengths[i];
    }
    var buffer = new Buffer(bufferLength);
    util.log('Starting Read');
    for (var i=0;i<hashes.length;i++){
        fs.read(data,buffer,bufferOffset,lengths[i],offsets[i],function(err,bytesRead){
            resultCount++;
            if (resultCount==hashes.length){
                util.log('Finished Read');
                var previousStart=0,
                    length=0;
                for (var i=0,l=hashes.length;i<l;i++){
                    length = lengths[i];                 
                    lib.mergeResults(results,lib.decodeDeltaVarInt32(buffer.slice(previousStart,(previousStart+length))));
                    // lib.mergeResults(results,lib.decodeDeltas(lib.readVarInt32(buffer.slice(previousStart,(previousStart+length)))));
                    previousStart+=length;              
                }
                util.log('Processed Result');
                callback(results);      
            }
        });
        bufferOffset+=lengths[i];
    }
}



