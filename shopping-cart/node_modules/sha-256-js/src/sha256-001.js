/*
sha-256-js

adapted from: https://en.wikipedia.org/wiki/SHA-2#Pseudocode
author: Jeffrey David Allen
created: Sunday, July 2nd, 2017
github: https://github.com/jeffallen6767/sha-256-js
website: http://jdallen.net/


Note 1: All variables are 32 bit unsigned integers and addition is calculated modulo 232
Note 2: For each round, there is one round constant k[i] and one entry in the message schedule array w[i], 0 ≤ i ≤ 63
Note 3: The compression function uses 8 working variables, a through h
Note 4: Big-endian convention is used when expressing the constants in this pseudocode,
    and when parsing message block data from bytes to words, for example,
    the first word of the input message "abc" after padding is 0x61626380


Helpers:
----------------------
*/
var zeroBit = 0,
	oneBit = 1;

function rightrotate(arBits, num) {
	var bits = arBits.slice(),
		x;
	for (x=0; x<num; x++) {
		bits.unshift(
			bits.pop()
		);
	}
	return bits;
}

function rightshift(arBits, num) {
	var bits = arBits.slice(),
		x;
	for (x=0; x<num; x++) {
		bits.pop();
		bits.unshift(zeroBit);
	}
	return bits;
}

/* not = invert all the bits */
function not(arBits) {
	var result = arBits.map(function(bit) {
		return bit ? 0 : 1;
	});
	return result;
}

/* and all arguments (arrays of bits) */
function and() {
	var args = [].slice.call(arguments),
		bits = args.shift().slice();
	args.forEach(function(arg, y) {
		arg.forEach(function(bit, x) {
			bits[x] &= bit;
		});
	});
	return bits;
}

/* exclusive or all arguments (arrays of bits) */
function xor() {
	var args = [].slice.call(arguments),
		bits = args.shift().slice();
	args.forEach(function(arg, y) {
		arg.forEach(function(bit, x) {
			bits[x] ^= bit;
		});
	});
	return bits;
}

/* add all arguments (arrays of bits) */
function add() {
	var args = [].slice.call(arguments),
		bits = args.shift().slice();
	args.forEach(function(arg, y) {
		var carry = 0,
			len = arg.length,
			x,z;
		for (x=len-1; x>-1; x--) {
			z = bits[x] + arg[x] + carry;
			switch (z) {
				case 3:
					bits[x] = oneBit;
					carry = 1;
					break;
				case 2:
					bits[x] = zeroBit;
					carry = 1;
					break;
				case 1:
					bits[x] = oneBit;
					carry = 0;
					break;
				case 0:
					bits[x] = zeroBit;
					carry = 0;
					break;
				default:
					throw new Error(["add",y,x,bits[x],arg[x],carry,z].join(" "));
					break;
			}
		}
	});
	return bits;
}

function hex2bin(hex) {
	var bin = hex.toString(2),
		bits = bin.split('').map(function(bit){return +bit;});
	// pad to 32 bits
	while (bits.length < 32) {
		bits.unshift(zeroBit);
	}
	return bits;
}

function arrayHex2bin(hexArray) {
	var result = hexArray.map(hex2bin);
	return result;
}

function bin2hex(bin) {
	var hex = parseInt(bin.join(''), 2).toString(16).toUpperCase();
	// pad to 8 bytes
	while (hex.length < 8) {
		hex = "0" + hex;
	}
	return hex;
}

function arrayBin2hex(binArray) {
	var result = binArray.map(bin2hex);
	return result;
}

