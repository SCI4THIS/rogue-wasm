#!/bin/bash

sed -f amalgamate_program.sed src/index.html > tmp1.js
sed -f amalgamate_prag.sed tmp1.js > tmp2.js
sed -f amalgamate_vbo.sed tmp2.js > tmp3.js
sed -f amalgamate_matrix.sed tmp3.js > tmp4.js
sed -f amalgamate_curses.sed tmp4.js > tmp5.js
sed -f amalgamate_vt323.sed tmp5.js > tmp6.js

mv tmp6.js index.html
rm tmp5.js
rm tmp4.js
rm tmp3.js
rm tmp2.js
rm tmp1.js
