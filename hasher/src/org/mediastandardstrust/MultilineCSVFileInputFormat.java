package org.mediastandardstrust;

import java.io.IOException;

import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.*;
import org.apache.hadoop.mapreduce.InputSplit;
import org.apache.hadoop.mapreduce.JobContext;
import org.apache.hadoop.mapreduce.RecordReader;
import org.apache.hadoop.mapreduce.TaskAttemptContext;
import org.apache.hadoop.mapreduce.lib.input.*;

public class MultilineCSVFileInputFormat extends FileInputFormat<IntWritable,Text> {

	@Override
	public RecordReader<IntWritable,Text> createRecordReader(InputSplit split,TaskAttemptContext context) throws IOException,InterruptedException {
		return new MultilineCSVFileRecordReader();
	}
	
	@Override
	protected boolean isSplitable(JobContext context, Path file) {
		return false;
	}
}
