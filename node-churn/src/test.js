var util = require('util'),
    exec = require('child_process').exec,
    churnIndex = require('./churnIndex'),
    runCount=0,
    totalTime=0;

function testSearch(){
	var hashes = [],
	    start = new Date();
//	Math.seedrandom(start.getTime());
	for (var i=0;i<3500;i++){
		hashes.push(Math.floor(Math.random()*(1<<24)));	
	}
	churnIndex.search(hashes,20,35,function(results){
		var now = new Date(),
		    elapsed=(now-start),
		    memory = process.memoryUsage();
		runCount++;			
		totalTime+=elapsed;
		var averageTime = Math.floor(totalTime/runCount);
		var message="Result "+runCount+" found in "+elapsed+"ms Average time: "+averageTime+"ms ";
		message+="Best Result:"+results[0]+" Number of results: "+results.length;
		message+=" rss: "+Math.floor(memory.rss/1024/1024)+"MB vsize: "+Math.floor(memory.vsize/1024/1024)+"MB heap: "
		message+=Math.floor(memory.heapTotal/1024/1024)+"MB heap used: "+Math.floor(memory.heapUsed/1024/1024)+"MB";
		util.log(message);
	});
}

function runTests(){
    // churnIndex.search([0,1,2,3,4,5,6],0,0,function(){});
    // churnIndex.search([1600000,1600001,1600002,1600003,1600004,1600005,1600006],0,0,function(){});
    // churnIndex.searchString("10 Downing Street",0,0,function(){});
    // churnIndex.search([9268352],0,0,function(){});
    var test = setInterval(testSearch,5000);
    setTimeout(function(){clearInterval(test);},60000)
}

exec("echo 3 | sudo tee /proc/sys/vm/drop_caches",function(){churnIndex.load(process.argv[2],process.argv[3],24,runTests);});


