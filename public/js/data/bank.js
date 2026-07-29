/* ============ CODE ARCADE — content bank ============
   Everything you might want to edit lives here.
   Add more items to any array and the games pick them up automatically.
   `lang` values: py | js | c | java | uni  (uni = language-agnostic)
======================================================== */

/* ---------- 1. BUG HUNTER ----------
   lines: array of code lines. bug: index of the buggy line (0-based).
   why: explanation shown after answering.                              */
export const BUGS = [
  { lang:'py', diff:1, lines:[
    'def total(nums):',
    '    s = 0',
    '    for n in nums:',
    '        s = n',
    '    return s'], bug:3,
    why:'Should be <b>s += n</b>. As written it overwrites the sum each loop, returning only the last element.' },

  { lang:'py', diff:1, lines:[
    'nums = [1, 2, 3, 4]',
    'for i in range(len(nums) + 1):',
    '    print(nums[i])'], bug:1,
    why:'<b>range(len(nums) + 1)</b> goes one index too far → IndexError. Drop the <b>+ 1</b>.' },

  { lang:'js', diff:1, lines:[
    'function isEven(n) {',
    '  if (n % 2 = 0) {',
    '    return true;',
    '  }',
    '  return false;',
    '}'], bug:1,
    why:'<b>=</b> is assignment. Comparison needs <b>===</b> (or <b>==</b>).' },

  { lang:'c', diff:2, lines:[
    'int main() {',
    '    int arr[5];',
    '    for (int i = 0; i <= 5; i++) {',
    '        arr[i] = i * 2;',
    '    }',
    '    return 0;',
    '}'], bug:2,
    why:'<b>i &lt;= 5</b> writes to arr[5], which is out of bounds for a size-5 array. Use <b>i &lt; 5</b>.' },

  { lang:'py', diff:2, lines:[
    'def add_item(item, lst=[]):',
    '    lst.append(item)',
    '    return lst',
    '',
    'print(add_item(1))',
    'print(add_item(2))'], bug:0,
    why:'Mutable default argument. The same list is reused across calls → prints [1] then [1, 2].' },

  { lang:'js', diff:2, lines:[
    'const arr = [1, 2, 3];',
    'for (var i = 0; i < arr.length; i++) {',
    '  setTimeout(() => console.log(i), 100);',
    '}'], bug:1,
    why:'<b>var</b> is function-scoped, so all callbacks see the final i (3). Use <b>let i</b>.' },

  { lang:'py', diff:2, lines:[
    'def average(nums):',
    '    total = sum(nums)',
    '    return total / len(nums)',
    '',
    'print(average([]))'], bug:2,
    why:'No guard for an empty list → ZeroDivisionError. Check <b>if not nums: return 0</b>.' },

  { lang:'java', diff:2, lines:[
    'String a = "hello";',
    'String b = "hello";',
    'if (a == b) {',
    '    System.out.println("same");',
    '}'], bug:2,
    why:'<b>==</b> compares references in Java. Use <b>a.equals(b)</b> for string content.' },

  { lang:'js', diff:1, lines:[
    'let nums = [5, 10, 1];',
    'nums.sort();',
    'console.log(nums);'], bug:1,
    why:'Default sort is lexicographic → [1, 10, 5]. Pass a comparator: <b>sort((a,b) =&gt; a-b)</b>.' },

  { lang:'py', diff:2, lines:[
    'items = [1, 2, 3, 4]',
    'for x in items:',
    '    if x % 2 == 0:',
    '        items.remove(x)',
    'print(items)'], bug:3,
    why:'Mutating a list while iterating skips elements. Iterate over a copy: <b>for x in items[:]</b>.' },

  { lang:'c', diff:3, lines:[
    'char *greet() {',
    '    char msg[] = "hi";',
    '    return msg;',
    '}'], bug:1,
    why:'<b>msg</b> is a local array on the stack; returning it gives a dangling pointer. Use <b>static</b> or malloc.' },

  { lang:'py', diff:1, lines:[
    'x = input("Enter number: ")',
    'if x > 10:',
    '    print("big")'], bug:1,
    why:'<b>input()</b> returns a string; comparing str to int raises TypeError. Wrap with <b>int(x)</b>.' },

  { lang:'js', diff:2, lines:[
    'function sum(a, b) {',
    '  return',
    '    a + b;',
    '}'], bug:1,
    why:'Automatic semicolon insertion ends the return early → returns undefined. Keep the value on the same line.' },

  { lang:'py', diff:3, lines:[
    'def fib(n):',
    '    if n <= 1:',
    '        return n',
    '    return fib(n) + fib(n - 2)'], bug:3,
    why:'<b>fib(n)</b> never shrinks → infinite recursion. Should be <b>fib(n - 1) + fib(n - 2)</b>.' },

  { lang:'js', diff:2, lines:[
    'const user = { name: "Ana" };',
    'function greet(u) {',
    '  return "Hi " + u.nmae;',
    '}',
    'console.log(greet(user));'], bug:2,
    why:'Typo: <b>u.nmae</b> is undefined. JS does not error on missing keys — it silently prints "Hi undefined".' },

  { lang:'c', diff:2, lines:[
    'int main() {',
    '    int n;',
    '    scanf("%d", n);',
    '    printf("%d", n);',
    '}'], bug:2,
    why:'<b>scanf</b> needs the address: <b>scanf("%d", &amp;n)</b>. Passing the value corrupts memory.' },

  { lang:'py', diff:2, lines:[
    'def search(arr, t):',
    '    lo, hi = 0, len(arr)',
    '    while lo < hi:',
    '        mid = (lo + hi) // 2',
    '        if arr[mid] == t: return mid',
    '        elif arr[mid] < t: hi = mid',
    '        else: lo = mid + 1',
    '    return -1'], bug:5,
    why:'The branches are swapped. If arr[mid] &lt; t the target is on the right: <b>lo = mid + 1</b>.' },

  { lang:'java', diff:1, lines:[
    'int[] a = new int[3];',
    'for (int i = 0; i < 3; i++) {',
    '    a[i] = i;',
    '}',
    'System.out.println(a[3]);'], bug:4,
    why:'Index 3 is out of range for length 3 (valid: 0–2) → ArrayIndexOutOfBoundsException.' },

  { lang:'js', diff:3, lines:[
    'const obj = { n: 1 };',
    'const copy = obj;',
    'copy.n = 99;',
    'console.log(obj.n);'], bug:1,
    why:'Objects are assigned by reference, not copied. Use <b>{ ...obj }</b> for a shallow copy.' },

  { lang:'py', diff:3, lines:[
    'matrix = [[0] * 3] * 3',
    'matrix[0][0] = 1',
    'print(matrix)'], bug:0,
    why:'<b>* 3</b> repeats the same inner list reference 3 times. Use <b>[[0]*3 for _ in range(3)]</b>.' },

  { lang:'js', diff:1, lines:[
    'let count = 0;',
    'const inc = () => { count++ };',
    'inc(); inc();',
    'console.log(Count);'], bug:3,
    why:'JavaScript is case-sensitive: <b>Count</b> is not <b>count</b> → ReferenceError.' },

  { lang:'py', diff:2, lines:[
    'nums = [3, 1, 2]',
    'sorted_nums = nums.sort()',
    'print(sorted_nums[0])'], bug:1,
    why:'<b>list.sort()</b> sorts in place and returns None. Use <b>sorted(nums)</b> to get a new list.' },

  { lang:'c', diff:3, lines:[
    'int *p = malloc(4 * sizeof(int));',
    'p[0] = 10;',
    'free(p);',
    'printf("%d", p[0]);'], bug:3,
    why:'Use-after-free. Once freed, reading p[0] is undefined behaviour.' },

  { lang:'js', diff:2, lines:[
    'const nums = [1, 2, 3];',
    'const doubled = nums.map(n => { n * 2 });',
    'console.log(doubled);'], bug:1,
    why:'Braces make it a block, so nothing is returned → [undefined ×3]. Use <b>n =&gt; n * 2</b>.' },

  { lang:'py', diff:1, lines:[
    'count = 0',
    'while count < 5:',
    '    print(count)',
    'count += 1'], bug:3,
    why:'The increment sits outside the loop body → infinite loop. Indent it inside the while.' },
];

