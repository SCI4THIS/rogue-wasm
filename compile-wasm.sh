# Note make sure to run with mingw-64 and not msys-64

for FILE in `ls ../*\.c` tmp.c
do
  clang -I../../pdcurses -I/home/A/emsdk/upstream/emscripten/cache/sysroot/include --target=wasm32 -emit-llvm -c -S $FILE
done

rm *\.o

for FILE in `ls *\.ll`
do
  llc -march=wasm32 -filetype=obj $FILE
done

/home/A/emsdk/upstream/bin/wasm-ld.exe --no-entry --import-undefined --export-all -o rogue-temp.wasm `ls *\.o`
#/home/A/emsdk/upstream/bin/wasm-ld.exe --no-entry --import-undefined --export-all --allow-undefined -o rogue-temp.wasm `ls *\.o`

/home/A/wabt/bin/wasm2wat.exe rogue-temp.wasm > rogue.wat
/home/A/wabt/bin/wat2wasm.exe rogue.wat

/home/A/binaryen/build/bin/wasm-opt.exe -O1 --asyncify rogue.wasm -o rogue-asyncify.wasm
