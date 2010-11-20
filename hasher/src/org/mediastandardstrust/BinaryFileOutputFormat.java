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
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.util.ReflectionUtils;

public class BinaryFileOutputFormat extends FileOutputFormat<IntWritable, IntArrayWritable> {	
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
	    Path file = getDefaultWorkFile(job, extension);
	    FileSystem fs = file.getFileSystem(conf);
	    if (!isCompressed) {
//	      FSDataOutputStream fileOut = fs.create(file,false,131072);
	    	FSDataOutputStream fileOut = fs.create(file,false);
	      return new BinaryFileRecordWriter(fileOut);
	    } else {
//	      FSDataOutputStream fileOut = fs.create(file, false,131072);
	    	FSDataOutputStream fileOut = fs.create(file,false);
	      return new BinaryFileRecordWriter(new DataOutputStream(codec.createOutputStream(fileOut)));
	    }
	}
	
}