/* ---------- 2. OUTPUT ORACLE ---------- */
export const ORACLE = [
  { lang:'py', diff:1, code:['print(7 // 2)'], a:'3',
    opts:['3','3.5','4','2'], why:'<b>//</b> is floor division → 3.' },
  { lang:'py', diff:1, code:['print("5" + "5")'], a:'55',
    opts:['10','55','"55"','Error'], why:'Strings concatenate, they do not add.' },
  { lang:'py', diff:2, code:['x = [1,2,3]','y = x','y.append(4)','print(len(x))'], a:'4',
    opts:['3','4','1','Error'], why:'y and x point to the same list object.' },
  { lang:'py', diff:2, code:['print(bool("False"))'], a:'True',
    opts:['True','False','Error','None'], why:'Any non-empty string is truthy.' },
  { lang:'py', diff:2, code:['print(2 ** 3 ** 2)'], a:'512',
    opts:['64','512','36','81'], why:'<b>**</b> is right-associative: 2**(3**2) = 2**9.' },
  { lang:'py', diff:1, code:['s = "python"','print(s[1:4])'], a:'yth',
    opts:['yth','ytho','pyt','tho'], why:'Slice [1:4] takes indices 1,2,3.' },
  { lang:'py', diff:3, code:['print([1,2] * 2)'], a:'[1, 2, 1, 2]',
    opts:['[1, 2, 1, 2]','[2, 4]','[1, 2, 2, 4]','Error'], why:'List * int repeats the list.' },
  { lang:'py', diff:2, code:['print(len(set([1,1,2,3,3])))'], a:'3',
    opts:['5','3','2','4'], why:'Sets drop duplicates → {1,2,3}.' },
  { lang:'py', diff:3, code:['print(0.1 + 0.2 == 0.3)'], a:'False',
    opts:['True','False','Error','0.3'], why:'Floating point: 0.1+0.2 = 0.30000000000000004.' },
  { lang:'py', diff:2, code:['a = "abc"','print(a[::-1])'], a:'cba',
    opts:['cba','abc','Error','a'], why:'[::-1] reverses a sequence.' },
  { lang:'py', diff:2, code:['print(list(range(2, 10, 3)))'], a:'[2, 5, 8]',
    opts:['[2, 5, 8]','[2, 5, 8, 11]','[3, 6, 9]','[2, 4, 6, 8]'], why:'Start 2, step 3, stop before 10.' },
  { lang:'py', diff:3, code:['d = {"a":1}','d["b"] = d.get("b", 0) + 5','print(d["b"])'], a:'5',
    opts:['5','0','1','KeyError'], why:'get() returns the default 0 when the key is missing.' },

  { lang:'js', diff:1, code:['console.log(typeof null)'], a:'"object"',
    opts:['"null"','"object"','"undefined"','"number"'], why:'A famous JS bug kept for backwards compatibility.' },
  { lang:'js', diff:1, code:['console.log(1 + "1")'], a:'"11"',
    opts:['2','"11"','11','NaN'], why:'+ with a string coerces to string concatenation.' },
  { lang:'js', diff:2, code:['console.log("5" - 2)'], a:'3',
    opts:['3','"52"','NaN','Error'], why:'<b>-</b> has no string meaning, so "5" is coerced to a number.' },
  { lang:'js', diff:2, code:['console.log([] + {})'], a:'"[object Object]"',
    opts:['"[object Object]"','"{}"','0','NaN'], why:'Both are converted to strings; [] becomes "".' },
  { lang:'js', diff:2, code:['console.log(0.1 + 0.2)'], a:'0.30000000000000004',
    opts:['0.3','0.30000000000000004','0.4','Error'], why:'IEEE-754 floats cannot store 0.1 exactly.' },
  { lang:'js', diff:3, code:['console.log([1,2,3] == "1,2,3")'], a:'true',
    opts:['true','false','Error','undefined'], why:'== coerces the array via toString() → "1,2,3".' },
  { lang:'js', diff:2, code:['console.log([10,9,1].sort())'], a:'[1, 10, 9]',
    opts:['[1, 9, 10]','[1, 10, 9]','[10, 9, 1]','[9, 10, 1]'], why:'Default sort compares strings.' },
  { lang:'js', diff:3, code:['console.log(typeof NaN)'], a:'"number"',
    opts:['"NaN"','"number"','"undefined"','"object"'], why:'NaN is a numeric value meaning "not a number".' },
  { lang:'js', diff:2, code:['let a = [1,2,3];','a.length = 1;','console.log(a);'], a:'[1]',
    opts:['[1]','[1,2,3]','[]','Error'], why:'Setting length truncates the array.' },
  { lang:'js', diff:3, code:['console.log(!!"0")'], a:'true',
    opts:['true','false','0','Error'], why:'"0" is a non-empty string → truthy (unlike the number 0).' },

  { lang:'c', diff:2, code:['int x = 5;','printf("%d", x++ + ++x);'], a:'12',
    opts:['11','12','10','undefined'], why:'x++ gives 5, ++x makes 7 → 5+7 = 12 (compiler dependent in practice).' },
  { lang:'c', diff:1, code:['printf("%d", 7 / 2);'], a:'3',
    opts:['3','3.5','4','2'], why:'Integer division truncates.' },
  { lang:'c', diff:2, code:['char s[] = "hello";','printf("%d", sizeof(s));'], a:'6',
    opts:['5','6','4','8'], why:'sizeof counts the trailing null terminator.' },
  { lang:'c', diff:3, code:['int a = 10;','printf("%d", a >> 1);'], a:'5',
    opts:['5','20','10','1'], why:'Right shift by 1 halves the value.' },

  { lang:'java', diff:2, code:['System.out.println(10 / 3);'], a:'3',
    opts:['3','3.33','3.0','4'], why:'Both operands are ints → integer division.' },
  { lang:'java', diff:2, code:['System.out.println(\'A\' + 1);'], a:'66',
    opts:['"A1"','66','65','B'], why:'char promotes to int; \'A\' is 65.' },
  { lang:'java', diff:3, code:['Integer a = 127, b = 127;','System.out.println(a == b);'], a:'true',
    opts:['true','false','Error','null'], why:'Integers -128..127 are cached, so the references match.' },

  { lang:'uni', diff:1, code:['x = 10','x += 5','x *= 2','print(x)'], a:'30',
    opts:['30','20','25','40'], why:'(10 + 5) × 2 = 30.' },
  { lang:'uni', diff:2, code:['a = 5','b = a','a = 9','print(b)'], a:'5',
    opts:['5','9','None','Error'], why:'b copied the value 5 before a changed.' },
  { lang:'uni', diff:2, code:['for i in range(3):','    if i == 1: continue','    print(i, end=" ")'], a:'0 2',
    opts:['0 2','0 1 2','1','0 1'], why:'continue skips the rest of the body for i == 1.' },
];

