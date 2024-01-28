WebAssembly / WebGL port of Rogue.

index.html is the entirity.  

Preview / use here

https://htmlpreview.github.io/?https://github.com/SCI4THIS/rogue-wasm/blob/main/index.html

index.html is the final compiled HTML amalgam file.  This is also provided
for ease of use.  If you want to experiment you can run

$ cd src; python3 -m http.server

to run a non-amalgamated version to more easily view logic flow.

Rogue was written by Michael Toy, Ken Arnold and Glenn Wichman.
Code was copied from David Silva's github:

https://github.com/Davidslv/rogue

For the old-school aesthetic Peter Hull's VT323 font was used.

https://fonts.google.com/specimen/VT323

The C code was compiled using clang's wasm32 output and then ran through binaryen's
assyncify process to handle the keyboard I/O.
