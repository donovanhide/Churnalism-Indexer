package org.mediastandardstrust;

import java.io.DataOutputStream;
import java.io.IOException;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.mapreduce.RecordWriter;
import org.apache.hadoop.mapreduce.TaskAttemptContext;

public class BinaryRecordWriter extends RecordWriter<IntWritable, IntArrayWritable> {	
	private DataOutputStream data;
	private DataOutputStream index;
	private int totalDataBytes;
	private byte[] dataBytes;
	private byte[] indexBytes;
	private int MAX_BYTES = 524288;
	private int counter;
	
	public BinaryRecordWriter(DataOutputStream data, DataOutputStream index) {
		this.data = data;
		this.index = index;
		this.dataBytes = new byte[MAX_BYTES];
//		this.indexBytes = new byte[12];
		this.indexBytes = new byte[8];
	}

	@Override
	public void close(TaskAttemptContext context) throws IOException,InterruptedException {
		this.data.close();
		this.index.close();
	}
	
	private void writeIndexInt32(int value,int position) throws IOException {
		this.indexBytes[position]   = (byte)((value >>> 24) & 0xFF);  
		this.indexBytes[position+1] = (byte)((value >>> 16) & 0xFF);
		this.indexBytes[position+2] = (byte)((value >>>  8) & 0xFF);
		this.indexBytes[position+3] = (byte)((value      ) & 0xFF);
	}
	
	private int writeDataVarInt32(int value,int position) throws IOException {
	    counter=0;
		while (true) {
	      if ((value & ~0x7F) == 0) {
	    	  this.dataBytes[position+counter]=(byte)value;
	    	  return ++counter;
	      } else {
	    	  this.dataBytes[position+counter]=(byte)((value & 0x7F) | 0x80);
	    	  value >>>= 7;
	      }
	      counter++;
	    }
	  }
	
	@Override
	public void write(IntWritable key, IntArrayWritable values) throws IOException,InterruptedException {	
		totalDataBytes=0;
		for (int i=0;i<values.get().length;i++){
			totalDataBytes+=writeDataVarInt32(((IntWritable)values.get()[i]).get(), totalDataBytes);
		}
		this.data.write(this.dataBytes, 0, totalDataBytes);
		
		writeIndexInt32(key.get(),0);
		writeIndexInt32(totalDataBytes,4);
		this.index.write(this.indexBytes, 0, 8);
//		writeIndexInt32(values.get().length,8);
//		this.index.write(this.indexBytes, 0, 12);
	}
}
