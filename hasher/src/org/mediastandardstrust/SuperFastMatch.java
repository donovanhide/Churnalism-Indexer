package org.mediastandardstrust;
import java.util.SortedSet;
import java.util.TreeSet;

public class SuperFastMatch {
	private SortedSet<Integer> hashes;
	private int windowSize;
	private int bits;
	private int bitMask;
	
	//MurmurHash
	private int seed = -1;
	private int m = 0x5bd1e995;
	private int r = 24;
	
	public SuperFastMatch(int windowSize,int bits){
		hashes = new TreeSet<Integer>();
		this.windowSize = windowSize;
		this.bits = bits;
		bitMask = ((1<<bits)-1);
	}
	
	public SortedSet<Integer> getHashes(String line){
		hashes.clear();
		for (int i = 0;i<(line.length()-windowSize);i++){
			System.out.println(line.substring(i, i+windowSize+1));
			System.out.println(reduceBits(murmurHash(line.substring(i, i+windowSize+1).getBytes())));
			hashes.add(reduceBits(murmurHash(line.substring(i, i+windowSize+1).getBytes())));
		}
		return hashes;
	}
	
	private int murmurHash(byte[] data){
		int h = this.seed ^ data.length;
		int len_4 = data.length >> 2;
		for (int i = 0; i < len_4; i++) {
			  int i_4 = i << 2;
			  int k = data[i_4 + 3];
			  k = k << 8;
			  k = k | (data[i_4 + 2] & 0xff);
			  k = k << 8;
			  k = k | (data[i_4 + 1] & 0xff);
			  k = k << 8;
			  k = k | (data[i_4 + 0] & 0xff);
			  k *= m;
			  k ^= k >>> r;
			  k *= m;
  			  h *= m;
  			  h ^= k;
		}
	    // avoid calculating modulo
	    int len_m = len_4 << 2;
	    int left = data.length - len_m;

	    if (left != 0) {
	      if (left >= 3) {
	        h ^= (int) data[data.length - 3] << 16;
	      }
	      if (left >= 2) {
	        h ^= (int) data[data.length - 2] << 8;
	      }
	      if (left >= 1) {
	        h ^= (int) data[data.length - 1];
	      }

	      h *= m;
	    }

	    h ^= h >>> 13;
	    h *= m;
	    h ^= h >>> 15;
	    return h;
	}
	
	private int reduceBits(int hash){
		return (hash>>>bits) ^ (hash & bitMask);
	}
	
}
