var connect = require('../lib/connect'),
    app = connect.createServer(),
    util = require('util'),
    churnIndex = require('./churnIndex');

function main(app){
	app.get('/',function(req,res){
		var body = 'Paste some text: <br/>'
			+ '<form action="/search/" method="post">'
		    	+ '<textarea name="text" cols="80" rows="40"></textarea><br/>'
			+ '<input type="submit" value="Submit" />'
			+ '</form>';
		res.writeHead(200, {
		    'Content-Type': 'text/html',
		    'Content-Length': body.length
		});
		res.end(body, 'utf8');
	});
	app.post('/search',function(req,res){
		churnIndex.searchString(req.body.text,20,(req.body.text.length/20),function(results){
			var json = JSON.stringify(results);
			res.writeHead(200, {
			    'Content-Type': 'application/json',
			    'Content-Length': json.length
			});
			res.end(json);
		});
	});
}

churnIndex.load(process.argv[2],process.argv[3],24,function(){
    app.use(connect.errorHandler({ dumpExceptions: true }));
	app.use(connect.bodyDecoder());
	app.use(connect.router(main));
	app.listen(8000);
	util.log('Server running at http://127.0.0.1:8000/');
});
