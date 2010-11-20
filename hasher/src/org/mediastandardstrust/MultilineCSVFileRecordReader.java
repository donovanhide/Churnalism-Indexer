package org.mediastandardstrust;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.List;

import org.apache.hadoop.fs.*;
import org.apache.hadoop.io.*;
import org.apache.hadoop.io.compress.CompressionCodec;
import org.apache.hadoop.io.compress.CompressionCodecFactory;
import org.apache.hadoop.mapreduce.*;
import org.apache.hadoop.mapreduce.lib.input.*;
import org.supercsv.io.CsvListReader;
import org.supercsv.prefs.CsvPreference;

public class MultilineCSVFileRecordReader extends RecordReader<IntWritable, Text> {
//	private TaskAttemptContext context;
	private FileSplit fileSplit;
	private CsvListReader csvReader;
	private FSDataInputStream in;
	private IntWritable key;
	private Text value;
	
	@Override
	public void initialize( InputSplit split, TaskAttemptContext context) throws IOException, InterruptedException {
//		this.context = context;
		this.fileSplit = (FileSplit)split;
		Path file = this.fileSplit.getPath();
		FileSystem fs = file.getFileSystem(context.getConfiguration());
	    CompressionCodecFactory compressionCodecs = new CompressionCodecFactory(context.getConfiguration());
	    CompressionCodec codec = compressionCodecs.getCodec(file);
		in = fs.open(file);;
		csvReader = new CsvListReader(new BufferedReader(new InputStreamReader(codec.createInputStream(in))),CsvPreference.STANDARD_PREFERENCE);
		csvReader.getCSVHeader(true);
		//Skip header line
		key = new IntWritable();
		value = new Text();
	}
	
	@Override
	public void close() throws IOException {
		csvReader.close();
		in.close();
	}
	
	@Override
	public IntWritable getCurrentKey() throws IOException,InterruptedException {
		return key; 
	}

	@Override
	public Text getCurrentValue() throws IOException,InterruptedException {
		return value;
	}
	

	@Override
	public float getProgress() throws IOException, InterruptedException {
		return in.getPos()/(float)fileSplit.getLength();
	}

	@Override
	public boolean nextKeyValue() throws IOException, InterruptedException {
		List<String> nextLine = csvReader.read();
		if (nextLine!=null){
			key.set(Integer.parseInt(nextLine.get(0)));
			value.set(nextLine.get(1));
			return true;
		}
		return false;
	}
}
