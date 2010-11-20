package org.mediastandardstrust;

import java.util.ArrayList;
import org.apache.hadoop.io.ArrayWritable;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.Writable;
import org.apache.hadoop.util.StringUtils;

public class IntArrayWritable extends ArrayWritable { 
	public IntArrayWritable() { 
		super(IntWritable.class); 
	}
	
	public ArrayList<Integer> getIntValues(){
		ArrayList<Integer> values = new ArrayList<Integer>(this.get().length);
		for (Writable v:this.get()){
			values.add(((IntWritable)v).get());
		}
		return values;
	}
	
	public String toString(){
		return StringUtils.arrayToString(this.toStrings());
	}
}