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
	churnIndex.search(hashes,function(results){
		var now = new Date(),
		    elapsed=(now-start),
		    filteredResults = results.most_common(20,35),
		    memory = process.memoryUsage();
		runCount++;			
		totalTime+=elapsed;
		var averageTime = Math.floor(totalTime/runCount);
		var message="Result "+runCount+" found in "+elapsed+"ms Average time: "+averageTime+"ms ";
		message+="Best Result:"+filteredResults[0]+" Number of results: "+filteredResults.length;
		message+=" rss: "+Math.floor(memory.rss/1024/1024)+"MB vsize: "+Math.floor(memory.vsize/1024/1024)+"MB heap: "
		message+=Math.floor(memory.heapTotal/1024/1024)+"MB heap used: "+Math.floor(memory.heapUsed/1024/1024)+"MB";
		util.log(message);
	});
}

function runTests(){
	var test = setInterval(testSearch,100);
	setTimeout(function(){clearInterval(test);},60000)
}

exec("echo 3 | sudo tee /proc/sys/vm/drop_caches",function(){churnIndex.load(process.argv[2],process.argv[3],24,runTests);});


