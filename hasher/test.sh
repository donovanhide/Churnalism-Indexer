ant
#hadoop fs -rmr input/test
#hadoop fs -copyFromLocal test.csv.gz input/test/test.csv.gz
hadoop fs -rmr output
hadoop jar hasher.jar \
-D mapred.child.java.opts="-Xmx1200m" \
-D io.sort.record.percent=0.57 \
-D io.sort.mb=500 \
-D io.sort.factor=100 \
input/all \
output

#input/test.csv.gz \
#input/0000000000-0000050000.csv.gz \
#hadoop fs -cat /user/donovan/output/part-r-00000.gz | gzip -cd
#-D mapred.compress.map.output=true \
#-D mapred.output.compression.type=BLOCK \