/* hash the message and return 256 bits in hex */
function sha256(message, debugging) {

	var debugOutput = [],
		noop = function(){},
		out = debugging ? function() {
			debugOutput.push(
				[].slice.call(arguments).join(" ")
			);
		} : noop;

	try {
		/*
		Initialize hash values:
		(first 32 bits of the fractional parts of the square roots of the first 8 primes 2..19):
		h0 := 0x6a09e667
		h1 := 0xbb67ae85
		h2 := 0x3c6ef372
		h3 := 0xa54ff53a
		h4 := 0x510e527f
		h5 := 0x9b05688c
		h6 := 0x1f83d9ab
		h7 := 0x5be0cd19
		*/
		var h0 = hex2bin(0x6a09e667),
			h1 = hex2bin(0xbb67ae85),
			h2 = hex2bin(0x3c6ef372),
			h3 = hex2bin(0xa54ff53a),
			h4 = hex2bin(0x510e527f),
			h5 = hex2bin(0x9b05688c),
			h6 = hex2bin(0x1f83d9ab),
			h7 = hex2bin(0x5be0cd19);

		//out("h0", bin2hex(h0), h0);
		//out("h1", bin2hex(h1), h1);
		//out("h2", bin2hex(h2), h2);
		//out("h3", bin2hex(h3), h3);
		//out("h4", bin2hex(h4), h4);
		//out("h5", bin2hex(h5), h5);
		//out("h6", bin2hex(h6), h6);
		//out("h7", bin2hex(h7), h7);

		/*
		Initialize array of round constants:
		(first 32 bits of the fractional parts of the cube roots of the first 64 primes 2..311):
		k[0..63] :=
		   0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
		   0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
		   0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
		   0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
		   0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
		   0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
		   0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
		   0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
		*/
		var k = arrayHex2bin([
		   0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
		   0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
		   0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
		   0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
		   0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
		   0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
		   0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
		   0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
		]);
/*
		k.forEach(function(val, idx) {
			out("k"+idx, bin2hex(val), val);
		});
*/
		var digest = "",

			arMsg = message.split(''),
			arMsgLen = arMsg.length,

			originalBits = [],
			originalBitsLength = 0,

			err = null,

			i, s0, s1,

			S0, S1, ch, maj, temp1, temp2,

			a,b,c,d,e,f,g,h,

			l,m,n,o,p,

			u,v,w,x,y,z,

			z1, z2, z3;

		/*
		Pre-processing:
		begin with the original message of length L bits
		*/
		//out("message", message);
		//out("arMsg", arMsg);
		//out("arMsgLen", arMsgLen);
		for (u=0; u<arMsgLen; u++) {
			//out("u", u);
			v = arMsg[u];
			//out("v", v);
			w = v.charCodeAt(0);
			//out("w", w);
			x = w.toString(2);
			//out("x", x);
			y = x.split('');
			//out("y", y);
			v = y.length;
			w = 8 - v;
			for (x=0; x<w; x++) {
				//out("bit[" + x + "] =", zeroBit);
				originalBits.push(zeroBit);
			}
			for (x=0; x<v; x++) {
				z = y[x];
				//out("bit[" + (x + w) + "] =", z);
				originalBits.push(+z);
			}
		}
		//var originalBits = message.toString(2);
		//out("originalBits", originalBits);

		originalBitsLength = originalBits.length;
		//out("originalBitsLength", originalBitsLength);
		/*
		append a single '1' bit
		*/
		u = originalBits.slice();
		u.push(oneBit);
		//out("u", u);
		/*
		append K '0' bits, where K is the minimum number >= 0 such that L + 1 + K + 64 is a multiple of 512
		*/

		v = u.length;
		//out("length", v);
		w = (v + 64);
		//out("length + 64", w);
		v = w % 512;
		//out("length + 64 % 512", v);
		//w = 512 - 64 - v;
		w = 512 - v;
		//out("w", w);
		for (x=0; x<w; x++) {
			u.push(zeroBit);
		}
		//out("u", u);
		y = u.length;
		//out("y", y);
		/*
		append L as a 64-bit big-endian integer, making the total post-processed length a multiple of 512 bits
		*/
		//out("originalBitsLength", originalBitsLength);
		z = originalBitsLength.toString(2).split('');
		//out("z", z);
		v = z.length;
		//out("v", v);
		w = 64 - v;
		//out("w", w);
		for (x=0; x<w; x++) {
			u.push(zeroBit);
		}
		for (x=0; x<v; x++) {
			u.push(+z[x]);
		}
		//out("u", u);
		v = u.length;
		//out("v", v);
		w = v % 512;
		//out("w", w ? "ERROR! preprocess block length invalid " + w : "Success! Block length " + v + " % 512 = " + w);

		/*
		Process the message in successive 512-bit chunks:
		*/
		for (x=0; x<v; x+=512) {
				//out("chunk", x / 512, x);
			/*
			break message into 512-bit chunks
			for each chunk
		    create a 64-entry message schedule array w[0..63] of 32-bit words
		    (The initial values in w[0..63] don't matter, so many implementations zero them here)
		    */
		    w = [];
		    /*
		    copy chunk into first 16 words w[0..15] of the message schedule array
			*/
			for (y=0; y<16; y++) {
				w[y] = [];
				for (z=0; z<32; z++) {
					w[y].push(
						u[x + y * 32 + z]
					);
				}
				//out("w[" + y + "]", w[y], bin2hex(w[y]));
			}

			/*
		    Extend the first 16 words into the remaining 48 words w[16..63] of the message schedule array:
		    for i from 16 to 63
		    */
			for (i=16; i<64; i++) {
				/*
		        s0 := (w[i-15] rightrotate 7) xor (w[i-15] rightrotate 18) xor (w[i-15] rightshift 3)
		        */
		        y = w[i-15];
		        //out(i,"y",y);
		        z = rightrotate(y, 7);
		        //out("z", z);
		        z1 = rightrotate(y, 18);
		        //out("z1", z1);
		        z2 = rightshift(y, 3);
		        //out("z2", z2);
		        s0 = xor(z, z1, z2);
		        //out("s0", s0);
		        /*
		        s1 := (w[i-2] rightrotate 17) xor (w[i-2] rightrotate 19) xor (w[i-2] rightshift 10)
		        */
		        y = w[i-2];
		        //out(i,"y",y);
		        z = rightrotate(y, 17);
		        //out("z", z);
		        z1 = rightrotate(y, 19);
		        //out("z1", z1);
		        z2 = rightshift(y, 10);
		        //out("z2", z2);
		        s1 = xor(z, z1, z2);
		        //out("s1", s1);
		        /*
		        w[i] := w[i-16] + s0 + w[i-7] + s1
				*/
				y = w[i-16];
				//out("y", y);
				z = w[i-7];
				//out("z", z);
				w[i] = add(y, s0, z, s1);
				//out("w["+i+"]", w[i]);
			}
			/*
		    Initialize working variables to current hash value:
		    a := h0
		    b := h1
		    c := h2
		    d := h3
		    e := h4
		    f := h5
		    g := h6
		    h := h7
			*/
			a = h0;
			b = h1;
			c = h2;
			d = h3;
			e = h4;
			f = h5;
			g = h6;
			h = h7;
			/*
		    Compression function main loop:
		    for i from 0 to 63
		    	*/
		    for (i=0; i<64; i++) {
		    	/*
		        S1 := (e rightrotate 6) xor (e rightrotate 11) xor (e rightrotate 25)
		        */
		        l = rightrotate(e, 6);
		        m = rightrotate(e, 11);
		        n = rightrotate(e, 25);
		        S1 = xor(l, m, n);
		        //out("S1", S1);
		        /*
		        ch := (e and f) xor ((not e) and g)
		        */
		        l = and(e, f);
		        m = not(e);
		        n = and(m, g);
		        ch = xor(l, n);
		        //out("ch", ch);
		        /*
		        temp1 := h + S1 + ch + k[i] + w[i]
		        */
		        temp1 = add(h, S1, ch, k[i], w[i]);
		        //out("temp1", temp1);
		        /*
		        S0 := (a rightrotate 2) xor (a rightrotate 13) xor (a rightrotate 22)
		        */
		        l = rightrotate(a, 2);
		        m = rightrotate(a, 13);
		        n = rightrotate(a, 22);
		        S0 = xor(l, m, n);
		        //out("S0", S0);
		        /*
		        maj := (a and b) xor (a and c) xor (b and c)
		        */
		        l = and(a, b);
		        m = and(a, c);
		        n = and(b, c);
		        maj = xor(l, m, n);
		        //out("maj", maj);
		        /*
		        temp2 := S0 + maj
		 		*/
		 		temp2 = add(S0, maj);
		 		//out("temp2", temp2);
		 		/*
		        h := g
		        g := f
		        f := e
		        e := d + temp1
		        d := c
		        c := b
		        b := a
		        a := temp1 + temp2
				*/
				h = g;
		        g = f;
		        f = e;
		        e = add(d, temp1);
		        //out("e", e);
		        d = c;
		        c = b;
		        b = a;
		        a = add(temp1, temp2);
		        //out("a", a);
		        //out("t="+i, arrayBin2hex([a,b,c,d,e,f,g,h]).join(' '));
			}
			/*
		    Add the compressed chunk to the current hash value:
		    h0 := h0 + a
		    h1 := h1 + b
		    h2 := h2 + c
		    h3 := h3 + d
		    h4 := h4 + e
		    h5 := h5 + f
		    h6 := h6 + g
		    h7 := h7 + h
		    */
		    //out("h0", bin2hex(h0), "+", bin2hex(a), "=", bin2hex(add(h0, a)));
		    h0 = add(h0, a);
		    //out("h1", bin2hex(h1), "+", bin2hex(b), "=", bin2hex(add(h1, b)));
		    h1 = add(h1, b);
		    //out("h2", bin2hex(h2), "+", bin2hex(c), "=", bin2hex(add(h2, c)));
		    h2 = add(h2, c);
		    //out("h3", bin2hex(h3), "+", bin2hex(d), "=", bin2hex(add(h3, d)));
		    h3 = add(h3, d);
		    //out("h4", bin2hex(h4), "+", bin2hex(e), "=", bin2hex(add(h4, e)));
		    h4 = add(h4, e);
		    //out("h5", bin2hex(h5), "+", bin2hex(f), "=", bin2hex(add(h5, f)));
		    h5 = add(h5, f);
		    //out("h6", bin2hex(h6), "+", bin2hex(g), "=", bin2hex(add(h6, g)));
		    h6 = add(h6, g);
		    //out("h7", bin2hex(h7), "+", bin2hex(h), "=", bin2hex(add(h7, h)));
		    h7 = add(h7, h);
		}
		/*
		Produce the final hash value (big-endian):
		digest := hash := h0 append h1 append h2 append h3 append h4 append h5 append h6 append h7
		*/
		digest = arrayBin2hex([h0,h1,h2,h3,h4,h5,h6,h7]);
	} catch (e) {
		err = e;
		console.error("ERROR", e);
	} finally {
		return debugging ? [digest.join(" "), debugOutput, err] : digest.join('');
	}
}

module.exports = sha256;
