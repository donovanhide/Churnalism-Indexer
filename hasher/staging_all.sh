s3cmd del s3://churnalism.com/staging/output/*
./elastic-mapreduce/elastic-mapreduce \
					  --create \
  				 	  --num-instances 4 \
  				 	  --instance-type m2.4xlarge \
					  --credentials ~/.credentials.json \
					  --name "Churnalism Staging All" \
					  --enable-debugging \
					  --bootstrap-action s3://elasticmapreduce/bootstrap-actions/configure-hadoop \
					  --bootstrap-name "Set Hadoop settings" \
					  --arg -m \
					  --arg mapred.tasktracker.reduce.tasks.maximum=1 \
					  --arg -m \
					  --arg io.sort.record.percent=0.57 \
					  --arg -m \
					  --arg io.sort.mb=1024 \
					  --arg -m \
					  --arg io.sort.factor=100 \
					  --bootstrap-action s3://elasticmapreduce/bootstrap-actions/add-swap \
    				  --bootstrap-name "Add 10G Swap" \
    				  --arg 10240 \
					  --jar s3n://churnalism.com/staging/jars/hasher.jar \
					  --step-name "Process News Articles" \
					  --arg s3n://churnalism.com/staging/input/all/ \
					  --arg s3n://churnalism.com/staging/output/all/ \
