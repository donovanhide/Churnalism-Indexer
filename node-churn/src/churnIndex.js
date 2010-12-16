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
            if (hash==10917973 || hash==11094359){
                util.log('Hash: '+hash+' Offset:'+cumulativeTotal);   
            }
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

exports.searchString=function(string,number,threshold,callback){
    exports.search(lib.hashString(string.toLowerCase(),15),number,threshold,callback);
}

exports.search=function(hashes,number,threshold,callback){
    var bag={},
        results={},
        resultCount=0,
        offsets=new Array(hashes.length),
        lengths=new Array(hashes.length),
        bufferLength=0,
        bufferOffset=0;
    for (var i=0,l=hashes.length;i<l;i++){
        offsets[i]=lib.readInt64(positions,hashes[i]*8);
        lengths[i]=lib.readInt64(positions,(hashes[i]+1)*8)-offsets[i];
        bufferLength+=lengths[i];
        util.log('Hash: '+hashes[i]+' Offset: '+offsets[i]+' Length: '+lengths[i]);
    }
    var buffer = new Buffer(bufferLength);
    util.log('Starting Read');
    
    function processResults(hash,offset,length){
        return function(err,bytesRead){
             util.log('Hash: '+hash+' Offset: '+offset+' Length: '+length);
                lib.decodeDeltaVarInt32(results,bag,threshold,buffer.slice(offset,(offset+length)));
                resultCount++;
                if (resultCount==hashes.length){
                    util.log('Finished Read');
                    callback(results.most_common(number));      
            }
        }
    }
    
    for (var i=0,l=hashes.length;i<l;i++){
        fs.read(data,buffer,bufferOffset,lengths[i],offsets[i],processResults(hashes[i],bufferOffset,lengths[i]));
        bufferOffset+=lengths[i];
    }
}