/* ---------- 3. PARSONS PUZZLES ----------
   solution = correct order; indent = required indent level per line (Python only). */
export const PARSONS = [
  { lang:'py', name:'FizzBuzz', diff:1, indentMatters:true, lines:[
    { t:'for i in range(1, 16):', i:0 },
    { t:'if i % 15 == 0:', i:1 },
    { t:'print("FizzBuzz")', i:2 },
    { t:'elif i % 3 == 0:', i:1 },
    { t:'print("Fizz")', i:2 },
    { t:'elif i % 5 == 0:', i:1 },
    { t:'print("Buzz")', i:2 },
    { t:'else:', i:1 },
    { t:'print(i)', i:2 },
  ]},
  { lang:'py', name:'Factorial (recursive)', diff:1, indentMatters:true, lines:[
    { t:'def fact(n):', i:0 },
    { t:'if n <= 1:', i:1 },
    { t:'return 1', i:2 },
    { t:'return n * fact(n - 1)', i:1 },
  ]},
  { lang:'py', name:'Binary Search', diff:3, indentMatters:true, lines:[
    { t:'def bsearch(arr, target):', i:0 },
    { t:'lo, hi = 0, len(arr) - 1', i:1 },
    { t:'while lo <= hi:', i:1 },
    { t:'mid = (lo + hi) // 2', i:2 },
    { t:'if arr[mid] == target:', i:2 },
    { t:'return mid', i:3 },
    { t:'elif arr[mid] < target:', i:2 },
    { t:'lo = mid + 1', i:3 },
    { t:'else:', i:2 },
    { t:'hi = mid - 1', i:3 },
    { t:'return -1', i:1 },
  ]},
  { lang:'py', name:'Bubble Sort', diff:2, indentMatters:true, lines:[
    { t:'def bubble(a):', i:0 },
    { t:'n = len(a)', i:1 },
    { t:'for i in range(n):', i:1 },
    { t:'for j in range(n - i - 1):', i:2 },
    { t:'if a[j] > a[j + 1]:', i:3 },
    { t:'a[j], a[j+1] = a[j+1], a[j]', i:4 },
    { t:'return a', i:1 },
  ]},
  { lang:'py', name:'Count vowels', diff:1, indentMatters:true, lines:[
    { t:'def vowels(s):', i:0 },
    { t:'count = 0', i:1 },
    { t:'for ch in s.lower():', i:1 },
    { t:'if ch in "aeiou":', i:2 },
    { t:'count += 1', i:3 },
    { t:'return count', i:1 },
  ]},
  { lang:'py', name:'Reverse a linked list', diff:3, indentMatters:true, lines:[
    { t:'def reverse(head):', i:0 },
    { t:'prev = None', i:1 },
    { t:'while head:', i:1 },
    { t:'nxt = head.next', i:2 },
    { t:'head.next = prev', i:2 },
    { t:'prev = head', i:2 },
    { t:'head = nxt', i:2 },
    { t:'return prev', i:1 },
  ]},
  { lang:'js', name:'Debounce', diff:3, indentMatters:false, lines:[
    { t:'function debounce(fn, ms) {', i:0 },
    { t:'  let t;', i:0 },
    { t:'  return (...args) => {', i:0 },
    { t:'    clearTimeout(t);', i:0 },
    { t:'    t = setTimeout(() => fn(...args), ms);', i:0 },
    { t:'  };', i:0 },
    { t:'}', i:0 },
  ]},
  { lang:'js', name:'Fetch + render', diff:2, indentMatters:false, lines:[
    { t:'async function load() {', i:0 },
    { t:'  const res = await fetch("/api/items");', i:0 },
    { t:'  const data = await res.json();', i:0 },
    { t:'  render(data);', i:0 },
    { t:'}', i:0 },
  ]},
  { lang:'js', name:'Array max (reduce)', diff:1, indentMatters:false, lines:[
    { t:'const nums = [4, 9, 2];', i:0 },
    { t:'const max = nums.reduce(', i:0 },
    { t:'  (a, b) => (a > b ? a : b)', i:0 },
    { t:');', i:0 },
    { t:'console.log(max);', i:0 },
  ]},
  { lang:'c', name:'Swap with pointers', diff:2, indentMatters:false, lines:[
    { t:'void swap(int *a, int *b) {', i:0 },
    { t:'    int tmp = *a;', i:0 },
    { t:'    *a = *b;', i:0 },
    { t:'    *b = tmp;', i:0 },
    { t:'}', i:0 },
  ]},
  { lang:'c', name:'Sum an array', diff:1, indentMatters:false, lines:[
    { t:'int sum(int a[], int n) {', i:0 },
    { t:'    int s = 0;', i:0 },
    { t:'    for (int i = 0; i < n; i++)', i:0 },
    { t:'        s += a[i];', i:0 },
    { t:'    return s;', i:0 },
    { t:'}', i:0 },
  ]},
  { lang:'java', name:'Hello class', diff:1, indentMatters:false, lines:[
    { t:'public class Main {', i:0 },
    { t:'    public static void main(String[] a) {', i:0 },
    { t:'        System.out.println("Hi");', i:0 },
    { t:'    }', i:0 },
    { t:'}', i:0 },
  ]},
  { lang:'py', name:'Palindrome check', diff:2, indentMatters:true, lines:[
    { t:'def is_pal(s):', i:0 },
    { t:'s = s.lower().replace(" ", "")', i:1 },
    { t:'return s == s[::-1]', i:1 },
  ]},
  { lang:'py', name:'Quicksort partition', diff:3, indentMatters:true, lines:[
    { t:'def partition(a, lo, hi):', i:0 },
    { t:'pivot = a[hi]', i:1 },
    { t:'i = lo - 1', i:1 },
    { t:'for j in range(lo, hi):', i:1 },
    { t:'if a[j] <= pivot:', i:2 },
    { t:'i += 1', i:3 },
    { t:'a[i], a[j] = a[j], a[i]', i:3 },
    { t:'a[i+1], a[hi] = a[hi], a[i+1]', i:1 },
    { t:'return i + 1', i:1 },
  ]},
];

