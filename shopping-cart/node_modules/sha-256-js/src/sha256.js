/*
sha-256-js

adapted from: https://en.wikipedia.org/wiki/SHA-2#Pseudocode
author: Jeffrey David Allen
created: Sunday, July 2nd, 2017
github: https://github.com/jeffallen6767/sha-256-js
website: http://jdallen.net/


Note 1: All variables are 32 bit unsigned integers and addition is calculated modulo 2^32
Note 2: For each round, there is one round constant k[i] and one entry in the message schedule array w[i], 0 ≤ i ≤ 63
Note 3: The compression function uses 8 working variables, a through h
Note 4: Big-endian convention is used when expressing the constants in this pseudocode,
    and when parsing message block data from bytes to words, for example,
    the first word of the input message "abc" after padding is 0x61626380


Helpers:
----------------------
byte = 8 bits

1111 1111 = FF = 256

dec:000 hex:00 bin:00000000 char:
dec:001 hex:01 bin:00000001 char:☺
dec:002 hex:02 bin:00000010 char:☻
dec:003 hex:03 bin:00000011 char:♥
dec:004 hex:04 bin:00000100 char:♦
dec:005 hex:05 bin:00000101 char:♣
dec:006 hex:06 bin:00000110 char:♠
dec:007 hex:07 bin:00000111 char:
dec:008 hex:08 bin:00001000 char:
dec:009 hex:09 bin:00001001 char:
dec:010 hex:0A bin:00001010 char:[linefeed?]
dec:011 hex:0B bin:00001011 char:♂
dec:012 hex:0C bin:00001100 char:♀
dec:013 hex:0D bin:00001101 char:
dec:014 hex:0E bin:00001110 char:♫
dec:015 hex:0F bin:00001111 char:☼
dec:016 hex:10 bin:00010000 char:►
dec:017 hex:11 bin:00010001 char:◄
dec:018 hex:12 bin:00010010 char:↕
dec:019 hex:13 bin:00010011 char:‼
dec:020 hex:14 bin:00010100 char:¶
dec:021 hex:15 bin:00010101 char:§
dec:022 hex:16 bin:00010110 char:▬
dec:023 hex:17 bin:00010111 char:↨
dec:024 hex:18 bin:00011000 char:↑
dec:025 hex:19 bin:00011001 char:↓
dec:026 hex:1A bin:00011010 char:→
dec:027 hex:1B bin:00011011 char:
dec:028 hex:1C bin:00011100 char:∟
dec:029 hex:1D bin:00011101 char:↔
dec:030 hex:1E bin:00011110 char:▲
dec:031 hex:1F bin:00011111 char:▼
dec:032 hex:20 bin:00100000 char:
dec:033 hex:21 bin:00100001 char:!
dec:034 hex:22 bin:00100010 char:"
dec:035 hex:23 bin:00100011 char:#
dec:036 hex:24 bin:00100100 char:$
dec:037 hex:25 bin:00100101 char:%
dec:038 hex:26 bin:00100110 char:&
dec:039 hex:27 bin:00100111 char:'
dec:040 hex:28 bin:00101000 char:(
dec:041 hex:29 bin:00101001 char:)
dec:042 hex:2A bin:00101010 char:*
dec:043 hex:2B bin:00101011 char:+
dec:044 hex:2C bin:00101100 char:,
dec:045 hex:2D bin:00101101 char:-
dec:046 hex:2E bin:00101110 char:.
dec:047 hex:2F bin:00101111 char:/
dec:048 hex:30 bin:00110000 char:0
dec:049 hex:31 bin:00110001 char:1
dec:050 hex:32 bin:00110010 char:2
dec:051 hex:33 bin:00110011 char:3
dec:052 hex:34 bin:00110100 char:4
dec:053 hex:35 bin:00110101 char:5
dec:054 hex:36 bin:00110110 char:6
dec:055 hex:37 bin:00110111 char:7
dec:056 hex:38 bin:00111000 char:8
dec:057 hex:39 bin:00111001 char:9
dec:058 hex:3A bin:00111010 char::
dec:059 hex:3B bin:00111011 char:;
dec:060 hex:3C bin:00111100 char:<
dec:061 hex:3D bin:00111101 char:=
dec:062 hex:3E bin:00111110 char:>
dec:063 hex:3F bin:00111111 char:?
dec:064 hex:40 bin:01000000 char:@
dec:065 hex:41 bin:01000001 char:A
dec:066 hex:42 bin:01000010 char:B
dec:067 hex:43 bin:01000011 char:C
dec:068 hex:44 bin:01000100 char:D
dec:069 hex:45 bin:01000101 char:E
dec:070 hex:46 bin:01000110 char:F
dec:071 hex:47 bin:01000111 char:G
dec:072 hex:48 bin:01001000 char:H
dec:073 hex:49 bin:01001001 char:I
dec:074 hex:4A bin:01001010 char:J
dec:075 hex:4B bin:01001011 char:K
dec:076 hex:4C bin:01001100 char:L
dec:077 hex:4D bin:01001101 char:M
dec:078 hex:4E bin:01001110 char:N
dec:079 hex:4F bin:01001111 char:O
dec:080 hex:50 bin:01010000 char:P
dec:081 hex:51 bin:01010001 char:Q
dec:082 hex:52 bin:01010010 char:R
dec:083 hex:53 bin:01010011 char:S
dec:084 hex:54 bin:01010100 char:T
dec:085 hex:55 bin:01010101 char:U
dec:086 hex:56 bin:01010110 char:V
dec:087 hex:57 bin:01010111 char:W
dec:088 hex:58 bin:01011000 char:X
dec:089 hex:59 bin:01011001 char:Y
dec:090 hex:5A bin:01011010 char:Z
dec:091 hex:5B bin:01011011 char:[
dec:092 hex:5C bin:01011100 char:\
dec:093 hex:5D bin:01011101 char:]
dec:094 hex:5E bin:01011110 char:^
dec:095 hex:5F bin:01011111 char:_
dec:096 hex:60 bin:01100000 char:`
dec:097 hex:61 bin:01100001 char:a
dec:098 hex:62 bin:01100010 char:b
dec:099 hex:63 bin:01100011 char:c
dec:100 hex:64 bin:01100100 char:d
dec:101 hex:65 bin:01100101 char:e
dec:102 hex:66 bin:01100110 char:f
dec:103 hex:67 bin:01100111 char:g
dec:104 hex:68 bin:01101000 char:h
dec:105 hex:69 bin:01101001 char:i
dec:106 hex:6A bin:01101010 char:j
dec:107 hex:6B bin:01101011 char:k
dec:108 hex:6C bin:01101100 char:l
dec:109 hex:6D bin:01101101 char:m
dec:110 hex:6E bin:01101110 char:n
dec:111 hex:6F bin:01101111 char:o
dec:112 hex:70 bin:01110000 char:p
dec:113 hex:71 bin:01110001 char:q
dec:114 hex:72 bin:01110010 char:r
dec:115 hex:73 bin:01110011 char:s
dec:116 hex:74 bin:01110100 char:t
dec:117 hex:75 bin:01110101 char:u
dec:118 hex:76 bin:01110110 char:v
dec:119 hex:77 bin:01110111 char:w
dec:120 hex:78 bin:01111000 char:x
dec:121 hex:79 bin:01111001 char:y
dec:122 hex:7A bin:01111010 char:z
dec:123 hex:7B bin:01111011 char:{
dec:124 hex:7C bin:01111100 char:|
dec:125 hex:7D bin:01111101 char:}
dec:126 hex:7E bin:01111110 char:~
dec:127 hex:7F bin:01111111 char:⌂
dec:128 hex:80 bin:10000000 char:?
dec:129 hex:81 bin:10000001 char:?
dec:130 hex:82 bin:10000010 char:?
dec:131 hex:83 bin:10000011 char:?
dec:132 hex:84 bin:10000100 char:?
dec:133 hex:85 bin:10000101 char:?
dec:134 hex:86 bin:10000110 char:?
dec:135 hex:87 bin:10000111 char:?
dec:136 hex:88 bin:10001000 char:?
dec:137 hex:89 bin:10001001 char:?
dec:138 hex:8A bin:10001010 char:?
dec:139 hex:8B bin:10001011 char:?
dec:140 hex:8C bin:10001100 char:?
dec:141 hex:8D bin:10001101 char:?
dec:142 hex:8E bin:10001110 char:?
dec:143 hex:8F bin:10001111 char:?
dec:144 hex:90 bin:10010000 char:?
dec:145 hex:91 bin:10010001 char:?
dec:146 hex:92 bin:10010010 char:?
dec:147 hex:93 bin:10010011 char:?
dec:148 hex:94 bin:10010100 char:?
dec:149 hex:95 bin:10010101 char:?
dec:150 hex:96 bin:10010110 char:?
dec:151 hex:97 bin:10010111 char:?
dec:152 hex:98 bin:10011000 char:?
dec:153 hex:99 bin:10011001 char:?
dec:154 hex:9A bin:10011010 char:?
dec:155 hex:9B bin:10011011 char:[backspace or delete?]
dec:156 hex:9C bin:10011100 char:?
dec:157 hex:9D bin:10011101 char:?
dec:158 hex:9E bin:10011110 char:?
dec:159 hex:9F bin:10011111 char:?
dec:160 hex:A0 bin:10100000 char: 
dec:161 hex:A1 bin:10100001 char:¡
dec:162 hex:A2 bin:10100010 char:¢
dec:163 hex:A3 bin:10100011 char:£
dec:164 hex:A4 bin:10100100 char:☼
dec:165 hex:A5 bin:10100101 char:¥
dec:166 hex:A6 bin:10100110 char:▌
dec:167 hex:A7 bin:10100111 char:§
dec:168 hex:A8 bin:10101000 char:"
dec:169 hex:A9 bin:10101001 char:c
dec:170 hex:AA bin:10101010 char:ª
dec:171 hex:AB bin:10101011 char:«
dec:172 hex:AC bin:10101100 char:¬
dec:173 hex:AD bin:10101101 char:-
dec:174 hex:AE bin:10101110 char:r
dec:175 hex:AF bin:10101111 char:_
dec:176 hex:B0 bin:10110000 char:°
dec:177 hex:B1 bin:10110001 char:±
dec:178 hex:B2 bin:10110010 char:²
dec:179 hex:B3 bin:10110011 char:3
dec:180 hex:B4 bin:10110100 char:'
dec:181 hex:B5 bin:10110101 char:µ
dec:182 hex:B6 bin:10110110 char:¶
dec:183 hex:B7 bin:10110111 char:·
dec:184 hex:B8 bin:10111000 char:,
dec:185 hex:B9 bin:10111001 char:1
dec:186 hex:BA bin:10111010 char:º
dec:187 hex:BB bin:10111011 char:»
dec:188 hex:BC bin:10111100 char:¼
dec:189 hex:BD bin:10111101 char:½
dec:190 hex:BE bin:10111110 char:_
dec:191 hex:BF bin:10111111 char:¿
dec:192 hex:C0 bin:11000000 char:A
dec:193 hex:C1 bin:11000001 char:A
dec:194 hex:C2 bin:11000010 char:A
dec:195 hex:C3 bin:11000011 char:A
dec:196 hex:C4 bin:11000100 char:Ä
dec:197 hex:C5 bin:11000101 char:Å
dec:198 hex:C6 bin:11000110 char:Æ
dec:199 hex:C7 bin:11000111 char:Ç
dec:200 hex:C8 bin:11001000 char:E
dec:201 hex:C9 bin:11001001 char:É
dec:202 hex:CA bin:11001010 char:E
dec:203 hex:CB bin:11001011 char:E
dec:204 hex:CC bin:11001100 char:I
dec:205 hex:CD bin:11001101 char:I
dec:206 hex:CE bin:11001110 char:I
dec:207 hex:CF bin:11001111 char:I
dec:208 hex:D0 bin:11010000 char:D
dec:209 hex:D1 bin:11010001 char:Ñ
dec:210 hex:D2 bin:11010010 char:O
dec:211 hex:D3 bin:11010011 char:O
dec:212 hex:D4 bin:11010100 char:O
dec:213 hex:D5 bin:11010101 char:O
dec:214 hex:D6 bin:11010110 char:Ö
dec:215 hex:D7 bin:11010111 char:x
dec:216 hex:D8 bin:11011000 char:O
dec:217 hex:D9 bin:11011001 char:U
dec:218 hex:DA bin:11011010 char:U
dec:219 hex:DB bin:11011011 char:U
dec:220 hex:DC bin:11011100 char:Ü
dec:221 hex:DD bin:11011101 char:Y
dec:222 hex:DE bin:11011110 char:_
dec:223 hex:DF bin:11011111 char:ß
dec:224 hex:E0 bin:11100000 char:à
dec:225 hex:E1 bin:11100001 char:á
dec:226 hex:E2 bin:11100010 char:â
dec:227 hex:E3 bin:11100011 char:a
dec:228 hex:E4 bin:11100100 char:ä
dec:229 hex:E5 bin:11100101 char:å
dec:230 hex:E6 bin:11100110 char:æ
dec:231 hex:E7 bin:11100111 char:ç
dec:232 hex:E8 bin:11101000 char:è
dec:233 hex:E9 bin:11101001 char:é
dec:234 hex:EA bin:11101010 char:ê
dec:235 hex:EB bin:11101011 char:ë
dec:236 hex:EC bin:11101100 char:ì
dec:237 hex:ED bin:11101101 char:í
dec:238 hex:EE bin:11101110 char:î
dec:239 hex:EF bin:11101111 char:ï
dec:240 hex:F0 bin:11110000 char:d
dec:241 hex:F1 bin:11110001 char:ñ
dec:242 hex:F2 bin:11110010 char:ò
dec:243 hex:F3 bin:11110011 char:ó
dec:244 hex:F4 bin:11110100 char:ô
dec:245 hex:F5 bin:11110101 char:o
dec:246 hex:F6 bin:11110110 char:ö
dec:247 hex:F7 bin:11110111 char:÷
dec:248 hex:F8 bin:11111000 char:o
dec:249 hex:F9 bin:11111001 char:ù
dec:250 hex:FA bin:11111010 char:ú
dec:251 hex:FB bin:11111011 char:û
dec:252 hex:FC bin:11111100 char:ü
dec:253 hex:FD bin:11111101 char:y
dec:254 hex:FE bin:11111110 char:_
dec:255 hex:FF bin:11111111 char:ÿ

Test message:
"Jeffrey David Allen"
Expected hashing result:
"33F9383A 82D3ADE9 B4BD7BEB 43691ACA 9DFD2102 3D3102AD 5B02DA94 6BDF11E3"

char - dec - hex - bin
---------------------------
J       74   4A    01001010 (start of message)
e      101   65    01100101
f      102   66    01100110
f      102   66    01100110

r      114   72    01110010
e      101   65    01100101
y      121   79    01111001
(space) 32   20    00100000

D       68   44    01000100
a       97   61    01100001
v      118   76    01110110
i      105   69    01101001

d      100   64    01100100
(space) 32   20    00100000
A       65   41    01000001
l      108   6C    01101100

l      108   6C    01101100
e      101   65    01100101
n      110   6E    01101110 (end of message)
(pad)  128   80    10000000 <--- start of pad - start with a one bit and add minimum 7 0's

(pad)    0   00    00000000
(pad)    0   00    00000000
(pad)    0   00    00000000
(pad)    0   00    00000000

(pad)    0   00    00000000
(pad)    0   00    00000000
(pad)    0   00    00000000
(pad)    0   00    00000000

(pad)    0   00    00000000
(pad)    0   00    00000000
(pad)    0   00    00000000
(pad)    0   00    00000000

(pad)    0   00    00000000
(pad)    0   00    00000000
(pad)    0   00    00000000
(pad)    0   00    00000000

(pad)    0   00    00000000
(pad)    0   00    00000000
(pad)    0   00    00000000
(pad)    0   00    00000000

(pad)    0   00    00000000
(pad)    0   00    00000000
(pad)    0   00    00000000
(pad)    0   00    00000000

(pad)    0   00    00000000
(pad)    0   00    00000000
(pad)    0   00    00000000
(pad)    0   00    00000000

(pad)    0   00    00000000
(pad)    0   00    00000000
(pad)    0   00    00000000
(pad)    0   00    00000000

(pad)    0   00    00000000
(pad)    0   00    00000000
(pad)    0   00    00000000
(pad)    0   00    00000000 <--- end of pad

(size)   0   00    00000000 <--- start size of message as a 64-bit big-endian integer
(size)   0   00    00000000
(size)   0   00    00000000
(size)   0   00    00000000

(size)   0   00    00000000
(size)   0   00    00000000
(size)   0   00    00000000
(size)   0   00    00000000 <--- end size of message as a 64-bit big-endian integer

original message: "Jeffrey David Allen"
char length: 19

1 block = 512 bits (16 words x 32 bits)

*/

