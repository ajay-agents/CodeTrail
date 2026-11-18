export const esc = s => String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

const KW_PY = new Set(['False', 'None', 'True', 'and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield']);
const BI_PY = new Set(['print', 'len', 'str', 'int', 'float', 'type', 'abs', 'round', 'max', 'min', 'input', 'range']);
const KW_C = new Set(['int', 'char', 'float', 'double', 'long', 'short', 'unsigned', 'signed', 'void', 'const', 'static', 'struct', 'typedef', 'enum', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'sizeof', 'bool', 'true', 'false', 'class', 'public', 'private', 'namespace', 'using', 'template', 'new', 'delete', 'auto', 'string', 'nullptr']);
const BI_C = new Set(['printf', 'scanf', 'puts', 'cout', 'cin', 'endl', 'std', 'main', 'vector']);
const KW_JAVA = new Set(['public', 'private', 'protected', 'static', 'void', 'class', 'int', 'long', 'short', 'byte', 'double', 'float', 'char', 'boolean', 'String', 'final', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'new', 'true', 'false', 'null', 'import', 'package']);
const BI_JAVA = new Set(['System', 'out', 'println', 'print', 'printf', 'main', 'Math', 'args']);
const KW_SH = new Set(['git', 'echo', 'ls', 'cat', 'touch', 'rm', 'pwd']);
const BI_SH = new Set(['init', 'status', 'add', 'commit', 'log', 'branch', 'switch', 'checkout', 'merge', 'restore', 'config']);
const KW_JS = new Set(['const', 'let', 'var', 'function', 'return', 'if', 'else', 'import', 'from', 'export', 'default', 'true', 'false', 'null', 'undefined', 'typeof']);
const BI_JS = new Set(['useState', 'useEffect', 'console', 'Math', 'Number', 'String', 'Object', 'Array', 'JSON', 'React']);
const KW_SQL = new Set(['SELECT', 'FROM', 'WHERE', 'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'NULL', 'DISTINCT', 'ASC', 'DESC', 'JOIN', 'INNER', 'LEFT', 'ON', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE']);
const BI_SQL = new Set(['COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'UPPER', 'LOWER', 'LENGTH', 'ABS']);
function highlight(src, lang = 'python') {
  const fam = lang === 'python' ? 'py' : (lang === 'jsx' || lang === 'js') ? 'js' : lang === 'sql' ? 'sql' : lang === 'git' ? 'sh' : 'c';
  const re = {
    py: /(#.*$)|([fF]?"(?:[^"\\]|\\.)*(?:"|$)|[fF]?'(?:[^'\\]|\\.)*(?:'|$))|(\b\d[\d_]*(?:\.\d+)?\b)|(\b[A-Za-z_]\w*\b)/g,
    c: /(\/\/.*$|\/\*.*?\*\/)|(^\s*#.*$)|("(?:[^"\\]|\\.)*(?:"|$)|'(?:[^'\\]|\\.)*(?:'|$))|(\b\d[\d_]*(?:\.\d+)?\b)|(\b[A-Za-z_]\w*\b)/g,
    js: /(\/\/.*$|\/\*.*?\*\/)|("(?:[^"\\]|\\.)*(?:"|$)|'(?:[^'\\]|\\.)*(?:'|$)|`[^`]*(?:`|$))|(<\/?[A-Za-z][\w.]*|\/>)|(\b\d[\d_]*(?:\.\d+)?\b)|(\b[A-Za-z_$][\w$]*\b)/g,
    sql: /(--.*$)|('(?:[^']|'')*(?:'|$))|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]\w*\b)/g,
    sh: /(#.*$)|("[^"]*"?|'[^']*'?)|((?<![\w-])--?[A-Za-z][\w-]*)|(\b[A-Za-z_][\w.-]*\b)/g
  }[fam];
  const KW = fam === 'sh' ? KW_SH : fam === 'py' ? KW_PY : fam === 'c' ? (lang === 'java' ? KW_JAVA : KW_C) : fam === 'js' ? KW_JS : KW_SQL;
  const BI = fam === 'sh' ? BI_SH : fam === 'py' ? BI_PY : fam === 'c' ? (lang === 'java' ? BI_JAVA : BI_C) : fam === 'js' ? BI_JS : BI_SQL;
  const word = w => { const k = fam === 'sql' ? w.toUpperCase() : w; return KW.has(k) ? `<span class="t-kw">${w}</span>` : BI.has(k) ? `<span class="t-fn">${w}</span>` : esc(w); };
  const span = (c, s) => `<span class="${c}">${esc(s)}</span>`;
  return src.split('\n').map(line => {
    let out = '', last = 0, m; re.lastIndex = 0;
    while ((m = re.exec(line))) {
      out += esc(line.slice(last, m.index));
      if (fam === 'py' || fam === 'sql' || fam === 'sh') {
        if (m[1]) out += span('t-com', m[1]); else if (m[2]) out += span('t-str', m[2]); else if (m[3]) out += span('t-num', m[3]); else out += word(m[4]);
      } else if (fam === 'c') {
        if (m[1]) out += span('t-com', m[1]); else if (m[2]) out += span('t-fn', m[2]); else if (m[3]) out += span('t-str', m[3]); else if (m[4]) out += span('t-num', m[4]); else out += word(m[5]);
      } else {
        if (m[1]) out += span('t-com', m[1]); else if (m[2]) out += span('t-str', m[2]); else if (m[3]) out += span('t-kw', m[3]); else if (m[4]) out += span('t-num', m[4]); else out += word(m[5]);
      }
      last = re.lastIndex;
    }
    return out + esc(line.slice(last));
  }).join('\n');
}

export { highlight };
