export type Vars = Record<string, number>;

const OPS: Record<string, {p: number; r: boolean; fn: (a: number, b: number)=>number}> = {
  '+': { p: 1, r: false, fn: (a, b) => a + b },
  '-': { p: 1, r: false, fn: (a, b) => a - b },
  '*': { p: 2, r: false, fn: (a, b) => a * b },
  '/': { p: 2, r: false, fn: (a, b) => a / b },
  '^': { p: 3, r: true,  fn: (a, b) => Math.pow(a, b) },
};

export function evalExpression(expr: string, vars: Vars, whitelist: string[]): number {
  if (!expr || typeof expr !== 'string') throw new Error('Empty expression');
  const tokens: string[] = [];
  const re = /([A-Za-z_][A-Za-z0-9_]*)|(\d+(?:\.\d+)?)|([+\-*/^()])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(expr))) tokens.push(m[0]);

  const toRPN: string[] = [];
  const stack: string[] = [];
  for (const t of tokens) {
    if (/^\d/.test(t)) toRPN.push(t);
    else if (/^[A-Za-z_]/.test(t)) {
      if (!whitelist.includes(t)) throw new Error(`Unknown variable: ${t}`);
      toRPN.push('#' + t);
    } else if (t in OPS) {
      while (stack.length) {
        const o2 = stack[stack.length - 1];
        if (!(o2 in OPS)) break;
        const o1 = OPS[t], oB = OPS[o2];
        if ((o1.r && o1.p < oB.p) || (!o1.r && o1.p <= oB.p)) toRPN.push(stack.pop()!);
        else break;
      }
      stack.push(t);
    } else if (t === '(') stack.push(t);
    else if (t === ')') {
      while (stack.length && stack[stack.length - 1] !== '(') toRPN.push(stack.pop()!);
      if (!stack.length) throw new Error('Mismatched parentheses');
      stack.pop();
    }
  }
  while (stack.length) {
    const s = stack.pop()!;
    if (s === '(') throw new Error('Mismatched parentheses');
    toRPN.push(s);
  }

  const st: number[] = [];
  for (const t of toRPN) {
    if (t in OPS) {
      const b = st.pop(), a = st.pop();
      if (a === undefined || b === undefined) throw new Error('Malformed expression');
      st.push(OPS[t].fn(a, b));
    } else if (t.startsWith('#')) {
      const k = t.slice(1);
      const v = vars[k];
      if (typeof v !== 'number' || Number.isNaN(v)) throw new Error(`Invalid ${k}`);
      st.push(v);
    } else {
      st.push(parseFloat(t));
    }
  }
  if (st.length !== 1) throw new Error('Malformed expression');
  return st[0];
}