/* ---------- 4. BINARY BLASTER ---------- */
export const BIN_MODES = ['dec2bin', 'bin2dec', 'hex2bin', 'logic'];

/* ---------- 5. REGEX RANGER ----------
   match: strings the pattern MUST match. avoid: strings it must NOT match. */
export const REGEX_LEVELS = [
  { name:'Digits only', hint:'Any string of one or more digits.', par:5,
    match:['42','7','2024','999'], avoid:['abc','4a2','','x9'] },
  { name:'Starts with a', hint:'Must begin with the letter a.', par:2,
    match:['apple','ant','arc'], avoid:['banana','cat','Apple'] },
  { name:'Ends with .js', hint:'Filenames ending in .js', par:6,
    match:['app.js','index.js','a.js'], avoid:['app.py','js.txt','app.jsx'] },
  { name:'Three letters', hint:'Exactly three lowercase letters.', par:9,
    match:['cat','dog','bee'], avoid:['ca','bird','Cat','12a'] },
  { name:'Contains hex', hint:'A hex colour like #a1b2c3', par:12,
    match:['#a1b2c3','#ffffff','#000000'], avoid:['a1b2c3','#ggg','#12345'] },
  { name:'Email-ish', hint:'something@something.something', par:14,
    match:['a@b.co','me@mail.com'], avoid:['a@b','@b.co','ab.co'] },
  { name:'Snake case', hint:'lowercase words joined by underscores', par:14,
    match:['user_name','a_b','get_total_sum'], avoid:['UserName','user-name','_user'] },
  { name:'Even digit end', hint:'Numbers ending in an even digit.', par:10,
    match:['12','4','2048','30'], avoid:['13','7','2049'] },
  { name:'Repeated word', hint:'The same word twice, separated by a space.', par:14,
    match:['the the','go go','abc abc'], avoid:['the cat','go went','ab ba'] },
  { name:'No vowels', hint:'Words with no a, e, i, o, u.', par:12,
    match:['rhythm','xyz','myth'], avoid:['cat','hello','sky is'] },
];

