s3cmd del s3://churnalism.com/production/output/*
./elastic-mapreduce/elastic-mapreduce     --create \
					  --instance-type m2.4xlarge \
					  --credentials ~/.credentials.json \
					  --name "Churnalism Production All" \
					  --enable-debugging \
					  --bootstrap-action s3://elasticmapreduce/bootstrap-actions/configure-hadoop \
					  --bootstrap-name "Set Hadoop settings" \
					  --arg -m \
					  --arg io.sort.record.percent=0.57 \
					  --arg -m \
					  --arg io.sort.mb=1024 \
					  --arg -m \
					  --arg io.sort.factor=100 \
					  --jar s3n://churnalism.com/production/jars/hasher.jar \
					  --step-name "Process News Articles" \
					  --arg s3n://churnalism.com/production/input/all/ \
					  --arg s3n://churnalism.com/production/output/all/ \