function blockOut(block) {
  var width = 8,
    len = block.length,
    stp = len / width,
    x,y,z;
  for (x=0; x<len; x+=stp) {
    z = [];
    for (y=0; y<width; y++) {
      z.push(block[x+y]);
    }
    console.log([x, z.join()].join(" "));
  }
}

function outIdx(vals, size) {
  var len = vals.length,
    
    x,y,z;
  for (x=0; x<len; x++) {
    console.log(x, vals[x]);
  }
}

var zeroBits4bytes = "00000000";
var zeroBits8bytes = "0000000000000000";

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
var k = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];
  
function sha256(input, next) {
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
  var h0 = 0x6a09e667,
    h1 = 0xbb67ae85,
    h2 = 0x3c6ef372,
    h3 = 0xa54ff53a,
    h4 = 0x510e527f,
    h5 = 0x9b05688c,
    h6 = 0x1f83d9ab,
    h7 = 0x5be0cd19;
  
  /*
  Pre-processing:
  begin with the original message of length L bits
  */
  //console.log("input", input);
  
  // 1 character = 8 bits = 1 byte
  var BYTE_SIZE = 8,
    WORD_SIZE_BYTES = 4,
    PAD_START_DEC_VAL = 128,
    
    MIN_PAD_BYTES = 1,
    MSG_SIZE_BYTES = 8,
    MIN_PRE_CALC_BYTES = MIN_PAD_BYTES + MSG_SIZE_BYTES,
    
    BLOCK_SIZE_BYTES = 64,
    
    BYTE_MULT_32_1 = 16777216,
    BYTE_MULT_32_2 = 65536,
    BYTE_MULT_32_3 = 256,
    
    INT_2_TO_THE_32ND = 4294967296,
    
    s0, s1, t0, t1,
    
    ch, maj, temp1, temp2,
    
    a,b,c,d,e,f,g,h,i,j,
    
    u,v,w,
    
    x = 0,
    
    y,z,
    
    digest;
  
  var inputBytes = input.length;
  //console.log("inputBytes", inputBytes);
  
  // 512 - 72 = 460
  // # of chars + 0x80 [1000 0000] + 64bit length of msg in bits
  var preProcessOffsetBytes = (inputBytes + MIN_PRE_CALC_BYTES) % BLOCK_SIZE_BYTES;
  //console.log("preProcessOffsetBytes", preProcessOffsetBytes);
  
  var preProcessZeroPadBytes = preProcessOffsetBytes ? BLOCK_SIZE_BYTES - preProcessOffsetBytes : preProcessOffsetBytes;
  //console.log("preProcessZeroPadBytes", preProcessZeroPadBytes);
  
  var preProcessBlockWidth = inputBytes + MIN_PRE_CALC_BYTES + preProcessZeroPadBytes;
  //console.log("preProcessBlockWidth", preProcessBlockWidth);
  
  var isbuffer = Buffer.isBuffer(input);

  var buffer = isbuffer ? Buffer.allocUnsafe(preProcessBlockWidth-inputBytes) : new Array(preProcessBlockWidth);
  
  // add message
  if (!isbuffer) {
    for (x=0; x<inputBytes; x++) {
      buffer[x] = input.charCodeAt(x);
    }
  }
  
  // add 1st pad byte:
  buffer[x++] = PAD_START_DEC_VAL;
  
  // add zero pad fill:
  for (y=0; y<preProcessZeroPadBytes; y++) {
    buffer[x++] = 0;
  }

  // add 8 byte size:
  var inputSizeInBits = inputBytes * BYTE_SIZE;
  //console.log("inputSizeInBits", inputSizeInBits);
  
  var sizeBytes = inputSizeInBits.toString(16);
  //console.log("sizeBytes", sizeBytes);
  
  var hexSize = zeroBits8bytes.substr(sizeBytes.length) + sizeBytes;
  //console.log("hexSize", hexSize);
  
  var arrHexSize = hexSize.split("");
  while (arrHexSize.length > 0) {
    var aByte = arrHexSize.shift() + arrHexSize.shift();
    buffer[x++] = parseInt(aByte, 16);
  }

  if (isbuffer) {
    buffer = Buffer.concat([input, buffer], preProcessBlockWidth);
  }
  
  /*
  break message into 512-bit chunks
  for each chunk
    create a 64-entry message schedule array w[0..63] of 32-bit words
    (The initial values in w[0..63] don't matter, so many implementations zero them here)
    copy chunk into first 16 words w[0..15] of the message schedule array
  */
  for (x=0; x<preProcessBlockWidth; x+=BLOCK_SIZE_BYTES) {
    //console.log("x", x);
    
    w = new Array(BLOCK_SIZE_BYTES);
    for (z=0; z<16; z++) {
      u = z * WORD_SIZE_BYTES;
      v = x + u;
      w[z] = buffer[v] * BYTE_MULT_32_1 + buffer[v+1] * BYTE_MULT_32_2 + buffer[v+2] * BYTE_MULT_32_3 + buffer[v+3];
      //console.log("z", z, "u", u, "v", v, "w["+z+"]", w[z]);
    }
   
    /*
    Extend the first 16 words into the remaining 48 words w[16..63] of the message schedule array:
      s0 := (w[i-15] rightrotate 7) xor (w[i-15] rightrotate 18) xor (w[i-15] rightshift 3)
      s1 := (w[i-2] rightrotate 17) xor (w[i-2] rightrotate 19) xor (w[i-2] rightshift 10)
      w[i] := w[i-16] + s0 + w[i-7] + s1
    */
    for (z=16; z<64; z++) {
      u = w[z-15];
      //s0 = (u >>> 7 | u << (32 - 7)) ^ (u >>> 18 | u << (32 - 18)) ^ (u >>> 3);
      s0 = (u >>> 7 | u << 25) ^ (u >>> 18 | u << 14) ^ (u >>> 3);
      u = w[z-2];
      //s1 = (u >>> 17 | u << (32 - 17)) ^ (u >>> 19 | u << (32 - 19)) ^ (u >>> 10);
      s1 = (u >>> 17 | u << 15) ^ (u >>> 19 | u << 13) ^ (u >>> 10);
      w[z] = (w[z-16] + s0 + w[z-7] + s1) >>> 0;
    }
    
    //console.log("w int32 x 64 block\n");
    //blockOut(w);
    
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
      //s1 = (e >>> 6 | e << (32 - 6)) ^ (e >>> 11 | e << (32 - 11)) ^ (e >>> 25 | e << (32 - 25));
      s1 = (e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7);
      /*
      ch := (e and f) xor ((not e) and g)
      */
      ch = (e & f) ^ ((~e) & g);
      /*
      temp1 := h + S1 + ch + k[i] + w[i]
      */
      temp1 = (h + s1 + ch + k[i] + w[i]) >>> 0;
      /*
      S0 := (a rightrotate 2) xor (a rightrotate 13) xor (a rightrotate 22)
      */
      //s0 = (a >>> 2 | a << (32 - 2)) ^ (a >>> 13 | a << (32 - 13)) ^ (a >>> 22 | a << (32 - 22));
      s0 = (a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10);
      /*
      maj := (a and b) xor (a and c) xor (b and c)
      */
      maj = (a & b) ^ (a & c) ^ (b & c);
      /*
      temp2 := S0 + maj
      */
      temp2 = (s0 + maj) >>> 0;
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
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
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
    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }
  /*
  Produce the final hash value (big-endian):
  digest := hash := h0 append h1 append h2 append h3 append h4 append h5 append h6 append h7
  */
  digest = [
    h0,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    h7
  ];
  //console.log("digest\n", digest);
  
  var hash = digest.map(function(uInt32) {
    var hex = uInt32.toString(16),
      len = hex.length;
    return len < BYTE_SIZE ? zeroBits4bytes.substr(len) + hex : hex;
  });
  
  var output = hash.join("");
  
  //console.log(typeof next);
  
  return "function" === typeof next ? next(output) : output;
}

module.exports = sha256;
