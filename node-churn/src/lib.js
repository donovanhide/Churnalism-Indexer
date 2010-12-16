var util = require('util');

Object.prototype.most_common = function(number,threshold){
    util.log("Starting sort");
    var sorted = [];
    threshold =(threshold==undefined)?1:threshold;
    for (var property in this){
        if (this[property]>threshold){
            sorted.push([parseInt(property),this[property]]);       
        }
    }
    sorted.sort(function(a,b){return b[1]-a[1]});
    var limit = (number==undefined)?sorted.length:number;   
    util.log("Ending sort");
    return sorted.slice(0,limit);
}

exports.readInt32 = function(buffer,position){
    return ((buffer[position]<<24) | (buffer[position+1]<<16) | (buffer[position+2]<<8) | buffer[position+3]);
}

exports.readInt64 = function(buffer,position){
    return (
        (buffer[position]  <<56) |
        (buffer[position+1]<<48) | 
        (buffer[position+2]<<40) | 
        (buffer[position+3]<<32) | 
        (buffer[position+4]<<24) | 
        (buffer[position+5]<<16) | 
        (buffer[position+6]<<8)  | 
        (buffer[position+7])
    );
}

exports.writeInt32 = function(buffer,position,value){
    buffer[position]   = value>>>24 & 0xFF;
    buffer[position+1] = value>>>16 & 0xFF;
    buffer[position+2] = value>>>8 & 0xFF;
    buffer[position+3] = value & 0xFF;
}

exports.writeInt64 = function(buffer,position,value){
    buffer[position]   = value>>>56 & 0xFF;
    buffer[position+1] = value>>>48 & 0xFF;
    buffer[position+2] = value>>>40 & 0xFF;
    buffer[position+3] = value>>>32 & 0xFF;
    buffer[position+4]   = value>>>24 & 0xFF;
    buffer[position+5] = value>>>16 & 0xFF;
    buffer[position+6] = value>>>8 & 0xFF;
    buffer[position+7] = value & 0xFF;
}

exports.readVarInt32 = function(buffer){
    var values =[],
        value = 0,
        bufferIndex = 0,
        byte = 0,
        count=0,
        bufferLength=buffer.length;
    while (bufferIndex<bufferLength) {
        do{
            byte = buffer[bufferIndex+count];
            value |= (byte & 0x7F) << (7 * count);
            count++;
        }while(byte & 0x80)
        values.push(value);
        bufferIndex+=count;
        count=0;
        value=0;
    }
    return values;
}

exports.decodeDeltas = function(deltas){
    var values = [],
        previousValue=0;
    for (var i=0,l=deltas.length;i<l;i++){
        values.push(previousValue+deltas[i]);
        previousValue+=deltas[i];
    }
    return values;
}

exports.mergeResults = function(results,values){
    for (var i=0,l=values.length;i<l;i++){
        if (results[values[i]]){
            results[values[i]]++;       
        }else{
            results[values[i]]=1;       
        }
    }
}

exports.hashString=function(string,window_size){
    var hashes=new Array(string.length-window_size);;
    for (var i=0,l=(string.length-window_size);i<l;i++){
        var window = string.substring(i,i+window_size+1);
        hashes[i]=exports.murmurHash(window);
//      util.log(window+":"+hashes[i]);
    }
    return hashes;
}

//https://gist.github.com/595035
exports.murmurHash=function(str) {
  var m = 0x5bd1e995;
  var seed=-1;
  var r = 24;
  var h = seed ^ str.length;
  var length = str.length;
  var currentIndex = 0;
  
  while (length >= 4) {
    var k = UInt32(str, currentIndex);
    
    k = Umul32(k, m);
    k ^= k >>> r;
    k = Umul32(k, m);

    h = Umul32(h, m);
    h ^= k;

    currentIndex += 4;
    length -= 4;
  }
  
  switch (length) {
  case 3:
    h ^= UInt16(str, currentIndex);
    h ^= str.charCodeAt(currentIndex + 2) << 16;
    h = Umul32(h, m);
    break;
    
  case 2:
    h ^= UInt16(str, currentIndex);
    h = Umul32(h, m);
    break;
    
  case 1:
    h ^= str.charCodeAt(currentIndex);
    h = Umul32(h, m);
    break;
  }

  h ^= h >>> 13;
  h = Umul32(h, m);
  h ^= h >>> 15;

  return (h>>>24) ^ (h & 0xFFFFFF);
}

function UInt32(str, pos) {
  return (str.charCodeAt(pos++)) +
         (str.charCodeAt(pos++) << 8) +
         (str.charCodeAt(pos++) << 16) +
         (str.charCodeAt(pos) << 24);
}

function UInt16(str, pos) {
  return (str.charCodeAt(pos++)) +
         (str.charCodeAt(pos++) << 8);
}

function Umul32(n, m) {
  n = n | 0;
  m = m | 0;
  var nlo = n & 0xffff;
  var nhi = n >>> 16;
  var res = ((nlo * m) + (((nhi * m) & 0xffff) << 16)) | 0;
  return res;
}


