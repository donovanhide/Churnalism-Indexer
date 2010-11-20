var fs = require('fs'),
    util = require('util'),
    lib = require('./lib'),
    positions,
    data;

exports.load=function(indexFile,dataFile,hashWidth,callback){
	positions = new Buffer((1<<hashWidth)*4);
	data = fs.openSync(dataFile,'r');
	var cumulativeTotal=0;
	util.log('Started reading in index');
	fs.createReadStream(indexFile)
	  .on('data',function(index){
		for (var i=0;i<index.length;i=i+8){
			var hash = lib.readInt32(index,i),
			    length = lib.readInt32(index,i+4);
			lib.writeInt32(positions,hash*4,cumulativeTotal);
			cumulativeTotal+=length;
		}
	}).on('end',function(){
		for(var i=1;i<(1<<hashWidth);i++){
			if (lib.readInt32(positions,i*4)==0){
				var offset=1;
				while(true){
					var next=lib.readInt32(positions,(i+offset)*4);
					if (next==0){
						offset++					
					}
					else{
						util.log("Patching "+i+" with "+next);	
						lib.writeInt32(positions,i*4,next);
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
	var hashes = lib.hashString(string,15);	
	util.debug(hashes);	
	exports.search(hashes,callback);
}

exports.search=function(hashes,callback){
	var results={},
	    resultCount=0,
	    offsets=new Array(hashes.length),
	    lengths=new Array(hashes.length),
	    bufferLength=0,
	    bufferOffset = 0;
	for (var i=0;i<hashes.length;i++){
		offsets[i]=lib.readInt32(positions,hashes[i]*4);
		lengths[i]=lib.readInt32(positions,(hashes[i]+1)*4)-offsets[i];
		bufferLength+=lengths[i];
	}
	var buffer = new Buffer(bufferLength);
	for (var i=0;i<hashes.length;i++){
		fs.read(data,buffer,bufferOffset,lengths[i],offsets[i],function(err,bytesRead){
			resultCount++;
			if (resultCount==hashes.length){
				var previousStart=0,
				    length=0;
				for (var i=0;i<hashes.length;i++){
					length = lengths[i];						
					lib.mergeResults(results,lib.decodeDeltas(lib.readVarInt32(buffer.slice(previousStart,(previousStart+length)))));
					previousStart+=length;				
				}
				callback(results);		
			}
		});
		bufferOffset+=lengths[i];
	}
}



