/* ---------- Mini Python runner ---------- */
class PyError extends Error { constructor(type, msg, line) { super(msg); this.pyType = type; this.line = line; } }
class Unsupported extends Error {}
class BreakSignal extends Error {}
class ContinueSignal extends Error {}
class ReturnSignal extends Error { constructor(value) { super(); this.value = value; } }
let CMODE = false;
let JMODE = false;
const I = v => ({ k: 'int', v }), F = v => ({ k: 'float', v });
const PYKW = new Set(['False','None','True','and','as','assert','async','await','break','class','continue','def','del','elif','else','except','finally','for','from','global','if','import','in','is','lambda','nonlocal','not','or','pass','raise','return','try','while','with','yield']);
const UNSUP_SIMPLE = /^(import|from|try|except|finally|with|lambda|assert|del|raise|yield|async|await|input)\b/;
const BUILTINS = new Set(['print','len','str','int','float','type','abs','round','max','min','range','sum','sorted','enumerate','zip','list','dict','tuple','set','reversed']);
const AUG = ['+=','-=','*=','/=','%='];
const PLIMIT = 300000;

const isStr = x => typeof x === 'string';
function toNum(x) { if (x && typeof x === 'object' && (x.k === 'int' || x.k === 'float')) return x; if (typeof x === 'boolean') return I(x ? 1 : 0); return null; }
function tname(x) {
  if (isStr(x)) return 'str'; if (typeof x === 'boolean') return 'bool'; if (x === null) return 'NoneType';
  if (x && x.k === 'list') return 'list'; if (x && x.k === 'tuple') return 'tuple'; if (x && x.k === 'dict') return 'dict'; if (x && x.k === 'set') return 'set';
  if (x && x.k === 'instance') return x.cls.name; if (x && x.k === 'class') return 'type'; if (x && x.k === 'function') return 'function';
  return x.k === 'type' ? 'type' : x.k;
}
function fmtFloat(v) { if (Number.isNaN(v)) return 'nan'; if (!Number.isFinite(v)) return v > 0 ? 'inf' : '-inf'; if (Number.isInteger(v) && Math.abs(v) < 1e16) return v.toFixed(1); return String(v); }
function pyRepr(s) { return (s.includes("'") && !s.includes('"')) ? '"' + s + '"' : "'" + s.replace(/'/g, "\\'") + "'"; }
function pyReprVal(x) {
  if (isStr(x)) return pyRepr(x);
  if (typeof x === 'boolean') return x ? 'True' : 'False';
  if (x === null) return 'None';
  if (x && (x.k === 'int' || x.k === 'float')) return pyStr(x);
  if (x && x.k === 'list') return '[' + x.v.map(pyReprVal).join(', ') + ']';
  if (x && x.k === 'tuple') return x.v.length === 1 ? '(' + pyReprVal(x.v[0]) + ',)' : '(' + x.v.map(pyReprVal).join(', ') + ')';
  if (x && x.k === 'dict') { const parts = []; for (const [, pair] of x.v) parts.push(pyReprVal(pair[0]) + ': ' + pyReprVal(pair[1])); return '{' + parts.join(', ') + '}'; }
  if (x && x.k === 'set') { if (x.v.size === 0) return 'set()'; return '{' + [...x.v.values()].map(pyReprVal).join(', ') + '}'; }
  if (x && x.k === 'instance') return '<' + x.cls.name + ' object>';
  if (x && x.k === 'class') return "<class '" + x.name + "'>";
  if (x && x.k === 'function') return '<function ' + x.name + '>';
  return pyStr(x);
}
function pyStr(x) {
  if (isStr(x)) return x;
  if (typeof x === 'boolean') return x ? 'True' : 'False';
  if (x === null) return 'None';
  if (x.k === 'int') return String(x.v);
  if (x.k === 'float') return fmtFloat(x.v);
  if (x.k === 'type') return "<class '" + x.name + "'>";
  if (x.k === 'list' || x.k === 'tuple' || x.k === 'dict' || x.k === 'set' || x.k === 'instance' || x.k === 'class' || x.k === 'function') return pyReprVal(x);
  return String(x);
}
function truthy(x) {
  if (x === null) return false; if (typeof x === 'boolean') return x; if (isStr(x)) return x.length > 0;
  if (x && (x.k === 'int' || x.k === 'float')) return x.v !== 0;
  if (x && x.k === 'list') return x.v.length > 0; if (x && x.k === 'tuple') return x.v.length > 0;
  if (x && x.k === 'dict') return x.v.size > 0; if (x && x.k === 'set') return x.v.size > 0;
  return true;
}
function unesc(s) { const map = { n: '\n', t: '\t', r: '\r', '\\': '\\', "'": "'", '"': '"' }; return s.replace(/\\(.)/g, (m, c) => (c in map ? map[c] : m)); }
function numRes(v, x, y) { return (x.k === 'float' || y.k === 'float') ? F(v) : I(v); }
function roundHalfEven(x) { if (Math.abs(x % 1) === 0.5) return 2 * Math.round(x / 2); return Math.round(x); }

/* ---- list/dict/set/tuple data model ---- */
const L = arr => ({ k: 'list', v: arr });
const T = arr => ({ k: 'tuple', v: arr });
const D = () => ({ k: 'dict', v: new Map() });
const S = () => ({ k: 'set', v: new Map() });
function rawKey(k) {
  if (isStr(k)) return 's:' + k;
  if (typeof k === 'boolean') return 'b:' + k;
  if (k === null) return 'n:';
  if (k && (k.k === 'int' || k.k === 'float')) return 'i:' + k.v;
  throw new PyError('TypeError', "unhashable type: '" + tname(k) + "'");
}
function dictSet(d, key, value) { d.v.set(rawKey(key), [key, value]); }
function dictGet(d, key) { const e = d.v.get(rawKey(key)); return e ? e[1] : undefined; }
function dictHas(d, key) { return d.v.has(rawKey(key)); }
function dictDel(d, key) { const rk = rawKey(key); if (!d.v.has(rk)) throw new PyError('KeyError', pyReprVal(key)); d.v.delete(rk); }
function setAdd(s, val) { s.v.set(rawKey(val), val); }
function setHas(s, val) { return s.v.has(rawKey(val)); }
function pyEq(a, b) {
  if (a && a.k === 'list' && b && b.k === 'list') return a.v.length === b.v.length && a.v.every((x, i) => pyEq(x, b.v[i]));
  if (a && a.k === 'tuple' && b && b.k === 'tuple') return a.v.length === b.v.length && a.v.every((x, i) => pyEq(x, b.v[i]));
  const x = toNum(a), y = toNum(b);
  if (x && y) return x.v === y.v;
  if (isStr(a) && isStr(b)) return a === b;
  if (typeof a === 'boolean' || typeof b === 'boolean') return a === b;
  if (a === null || b === null) return a === b;
  return a === b;
}
function pyIn(item, container) {
  if (isStr(container)) { if (!isStr(item)) throw new PyError('TypeError', "'in <string>' requires string as left operand, not " + tname(item)); return container.includes(item); }
  if (container && container.k === 'list') return container.v.some(x => pyEq(x, item));
  if (container && container.k === 'tuple') return container.v.some(x => pyEq(x, item));
  if (container && container.k === 'dict') return dictHas(container, item);
  if (container && container.k === 'set') return setHas(container, item);
  throw new PyError('TypeError', "argument of type '" + tname(container) + "' is not iterable");
}
function normIdx(i, len) { return i < 0 ? i + len : i; }
function pyIndex(base, idxVal) {
  const idx = toNum(idxVal);
  if (isStr(base)) { if (!idx || idx.k !== 'int') throw new PyError('TypeError', 'string indices must be integers'); const i = normIdx(idx.v, base.length); if (i < 0 || i >= base.length) throw new PyError('IndexError', 'string index out of range'); return base[i]; }
  if (base && (base.k === 'list' || base.k === 'tuple')) { if (!idx || idx.k !== 'int') throw new PyError('TypeError', (base.k === 'list' ? 'list' : 'tuple') + ' indices must be integers'); const i = normIdx(idx.v, base.v.length); if (i < 0 || i >= base.v.length) throw new PyError('IndexError', base.k + ' index out of range'); return base.v[i]; }
  if (base && base.k === 'dict') { const v = dictGet(base, idxVal); if (v === undefined) throw new PyError('KeyError', pyReprVal(idxVal)); return v; }
  throw new PyError('TypeError', "'" + tname(base) + "' object is not subscriptable");
}
function pySetIndex(base, idxVal, value) {
  const idx = toNum(idxVal);
  if (base && base.k === 'list') { if (!idx || idx.k !== 'int') throw new PyError('TypeError', 'list indices must be integers'); const i = normIdx(idx.v, base.v.length); if (i < 0 || i >= base.v.length) throw new PyError('IndexError', 'list assignment index out of range'); base.v[i] = value; return; }
  if (base && base.k === 'dict') { dictSet(base, idxVal, value); return; }
  throw new PyError('TypeError', "'" + tname(base) + "' object does not support item assignment");
}
function pySlice(base, loVal, hiVal) {
  const get = (v, len) => { if (v == null) return null; const n = toNum(v); if (!n) throw new PyError('TypeError', 'slice indices must be integers'); return n.v; };
  if (isStr(base)) { const len = base.length; let lo = get(loVal, len), hi = get(hiVal, len); if (lo == null) lo = 0; if (hi == null) hi = len; if (lo < 0) lo = Math.max(0, lo + len); if (hi < 0) hi = Math.max(0, hi + len); return base.slice(lo, hi); }
  if (base && (base.k === 'list' || base.k === 'tuple')) { const len = base.v.length; let lo = get(loVal, len), hi = get(hiVal, len); if (lo == null) lo = 0; if (hi == null) hi = len; if (lo < 0) lo = Math.max(0, lo + len); if (hi < 0) hi = Math.max(0, hi + len); const sl = base.v.slice(lo, hi); return base.k === 'list' ? L(sl) : T(sl); }
  throw new PyError('TypeError', "'" + tname(base) + "' object is not subscriptable");
}
function pyIterate(val) {
  if (isStr(val)) return val.split('');
  if (val && val.k === 'list') return val.v.slice();
  if (val && val.k === 'tuple') return val.v.slice();
  if (val && val.k === 'set') return [...val.v.values()];
  if (val && val.k === 'dict') return [...val.v.values()].map((pair) => pair[0]);
  if (val && val.k === 'range') { const out = []; for (let i = val.start; val.step > 0 ? i < val.stop : i > val.stop; i += val.step) out.push(I(i)); return out; }
  throw new PyError('TypeError', "'" + tname(val) + "' object is not iterable");
}

function binop(op, a, b) {
  const x = toNum(a), y = toNum(b);
  if (op === '+') {
    if (JMODE && (isStr(a) || isStr(b))) return jstr(a) + jstr(b);
    if (isStr(a) && isStr(b)) return a + b;
    if (x && y) return numRes(x.v + y.v, x, y);
    if (a && a.k === 'list' && b && b.k === 'list') return L(a.v.concat(b.v));
    if (a && a.k === 'tuple' && b && b.k === 'tuple') return T(a.v.concat(b.v));
    if (isStr(a)) throw new PyError('TypeError', 'can only concatenate str (not "' + tname(b) + '") to str');
    if (a && a.k === 'list') throw new PyError('TypeError', 'can only concatenate list (not "' + tname(b) + '") to list');
  } else if (op === '*') {
    if (x && y) return numRes(x.v * y.v, x, y);
    const rep = (s, n) => { if (s.length * Math.max(n, 0) > 200000) throw new PyError('MemoryError', 'result too large for the prototype runner'); return n > 0 ? s.repeat(n) : ''; };
    if (isStr(a) && y && y.k === 'int') return rep(a, y.v);
    if (isStr(b) && x && x.k === 'int') return rep(b, x.v);
    if (a && a.k === 'list' && y && y.k === 'int') { const out = []; for (let i = 0; i < Math.max(y.v, 0); i++) out.push(...a.v); return L(out); }
    if (b && b.k === 'list' && x && x.k === 'int') { const out = []; for (let i = 0; i < Math.max(x.v, 0); i++) out.push(...b.v); return L(out); }
    if ((isStr(a) && (isStr(b) || y)) || (isStr(b) && x)) throw new PyError('TypeError', "can't multiply sequence by non-int of type '" + (isStr(a) ? tname(b) : tname(a)) + "'");
  } else if (x && y) {
    switch (op) {
      case '-': return numRes(x.v - y.v, x, y);
      case '/':
        if (CMODE) { if (x.k === 'int' && y.k === 'int') { if (y.v === 0) throw new PyError('ZeroDivisionError', 'division by zero'); return I(Math.trunc(x.v / y.v)); } return F(x.v / y.v); }
        if (y.v === 0) throw new PyError('ZeroDivisionError', 'division by zero'); return F(x.v / y.v);
      case '//': if (y.v === 0) throw new PyError('ZeroDivisionError', (x.k === 'int' && y.k === 'int') ? 'integer division or modulo by zero' : 'float floor division by zero'); return numRes(Math.floor(x.v / y.v), x, y);
      case '%': if (CMODE) { if (y.v === 0) throw new PyError('ZeroDivisionError', 'division by zero'); return numRes(x.v % y.v, x, y); }
        if (y.v === 0) throw new PyError('ZeroDivisionError', (x.k === 'int' && y.k === 'int') ? 'integer modulo by zero' : 'float modulo'); return numRes(((x.v % y.v) + y.v) % y.v, x, y);
      case '**':
        if (x.v === 0 && y.v < 0) throw new PyError('ZeroDivisionError', '0.0 cannot be raised to a negative power');
        if (x.k === 'int' && y.k === 'int' && y.v >= 0) return I(Math.pow(x.v, y.v));
        return F(Math.pow(x.v, y.v));
    }
  }
  throw new PyError('TypeError', 'unsupported operand type(s) for ' + (op === '**' ? '** or pow()' : op) + ": '" + tname(a) + "' and '" + tname(b) + "'");
}
function cmpv(op, p, q) { switch (op) { case '<': return p < q; case '>': return p > q; case '<=': return p <= q; default: return p >= q; } }
function cmp(op, a, b) {
  const x = toNum(a), y = toNum(b);
  if (op === '==' || op === '!=') { const eq = pyEq(a, b); return op === '==' ? eq : !eq; }
  if (x && y) return cmpv(op, x.v, y.v);
  if (isStr(a) && isStr(b)) return cmpv(op, a, b);
  if (a && a.k === 'list' && b && b.k === 'list') return cmpv(op, JSON.stringify(a.v.map(pyReprVal)), JSON.stringify(b.v.map(pyReprVal)));
  throw new PyError('TypeError', "'" + op + "' not supported between instances of '" + tname(a) + "' and '" + tname(b) + "'");
}

function formatValue(v, spec) {
  if (!spec) return pyStr(v);
  const m = /^([<>^])?(\d+)?(,)?(?:\.(\d+)f|(d))?$/.exec(spec);
  if (!m) throw new PyError('ValueError', "Invalid format specifier '" + spec + "' for object of type '" + tname(v) + "'");
  const align = m[1], width = m[2], comma = m[3], prec = m[4], d = m[5];
  const n = toNum(v);
  let s;
  if (prec !== undefined) { if (!n) throw new PyError('ValueError', "Unknown format code 'f' for object of type '" + tname(v) + "'"); s = n.v.toFixed(+prec); }
  else if (d) { if (!n || n.k !== 'int') throw new PyError('ValueError', "Unknown format code 'd' for object of type '" + tname(v) + "'"); s = String(n.v); }
  else s = pyStr(v);
  if (comma && n) { const p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); s = p.join('.'); }
  if (width) {
    const w = +width, al = align || (n ? '>' : '<');
    if (s.length < w) { const pad = w - s.length; s = al === '<' ? s + ' '.repeat(pad) : al === '>' ? ' '.repeat(pad) + s : ' '.repeat(Math.floor(pad / 2)) + s + ' '.repeat(Math.ceil(pad / 2)); }
  }
  return s;
}

function tokenize(src) {
  const toks = []; let i = 0; const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === ' ' || c === '\t' || c === '\r' || c === '\n') { i++; continue; }
    if (c === '#') break;
    const fm = /^[fF](?=["'])/.exec(src.slice(i, i + 2));
    if (fm || c === '"' || c === "'") {
      let isF = false;
      if (fm) { isF = true; i++; }
      const q = src[i];
      if (src.startsWith(q + q + q, i)) throw new Unsupported();
      let j = i + 1;
      while (j < n && src[j] !== q) { if (src[j] === '\\') j++; j++; }
      if (j >= n) throw new PyError('SyntaxError', 'unterminated string literal');
      toks.push({ type: isF ? 'fstr' : 'str', value: src.slice(i + 1, j) });
      i = j + 1; continue;
    }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
      const m = /^(?:\d[\d_]*(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/.exec(src.slice(i));
      const txt = m[0]; i += txt.length;
      if (i < n && /[A-Za-z_]/.test(src[i])) throw new PyError('SyntaxError', 'invalid decimal literal');
      toks.push({ type: 'num', value: parseFloat(txt.replace(/_/g, '')), isFloat: /[.eE]/.test(txt) });
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(src.slice(i));
      toks.push({ type: 'name', value: m[0] }); i += m[0].length; continue;
    }
    const three = src.substr(i, 3), two = src.substr(i, 2);
    if (three === '**=' || three === '//=') throw new Unsupported();
    if (['**', '//', '==', '!=', '<=', '>=', '+=', '-=', '*=', '/=', '%='].includes(two)) { toks.push({ type: 'op', value: two }); i += 2; continue; }
    if ('+-*/%<>()=,.[]{}:'.includes(c)) { toks.push({ type: 'op', value: c }); i++; continue; }
    if (';@&|^~?'.includes(c)) throw new Unsupported();
    if (c.charCodeAt(0) > 127) throw new PyError('SyntaxError', "invalid character '" + c + "' (U+" + c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0') + ')');
    throw new PyError('SyntaxError', 'invalid syntax');
  }
  return toks;
}

function compileExprString(s) { const P = new Parser(tokenize(s)); const e = P.parseExpr(); P.end(); return e; }
function compileFString(raw) {
  const parts = []; let lit = ''; let i = 0;
  const flush = () => { if (lit !== '') { parts.push(unesc(lit)); lit = ''; } };
  while (i < raw.length) {
    const ch = raw[i];
    if (ch === '{') {
      if (raw[i + 1] === '{') { lit += '{'; i += 2; continue; }
      let depth = 0, q = null, j = i + 1;
      for (; j < raw.length; j++) {
        const d = raw[j];
        if (q) { if (d === q) q = null; continue; }
        if (d === '"' || d === "'") { q = d; continue; }
        if (d === '(' || d === '{') depth++;
        else if (d === ')') depth--;
        else if (d === '}') { if (depth === 0) break; depth--; }
      }
      if (j >= raw.length) throw new PyError('SyntaxError', "f-string: expecting '}'");
      let inner = raw.slice(i + 1, j), spec = '';
      depth = 0; q = null;
      for (let k = 0; k < inner.length; k++) {
        const d = inner[k];
        if (q) { if (d === q) q = null; continue; }
        if (d === '"' || d === "'") { q = d; continue; }
        if (d === '(' || d === '{') depth++;
        else if (d === ')' || d === '}') depth--;
        else if (d === ':' && depth === 0) { spec = inner.slice(k + 1); inner = inner.slice(0, k); break; }
      }
      if (inner.trim() === '') throw new PyError('SyntaxError', 'f-string: empty expression not allowed');
      flush();
      parts.push({ e: compileExprString(inner), spec });
      i = j + 1; continue;
    }
    if (ch === '}') { if (raw[i + 1] === '}') { lit += '}'; i += 2; continue; } throw new PyError('SyntaxError', "f-string: single '}' is not allowed"); }
    if (ch === '\\') { lit += ch + (raw[i + 1] || ''); i += 2; continue; }
    lit += ch; i++;
  }
  flush();
  return c => parts.map(p => typeof p === 'string' ? p : formatValue(p.e(c), p.spec)).join('');
}

function callMethod(o, name, args) {
  if (isStr(o)) {
    switch (name) {
      case 'upper': return o.toUpperCase();
      case 'lower': return o.toLowerCase();
      case 'title': return o.replace(/[A-Za-z]+/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase());
      case 'capitalize': return o ? o[0].toUpperCase() + o.slice(1).toLowerCase() : o;
      case 'strip': return o.trim();
      case 'lstrip': return o.replace(/^\s+/, '');
      case 'rstrip': return o.replace(/\s+$/, '');
      case 'split': { const sep = args.length ? args[0] : null; const parts = sep === null ? o.trim().split(/\s+/).filter(x => x !== '') : o.split(sep); return L(parts); }
      case 'join': { if (!args.length || !args[0] || args[0].k !== 'list') throw new PyError('TypeError', 'join() requires a list'); const items = args[0].v; if (!items.every(isStr)) throw new PyError('TypeError', 'sequence item: expected str instance'); return items.join(o); }
      case 'format': return fmtJ ? fmtJ(o, args) : o;
      case 'length': case 'size': return I(o.length);
      case 'toUpperCase': return o.toUpperCase();
      case 'toLowerCase': return o.toLowerCase();
      case 'charAt': { const n = toNum(args[0]); if (!n || n.v < 0 || n.v >= o.length) throw new PyError('IndexError', 'index out of range'); return o[n.v]; }
      case 'substring': { const a0 = toNum(args[0]), b0 = args[1] === undefined ? null : toNum(args[1]); return o.slice(a0 ? a0.v : 0, b0 ? b0.v : undefined); }
      case 'indexOf': return I(o.indexOf(String(args[0])));
      case 'contains': return o.includes(String(args[0]));
      case 'equals': return o === args[0];
      case 'equalsIgnoreCase': return isStr(args[0]) && o.toLowerCase() === args[0].toLowerCase();
      case 'isEmpty': return o.length === 0;
      case 'startsWith': return o.startsWith(String(args[0]));
      case 'endsWith': return o.endsWith(String(args[0]));
      case 'concat': return o + String(args[0]);
      case 'replace': if (args.length >= 2 && isStr(args[0]) && isStr(args[1])) return o.split(args[0]).join(args[1]); break;
    }
  }
  throw new PyError('AttributeError', "'" + tname(o) + "' object has no attribute '" + name + "'");
}

function listMethod(o, name, args) {
  switch (name) {
    case 'append': o.v.push(args[0]); return null;
    case 'extend': o.v.push(...pyIterate(args[0])); return null;
    case 'insert': { const i = toNum(args[0]); o.v.splice(Math.max(0, Math.min(o.v.length, i.v < 0 ? i.v + o.v.length : i.v)), 0, args[1]); return null; }
    case 'pop': { if (!o.v.length) throw new PyError('IndexError', 'pop from empty list'); const i = args.length ? toNum(args[0]).v : -1; const idx = i < 0 ? i + o.v.length : i; if (idx < 0 || idx >= o.v.length) throw new PyError('IndexError', 'pop index out of range'); return o.v.splice(idx, 1)[0]; }
    case 'remove': { const idx = o.v.findIndex(x => pyEq(x, args[0])); if (idx < 0) throw new PyError('ValueError', 'list.remove(x): x not in list'); o.v.splice(idx, 1); return null; }
    case 'index': { const idx = o.v.findIndex(x => pyEq(x, args[0])); if (idx < 0) throw new PyError('ValueError', pyReprVal(args[0]) + ' is not in list'); return I(idx); }
    case 'count': return I(o.v.filter(x => pyEq(x, args[0])).length);
    case 'sort': { const rev = args.length === 0 ? false : false; o.v.sort((a, b) => cmp('<', a, b) ? -1 : cmp('>', a, b) ? 1 : 0); return null; }
    case 'reverse': o.v.reverse(); return null;
    case 'copy': return L(o.v.slice());
    case 'clear': o.v.length = 0; return null;
  }
  throw new PyError('AttributeError', "'list' object has no attribute '" + name + "'");
}
function dictMethod(o, name, args) {
  switch (name) {
    case 'get': { const v = dictGet(o, args[0]); return v === undefined ? (args.length > 1 ? args[1] : null) : v; }
    case 'keys': return L([...o.v.values()].map((p) => p[0]));
    case 'values': return L([...o.v.values()].map((p) => p[1]));
    case 'items': return L([...o.v.values()].map((p) => T([p[0], p[1]])));
    case 'pop': { if (!dictHas(o, args[0])) { if (args.length > 1) return args[1]; throw new PyError('KeyError', pyReprVal(args[0])); } const v = dictGet(o, args[0]); dictDel(o, args[0]); return v; }
    case 'update': { const other = args[0]; for (const [, pair] of other.v) dictSet(o, pair[0], pair[1]); return null; }
    case 'copy': { const d = D(); for (const [k, pair] of o.v) d.v.set(k, pair.slice()); return d; }
    case 'setdefault': { if (dictHas(o, args[0])) return dictGet(o, args[0]); const dv = args.length > 1 ? args[1] : null; dictSet(o, args[0], dv); return dv; }
  }
  throw new PyError('AttributeError', "'dict' object has no attribute '" + name + "'");
}
function setMethod(o, name, args) {
  switch (name) {
    case 'add': setAdd(o, args[0]); return null;
    case 'remove': { if (!setHas(o, args[0])) throw new PyError('KeyError', pyReprVal(args[0])); o.v.delete(rawKey(args[0])); return null; }
    case 'discard': { o.v.delete(rawKey(args[0])); return null; }
    case 'copy': { const s = S(); for (const [k, v] of o.v) s.v.set(k, v); return s; }
  }
  throw new PyError('AttributeError', "'set' object has no attribute '" + name + "'");
}

function findMethod(cls, name) { let c = cls; while (c) { if (c.methods.has(name)) return c.methods.get(name); c = c.base; } return null; }
function getAttr(o, name) {
  if (o && o.k === 'instance') {
    if (name in o.attrs) return o.attrs[name];
    const m = findMethod(o.cls, name);
    if (m) return { k: 'boundmethod', fn: m, self: o };
    throw new PyError('AttributeError', "'" + o.cls.name + "' object has no attribute '" + name + "'");
  }
  throw new PyError('AttributeError', "'" + tname(o) + "' object has no attribute '" + name + "'");
}
function setAttr(o, name, value) {
  if (o && o.k === 'instance') { o.attrs[name] = value; return; }
  throw new PyError('AttributeError', "'" + tname(o) + "' object has no attribute '" + name + "'");
}
function invokeFunction(fn, av, kv, ctx) {
  const localEnv = Object.create(null);
  const used = new Set();
  for (let i = 0; i < fn.params.length; i++) { const p = fn.params[i]; if (i < av.length) { localEnv[p.name] = av[i]; used.add(p.name); } }
  if (av.length > fn.params.length) throw new PyError('TypeError', fn.name + '() takes ' + fn.params.length + ' positional argument' + (fn.params.length === 1 ? '' : 's') + ' but ' + av.length + ' ' + (av.length === 1 ? 'was' : 'were') + ' given');
  for (const key in kv) {
    const p = fn.params.find(p => p.name === key);
    if (!p) throw new PyError('TypeError', fn.name + "() got an unexpected keyword argument '" + key + "'");
    if (used.has(key)) throw new PyError('TypeError', fn.name + "() got multiple values for argument '" + key + "'");
    localEnv[key] = kv[key]; used.add(key);
  }
  const missing = [];
  for (const p of fn.params) { if (used.has(p.name)) continue; if (p.hasDefault) localEnv[p.name] = p.defaultValue; else missing.push(p.name); }
  if (missing.length) throw new PyError('TypeError', fn.name + "() missing " + missing.length + " required positional argument" + (missing.length === 1 ? '' : 's') + ": " + missing.map(n => "'" + n + "'").join(' and '));
  const savedEnv = ctx.env, savedGlobalNames = ctx.globalNames, savedCurClass = ctx.curClass;
  ctx.env = localEnv; ctx.globalNames = new Set(); ctx.curClass = fn.ownerClass || null;
  ctx.depth = (ctx.depth || 0) + 1;
  if (ctx.depth > 400) { ctx.depth--; ctx.env = savedEnv; ctx.globalNames = savedGlobalNames; ctx.curClass = savedCurClass; throw new PyError('RecursionError', 'maximum recursion depth exceeded'); }
  try {
    execBlock(fn.body, ctx);
    return null;
  } catch (e) {
    if (e instanceof ReturnSignal) return e.value;
    throw e;
  } finally {
    ctx.env = savedEnv; ctx.globalNames = savedGlobalNames; ctx.curClass = savedCurClass; ctx.depth--;
  }
}
function invokeMethod(fn, selfVal, av, kv, ctx) { return invokeFunction(fn, [selfVal, ...av], kv, ctx); }
function instantiate(cls, av, kv, ctx) {
  const inst = { k: 'instance', cls, attrs: Object.create(null) };
  const init = findMethod(cls, '__init__');
  if (init) invokeMethod(init, inst, av, kv, ctx);
  else if (av.length || Object.keys(kv).length) throw new PyError('TypeError', cls.name + '() takes no arguments');
  return inst;
}
function callValue(callee, av, kv, ctx) {
  if (callee && callee.k === 'function') return invokeFunction(callee, av, kv, ctx);
  if (callee && callee.k === 'class') return instantiate(callee, av, kv, ctx);
  if (callee && callee.k === 'boundmethod') return invokeMethod(callee.fn, callee.self, av, kv, ctx);
  throw new PyError('TypeError', "'" + tname(callee) + "' object is not callable");
}
function callMethodOrFn(o, mname, av, kv, ctx) {
  if (o && o.k === 'instance') {
    const m = findMethod(o.cls, mname);
    if (!m) throw new PyError('AttributeError', "'" + o.cls.name + "' object has no attribute '" + mname + "'");
    return invokeMethod(m, o, av, kv, ctx);
  }
  if (o && o.k === 'list') return listMethod(o, mname, av);
  if (o && o.k === 'dict') return dictMethod(o, mname, av);
  if (o && o.k === 'set') return setMethod(o, mname, av);
  if (Object.keys(kv).length) throw new PyError('TypeError', mname + '() does not take keyword arguments in this runner');
  return callMethod(o, mname, av);
}

function callBuiltin(name, a, kw, c) {
  if (name.startsWith('__')) name = name.slice(2);
  const need = (n) => { if (a.length !== n) throw new PyError('TypeError', name + '() takes exactly ' + n + ' argument' + (n === 1 ? '' : 's') + ' (' + a.length + ' given)'); };
  switch (name) {
    case 'print': {
      for (const k in kw) if (k !== 'sep' && k !== 'end') throw new PyError('TypeError', "print() got an unexpected keyword argument '" + k + "'");
      const sep = (kw.sep === undefined || kw.sep === null) ? ' ' : kw.sep;
      const end = (kw.end === undefined || kw.end === null) ? '\n' : kw.end;
      c.buf += a.map(pyStr).join(sep) + end; return null;
    }
    case 'len': {
      need(1); const x = a[0];
      if (isStr(x)) return I(x.length);
      if (x && (x.k === 'list' || x.k === 'tuple')) return I(x.v.length);
      if (x && x.k === 'dict') return I(x.v.size);
      if (x && x.k === 'set') return I(x.v.size);
      throw new PyError('TypeError', "object of type '" + tname(x) + "' has no len()");
    }
    case 'str': return a.length ? pyStr(a[0]) : '';
    case 'int': {
      if (!a.length) return I(0);
      const x = a[0];
      if (isStr(x)) { if (!/^\s*[+-]?\d+(_\d+)*\s*$/.test(x)) throw new PyError('ValueError', 'invalid literal for int() with base 10: ' + pyRepr(x)); return I(parseInt(x.replace(/_/g, ''), 10)); }
      const n = toNum(x); if (!n) throw new PyError('TypeError', "int() argument must be a string or a real number, not '" + tname(x) + "'");
      return I(Math.trunc(n.v));
    }
    case 'float': {
      if (!a.length) return F(0);
      const x = a[0];
      if (isStr(x)) { if (!/^\s*[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?\s*$/.test(x)) throw new PyError('ValueError', 'could not convert string to float: ' + pyRepr(x)); return F(parseFloat(x)); }
      const n = toNum(x); if (!n) throw new PyError('TypeError', "float() argument must be a string or a real number, not '" + tname(x) + "'");
      return F(n.v);
    }
    case 'sqrt': { need(1); const n = toNum(a[0]); if (!n) throw new PyError('TypeError', 'bad argument'); return F(Math.sqrt(n.v)); }
    case 'pow': { need(2); const x = toNum(a[0]), y = toNum(a[1]); if (!x || !y) throw new PyError('TypeError', 'bad argument'); return F(Math.pow(x.v, y.v)); }
    case 'floor': { need(1); const n = toNum(a[0]); if (!n) throw new PyError('TypeError', 'bad argument'); return F(Math.floor(n.v)); }
    case 'ceil': { need(1); const n = toNum(a[0]); if (!n) throw new PyError('TypeError', 'bad argument'); return F(Math.ceil(n.v)); }
    case 'jround': { need(1); const n = toNum(a[0]); if (!n) throw new PyError('TypeError', 'bad argument'); return I(Math.floor(n.v + 0.5)); }
    case 'format': { if (!a.length || !isStr(a[0])) throw new PyError('TypeError', 'format needs a string'); return fmtJ(a[0], a.slice(1)); }
    case 'type': need(1); return { k: 'type', name: tname(a[0]) };
    case 'abs': { need(1); const n = toNum(a[0]); if (!n) throw new PyError('TypeError', "bad operand type for abs(): '" + tname(a[0]) + "'"); return { k: n.k, v: Math.abs(n.v) }; }
    case 'round': {
      if (a.length < 1 || a.length > 2) throw new PyError('TypeError', 'round() takes 1 or 2 arguments');
      const n = toNum(a[0]); if (!n) throw new PyError('TypeError', "type " + tname(a[0]) + " doesn't define __round__ method");
      if (a.length === 1) return I(roundHalfEven(n.v));
      const d = toNum(a[1]); if (!d || d.k !== 'int') throw new PyError('TypeError', "'" + tname(a[1]) + "' object cannot be interpreted as an integer");
      const f = Math.pow(10, d.v); const r = roundHalfEven(n.v * f) / f;
      return n.k === 'float' ? F(r) : I(n.v);
    }
    case 'max': case 'min': {
      let items = a;
      if (a.length === 1 && a[0] && (a[0].k === 'list' || a[0].k === 'tuple' || a[0].k === 'set')) items = pyIterate(a[0]);
      if (items.length < 1) throw new PyError('ValueError', name + '() arg is an empty sequence');
      let best = items[0];
      for (let i = 1; i < items.length; i++) { const better = cmp(name === 'max' ? '>' : '<', items[i], best); if (better) best = items[i]; }
      return best;
    }
    case 'range': {
      if (a.length < 1 || a.length > 3) throw new PyError('TypeError', 'range expected at most 3 arguments, got ' + a.length);
      const nums = a.map(toNum); if (nums.some(n => !n || n.k !== 'int')) throw new PyError('TypeError', "'" + tname(a.find((x, i) => !nums[i] || nums[i].k !== 'int')) + "' object cannot be interpreted as an integer");
      let start = 0, stop, step = 1;
      if (a.length === 1) stop = nums[0].v; else { start = nums[0].v; stop = nums[1].v; if (a.length === 3) step = nums[2].v; }
      if (step === 0) throw new PyError('ValueError', 'range() arg 3 must not be zero');
      return { k: 'range', start, stop, step };
    }
    case 'sum': { const items = pyIterate(a[0]); let total = a.length > 1 ? a[1] : I(0); for (const it of items) total = binop('+', total, it); return total; }
    case 'sorted': { const items = pyIterate(a[0]).slice(); const rev = kw.reverse ? truthy(kw.reverse) : false; items.sort((x, y) => cmp('<', x, y) ? -1 : cmp('>', x, y) ? 1 : 0); if (rev) items.reverse(); return L(items); }
    case 'enumerate': { const items = pyIterate(a[0]); const start = a.length > 1 ? toNum(a[1]).v : 0; return L(items.map((it, i) => T([I(i + start), it]))); }
    case 'zip': { const lists = a.map(pyIterate); const len = Math.min(...lists.map(l => l.length)); const out = []; for (let i = 0; i < len; i++) out.push(T(lists.map(l => l[i]))); return L(out); }
    case 'list': return L(a.length ? pyIterate(a[0]) : []);
    case 'tuple': return T(a.length ? pyIterate(a[0]) : []);
    case 'dict': { const d = D(); if (a.length) for (const it of pyIterate(a[0])) { if (!it || it.k !== 'tuple' || it.v.length !== 2) throw new PyError('TypeError', 'cannot convert dictionary update sequence element to a sequence'); dictSet(d, it.v[0], it.v[1]); } return d; }
    case 'set': { const s = S(); if (a.length) for (const it of pyIterate(a[0])) setAdd(s, it); return s; }
    case 'reversed': return L(pyIterate(a[0]).slice().reverse());
  }
  throw new PyError('NameError', "name '" + name + "' is not defined");
}

class Parser {
  constructor(toks) { this.t = toks; this.p = 0; }
  peek() { return this.t[this.p]; }
  isOp(v) { const k = this.t[this.p]; return !!k && k.type === 'op' && k.value === v; }
  isName(v) { const k = this.t[this.p]; return !!k && k.type === 'name' && k.value === v; }
  syntax(msg) { return new PyError('SyntaxError', msg || 'invalid syntax'); }
  end() {
    const k = this.peek(); if (!k) return;
    if (k.type === 'name' && ['is', 'if', 'else', 'for', 'lambda'].includes(k.value)) throw new Unsupported();
    throw this.syntax();
  }
  expectClose() {
    const k = this.peek();
    if (!k) throw this.syntax("'(' was never closed");
    if (k.type === 'str' || k.type === 'fstr' || k.type === 'num' || (k.type === 'name' && !PYKW.has(k.value))) throw this.syntax('invalid syntax. Perhaps you forgot a comma?');
    throw this.syntax();
  }
  parseExpr() { return this.parseOr(); }
  parseOr() {
    let l = this.parseAnd();
    while (this.isName('or')) { this.p++; const r = this.parseAnd(), a = l; l = c => { const x = a(c); return truthy(x) ? x : r(c); }; }
    return l;
  }
  parseAnd() {
    let l = this.parseNot();
    while (this.isName('and')) { this.p++; const r = this.parseNot(), a = l; l = c => { const x = a(c); return truthy(x) ? r(c) : x; }; }
    return l;
  }
  parseNot() {
    if (this.isName('not')) {
      this.p++;
      if (this.isName('in')) throw this.syntax();
      const e = this.parseNot(); return c => !truthy(e(c));
    }
    return this.parseCmp();
  }
  parseCmp() {
    const l = this.parseArith();
    const k = this.peek();
    if (k && k.type === 'op' && ['==', '!=', '<', '>', '<=', '>='].includes(k.value)) {
      this.p++; const r = this.parseArith(), op = k.value;
      return c => cmp(op, l(c), r(c));
    }
    if (k && k.type === 'name' && k.value === 'in') { this.p++; const r = this.parseArith(); return c => pyIn(l(c), r(c)); }
    if (k && k.type === 'name' && k.value === 'not' && this.t[this.p + 1] && this.t[this.p + 1].type === 'name' && this.t[this.p + 1].value === 'in') { this.p += 2; const r = this.parseArith(); return c => !pyIn(l(c), r(c)); }
    return l;
  }
  parseArith() {
    let l = this.parseTerm();
    while (this.peek() && this.peek().type === 'op' && (this.peek().value === '+' || this.peek().value === '-')) {
      const op = this.t[this.p++].value, r = this.parseTerm(), a = l; l = c => binop(op, a(c), r(c));
    }
    return l;
  }
  parseTerm() {
    let l = this.parseUnary();
    while (this.peek() && this.peek().type === 'op' && ['*', '/', '//', '%'].includes(this.peek().value)) {
      const op = this.t[this.p++].value, r = this.parseUnary(), a = l; l = c => binop(op, a(c), r(c));
    }
    return l;
  }
  parseUnary() {
    if (this.isOp('-') || this.isOp('+')) {
      const sign = this.t[this.p++].value === '-' ? -1 : 1; const e = this.parseUnary();
      return c => { const v = e(c), x = toNum(v); if (!x) throw new PyError('TypeError', "bad operand type for unary " + (sign < 0 ? '-' : '+') + ": '" + tname(v) + "'"); return { k: x.k, v: sign * x.v }; };
    }
    return this.parsePower();
  }
  parsePower() {
    const base = this.parsePostfix();
    if (this.isOp('**')) { this.p++; const ex = this.parseUnary(); return c => binop('**', base(c), ex(c)); }
    return base;
  }
  parsePostfix() {
    let e = this.parseAtom();
    for (;;) {
      if (this.isOp('.')) {
        this.p++;
        const k = this.peek();
        if (!k || k.type !== 'name') throw this.syntax();
        this.p++;
        if (this.isOp('(')) {
          this.p++;
          const args = this.parseArgs(), base = e, mname = k.value;
          e = c => { const o = base(c); const av = args.pos.map(f => f(c)); const kv = {}; for (const key in args.kw) kv[key] = args.kw[key](c); return callMethodOrFn(o, mname, av, kv, c); };
        } else {
          const base = e, aname = k.value;
          e = c => getAttr(base(c), aname);
        }
        continue;
      }
      if (this.isOp('[')) {
        this.p++;
        if (this.isOp(':')) {
          this.p++;
          let hi = null;
          if (!this.isOp(']')) hi = this.parseExpr();
          if (!this.isOp(']')) throw this.syntax(); this.p++;
          const base = e, hiF = hi; e = c => pySlice(base(c), null, hiF ? hiF(c) : null);
          continue;
        }
        const first = this.parseExpr();
        if (this.isOp(':')) {
          this.p++;
          let hi = null;
          if (!this.isOp(']')) hi = this.parseExpr();
          if (!this.isOp(']')) throw this.syntax(); this.p++;
          const base = e, hiF = hi; e = c => pySlice(base(c), first(c), hiF ? hiF(c) : null);
          continue;
        }
        if (!this.isOp(']')) throw this.syntax(); this.p++;
        const base = e; e = c => pyIndex(base(c), first(c));
        continue;
      }
      break;
    }
    return e;
  }
  parseArgs() {
    const pos = [], kw = {};
    for (;;) {
      if (this.isOp(')')) { this.p++; break; }
      if (!this.peek()) throw this.syntax("'(' was never closed");
      const a = this.peek(), b = this.t[this.p + 1];
      if (a.type === 'name' && b && b.type === 'op' && b.value === '=') { this.p += 2; kw[a.value] = this.parseExpr(); }
      else pos.push(this.parseExpr());
      if (this.isOp(',')) { this.p++; continue; }
      if (this.isOp(')')) { this.p++; break; }
      this.expectClose();
    }
    return { pos, kw };
  }
  parseAtom() {
    const k = this.t[this.p];
    if (!k) throw this.syntax();
    if (k.type === 'num') { this.p++; const v = k.isFloat ? F(k.value) : I(k.value); return () => v; }
    if (k.type === 'str') {
      let s = unesc(k.value); this.p++;
      while (this.peek() && this.peek().type === 'str') { s += unesc(this.peek().value); this.p++; }
      return () => s;
    }
    if (k.type === 'fstr') { this.p++; return compileFString(k.value); }
    if (k.type === 'op' && k.value === '(') {
      this.p++;
      if (this.isOp(')')) { this.p++; return () => T([]); }
      const first = this.parseExpr();
      if (this.isOp(',')) {
        const items = [first];
        while (this.isOp(',')) { this.p++; if (this.isOp(')')) break; items.push(this.parseExpr()); }
        if (!this.isOp(')')) this.expectClose();
        this.p++; return c => T(items.map(f => f(c)));
      }
      if (!this.isOp(')')) this.expectClose();
      this.p++; return first;
    }
    if (k.type === 'op' && k.value === '[') {
      this.p++;
      const items = [];
      if (!this.isOp(']')) {
        items.push(this.parseExpr());
        if (this.isName('for')) throw new Unsupported();
        while (this.isOp(',')) { this.p++; if (this.isOp(']')) break; items.push(this.parseExpr()); }
      }
      if (!this.isOp(']')) this.expectClose();
      this.p++; return c => L(items.map(f => f(c)));
    }
    if (k.type === 'op' && k.value === '{') {
      this.p++;
      const pairs = [];
      if (!this.isOp('}')) {
        for (;;) {
          const kf = this.parseExpr();
          if (!this.isOp(':')) throw this.syntax();
          this.p++;
          const vf = this.parseExpr();
          pairs.push([kf, vf]);
          if (this.isOp(',')) { this.p++; if (this.isOp('}')) break; continue; }
          break;
        }
      }
      if (!this.isOp('}')) throw this.syntax();
      this.p++;
      return c => { const d = D(); for (const [kf, vf] of pairs) dictSet(d, kf(c), vf(c)); return d; };
    }
    if (k.type === 'name') {
      const nm = k.value; this.p++;
      if (nm === 'True') return () => true;
      if (nm === 'False') return () => false;
      if (nm === 'None') return () => null;
      if (nm === 'self' || !PYKW.has(nm)) {
        if (this.isOp('(')) {
          this.p++;
          const args = this.parseArgs();
          return c => {
            const av = args.pos.map(f => f(c)); const kv = {}; for (const key in args.kw) kv[key] = args.kw[key](c);
            let callee;
            if (c.env && nm in c.env) callee = c.env[nm];
            else if (c.globals && nm in c.globals) callee = c.globals[nm];
            if (callee !== undefined) return callValue(callee, av, kv, c);
            if (!BUILTINS.has(nm)) throw new PyError('NameError', "name '" + nm + "' is not defined");
            return callBuiltin(nm, av, kv, c);
          };
        }
        return c => {
          if (c.env && nm in c.env) return c.env[nm];
          if (c.globals && nm in c.globals) return c.globals[nm];
          throw new PyError('NameError', "name '" + nm + "' is not defined");
        };
      }
      if (['in', 'is', 'if', 'else', 'for', 'lambda', 'yield', 'await'].includes(nm)) throw new Unsupported();
      throw this.syntax();
    }
    throw this.syntax();
  }
}

function assignName(ctx, name, value) {
  if (ctx.globalNames && ctx.globalNames.has(name)) { ctx.globals[name] = value; return; }
  ctx.env[name] = value;
}
function lookupName(ctx, name) {
  if (ctx.env && name in ctx.env) return ctx.env[name];
  if (ctx.globals && name in ctx.globals) return ctx.globals[name];
  throw new PyError('NameError', "name '" + name + "' is not defined");
}
function execBlock(body, ctx) {
  for (const s of body) {
    ctx.steps = (ctx.steps || 0) + 1;
    if (ctx.steps > PLIMIT) throw new PyError('RuntimeError', 'Execution stopped: too many steps. Is there an infinite loop?');
    ctx.curLine = s.ln;
    s(ctx);
  }
}
function withLine(ln, fn) { const w = (ctx) => fn(ctx); w.ln = ln; return w; }

function lineMeta(raw) {
  if (/^\t/.test(raw)) throw new PyError('TabError', 'inconsistent use of tabs and spaces in indentation');
  const m = /^ */.exec(raw)[0];
  const trimmed = raw.trim();
  return { indent: m.length, text: raw.slice(m.length).replace(/#.*$/, '').trimEnd(), blank: trimmed === '' || trimmed.startsWith('#') };
}
function expectIndentedBlock(lines, idx, parentIndent, n, kw) {
  let scan = idx;
  while (scan < n && lineMeta(lines[scan]).blank) scan++;
  if (scan >= n || lineMeta(lines[scan]).indent <= parentIndent) throw new PyError('IndentationError', 'expected an indented block after ' + kw + " statement on line " + idx);
  const childIndent = lineMeta(lines[scan]).indent;
  return parseBlock(lines, idx, childIndent, n);
}
function parseBlock(lines, idx, indent, n) {
  const body = [];
  while (idx < n) {
    const meta = lineMeta(lines[idx]);
    if (meta.blank) { idx++; continue; }
    if (meta.indent < indent) break;
    if (meta.indent > indent) throw new PyError('IndentationError', 'unexpected indent', idx + 1);
    let result;
    try { result = parseOneStatement(lines, idx, meta, n); }
    catch (e) { if (e instanceof PyError && e.line == null) e.line = idx + 1; throw e; }
    body.push(result.stmt);
    idx = result.next;
  }
  return { body, next: idx };
}
function parseParams(src) {
  const toks = tokenize(src);
  const P = new Parser(toks);
  const params = []; let seenDefault = false;
  while (P.peek()) {
    const k = P.peek();
    if (k.type !== 'name' || PYKW.has(k.value)) throw P.syntax();
    const pname = k.value; P.p++;
    let hasDefault = false, defExpr = null;
    if (P.isOp('=')) { P.p++; defExpr = P.parseExpr(); hasDefault = true; seenDefault = true; }
    else if (seenDefault) throw new PyError('SyntaxError', 'non-default argument follows default argument');
    params.push({ name: pname, hasDefault, defExpr });
    if (P.isOp(',')) { P.p++; continue; }
    break;
  }
  P.end();
  return params;
}
function parseIfChain(lines, idx, indent, n) {
  const first = lineMeta(lines[idx]);
  let m = /^if\s+(.+):$/.exec(first.text);
  if (!m) throw new PyError('SyntaxError', 'invalid syntax');
  const firstBlk = expectIndentedBlock(lines, idx + 1, indent, n, "'if'");
  const branches = [{ cond: compileExprString(m[1]), body: firstBlk.body }];
  let cur = firstBlk.next;
  let elseBody = null;
  for (;;) {
    let scan = cur;
    while (scan < n && lineMeta(lines[scan]).blank) scan++;
    if (scan >= n) break;
    const meta = lineMeta(lines[scan]);
    if (meta.indent !== indent) break;
    const mElif = /^elif\s+(.+):$/.exec(meta.text);
    if (mElif) {
      const blk = expectIndentedBlock(lines, scan + 1, indent, n, "'elif'");
      branches.push({ cond: compileExprString(mElif[1]), body: blk.body });
      cur = blk.next; continue;
    }
    if (/^else\s*:$/.test(meta.text)) {
      const blk = expectIndentedBlock(lines, scan + 1, indent, n, "'else'");
      elseBody = blk.body; cur = blk.next;
    }
    break;
  }
  const stmt = withLine(idx + 1, (ctx) => {
    for (const br of branches) { if (truthy(br.cond(ctx))) { execBlock(br.body, ctx); return; } }
    if (elseBody) execBlock(elseBody, ctx);
  });
  return { stmt, next: cur };
}
function parseMultiAssign(toks) {
  let i = 0; const names = [];
  while (toks[i] && toks[i].type === 'name' && !PYKW.has(toks[i].value)) {
    names.push(toks[i].value);
    if (toks[i + 1] && toks[i + 1].type === 'op' && toks[i + 1].value === ',') { i += 2; continue; }
    if (toks[i + 1] && toks[i + 1].type === 'op' && toks[i + 1].value === '=' && names.length >= 2) { i += 2; return { names, rhsToks: toks.slice(i) }; }
    return null;
  }
  return null;
}
function parseExprListThunk(rhsToks) {
  const P = new Parser(rhsToks);
  const exprs = [P.parseExpr()];
  while (P.isOp(',')) { P.p++; if (!P.peek()) break; exprs.push(P.parseExpr()); }
  P.end();
  if (exprs.length === 1) return exprs[0];
  return (ctx) => T(exprs.map(f => f(ctx)));
}
function bindTargets(targets, item, ctx) {
  if (targets.length === 1) { assignName(ctx, targets[0], item); return; }
  const vals = item && (item.k === 'list' || item.k === 'tuple') ? item.v : null;
  if (!vals) throw new PyError('TypeError', "cannot unpack non-iterable " + tname(item) + " object");
  if (vals.length < targets.length) throw new PyError('ValueError', 'not enough values to unpack (expected ' + targets.length + ', got ' + vals.length + ')');
  if (vals.length > targets.length) throw new PyError('ValueError', 'too many values to unpack (expected ' + targets.length + ')');
  targets.forEach((t, i) => assignName(ctx, t, vals[i]));
}
function parseFor(lines, idx, indent, n) {
  const meta = lineMeta(lines[idx]);
  const m = /^for\s+(.+?)\s+in\s+(.+):$/.exec(meta.text);
  if (!m) throw new PyError('SyntaxError', 'invalid syntax');
  const targets = m[1].split(',').map(s => s.trim());
  for (const t of targets) if (!/^[A-Za-z_]\w*$/.test(t) || PYKW.has(t)) throw new Unsupported();
  const iterThunk = compileExprString(m[2]);
  const { body, next } = expectIndentedBlock(lines, idx + 1, indent, n, "'for'");
  const stmt = withLine(idx + 1, (ctx) => {
    const items = pyIterate(iterThunk(ctx));
    for (const item of items) {
      bindTargets(targets, item, ctx);
      try { execBlock(body, ctx); }
      catch (e) { if (e instanceof BreakSignal) break; if (e instanceof ContinueSignal) continue; throw e; }
    }
  });
  return { stmt, next };
}
function parseWhile(lines, idx, indent, n) {
  const meta = lineMeta(lines[idx]);
  const m = /^while\s+(.+):$/.exec(meta.text);
  if (!m) throw new PyError('SyntaxError', 'invalid syntax');
  const condThunk = compileExprString(m[1]);
  const { body, next } = expectIndentedBlock(lines, idx + 1, indent, n, "'while'");
  const stmt = withLine(idx + 1, (ctx) => {
    while (truthy(condThunk(ctx))) {
      try { execBlock(body, ctx); }
      catch (e) { if (e instanceof BreakSignal) break; if (e instanceof ContinueSignal) continue; throw e; }
    }
  });
  return { stmt, next };
}
function parseDef(lines, idx, indent, n) {
  const meta = lineMeta(lines[idx]);
  const m = /^def\s+([A-Za-z_]\w*)\s*\(([^()]*)\)\s*:$/.exec(meta.text);
  if (!m) throw new Unsupported();
  const name = m[1];
  const paramSpecs = parseParams(m[2]);
  const { body, next } = expectIndentedBlock(lines, idx + 1, indent, n, "'def'");
  const stmt = withLine(idx + 1, (ctx) => {
    const params = paramSpecs.map(p => ({ name: p.name, hasDefault: p.hasDefault, defaultValue: p.hasDefault ? p.defExpr(ctx) : undefined }));
    const fn = { k: 'function', name, params, body, ownerClass: ctx.curClass || null };
    assignName(ctx, name, fn);
  });
  return { stmt, next };
}
function parseClass(lines, idx, indent, n) {
  const meta = lineMeta(lines[idx]);
  const m = /^class\s+([A-Za-z_]\w*)\s*(?:\(\s*([A-Za-z_]\w*)\s*\))?\s*:$/.exec(meta.text);
  if (!m) throw new Unsupported();
  const name = m[1], baseName = m[2] || null;
  const { body, next } = expectIndentedBlock(lines, idx + 1, indent, n, "'class'");
  const stmt = withLine(idx + 1, (ctx) => {
    let base = null;
    if (baseName) { base = lookupName(ctx, baseName); if (!base || base.k !== 'class') throw new PyError('TypeError', 'base class must be a class'); }
    const cls = { k: 'class', name, methods: new Map(), base };
    const classEnv = Object.create(null);
    const savedEnv = ctx.env, savedGlobalNames = ctx.globalNames, savedCurClass = ctx.curClass;
    ctx.env = classEnv; ctx.globalNames = new Set(); ctx.curClass = cls;
    try { execBlock(body, ctx); } finally { ctx.env = savedEnv; ctx.globalNames = savedGlobalNames; ctx.curClass = savedCurClass; }
    for (const k in classEnv) if (classEnv[k] && classEnv[k].k === 'function') cls.methods.set(k, classEnv[k]);
    assignName(ctx, name, cls);
  });
  return { stmt, next };
}
function tryParseAssignTarget(toks) {
  if (!toks.length || toks[0].type !== 'name' || PYKW.has(toks[0].value)) return null;
  const baseName = toks[0].value;
  let i = 1; const ops = [];
  for (;;) {
    if (toks[i] && toks[i].type === 'op' && toks[i].value === '.') {
      if (!(toks[i + 1] && toks[i + 1].type === 'name')) return null;
      ops.push({ type: 'attr', name: toks[i + 1].value }); i += 2; continue;
    }
    if (toks[i] && toks[i].type === 'op' && toks[i].value === '[') {
      let depth = 1, j = i + 1;
      while (j < toks.length && depth > 0) { if (toks[j].type === 'op' && toks[j].value === '[') depth++; else if (toks[j].type === 'op' && toks[j].value === ']') depth--; if (depth > 0) j++; }
      if (depth !== 0) return null;
      ops.push({ type: 'index', toks: toks.slice(i + 1, j) }); i = j + 1; continue;
    }
    break;
  }
  if (!(toks[i] && toks[i].type === 'op' && toks[i].value === '=')) return null;
  const rhsToks = toks.slice(i + 1);
  if (!rhsToks.length) return null;
  return { baseName, ops, rhsToks };
}
function parseSimpleLine(header) {
  if (header === 'pass') return () => {};
  if (header === 'break') return () => { throw new BreakSignal(); };
  if (header === 'continue') return () => { throw new ContinueSignal(); };
  if (/^return\b/.test(header)) {
    const rest = header.slice(6).trim();
    if (rest === '') return () => { throw new ReturnSignal(null); };
    const thunk = compileExprString(rest);
    return (ctx) => { throw new ReturnSignal(thunk(ctx)); };
  }
  if (/^global\s+/.test(header)) {
    const names = header.slice(6).split(',').map(s => s.trim());
    return (ctx) => { if (ctx.globalNames) for (const nm of names) ctx.globalNames.add(nm); };
  }
  if (UNSUP_SIMPLE.test(header)) throw new Unsupported();
  const mSuperInit = /^super\s*\(\s*\)\s*\.\s*__init__\s*\((.*)\)$/.exec(header);
  if (mSuperInit) {
    const argToks = tokenize(mSuperInit[1]).concat([{ type: 'op', value: ')' }]);
    const args = new Parser(argToks).parseArgs();
    return (ctx) => {
      const self = lookupName(ctx, 'self');
      const base = ctx.curClass && ctx.curClass.base;
      if (!base) throw new PyError('TypeError', "super() called outside of a class with a base");
      const init = findMethod(base, '__init__');
      if (!init) return;
      const av = args.pos.map(f => f(ctx)); const kv = {}; for (const key in args.kw) kv[key] = args.kw[key](ctx);
      invokeMethod(init, self, av, kv, ctx);
    };
  }
  const toks = tokenize(header);
  if (!toks.length) return () => {};
  if (toks[0].type === 'name' && PYKW.has(toks[0].value) && !['self'].includes(toks[0].value)) {
    if (toks[0].value === 'True' || toks[0].value === 'False' || toks[0].value === 'None' || toks[0].value === 'not') { /* allowed expression starts */ }
    else throw new Unsupported();
  }
  const multi = parseMultiAssign(toks);
  if (multi) {
    const rhsThunk = parseExprListThunk(multi.rhsToks);
    const names = multi.names;
    return (ctx) => { bindTargets(names, rhsThunk(ctx), ctx); };
  }
  if (toks[0].type === 'name' && toks[1] && toks[1].type === 'op' && (toks[1].value === '=' || AUG.includes(toks[1].value)) && !PYKW.has(toks[0].value)) {
    const name = toks[0].value;
    const P = new Parser(toks); P.p = 2; const e = P.parseExpr(); P.end();
    if (toks[1].value === '=') return (ctx) => { assignName(ctx, name, e(ctx)); };
    const op = toks[1].value[0];
    return (ctx) => { const cur = lookupName(ctx, name); assignName(ctx, name, binop(op, cur, e(ctx))); };
  }
  const assignTry = tryParseAssignTarget(toks);
  if (assignTry) {
    const rhsP = new Parser(assignTry.rhsToks); const rhsThunk = rhsP.parseExpr(); rhsP.end();
    const opThunks = assignTry.ops.map(op => op.type === 'attr' ? op : { type: 'index', expr: (() => { const p = new Parser(op.toks); const e = p.parseExpr(); p.end(); return e; })() });
    const baseName = assignTry.baseName;
    return (ctx) => {
      const value = rhsThunk(ctx);
      if (opThunks.length === 0) { assignName(ctx, baseName, value); return; }
      let obj = lookupName(ctx, baseName);
      for (let k = 0; k < opThunks.length - 1; k++) { const op = opThunks[k]; obj = op.type === 'attr' ? getAttr(obj, op.name) : pyIndex(obj, op.expr(ctx)); }
      const last = opThunks[opThunks.length - 1];
      if (last.type === 'attr') setAttr(obj, last.name, value); else pySetIndex(obj, last.expr(ctx), value);
    };
  }
  const P = new Parser(toks);
  const e = P.parseExpr();
  if (P.isOp('=')) throw new PyError('SyntaxError', "cannot assign to expression here. Maybe you meant '==' instead of '='?");
  P.end();
  return (ctx) => { e(ctx); };
}
function parseOneStatement(lines, idx, meta, n) {
  const header = meta.text;
  if (/^if\s/.test(header)) return parseIfChain(lines, idx, meta.indent, n);
  if (/^for\s/.test(header)) return parseFor(lines, idx, meta.indent, n);
  if (/^while\s/.test(header)) return parseWhile(lines, idx, meta.indent, n);
  if (/^def\s/.test(header)) return parseDef(lines, idx, meta.indent, n);
  if (/^class\s/.test(header)) return parseClass(lines, idx, meta.indent, n);
  if (/^(elif|else)\b/.test(header)) throw new PyError('IndentationError', 'unexpected indent');
  const fn = parseSimpleLine(header);
  return { stmt: withLine(idx + 1, fn), next: idx + 1 };
}

function bracketDelta(line) {
  let depth = 0, q = null;
  for (let k = 0; k < line.length; k++) {
    const c = line[k];
    if (q) { if (c === '\\') { k++; continue; } if (c === q) q = null; continue; }
    if (c === '#') break;
    if (c === '"' || c === "'") { q = c; continue; }
    if ('([{'.includes(c)) depth++;
    else if (')]}'.includes(c)) depth--;
  }
  return depth;
}
function stripLineComment(line) {
  let q = null;
  for (let k = 0; k < line.length; k++) {
    const c = line[k];
    if (q) { if (c === '\\') { k++; continue; } if (c === q) q = null; continue; }
    if (c === '#') return line.slice(0, k);
    if (c === '"' || c === "'") { q = c; continue; }
  }
  return line;
}
function joinContinuations(rawLines) {
  const out = rawLines.slice();
  let i = 0;
  while (i < out.length) {
    let d = bracketDelta(out[i]);
    if (d > 0) {
      let acc = stripLineComment(out[i]).trimEnd();
      let j = i + 1;
      while (j < out.length && d > 0) {
        acc += ' ' + stripLineComment(out[j]).trim();
        d += bracketDelta(out[j]);
        out[j] = '';
        j++;
      }
      out[i] = acc;
      i = j;
    } else i++;
  }
  return out;
}

function runPython(code) {
  const rawLines = String(code).replace(/\r\n?/g, '\n').split('\n');
  const src = n => (rawLines[n - 1] || '').trim();
  const lines = joinContinuations(rawLines);
  let body;
  try {
    const { body: b } = parseBlock(lines, 0, 0, lines.length);
    body = b;
  } catch (e) {
    if (e instanceof Unsupported) return { out: '', error: null, unsupported: true };
    if (e instanceof PyError) return { out: '', error: '  File "main.py", line ' + (e.line || '?') + '\n' + (e.line ? '    ' + src(e.line) + '\n' : '') + e.pyType + ': ' + e.message };
    return { out: '', error: 'InternalError: the prototype runner could not read this code.' };
  }
  const ctx = { env: Object.create(null), globals: null, buf: '', globalNames: null, curClass: null, steps: 0, depth: 0 };
  ctx.globals = ctx.env;
  try { execBlock(body, ctx); return { out: ctx.buf, error: null }; }
  catch (e) {
    const cur = ctx.curLine || 1;
    if (e instanceof PyError) return { out: ctx.buf, error: 'Traceback (most recent call last):\n  File "main.py", line ' + cur + ', in <module>\n    ' + src(cur) + '\n' + e.pyType + ': ' + e.message };
    return { out: ctx.buf, error: 'InternalError: the prototype runner hit something unexpected.' };
  }
}


/* ---------- Mini C / C++ runner (prototype only) ---------- */
class CErr extends Error { constructor(m, note) { super(m); this.note = note; } }
const UNSUPFN = new Set(['sqrt','pow','abs','fabs','rand','srand','time','strlen','strcpy','strcmp','strcat','malloc','free','sizeof','scanf','getchar','floor','ceil','toupper','tolower','atoi','exit','system','fflush','getline']);

function mapOut(s, fn) {
  let out = '', buf = '', i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === '"' || c === "'") {
      out += fn(buf); buf = '';
      let j = i + 1;
      while (j < s.length && s[j] !== c && s[j] !== '\n') { if (s[j] === '\\') j++; j++; }
      out += s.slice(i, j + 1); i = j + 1;
    } else { buf += c; i++; }
  }
  return out + fn(buf);
}
function blankStrings(s) {
  let out = '', i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < s.length && s[j] !== c && s[j] !== '\n') { if (s[j] === '\\') j++; j++; }
      out += c + s.slice(i + 1, j).replace(/[^\n]/g, ' ') + (s[j] === c ? c : (s[j] || ''));
      i = j + 1;
    } else { out += c; i++; }
  }
  return out;
}
function stripCComments(src) {
  let out = '', i = 0; const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n && src[j] !== c && src[j] !== '\n') { if (src[j] === '\\') j++; j++; }
      out += src.slice(i, j + 1); i = j + 1; continue;
    }
    if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*') {
      let j = src.indexOf('*/', i + 2); if (j < 0) j = n - 2;
      out += src.slice(i, j + 2).replace(/[^\n]/g, ' '); i = j + 2; continue;
    }
    out += c; i++;
  }
  return out;
}
function cfix(s) {
  return mapOut(s, seg => seg.replace(/std::/g, '').replace(/&&/g, ' and ').replace(/\|\|/g, ' or ').replace(/!(?!=)/g, ' not ')
    .replace(/\btrue\b/g, 'True').replace(/\bfalse\b/g, 'False').replace(/(\b\d+(?:\.\d*)?)[fFlLuU]+\b/g, '$1'));
}
function splitTop(s, sep) {
  const out = []; let depth = 0, cur = '', i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === '"' || c === "'") {
      let j = i + 1; while (j < s.length && s[j] !== c) { if (s[j] === '\\') j++; j++; }
      cur += s.slice(i, j + 1); i = j + 1; continue;
    }
    if (c === '(') depth++; if (c === ')') depth--;
    if (c === sep && depth === 0) { out.push(cur); cur = ''; } else cur += c;
    i++;
  }
  out.push(cur); return out;
}
function fmtG(v) {
  if (!Number.isFinite(v)) return Number.isNaN(v) ? 'nan' : (v > 0 ? 'inf' : '-inf');
  if (v === 0) return '0';
  const e = Math.floor(Math.log10(Math.abs(Number(v.toPrecision(6)))));
  if (e < -4 || e >= 6) {
    let m = (v / Math.pow(10, e)).toPrecision(6); if (m.includes('.')) m = m.replace(/0+$/, '').replace(/\.$/, '');
    return m + 'e' + (e < 0 ? '-' : '+') + String(Math.abs(e)).padStart(2, '0');
  }
  return String(Number(v.toPrecision(6)));
}
function fmtFixed(v, p) { if (!Number.isFinite(v)) return Number.isNaN(v) ? 'nan' : (v > 0 ? 'inf' : '-inf'); return v.toFixed(p); }
function coutStr(v) {
  if (v && v.k === 'endl') return '\n';
  if (typeof v === 'boolean') return v ? '1' : '0';
  if (v === null) return '';
  if (isStr(v)) return v;
  if (v.k === 'int') return String(v.v);
  if (v.k === 'float') return fmtG(v.v);
  return pyStr(v);
}
function fmtC(fmt, args) {
  let ai = 0;
  return fmt.replace(/%([-0+ ]*)(\d+)?(?:\.(\d+))?(?:ll|l|h)?([diufcsx%])/g, (m, fl, w, pr, cv) => {
    if (cv === '%') return '%';
    const a = args[ai++], n = toNum(a); let out = '';
    switch (cv) {
      case 'd': case 'i': out = String(n ? Math.trunc(n.v) : (isStr(a) ? a.charCodeAt(0) : 0)); if (fl.includes('+') && n && n.v >= 0) out = '+' + out; break;
      case 'u': out = String(n ? Math.trunc(Math.abs(n.v)) : 0); break;
      case 'x': out = (n ? (Math.trunc(n.v) >>> 0) : 0).toString(16); break;
      case 'f': out = fmtFixed(n ? n.v : 0, pr === undefined ? 6 : +pr); if (fl.includes('+') && n && n.v >= 0) out = '+' + out; break;
      case 'c': out = isStr(a) ? (a[0] || '') : (n ? String.fromCharCode(n.v) : ''); break;
      case 's': out = isStr(a) ? a : (a === undefined ? '(null)' : pyStr(a)); if (pr !== undefined) out = out.slice(0, +pr); break;
    }
    if (w && out.length < +w) {
      const pad = +w - out.length;
      if (fl.includes('-')) out = out + ' '.repeat(pad);
      else if (fl.includes('0') && 'difux'.includes(cv)) { const neg = /^[+-]/.test(out); out = (neg ? out[0] : '') + '0'.repeat(pad) + (neg ? out.slice(1) : out); }
      else out = ' '.repeat(pad) + out;
    }
    return out;
  });
}
function coerce(type, v) {
  switch (type) {
    case 'int': { const n = toNum(v); if (n) return I(Math.trunc(n.v)); if (isStr(v) && v.length === 1) return I(v.charCodeAt(0)); throw new CErr("incompatible types when assigning to type 'int'"); }
    case 'double': { const n = toNum(v); if (n) return F(n.v); throw new CErr("incompatible types when assigning to type 'double'"); }
    case 'char': { if (isStr(v)) return v[0] || ''; const n = toNum(v); if (n) return String.fromCharCode(n.v); throw new CErr("incompatible types when assigning to type 'char'"); }
    case 'bool': return truthy(v);
    default: if (isStr(v)) return v; throw new CErr("incompatible types: expected a string");
  }
}
const defaultVal = t => t === 'int' ? I(0) : t === 'double' ? F(0) : t === 'bool' ? false : '';
const tokDesc = k => k.type === 'str' ? '"' + k.value + '"' : k.type === 'num' ? String(k.value) : k.value;
const semiMsg = k => "expected ';' before '" + tokDesc(k) + "'" + (k.type === 'name' ? '' : ' token');

