package org.mediastandardstrust;

import java.io.DataOutputStream;
import java.io.IOException;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataOutputStream;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.*;
import org.apache.hadoop.io.compress.CompressionCodec;
import org.apache.hadoop.io.compress.GzipCodec;
import org.apache.hadoop.mapreduce.RecordWriter;
import org.apache.hadoop.mapreduce.TaskAttemptContext;
import org.apache.hadoop.mapreduce.lib.output.FileOutputCommitter;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.util.ReflectionUtils;

public class BinaryOutputFormat extends FileOutputFormat<IntWritable, IntArrayWritable> {	
	@Override
	public RecordWriter<IntWritable, IntArrayWritable> getRecordWriter(TaskAttemptContext job) throws IOException, InterruptedException {
		String extension = "";
		Configuration conf = job.getConfiguration();
	    boolean isCompressed = getCompressOutput(job);
	    CompressionCodec codec = null;
	    if (isCompressed) {
	      Class<? extends CompressionCodec> codecClass = getOutputCompressorClass(job, GzipCodec.class);
	      codec = (CompressionCodec) ReflectionUtils.newInstance(codecClass, conf);
	      extension = codec.getDefaultExtension();
	    }
	    Path dataFile = getDefaultWorkFile(job, extension);
	    FileOutputCommitter committer = (FileOutputCommitter) getOutputCommitter(job);
	    Path indexFile = new Path(committer.getWorkPath(), getUniqueFile(job, "index", extension));
	    FileSystem fs = dataFile.getFileSystem(conf);
	    if (!isCompressed) {
//	        FSDataOutputStream fileOut = fs.create(file,false,131072);
	    	FSDataOutputStream dataFileOut = fs.create(dataFile,false);
	    	FSDataOutputStream indexFileOut = fs.create(indexFile,false);
	    	return new BinaryRecordWriter(dataFileOut,indexFileOut);
	    } else {
//	        FSDataOutputStream fileOut = fs.create(file, false,131072);
	    	FSDataOutputStream dataFileOut = fs.create(dataFile,false);
	    	FSDataOutputStream indexFileOut = fs.create(indexFile,false);
	    	return new BinaryRecordWriter(new DataOutputStream(codec.createOutputStream(dataFileOut)),
	    		   new DataOutputStream(codec.createOutputStream(indexFileOut)));
	    }
	}
	
}

