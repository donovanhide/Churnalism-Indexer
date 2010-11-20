var util = require('util');

Array.prototype.sum = function() {
	return (! this.length) ? 0 : this.slice(1).sum() +((typeof this[0] == 'number') ? this[0] : 0);
};

Object.prototype.most_common = function(number,threshold){
	var sorted = [];
	threshold =(threshold==undefined)?1:threshold;
	for (property in this){
		if (this[property]>threshold){
			sorted.push([property,this[property]]);		
		}
	}
	sorted.sort(function(a,b){return b[1]-a[1]});
	var limit = (number==undefined)?sorted.length:number;	
	return sorted.slice(0,limit);
}

exports.readInt32 = function(buffer,position){
	return ((buffer[position]<<24) | (buffer[position+1]<<16) | (buffer[position+2]<<8) | buffer[position+3]);
}

exports.writeInt32 = function(buffer,position,value){
	buffer[position]   = value>>>24 & 0xFF;
	buffer[position+1] = value>>>16 & 0xFF;
	buffer[position+2] = value>>>8 & 0xFF;
	buffer[position+3] = value & 0xFF;
}

exports.readVarInt32 = function(buffer){
	var values =[],
	    value = 0,
	    bufferIndex = 0,
	    byte = 0,
	    count=0;
	while (bufferIndex<buffer.length) {
		do{
			byte = buffer[bufferIndex];
    			value |= (byte & 0x7F) << (7 * count);
 			bufferIndex++;
			count++;
		}while(byte & 0x80)
		values.push(value);
		count=0;
		value=0;
	}
	return values;
}

exports.decodeDeltas = function(deltas){
	var values = [],
	    previousValue=0;
	for (var i=0;i<deltas.length;i++){
		values.push(previousValue+deltas[i]);
		previousValue+=deltas[i];
	}
	return values;
}

exports.mergeResults = function(results,values){
	for (var i=0;i<values.length;i++){
		if (results[values[i]]){
			results[values[i]]++;		
		}else{
			results[values[i]]=1;		
		}
	}
}

exports.hashString=function(string,window_size){
	var hashes=new Array(string.length-window_size);;
	for (var i=0;i<(string.length-window_size);i++){
		var window = string.substring(i,i+window_size+1);
		hashes[i]=exports.murmurHash(window);
//		util.log(window+":"+hashes[i]);
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


