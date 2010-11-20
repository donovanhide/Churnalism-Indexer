package org.mediastandardstrust;

import java.io.DataOutputStream;
import java.io.IOException;
import java.math.BigInteger;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.mapreduce.RecordWriter;
import org.apache.hadoop.mapreduce.TaskAttemptContext;

public class BinaryFileRecordWriter extends RecordWriter<IntWritable, IntArrayWritable> {	
	private DataOutputStream out;
	private BigInteger bytes;
	private IntWritable[] valuesArray;
	private int numberBits;
	private int valuesLength;
	
	public BinaryFileRecordWriter(DataOutputStream out) {
		this.out = out;
	}

	@Override
	public void close(TaskAttemptContext context) throws IOException,InterruptedException {
		out.close();
	}
	
	@Override
	public void write(IntWritable key, IntArrayWritable values) throws IOException,InterruptedException {		
		out.writeInt(key.get());
//		System.out.println(key.get());
		valuesArray = (IntWritable[])values.get();
				
		//If single value write with high bit set
		if (valuesArray[0].get()==1){
			out.writeInt(valuesArray[2].get()|(1<<31));
		}
		else{
			bytes=BigInteger.ZERO;
			numberBits = (short)Integer.toBinaryString(valuesArray[1].get()).length();
			valuesLength = (short)(valuesArray[0].get()-1);
			for (int i=0;i<valuesLength;i++){	
				bytes=bytes.shiftLeft(numberBits);
				bytes=bytes.or(BigInteger.valueOf(valuesArray[i+3].get()));
			}
			out.writeInt(valuesArray[2].get());
			out.writeInt(numberBits<<16|valuesLength);
			//Deal with BigInteger adding a bit for signedness, ie. trim last byte
			if ((numberBits%8)==0){
				byte[] temp = bytes.toByteArray();
				for (int i=0;i<(temp.length-1);i++){
					out.write(temp[i]);
				}
			}
			else{
				int padding = (int)((Math.ceil((numberBits*valuesLength)/8.0))-(Math.ceil(bytes.bitLength()/8.0)));
				if (padding>0){
					out.write(new byte[padding]);
				}
				out.write(bytes.toByteArray());	
			}
//			System.out.println(key.get());
//			System.out.println(padding);
//			System.out.println(bytes.toByteArray().length);
//			System.out.println(numberBits);
//			System.out.println(valuesLength);
		}
	}

}