function checkNames(toks, info) {
  for (let i = 0; i < toks.length; i++) {
    const k = toks[i]; if (k.type !== 'name') continue;
    const w = k.value;
    if (i > 0 && toks[i - 1].type === 'op' && toks[i - 1].value === '.') continue;
    if (['True', 'False', 'None', 'and', 'or', 'not', 'printf', 'puts'].includes(w)) continue;
    if (info.lang === 'cpp' && (w === 'cout' || w === 'endl')) continue;
    if (UNSUPFN.has(w)) throw new Unsupported();
    const isCall = toks[i + 1] && toks[i + 1].type === 'op' && toks[i + 1].value === '(';
    if (info.declared.has(w) && !isCall) continue;
    if (isCall && !info.declared.has(w)) throw new CErr(info.lang === 'c' ? "implicit declaration of function '" + w + "'" : "'" + w + "' was not declared in this scope");
    throw new CErr(info.lang === 'c' ? "'" + w + "' undeclared (first use in this function)" : "'" + w + "' was not declared in this scope");
  }
}
function mapPy(e) {
  if (!(e instanceof PyError)) return e;
  if (e.message.startsWith('unterminated string')) return new CErr('missing terminating " character');
  if (e.message.includes('never closed')) return new CErr("expected ')' before ';' token");
  if (e.message.startsWith('invalid decimal')) return new CErr('invalid suffix on integer constant');
  if (e.message.includes('forgot a comma')) return new CErr("expected ')' before string constant");
  return new CErr('expected expression before token');
}
function compileCExpr(text, info) {
  const toks = tokenize(cfix(text));
  const P = new Parser(toks); const e = P.parseExpr();
  if (P.peek()) throw new CErr(semiMsg(P.peek()));
  checkNames(toks, info);
  return e;
}
function compileCStmt(t, info) {
  const lang = info.lang;
  if (/^return\b/.test(t)) return c => { c.stop = true; };
  if (/^(if|else|for|while|do|switch|case|break|continue|goto|struct|typedef|enum|union|scanf|getchar|gets|fgets|cin|static|extern|void)\b/.test(t)) throw new Unsupported();
  const tt = cfix(t);
  const dm = /^(?:const\s+)?(?:(?:unsigned|signed)\s+)?(long\s+long|long\s+int|short\s+int|int|long|short|float|double|char|bool|string)\b([\s\S]*)$/.exec(tt);
  if (dm) {
    let type = dm[1], rest = dm[2];
    if (lang === 'c' && (type === 'string' || type === 'bool')) throw new CErr("unknown type name '" + type + "'");
    type = /float|double/.test(type) ? 'double' : /char|bool|string/.test(type) ? type : 'int';
    const steps = [];
    for (const d0 of splitTop(rest, ',')) {
      const d = d0.trim();
      let name, init, ty = type;
      let m = type === 'char' ? /^([A-Za-z_]\w*)\s*\[\s*\d*\s*\]\s*(?:=\s*([\s\S]+))?$/.exec(d) : null;
      if (m) { ty = 'string'; }
      else m = /^([A-Za-z_]\w*)\s*(?:=\s*([\s\S]+))?$/.exec(d);
      if (!m) throw new CErr("expected identifier or '(' before token");
      name = m[1]; init = m[2];
      if (info.declared.has(name)) throw new CErr(lang === 'c' ? "redeclaration of '" + name + "' with no linkage" : "redeclaration of '" + ty + ' ' + name + "'");
      const th = init ? compileCExpr(init, info) : null;
      info.declared.add(name); info.types[name] = ty;
      steps.push({ name, ty, th });
    }
    return c => { for (const s of steps) c.env[s.name] = s.th ? coerce(s.ty, s.th(c)) : defaultVal(s.ty); };
  }
  let m = /^(?:(\+\+|--)\s*([A-Za-z_]\w*)|([A-Za-z_]\w*)\s*(\+\+|--))$/.exec(tt.trim());
  if (m) {
    const name = m[2] || m[3], op = (m[1] || m[4])[0];
    if (!info.declared.has(name)) throw new CErr(lang === 'c' ? "'" + name + "' undeclared (first use in this function)" : "'" + name + "' was not declared in this scope");
    return c => { c.env[name] = coerce(info.types[name], binop(op, c.env[name], I(1))); };
  }
  m = /^([A-Za-z_]\w*)\s*(\+=|-=|\*=|\/=|%=|=)(?!=)\s*([\s\S]+)$/.exec(tt);
  if (m) {
    const name = m[1], op = m[2];
    if (!info.declared.has(name)) throw new CErr(lang === 'c' ? "'" + name + "' undeclared (first use in this function)" : "'" + name + "' was not declared in this scope");
    const rhs = compileCExpr(m[3], info);
    return c => { let v = rhs(c); if (op !== '=') v = binop(op[0], c.env[name], v); c.env[name] = coerce(info.types[name], v); };
  }
  const toks = tokenize(tt);
  if (toks[0] && toks[0].type === 'name' && (toks[0].value === 'printf' || toks[0].value === 'puts') && toks[1] && toks[1].value === '(') {
    const P = new Parser(toks); P.p = 2;
    const args = P.parseArgs();
    if (P.peek()) throw new CErr(semiMsg(P.peek()));
    checkNames(toks, info);
    if (!args.pos.length) throw new CErr("too few arguments to function '" + toks[0].value + "'");
    if (toks[0].value === 'puts') return c => { c.buf += pyStr(args.pos[0](c)) + '\n'; };
    return c => {
      const f = args.pos[0](c);
      if (!isStr(f)) throw new CErr('format not a string literal');
      c.buf += fmtC(f, args.pos.slice(1).map(g => g(c)));
    };
  }
  if (lang === 'cpp' && toks[0] && toks[0].type === 'name' && toks[0].value === 'cout') {
    const P = new Parser(toks); P.p = 1; const parts = [];
    while (P.isOp('<')) {
      P.p++;
      if (!P.isOp('<')) throw new CErr("expected primary-expression before '<' token");
      P.p++; parts.push(P.parseArith());
    }
    if (P.peek()) throw new CErr(semiMsg(P.peek()));
    checkNames(toks, info);
    if (!parts.length) throw new CErr("expected ';' before token");
    return c => { for (const p of parts) c.buf += coutStr(p(c)); };
  }
  const e = compileCExpr(t, info);
  return c => { e(c); };
}

