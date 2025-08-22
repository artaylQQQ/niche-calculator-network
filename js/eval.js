// file: /js/eval.js
export function evaluate(expr, vars) {
  // Very small shunting-yard evaluator (numbers, + - * / ** ^, parentheses, variables)
  const tokens = [];
  const isName = c => /[A-Za-z_]/.test(c);
  const isNum = c => /[0-9.]/.test(c);
  let i=0;
  while (i < expr.length) {
    const c = expr[i];
    if (/\s/.test(c)) { i++; continue; }
    if (isNum(c)) {
      let s=i; while (i<expr.length && /[0-9.eE]/.test(expr[i])) i++;
      tokens.push({t:'num', v: parseFloat(expr.slice(s,i))}); continue;
    }
    if (isName(c)) {
      let s=i; while (i<expr.length && /[A-Za-z0-9_]/.test(expr[i])) i++;
      const name = expr.slice(s,i);
      if (!(name in vars)) throw new Error('Unknown variable '+name);
      tokens.push({t:'num', v: Number(vars[name])}); continue;
    }
    if ('+-*/()^'.includes(c)) { tokens.push({t:'op', v: c}); i++; continue; }
    if (c==='*' && expr[i+1]==='*') { tokens.push({t:'op', v: '^'}); i+=2; continue; }
    throw new Error('Unexpected char');
  }
  const prec = {'^':4, '*':3, '/':3, '+':2, '-':2};
  const right = {'^':true};
  const out=[], ops=[];
  for (const tok of tokens) {
    if (tok.t==='num') { out.push(tok); continue; }
    const op = tok.v;
    if (op==='('){ ops.push(op); continue; }
    if (op===')'){ while (ops.length && ops[ops.length-1]!=='(') out.push({t:'op', v: ops.pop()}); ops.pop(); continue; }
    while (ops.length){
      const top = ops[ops.length-1]; if (top==='(') break;
      if ((right[op] && prec[op] < prec[top]) || (!right[op] && prec[op] <= prec[top])) out.push({t:'op', v: ops.pop()}); else break;
    }
    ops.push(op);
  }
  while (ops.length) out.push({t:'op', v: ops.pop()});
  const st=[];
  for (const t of out) {
    if (t.t==='num'){ st.push(t.v); continue; }
    const b=st.pop(), a=st.pop();
    switch (t.v) {
      case '+': st.push(a+b); break;
      case '-': st.push(a-b); break;
      case '*': st.push(a*b); break;
      case '/': st.push(b===0 ? NaN : a/b); break;
      case '^': st.push(Math.pow(a,b)); break;
    }
  }
  return st.pop();
}
