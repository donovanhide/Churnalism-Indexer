package org.mediastandardstrust;

import java.io.IOException;
import java.util.*;        
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.conf.*;
import org.apache.hadoop.io.*;
import org.apache.hadoop.io.compress.GzipCodec;
import org.apache.hadoop.mapreduce.*;
import org.apache.hadoop.mapreduce.lib.output.TextOutputFormat;
import org.apache.hadoop.util.*;
import org.apache.hadoop.util.hash.MurmurHash;

public class Hasher extends Configured implements Tool {
	public static class Map extends Mapper<IntWritable,Text,LongWritable,IntWritable>{
		protected static int WINDOW_SIZE=15;
		protected MurmurHash murmur;
		protected LongWritable outputKey;
		protected IntWritable outputValue;
		protected SuperFastMatch hasher;
		protected int hash;
		
		protected void setup(Context context) throws IOException, InterruptedException {
			murmur = new MurmurHash();
			outputKey = new LongWritable();
			outputValue = new IntWritable();
			hasher = new SuperFastMatch(15,24);
		}
		
		public void map(IntWritable key, Text value, Context context) throws IOException,InterruptedException {
			outputValue.set(key.get());
			for (long h: hasher.getHashes(value.toString())) { 
				outputKey.set(((h<<32))|key.get());
				context.write(outputKey,outputValue); 
			}
		}
	} 

	public static class Reduce extends Reducer<LongWritable,IntWritable,IntWritable,IntArrayWritable> {
		protected IntWritable outputKey;
		protected IntArrayWritable outputValue;
		protected ArrayList<IntWritable> valuesList;
		protected int MAX_VALUES_LENGTH = 524288; 
		
		protected int valuesLength;
		protected int maxValue;
		protected int previousValue;
		protected int currentValue;

		protected void setup(Context context) throws IOException,InterruptedException{
			outputKey = new IntWritable();
			valuesList = new ArrayList<IntWritable>();
			outputValue = new IntArrayWritable();
			for (int i=0;i<MAX_VALUES_LENGTH;i++){
				valuesList.add(new IntWritable());
			}
		}
		
		public void reduce(LongWritable key, Iterable<IntWritable> values, Context context) throws IOException,InterruptedException {
			valuesLength = 0;
			previousValue = 0;
			for (IntWritable v:values){
				currentValue = v.get()-previousValue;
				valuesList.get(valuesLength).set(currentValue);
				previousValue=v.get();
				valuesLength++;
			}
			assert(valuesLength<MAX_VALUES_LENGTH);
			outputValue.set(valuesList.subList(0, valuesLength).toArray(new IntWritable[valuesLength]));
			outputKey.set((int)(key.get()>>>32));
			context.write(outputKey,outputValue);
		}
	}
	
	public static class LeftShiftPartitioner extends Partitioner<LongWritable, IntWritable> {
		 public int getPartition(LongWritable key, IntWritable value,int numReduceTasks) {
//		    return (int)(key.get()>>>32 & Integer.MAX_VALUE) % numReduceTasks;
		    return (int)((key.get()>>>32 & Integer.MAX_VALUE) / ((1<<24)/numReduceTasks));
		 }
	}
	
    public static class LeftShiftComparator extends WritableComparator {
        public LeftShiftComparator() {
          super(LongWritable.class);
        }

        public int compare(byte[] b1, int s1, int l1,byte[] b2, int s2, int l2) {
        	//Only checks the first 4 bytes, missing out the value
        	return compareBytes(b1, s1, 4, b2, s2, 4);
        }
      }

        
	public int run(String[] args) throws Exception {
		Job job = new Job(getConf());
		job.setJarByClass(Hasher.class);
		job.setJobName("hasher");
		
		job.setOutputKeyClass(LongWritable.class);
		job.setOutputValueClass(IntWritable.class);
		job.setPartitionerClass(LeftShiftPartitioner.class);
		job.setGroupingComparatorClass(LeftShiftComparator.class);
        
		job.setMapperClass(Map.class);
		job.setReducerClass(Reduce.class);
		
		job.setInputFormatClass(MultilineCSVFileInputFormat.class);
//		job.setOutputFormatClass(TextOutputFormat.class);
		job.setOutputFormatClass(BinaryOutputFormat.class);
		
//		job.setNumReduceTasks(4);
		
		MultilineCSVFileInputFormat.setInputPaths(job, new Path(args[0]));
		TextOutputFormat.setOutputPath(job, new Path(args[1]));
		TextOutputFormat.setCompressOutput(job, true);
		TextOutputFormat.setOutputCompressorClass(job, GzipCodec.class);

		boolean success = job.waitForCompletion(true);
		return success ? 0 : 1;
	}
	
	public static void main(String[] args) throws Exception {
		int ret = ToolRunner.run(new Hasher(), args);
		System.exit(ret);
	}
        
}