function runC(code, lang) {
  CMODE = true;
  try { return runCInner(String(code).replace(/\r\n?/g, '\n'), lang); }
  catch (e) {
    if (e instanceof Unsupported) return { out: '', error: null, unsupported: true };
    return { out: '', error: 'InternalError: the prototype compiler could not read this code.' };
  } finally { CMODE = false; }
}
function runCInner(raw, lang) {
  const file = lang === 'c' ? 'main.c' : 'main.cpp';
  const srcLines = raw.split('\n');
  const fail = (line, msg, note) => ({ out: '', error: file + ": In function 'main':\n" + file + ':' + line + ': error: ' + msg + (srcLines[line - 1] !== undefined ? '\n  ' + line + ' | ' + srcLines[line - 1] : '') + (note ? '\n' + note : '') });
  const lineAt = (s, p) => s.slice(0, p).split('\n').length;
  const noc = stripCComments(raw);
  const noPP = noc.split('\n').map(l => /^\s*#/.test(l) ? '' : l).join('\n');
  const nostr = blankStrings(noPP);
  if (lang === 'cpp') {
    let m = /\bcout\b/.exec(nostr);
    if (m && !/#\s*include\s*<iostream>/.test(noc)) return fail(lineAt(nostr, m.index), "'cout' is not a member of 'std'", "note: 'std::cout' is defined in header '<iostream>'; this is probably fixable by adding '#include <iostream>'");
    if (!/using\s+namespace\s+std\s*;/.test(nostr)) {
      m = /(?<!std::)\b(cout|endl|cin|string)\b/.exec(nostr);
      if (m) return fail(lineAt(nostr, m.index), "'" + m[1] + "' was not declared in this scope", "note: suggested alternative: 'std::" + m[1] + "'");
    }
  } else {
    const m = /\bprintf\b/.exec(nostr);
    if (m && !/#\s*include\s*<stdio\.h>/.test(noc)) return fail(lineAt(nostr, m.index), "implicit declaration of function 'printf'", "note: include '<stdio.h>' or provide a declaration of 'printf'");
  }
  const body0 = noPP.replace(/using\s+namespace\s+std\s*;/g, m => m.replace(/[^\n]/g, ' '));
  const mm = /\b(?:int|void)\s+main\s*\([^)]*\)\s*\{/.exec(body0);
  if (!mm) return { out: '', error: "/usr/bin/ld: undefined reference to `main'\ncollect2: error: ld returned 1 exit status" };
  if (body0.slice(0, mm.index).trim()) throw new Unsupported();
  const open = mm.index + mm[0].length, close = body0.lastIndexOf('}');
  if (close < open) return fail(srcLines.length, "expected '}' at end of input");
  const body = body0.slice(open, close);
  const lineOf = p => lineAt(body0, p);
  const stmts = []; let startI = 0, depth = 0;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === '"' || c === "'") {
      let j = i + 1; while (j < body.length && body[j] !== c && body[j] !== '\n') { if (body[j] === '\\') j++; j++; }
      if (body[j] !== c) return fail(lineOf(open + i), c === '"' ? 'missing terminating " character' : "missing terminating ' character");
      i = j; continue;
    }
    if (c === '{' || c === '}') throw new Unsupported();
    if (c === '(') depth++; else if (c === ')') depth--;
    else if (c === ';' && depth === 0) { const text = body.slice(startI, i); if (text.trim()) stmts.push({ text, pos: open + startI }); startI = i + 1; }
  }
  const rest = body.slice(startI);
  if (rest.trim()) return fail(lineOf(open + startI + rest.search(/\S/)), "expected ';' before '}' token");
  const info = { lang, declared: new Set(), types: Object.create(null) };
  const prog = [];
  for (const s of stmts) {
    const lead = s.text.length - s.text.trimStart().length, ln = lineOf(s.pos + lead);
    try { const th = compileCStmt(s.text.trim(), info); if (th) prog.push({ th, ln }); }
    catch (e0) {
      const e = mapPy(e0);
      if (e instanceof CErr) return fail(ln, e.message, e.note);
      throw e;
    }
  }
  const ctx = { env: Object.create(null), buf: '', stop: false };
  if (lang === 'cpp') ctx.env.endl = { k: 'endl' };
  let cur = 0;
  try { for (const s of prog) { cur = s.ln; s.th(ctx); if (ctx.stop) break; } return { out: ctx.buf, error: null }; }
  catch (e) {
    if (e instanceof CErr) return fail(cur, e.message, e.note);
    if (e instanceof PyError && e.pyType === 'ZeroDivisionError') return { out: ctx.buf, error: 'Floating point exception (core dumped)' };
    return { out: ctx.buf, error: 'Runtime error in the prototype compiler.' };
  }
}
function runCode(lang, code) { return lang === 'python' ? runPython(code) : lang === 'sql' ? runSQL(code) : lang === 'jsx' ? runJSX(code) : lang === 'java' ? runJava(code) : lang === 'js' ? runJS(code) : lang === 'git' ? runGit(code) : runC(code, lang); }
function bareCode(lang, code) { return lang === 'python' ? code.split('\n').map(l => l.replace(/#.*$/, '')).join('\n') : lang === 'sql' ? code.split('\n').map(l => l.replace(/--.*$/, '')).join('\n') : lang === 'git' ? code.split('\n').filter(l => !/^\s*#/.test(l)).join('\n') : stripCComments(code); }



/* ---------- Mini Java runner (prototype only) ---------- */
class JRunErr extends Error { constructor(ex, msg) { super(msg); this.ex = ex; } }
function jstr(v) {
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (v === null || v === undefined) return 'null';
  if (v && v.k === 'float' && !Number.isFinite(v.v)) return Number.isNaN(v.v) ? 'NaN' : (v.v > 0 ? 'Infinity' : '-Infinity');
  return pyStr(v);
}
const jtn = v => typeof v === 'boolean' ? 'boolean' : isStr(v) ? 'String' : v && v.k === 'float' ? 'double' : 'int';
const jbox = v => typeof v === 'boolean' ? 'Boolean' : isStr(v) ? 'String' : v && v.k === 'float' ? 'Double' : 'Integer';
function jfix(s) {
  return mapOut(s, seg => seg
    .replace(/\bMath\.PI\b/g, '3.141592653589793')
    .replace(/\bMath\.(max|min|abs|pow|sqrt|floor|ceil)\s*\(/g, '__$1(').replace(/\bMath\.round\s*\(/g, '__jround(')
    .replace(/\bString\.valueOf\s*\(/g, '__str(').replace(/\bInteger\.toString\s*\(/g, '__str(').replace(/\bInteger\.parseInt\s*\(/g, '__int(')
    .replace(/\bDouble\.parseDouble\s*\(/g, '__float(').replace(/\bString\.format\s*\(/g, '__format(')
    .replace(/&&/g, ' and ').replace(/\|\|/g, ' or ').replace(/!(?!=)/g, ' not ')
    .replace(/\btrue\b/g, 'True').replace(/\bfalse\b/g, 'False').replace(/(\b\d+(?:\.\d*)?)[fFlLdD]\b/g, '$1'));
}
function fmtJ(fmt, args) {
  let ai = 0;
  return fmt.replace(/%([-0+, ]*)(\d+)?(?:\.(\d+))?([dfsScbxXn%])/g, (m, fl, w, pr, cv) => {
    if (cv === '%') return '%';
    if (cv === 'n') return '\n';
    if (ai >= args.length) throw new JRunErr('java.util.MissingFormatArgumentException', "Format specifier '" + m + "'");
    const a = args[ai++]; let out = '';
    switch (cv) {
      case 'd': case 'x': case 'X': {
        if (!(a && a.k === 'int')) throw new JRunErr('java.util.IllegalFormatConversionException', cv + ' != java.lang.' + jbox(a));
        out = cv === 'd' ? String(a.v) : (a.v >>> 0).toString(16); if (cv === 'X') out = out.toUpperCase();
        if (fl.includes('+') && a.v >= 0) out = '+' + out; break;
      }
      case 'f': {
        if (!(a && a.k === 'float')) throw new JRunErr('java.util.IllegalFormatConversionException', 'f != java.lang.' + jbox(a));
        out = fmtFixed(a.v, pr === undefined ? 6 : +pr); if (fl.includes('+') && a.v >= 0) out = '+' + out; break;
      }
      case 's': case 'S': out = jstr(a); if (pr !== undefined) out = out.slice(0, +pr); if (cv === 'S') out = out.toUpperCase(); break;
      case 'c': out = isStr(a) ? (a[0] || '') : (a && a.k === 'int' ? String.fromCharCode(a.v) : ''); break;
      case 'b': out = typeof a === 'boolean' ? String(a) : String(a !== null && a !== undefined); break;
    }
    if (fl.includes(',') && (cv === 'd' || cv === 'f')) { const p = out.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); out = p.join('.'); }
    if (w && out.length < +w) {
      const pad = +w - out.length;
      if (fl.includes('-')) out += ' '.repeat(pad);
      else if (fl.includes('0') && /[dfxX]/.test(cv)) { const neg = /^[+-]/.test(out); out = (neg ? out[0] : '') + '0'.repeat(pad) + (neg ? out.slice(1) : out); }
      else out = ' '.repeat(pad) + out;
    }
    return out;
  });
}
function jcoerce(type, v, compound) {
  if (type === 'String') { if (isStr(v)) return v; throw new CErr('incompatible types: ' + jtn(v) + ' cannot be converted to String'); }
  if (type === 'boolean') { if (typeof v === 'boolean') return v; throw new CErr('incompatible types: ' + jtn(v) + ' cannot be converted to boolean'); }
  if (type === 'char') { if (isStr(v) && v.length === 1) return v; if (v && v.k === 'int') return String.fromCharCode(v.v); throw new CErr('incompatible types: ' + jtn(v) + ' cannot be converted to char'); }
  if (isStr(v) && v.length === 1 && (type === 'int' || type === 'long')) return I(v.charCodeAt(0));
  const n = (typeof v === 'boolean' || isStr(v)) ? null : toNum(v);
  if (!n) throw new CErr('incompatible types: ' + jtn(v) + ' cannot be converted to ' + type);
  if (type === 'double') return F(n.v);
  if (n.k === 'float') { if (compound) return I(Math.trunc(n.v)); throw new CErr('incompatible types: possible lossy conversion from double to ' + type); }
  return type === 'int' ? I(n.v | 0) : I(n.v);
}
const jdefault = t => t === 'int' || t === 'long' ? I(0) : t === 'double' ? F(0) : t === 'boolean' ? false : t === 'char' ? '' : null;

function checkNamesJ(toks, info) {
  for (let i = 0; i < toks.length; i++) {
    const k = toks[i]; if (k.type !== 'name') continue;
    const w = k.value;
    if (i > 0 && toks[i - 1].type === 'op' && toks[i - 1].value === '.') continue;
    if (['True', 'False', 'None', 'and', 'or', 'not'].includes(w) || w.startsWith('__')) continue;
    const isCall = toks[i + 1] && toks[i + 1].type === 'op' && toks[i + 1].value === '(';
    if (info.declared.has(w) && !isCall) {
      if (!info.inited.has(w)) throw Object.assign(new CErr('variable ' + w + ' might not have been initialized'), { word: w });
      continue;
    }
    if (['Scanner', 'Integer', 'Double', 'Boolean', 'Character', 'Arrays', 'List', 'ArrayList', 'Random', 'Object', 'StringBuilder', 'System', 'LocalDate'].includes(w)) throw new Unsupported();
    if (isCall) throw Object.assign(new CErr('cannot find symbol'), { word: w, symbol: 'method ' + w + '(...)' });
    throw Object.assign(new CErr('cannot find symbol'), { word: w, symbol: 'variable ' + w });
  }
}
function compileJExpr(text, info) {
  const toks = tokenize(jfix(text));
  const P = new Parser(toks); const e = P.parseExpr();
  if (P.peek()) throw Object.assign(new CErr("';' expected"), { eol: true });
  checkNamesJ(toks, info);
  return e;
}
function mapJPy(e) {
  if (!(e instanceof PyError)) return e;
  if (e.message.startsWith('unterminated string')) return Object.assign(new CErr('unclosed string literal'), { quote: true });
  if (e.message.includes('never closed')) return Object.assign(new CErr("')' expected"), { eol: true });
  if (e.message.startsWith('invalid decimal')) return new CErr('malformed floating-point literal');
  if (e.message.includes('forgot a comma')) return Object.assign(new CErr("')' or ',' expected"));
  return new CErr('illegal start of expression');
}
function compileJStmt(t, info) {
  if (/^return\b/.test(t)) return c => { c.stop = true; };
  if (/^(if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|class|interface|enum|static|public|private|protected|new|Scanner|var|abstract|synchronized)\b/.test(t) || /^(int|String|double|char|long|boolean)\s*\[/.test(t)) throw new Unsupported();
  if (/^string\s+[A-Za-z_]/.test(t)) throw Object.assign(new CErr('cannot find symbol'), { word: 'string', symbol: 'class string' });
  const tt = jfix(t);
  const dm = /^(?:final\s+)?(int|long|short|byte|float|double|char|boolean|String)\s+([\s\S]*)$/.exec(tt);
  if (dm) {
    let type = dm[1]; const rest = dm[2];
    type = /^(int|short|byte)$/.test(type) ? 'int' : /^(float|double)$/.test(type) ? 'double' : type;
    const steps = [];
    for (const d0 of splitTop(rest, ',')) {
      const m = /^([A-Za-z_]\w*)\s*(?:=\s*([\s\S]+))?$/.exec(d0.trim());
      if (!m) throw new CErr('not a statement');
      const name = m[1];
      if (info.declared.has(name)) throw Object.assign(new CErr('variable ' + name + ' is already defined in method main(String[])'), { word: name });
      const th = m[2] ? compileJExpr(m[2], info) : null;
      info.declared.add(name); info.types[name] = type; if (th) info.inited.add(name);
      steps.push({ name, th });
    }
    return c => { for (const s of steps) c.env[s.name] = s.th ? jcoerce(type, s.th(c)) : jdefault(type); };
  }
  let m = /^(?:(\+\+|--)\s*([A-Za-z_]\w*)|([A-Za-z_]\w*)\s*(\+\+|--))$/.exec(tt.trim());
  if (m) {
    const name = m[2] || m[3], op = (m[1] || m[4])[0];
    if (!info.declared.has(name)) throw Object.assign(new CErr('cannot find symbol'), { word: name, symbol: 'variable ' + name });
    return c => { c.env[name] = jcoerce(info.types[name], binop(op, c.env[name], I(1)), true); };
  }
  m = /^([A-Za-z_]\w*)\s*(\+=|-=|\*=|\/=|%=|=)(?!=)\s*([\s\S]+)$/.exec(tt);
  if (m) {
    const name = m[1], op = m[2];
    if (!info.declared.has(name)) throw Object.assign(new CErr('cannot find symbol'), { word: name, symbol: 'variable ' + name });
    const rhs = compileJExpr(m[3], info);
    info.inited.add(name);
    return c => { let v = rhs(c); if (op !== '=') v = binop(op[0], c.env[name], v); c.env[name] = jcoerce(info.types[name], v, op !== '='); };
  }
  const toks = tokenize(tt);
  if (toks.length > 5 && toks[0].value === 'System' && toks[1].value === '.' && toks[2].value === 'out' && toks[3].value === '.' && toks[5].value === '(') {
    const meth = toks[4].value;
    if (!['println', 'print', 'printf', 'format'].includes(meth)) throw Object.assign(new CErr('cannot find symbol'), { word: meth, symbol: 'method ' + meth + '(...)' });
    const P = new Parser(toks); P.p = 6; const args = P.parseArgs();
    if (P.peek()) throw Object.assign(new CErr("';' expected"), { eol: true });
    checkNamesJ(toks.slice(6), info);
    if (meth === 'println' || meth === 'print') {
      if (args.pos.length > 1 || (meth === 'print' && !args.pos.length)) throw new CErr('no suitable method found for ' + meth + '(...)');
      const nl = meth === 'println' ? '\n' : '';
      return c => { c.buf += (args.pos.length ? jstr(args.pos[0](c)) : '') + nl; };
    }
    if (!args.pos.length) throw new CErr('no suitable method found for ' + meth + '(...)');
    return c => {
      const f = args.pos[0](c);
      if (!isStr(f)) throw new CErr('incompatible types: ' + jtn(f) + ' cannot be converted to String');
      c.buf += fmtJ(f, args.pos.slice(1).map(g => g(c)));
    };
  }
  const e = compileJExpr(t, info);
  const last = toks[toks.length - 1];
  if (!(last && last.type === 'op' && last.value === ')')) throw new CErr('not a statement');
  return c => { e(c); };
}

function runJava(code) {
  CMODE = true; JMODE = true;
  try { return runJavaInner(String(code).replace(/\r\n?/g, '\n')); }
  catch (e) {
    if (e instanceof Unsupported) return { out: '', error: null, unsupported: true };
    return { out: '', error: 'InternalError: the prototype compiler could not read this code.' };
  } finally { CMODE = false; JMODE = false; }
}
function runJavaInner(raw) {
  const srcLines = raw.split('\n');
  let cls = 'Main', file = 'Main.java';
  const fail = (line, msg, o = {}) => {
    const src = srcLines[line - 1]; let s = file + ':' + line + ': error: ' + msg;
    if (src !== undefined) {
      let col = src.search(/\S/); if (col < 0) col = 0;
      if (o.eol) col = src.trimEnd().length;
      else if (o.word) { const mm = new RegExp('\\b' + o.word.replace(/[$]/g, '\\$') + '\\b').exec(src); if (mm) col = mm.index; }
      else if (o.quote) { const q = src.indexOf('"'); if (q >= 0) col = q; }
      else if (o.val) { const eq = src.indexOf('='); if (eq >= 0) { col = eq + 1; while (src[col] === ' ') col++; } }
      s += '\n' + src + '\n' + ' '.repeat(col) + '^';
    }
    if (o.symbol) s += '\n  symbol:   ' + o.symbol + '\n  location: class ' + cls;
    return { out: '', error: s + '\n1 error' };
  };
  const lineAt = (s, p) => s.slice(0, p).split('\n').length;
  let lastLine = srcLines.length; while (lastLine > 1 && !srcLines[lastLine - 1].trim()) lastLine--;
  const noc = stripCComments(raw);
  const code = noc.split('\n').map(l => /^\s*(import|package)\b/.test(l) ? '' : l).join('\n');
  const cm = /\b(?:public\s+)?class\s+([A-Za-z_]\w*)\s*\{/.exec(code);
  if (!cm) return fail(1, 'class, interface, enum, or record expected');
  cls = cm[1]; file = cls + '.java';
  const mm = /\bpublic\s+static\s+void\s+main\s*\(\s*String\s*(?:\[\s*\]\s*\w+|\w+\s*\[\s*\])\s*\)\s*\{/.exec(code);
  if (!mm) return { out: '', error: 'Error: Main method not found in class ' + cls + ', please define the main method as:\n   public static void main(String[] args)' };
  if (code.slice(cm.index + cm[0].length, mm.index).trim()) throw new Unsupported();
  const open = mm.index + mm[0].length;
  let end = -1;
  for (let i = open; i < code.length; i++) {
    const c = code[i];
    if (c === '"' || c === "'") {
      let j = i + 1; while (j < code.length && code[j] !== c && code[j] !== '\n') { if (code[j] === '\\') j++; j++; }
      if (code[j] !== c) return fail(lineAt(code, i), c === '"' ? 'unclosed string literal' : 'unclosed character literal', { quote: true });
      i = j; continue;
    }
    if (c === '{') throw new Unsupported();
    if (c === '}') { end = i; break; }
  }
  if (end < 0) return fail(lastLine, 'reached end of file while parsing', { eol: true });
  const after = code.slice(end + 1);
  if (!after.includes('}')) return fail(lastLine, 'reached end of file while parsing', { eol: true });
  if (after.replace('}', '').trim()) throw new Unsupported();
  const body = code.slice(open, end);
  const stmts = []; let startI = 0, depth = 0;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === '"' || c === "'") { let j = i + 1; while (j < body.length && body[j] !== c) { if (body[j] === '\\') j++; j++; } i = j; continue; }
    if (c === '(') depth++; else if (c === ')') depth--;
    else if (c === ';' && depth === 0) { const text = body.slice(startI, i); if (text.trim()) stmts.push({ text, pos: open + startI }); startI = i + 1; }
  }
  const rest = body.slice(startI);
  if (rest.trim()) { const lastPos = open + startI + rest.trimEnd().length - 1; return fail(lineAt(code, lastPos), "';' expected", { eol: true }); }
  const info = { declared: new Set(), inited: new Set(), types: Object.create(null) };
  const prog = [];
  for (const s of stmts) {
    const lead = s.text.length - s.text.trimStart().length, ln = lineAt(code, s.pos + lead);
    try { const th = compileJStmt(s.text.trim(), info); if (th) prog.push({ th, ln }); }
    catch (e0) {
      const e = mapJPy(e0);
      if (e instanceof CErr) return fail(ln, e.message, { word: e.word, symbol: e.symbol, eol: e.eol, quote: e.quote, val: /^incompatible types/.test(e.message) });
      throw e;
    }
  }
  const ctx = { env: Object.create(null), buf: '', stop: false };
  let cur = 0;
  try { for (const s of prog) { cur = s.ln; s.th(ctx); if (ctx.stop) break; } return { out: ctx.buf, error: null }; }
  catch (e) {
    if (e instanceof CErr) return fail(cur, e.message, { word: e.word, symbol: e.symbol, val: /^incompatible types/.test(e.message) });
    if (e instanceof JRunErr) return { out: ctx.buf, error: 'Exception in thread "main" ' + e.ex + ': ' + e.message + '\n\tat ' + cls + '.main(' + file + ':' + cur + ')' };
    if (e instanceof PyError && e.pyType === 'ZeroDivisionError') return { out: ctx.buf, error: 'Exception in thread "main" java.lang.ArithmeticException: / by zero\n\tat ' + cls + '.main(' + file + ':' + cur + ')' };
    return { out: ctx.buf, error: 'Runtime error in the prototype runner.' };
  }
}

/* ---------- Mini SQL engine (prototype only) ---------- */
const DB = {
  students: {
    cols: ['id', 'name', 'city', 'course', 'score', 'age'],
    rows: [
      [1, 'Aarav', 'Pune', 'Python', 82, 17], [2, 'Diya', 'Delhi', 'C', 91, 18], [3, 'Kabir', 'Jaipur', 'C++', 74, 17],
      [4, 'Meera', 'Mumbai', 'Python', 88, 19], [5, 'Rohan', 'Pune', 'SQL', 69, 18], [6, 'Saanvi', 'Chennai', 'React', 95, 18],
      [7, 'Vihaan', 'Delhi', 'Python', 67, 17], [8, 'Anaya', 'Kolkata', 'SQL', 79, 19], [9, 'Ishaan', 'Mumbai', 'C', 85, 18],
      [10, 'Tara', 'Jaipur', 'React', 72, 17], [11, 'Neel', 'Chennai', 'C++', 90, 19], [12, 'Zoya', 'Kolkata', 'Python', 94, 18]
    ]
  }
};
class SqlErr extends Error { constructor(m, parse) { super(m); this.parse = !!parse; } }
class SqlUnsup extends Error {}
const SQL_RESERVED = new Set(['FROM', 'WHERE', 'GROUP', 'ORDER', 'LIMIT', 'OFFSET', 'HAVING', 'UNION', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'CROSS', 'ON', 'AND', 'OR', 'NOT', 'AS', 'BY', 'ASC', 'DESC', 'IN', 'LIKE', 'BETWEEN', 'IS', 'SELECT', 'DISTINCT']);
const SQL_AGG = new Set(['COUNT', 'SUM', 'AVG', 'MIN', 'MAX']);

function sqlTok(s) {
  const toks = []; let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === '-' && s[i + 1] === '-') { while (i < s.length && s[i] !== '\n') i++; continue; }
    if (c === '/' && s[i + 1] === '*') { const j = s.indexOf('*/', i + 2); i = j < 0 ? s.length : j + 2; continue; }
    if (c === "'") {
      let j = i + 1, v = '';
      for (;;) {
        if (j >= s.length) throw new SqlErr('unrecognized token: "' + s.slice(i) + '"', true);
        if (s[j] === "'") { if (s[j + 1] === "'") { v += "'"; j += 2; continue; } break; }
        v += s[j++];
      }
      toks.push({ t: 'str', v, s: i, e: j + 1 }); i = j + 1; continue;
    }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(s[i + 1] || ''))) {
      const m = /^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/.exec(s.slice(i));
      toks.push({ t: 'num', v: parseFloat(m[0]), s: i, e: i + m[0].length }); i += m[0].length; continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(s.slice(i));
      toks.push({ t: 'id', v: m[0], u: m[0].toUpperCase(), s: i, e: i + m[0].length }); i += m[0].length; continue;
    }
    const two = s.substr(i, 2);
    if (['<>', '!=', '<=', '>=', '||'].includes(two)) { toks.push({ t: 'op', v: two, s: i, e: i + 2 }); i += 2; continue; }
    if ('=<>+-*/%(),.;'.includes(c)) { toks.push({ t: 'op', v: c, s: i, e: i + 1 }); i++; continue; }
    throw new SqlErr('unrecognized token: "' + c + '"', true);
  }
  return toks;
}

class SqlP {
  constructor(toks, src) { this.t = toks; this.p = 0; this.src = src; }
  peek() { return this.t[this.p]; }
  isKw(k) { const x = this.t[this.p]; return !!x && x.t === 'id' && x.u === k; }
  isOp(o) { const x = this.t[this.p]; return !!x && x.t === 'op' && x.v === o; }
  err() { const x = this.t[this.p]; return new SqlErr(x ? 'near "' + x.v + '": syntax error' : 'incomplete input', true); }
  eatKw(k) { if (this.isKw(k)) { this.p++; return true; } return false; }
  eatOp(o) { if (this.isOp(o)) { this.p++; return true; } return false; }
  needKw(k) { if (!this.eatKw(k)) throw this.err(); }
  needOp(o) { if (!this.eatOp(o)) throw this.err(); }
  ident() { const x = this.t[this.p]; if (!x || x.t !== 'id') throw this.err(); this.p++; return x.v; }

  parseSelect() {
    const first = this.peek();
    if (!first || first.t !== 'id') throw this.err();
    if (['INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'REPLACE'].includes(first.u)) throw new SqlUnsup('INSERT, UPDATE, DELETE and CREATE TABLE arrive with the data-changing chapters in the full app. This preview runs SELECT queries.');
    this.needKw('SELECT');
    const q = { distinct: false, items: [], from: null, alias: null, where: null, group: null, having: null, order: [], limit: null, offset: null };
    if (this.eatKw('DISTINCT')) q.distinct = true;
    do {
      if (this.isOp('*')) { this.p++; q.items.push({ star: true }); continue; }
      const startTok = this.peek(); if (!startTok) throw this.err();
      const expr = this.parseExpr();
      const endTok = this.t[this.p - 1];
      const text = this.src.slice(startTok.s, endTok.e);
      let alias = null;
      if (this.eatKw('AS')) alias = this.ident();
      else if (this.peek() && this.peek().t === 'id' && !SQL_RESERVED.has(this.peek().u)) alias = this.ident();
      q.items.push({ expr, alias, text });
    } while (this.eatOp(','));
    if (this.eatKw('FROM')) {
      q.from = this.ident();
      if (this.eatKw('AS')) q.alias = this.ident();
      else if (this.peek() && this.peek().t === 'id' && !SQL_RESERVED.has(this.peek().u)) q.alias = this.ident();
      const nx = this.peek();
      if (nx && nx.t === 'id' && ['JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'CROSS'].includes(nx.u)) throw new SqlUnsup('JOINs arrive in chapter 3 of the full app. This preview queries a single table.');
      if (this.isOp(',')) throw new SqlUnsup('Querying several tables at once arrives with JOINs in the full app.');
    }
    if (this.eatKw('WHERE')) q.where = this.parseExpr();
    if (this.eatKw('GROUP')) { this.needKw('BY'); q.group = []; do { q.group.push(this.parseExpr()); } while (this.eatOp(',')); }
    if (this.eatKw('HAVING')) q.having = this.parseExpr();
    if (this.eatKw('ORDER')) {
      this.needKw('BY');
      do { const e = this.parseExpr(); let desc = false; if (this.eatKw('DESC')) desc = true; else this.eatKw('ASC'); q.order.push({ e, desc }); } while (this.eatOp(','));
    }
    if (this.eatKw('LIMIT')) { q.limit = this.parseExpr(); if (this.eatKw('OFFSET')) q.offset = this.parseExpr(); }
    return q;
  }
  parseExpr() { return this.parseOr(); }
  parseOr() { let l = this.parseAnd(); while (this.eatKw('OR')) l = { t: 'bin', op: 'OR', l, r: this.parseAnd() }; return l; }
  parseAnd() { let l = this.parseNot(); while (this.eatKw('AND')) l = { t: 'bin', op: 'AND', l, r: this.parseNot() }; return l; }
  parseNot() { if (this.eatKw('NOT')) return { t: 'not', e: this.parseNot() }; return this.parseCmp(); }
  parseCmp() {
    let l = this.parseAdd();
    for (;;) {
      const x = this.peek();
      if (x && x.t === 'op' && ['=', '<>', '!=', '<', '>', '<=', '>='].includes(x.v)) { this.p++; l = { t: 'bin', op: x.v === '!=' ? '<>' : x.v, l, r: this.parseAdd() }; continue; }
      let neg = false;
      if (this.isKw('NOT') && this.t[this.p + 1] && ['IN', 'LIKE', 'BETWEEN'].includes(this.t[this.p + 1].u)) { this.p++; neg = true; }
      if (this.eatKw('IN')) {
        this.needOp('(');
        if (this.isKw('SELECT')) throw new SqlUnsup('Subqueries arrive in a later chapter of the full app.');
        const list = []; do { list.push(this.parseAdd()); } while (this.eatOp(','));
        this.needOp(')'); l = { t: 'in', e: l, list, neg }; continue;
      }
      if (this.eatKw('BETWEEN')) { const a = this.parseAdd(); this.needKw('AND'); const b = this.parseAdd(); l = { t: 'between', e: l, a, b, neg }; continue; }
      if (this.eatKw('LIKE')) { l = { t: 'like', e: l, pat: this.parseAdd(), neg }; continue; }
      if (this.isKw('IS')) { this.p++; const n = this.eatKw('NOT'); this.needKw('NULL'); l = { t: 'isnull', e: l, neg: n }; continue; }
      return l;
    }
  }
  parseAdd() {
    let l = this.parseMul();
    for (;;) { const x = this.peek(); if (x && x.t === 'op' && ['+', '-', '||'].includes(x.v)) { this.p++; l = { t: 'bin', op: x.v, l, r: this.parseMul() }; } else return l; }
  }
  parseMul() {
    let l = this.parseUn();
    for (;;) { const x = this.peek(); if (x && x.t === 'op' && ['*', '/', '%'].includes(x.v)) { this.p++; l = { t: 'bin', op: x.v, l, r: this.parseUn() }; } else return l; }
  }
  parseUn() { if (this.eatOp('-')) return { t: 'neg', e: this.parseUn() }; if (this.eatOp('+')) return this.parseUn(); return this.parsePrim(); }
  parsePrim() {
    const x = this.peek(); if (!x) throw this.err();
    if (x.t === 'num') { this.p++; return { t: 'lit', v: x.v }; }
    if (x.t === 'str') { this.p++; return { t: 'lit', v: x.v }; }
    if (x.t === 'op' && x.v === '(') { this.p++; if (this.isKw('SELECT')) throw new SqlUnsup('Subqueries arrive in a later chapter of the full app.'); const e = this.parseExpr(); this.needOp(')'); return e; }
    if (x.t === 'id') {
      if (x.u === 'NULL') { this.p++; return { t: 'lit', v: null }; }
      if (x.u === 'TRUE') { this.p++; return { t: 'lit', v: 1 }; }
      if (x.u === 'FALSE') { this.p++; return { t: 'lit', v: 0 }; }
      if (SQL_RESERVED.has(x.u) && !(this.t[this.p + 1] && this.t[this.p + 1].v === '(')) throw this.err();
      this.p++;
      if (this.isOp('(')) {
        this.p++;
        const f = { t: 'fn', name: x.u, args: [], star: false, distinct: false };
        if (this.isOp('*')) { this.p++; f.star = true; }
        else if (!this.isOp(')')) { if (this.eatKw('DISTINCT')) f.distinct = true; do { f.args.push(this.parseExpr()); } while (this.eatOp(',')); }
        this.needOp(')');
        return f;
      }
      if (this.isOp('.')) { this.p++; const c = this.ident(); return { t: 'col', q: x.v, name: c }; }
      return { t: 'col', name: x.v };
    }
    throw this.err();
  }
}

const sqlIsAgg = n => !!n && (n.t === 'fn' ? (SQL_AGG.has(n.name) || n.args.some(sqlIsAgg)) : ['bin'].includes(n.t) ? sqlIsAgg(n.l) || sqlIsAgg(n.r) : ['not', 'neg', 'isnull'].includes(n.t) ? sqlIsAgg(n.e) : n.t === 'between' ? sqlIsAgg(n.e) || sqlIsAgg(n.a) || sqlIsAgg(n.b) : n.t === 'in' ? sqlIsAgg(n.e) : n.t === 'like' ? sqlIsAgg(n.e) : false);
const sqlTruthy = v => v !== null && v !== undefined && v !== 0 && v !== '' && v !== false;
function sqlCmp(a, b) {
  const ra = a === null ? 0 : typeof a === 'number' ? 1 : 2, rb = b === null ? 0 : typeof b === 'number' ? 1 : 2;
  if (ra !== rb) return ra - rb;
  if (ra === 1) return a - b;
  if (ra === 2) return a < b ? -1 : a > b ? 1 : 0;
  return 0;
}
function sqlEv(n, row, grp, ctx) {
  switch (n.t) {
    case 'lit': return n.v;
    case 'col': {
      if (n.q && ctx.tname && n.q.toLowerCase() !== ctx.tname.toLowerCase() && n.q.toLowerCase() !== (ctx.alias || '').toLowerCase()) throw new SqlErr('no such column: ' + n.q + '.' + n.name);
      const k = n.name.toLowerCase();
      if (!ctx.cols.includes(k)) throw new SqlErr('no such column: ' + (n.q ? n.q + '.' : '') + n.name);
      return row[k] === undefined ? null : row[k];
    }
    case 'neg': { const v = sqlEv(n.e, row, grp, ctx); return v === null ? null : -v; }
    case 'not': { const v = sqlEv(n.e, row, grp, ctx); return v === null ? null : (sqlTruthy(v) ? 0 : 1); }
    case 'isnull': { const v = sqlEv(n.e, row, grp, ctx); return (v === null) !== n.neg ? 1 : 0; }
    case 'in': { const v = sqlEv(n.e, row, grp, ctx); if (v === null) return null; const hit = n.list.some(x => sqlEv(x, row, grp, ctx) === v); return hit !== n.neg ? 1 : 0; }
    case 'between': { const v = sqlEv(n.e, row, grp, ctx), a = sqlEv(n.a, row, grp, ctx), b = sqlEv(n.b, row, grp, ctx); if (v === null || a === null || b === null) return null; const r = sqlCmp(v, a) >= 0 && sqlCmp(v, b) <= 0; return r !== n.neg ? 1 : 0; }
    case 'like': {
      const v = sqlEv(n.e, row, grp, ctx), p = sqlEv(n.pat, row, grp, ctx); if (v === null || p === null) return null;
      const re = new RegExp('^' + String(p).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.') + '$', 'i');
      return re.test(String(v)) !== n.neg ? 1 : 0;
    }
    case 'bin': {
      if (n.op === 'AND') { const a = sqlEv(n.l, row, grp, ctx); if (a !== null && !sqlTruthy(a)) return 0; const b = sqlEv(n.r, row, grp, ctx); if (b !== null && !sqlTruthy(b)) return 0; return (a === null || b === null) ? null : 1; }
      if (n.op === 'OR') { const a = sqlEv(n.l, row, grp, ctx); if (a !== null && sqlTruthy(a)) return 1; const b = sqlEv(n.r, row, grp, ctx); if (b !== null && sqlTruthy(b)) return 1; return (a === null || b === null) ? null : 0; }
      const a = sqlEv(n.l, row, grp, ctx), b = sqlEv(n.r, row, grp, ctx);
      if (a === null || b === null) return null;
      switch (n.op) {
        case '=': return sqlCmp(a, b) === 0 ? 1 : 0; case '<>': return sqlCmp(a, b) !== 0 ? 1 : 0;
        case '<': return sqlCmp(a, b) < 0 ? 1 : 0; case '>': return sqlCmp(a, b) > 0 ? 1 : 0;
        case '<=': return sqlCmp(a, b) <= 0 ? 1 : 0; case '>=': return sqlCmp(a, b) >= 0 ? 1 : 0;
        case '||': return String(a) + String(b);
        case '+': return a + b; case '-': return a - b; case '*': return a * b;
        case '/': if (b === 0) return null; return (Number.isInteger(a) && Number.isInteger(b)) ? Math.trunc(a / b) : a / b;
        case '%': if (b === 0) return null; return a % b;
      }
      return null;
    }
    case 'fn': {
      if (SQL_AGG.has(n.name)) {
        if (!grp) throw new SqlErr('misuse of aggregate function ' + n.name + '()');
        if (n.name === 'COUNT' && n.star) return grp.length;
        if (n.args.length !== 1) throw new SqlErr('wrong number of arguments to function ' + n.name + '()');
        let vals = grp.map(r => sqlEv(n.args[0], r, null, ctx)).filter(v => v !== null);
        if (n.distinct) vals = [...new Set(vals)];
        if (n.name === 'COUNT') return vals.length;
        if (!vals.length) return null;
        if (n.name === 'SUM') return vals.reduce((a, b) => a + b, 0);
        if (n.name === 'AVG') return vals.reduce((a, b) => a + b, 0) / vals.length;
        if (n.name === 'MIN') return vals.reduce((a, b) => sqlCmp(a, b) <= 0 ? a : b);
        return vals.reduce((a, b) => sqlCmp(a, b) >= 0 ? a : b);
      }
      const a = n.args.map(x => sqlEv(x, row, grp, ctx));
      switch (n.name) {
        case 'UPPER': return a[0] === null ? null : String(a[0]).toUpperCase();
        case 'LOWER': return a[0] === null ? null : String(a[0]).toLowerCase();
        case 'LENGTH': return a[0] === null ? null : String(a[0]).length;
        case 'ABS': return a[0] === null ? null : Math.abs(a[0]);
        case 'ROUND': { if (a[0] === null) return null; const d = a[1] || 0, f = Math.pow(10, d); return Math.round(a[0] * f + (a[0] >= 0 ? 1e-9 : -1e-9)) / f; }
      }
      throw new SqlErr('no such function: ' + n.name);
    }
  }
  return null;
}

function sqlExec(q) {
  let tbl = null, rows = [{}];
  const ctx = { cols: [], tname: null, alias: null };
  if (q.from) {
    tbl = DB[q.from.toLowerCase()];
    if (!tbl) throw new SqlErr('no such table: ' + q.from);
    ctx.cols = tbl.cols; ctx.tname = q.from; ctx.alias = q.alias;
    rows = tbl.rows.map(r => Object.fromEntries(tbl.cols.map((c, i) => [c, r[i]])));
  }
  const items = [];
  for (const it of q.items) {
    if (it.star) { if (!tbl) throw new SqlErr('no tables specified'); tbl.cols.forEach(c => items.push({ expr: { t: 'col', name: c }, name: c })); }
    else items.push({ expr: it.expr, name: it.alias || (it.expr.t === 'col' ? it.expr.name : it.text), alias: it.alias });
  }
  if (q.where) { if (sqlIsAgg(q.where)) throw new SqlErr('misuse of aggregate: ' + 'in WHERE clause'); rows = rows.filter(r => sqlTruthy(sqlEv(q.where, r, null, ctx))); }
  const agg = !!q.group || items.some(i => sqlIsAgg(i.expr)) || (q.having && sqlIsAgg(q.having));
  let out = [];
  if (agg) {
    let groups;
    if (q.group) { const m = new Map(); for (const r of rows) { const k = JSON.stringify(q.group.map(g => sqlEv(g, r, null, ctx))); if (!m.has(k)) m.set(k, []); m.get(k).push(r); } groups = [...m.values()]; }
    else groups = [rows];
    for (const g of groups) {
      const first = g[0] || {};
      if (q.having && !sqlTruthy(sqlEv(q.having, first, g, ctx))) continue;
      out.push({ proj: items.map(i => sqlEv(i.expr, first, g, ctx)), src: first, grp: g });
    }
  } else out = rows.map(r => ({ proj: items.map(i => sqlEv(i.expr, r, null, ctx)), src: r, grp: null }));
  if (q.distinct) { const seen = new Set(); out = out.filter(o => { const k = JSON.stringify(o.proj); if (seen.has(k)) return false; seen.add(k); return true; }); }
  if (q.order.length) {
    const key = (o, ord) => {
      const e = ord.e;
      if (e.t === 'lit' && typeof e.v === 'number') return o.proj[e.v - 1];
      if (e.t === 'col' && !e.q) { const ai = items.findIndex(i => i.alias && i.alias.toLowerCase() === e.name.toLowerCase()); if (ai >= 0) return o.proj[ai]; }
      return sqlEv(e, o.src, o.grp, ctx);
    };
    const keyed = out.map((o, i) => ({ o, i, k: q.order.map(ord => key(o, ord)) }));
    keyed.sort((a, b) => { for (let j = 0; j < q.order.length; j++) { const c = sqlCmp(a.k[j], b.k[j]); if (c) return q.order[j].desc ? -c : c; } return a.i - b.i; });
    out = keyed.map(x => x.o);
  }
  if (q.offset) out = out.slice(Math.max(0, sqlEv(q.offset, {}, null, ctx)));
  if (q.limit) { const n = sqlEv(q.limit, {}, null, ctx); if (typeof n !== 'number') throw new SqlErr('datatype mismatch'); out = out.slice(0, Math.max(0, n)); }
  return { cols: items.map(i => i.name), rows: out.map(o => o.proj) };
}

function runSQL(sql) {
  try {
    const src = String(sql), toks = sqlTok(src);
    const stmts = []; let cur = [];
    for (const t of toks) { if (t.t === 'op' && t.v === ';') { if (cur.length) stmts.push(cur); cur = []; } else cur.push(t); }
    if (cur.length) stmts.push(cur);
    if (!stmts.length) return { results: [] };
    const results = [];
    for (const st of stmts) {
      const P = new SqlP(st, src);
      const q = P.parseSelect();
      if (P.peek()) throw P.err();
      results.push(sqlExec(q));
    }
    return { results };
  } catch (e) {
    if (e instanceof SqlUnsup) return { unsupported: true, msg: e.message };
    if (e instanceof SqlErr) return { error: (e.parse ? 'Parse error: ' : 'Error: ') + e.message };
    return { error: 'Error: the prototype query engine could not run this.' };
  }
}
function sqlFmt(v) { if (v === null) return 'NULL'; if (typeof v === 'number') return Number.isInteger(v) ? String(v) : String(Number(v.toPrecision(15))); return String(v); }




/* ---------- Mini React runner (prototype only) ---------- */
class JsErr extends Error { constructor(type, msg, line) { super(msg); this.jsType = type; this.line = line; } }
class JsUnsup extends Error {}
const JS_UNSUP_WORDS = new Set(['do', 'try', 'throw', 'delete', 'void', 'yield', 'with']);
const JS_OPS3 = ['===', '!==', '...'];
const JS_OPS2 = ['=>', '==', '!=', '<=', '>=', '&&', '||', '??', '?.', '++', '--', '+=', '-=', '*=', '/=', '**'];
const JS_PREC = { '??': 1, '||': 2, '&&': 3, '==': 4, '!=': 4, '===': 4, '!==': 4, '<': 5, '>': 5, '<=': 5, '>=': 5, '+': 6, '-': 6, '*': 7, '/': 7, '%': 7, '**': 8 };
const HTML_ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': '\u00a0', '&apos;': "'" };

class JP {
  constructor(src) { this.s = src; this.i = 0; this.tok = null; this.nl = false; this.tokStart = 0; this.advance(); }
  line(pos) { return this.s.slice(0, pos).split('\n').length; }
  err(msg) { return new JsErr('SyntaxError', msg || 'Unexpected token', this.line(this.tokStart)); }
  save() { return { i: this.i, tok: this.tok, nl: this.nl, ts: this.tokStart }; }
  restore(o) { this.i = o.i; this.tok = o.tok; this.nl = o.nl; this.tokStart = o.ts; }
  skip() {
    this.nl = false;
    for (;;) {
      const c = this.s[this.i];
      if (c === '\n') { this.nl = true; this.i++; continue; }
      if (c === ' ' || c === '\t' || c === '\r') { this.i++; continue; }
      if (c === '/' && this.s[this.i + 1] === '/') { while (this.i < this.s.length && this.s[this.i] !== '\n') this.i++; continue; }
      if (c === '/' && this.s[this.i + 1] === '*') { const j = this.s.indexOf('*/', this.i + 2); const seg = this.s.slice(this.i, j < 0 ? this.s.length : j + 2); if (seg.includes('\n')) this.nl = true; this.i = j < 0 ? this.s.length : j + 2; continue; }
      break;
    }
  }
  advance() { this.skip(); this.tokStart = this.i; this.tok = this.lex(); }
  lex() {
    const s = this.s; if (this.i >= s.length) return { t: 'eof' };
    const c = s[this.i];
    if (/[A-Za-z_$]/.test(c)) { const m = /^[A-Za-z_$][\w$]*/.exec(s.slice(this.i)); this.i += m[0].length; return { t: 'id', v: m[0] }; }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(s[this.i + 1] || ''))) { const m = /^(?:\d[\d_]*\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/.exec(s.slice(this.i)); this.i += m[0].length; return { t: 'num', v: parseFloat(m[0].replace(/_/g, '')) }; }
    if (c === '"' || c === "'") {
      let j = this.i + 1, v = '';
      while (j < s.length && s[j] !== c) {
        if (s[j] === '\\') { const n = s[j + 1]; v += ({ n: '\n', t: '\t', r: '\r' })[n] !== undefined ? ({ n: '\n', t: '\t', r: '\r' })[n] : n; j += 2; }
        else { if (s[j] === '\n') throw this.err('Unterminated string constant'); v += s[j++]; }
      }
      if (j >= s.length) throw this.err('Unterminated string constant');
      this.i = j + 1; return { t: 'str', v };
    }
    if (c === '`') return this.lexTemplate();
    const t3 = s.substr(this.i, 3), t2 = s.substr(this.i, 2);
    if (JS_OPS3.includes(t3)) { this.i += 3; return { t: 'op', v: t3 }; }
    if (JS_OPS2.includes(t2) && !(t2 === '?.' && /[0-9]/.test(s[this.i + 2] || ''))) { this.i += 2; return { t: 'op', v: t2 }; }
    if ('+-*/%<>=!?:.,;()[]{}&|^~'.includes(c)) { this.i++; return { t: 'op', v: c }; }
    throw this.err('Unexpected character \'' + c + '\'');
  }
  lexTemplate() {
    const s = this.s; let j = this.i + 1, cur = ''; const parts = [];
    while (j < s.length && s[j] !== '`') {
      if (s[j] === '\\') { const n = s[j + 1]; cur += ({ n: '\n', t: '\t' })[n] !== undefined ? ({ n: '\n', t: '\t' })[n] : n; j += 2; continue; }
      if (s[j] === '$' && s[j + 1] === '{') {
        let d = 1, k = j + 2, q = null;
        for (; k < s.length; k++) {
          const ch = s[k];
          if (q) { if (ch === '\\') k++; else if (ch === q) q = null; continue; }
          if (ch === '"' || ch === "'" || ch === '`') { q = ch; continue; }
          if (ch === '{') d++; else if (ch === '}') { d--; if (!d) break; }
        }
        if (k >= s.length) throw this.err('Unterminated template');
        parts.push(cur); cur = ''; parts.push({ src: s.slice(j + 2, k) });
        j = k + 1; continue;
      }
      cur += s[j++];
    }
    if (j >= s.length) throw this.err('Unterminated template');
    parts.push(cur); this.i = j + 1;
    return { t: 'tpl', parts };
  }
  isOp(v) { return this.tok.t === 'op' && this.tok.v === v; }
  isId(v) { return this.tok.t === 'id' && this.tok.v === v; }
  eatOp(v) { if (this.isOp(v)) { this.advance(); return true; } return false; }
  needOp(v) { if (!this.eatOp(v)) throw this.err(); }
  semi() { if (this.isOp(';')) this.advance(); }

  parseProgram() { const body = []; while (this.tok.t !== 'eof') { const st = this.parseStmt(); if (st) body.push(st); } return body; }
  parseStmt() { const ln = this.line(this.tokStart); const st = this.parseStmt0(); if (st) st.ln = ln; return st; }
  parseStmt0() {
    const t = this.tok;
    if (t.t === 'id') {
      if (JS_UNSUP_WORDS.has(t.v)) throw new JsUnsup();
      switch (t.v) {
        case 'import': this.advance(); while (this.tok.t !== 'eof' && this.tok.t !== 'str') this.advance(); this.advance(); this.semi(); return null;
        case 'export': this.advance(); if (this.isId('default')) this.advance(); return this.parseStmt();
        case 'function': return this.parseFnDecl();
        case 'const': case 'let': case 'var': return this.parseVar();
        case 'return': { this.advance(); let e = null; if (!this.isOp(';') && !this.isOp('}') && this.tok.t !== 'eof' && !this.nl) e = this.parseExpr(); this.semi(); return { k: 'return', e }; }
        case 'break': this.advance(); this.semi(); return { k: 'break' };
        case 'continue': this.advance(); this.semi(); return { k: 'continue' };
        case 'while': { this.advance(); this.needOp('('); const c = this.parseExpr(); this.needOp(')'); return { k: 'while', c, body: this.parseStmt() }; }
        case 'for': {
          this.advance(); this.needOp('('); let init = null;
          if (!this.isOp(';')) {
            if (this.isId('const') || this.isId('let') || this.isId('var')) {
              const sv = this.save(), kind = this.tok.v; this.advance();
              let pat = null; try { pat = this.parsePattern(); } catch (e) { pat = null; }
              if (pat && this.isId('of')) { this.advance(); const it = this.parseExpr(); this.needOp(')'); return { k: 'forof', kind, pat, it, body: this.parseStmt() }; }
              this.restore(sv); init = this.parseVar(true);
            } else init = { k: 'expr', e: this.parseExpr() };
          }
          this.needOp(';'); const test = this.isOp(';') ? null : this.parseExpr(); this.needOp(';');
          const update = this.isOp(')') ? null : this.parseExpr(); this.needOp(')');
          return { k: 'for', init, test, update, body: this.parseStmt() };
        }
        case 'if': {
          this.advance(); this.needOp('('); const c = this.parseExpr(); this.needOp(')');
          const a = this.parseStmt(); let b = null;
          if (this.isId('else')) { this.advance(); b = this.parseStmt(); }
          return { k: 'if', c, a, b };
        }
        case 'switch': return this.parseSwitch();
        case 'class': return this.parseClassDecl();
        case 'async': {
          const sv = this.save(); this.advance();
          if (this.isId('function')) { const fnNode = this.parseFnDecl(); fnNode.isAsync = true; return fnNode; }
          this.restore(sv);
          break;
        }
      }
    }
    if (this.isOp('{')) return this.parseBlock();
    if (this.isOp(';')) { this.advance(); return null; }
    const e = this.parseExpr(); this.semi(); return { k: 'expr', e };
  }
  parseBlock() { this.needOp('{'); const body = []; while (!this.isOp('}')) { if (this.tok.t === 'eof') throw this.err('Unexpected end of file, a "}" is missing'); const st = this.parseStmt(); if (st) body.push(st); } this.advance(); return { k: 'block', body }; }
  parseFnDecl() {
    this.advance(); if (this.isOp('*')) throw new JsUnsup();
    if (this.tok.t !== 'id') throw this.err(); const name = this.tok.v; this.advance();
    const params = this.parseParams(); const body = this.parseBlock();
    return { k: 'fn', name, params, body };
  }
  parseSwitch() {
    this.advance(); this.needOp('('); const disc = this.parseExpr(); this.needOp(')'); this.needOp('{');
    const cases = [];
    while (!this.isOp('}')) {
      if (this.isId('case')) {
        this.advance(); const test = this.parseExpr(); this.needOp(':');
        const body = []; while (!this.isId('case') && !this.isId('default') && !this.isOp('}')) { const s = this.parseStmt(); if (s) body.push(s); }
        cases.push({ test, body });
      } else if (this.isId('default')) {
        this.advance(); this.needOp(':');
        const body = []; while (!this.isId('case') && !this.isId('default') && !this.isOp('}')) { const s = this.parseStmt(); if (s) body.push(s); }
        cases.push({ test: null, body });
      } else throw this.err();
    }
    this.advance();
    return { k: 'switch', disc, cases };
  }
  parseClassDecl() {
    this.advance(); if (this.tok.t !== 'id') throw this.err(); const name = this.tok.v; this.advance();
    let parent = null;
    if (this.isId('extends')) { this.advance(); if (this.tok.t !== 'id') throw this.err(); parent = { k: 'id', name: this.tok.v }; this.advance(); }
    this.needOp('{');
    const methods = [];
    while (!this.isOp('}')) {
      if (this.isOp(';')) { this.advance(); continue; }
      let isAsync = false;
      if (this.isId('async')) { const sv = this.save(); this.advance(); if (this.tok.t === 'id') isAsync = true; else this.restore(sv); }
      if (this.tok.t !== 'id') throw this.err();
      const mname = this.tok.v; this.advance();
      const params = this.parseParams();
      const body = this.parseBlock();
      methods.push({ name: mname, params, body, isAsync });
    }
    this.advance();
    return { k: 'class', name, parent, methods };
  }
  parseParams() {
    this.needOp('('); const ps = [];
    while (!this.isOp(')')) { if (this.isOp('...')) throw new JsUnsup(); ps.push(this.parsePattern()); if (!this.eatOp(',')) break; }
    this.needOp(')'); return ps;
  }
  parsePattern() {
    let pat;
    if (this.isOp('{')) {
      this.advance(); const props = [];
      while (!this.isOp('}')) {
        if (this.tok.t !== 'id') throw this.err(); const key = this.tok.v; this.advance();
        let target = { k: 'id', name: key, def: null };
        if (this.eatOp(':')) target = this.parsePattern();
        else if (this.eatOp('=')) target.def = this.parseAssign();
        props.push({ key, target });
        if (!this.eatOp(',')) break;
      }
      this.needOp('}'); return { k: 'obj', props };
    }
    if (this.isOp('[')) {
      this.advance(); const elems = [];
      while (!this.isOp(']')) { if (this.isOp(',')) { this.advance(); elems.push(null); continue; } elems.push(this.parsePattern()); if (!this.eatOp(',')) break; }
      this.needOp(']'); return { k: 'arr', elems };
    }
    if (this.tok.t !== 'id') throw this.err();
    pat = { k: 'id', name: this.tok.v, def: null }; this.advance();
    if (this.eatOp('=')) pat.def = this.parseAssign();
    return pat;
  }
  parseVar(noSemi) {
    const kind = this.tok.v; this.advance(); const decls = [];
    do { const pat = this.parsePattern(); let init = null; if (this.eatOp('=')) init = this.parseAssign(); decls.push({ pat, init }); } while (this.eatOp(','));
    if (!noSemi) this.semi(); return { k: 'var', kind, decls };
  }
  parseExpr() { return this.parseAssign(); }
  isArrowAhead() {
    const sv = this.save();
    try {
      if (this.tok.t === 'id') { this.advance(); return this.isOp('=>'); }
      if (this.isOp('(')) {
        let d = 0;
        do { if (this.isOp('(')) d++; else if (this.isOp(')')) d--; if (this.tok.t === 'eof') return false; this.advance(); } while (d > 0);
        return this.isOp('=>');
      }
      return false;
    } catch (e) { return false; } finally { this.restore(sv); }
  }
  parseArrow() {
    let params;
    if (this.tok.t === 'id') { params = [{ k: 'id', name: this.tok.v, def: null }]; this.advance(); } else params = this.parseParams();
    this.needOp('=>');
    if (this.isOp('{')) return { k: 'arrow', params, body: this.parseBlock(), exprBody: false };
    return { k: 'arrow', params, body: this.parseAssign(), exprBody: true };
  }
  parseAssign() {
    if (this.isId('async')) {
      const sv = this.save(); this.advance();
      if (this.isId('function')) {
        this.advance(); let name = null; if (this.tok.t === 'id') { name = this.tok.v; this.advance(); }
        const params = this.parseParams(); return { k: 'arrow', params, body: this.parseBlock(), exprBody: false, name, isAsync: true };
      }
      if ((this.tok.t === 'id' && this.isArrowAhead()) || (this.isOp('(') && this.isArrowAhead())) { const node = this.parseArrow(); node.isAsync = true; return node; }
      this.restore(sv);
    }
    if ((this.tok.t === 'id' && !JS_UNSUP_WORDS.has(this.tok.v) && this.tok.v !== 'function' && this.isArrowAhead()) || (this.isOp('(') && this.isArrowAhead())) return this.parseArrow();
    const left = this.parseCond();
    if (this.tok.t === 'op' && ['=', '+=', '-=', '*=', '/='].includes(this.tok.v)) {
      if (left.k !== 'id' && left.k !== 'member') throw this.err('Invalid left-hand side in assignment');
      const op = this.tok.v; this.advance(); return { k: 'assign', op, t: left, e: this.parseAssign() };
    }
    return left;
  }
  parseCond() {
    const c = this.parseBin(0);
    if (this.isOp('?')) { this.advance(); const a = this.parseAssign(); this.needOp(':'); const b = this.parseAssign(); return { k: 'cond', c, a, b }; }
    return c;
  }
  parseBin(min) {
    let l = this.parseUnary();
    for (;;) {
      const t = this.tok; if (t.t !== 'op') return l;
      const p = JS_PREC[t.v]; if (p === undefined || p <= min) return l;
      this.advance();
      const r = t.v === '**' ? this.parseBin(p - 1) : this.parseBin(p);
      l = { k: (t.v === '&&' || t.v === '||' || t.v === '??') ? 'logic' : 'bin', op: t.v, l, r };
    }
  }
  parseUnary() {
    const t = this.tok;
    if (t.t === 'op' && (t.v === '!' || t.v === '-' || t.v === '+')) { this.advance(); return { k: 'un', op: t.v, e: this.parseUnary() }; }
    if (t.t === 'id' && t.v === 'typeof') { this.advance(); return { k: 'un', op: 'typeof', e: this.parseUnary() }; }
    if (t.t === 'id' && t.v === 'await') { this.advance(); return { k: 'await', e: this.parseUnary() }; }
    if (t.t === 'op' && (t.v === '++' || t.v === '--')) {
      this.advance(); const target = this.parseUnary();
      if (target.k !== 'id' && target.k !== 'member') throw this.err('Invalid left-hand side expression in prefix operation');
      return { k: 'upd', op: t.v, prefix: true, t: target };
    }
    return this.parsePostfix();
  }
  parseArgs() {
    const args = [];
    while (!this.isOp(')')) {
      if (this.eatOp('...')) args.push({ spread: this.parseAssign() }); else args.push(this.parseAssign());
      if (!this.eatOp(',')) break;
    }
    this.needOp(')'); return args;
  }
  parsePostfix() {
    const e0 = this.parsePostfix0();
    if ((this.isOp('++') || this.isOp('--')) && !this.nl) {
      if (e0.k !== 'id' && e0.k !== 'member') throw this.err('Invalid left-hand side expression in postfix operation');
      const op = this.tok.v; this.advance(); return { k: 'upd', op, prefix: false, t: e0 };
    }
    return e0;
  }
  parseNewOrPrimary() {
    if (this.tok.t === 'id' && this.tok.v === 'new') {
      this.advance();
      if (this.tok.t !== 'id') throw this.err();
      let callee = { k: 'id', name: this.tok.v }; this.advance();
      while (this.isOp('.')) { this.advance(); if (this.tok.t !== 'id') throw this.err(); callee = { k: 'member', o: callee, p: this.tok.v, computed: false, opt: false }; this.advance(); }
      let args = [];
      if (this.isOp('(')) { this.advance(); args = this.parseArgs(); }
      return { k: 'new', callee, args };
    }
    return this.parsePrimary();
  }
  parsePostfix0() {
    let e = this.parseNewOrPrimary();
    for (;;) {
      if (this.isOp('.') || this.isOp('?.')) {
        const opt = this.tok.v === '?.'; this.advance();
        if (opt && this.isOp('(')) { this.advance(); e = { k: 'call', f: e, args: this.parseArgs(), opt: true }; continue; }
        if (opt && this.isOp('[')) { this.advance(); const p = this.parseExpr(); this.needOp(']'); e = { k: 'member', o: e, p, computed: true, opt: true }; continue; }
        if (this.tok.t !== 'id') throw this.err(); const name = this.tok.v; this.advance();
        e = { k: 'member', o: e, p: name, computed: false, opt };
      } else if (this.isOp('[')) { this.advance(); const p = this.parseExpr(); this.needOp(']'); e = { k: 'member', o: e, p, computed: true, opt: false }; }
      else if (this.isOp('(')) { this.advance(); e = { k: 'call', f: e, args: this.parseArgs(), opt: false }; }
      else return e;
    }
  }
  parsePrimary() {
    const t = this.tok;
    switch (t.t) {
      case 'num': this.advance(); return { k: 'lit', v: t.v };
      case 'str': this.advance(); return { k: 'lit', v: t.v };
      case 'tpl': this.advance(); return { k: 'tpl', parts: t.parts.map(p => typeof p === 'string' ? p : new JP(p.src).parseExprOnly()) };
      case 'id': {
        if (JS_UNSUP_WORDS.has(t.v)) throw new JsUnsup();
        if (t.v === 'function') {
          this.advance(); let name = null; if (this.tok.t === 'id') { name = this.tok.v; this.advance(); }
          const params = this.parseParams(); return { k: 'arrow', params, body: this.parseBlock(), exprBody: false, name };
        }
        this.advance();
        if (t.v === 'true') return { k: 'lit', v: true };
        if (t.v === 'false') return { k: 'lit', v: false };
        if (t.v === 'null') return { k: 'lit', v: null };
        if (t.v === 'undefined') return { k: 'lit', v: undefined };
        if (t.v === 'super') return { k: 'super' };
        return { k: 'id', name: t.v };
      }
      case 'op':
        if (t.v === '(') { this.advance(); const e = this.parseExpr(); this.needOp(')'); return e; }
        if (t.v === '[') {
          this.advance(); const els = [];
          while (!this.isOp(']')) { if (this.eatOp('...')) els.push({ spread: this.parseAssign() }); else els.push(this.parseAssign()); if (!this.eatOp(',')) break; }
          this.needOp(']'); return { k: 'arr', els };
        }
        if (t.v === '{') {
          this.advance(); const props = [];
          while (!this.isOp('}')) {
            if (this.eatOp('...')) { props.push({ spread: this.parseAssign() }); }
            else {
              let key, val;
              if (this.isOp('[')) { this.advance(); key = this.parseExpr(); this.needOp(']'); this.needOp(':'); props.push({ ck: key, v: this.parseAssign() }); if (!this.eatOp(',')) break; continue; }
              if (this.tok.t === 'id' || this.tok.t === 'str' || this.tok.t === 'num') { key = String(this.tok.v); const wasId = this.tok.t === 'id'; this.advance(); if (this.eatOp(':')) val = this.parseAssign(); else if (wasId) val = { k: 'id', name: key }; else throw this.err(); }
              else throw this.err();
              props.push({ key, v: val });
            }
            if (!this.eatOp(',')) break;
          }
          this.needOp('}'); return { k: 'obj', props };
        }
        if (t.v === '<') return this.parseJSXTop();
    }
    throw this.err(t.t === 'eof' ? 'Unexpected end of file' : undefined);
  }
  parseExprOnly() { const e = this.parseExpr(); if (this.tok.t !== 'eof') throw this.err(); return e; }

  /* ----- JSX (raw scanning) ----- */
  parseJSXTop() { const n = this.jsxElement(); this.advance(); return n; }
  ws() { while (/\s/.test(this.s[this.i] || '')) this.i++; }
  jsxName() { const m = /^[A-Za-z_][\w.\-:]*/.exec(this.s.slice(this.i)); if (!m) throw new JsErr('SyntaxError', 'Unexpected token in JSX, expected a tag name', this.line(this.i)); this.i += m[0].length; return m[0]; }
  jsxExprContainer() {
    this.i++; this.advance();
    if (this.isOp('}')) return { empty: true };
    let spread = false;
    if (this.isOp('...')) { spread = true; this.advance(); }
    const e = this.parseExpr();
    if (!this.isOp('}')) throw this.err('Expected "}" to close the JSX expression');
    return { e, spread };
  }
  jsxElement() {
    this.ws();
    let name = '';
    if (this.s[this.i] === '>') { this.i++; }
    else name = this.jsxName();
    const attrs = []; let selfClose = false;
    if (name) {
      for (;;) {
        this.ws();
        if (this.s.startsWith('/>', this.i)) { this.i += 2; selfClose = true; break; }
        if (this.s[this.i] === '>') { this.i++; break; }
        if (this.i >= this.s.length) throw new JsErr('SyntaxError', 'Unterminated JSX tag <' + name + '>', this.line(this.i));
        if (this.s[this.i] === '{') { const c = this.jsxExprContainer(); if (!c.spread) throw this.err('Spread attribute expected'); attrs.push({ spread: c.e }); continue; }
        const m = /^[A-Za-z_][\w\-:]*/.exec(this.s.slice(this.i));
        if (!m) throw new JsErr('SyntaxError', 'Unexpected token in JSX tag <' + name + '>', this.line(this.i));
        this.i += m[0].length; const an = m[0]; this.ws();
        if (this.s[this.i] === '=') {
          this.i++; this.ws(); const q = this.s[this.i];
          if (q === '"' || q === "'") { const j = this.s.indexOf(q, this.i + 1); if (j < 0) throw new JsErr('SyntaxError', 'Unterminated string constant', this.line(this.i)); attrs.push({ name: an, v: { k: 'lit', v: this.s.slice(this.i + 1, j) } }); this.i = j + 1; }
          else if (q === '{') { const c = this.jsxExprContainer(); attrs.push({ name: an, v: c.empty ? { k: 'lit', v: undefined } : c.e }); }
          else throw new JsErr('SyntaxError', 'JSX attribute values must be strings or {expressions}', this.line(this.i));
        } else attrs.push({ name: an, v: { k: 'lit', v: true } });
      }
    }
    const children = [];
    if (!selfClose) {
      for (;;) {
        if (this.i >= this.s.length) throw new JsErr('SyntaxError', 'Unterminated JSX contents: missing closing tag for <' + (name || '>') + '>', this.line(this.i));
        if (this.s.startsWith('</', this.i)) {
          this.i += 2; this.ws(); let cn = ''; if (this.s[this.i] !== '>') cn = this.jsxName(); this.ws();
          if (this.s[this.i] !== '>') throw new JsErr('SyntaxError', 'Expected ">" to close the tag', this.line(this.i));
          this.i++;
          if (cn !== name) throw new JsErr('SyntaxError', 'Expected corresponding JSX closing tag for <' + (name || '>') + '>', this.line(this.i));
          break;
        }
        if (this.s[this.i] === '{') { const c = this.jsxExprContainer(); if (!c.empty) children.push(c.e); this.i = this.i; continue; }
        if (this.s[this.i] === '<') { this.i++; children.push(this.jsxElement()); continue; }
        let j = this.i; while (j < this.s.length && this.s[j] !== '<' && this.s[j] !== '{') j++;
        const raw = this.s.slice(this.i, j); this.i = j;
        const text = jsxText(raw); if (text) children.push({ k: 'lit', v: text });
      }
    }
    return { k: 'jsx', tag: name, attrs, children };
  }
}
function jsxText(raw) {
  let t;
  if (!/\n/.test(raw)) t = raw;
  else {
    const lines = raw.split(/\r?\n/); const out = [];
    lines.forEach((ln, i) => {
      let x = ln.replace(/\t/g, ' ');
      if (i !== 0) x = x.replace(/^\s+/, '');
      if (i !== lines.length - 1) x = x.replace(/\s+$/, '');
      if (x) out.push(x);
    });
    t = out.join(' ');
  }
  return t.replace(/&(amp|lt|gt|quot|apos|nbsp|#39);/g, m => HTML_ENT[m] || m);
}

/* ----- interpreter ----- */
class Env {
  constructor(p) { this.v = Object.create(null); this.p = p; }
  get(n) { for (let e = this; e; e = e.p) if (n in e.v) return e.v[n]; throw new JsErr('ReferenceError', n + ' is not defined'); }
  set(n, val) { for (let e = this; e; e = e.p) if (n in e.v) { if (e.k && e.k.has(n)) throw new JsErr('TypeError', 'Assignment to constant variable.'); e.v[n] = val; return; } throw new JsErr('ReferenceError', n + ' is not defined'); }
  def(n, val) { this.v[n] = val; }
}
const SAFE_STR = new Set(['toUpperCase', 'toLowerCase', 'trim', 'split', 'slice', 'includes', 'startsWith', 'endsWith', 'indexOf', 'charAt', 'repeat', 'replace', 'padStart', 'padEnd', 'toString', 'concat', 'substring']);
const SAFE_ARR = new Set(['map', 'filter', 'join', 'slice', 'includes', 'indexOf', 'find', 'findIndex', 'some', 'every', 'reduce', 'concat', 'reverse', 'sort', 'push', 'pop', 'shift', 'unshift', 'flat', 'toString', 'at', 'forEach']);
const SAFE_NUM = new Set(['toFixed', 'toString', 'toLocaleString']);
function getProp(o, p) {
  if (o === null || o === undefined) throw new JsErr('TypeError', "Cannot read properties of " + o + " (reading '" + String(p) + "')");
  if (p === 'constructor' || p === '__proto__' || p === 'prototype') throw new JsErr('TypeError', 'That property is blocked in the preview');
  const t = typeof o;
  if (t === 'string') { if (p === 'length' || /^\d+$/.test(String(p))) return o[p]; return SAFE_STR.has(p) ? o[p] : undefined; }
  if (t === 'number') return SAFE_NUM.has(p) ? o[p] : undefined;
  if (t === 'boolean' || t === 'function' || t === 'symbol') return undefined;
  if (Array.isArray(o)) { if (p === 'length' || /^\d+$/.test(String(p))) return o[p]; return SAFE_ARR.has(p) ? o[p] : undefined; }
  return Object.prototype.hasOwnProperty.call(o, p) ? o[p] : undefined;
}
function setProp(o, p, val) {
  if (o === null || o === undefined) throw new JsErr('TypeError', "Cannot set properties of " + o + " (setting '" + String(p) + "')");
  if (p === '__proto__' || p === 'constructor' || p === 'prototype') throw new JsErr('TypeError', 'That property is blocked in the preview');
  if (Array.isArray(o) || (typeof o === 'object' && !o.$$v)) { o[p] = val; return; }
  throw new JsErr('TypeError', 'Cannot assign to this value');
}
function bindPat(pat, val, env, kind) {
  if (pat.k === 'id') { if (val === undefined && pat.def) val = ev(pat.def, env); env.def(pat.name, val); if (kind === 'const') (env.k || (env.k = new Set())).add(pat.name); return; }
  if (pat.k === 'obj') {
    if (val === null || val === undefined) throw new JsErr('TypeError', 'Cannot destructure ' + val);
    for (const pr of pat.props) bindPat(pr.target, getProp(val, pr.key), env, kind); return;
  }
  if (pat.k === 'arr') {
    if (!Array.isArray(val)) throw new JsErr('TypeError', 'Cannot destructure a value that is not an array');
    pat.elems.forEach((el, i) => { if (el) bindPat(el, val[i], env, kind); });
  }
}
function hoist(list, env) { for (const st of list) if (st && st.k === 'fn') env.def(st.name, makeFn(st, env)); }
function execList(list, env) {
  hoist(list, env);
  for (const st of list) { const r = execStmt(st, env); if (r) return r; }
}
let JCUR = 0, JSTEPS = 0; const JLIMIT = 300000;
function jstep() { if (++JSTEPS > JLIMIT) throw new JsErr('Error', 'Execution stopped: too many steps. Is there an infinite loop?'); }
function execStmt(st, env) {
  if (st.ln) JCUR = st.ln;
  switch (st.k) {
    case 'expr': ev(st.e, env); return;
    case 'var': for (const d of st.decls) bindPat(d.pat, d.init ? ev(d.init, env) : undefined, env, st.kind); return;
    case 'break': return { brk: true };
    case 'continue': return { cont: true };
    case 'while': { while (jsTruthy(ev(st.c, env))) { jstep(); const r = execStmt(st.body, env); if (r) { if (r.brk) break; if (r.cont) continue; return r; } } return; }
    case 'for': {
      const le = new Env(env); if (st.init) execStmt(st.init, le);
      for (;;) {
        if (st.test && !jsTruthy(ev(st.test, le))) break;
        jstep();
        const r = execStmt(st.body, le);
        if (r) { if (r.brk) break; if (!r.cont) return r; }
        if (st.update) ev(st.update, le);
      }
      return;
    }
    case 'forof': {
      const it = ev(st.it, env);
      if (!Array.isArray(it) && typeof it !== 'string') throw new JsErr('TypeError', jsInspect(it) + ' is not iterable');
      for (const x of Array.from(it)) {
        jstep(); const e = new Env(env); bindPat(st.pat, x, e, st.kind);
        const r = execStmt(st.body, e);
        if (r) { if (r.brk) break; if (r.cont) continue; return r; }
      }
      return;
    }
    case 'fn': return;
    case 'return': return { r: st.e ? ev(st.e, env) : undefined };
    case 'if': if (jsTruthy(ev(st.c, env))) return execStmt(st.a, env); else if (st.b) return execStmt(st.b, env); return;
    case 'block': return execList(st.body, new Env(env));
    case 'switch': {
      const d = ev(st.disc, env);
      let idx = -1;
      for (let i = 0; i < st.cases.length; i++) { const cs = st.cases[i]; if (cs.test !== null && ev(cs.test, env) === d) { idx = i; break; } }
      if (idx < 0) idx = st.cases.findIndex((cs) => cs.test === null);
      if (idx < 0) return;
      const e = new Env(env);
      for (let i = idx; i < st.cases.length; i++) {
        for (const s of st.cases[i].body) {
          const r = execStmt(s, e);
          if (r) { if (r.brk) return; return r; }
        }
      }
      return;
    }
    case 'class': {
      const parent = st.parent ? ev(st.parent, env) : null;
      if (st.parent && (!parent || !parent.$$class)) throw new JsErr('TypeError', 'Class extends value ' + (st.parent.k === 'id' ? st.parent.name : '') + ' is not a constructor or null');
      const cls = { $$class: true, name: st.name, parent, ctor: null, methods: new Map() };
      const classEnv = new Env(env); classEnv.def('__class__', cls);
      for (const m of st.methods) {
        const fn = makeFn({ params: m.params, body: m.body, exprBody: false, name: m.name, isAsync: m.isAsync }, classEnv);
        if (m.name === 'constructor') cls.ctor = fn; else cls.methods.set(m.name, fn);
      }
      env.def(st.name, cls);
      return;
    }
  }
}
const jsTruthy = v => !!v;
function mkPromise(state, value) {
  const p = { $$promise: true, state, value };
  p.then = function (onOk, onErr) {
    try {
      if (state === 'fulfilled') { const r = onOk ? onOk(value) : value; return (r && r.$$promise) ? r : mkPromise('fulfilled', r); }
      if (onErr) { const r = onErr(value); return (r && r.$$promise) ? r : mkPromise('fulfilled', r); }
      return p;
    } catch (e) { return mkPromise('rejected', e); }
  };
  p.catch = function (onErr) { return p.then(null, onErr); };
  p.finally = function (fn) { try { fn(); } catch (e) { /* ignore */ } return p; };
  return p;
}
function instantiateClass(cls, args) {
  const inst = {};
  const chain = []; for (let c = cls; c; c = c.parent) chain.unshift(c);
  for (const c of chain) for (const [name, fn] of c.methods) { inst[name] = function (...a) { return fn.apply(inst, a); }; }
  if (cls.ctor) cls.ctor.apply(inst, args);
  else { let c = cls.parent; while (c && !c.ctor) c = c.parent; if (c && c.ctor) c.ctor.apply(inst, args); }
  return inst;
}
function makeFn(node, env) {
  const f = function (...args) {
    jstep();
    const e = new Env(env);
    e.def('this', this);
    node.params.forEach((p, i) => bindPat(p, args[i], e));
    if (!node.isAsync) {
      if (node.exprBody) return ev(node.body, e);
      const r = execList(node.body.body, e); return r ? r.r : undefined;
    }
    try {
      let result;
      if (node.exprBody) result = ev(node.body, e);
      else { const r = execList(node.body.body, e); result = r ? r.r : undefined; }
      return (result && result.$$promise) ? result : mkPromise('fulfilled', result);
    } catch (err) {
      return mkPromise('rejected', err);
    }
  };
  f.$name = node.name || '';
  return f;
}
function evArgs(args, env) { const out = []; for (const a of args) { if (a && a.spread) out.push(...ev(a.spread, env)); else out.push(ev(a, env)); } return out; }
function ev(n, env) {
  switch (n.k) {
    case 'lit': return n.v;
    case 'tpl': return n.parts.map(p => typeof p === 'string' ? p : String(ev(p, env))).join('');
    case 'id': return env.get(n.name);
    case 'arr': { const out = []; for (const e of n.els) { if (e && e.spread) out.push(...ev(e.spread, env)); else out.push(ev(e, env)); } return out; }
    case 'obj': {
      const o = {};
      for (const p of n.props) {
        if (p.spread) Object.assign(o, ev(p.spread, env));
        else if (p.ck) o[String(ev(p.ck, env))] = ev(p.v, env);
        else { if (p.key === '__proto__' || p.key === 'constructor') continue; o[p.key] = ev(p.v, env); }
      }
      return o;
    }
    case 'un': {
      if (n.op === 'typeof') { try { return typeof ev(n.e, env); } catch (e) { if (e instanceof JsErr && e.jsType === 'ReferenceError') return 'undefined'; throw e; } }
      const v = ev(n.e, env); return n.op === '!' ? !v : n.op === '-' ? -v : +v;
    }
    case 'bin': {
      const a = ev(n.l, env), b = ev(n.r, env);
      switch (n.op) {
        case '+': return a + b; case '-': return a - b; case '*': return a * b; case '/': return a / b; case '%': return a % b; case '**': return Math.pow(a, b);
        case '==': return a == b; case '!=': return a != b; case '===': return a === b; case '!==': return a !== b;
        case '<': return a < b; case '>': return a > b; case '<=': return a <= b; case '>=': return a >= b;
      }
      return undefined;
    }
    case 'logic': { const a = ev(n.l, env); if (n.op === '&&') return a ? ev(n.r, env) : a; if (n.op === '||') return a ? a : ev(n.r, env); return (a === null || a === undefined) ? ev(n.r, env) : a; }
    case 'cond': return ev(n.c, env) ? ev(n.a, env) : ev(n.b, env);
    case 'member': { const o = ev(n.o, env); if (n.opt && (o === null || o === undefined)) return undefined; return getProp(o, n.computed ? ev(n.p, env) : n.p); }
    case 'call': {
      if (n.f.k === 'super') {
        const cls = env.get('__class__'); const parentCls = cls.parent;
        if (!parentCls) throw new JsErr('SyntaxError', "'super' keyword is only valid inside a derived class constructor");
        const self = env.get('this'); const args = evArgs(n.args, env);
        let c = parentCls; while (c && !c.ctor) c = c.parent;
        if (c && c.ctor) c.ctor.apply(self, args);
        return undefined;
      }
      if (n.f.k === 'member' && n.f.o.k === 'super') {
        const cls = env.get('__class__'); const parentCls = cls.parent;
        if (!parentCls) throw new JsErr('SyntaxError', "'super' keyword is only valid inside a class");
        const key = n.f.computed ? ev(n.f.p, env) : n.f.p;
        let c = parentCls, mfn = null; while (c) { if (c.methods.has(key)) { mfn = c.methods.get(key); break; } c = c.parent; }
        if (!mfn) throw new JsErr('TypeError', '(intermediate value).' + key + ' is not a function');
        const self = env.get('this');
        return mfn.apply(self, evArgs(n.args, env));
      }
      let fn, self;
      if (n.f.k === 'member') {
        self = ev(n.f.o, env);
        if (n.f.opt && (self === null || self === undefined)) return undefined;
        const key = n.f.computed ? ev(n.f.p, env) : n.f.p;
        fn = getProp(self, key);
        if (typeof fn !== 'function') { if (n.opt && (fn === null || fn === undefined)) return undefined; throw new JsErr('TypeError', jsDesc(n.f) + ' is not a function'); }
      } else {
        fn = ev(n.f, env);
        if (typeof fn !== 'function') { if (n.opt && (fn === null || fn === undefined)) return undefined; throw new JsErr('TypeError', jsDesc(n.f) + ' is not a function'); }
      }
      return fn.apply(self, evArgs(n.args, env));
    }
    case 'arrow': return makeFn(n, env);
    case 'assign': {
      const val = ev(n.e, env), tg = n.t;
      let obj, key, cur;
      if (tg.k === 'id') cur = n.op === '=' ? undefined : env.get(tg.name);
      else { obj = ev(tg.o, env); key = tg.computed ? ev(tg.p, env) : tg.p; cur = n.op === '=' ? undefined : getProp(obj, key); }
      const nv = n.op === '=' ? val : n.op === '+=' ? cur + val : n.op === '-=' ? cur - val : n.op === '*=' ? cur * val : cur / val;
      if (tg.k === 'id') env.set(tg.name, nv); else setProp(obj, key, nv);
      return nv;
    }
    case 'upd': {
      const tg = n.t; let obj, key, cur;
      if (tg.k === 'id') cur = env.get(tg.name); else { obj = ev(tg.o, env); key = tg.computed ? ev(tg.p, env) : tg.p; cur = getProp(obj, key); }
      const oldN = Number(cur), nv = n.op === '++' ? oldN + 1 : oldN - 1;
      if (tg.k === 'id') env.set(tg.name, nv); else setProp(obj, key, nv);
      return n.prefix ? nv : oldN;
    }
    case 'new': {
      const cls = ev(n.callee, env);
      if (!cls || !cls.$$class) throw new JsErr('TypeError', (n.callee.k === 'id' ? n.callee.name : 'value') + ' is not a constructor');
      return instantiateClass(cls, evArgs(n.args, env));
    }
    case 'super': throw new JsErr('SyntaxError', "'super' keyword is only valid inside a class");
    case 'await': {
      const v = ev(n.e, env);
      if (v && v.$$promise) { if (v.state === 'rejected') throw (v.value instanceof JsErr ? v.value : new JsErr('Error', jsFmt(v.value))); return v.value; }
      return v;
    }
    case 'jsx': {
      const props = {}; let key;
      for (const a of n.attrs) {
        if (a.spread) { Object.assign(props, ev(a.spread, env)); continue; }
        const v = ev(a.v, env); if (a.name === 'key') key = v; else props[a.name] = v;
      }
      const children = []; for (const c of n.children) children.push(ev(c, env));
      let type;
      if (n.tag === '') type = 'FRAGMENT';
      else if (/^[a-z]/.test(n.tag) && !n.tag.includes('.')) type = n.tag;
      else { const parts = n.tag.split('.'); type = env.get(parts[0]); for (let i = 1; i < parts.length; i++) type = getProp(type, parts[i]); if (typeof type !== 'function') throw new JsErr('TypeError', 'Element type is invalid: <' + n.tag + '> is not a component'); }
      return { $$v: 1, type, props, children, key };
    }
  }
  throw new JsErr('SyntaxError', 'This syntax is not supported in the preview');
}
function jsDesc(f) { if (f.k === 'id') return f.name; if (f.k === 'member') return jsDesc(f.o) + '.' + (f.computed ? '[...]' : f.p); return 'expression'; }

/* ----- runtime: hooks, rendering, events ----- */
const HOST_TAGS = new Set(['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'button', 'input', 'label', 'form', 'a', 'strong', 'em', 'small', 'section', 'header', 'footer', 'nav', 'main', 'article', 'aside', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'br', 'hr', 'textarea', 'select', 'option', 'pre', 'code', 'b', 'i', 'blockquote']);
const UNITLESS = new Set(['opacity', 'zIndex', 'flex', 'flexGrow', 'flexShrink', 'fontWeight', 'lineHeight', 'order']);
const EVT = { onClick: 'click', onInput: 'input', onSubmit: 'submit', onKeyDown: 'keydown', onKeyUp: 'keyup', onFocus: 'focus', onBlur: 'blur', onMouseEnter: 'mouseenter', onMouseLeave: 'mouseleave' };
function jsFmt(v) {
  if (typeof v === 'string') return v;
  if (v === undefined) return 'undefined';
  try { return JSON.stringify(v, (k, x) => typeof x === 'function' ? '[Function]' : x); } catch (e) { return String(v); }
}
class RT {
  constructor(App) {
    this.App = App; this.host = document.createElement('div'); this.host.className = 'react-out';
    this.state = new Map(); this.setters = new Map(); this.deps = new Map(); this.cur = null; this.effects = [];
    this.logs = []; this.logEl = null; this.renders = 0; this.dirty = false; this.rendering = 0; this.failed = false;
  }
  log(args) { const line = args.map(jsFmt).join(' '); this.logs.push(line); if (this.logEl) { this.logEl.hidden = false; this.logEl.textContent = this.logs.join('\n'); } }
  useState(init) {
    if (!this.cur) throw new JsErr('Error', 'Hooks can only be called inside a component');
    const key = this.cur.path + '#' + (this.cur.idx++);
    if (!this.state.has(key)) this.state.set(key, typeof init === 'function' ? init() : init);
    if (!this.setters.has(key)) {
      this.setters.set(key, (v) => {
        const old = this.state.get(key); const nv = typeof v === 'function' ? v(old) : v;
        if (Object.is(old, nv)) return;
        if (this.rendering) throw new JsErr('Error', 'Too many re-renders. React limits the number of renders to prevent an infinite loop.');
        this.state.set(key, nv); this.dirty = true;
        if (!this.inEvent) Promise.resolve().then(() => this.flush());
      });
    }
    return [this.state.get(key), this.setters.get(key)];
  }
  useEffect(fn, deps) {
    if (!this.cur) throw new JsErr('Error', 'Hooks can only be called inside a component');
    const key = this.cur.path + '#' + (this.cur.idx++);
    const prev = this.deps.get(key);
    const run = deps === undefined || !prev || deps.length !== prev.length || deps.some((d, i) => !Object.is(d, prev[i]));
    this.deps.set(key, deps);
    if (run) this.effects.push(() => { fn(); });
  }
  mount() { this.renders = 0; this.render(); return this.error; }
  flush() {
    if (!this.dirty || this.failed) return;
    this.dirty = false; this.renders++;
    if (this.renders > 80) { this.showError(new JsErr('Error', 'Too many re-renders. React limits the number of renders to prevent an infinite loop.')); return; }
    this.render();
  }
  showError(e) { this.failed = true; this.error = e; this.host.textContent = ''; const pre = document.createElement('pre'); pre.className = 'out-err'; pre.textContent = jsErrText(e); this.host.appendChild(pre); }
  render() {
    const a = document.activeElement; let focus = null;
    if (a && this.host.contains(a) && a.dataset && a.dataset.rp) focus = { rp: a.dataset.rp, s: a.selectionStart, e: a.selectionEnd };
    this.host.textContent = ''; this.effects = []; this.error = null;
    try { this.build({ $$v: 1, type: this.App, props: {}, children: [] }, 'r', this.host); }
    catch (e) { this.cur = null; this.rendering = 0; this.showError(e); return; }
    if (focus) {
      const el = [...this.host.querySelectorAll('[data-rp]')].find(x => x.dataset.rp === focus.rp);
      if (el) { el.focus(); try { if (typeof focus.s === 'number') el.setSelectionRange(focus.s, focus.e); } catch (x) { /* not a text input */ } }
    }
    const fx = this.effects; this.effects = [];
    try { fx.forEach(f => f()); } catch (e) { this.showError(e); }
  }
  build(v, path, parent) {
    if (v === null || v === undefined || v === true || v === false) return;
    if (typeof v === 'string' || typeof v === 'number') { parent.appendChild(document.createTextNode(String(v))); return; }
    if (Array.isArray(v)) { v.forEach((c, i) => this.build(c, path + '/' + ((c && c.$$v && c.key !== undefined && c.key !== null) ? 'k' + c.key : i), parent)); return; }
    if (typeof v === 'function' || !v.$$v) throw new JsErr('Error', 'Objects are not valid as a React child. Convert it to text first.');
    const t = v.type;
    if (t === 'FRAGMENT') { this.build(v.children, path, parent); return; }
    if (typeof t === 'function') {
      const prev = this.cur; this.cur = { path, idx: 0 }; this.rendering++; let out;
      try { out = t(Object.assign({}, v.props, { children: v.children.length <= 1 ? v.children[0] : v.children })); }
      finally { this.rendering--; this.cur = prev; }
      this.build(out, path + '/c', parent); return;
    }
    if (!HOST_TAGS.has(t)) throw new JsErr('Error', '<' + t + '> is not supported in this preview');
    const el = document.createElement(t); el.dataset.rp = path;
    let valueProp; let hasValue = false;
    for (const k of Object.keys(v.props)) {
      const val = v.props[k];
      if (k === 'children' || k === 'key' || k === 'dangerouslySetInnerHTML') continue;
      if (k === 'className') { if (val) el.setAttribute('class', String(val)); }
      else if (k === 'htmlFor') el.setAttribute('for', String(val));
      else if (k === 'style') { if (val && typeof val === 'object') for (const sp of Object.keys(val)) { const x = val[sp]; el.style.setProperty(sp.replace(/[A-Z]/g, m => '-' + m.toLowerCase()), typeof x === 'number' && !UNITLESS.has(sp) ? x + 'px' : String(x)); } }
      else if (k === 'value' || k === 'defaultValue') { hasValue = true; valueProp = val; }
      else if (k === 'checked') el.checked = !!val;
      else if (k === 'onChange') this.listen(el, (t === 'select' || (t === 'input' && /^(checkbox|radio)$/.test(v.props.type || ''))) ? 'change' : 'input', val);
      else if (EVT[k]) this.listen(el, EVT[k], val);
      else if (k === 'href') { el.setAttribute('href', '#'); el.addEventListener('click', e => e.preventDefault()); }
      else if (['disabled', 'readOnly', 'selected', 'multiple', 'required'].includes(k)) { if (val) el.setAttribute(k.toLowerCase(), ''); }
      else if (['placeholder', 'type', 'id', 'name', 'title', 'rows', 'cols', 'min', 'max', 'step', 'maxLength', 'role', 'colSpan'].includes(k) || /^(data|aria)-/.test(k)) el.setAttribute(k === 'maxLength' ? 'maxlength' : k === 'colSpan' ? 'colspan' : k, String(val));
    }
    this.build(v.children, path, el);
    if (hasValue) el.value = valueProp === undefined || valueProp === null ? '' : String(valueProp);
    parent.appendChild(el);
  }
  listen(el, evt, fn) {
    if (typeof fn !== 'function') return;
    el.addEventListener(evt, (e) => {
      if (evt === 'submit') e.preventDefault();
      const syn = { type: evt, key: e.key, target: { value: el.value, checked: el.checked, name: el.name, id: el.id }, preventDefault() {}, stopPropagation() {} };
      syn.currentTarget = syn.target;
      this.inEvent = true; this.renders = 0; JSTEPS = 0;
      try { fn(syn); } catch (err) { this.inEvent = false; this.showError(err); return; }
      this.inEvent = false; this.flush();
    });
  }
}
function jsErrText(e) {
  if (e instanceof JsErr) return e.jsType + ': ' + e.message + (e.line ? ' (line ' + e.line + ')' : '');
  if (e instanceof RangeError) return 'RangeError: Maximum call stack size exceeded';
  return 'Error: something went wrong while rendering';
}
function queryIn(list, sel) {
  const matches = (el) => {
    if (sel.startsWith('#')) return el.id === sel.slice(1);
    if (sel.startsWith('.')) return (el.className || '').split(' ').filter(Boolean).includes(sel.slice(1));
    return (el.tagName || '').toLowerCase() === sel.toLowerCase();
  };
  for (const el of list) {
    if (matches(el)) return el;
    const found = queryIn(el.children || [], sel);
    if (found) return found;
  }
  return null;
}
function mkEl(tag, attrs) {
  const el = {
    tagName: tag.toUpperCase(), id: attrs.id || '', className: attrs.className || '',
    textContent: attrs.textContent || '', value: attrs.value !== undefined ? attrs.value : '',
    style: {}, children: [], _listeners: {},
  };
  el.classList = {
    add: function (c) { if (!el.className.split(' ').filter(Boolean).includes(c)) el.className = (el.className + ' ' + c).trim(); },
    remove: function (c) { el.className = el.className.split(' ').filter((x) => x && x !== c).join(' '); },
    contains: function (c) { return el.className.split(' ').filter(Boolean).includes(c); },
    toggle: function (c) { if (el.classList.contains(c)) el.classList.remove(c); else el.classList.add(c); },
  };
  el.addEventListener = function (type, handler) { (el._listeners[type] = el._listeners[type] || []).push(handler); };
  el.removeEventListener = function (type, handler) { if (el._listeners[type]) el._listeners[type] = el._listeners[type].filter((h) => h !== handler); };
  el.click = function () { for (const h of (el._listeners.click || [])) h({ type: 'click', target: el }); };
  el.appendChild = function (child) { el.children.push(child); return child; };
  el.querySelector = function (sel) { return queryIn(el.children, sel); };
  return el;
}
function makeSeedDocument() {
  const heading = mkEl('h1', { id: 'title', textContent: 'Hello, DOM!' });
  const button = mkEl('button', { id: 'toggle-btn', textContent: 'Click me' });
  const count = mkEl('p', { id: 'count', textContent: '0' });
  const item1 = mkEl('li', { className: 'item', textContent: 'Milk' });
  const item2 = mkEl('li', { className: 'item', textContent: 'Eggs' });
  const list = mkEl('ul', { id: 'list' }); list.children = [item1, item2];
  const root = mkEl('div', { id: 'app' }); root.children = [heading, button, count, list];
  const all = [heading, button, count, list, item1, item2];
  return {
    querySelector: function (sel) { return queryIn([root, ...all], sel); },
    querySelectorAll: function (sel) { const out = []; const scan = (list) => { for (const el of list) { const matches = sel.startsWith('.') ? (el.className || '').split(' ').filter(Boolean).includes(sel.slice(1)) : (el.tagName || '').toLowerCase() === sel.replace('.', '').toLowerCase(); if (matches) out.push(el); scan(el.children || []); } }; scan([root]); return out; },
    getElementById: function (id) { return all.find((e) => e.id === id) || (root.id === id ? root : undefined) || null; },
    createElement: function (tag) { return mkEl(tag, {}); },
  };
}
const MOCK_FETCH_DATA = {
  '/api/weather': { city: 'Paris', tempC: 18, condition: 'Cloudy' },
  '/api/todos': [{ id: 1, text: 'Learn JavaScript', done: true }, { id: 2, text: 'Build a project', done: false }],
};
function makeMockResponse(url) {
  const data = MOCK_FETCH_DATA[url];
  return { ok: data !== undefined, status: data !== undefined ? 200 : 404, json: function () { return mkPromise('fulfilled', data !== undefined ? data : null); } };
}
function makeGlobals(rtBox) {
  const g = new Env(null);
  g.def('useState', (init) => rtBox.rt.useState(init));
  g.def('useEffect', (fn, deps) => rtBox.rt.useEffect(fn, deps));
  g.def('console', { log: (...a) => { rtBox.rt && rtBox.rt.log(a); }, warn: (...a) => { rtBox.rt && rtBox.rt.log(a); }, error: (...a) => { rtBox.rt && rtBox.rt.log(a); } });
  g.def('Math', { floor: Math.floor, ceil: Math.ceil, round: Math.round, max: Math.max, min: Math.min, abs: Math.abs, random: Math.random, PI: Math.PI, sqrt: Math.sqrt, pow: Math.pow, trunc: Math.trunc, sign: Math.sign, log2: Math.log2 });
  g.def('isNaN', (x) => Number.isNaN(Number(x)));
  g.def('Number', (x) => Number(x)); g.def('String', (x) => String(x)); g.def('Boolean', (x) => Boolean(x));
  g.def('parseInt', (x, r) => parseInt(x, r)); g.def('parseFloat', (x) => parseFloat(x));
  g.def('Array', { isArray: (x) => Array.isArray(x) });
  g.def('Object', { keys: (o) => Object.keys(o), values: (o) => Object.values(o), entries: (o) => Object.entries(o) });
  g.def('JSON', { stringify: (x) => JSON.stringify(x), parse: (x) => JSON.parse(x) });
  g.def('NaN', NaN); g.def('Infinity', Infinity);
  g.def('Promise', { resolve: (v) => (v && v.$$promise) ? v : mkPromise('fulfilled', v), reject: (v) => mkPromise('rejected', v) });
  g.def('fetch', (url) => mkPromise('fulfilled', makeMockResponse(String(url))));
  g.def('document', makeSeedDocument());
  g.def('React', { useState: (i) => rtBox.rt.useState(i), useEffect: (f, d) => rtBox.rt.useEffect(f, d), Fragment: 'FRAGMENT' });
  g.def('Fragment', 'FRAGMENT');
  return g;
}
function runJSX(code) {
  let prog;
  try { prog = new JP(String(code)).parseProgram(); }
  catch (e) {
    if (e instanceof JsUnsup) return { unsupported: true };
    if (e instanceof JsErr) return { error: jsErrText(e) };
    return { error: 'SyntaxError: the preview could not read this code' };
  }
  const box = { rt: null }; const genv = makeGlobals(box); JSTEPS = 0;
  try { execList(prog, genv); }
  catch (e) { if (e instanceof JsUnsup) return { unsupported: true }; return { error: jsErrText(e) }; }
  let App; try { App = genv.get('App'); } catch (e) { return { error: 'ReferenceError: App is not defined. Name your main component App so the preview knows where to start.' }; }
  if (typeof App !== 'function') return { error: 'TypeError: App must be a component function.' };
  const rt = new RT(App); box.rt = rt; rt.mount();
  return { host: rt.host, rt, error: rt.error ? jsErrText(rt.error) : null };
}
function jsxApi(res) {
  const host = res.host;
  return {
    host,
    text: () => host.textContent.replace(/\s+/g, ' ').trim(),
    click: (sel, n = 1) => { for (let i = 0; i < n; i++) { const el = host.querySelector(sel); if (el) el.click(); } },
    type: (sel, val) => { const el = host.querySelector(sel); if (el) { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); } },
    count: (sel) => host.querySelectorAll(sel).length,
    html: () => host.innerHTML
  };
}

function jsInspect(v, top) {
  if (typeof v === 'string') return top ? v : "'" + v.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
  if (v === undefined) return 'undefined';
  if (v === null) return 'null';
  if (typeof v === 'function') return '[Function' + (v.$name ? ': ' + v.$name : ' (anonymous)') + ']';
  if (Array.isArray(v)) return v.length ? '[ ' + v.map(x => jsInspect(x)).join(', ') + ' ]' : '[]';
  if (typeof v === 'object') {
    if (v.$$v) return '[React element]';
    const ks = Object.keys(v);
    return ks.length ? '{ ' + ks.map(k => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : "'" + k + "'") + ': ' + jsInspect(v[k])).join(', ') + ' }' : '{}';
  }
  if (typeof v === 'number') return Object.is(v, -0) ? '-0' : String(v);
  return String(v);
}
function runJS(code) {
  let prog;
  try { prog = new JP(String(code)).parseProgram(); }
  catch (e) {
    if (e instanceof JsUnsup) return { unsupported: true };
    if (e instanceof JsErr) return { out: '', error: jsErrText(e) };
    return { out: '', error: 'SyntaxError: the preview could not read this code' };
  }
  const lines = [];
  const box = { rt: { log: a => lines.push(a.map(x => jsInspect(x, true)).join(' ')) } };
  const genv = makeGlobals(box);
  ['useState', 'useEffect', 'React', 'Fragment'].forEach(n => { delete genv.v[n]; });
  const outText = () => lines.length ? lines.join('\n') + '\n' : '';
  JSTEPS = 0; JCUR = 0;
  try { execList(prog, genv); }
  catch (e) {
    if (e instanceof JsUnsup) return { unsupported: true };
    if (e instanceof JsErr && !e.line) e.line = JCUR;
    return { out: outText(), error: jsErrText(e) };
  }
  return { out: outText(), error: null, call: (name, ...args) => { JSTEPS = 0; const f = genv.get(name); if (typeof f !== 'function') throw new JsErr('TypeError', name + ' is not a function'); return f(...args); } };
}


/* ---------- Mini Git simulator (prototype only) ---------- */
function gitHash(seed) {
  let h1 = 0x811c9dc5, h2 = 0x12345678, out = '';
  for (let r = 0; r < 5; r++) {
    for (let i = 0; i < seed.length; i++) {
      h1 ^= seed.charCodeAt(i) + r; h1 = Math.imul(h1, 16777619) >>> 0;
      h2 = (Math.imul(h2 ^ seed.charCodeAt(i), 2246822519) + r) >>> 0;
    }
    out += ((h1 ^ h2) >>> 0).toString(16).padStart(8, '0');
  }
  return out.slice(0, 40);
}
function shellSplit(line) {
  const toks = []; let cur = '', has = false, i = 0;
  while (i < line.length) {
    const c = line[i];
    if (c === ' ' || c === '\t') { if (has) { toks.push(cur); cur = ''; has = false; } i++; continue; }
    if (c === '"' || c === "'") {
      let j = i + 1; while (j < line.length && line[j] !== c) j++;
      if (j >= line.length) return null;
      cur += line.slice(i + 1, j); has = true; i = j + 1; continue;
    }
    if (c === '>') {
      if (has) { toks.push(cur); cur = ''; has = false; }
      if (line[i + 1] === '>') { toks.push('>>'); i += 2; } else { toks.push('>'); i++; }
      continue;
    }
    cur += c; has = true; i++;
  }
  if (has) toks.push(cur);
  return toks;
}
function gLineDiff(a, b) {
  const A = a ? a.split('\n') : [], B = b ? b.split('\n') : [];
  if (a && a.endsWith('\n')) A.pop();
  if (b && b.endsWith('\n')) B.pop();
  const cnt = new Map(); for (const l of A) cnt.set(l, (cnt.get(l) || 0) + 1);
  let ins = 0; for (const l of B) { if (cnt.get(l) > 0) cnt.set(l, cnt.get(l) - 1); else ins++; }
  let del = 0; for (const v of cnt.values()) del += v;
  return { ins, del };
}
function gStat(ta, tb) {
  const names = [...new Set([...Object.keys(ta), ...Object.keys(tb)])].sort(); const files = []; let ins = 0, del = 0;
  for (const n of names) {
    if (ta[n] === tb[n]) continue;
    const d = gLineDiff(ta[n], tb[n]); files.push({ name: n, ins: d.ins, del: d.del, created: !(n in ta), deleted: !(n in tb) }); ins += d.ins; del += d.del;
  }
  return { files, ins, del };
}
const gPlural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
function gSummary(st) {
  let s = ' ' + gPlural(st.files.length, 'file') + ' changed';
  if (st.ins) s += ', ' + gPlural(st.ins, 'insertion') + '(+)';
  if (st.del) s += ', ' + gPlural(st.del, 'deletion') + '(-)';
  return s;
}
function gDiffstat(st) {
  const w = Math.max(...st.files.map(f => f.name.length));
  return st.files.map(f => ' ' + f.name.padEnd(w) + ' | ' + (f.ins + f.del) + ' ' + '+'.repeat(Math.min(f.ins, 30)) + '-'.repeat(Math.min(f.del, 30))).join('\n') + '\n' + gSummary(st);
}
const G_UNSUP = new Set(['diff', 'push', 'pull', 'clone', 'remote', 'stash', 'rebase', 'reset', 'tag', 'fetch', 'show', 'rm', 'mv', 'revert', 'cherry-pick', 'blame', 'reflog', 'bisect', 'clean', 'submodule']);
const G_KNOWN = new Set(['init', 'status', 'add', 'commit', 'log', 'branch', 'switch', 'checkout', 'merge', 'restore', 'config', 'help', 'version']);

function runGit(script) {
  const R = { inited: false, wt: {}, idx: {}, commits: {}, order: [], branches: {}, head: 'main', merging: null, conflicts: [], clock: 0 };
  const transcript = [];
  const tree = id => (id ? R.commits[id].tree : {});
  const headId = () => R.branches[R.head] || null;
  const short = id => id.slice(0, 7);
  const ancestors = (id) => { const seen = new Set(); const st = [id]; while (st.length) { const x = st.pop(); if (!x || seen.has(x)) continue; seen.add(x); R.commits[x].parents.forEach(p => st.push(p)); } return seen; };
  const fatalRepo = 'fatal: not a git repository (or any of the parent directories): .git';
  const dateOf = (t) => {
    const d = new Date(Date.UTC(2026, 9, 15, 9, 0, 0) + t * 60000);
    const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()], mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()];
    const p = n => String(n).padStart(2, '0');
    return wd + ' ' + mo + ' ' + d.getUTCDate() + ' ' + p(d.getUTCHours()) + ':' + p(d.getUTCMinutes()) + ':' + p(d.getUTCSeconds()) + ' ' + d.getUTCFullYear() + ' +0000';
  };
  const statusParts = () => {
    const T = tree(headId()), I = R.idx, W = R.wt;
    const staged = [], unstaged = [], untracked = [];
    for (const n of [...new Set([...Object.keys(I), ...Object.keys(T)])].sort()) {
      if (R.conflicts.includes(n)) continue;
      if (n in I && !(n in T)) staged.push(['new file', n]);
      else if (n in I && n in T && I[n] !== T[n]) staged.push(['modified', n]);
      else if (!(n in I) && n in T) staged.push(['deleted', n]);
    }
    for (const n of Object.keys(I).sort()) { if (R.conflicts.includes(n)) continue; if (!(n in W)) unstaged.push(['deleted', n]); else if (W[n] !== I[n]) unstaged.push(['modified', n]); }
    for (const n of Object.keys(W).sort()) if (!(n in I) && !R.conflicts.includes(n)) untracked.push(n);
    return { staged, unstaged, untracked };
  };
  const statusText = (forCommit) => {
    const { staged, unstaged, untracked } = statusParts(); const L = ['On branch ' + R.head];
    if (!headId()) L.push('', 'No commits yet');
    if (R.merging && R.conflicts.length) {
      L.push('You have unmerged paths.', '  (fix conflicts and run "git commit")', '  (use "git merge --abort" to abort the merge)', '', 'Unmerged paths:', '  (use "git add <file>..." to mark resolution)');
      R.conflicts.forEach(n => L.push('\tboth modified:   ' + n)); L.push('');
    } else if (R.merging) { L.push('All conflicts fixed but you are still merging.', '  (use "git commit" to conclude merge)', ''); }
    if (staged.length) { L.push('', 'Changes to be committed:', '  (use "git restore --staged <file>..." to unstage)'); staged.forEach(([k, n]) => L.push('\t' + (k + ':').padEnd(12) + n)); }
    if (unstaged.length) { L.push('', 'Changes not staged for commit:', '  (use "git add <file>..." to update what will be committed)', '  (use "git restore <file>..." to discard changes in working directory)'); unstaged.forEach(([k, n]) => L.push('\t' + (k + ':').padEnd(12) + n)); }
    if (untracked.length) { L.push('', 'Untracked files:', '  (use "git add <file>..." to include in what will be committed)'); untracked.forEach(n => L.push('\t' + n)); }
    L.push('');
    if (!staged.length && !unstaged.length && !untracked.length && !R.merging) L.push(headId() ? 'nothing to commit, working tree clean' : 'nothing to commit (create/copy files and use "git add" to track)');
    else if (!staged.length && unstaged.length) L.push('no changes added to commit (use "git add" and/or "git commit -a")');
    else if (!staged.length && untracked.length && !R.merging) L.push('nothing added to commit but untracked files present (use "git add" to track)');
    return L.join('\n').replace(/\n{3,}/g, '\n\n').replace(/^(On branch [^\n]+)\n\n(?=Changes|Untracked)/, '$1\n').trim();
  };
  const makeCommit = (msg, parents) => {
    const t = Object.assign({}, R.idx); R.clock++;
    const id = gitHash(msg + '|' + JSON.stringify(t) + '|' + parents.join(',') + '|' + R.clock);
    R.commits[id] = { id, msg, tree: t, parents, time: R.clock }; R.order.push(id); R.branches[R.head] = id; return id;
  };
  const updateTo = (newTree) => {
    const old = tree(headId());
    for (const n of Object.keys(old)) if (!(n in newTree)) delete R.wt[n];
    for (const n of Object.keys(newTree)) R.wt[n] = newTree[n];
    R.idx = Object.assign({}, newTree);
  };
  const dirtyBlockers = (toTree) => {
    const cur = tree(headId()), bad = [];
    for (const n of new Set([...Object.keys(cur), ...Object.keys(toTree)])) {
      if (cur[n] === toTree[n]) continue;
      if ((n in R.wt ? R.wt[n] : undefined) !== cur[n] || (n in R.idx ? R.idx[n] : undefined) !== cur[n]) bad.push(n);
    }
    return bad.sort();
  };
  const decorate = (id) => {
    const refs = []; const cur = headId();
    for (const b of Object.keys(R.branches).sort()) if (R.branches[b] === id) refs.push(b === R.head && cur === id ? 'HEAD -> ' + b : b);
    refs.sort((a, b) => (b.startsWith('HEAD') ? 1 : 0) - (a.startsWith('HEAD') ? 1 : 0));
    return refs.length ? ' (' + refs.join(', ') + ')' : '';
  };

  const git = (a) => {
    const sub = a[0];
    if (!sub) return 'usage: git <command> [<args>]';
    if (G_UNSUP.has(sub)) return '[preview] git ' + sub + ' is available in the full app. This preview simulates a single local repository.';
    if (sub === 'version') return 'git version 2.45.0';
    if (sub === 'help') return 'usage: git [-v | --version] [-h | --help] <command> [<args>]';
    if (sub === 'config') return '';
    if (sub === 'init') {
      if (R.inited) return 'Reinitialized existing Git repository in /project/.git/';
      R.inited = true; return 'Initialized empty Git repository in /project/.git/';
    }
    if (!G_KNOWN.has(sub)) return "git: '" + sub + "' is not a git command. See 'git --help'.";
    if (!R.inited) return fatalRepo;
    const args = a.slice(1);
    switch (sub) {
      case 'status': return statusText();
      case 'add': {
        if (!args.length) return 'Nothing specified, nothing added.\nhint: Maybe you wanted to say \'git add .\'?';
        const out = [];
        for (const p of args) {
          if (p === '.' || p === '-A' || p === '--all') {
            for (const n of Object.keys(R.wt)) R.idx[n] = R.wt[n];
            for (const n of Object.keys(R.idx)) if (!(n in R.wt)) delete R.idx[n];
            R.conflicts = [];
          } else if (p in R.wt) { R.idx[p] = R.wt[p]; R.conflicts = R.conflicts.filter(x => x !== p); }
          else if (p in R.idx) delete R.idx[p];
          else out.push("fatal: pathspec '" + p + "' did not match any files");
        }
        return out.join('\n');
      }
      case 'restore': {
        const staged = args.includes('--staged'); const files = args.filter(x => !x.startsWith('-'));
        if (!files.length) return 'fatal: you must specify path(s) to restore';
        const out = [];
        for (const f of files) {
          const T = tree(headId());
          if (staged) { if (f in T) R.idx[f] = T[f]; else if (f in R.idx) delete R.idx[f]; else out.push("error: pathspec '" + f + "' did not match any file(s) known to git"); }
          else { if (f in R.idx) R.wt[f] = R.idx[f]; else out.push("error: pathspec '" + f + "' did not match any file(s) known to git"); }
        }
        return out.join('\n');
      }
      case 'commit': {
        let msg = null, all = false;
        for (let i = 0; i < args.length; i++) {
          const x = args[i];
          if (x === '-m' || x === '--message') { msg = args[++i]; }
          else if (x === '-am' || x === '-ma') { all = true; msg = args[++i]; }
          else if (x === '-a' || x === '--all') all = true;
          else if (x === '--amend') return '[preview] git commit --amend is available in the full app.';
          else if (x.startsWith('-m') && x.length > 2) msg = x.slice(2);
        }
        if (R.merging && R.conflicts.length) return "error: Committing is not possible because you have unmerged files.\nhint: Fix them up in the work tree, and then use 'git add/rm <file>'\nhint: as appropriate to mark resolution and make a commit.\nfatal: Exiting because of an unresolved conflict.";
        if (all) { for (const n of Object.keys(R.idx)) { if (n in R.wt) R.idx[n] = R.wt[n]; else delete R.idx[n]; } }
        const T = tree(headId());
        const changed = gStat(T, R.idx);
        if (R.merging) {
          const m = msg || "Merge branch '" + R.merging.name + "'";
          const id = makeCommit(m, [headId(), R.merging.id]); R.merging = null;
          return '[' + R.head + ' ' + short(id) + '] ' + m;
        }
        if (!changed.files.length) return statusText();
        if (msg === null || msg === undefined || msg === '') return 'error: no commit message given. Use: git commit -m "your message"';
        const root = !headId(); const id = makeCommit(msg, root ? [] : [headId()]);
        const L = ['[' + R.head + (root ? ' (root-commit)' : '') + ' ' + short(id) + '] ' + msg, gSummary(changed)];
        changed.files.forEach(f => { if (f.created) L.push(' create mode 100644 ' + f.name); else if (f.deleted) L.push(' delete mode 100644 ' + f.name); });
        return L.join('\n');
      }
      case 'log': {
        if (!headId()) return "fatal: your current branch '" + R.head + "' does not have any commits yet";
        let oneline = false, limit = Infinity;
        for (let i = 0; i < args.length; i++) { const x = args[i]; if (x === '--oneline' || x === '--graph') oneline = true; else if (x === '-n') limit = +args[++i]; else if (/^-\d+$/.test(x)) limit = -x; else if (x.startsWith('--pretty') || x === '--decorate' || x === '--all') { /* ignored */ } else if (x.startsWith('-')) return 'fatal: unrecognized argument: ' + x; }
        const ids = [...ancestors(headId())].sort((x, y) => R.commits[y].time - R.commits[x].time).slice(0, limit);
        if (oneline) return ids.map(id => short(id) + decorate(id) + ' ' + R.commits[id].msg).join('\n');
        return ids.map(id => {
          const c = R.commits[id]; const L = ['commit ' + id + decorate(id)];
          if (c.parents.length > 1) L.push('Merge: ' + c.parents.map(short).join(' '));
          L.push('Author: You <you@example.com>', 'Date:   ' + dateOf(c.time), '', '    ' + c.msg); return L.join('\n');
        }).join('\n\n');
      }
      case 'branch': {
        const flags = args.filter(x => x.startsWith('-')), names = args.filter(x => !x.startsWith('-'));
        if (flags.includes('-d') || flags.includes('-D')) {
          const force = flags.includes('-D'); const out = [];
          for (const nm of names) {
            if (!(nm in R.branches)) { out.push("error: branch '" + nm + "' not found."); continue; }
            if (nm === R.head) { out.push("error: cannot delete branch '" + nm + "' checked out at '/project'"); continue; }
            if (!force && !ancestors(headId()).has(R.branches[nm])) { out.push("error: the branch '" + nm + "' is not fully merged.\nIf you are sure you want to delete it, run 'git branch -D " + nm + "'."); continue; }
            const id = R.branches[nm]; delete R.branches[nm]; out.push('Deleted branch ' + nm + ' (was ' + short(id) + ').');
          }
          return out.join('\n');
        }
        if (flags.includes('-M') || flags.includes('-m')) {
          const nn = names[names.length - 1]; if (!nn) return 'fatal: branch name required';
          if (headId()) { R.branches[nn] = R.branches[R.head]; if (nn !== R.head) delete R.branches[R.head]; }
          R.head = nn; return '';
        }
        if (!names.length) {
          const list = Object.keys(R.branches).sort();
          if (!list.length) return '';
          return list.map(b => (b === R.head ? '* ' : '  ') + b).join('\n');
        }
        const nm = names[0];
        if (!headId()) return "fatal: not a valid object name: '" + R.head + "'";
        if (nm in R.branches) return "fatal: a branch named '" + nm + "' already exists";
        R.branches[nm] = headId(); return '';
      }
      case 'switch': case 'checkout': {
        let create = false; const names = [];
        for (const x of args) { if (x === '-c' || x === '-b' || x === '-C' || x === '-B') create = true; else if (!x.startsWith('-')) names.push(x); }
        const nm = names[0]; if (!nm) return 'fatal: missing branch name';
        if (create) {
          if (!headId()) return "fatal: not a valid object name: '" + R.head + "'";
          if (nm in R.branches) return "fatal: a branch named '" + nm + "' already exists";
          R.branches[nm] = headId(); R.head = nm; return "Switched to a new branch '" + nm + "'";
        }
        if (!(nm in R.branches)) return sub === 'switch' ? "fatal: invalid reference: " + nm : "error: pathspec '" + nm + "' did not match any file(s) known to git";
        if (nm === R.head) return "Already on '" + nm + "'";
        const bad = dirtyBlockers(tree(R.branches[nm]));
        if (bad.length) return 'error: Your local changes to the following files would be overwritten by ' + (sub === 'switch' ? 'checkout' : 'checkout') + ':\n' + bad.map(n => '\t' + n).join('\n') + '\nPlease commit your changes or stash them before you switch branches.\nAborting';
        updateTo(tree(R.branches[nm])); R.head = nm; return "Switched to branch '" + nm + "'";
      }
      case 'merge': {
        if (args.includes('--abort')) {
          if (!R.merging) return 'fatal: There is no merge to abort (MERGE_HEAD missing).';
          updateTo(tree(headId())); R.merging = null; R.conflicts = []; return '';
        }
        const nm = args.find(x => !x.startsWith('-')); if (!nm) return 'fatal: No remote for the current branch.';
        if (!(nm in R.branches)) return nm + ' - not something we can merge';
        if (!headId()) return 'fatal: ' + R.head + ': Not something we can merge';
        const tgt = R.branches[nm], cur = headId();
        if (ancestors(cur).has(tgt)) return 'Already up to date.';
        const bad = dirtyBlockers(tree(cur)).concat([]);
        if (Object.keys(R.idx).some(n => R.idx[n] !== tree(cur)[n]) || Object.keys(tree(cur)).some(n => !(n in R.idx))) return 'error: Your local changes would be overwritten by merge.\nPlease commit your changes or stash them before you merge.\nAborting';
        if (ancestors(tgt).has(cur)) {
          const st = gStat(tree(cur), tree(tgt));
          const msg = 'Updating ' + short(cur) + '..' + short(tgt) + '\nFast-forward\n' + gDiffstat(st);
          updateTo(tree(tgt)); R.branches[R.head] = tgt; return msg;
        }
        // three-way merge: find a merge base
        const aCur = ancestors(cur), aTgt = ancestors(tgt);
        const common = [...aCur].filter(x => aTgt.has(x)).sort((x, y) => R.commits[y].time - R.commits[x].time);
        const base = tree(common[0] || null), ours = tree(cur), theirs = tree(tgt);
        const merged = {}; const conflicts = []; const out = [];
        for (const n of [...new Set([...Object.keys(base), ...Object.keys(ours), ...Object.keys(theirs)])].sort()) {
          const b = base[n], o = ours[n], t = theirs[n];
          if (o === t) { if (o !== undefined) merged[n] = o; }
          else if (o === b) { if (t !== undefined) merged[n] = t; }
          else if (t === b) { if (o !== undefined) merged[n] = o; }
          else { conflicts.push(n); out.push('Auto-merging ' + n, 'CONFLICT (content): Merge conflict in ' + n); merged[n] = '<<<<<<< HEAD\n' + (o || '') + '=======\n' + (t || '') + '>>>>>>> ' + nm + '\n'; }
        }
        if (conflicts.length) {
          for (const n of Object.keys(merged)) R.wt[n] = merged[n];
          for (const n of Object.keys(R.wt)) if (!(n in merged) && n in ours) delete R.wt[n];
          for (const n of Object.keys(merged)) if (!conflicts.includes(n)) R.idx[n] = merged[n];
          R.merging = { name: nm, id: tgt }; R.conflicts = conflicts;
          out.push('Automatic merge failed; fix conflicts and then commit the result.'); return out.join('\n');
        }
        const before = ours; R.idx = Object.assign({}, merged); updateTo(merged);
        const id = makeCommit("Merge branch '" + nm + "'", [cur, tgt]);
        return "Merge made by the 'ort' strategy.\n" + gDiffstat(gStat(before, merged));
      }
    }
    return '';
  };

  const sh = (toks) => {
    const cmd = toks[0];
    let redir = null;
    const ri = toks.findIndex(x => x === '>' || x === '>>');
    if (ri >= 0) { redir = { op: toks[ri], file: toks[ri + 1] }; toks = toks.slice(0, ri); if (!redir.file) return 'bash: syntax error near unexpected token `newline\''; }
    switch (cmd) {
      case 'git': return git(toks.slice(1));
      case 'echo': {
        const text = toks.slice(1).join(' ');
        if (redir) { R.wt[redir.file] = redir.op === '>>' ? (R.wt[redir.file] || '') + text + '\n' : text + '\n'; return ''; }
        return text;
      }
      case 'touch': toks.slice(1).forEach(f => { if (!(f in R.wt)) R.wt[f] = ''; }); return '';
      case 'cat': return toks.slice(1).map(f => (f in R.wt ? R.wt[f].replace(/\n$/, '') : 'cat: ' + f + ': No such file or directory')).join('\n');
      case 'ls': { const n = Object.keys(R.wt).sort(); return n.join('  '); }
      case 'rm': return toks.slice(1).filter(x => !x.startsWith('-')).map(f => { if (f in R.wt) { delete R.wt[f]; return ''; } return "rm: cannot remove '" + f + "': No such file or directory"; }).filter(Boolean).join('\n');
      case 'pwd': return '/project';
      case 'clear': return '';
      default: return 'bash: ' + cmd + ': command not found';
    }
  };

  const lines = String(script).replace(/\r\n?/g, '\n').split('\n');
  try {
    for (const raw of lines) {
      const line = raw.trim(); if (!line || line.startsWith('#')) continue;
      const toks = shellSplit(line);
      if (!toks) { transcript.push({ cmd: line, out: "bash: unexpected EOF while looking for matching quote" }); continue; }
      transcript.push({ cmd: line, out: sh(toks) });
    }
  } catch (e) { if (e instanceof Unsupported) return { unsupported: true }; throw e; }
  const reach = headId() ? [...ancestors(headId())].sort((x, y) => R.commits[y].time - R.commits[x].time) : [];
  const parts = statusParts();
  const repo = {
    inited: R.inited, head: R.head, branches: Object.assign({}, R.branches), wt: Object.assign({}, R.wt),
    commits: R.order.map(id => ({ id, msg: R.commits[id].msg, parents: R.commits[id].parents.slice(), tree: Object.assign({}, R.commits[id].tree) })),
    log: reach.map(id => R.commits[id].msg), headTree: Object.assign({}, tree(headId())),
    treeOf: (b) => Object.assign({}, tree(R.branches[b])),
    clean: !parts.staged.length && !parts.unstaged.length && !parts.untracked.length && !R.merging
  };
  return { transcript, repo, out: transcript.map(t => '$ ' + t.cmd + (t.out ? '\n' + t.out : '')).join('\n'), error: null };
}


export { runCode, bareCode, runJSX, jsxApi, DB, sqlFmt };
