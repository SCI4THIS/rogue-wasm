NS_curses = { };

NS_curses.calc_index = function(x,y)
{
  return y * this.COLS + x;
}

NS_curses.move = function(y,x)
{
  this.pos.x = x;
  this.pos.y = y;
}

NS_curses.clear = function()
{
  for (let i=0; i<(this.LINES * this.COLS); i++) {
    this.grid[i] = 32;
  }
}

NS_curses.inch = function()
{
  return this.grid[this.calc_index(this.pos.x, this.pos.y)];
}

NS_curses.addch = function(c)
{
  if (c == 10) {
    this.pos.x = 0;
    this.pos.y++;
    return;
  }
  this.grid[this.calc_index(this.pos.x, this.pos.y)] = c;
  this.pos.x++;
}

NS_curses.clrtoeol = function()
{
  while (this.pos.x < this.COLS) {
    this.addch(32);
  }
}

NS_curses.getcury = function(w)
{
  return this.pos.y;
}

NS_curses.getcurx = function(w)
{
  return this.pos.x;
}

NS_curses.printw = function(s)
{
  for (let i=0; i<s.length; i++) {
    this.addch(s[i]);
  }
}

function lookup_cmap_glyph_sub(cmap, char_code)
{
  switch (cmap.format) {
    case 0: return null;
    case 4:
      let i;
      let length = cmap.startCode.length;
      if (length != cmap.endCode.length) {
        alert("cmap length mismatch startCode != endCode");
        return null;
      }
      if (length != cmap.idRangeOffset.length) {
        alert("cmap length mismatch startCode != idRangeOffset");
        return null;
      }
      if (length != cmap.idDelta.length) {
        alert("cmap length mismatch startCode != idDelta");
        return null;
      }
      for (i=0; i<length; i++) {
        if (cmap.startCode[i] <= char_code && char_code <= cmap.endCode[i]) {
          break;
	}
      }
      if (i == length) {
        return null;
      }
      if (cmap.idRangeOffset[i] == 0) {
        return cmap.idDelta[i] + char_code;
      }
      let index_offset = i + cmap.idRangeOffset[i] / 2 + (char_code - cmap.startCode[i]);
      if (index_offset < cmap.idRangeOffset.length) {
        return cmap.idRangeOffset[index_offset];
      }
      if (index_offset - length < cmap.glyphIdArray.length) {
        return cmap.glyphIdArray[index_offset - length];
      }
      return null;
      break;
    case 6:
      if (cmap.firstCode <= char_code && char_code < (cmap.firstCode + cmap.entryCount)) {
        return cmap.glyphIdArray[char_code - cmap.firstCode];
      }
      return null;
    default:
      alert("(Lookup) Unhandled format: " + cmap.format);
      break;

  }
}

function lookup_cmap_glyph(cmap, char_code)
{
  let ret = null;
  for (let i=0; i<cmap.subtables.length; i++) {
    ret = lookup_cmap_glyph_sub(cmap.subtables[i], char_code);
    if (ret != null) {
      break;
    }
  }
  return ret;
}

function draw(arg)
{
  let idx = lookup_cmap_glyph(arg.glf.cmap, arg.charCode);
  let tab = arg.glf.lookup[idx];
  if (tab == null) {
    if (arg.charCode != 32) {
      console.log("error looking up: " + arg.charCode);
    }
    return;
  }
  arg.vao.bind(arg.gl.ELEMENT_ARRAY_BUFFER);
  const ext = gl.getExtension("OES_element_index_uint");
  let start = tab.start;
  let len = tab.len;
  arg.gl.drawElements(arg.gl.TRIANGLES, len, arg.gl.UNSIGNED_INT, 4 * start);
}


NS_curses.refresh = function()
{
  let xmin = 0;
  let ymin = -409;
  let scale = 0.0004885197850512946;

  let m_T = Matrix(Float32Array, 4, 4, [ 1, 0, 0, 0,
                                         0, 1, 0, 0,
                                         0, 0, 1,     0,
                                         -xmin, -ymin, 0,     1 ]);

  let m_S = Matrix(Float32Array, 4, 4, [scale,     0, 0, 0,
                                             0, scale, 0, 0,
                                             0,     0, 1, 0,
                                             0,     0, 0, 1 ]);

  let m_ST = matrix(Float32Array, 4, 4);
  m_ST.mul(m_S, m_T);
  for (let y=0; y<this.LINES; y++) {
    for (let x=0; x<this.COLS; x++) {
      let c = this.grid[this.calc_index(x,y)];
      let scale1 = 2 / (this.COLS);
      let scale2 = 2 / (this.LINES);
      let m_T2 = Matrix(Float32Array, 4, 4, [ 1, 0, 0, 0,
                                              0, 1, 0, 0,
                                              0, 0, 1,     0,
                                              -1.0 + (scale1 * x), 1.0 -(scale2 * (y+1)), 0,   1 ]);

      let m_S2 = Matrix(Float32Array, 4, 4, [ scale1,     0, 0, 0,
                                              0, scale2, 0, 0,
                                              0,     0, 1, 0,
                                              0,     0, 0, 1 ]);
      let m_ST2 = matrix(Float32Array, 4, 4);
      m_ST2.mul(m_T2, m_S2);
      this.caM.mul(m_ST2, m_ST);
      this.prag.run(this.prog, draw, { gl: this.gl, vao: this.vao, glf: this.glf, charCode: c });
    }
  }
}

function Curses(options)
{
  if (options.gl == undefined) {
    alert("Curses(options) must define options.gl");
    return null;
  }
  if (options.glf == undefined) {
    alert("Curses(options) must define options.glf");
    return null;
  }
  let glf = options.glf;
  let vbo_m = Matrix(Float32Array, 4, glf.pts.length / 4, glf.pts);
  let vbo = VBO({ gl: options.gl, m: vbo_m});
  let vao_m = Matrix(Uint32Array, 1, glf.idx.length, glf.idx);
  let vao = VBO({ gl: options.gl, m: vao_m});
  let caM = matrix(Float32Array, 4, 4);
  let prog = create_prog();
  let prag = create_prag(vbo, caM._data);
  let c = {
    gl: options.gl,
    glf: options.glf,
    caM: caM,
    prog: prog,
    prag: prag,
    vbo: vbo,
    vao: vao,
    LINES: options.LINES || 24,
    COLS: options.COLS || 80,
    pos: { x: 0, y: 0 },
    grid: [],
    calc_index: NS_curses.calc_index,
    move: NS_curses.move,
    inch: NS_curses.inch,
    addch: NS_curses.addch,
    getcurx: NS_curses.getcurx,
    getcury: NS_curses.getcury,
    refresh: NS_curses.refresh,
    clrtoeol: NS_curses.clrtoeol,
    clear: NS_curses.clear,
  };
  c.clear();
  return c;
}