/* ---------- 6. TERMINAL TYPER ---------- */
export const TYPE_LINES = [
  { lang:'py', t:'for i in range(len(arr)):' },
  { lang:'py', t:'print(f"{name}: {score:.2f}")' },
  { lang:'py', t:'result = [x**2 for x in nums if x % 2 == 0]' },
  { lang:'py', t:'with open("data.txt", "r") as f:' },
  { lang:'py', t:'def merge(left, right, key=None):' },
  { lang:'py', t:'d = {k: v for k, v in items if v is not None}' },
  { lang:'js', t:'const sum = arr.reduce((a, b) => a + b, 0);' },
  { lang:'js', t:'document.querySelector("#app").innerHTML = "";' },
  { lang:'js', t:'export default function App({ props }) {' },
  { lang:'js', t:'await fetch(url, { method: "POST", body: json });' },
  { lang:'js', t:'items.filter(Boolean).map((x) => x.id).join(",");' },
  { lang:'c',  t:'printf("%d %s\\n", count, buffer);' },
  { lang:'c',  t:'int *p = (int *)malloc(n * sizeof(int));' },
  { lang:'c',  t:'for (int i = 0; i < n - 1; i++) {' },
  { lang:'java', t:'public static void main(String[] args) {' },
  { lang:'java', t:'List<String> out = new ArrayList<>();' },
  { lang:'uni', t:'if (a >= b && c != d) { return !flag; }' },
  { lang:'uni', t:'git commit -m "fix: off-by-one in loop"' },
  { lang:'uni', t:'SELECT * FROM users WHERE age > 18;' },
  { lang:'uni', t:'const { a, b } = obj; // destructure' },
];

export const LANGS = [
  { id:'all',  name:'All' },
  { id:'py',   name:'Python' },
  { id:'js',   name:'JavaScript' },
  { id:'c',    name:'C' },
  { id:'java', name:'Java' },
];

export function byLang(arr, lang){
  if (lang === 'all') return arr;
  const f = arr.filter(x => x.lang === lang || x.lang === 'uni');
  return f.length >= 4 ? f : arr;
}
