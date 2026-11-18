const R = String.raw;
const TIPS = {
  js: ['Use const by default and let only when the value changes.', 'Always use === instead of ==.', 'console.log is your best debugging friend.', 'Arrays start counting at 0.', 'Template literals make text with values easy to read.'],
  dsa: ['Big-O is about growth, not exact time.', 'Sorted data unlocks faster algorithms.', 'Count the steps before you optimise.', 'Solve a small example by hand first.', 'A loop inside a loop multiplies the work.'],
  git: ['Run git status before and after every other command.', 'Commit small and often, with clear messages.', 'A branch is just a label that points at a commit.', 'Never commit passwords or secret keys.', 'Switching branches changes the files in your folder.'],
  java: ['The file name must match the public class name.', 'Read compiler errors from the top: the first one is usually the real problem.', 'Integer division drops the remainder, so 7 / 2 is 3.', 'Use double when you need decimals, int when you need whole numbers.', 'A String uses double quotes, a char uses single quotes.'],
  react: ['Components are just functions that return JSX.', 'Never change state directly. Use the setter.', 'Give every list item a stable key.', 'Props flow down, events flow up.', 'Keep state as small as you can and derive the rest.'],
  sql: ['SQL keywords are not case sensitive, but capitals make queries easier to read.', 'WHERE filters rows, HAVING filters groups.', 'Text goes in single quotes, numbers do not.', 'ORDER BY comes after WHERE, and LIMIT comes last.', 'Start with SELECT * and a LIMIT to peek at an unfamiliar table.'],
  python: ['Beautiful is better than ugly.', 'Explicit is better than implicit.', 'Simple is better than complex.', 'Readability counts.', 'Errors should never pass silently.', 'Now is better than never.'],
  c: ['Every statement ends with a semicolon.', 'Read compiler errors from the top: the first one is usually the real problem.', 'Integer division drops the remainder, so 7 / 2 is 3.', 'Declare a variable before you use it.', 'main() returns 0 when everything went fine.'],
  cpp: ['Prefer std::string over raw character arrays.', 'Read compiler errors from the top: the first one is usually the real problem.', 'endl ends a line, and a bool prints as 1 or 0.', 'Include the header that owns the tool you use, like iostream for cout.', 'Integer division drops the remainder, so 7 / 2 is 3.']
};
const BADGES = [
  { id: 'first', icon: 'terminal', name: 'Hello, world', desc: 'Run your first program' },
  { id: 'perfect', icon: 'target', name: 'Zero errors', desc: 'Answer every quiz question right' },
  { id: 'green', icon: 'check', name: 'All green', desc: 'Pass a coding challenge' },
  { id: 'chapter', icon: 'flag', name: 'Chapter charmer', desc: 'Finish a whole chapter' },
  { id: 'quests', icon: 'trophy', name: 'Quest crusher', desc: 'Claim all three daily quests' },
  { id: 'poly', icon: 'globe', name: 'Polyglot', desc: 'Make progress in two courses' }
];

/* ---------- course content ---------- */
const S_ = (title, body, code, tryIt, callout) => ({ title, body, code, tryIt, callout });
const Q = (q, options, answer, why) => ({ q, options, answer, why });
const T = (label, check) => ({ label, check });
const PRE = (id, emoji, title, alias, minutes, blurb, topics) => ({ id, emoji, title, alias, minutes, blurb, topics });

const PY = [
  {
    id: 'ch1', emoji: '👋', title: 'Hello, Python', alias: 'First hiss', minutes: 25,
    blurb: 'Print your first lines, use Python as a calculator, and leave notes for yourself.',
    sections: [
      S_('Say hello with print()', `<p>Python reads your program from top to bottom, one line at a time. The <code>print()</code> function shows something on the screen. Whatever you put inside the brackets is what appears.</p>`, `print("Hello, Pythonista!")\nprint("Python reads top to bottom")`, 'Change the text inside the quotes and run it again.', `Text in Python is called a <b>string</b>. It always sits inside quotes, either "double" or 'single'.`),
      S_('Numbers and math', `<p>Numbers don't need quotes. Python works as a calculator with <code>+</code> <code>-</code> <code>*</code> <code>/</code>. Note that <code>/</code> always gives a decimal answer. On text, <code>+</code> joins strings together and <code>*</code> repeats them.</p>`, `print(2 + 3)\nprint(10 / 4)\nprint("Py" + "thon")\nprint("ha" * 3)`, 'Add a line like print(7 * 6) to the bottom.', `Quotes change the meaning. <code>print(5 + 5)</code> shows 10, but <code>print("5" + "5")</code> shows 55.`),
      S_('Comments: notes for humans', `<p>A <code>#</code> starts a comment. Python ignores everything from the <code>#</code> to the end of the line, so you can explain your code to your future self.</p>`, `# Python ignores this whole line\nprint("Comments explain why")  # and this part too`, 'Remove the # from the first line and see what Python says.', `Readability counts. A short, clear comment is worth more than a clever trick.`)
    ],
    quiz: [
      Q('Which function shows text on the screen?', ['<code>echo()</code>', '<code>print()</code>', '<code>show()</code>', '<code>display()</code>'], 1, '<code>print()</code> is Python\'s built-in way to show output. The others are not built into Python.'),
      Q('What does Python do with a line that starts with <code>#</code>?', ['Runs it as code', 'Prints it on the screen', 'Ignores it, it is a comment', 'Raises an error'], 2, 'Everything after a <code>#</code> is a comment, written for humans. Python skips it.'),
      Q('What does <code>print("Py" + "thon")</code> display?', ['Python', 'Py thon', 'Py+thon', 'It raises an error'], 0, 'With strings, <code>+</code> joins them end to end. It does not add a space.'),
      Q('Which line has a mistake?', ['<code>print("Hi")</code>', '<code>print(\'Hi\')</code>', '<code>print("Hi)</code>', '<code>print("Hi", "there")</code>'], 2, 'The closing quote is missing, so Python reports an unterminated string.')
    ],
    challenge: {
      title: 'Introduce yourself',
      prompt: `<p>Store the text <code>"Ada"</code> in a variable called <code>name</code>. Then use an f-string to print this exact line:</p><p><code>Hello, Ada! Welcome to Python.</code></p>`,
      starter: `# Store "Ada" in a variable called name\n# Then print: Hello, Ada! Welcome to Python.\n\n`,
      hint: `An f-string starts with <code>f</code> before the opening quote, and <code>{name}</code> drops the variable's value into the text.`,
      tests: [T('Prints exactly: Hello, Ada! Welcome to Python.', (c, o) => o.trim() === 'Hello, Ada! Welcome to Python.'), T('Stores the text in a variable called name', c => /^\s*name\s*=/m.test(c)), T('Uses an f-string', c => /\bf["']/.test(c))]
    }
  },
  {
    id: 'ch2', emoji: '🏷️', title: 'Variables and types', alias: 'Naming things', minutes: 30,
    blurb: 'Give values names, learn the four basic types, and mix variables into text with f-strings.',
    sections: [
      S_('Variables are labelled boxes', `<p>A variable is a name that holds a value. Use <code>=</code> to put a value in, and use the name whenever you need it back. Unlike in math class, <code>=</code> here means "store this", not "is equal to".</p>`, `score = 10\nprint(score)\n\nscore = score + 5\nprint(score)`, 'Change the starting score, or add another variable.', `Names can use letters, digits and underscores, but can't start with a digit. Python style is snake_case: <code>my_score</code>, not <code>my-score</code>.`),
      S_('Four types you will meet first', `<p>Every value has a type, and Python works it out from how you write it.</p><table><tr><th>Type</th><th>What it holds</th><th>Example</th></tr><tr><td><code>int</code></td><td>Whole numbers</td><td><code>15</code></td></tr><tr><td><code>float</code></td><td>Decimal numbers</td><td><code>99.5</code></td></tr><tr><td><code>str</code></td><td>Text</td><td><code>"Ada"</code></td></tr><tr><td><code>bool</code></td><td>True or False</td><td><code>True</code></td></tr></table>`, `age = 15\nprice = 99.5\nname = "Ada"\nis_student = True\n\nprint(type(age))\nprint(type(price))\nprint(type(name))\nprint(type(is_student))`, 'Change age to 15.0 and see how its type changes.', `<code>type()</code> is a handy way to check what you are holding when something behaves oddly.`),
      S_('f-strings: text with blanks', `<p>An f-string lets you drop variables and calculations straight into text. Put an <code>f</code> before the opening quote, then write anything inside curly braces.</p>`, `name = "Ada"\nmarks = 92\n\nprint(f"{name} scored {marks}")\nprint(f"Half of that is {marks / 2:.1f}")`, 'Change marks and run it again.', `<code>:.1f</code> inside the braces means "show one decimal place".`)
    ],
    quiz: [
      Q('What type is the value <code>3.14</code>?', ['<code>int</code>', '<code>float</code>', '<code>str</code>', '<code>bool</code>'], 1, 'A number with a decimal point is a <code>float</code>.'),
      Q('What does <code>print(7 // 2)</code> show?', ['3.5', '4', '3', '3.0'], 2, '<code>//</code> is floor division: it divides, then drops the decimal part.'),
      Q('Which is a valid variable name?', ['<code>2nd_place</code>', '<code>my-score</code>', '<code>my_score</code>', '<code>class</code>'], 2, 'Names cannot start with a digit, contain hyphens, or reuse Python keywords like <code>class</code>.')
    ],
    challenge: {
      title: 'Tip calculator',
      prompt: `<p>A bill is 840 and the tip is 10 percent. Work out the tip in a variable called <code>tip</code>, then print this exact line using an f-string:</p><p><code>Total: 924.0</code></p>`,
      starter: `bill = 840\ntip_percent = 10\n\n# Work out the tip, then print the total\n`,
      hint: `Percent means "out of 100", so <code>tip = bill * tip_percent / 100</code>. Then print <code>f"Total: {bill + tip}"</code>.`,
      tests: [T('Prints exactly: Total: 924.0', (c, o) => o.trim() === 'Total: 924.0'), T('Stores the tip in a variable called tip', c => /^\s*tip\s*=/m.test(c)), T('Calculates the total instead of typing 924', c => !/924/.test(c))]
    }
  },
  {
    id: 'ch3', emoji: '🔀', title: 'Making decisions', alias: 'Fork in the path', minutes: 30,
    blurb: 'Teach your programs to choose: run one block of code or another depending on the data.',
    sections: [
      S_('if, elif and else', `<p>An <code>if</code> checks a condition and only runs its indented block when that condition is <code>True</code>. Add <code>elif</code> ("else if") for more checks, and <code>else</code> as the fallback when nothing else matched.</p>`, `temp = 15\n\nif temp > 25:\n    print("It's hot")\nelif temp > 10:\n    print("It's mild")\nelse:\n    print("It's cold")`, 'Change temp to 30 and run it again.', `Python uses <b>indentation</b> (4 spaces) to mark a block instead of curly braces. Lines indented the same amount belong to the same block.`),
      S_('Comparison operators', `<p>Comparisons produce <code>True</code> or <code>False</code>. There is <code>==</code> (equal), <code>!=</code> (not equal), <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code> and <code>&gt;=</code>.</p>`, `age = 20\n\nprint(age == 20)\nprint(age != 18)\nprint(age >= 18)\nprint(age < 13)`, 'Change age to 13 and predict each line before running.', `A single <code>=</code> assigns a value. A double <code>==</code> compares two values. Mixing them up is one of the most common beginner mistakes.`),
      S_('Combining conditions with and, or, not', `<p><code>and</code> needs both sides to be true, <code>or</code> needs just one side, and <code>not</code> flips a <code>True</code>/<code>False</code> value.</p>`, `age = 16\nhas_ticket = True\n\nif age >= 18 and has_ticket:\n    print("Welcome in")\nelif age >= 13 and has_ticket:\n    print("Teen ticket")\nelse:\n    print("Not allowed")\n\nprint(not has_ticket)`, 'Set has_ticket to False and see which branch runs.', `Python checks <code>and</code>/<code>or</code> left to right and stops as soon as the answer is certain.`)
    ],
    quiz: [
      Q('What does the condition in an <code>if</code> statement need to produce?', ['A number', 'A string', '<code>True</code> or <code>False</code>', 'A list'], 2, '<code>if</code> checks whether the condition is truthy, which in practice means a bool.'),
      Q('Which operator checks "equal to"?', ['<code>=</code>', '<code>==</code>', '<code>!=</code>', '<code>&lt;&gt;</code>'], 1, 'A single <code>=</code> assigns a value. <code>==</code> checks whether two values are equal.'),
      Q('What does this print?<br><code>x = 7<br>if x > 10:<br>&nbsp;&nbsp;&nbsp;&nbsp;print("A")<br>elif x > 5:<br>&nbsp;&nbsp;&nbsp;&nbsp;print("B")<br>else:<br>&nbsp;&nbsp;&nbsp;&nbsp;print("C")</code>', ['A', 'B', 'C', 'Nothing prints'], 1, '<code>x &gt; 10</code> is false, but <code>x &gt; 5</code> is true, so the <code>elif</code> branch runs.'),
      Q('What does <code>age >= 18 and has_ticket</code> need to be <code>True</code>?', ['Just age', 'Just has_ticket', 'Both conditions', 'Either condition'], 2, '<code>and</code> only produces <code>True</code> when both sides are true.')
    ],
    challenge: {
      title: 'Ticket pricing',
      prompt: `<p>A cinema charges by age: under 5 is <code>0</code>, 5 up to (but not including) 18 is <code>12</code>, 18 up to (but not including) 65 is <code>20</code>, and 65 or older is <code>15</code>. <code>age</code> is already set to 30. Print the exact price as a plain number, which should print exactly:</p><p><code>20</code></p>`,
      starter: `age = 30\n\n# Print the ticket price for this age\n`,
      hint: `Order your <code>elif</code> checks from youngest to oldest: <code>if age &lt; 5</code>, <code>elif age &lt; 18</code>, <code>elif age &lt; 65</code>, <code>else</code>.`,
      tests: [T('Prints exactly: 20', (c, o) => o.trim() === '20'), T('Stores the age in a variable called age', c => /^\s*age\s*=/m.test(c)), T('Uses elif for the extra checks', c => /\belif\b/.test(c))]
    }
  },
  {
    id: 'ch4', emoji: '🔁', title: 'Loops', alias: 'Slithering in circles', minutes: 35,
    blurb: 'Repeat work without repeating yourself.',
    sections: [
      S_('for loops and range()', `<p>A <code>for</code> loop runs its block once for each item. <code>range(5)</code> produces <code>0, 1, 2, 3, 4</code>, five numbers starting at zero. <code>range(2, 6)</code> starts at 2 and stops right before 6.</p>`, `for i in range(5):\n    print(i)\n\nfor i in range(2, 6):\n    print(i)`, 'Change range(5) to range(1, 6) and run it.', `<code>range(start, stop)</code> always stops <b>before</b> the second number, never on it.`),
      S_('while loops', `<p>A <code>while</code> loop repeats as long as its condition stays <code>True</code>. Something inside the loop must move it toward becoming false, or it never stops.</p>`, `count = 0\ntotal = 0\n\nwhile count < 5:\n    total += count\n    count += 1\n\nprint(total)`, 'Change count < 5 to count < 10 and predict the new total before running.', `If you forget to update the loop variable, a <code>while</code> loop runs forever. Always make sure something inside the loop moves it toward stopping.`),
      S_('break and continue', `<p><code>continue</code> skips the rest of the current pass and jumps to the next one. <code>break</code> stops the whole loop immediately, even if there is more to go.</p>`, `for n in range(10):\n    if n == 3:\n        continue\n    if n == 7:\n        break\n    print(n)`, 'Remove the continue line and see how the output changes.', `<code>continue</code> jumps to the next loop pass immediately. <code>break</code> stops the entire loop.`)
    ],
    quiz: [
      Q('How many times does <code>for i in range(4):</code> run its body?', ['3', '4', '5', 'It depends'], 1, '<code>range(4)</code> produces 0, 1, 2, 3 — four values.'),
      Q('What must a while loop do to avoid running forever?', ['Print something', 'Use range()', 'Change something that affects the condition', 'Use break every time'], 2, 'Without updating something the condition depends on, the condition never becomes false.'),
      Q('What does this print?<br><code>total = 0<br>for n in [1, 2, 3, 4]:<br>&nbsp;&nbsp;&nbsp;&nbsp;if n % 2 == 0:<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;continue<br>&nbsp;&nbsp;&nbsp;&nbsp;total += n<br>print(total)</code>', ['10', '4', '6', '0'], 1, '<code>continue</code> skips the even numbers, so only 1 and 3 are added: 1 + 3 = 4.'),
      Q("Which keyword stops a loop immediately, even if there's more to go?", ['<code>continue</code>', '<code>pass</code>', '<code>break</code>', '<code>return</code>'], 2, '<code>break</code> exits the loop right away. <code>continue</code> only skips to the next pass.')
    ],
    challenge: {
      title: 'Countdown',
      prompt: `<p>Print the numbers from 5 down to 1, one per line, then print exactly:</p><p><code>Liftoff!</code></p>`,
      starter: `# Print 5, 4, 3, 2, 1 on their own lines, then print Liftoff!\n`,
      hint: `<code>range(5, 0, -1)</code> counts down from 5 to 1. Or use a <code>while</code> loop that subtracts 1 each time.`,
      tests: [T('Prints exactly: 5, 4, 3, 2, 1, Liftoff!', (c, o) => o.trim() === '5\n4\n3\n2\n1\nLiftoff!'), T('Uses a loop instead of separate print calls', c => /\bfor\b|\bwhile\b/.test(c))]
    }
  },
  {
    id: 'ch5', emoji: '🧩', title: 'Functions', alias: 'Reusable magic', minutes: 40,
    blurb: 'Package code into named, reusable pieces.',
    sections: [
      S_('def, parameters and return', `<p><code>def</code> starts a function definition. The names in parentheses are <b>parameters</b>. <code>return</code> sends a value back to whoever called the function and immediately ends it.</p>`, `def square(n):\n    return n * n\n\nprint(square(4))\nprint(square(9))`, 'Write a function cube(n) that returns n*n*n, then print cube(3).', `A function with no <code>return</code> statement gives back <code>None</code>.`),
      S_('Default and keyword arguments', `<p>A parameter can have a default value, making it optional. You can also call a function with <b>keyword arguments</b>, naming which parameter you're setting, in any order.</p>`, `def greet(name, greeting="Hello"):\n    return greeting + ", " + name + "!"\n\nprint(greet("Ada"))\nprint(greet("Ada", "Hi"))\nprint(greet(name="Ada", greeting="Hey"))`, "Call greet using only keyword arguments, in a different order.", `A parameter with a default becomes optional. Parameters without a default must always come first.`),
      S_('Where variables live (scope)', `<p>A variable assigned inside a function is <b>local</b>: it only exists while that function is running, and a separate variable outside with the same name is untouched. To change an outer variable from inside a function, declare it with <code>global</code> first.</p>`, `total = 0\n\ndef add_to_total(n):\n    global total\n    total += n\n\nadd_to_total(5)\nadd_to_total(3)\nprint(total)`, 'Remove the global line, run it, and predict why the answer changes.', `Without <code>global</code>, <code>total += n</code> inside the function creates and updates its <b>own local copy</b>, leaving the outer <code>total</code> untouched.`)
    ],
    quiz: [
      Q('What does a function return if it has no <code>return</code> statement?', ['<code>0</code>', '<code>None</code>', 'An error', 'The last variable used'], 1, 'Without <code>return</code>, a function gives back <code>None</code>.'),
      Q("Given <code>def greet(name, greeting='Hello'):</code>, which call is valid?", ['<code>greet()</code>', "<code>greet('Ada')</code>", "<code>greet(greeting='Hi')</code>", '<code>greet(1, 2, 3)</code>'], 1, '<code>name</code> has no default, so it is required. The others are missing it or pass too many arguments.'),
      Q('What does this print?<br><code>def f(x):<br>&nbsp;&nbsp;&nbsp;&nbsp;x = x + 1<br>&nbsp;&nbsp;&nbsp;&nbsp;return x<br><br>n = 5<br>print(f(n))<br>print(n)</code>', ['6 then 6', '5 then 5', '6 then 5', '5 then 6'], 2, 'Inside the function, x is a separate local variable. Changing it does not touch n outside.'),
      Q('Which keyword lets a function change a variable defined outside it?', ['<code>var</code>', '<code>global</code>', '<code>this</code>', '<code>outer</code>'], 1, '<code>global</code> tells Python an assignment should update the outer variable, not create a local one.')
    ],
    challenge: {
      title: 'Average finder',
      prompt: `<p>Write a function called <code>average(numbers)</code> that returns the average of a list of numbers. Then print <code>average([4, 8, 15, 16, 23, 42])</code>, which should print exactly:</p><p><code>18.0</code></p>`,
      starter: `# Write a function called average that returns the mean of a list\n\n# Then print average([4, 8, 15, 16, 23, 42])\n`,
      hint: `Use <code>sum(numbers) / len(numbers)</code>. Dividing with <code>/</code> always gives a decimal answer.`,
      tests: [T('Prints exactly: 18.0', (c, o) => o.trim() === '18.0'), T('Defines a function called average', c => /\bdef\s+average\s*\(/.test(c)), T('Uses sum() and len()', c => /\bsum\s*\(/.test(c) && /\blen\s*\(/.test(c))]
    }
  },
  {
    id: 'ch6', emoji: '🧺', title: 'Collections', alias: 'A basket of values', minutes: 45,
    blurb: 'Store many values together and look them up quickly.',
    sections: [
      S_('Lists and tuples', `<p>A <b>list</b> is an ordered, changeable collection, written with square brackets. Index from <code>0</code>; negative indices count from the end. A <b>tuple</b>, written with round brackets, is like a list but can't be changed after creation.</p>`, `fruits = ["apple", "banana", "cherry"]\nprint(fruits)\nprint(fruits[0])\nprint(fruits[-1])\n\nfruits.append("date")\nprint(fruits)\n\npoint = (3, 4)\nprint(point[0], point[1])`, 'Add fruits.sort() before the last fruits print and see the new order.', `Square brackets make a list. Round brackets with a comma make a tuple. Lists can grow and shrink; tuples stay the same size.`),
      S_('Dictionaries', `<p>A <b>dictionary</b> maps keys to values. Use square brackets to get or set by key. <code>.get(key, default)</code> returns a fallback instead of raising an error when the key is missing.</p>`, `ages = {"Ada": 28, "Sam": 34}\nprint(ages["Ada"])\n\nages["Max"] = 19\nprint(ages)\n\nprint(ages.get("Nina", 0))`, 'Try printing ages["Nina"] directly (without .get) and read the error.', `Square brackets raise a <code>KeyError</code> for a missing key. <code>.get(key, default)</code> returns a fallback value instead, which is often safer.`),
      S_('Sets and common patterns', `<p>A <b>set</b> holds unique values with no particular order, great for removing duplicates and for fast membership checks with <code>in</code>.</p>`, `nums = [1, 2, 2, 3, 3, 3]\nunique = set(nums)\nprint(len(unique))\nprint(3 in unique)\n\nnames = ["Ada", "Sam", "Ada", "Max"]\nprint(len(set(names)))`, 'Print unique directly and compare it to nums.', `A set automatically drops duplicates. Checking <code>x in</code> a list or a set both work, but sets are built for fast membership checks.`)
    ],
    quiz: [
      Q('What does <code>fruits[-1]</code> give you?', ['An error', 'The first item', 'The last item', 'A random item'], 2, 'A negative index counts backwards from the end, so -1 is the last item.'),
      Q('Which collection can you change after creating it?', ['List', 'Tuple', 'Both', 'Neither'], 0, 'Lists are changeable. Tuples are immutable once created.'),
      Q('What does this print?<br><code>scores = {"Ada": 90, "Sam": 75}<br>print(scores.get("Max", "not found"))</code>', ['<code>0</code>', '<code>None</code>', 'An error', '<code>not found</code>'], 3, '"Max" is not a key, so <code>.get</code> returns the fallback value given as its second argument.'),
      Q('What is special about the values stored in a set?', ['They are sorted', 'They are unique', 'They are strings only', 'They are pairs'], 1, 'A set automatically removes duplicate values.')
    ],
    challenge: {
      title: 'Word counter',
      prompt: `<p><code>words = ["red", "blue", "red", "green", "blue", "red"]</code> is given. Build a dictionary called <code>counts</code> that maps each word to how many times it appears, then print <code>counts["red"]</code>, which should print exactly:</p><p><code>3</code></p>`,
      starter: `words = ["red", "blue", "red", "green", "blue", "red"]\ncounts = {}\n\n# Count how many times each word appears, then print counts["red"]\n`,
      hint: `Loop over <code>words</code>. For each one, check with <code>in</code> whether it's already a key in <code>counts</code>; if so add 1 to it, otherwise set it to 1.`,
      tests: [T('Prints exactly: 3', (c, o) => o.trim() === '3'), T('Builds a dictionary called counts', c => /\bcounts\s*=\s*\{/.test(c) || /\bcounts\s*\[/.test(c)), T('Loops over the words', c => /\bfor\b/.test(c))]
    }
  },
  {
    id: 'ch7', emoji: '🏗️', title: 'Classes and objects', alias: 'Build your own types', minutes: 45,
    blurb: 'Bundle data and behaviour into your own types.',
    sections: [
      S_('Classes and instances', `<p>A <b>class</b> is a blueprint. An <b>instance</b> is one object made from that blueprint, and each instance can hold its own separate data.</p>`, `class Dog:\n    pass\n\nrex = Dog()\nrex.name = "Rex"\nfido = Dog()\nfido.name = "Fido"\n\nprint(rex.name)\nprint(fido.name)`, 'Give fido an age too: fido.age = 3, then print it.', `Each instance (<code>rex</code>, <code>fido</code>) has its own separate attributes, even though they come from the same class.`),
      S_('Methods and __init__', `<p><code>__init__</code> runs automatically when you create an instance, used to set up its starting values. A <b>method</b> is a function defined inside a class, and <code>self</code> refers to the instance the method was called on.</p>`, `class Dog:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\n    def describe(self):\n        return self.name + " is " + str(self.age) + " years old"\n\nrex = Dog("Rex", 4)\nprint(rex.describe())`, 'Add a method birthday(self) that adds 1 to self.age, then call rex.birthday() and print rex.age.', `<code>self</code> is always the first parameter of a method, and Python passes it automatically — you never supply it yourself when you call the method.`),
      S_('Inheritance basics', `<p>A class can inherit from another, written as <code>class Cat(Animal):</code>. It reuses the parent's methods and can override just the ones that should behave differently.</p>`, `class Animal:\n    def __init__(self, name):\n        self.name = name\n\n    def speak(self):\n        return self.name + " makes a sound"\n\nclass Cat(Animal):\n    def speak(self):\n        return self.name + " says meow"\n\nclass Cow(Animal):\n    pass\n\ntom = Cat("Tom")\nbessie = Cow("Bessie")\nprint(tom.speak())\nprint(bessie.speak())`, 'Add a Dog class that inherits from Animal and overrides speak to say woof.', `A subclass gets everything from its parent for free, and can override just the parts that should behave differently.`)
    ],
    quiz: [
      Q('What is a class?', ['A single value', 'A blueprint for creating objects', 'A loop', 'A built-in function'], 1, 'A class describes what instances made from it will look like and be able to do.'),
      Q('When does <code>__init__</code> run?', ['Whenever you call any method', 'Automatically when you create a new instance', 'Only if you call it by name', 'Never automatically'], 1, '<code>__init__</code> is Python\'s constructor: it runs the moment an instance is created.'),
      Q('What does this print?<br><code>class Box:<br>&nbsp;&nbsp;&nbsp;&nbsp;def __init__(self, items):<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;self.items = items<br>&nbsp;&nbsp;&nbsp;&nbsp;def count(self):<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return len(self.items)<br><br>b = Box([1, 2, 3])<br>print(b.count())</code>', ['<code>3</code>', '<code>[1, 2, 3]</code>', 'An error', '<code>0</code>'], 0, 'count() returns the length of self.items, which has 3 entries.'),
      Q("A subclass that doesn't define its own speak() method but inherits from a class that does will...", ['Raise an error', "Use the parent's speak()", 'Have no speak() at all', 'Need an empty speak() written manually'], 1, 'If a subclass has no method of its own, Python looks it up on the parent class instead.')
    ],
    challenge: {
      title: 'Rectangle class',
      prompt: `<p>Write a class called <code>Rectangle</code> with an <code>__init__(self, width, height)</code> that stores both, and a method <code>area(self)</code> that returns width times height. Create a Rectangle with width 6 and height 3, then print its area, which should print exactly:</p><p><code>18</code></p>`,
      starter: `# Define a class called Rectangle with width, height and an area() method\n\n# Then create one with width 6 and height 3, and print its area\n`,
      hint: `<code>self.width = width</code> inside <code>__init__</code> saves the value on the instance. <code>area</code> should return <code>self.width * self.height</code>.`,
      tests: [T('Prints exactly: 18', (c, o) => o.trim() === '18'), T('Defines a class called Rectangle', c => /\bclass\s+Rectangle\b/.test(c)), T('Defines an area method', c => /\bdef\s+area\s*\(/.test(c))]
    }
  },
  {
    id: 'ch8', emoji: '🚀', title: 'Mini projects', alias: 'Put it all together', minutes: 60,
    blurb: 'Combine everything into small programs you can show off.',
    sections: [
      S_('Number guessing game', `<p>A real guessing game reads each guess with <code>input()</code> as the player types it. This runner works with a fixed list of guesses instead, but the checking logic is exactly the same.</p>`, `secret = 7\nguesses = [3, 9, 6, 7]\n\nfor guess in guesses:\n    if guess == secret:\n        print(str(guess) + ": correct!")\n        break\n    elif guess < secret:\n        print(str(guess) + ": too low")\n    else:\n        print(str(guess) + ": too high")`, 'Change the order of guesses, or add a guess after 7 and see that it never runs.', `<code>break</code> stops the loop the moment the secret is found, so any guesses after it in the list are never checked.`),
      S_('Quiz maker', `<p>A list of dictionaries is a common way to store a table of similar records. Here, each question bundles its own text, correct answer and the player's chosen answer.</p>`, `quiz = [\n    {"q": "2 + 2", "answer": "4", "chosen": "4"},\n    {"q": "Capital of France", "answer": "Paris", "chosen": "Paris"},\n    {"q": "7 * 8", "answer": "56", "chosen": "54"}\n]\n\nscore = 0\nfor item in quiz:\n    if item["chosen"] == item["answer"]:\n        score += 1\n\nprint(f"You scored {score} out of {len(quiz)}")`, 'Add a fourth question to the quiz list and see the score update.', `Storing related values together in one dictionary per question keeps everything about a question in one place.`),
      S_('Expense tracker', `<p>Combine a loop with <code>.get(key, 0)</code> to build up a running total per category: start at 0 the first time you see a new key, then keep adding to it.</p>`, `expenses = [\n    {"category": "food", "amount": 12.5},\n    {"category": "transport", "amount": 5},\n    {"category": "food", "amount": 7.25}\n]\n\ntotals = {}\nfor e in expenses:\n    cat = e["category"]\n    totals[cat] = totals.get(cat, 0) + e["amount"]\n\nfor cat, amount in totals.items():\n    print(cat, amount)\n\nprint("Total:", sum(totals.values()))`, "Add a third category like 'fun' with an expense, and see a new line appear.", `<code>totals.values()</code> gives just the numbers, which <code>sum()</code> can add up directly.`)
    ],
    quiz: [
      Q('What does this print?<br><code>secret = 4<br>for guess in [1, 4, 9]:<br>&nbsp;&nbsp;&nbsp;&nbsp;if guess == secret:<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;print("found it")<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;break</code>', ['found it', 'found it, three times', 'Nothing', 'An error'], 0, 'The loop finds 4 on its second pass, prints once, then break stops it before reaching 9.'),
      Q('Why does this runner use a fixed list of guesses instead of <code>input()</code>?', ['<code>input()</code> is slower', "This runner doesn't support reading typed input yet", 'Lists are faster than input', 'There is no reason'], 1, 'This runner has no way to pause and wait for typed input, so examples use a ready-made list instead.'),
      Q('A list of dictionaries, like the quiz list, is useful for...', ['Storing one single value', 'Storing a table of similar records, each with named fields', 'Making a program run faster', 'Replacing for loops'], 1, 'Each dictionary in the list is one record, with its fields accessible by name.'),
      Q('What does <code>dict.get(key, 0)</code> do if key is missing?', ['Raises an error', 'Returns <code>None</code>', 'Returns <code>0</code>', 'Deletes the key'], 2, 'The second argument to <code>.get()</code> is the fallback value to use when the key is not found.')
    ],
    challenge: {
      title: 'Grade book',
      prompt: `<p><code>scores = {"Ada": 95, "Sam": 42, "Max": 60, "Lee": 59}</code> is given. Write a function called <code>passed(scores)</code> that returns a list of the names with a score of 60 or more, then print <code>passed(scores)</code>, which should print exactly:</p><p><code>['Ada', 'Max']</code></p>`,
      starter: `scores = {"Ada": 95, "Sam": 42, "Max": 60, "Lee": 59}\n\n# Write a function called passed that returns a list of names with score >= 60\n\n# Then print passed(scores)\n`,
      hint: `Loop over <code>scores.items()</code> to get each name and score together, and build up a list with <code>.append()</code>.`,
      tests: [T("Prints exactly: ['Ada', 'Max']", (c, o) => o.trim() === "['Ada', 'Max']"), T('Defines a function called passed', c => /\bdef\s+passed\s*\(/.test(c)), T('Loops over the scores', c => /\bfor\b/.test(c))]
    }
  }
];

const CC = [
  {
    id: 'ch1', emoji: '👋', title: 'Hello, C', alias: 'First compile', minutes: 25,
    blurb: 'Write your first C program, print to the screen, and see how a program is laid out.',
    sections: [
      S_('Anatomy of a C program', `<p>Every C program starts running at a function called <code>main()</code>. The <code>#include &lt;stdio.h&gt;</code> line brings in the tools for input and output, and <code>printf()</code> prints text. Each statement ends with a semicolon.</p>`,
        R`#include <stdio.h>

int main() {
    printf("Hello, C!\n");
    printf("Every statement ends with a semicolon\n");
    return 0;
}`, 'Change the text inside the quotes and run it again.', `<code>\\n</code> means "start a new line". Without it, the next <code>printf</code> continues on the same line.`),
      S_('Printing numbers and math', `<p>Inside <code>printf</code>, a placeholder such as <code>%d</code> (whole number) or <code>%f</code> (decimal number) is replaced by the values you list after the text.</p>`,
        R`#include <stdio.h>

int main() {
    printf("%d\n", 2 + 3);
    printf("%d\n", 10 / 4);
    printf("%f\n", 10 / 4.0);
    printf("Sum: %d, product: %d\n", 6 + 4, 6 * 4);
    return 0;
}`, 'Change 10 / 4.0 to 10 / 4 and see what %f prints.', `<code>10 / 4</code> gives 2, not 2.5. When both numbers are whole, C does integer division and drops the remainder. Write <code>4.0</code> to get a decimal result.`),
      S_('Comments: notes for humans', `<p>C has two comment styles. <code>//</code> comments out the rest of a line, and <code>/* ... */</code> comments out everything between the markers. The compiler ignores them both.</p>`,
        R`#include <stdio.h>

int main() {
    // A single-line comment
    /* A block comment, also fine */
    printf("Comments are ignored\n"); // even here
    return 0;
}`, 'Put // in front of the printf line and run it again.', `<code>return 0;</code> tells the operating system the program finished without problems.`)
    ],
    quiz: [
      Q('Where does a C program start running?', ['The first <code>#include</code>', 'The first <code>printf</code>', 'The last line', 'The <code>main()</code> function'], 3, 'Execution always begins at <code>main()</code>, no matter where other code sits in the file.'),
      Q('What does <code>\\n</code> do inside <code>printf</code> text?', ['Starts a new line', 'Prints a backslash and an n', 'Ends the program', 'Adds a space'], 0, '<code>\\n</code> is an escape sequence that moves the output to the next line.'),
      Q('Which line is missing something?', ['<code>int main() {</code>', '<code>return 0;</code>', '<code>printf("Hi")</code>', '<code>printf("Hi");</code>'], 2, 'Every statement in C ends with a semicolon. The compiler reports it as "expected \';\'".'),
      Q('What does <code>printf("%d\\n", 10 / 4);</code> print?', ['2.5', '2', '3', '2.0'], 1, 'Both numbers are integers, so C does integer division and drops the remainder.')
    ],
    challenge: {
      title: 'Greeting card',
      prompt: `<p>Write a program that prints exactly these two lines, each on its own line:</p><p><code>Hello, Ada!</code><br><code>Welcome to C.</code></p>`,
      starter: R`#include <stdio.h>

int main() {
    // Print two lines:
    // Hello, Ada!
    // Welcome to C.

    return 0;
}`,
      hint: `Use one <code>printf</code> per line and finish each text with <code>\\n</code>, for example <code>printf("Hello, Ada!\\n");</code>.`,
      tests: [T('Prints Hello, Ada! then Welcome to C. on two lines', (c, o) => o.trim() === 'Hello, Ada!\nWelcome to C.'), T('Uses printf', c => /printf\s*\(/.test(c)), T('Uses \\n to end a line', c => /\\n/.test(c))]
    }
  },
  {
    id: 'ch2', emoji: '🏷️', title: 'Variables and types', alias: 'Declaring things', minutes: 30,
    blurb: 'Store values in typed variables, do arithmetic with them, and print them with format specifiers.',
    sections: [
      S_('Declaring variables', `<p>In C you write the type before the name, and the type is fixed for the life of the variable. <code>int</code> holds whole numbers, <code>float</code> holds decimals and <code>char</code> holds a single character.</p>`,
        R`#include <stdio.h>

int main() {
    int age = 15;
    float price = 99.5;
    char grade = 'A';

    printf("Age: %d\n", age);
    printf("Price: %.2f\n", price);
    printf("Grade: %c\n", grade);
    return 0;
}`, 'Change age and price, then run it again.', `Unlike Python, you can't put a decimal into an <code>int</code> and keep it: <code>int x = 3.9;</code> stores 3.`),
      S_('Math with variables', `<p>The usual operators work on variables. <code>%</code> gives the remainder after division, and it only works on whole numbers.</p>`,
        R`#include <stdio.h>

int main() {
    int apples = 7;
    int people = 2;
    printf("Each gets %d\n", apples / people);
    printf("Left over: %d\n", apples % people);
    printf("Exact share: %.1f\n", apples / 2.0);
    return 0;
}`, 'Change apples to 10 and predict the output before you run it.', `Integer division and <code>%</code> go together: <code>7 / 2</code> is 3 and <code>7 % 2</code> is 1.`),
      S_('Format specifiers', `<p>Each placeholder in <code>printf</code> matches a type.</p><table><tr><th>Placeholder</th><th>Prints</th><th>Example</th></tr><tr><td><code>%d</code></td><td>int</td><td><code>42</code></td></tr><tr><td><code>%f</code></td><td>float or double</td><td><code>3.140000</code></td></tr><tr><td><code>%c</code></td><td>one character</td><td><code>A</code></td></tr><tr><td><code>%s</code></td><td>text (string)</td><td><code>Ada</code></td></tr></table>`,
        R`#include <stdio.h>

int main() {
    char name[] = "Ada";
    int marks = 92;
    printf("%s scored %d\n", name, marks);
    printf("Half of that is %.1f\n", marks / 2.0);
    printf("Padded: [%5d]\n", marks);
    return 0;
}`, 'Change %5d to %-5d and see where the spaces go.', `<code>%.1f</code> means "one digit after the decimal point" and <code>%5d</code> means "at least 5 characters wide".`)
    ],
    quiz: [
      Q('Which declaration stores a whole number?', ['<code>float x = 3;</code>', '<code>int x = 3;</code>', '<code>char x = 3.5;</code>', '<code>text x = 3;</code>'], 1, '<code>int</code> is the type for whole numbers. <code>text</code> is not a C type.'),
      Q('What does <code>printf("%d\\n", 7 % 3);</code> print?', ['2', '0', '1', '2.33'], 2, '7 divided by 3 is 2 with a remainder of 1, and <code>%</code> gives the remainder.'),
      Q('Which placeholder prints a decimal number?', ['<code>%d</code>', '<code>%c</code>', '<code>%f</code>', '<code>%s</code>'], 2, '<code>%f</code> is for <code>float</code> and <code>double</code> values.')
    ],
    challenge: {
      title: 'Rectangle area',
      prompt: `<p>The width and height are given. Store their product in an <code>int</code> variable called <code>area</code>, then print this exact line:</p><p><code>Area: 40</code></p>`,
      starter: R`#include <stdio.h>

int main() {
    int width = 8;
    int height = 5;

    // Store width * height in a variable called area
    // Then print: Area: 40

    return 0;
}`,
      hint: `<code>int area = width * height;</code> then <code>printf("Area: %d\\n", area);</code>.`,
      tests: [T('Prints exactly: Area: 40', (c, o) => o.trim() === 'Area: 40'), T('Stores the result in an int called area', c => /\bint\s+area\s*=/.test(c)), T('Calculates the area instead of typing 40', c => !/\b40\b/.test(c))]
    }
  },
  PRE('ch3', '🔀', 'Making decisions', 'Fork in the road', 30, 'Make your program choose between paths with conditions.', ['if, else if and else', 'Comparison and logical operators', 'switch statements']),
  PRE('ch4', '🔁', 'Loops', 'Going around again', 35, 'Repeat work with loops.', ['for loops', 'while and do-while loops', 'break and continue']),
  PRE('ch5', '🧩', 'Functions', 'Reusable blocks', 40, 'Split your program into named pieces.', ['Declaring and calling functions', 'Parameters and return values', 'Header files and prototypes']),
  PRE('ch6', '🧱', 'Arrays and strings', 'Rows of values', 45, 'Work with many values at once, including text.', ['Arrays and indexing', 'Strings as char arrays', 'Looping over arrays']),
  PRE('ch7', '🎯', 'Pointers', 'Addresses and arrows', 50, 'The idea that makes C feel like C: variables live at addresses.', ['Addresses and the & operator', 'Pointers and dereferencing', 'Pointers and arrays']),
  PRE('ch8', '📦', 'Structs and files', 'Packing data', 55, 'Group data into your own types and read and write files.', ['struct basics', 'Reading and writing files', 'A small project'])
];

const CP = [
  {
    id: 'ch1', emoji: '👋', title: 'Hello, C++', alias: 'First stream', minutes: 25,
    blurb: 'Write your first C++ program and print with cout, the way C++ programmers do.',
    sections: [
      S_('Anatomy of a C++ program', `<p>C++ programs also start at <code>main()</code>. <code>#include &lt;iostream&gt;</code> brings in <code>cout</code>, which sends output to the screen. The <code>&lt;&lt;</code> operator means "put this into the stream", and <code>endl</code> ends the line.</p>`,
        R`#include <iostream>
using namespace std;

int main() {
    cout << "Hello, C++!" << endl;
    cout << "Chain output with <<" << endl;
    return 0;
}`, 'Change the text and add a third cout line.', `Without <code>endl</code> (or <code>"\\n"</code>) the next output continues on the same line.`),
      S_('Numbers and math', `<p><code>cout</code> prints numbers without any placeholders. Just chain the values with <code>&lt;&lt;</code>, and mix text and numbers freely.</p>`,
        R`#include <iostream>
using namespace std;

int main() {
    cout << 2 + 3 << endl;
    cout << 10 / 4 << endl;
    cout << 10 / 4.0 << endl;
    cout << "Sum: " << 6 + 4 << endl;
    return 0;
}`, 'Change 10 / 4.0 to 10 / 4 and see the difference.', `<code>10 / 4</code> is 2 because both numbers are whole. Use <code>4.0</code> for a decimal answer.`),
      S_('Comments and namespaces', `<p><code>cout</code> lives in a namespace called <code>std</code>. <code>using namespace std;</code> saves you from writing <code>std::</code> in front of everything. Or you can skip it and write the prefix yourself.</p>`,
        R`#include <iostream>

int main() {
    // std:: tells C++ where cout lives
    std::cout << "No using-namespace needed" << std::endl;
    return 0;
}`, 'Delete the #include line and read the error message.', `<code>//</code> starts a comment, just like in C. Compiler errors are friendly once you read the first one carefully.`)
    ],
    quiz: [
      Q('Which line prints text in C++?', ['<code>cout &lt;&lt; "Hi";</code>', '<code>print("Hi")</code>', '<code>System.out.println("Hi");</code>', '<code>echo "Hi";</code>'], 0, '<code>cout</code> with the <code>&lt;&lt;</code> operator is the standard way to print in C++.'),
      Q('What does <code>endl</code> do?', ['Ends the program', 'Closes cout', 'Starts a new line', 'Adds a space'], 2, '<code>endl</code> writes a newline and flushes the output.'),
      Q('Which header gives you <code>cout</code>?', ['<code>&lt;stdio.h&gt;</code>', '<code>&lt;iostream&gt;</code>', '<code>&lt;string&gt;</code>', '<code>&lt;cout&gt;</code>'], 1, '<code>&lt;iostream&gt;</code> is the input and output stream header.'),
      Q('What does <code>cout &lt;&lt; 7 / 2 &lt;&lt; endl;</code> print?', ['3.5', '4', '3', '3.0'], 2, 'Both numbers are integers, so C++ does integer division and drops the remainder.')
    ],
    challenge: {
      title: 'Greeting card',
      prompt: `<p>Write a program that prints exactly these two lines, each on its own line:</p><p><code>Hello, Ada!</code><br><code>Welcome to C++.</code></p>`,
      starter: R`#include <iostream>
using namespace std;

int main() {
    // Print two lines:
    // Hello, Ada!
    // Welcome to C++.

    return 0;
}`,
      hint: `<code>cout &lt;&lt; "Hello, Ada!" &lt;&lt; endl;</code> prints one line. Do the same for the second line.`,
      tests: [T('Prints Hello, Ada! then Welcome to C++. on two lines', (c, o) => o.trim() === 'Hello, Ada!\nWelcome to C++.'), T('Uses cout', c => /\bcout\b/.test(c)), T('Chains output with <<', c => /<</.test(c))]
    }
  },
  {
    id: 'ch2', emoji: '🏷️', title: 'Variables and types', alias: 'Declaring things', minutes: 30,
    blurb: 'Declare typed variables, work with strings, and combine them in output.',
    sections: [
      S_('Declaring variables', `<p>Write the type, then the name. <code>int</code> holds whole numbers, <code>double</code> holds decimals, <code>string</code> holds text and <code>bool</code> holds true or false.</p>`,
        R`#include <iostream>
#include <string>
using namespace std;

int main() {
    int age = 15;
    double price = 99.5;
    string name = "Ada";
    bool isStudent = true;

    cout << name << " is " << age << endl;
    cout << "Price: " << price << endl;
    cout << "Student? " << isStudent << endl;
    return 0;
}`, 'Change isStudent to false and run it again.', `A <code>bool</code> prints as <code>1</code> or <code>0</code> by default.`),
      S_('Math with variables', `<p>The usual operators work on variables, and <code>%</code> gives the remainder after division of whole numbers.</p>`,
        R`#include <iostream>
using namespace std;

int main() {
    int apples = 7;
    int people = 2;
    cout << "Each gets " << apples / people << endl;
    cout << "Left over: " << apples % people << endl;
    cout << "Exact share: " << apples / 2.0 << endl;
    return 0;
}`, 'Change apples to 10 and predict the output first.', `Whole number divided by whole number stays a whole number. Make one side a <code>double</code> to keep the decimals.`),
      S_('Working with strings', `<p>C++ strings can be joined with <code>+</code>, and they know their own length with <code>.length()</code>.</p>`,
        R`#include <iostream>
#include <string>
using namespace std;

int main() {
    string first = "Ada";
    string last = "Lovelace";
    string full = first + " " + last;

    cout << full << endl;
    cout << "Length: " << full.length() << endl;
    return 0;
}`, 'Add a middle name and watch the length change.', `The space counts as a character, which is why "Ada Lovelace" has length 12.`)
    ],
    quiz: [
      Q('Which declaration is valid C++?', ['<code>int 2nd = 5;</code>', '<code>number x = 5;</code>', '<code>string name = "Ada";</code>', '<code>x = int 5;</code>'], 2, 'The type comes first, then the name, then the value. Names cannot start with a digit.'),
      Q('What does <code>cout &lt;&lt; 9 % 4 &lt;&lt; endl;</code> print?', ['2', '1', '0', '2.25'], 1, '9 divided by 4 is 2 with a remainder of 1.'),
      Q('What does <code>cout</code> print for a <code>bool</code> that is true?', ['true', 'True', '1', 'yes'], 2, 'By default a bool prints as 1 (true) or 0 (false).')
    ],
    challenge: {
      title: 'Full name',
      prompt: `<p>Join <code>first</code> and <code>last</code> with a space into a <code>string</code> called <code>full</code>, then print this exact line:</p><p><code>Name: Ada Lovelace</code></p>`,
      starter: R`#include <iostream>
#include <string>
using namespace std;

int main() {
    string first = "Ada";
    string last = "Lovelace";

    // Join them into a variable called full, then print:
    // Name: Ada Lovelace

    return 0;
}`,
      hint: `<code>string full = first + " " + last;</code> then <code>cout &lt;&lt; "Name: " &lt;&lt; full &lt;&lt; endl;</code>.`,
      tests: [T('Prints exactly: Name: Ada Lovelace', (c, o) => o.trim() === 'Name: Ada Lovelace'), T('Stores the name in a string called full', c => /\bstring\s+full\s*=/.test(c)), T('Builds the name from first and last', c => !/Ada Lovelace/.test(c))]
    }
  },
  PRE('ch3', '🔀', 'Making decisions', 'Fork in the road', 30, 'Make your program choose between paths with conditions.', ['if, else if and else', 'Comparison and logical operators', 'switch statements']),
  PRE('ch4', '🔁', 'Loops', 'Going around again', 35, 'Repeat work with loops.', ['for and range-based for', 'while and do-while', 'break and continue']),
  PRE('ch5', '🧩', 'Functions', 'Reusable blocks', 40, 'Split your program into named pieces.', ['Declaring and calling functions', 'Parameters, references and return values', 'Function overloading']),
  PRE('ch6', '🧺', 'Strings and vectors', 'Growing containers', 45, 'Use the standard containers that grow as you add to them.', ['std::vector', 'String operations', 'Iterating over containers']),
  PRE('ch7', '🏗️', 'Classes and objects', 'Your own types', 50, 'Bundle data and behaviour into your own types.', ['Classes and objects', 'Constructors', 'Inheritance basics']),
  PRE('ch8', '🧰', 'The standard library', 'Tools included', 55, 'Get a lot done with what ships in the box.', ['Algorithms like sort and find', 'Maps and sets', 'A small project'])
];

const PREI = (id, icon, title, alias, minutes, blurb, topics) => ({ id, icon, title, alias, minutes, blurb, topics });

const RX = [
  {
    id: 'ch1', icon: 'braces', title: 'Hello, JSX', alias: 'First component', minutes: 30,
    blurb: 'Describe a screen with JSX, split it into components, and render lists.',
    sections: [
      S_('Your first component', `<p>A React component is a function that returns what should appear on screen. The tag-like syntax is <b>JSX</b>. Anything inside curly braces <code>{ }</code> is regular JavaScript.</p>`,
        R`function App() {
  const name = "Ada";

  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>2 + 3 = {2 + 3}</p>
    </div>
  );
}`, 'Change the name, then add another line with a calculation inside { }.', `A component name must start with a capital letter, and it must return a <b>single</b> parent element. Wrap siblings in a <code>&lt;div&gt;</code> or in a fragment, <code>&lt;&gt; &lt;/&gt;</code>.`),
      S_('Props: inputs for components', `<p>Props are the inputs you pass to a component, written like HTML attributes. Inside the component they arrive as one object, here called <code>props</code>. The same component can show different things depending on its props.</p>`,
        R`function Badge(props) {
  return (
    <span style={{ background: "#E8E5FA", padding: "2px 10px", borderRadius: 99, marginRight: 8 }}>
      {props.label}
    </span>
  );
}

function App() {
  return (
    <div>
      <Badge label="React" />
      <Badge label="JSX" />
    </div>
  );
}`, 'Add a third Badge with a label of your own.', `You can destructure props to save typing: <code>function Badge({ label })</code> lets you write <code>{label}</code> directly.`),
      S_('Lists with map', `<p>To show a list, turn an array into an array of elements with <code>map</code>. Each element needs a <code>key</code> so React can tell items apart when the list changes.</p>`,
        R`const skills = ["HTML", "CSS", "JavaScript", "React"];

function App() {
  return (
    <ul>
      {skills.map(skill => (
        <li key={skill}>{skill}</li>
      ))}
    </ul>
  );
}`, 'Add a skill to the array and watch the list grow.', `Keys must be unique among siblings and stay the same between renders, so use an id or a name, not a random number.`)
    ],
    quiz: [
      Q('What must a component\'s name start with?', ['A lowercase letter', 'A capital letter', 'An underscore', 'A number'], 1, 'React treats lowercase tags like <code>div</code> as HTML elements, so your own components need a capital letter.'),
      Q('How do you put a JavaScript value inside JSX?', ['Wrap it in curly braces', 'Wrap it in quotes', 'Put a $ in front of it', 'Wrap it in square brackets'], 0, 'Curly braces switch from JSX back into JavaScript, as in <code>&lt;h1&gt;{name}&lt;/h1&gt;</code>.'),
      Q('What do props let you do?', ['Store data that changes over time', 'Style a component with CSS', 'Pass inputs from a parent to a child component', 'Fetch data from a server'], 2, 'Props flow down from parent to child, and they make one component reusable with different data.'),
      Q('Why does each item in a mapped list need a <code>key</code>?', ['It sets the item\'s CSS class', 'It makes the item clickable', 'It sorts the list', 'It helps React tell items apart when the list changes'], 3, 'Keys let React match old and new items, so it updates only what changed.')
    ],
    challenge: {
      title: 'Greeting component',
      prompt: `<p>Build a component called <code>Greeting</code> that takes a <code>name</code> prop and shows <code>Hello, {name}!</code> in an <code>&lt;h2&gt;</code>. Then use it twice inside <code>App</code>: once for <b>Ada</b> and once for <b>Linus</b>.</p>`,
      starter: R`// Build a Greeting component that shows: Hello, <name>!
// Then use it twice inside App: once for Ada, once for Linus

function App() {
  return (
    <div>
      {/* render your Greeting components here */}
    </div>
  );
}`,
      hint: `<code>function Greeting({ name }) { return &lt;h2&gt;Hello, {name}!&lt;/h2&gt;; }</code> then write <code>&lt;Greeting name="Ada" /&gt;</code> inside <code>App</code>.`,
      tests: [
        T('Shows Hello, Ada! and Hello, Linus!', (c, o, api) => api.text().includes('Hello, Ada!') && api.text().includes('Hello, Linus!')),
        T('Defines a Greeting component', c => /(function\s+Greeting|const\s+Greeting)/.test(c)),
        T('Renders two h2 headings', (c, o, api) => api.count('h2') === 2)
      ]
    }
  },
  {
    id: 'ch2', icon: 'toggle', title: 'State and events', alias: 'Make it react', minutes: 35,
    blurb: 'Give components memory with useState and respond to clicks and typing.',
    sections: [
      S_('useState: memory for a component', `<p>State is data that belongs to a component and can change. <code>useState</code> gives you the current value and a function to update it. Calling that function makes React draw the component again with the new value.</p>`,
        R`import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Add one</button>
    </div>
  );
}`, 'Click the button in the preview, then change the + 1 to + 5 and run it again.', `Never change a state variable directly, like <code>count = 5</code>. Always use the setter so React knows to redraw.`),
      S_('Conditional rendering', `<p>Show different things depending on state. A ternary <code>cond ? a : b</code> picks between two values, and <code>cond &amp;&amp; thing</code> shows the thing only when <code>cond</code> is true.</p>`,
        R`function App() {
  const [on, setOn] = useState(false);

  return (
    <div>
      <p>The light is {on ? "on" : "off"}</p>
      {on && <strong>Bright!</strong>}
      <button onClick={() => setOn(!on)}>Toggle</button>
    </div>
  );
}`, 'Click Toggle in the preview a few times.', `<code>!on</code> flips true to false and back, which makes a handy toggle.`),
      S_('Handling input', `<p>A <b>controlled input</b> gets its value from state and updates state on every keystroke. That keeps state as the single source of truth, so the rest of the screen can react to what the user typed.</p>`,
        R`function App() {
  const [text, setText] = useState("");

  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} placeholder="Type here" />
      <p>You typed: {text}</p>
      <p>{text.length} characters</p>
    </div>
  );
}`, 'Type in the preview, then add a line that shows the text in capitals using text.toUpperCase().', `The event object <code>e</code> describes what happened, and <code>e.target.value</code> is the current text of the input.`)
    ],
    quiz: [
      Q('What does <code>useState</code> return?', ['Only the current value', 'The current value and a function to update it', 'A new component', 'A copy of the page'], 1, 'It returns a pair, usually destructured as <code>[value, setValue]</code>.'),
      Q('Why call <code>setCount</code> instead of changing <code>count</code> directly?', ['It is faster', 'Variables cannot be changed in JavaScript', 'So React knows to redraw the component', 'It formats the number'], 2, 'The setter tells React that state changed, which triggers a new render.'),
      Q('What does <code>{isOn &amp;&amp; &lt;p&gt;Hi&lt;/p&gt;}</code> show when <code>isOn</code> is false?', ['The text false', 'The text Hi', 'An error', 'Nothing'], 3, 'When the left side is false, <code>&amp;&amp;</code> stops and React renders nothing for it.')
    ],
    challenge: {
      title: 'Like button',
      prompt: `<p>Make the button work. Add a piece of state called <code>likes</code> that starts at 0, show it as <code>Likes: 0</code>, and increase it by 1 every time the button is clicked.</p>`,
      starter: R`function App() {
  // Add a piece of state called likes that starts at 0

  return (
    <div>
      <p>Likes: 0</p>
      <button>Like</button>
    </div>
  );
}`,
      hint: `<code>const [likes, setLikes] = useState(0);</code> then <code>&lt;p&gt;Likes: {likes}&lt;/p&gt;</code> and <code>onClick={() =&gt; setLikes(likes + 1)}</code> on the button.`,
      tests: [
        T('Starts at Likes: 0', (c, o, api) => api.text().includes('Likes: 0')),
        T('Clicking the button three times shows Likes: 3', (c, o, api) => { api.click('button', 3); return api.text().includes('Likes: 3'); }),
        T('Uses useState', c => /useState\s*\(/.test(c))
      ]
    }
  },
  PREI('ch3', 'repeat', 'Effects', 'Do it after render', 40, 'Run code in response to changes, like setting a title or starting a timer.', ['useEffect basics', 'Dependency arrays', 'Cleaning up']),
  PREI('ch4', 'rows', 'Forms', 'Collect input', 40, 'Build forms that validate and submit.', ['Controlled forms', 'Validation', 'Submitting data']),
  PREI('ch5', 'branch', 'Lifting state up', 'Share between siblings', 40, 'Share state between components by moving it to a common parent.', ['Parent owns the state', 'Passing callbacks down', 'Composition patterns']),
  PREI('ch6', 'cloud', 'Fetching data', 'Talk to an API', 45, 'Load data from a server and show loading and error states.', ['fetch and useEffect', 'Loading and error states', 'Rendering results']),
  PREI('ch7', 'compass', 'Routing', 'Many pages, one app', 45, 'Build multi-page apps with client-side routing.', ['Routes and links', 'URL parameters', 'Nested layouts']),
  PREI('ch8', 'rocket', 'Mini projects', 'Ship something', 60, 'Combine everything into small apps you can show off.', ['Todo list', 'Weather widget', 'Quiz app'])
];

const SQ = [
  {
    id: 'ch1', icon: 'table', title: 'Hello, SELECT', alias: 'Ask the table', minutes: 25,
    blurb: 'Read data from a table: pick columns, filter rows, sort and limit.',
    sections: [
      S_('Ask a table a question', `<p>SQL talks to a database made of <b>tables</b>. A table has columns, like <code>name</code> and <code>score</code>, and rows, one per student. <code>SELECT</code> chooses the columns you want and <code>FROM</code> names the table.</p>`,
        `SELECT * FROM students;`, 'Replace * with name, score and run it again.', `<code>*</code> means "all columns". SQL keywords are not case sensitive, but writing them in capitals makes queries easier to read.`),
      S_('Filter rows with WHERE', `<p><code>WHERE</code> keeps only the rows that pass a test. Compare with <code>=</code>, <code>&lt;&gt;</code>, <code>&gt;</code>, <code>&lt;</code>, <code>&gt;=</code> and <code>&lt;=</code>.</p>`,
        `SELECT name, score\nFROM students\nWHERE score >= 90;`, `Change 90 to 80, or filter by city instead: WHERE city = 'Pune'.`, `Text goes in single quotes, like <code>WHERE city = 'Pune'</code>. Numbers do not.`),
      S_('Sort and limit', `<p><code>ORDER BY</code> sorts the result and <code>LIMIT</code> keeps only the first few rows. Together they answer questions like "who are the top three?".</p>`,
        `SELECT name, score\nFROM students\nORDER BY score DESC\nLIMIT 3;`, 'Remove DESC to see the lowest scores instead.', `<code>DESC</code> sorts from high to low. Leave it out, or write <code>ASC</code>, for low to high.`)
    ],
    quiz: [
      Q('Which keyword chooses the columns to show?', ['<code>FROM</code>', '<code>WHERE</code>', '<code>SELECT</code>', '<code>ORDER BY</code>'], 2, '<code>SELECT</code> lists the columns, and <code>FROM</code> names the table they come from.'),
      Q('What does <code>SELECT * FROM students</code> return?', ['Only the first row', 'Every column of every row', 'The number of rows', 'An error'], 1, '<code>*</code> stands for all columns, and with no filter you get all rows.'),
      Q('Which query shows students with a score above 80?', ['<code>SELECT * FROM students IF score &gt; 80;</code>', '<code>WHERE score &gt; 80 SELECT * FROM students;</code>', '<code>SELECT * FROM students WHERE score &gt; 80;</code>', '<code>SELECT score &gt; 80 FROM students;</code>'], 2, 'The order is always SELECT, FROM, WHERE.'),
      Q('What does <code>ORDER BY score DESC LIMIT 3</code> give you?', ['The 3 lowest scores', 'The 3 highest scores', 'Any 3 rows', 'All rows, sorted'], 1, 'Sorting high to low and then keeping 3 rows gives the top three.')
    ],
    challenge: {
      title: 'Top scorers',
      prompt: `<p>Show the <code>name</code> and <code>score</code> of every student who scored <b>90 or more</b>, with the highest score first.</p>`,
      starter: `-- Show name and score for students with a score of 90 or more,\n-- highest score first\n\n`,
      hint: `You need all three parts: <code>SELECT name, score FROM students WHERE score &gt;= 90 ORDER BY score DESC;</code>`,
      tests: [
        T('Returns name and score for Saanvi, Zoya, Diya and Neel in that order', (c, o, api) => { const r = api.last; return !!r && JSON.stringify(r.cols) === '["name","score"]' && JSON.stringify(r.rows) === JSON.stringify([['Saanvi', 95], ['Zoya', 94], ['Diya', 91], ['Neel', 90]]); }),
        T('Uses WHERE to filter', c => /\bWHERE\b/i.test(c)),
        T('Uses ORDER BY with DESC', c => /ORDER\s+BY[\s\S]*DESC/i.test(c))
      ]
    }
  },
  {
    id: 'ch2', icon: 'sigma', title: 'Filters and totals', alias: 'Count it up', minutes: 30,
    blurb: 'Combine conditions, then summarise data with COUNT, AVG, MAX and GROUP BY.',
    sections: [
      S_('AND, OR, IN and LIKE', `<p>Combine conditions with <code>AND</code> (both must be true) and <code>OR</code> (at least one). <code>IN</code> checks a list, <code>BETWEEN</code> checks a range, and <code>LIKE</code> matches patterns.</p>`,
        `SELECT name, course, score\nFROM students\nWHERE course IN ('C', 'C++')\n  AND score BETWEEN 80 AND 95;`, `Change the list to ('Python', 'React'), or try WHERE name LIKE 'A%'.`, `In a <code>LIKE</code> pattern, <code>%</code> stands for "anything". <code>'A%'</code> matches every name that starts with A.`),
      S_('Count, average, max', `<p><b>Aggregate functions</b> squash many rows into one value: <code>COUNT</code>, <code>SUM</code>, <code>AVG</code>, <code>MIN</code> and <code>MAX</code>. <code>AS</code> gives the result column a friendlier name.</p>`,
        `SELECT COUNT(*) AS students,\n       ROUND(AVG(score), 1) AS average,\n       MAX(score) AS best\nFROM students;`, 'Add MIN(score) AS lowest to the list.', `<code>COUNT(*)</code> counts rows. <code>ROUND(x, 1)</code> keeps one decimal place.`),
      S_('GROUP BY', `<p><code>GROUP BY</code> splits the rows into groups, one per value, and the aggregate functions then work inside each group. It is how you answer "per course" or "per city" questions.</p>`,
        `SELECT course,\n       COUNT(*) AS students,\n       ROUND(AVG(score), 1) AS average\nFROM students\nGROUP BY course\nORDER BY average DESC;`, 'Group by city instead of course.', `Every column in <code>SELECT</code> should either be in <code>GROUP BY</code> or inside an aggregate function.`)
    ],
    quiz: [
      Q('Which function counts rows?', ['<code>SUM(*)</code>', '<code>COUNT(*)</code>', '<code>TOTAL(*)</code>', '<code>ROWS(*)</code>'], 1, '<code>COUNT(*)</code> counts every row in the group or table.'),
      Q('What does <code>GROUP BY course</code> do?', ['Sorts rows by course', 'Deletes duplicate courses', 'Makes one result row per course', 'Filters to one course'], 2, 'Each distinct course becomes one group, and aggregates are calculated per group.'),
      Q('Which condition matches names that start with the letter A?', ['<code>name = \'A\'</code>', '<code>name STARTS \'A\'</code>', '<code>name IN \'A\'</code>', '<code>name LIKE \'A%\'</code>'], 3, '<code>LIKE</code> with <code>%</code> matches patterns, and <code>\'A%\'</code> means "A followed by anything".')
    ],
    challenge: {
      title: 'Course averages',
      prompt: `<p>Show each <code>course</code> with its average score rounded to 1 decimal place, named <code>average</code>. Put the best course first.</p>`,
      starter: `-- Show each course with its average score (rounded to 1 decimal)\n-- as "average", best course first\n\n`,
      hint: `<code>SELECT course, ROUND(AVG(score), 1) AS average FROM students GROUP BY course ORDER BY average DESC;</code>`,
      tests: [
        T('Returns the course and average columns with C first and SQL last', (c, o, api) => { const r = api.last; return !!r && JSON.stringify(r.cols) === '["course","average"]' && JSON.stringify(r.rows) === JSON.stringify([['C', 88], ['React', 83.5], ['Python', 82.8], ['C++', 82], ['SQL', 74]]); }),
        T('Uses GROUP BY', c => /GROUP\s+BY/i.test(c)),
        T('Sorts with ORDER BY ... DESC', c => /ORDER\s+BY[\s\S]*DESC/i.test(c))
      ]
    }
  },
  PREI('ch3', 'link', 'Joins', 'Connect tables', 40, 'Combine rows from two tables using a shared column.', ['INNER JOIN', 'LEFT JOIN', 'Joining three tables']),
  PREI('ch4', 'pencil', 'Changing data', 'Insert, update, delete', 35, 'Add, edit and remove rows safely.', ['INSERT', 'UPDATE and DELETE', 'Transactions']),
  PREI('ch5', 'table', 'Designing tables', 'Keys and types', 40, 'Create tables with the right types and keys.', ['CREATE TABLE', 'Primary and foreign keys', 'Constraints']),
  PREI('ch6', 'branch', 'Subqueries', 'Queries inside queries', 45, 'Use the result of one query inside another.', ['Subqueries in WHERE', 'Subqueries in FROM', 'Common table expressions']),
  PREI('ch7', 'bolt', 'Indexes', 'Make it fast', 45, 'Speed up queries and understand how the database finds rows.', ['What an index is', 'Reading query plans', 'When not to index']),
  PREI('ch8', 'rocket', 'Mini project', 'Analyse real data', 60, 'Answer real questions with a small dataset.', ['Sales report', 'Student dashboard queries', 'Your own question'])
];

const JV = [
  {
    id: 'ch1', icon: 'coffee', title: 'Hello, Java', alias: 'First class', minutes: 30,
    blurb: 'Write your first Java class, print to the screen, and see how a program is laid out.',
    sections: [
      S_('Anatomy of a Java program', `<p>In Java, all code lives inside a <b>class</b>. The program starts running at <code>main</code>, and <code>System.out.println</code> prints a line of text. Every statement ends with a semicolon.</p>`,
        R`public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
        System.out.println("Every statement ends with a semicolon");
    }
}`, 'Change the text inside the quotes and run it again.', `The class name and the file name must match: <code>public class Main</code> lives in a file called <code>Main.java</code>.`),
      S_('Printing and math', `<p><code>println</code> prints and moves to a new line, while <code>print</code> stays on the same line. Java works as a calculator, and <code>+</code> also joins text with numbers.</p>`,
        R`public class Main {
    public static void main(String[] args) {
        System.out.println(2 + 3);
        System.out.println(10 / 4);
        System.out.println(10 / 4.0);
        System.out.println("Sum: " + (6 + 4));
        System.out.print("No new line, ");
        System.out.println("then a new line");
    }
}`, 'Change 10 / 4.0 to 10 / 4 and see what changes.', `<code>10 / 4</code> gives 2 because both numbers are whole, so Java does integer division and drops the remainder. Write <code>4.0</code> for a decimal answer.`),
      S_('Comments: notes for humans', `<p>Java has two comment styles. <code>//</code> comments out the rest of a line, and <code>/* ... */</code> comments out everything between the markers. The compiler ignores both.</p>`,
        R`public class Main {
    public static void main(String[] args) {
        // A single-line comment
        /* A block comment, also fine */
        System.out.println("Comments are ignored"); // even here
    }
}`, 'Put // in front of the println line and run it again.', `A comment that starts with <code>/**</code> is a Javadoc comment. Tools turn those into documentation pages.`)
    ],
    quiz: [
      Q('Where does a Java program start running?', ['The first class in the file', '<code>public static void main(String[] args)</code>', 'The <code>println</code> method', 'The import statements'], 1, 'The Java launcher looks for the <code>main</code> method and starts there.'),
      Q('Which statement prints text and then moves to a new line?', ['<code>console.log("Hi");</code>', '<code>print("Hi");</code>', '<code>System.out.print("Hi");</code>', '<code>System.out.println("Hi");</code>'], 3, '<code>println</code> adds a new line after the text. <code>print</code> stays on the same line.'),
      Q('What does <code>System.out.println(7 / 2);</code> print?', ['3.5', '4', '3', '3.0'], 2, 'Both numbers are ints, so Java does integer division and drops the remainder.'),
      Q('Which line has a mistake?', ['<code>System.out.println("Hi");</code>', '<code>System.out.println("Hi")</code>', '<code>// System.out.println("Hi");</code>', '<code>System.out.println("Hi" + 1);</code>'], 1, 'The semicolon is missing. The compiler reports <code>\';\' expected</code>.')
    ],
    challenge: {
      title: 'Greeting card',
      prompt: `<p>Write a program that prints exactly these two lines, each on its own line:</p><p><code>Hello, Ada!</code><br><code>Welcome to Java.</code></p>`,
      starter: R`public class Main {
    public static void main(String[] args) {
        // Print two lines:
        // Hello, Ada!
        // Welcome to Java.

    }
}`,
      hint: `Use one <code>System.out.println</code> per line, for example <code>System.out.println("Hello, Ada!");</code>.`,
      tests: [
        T('Prints Hello, Ada! then Welcome to Java. on two lines', (c, o) => o.trim() === 'Hello, Ada!\nWelcome to Java.'),
        T('Uses System.out.println', c => /System\.out\.println\s*\(/.test(c)),
        T('Prints with at least two println calls', c => (c.match(/System\.out\.println\s*\(/g) || []).length >= 2)
      ]
    }
  },
  {
    id: 'ch2', icon: 'tag', title: 'Variables and types', alias: 'Declaring things', minutes: 35,
    blurb: 'Store values in typed variables, do arithmetic, and format output with printf.',
    sections: [
      S_('Declaring variables', `<p>Java is <b>statically typed</b>: you write the type before the name, and the type can't change later. <code>int</code> holds whole numbers, <code>double</code> holds decimals, <code>boolean</code> holds true or false, <code>char</code> holds one character, and <code>String</code> holds text.</p>`,
        R`public class Main {
    public static void main(String[] args) {
        int age = 15;
        double price = 99.5;
        String name = "Ada";
        boolean isStudent = true;
        char grade = 'A';

        System.out.println(name + " is " + age);
        System.out.println("Price: " + price);
        System.out.println("Student? " + isStudent);
        System.out.println("Grade: " + grade);
    }
}`, 'Change the values, then try int age = 15.5; and read the error.', `<code>String</code> starts with a capital S because it is a class, not a basic type. Strings use double quotes, and a <code>char</code> uses single quotes.`),
      S_('Math with variables', `<p>The usual operators work on variables. <code>%</code> gives the remainder after division. When you join text and a number with <code>+</code>, Java turns the number into text, but the math is done first.</p>`,
        R`public class Main {
    public static void main(String[] args) {
        int apples = 7;
        int people = 2;
        System.out.println("Each gets " + apples / people);
        System.out.println("Left over: " + apples % people);
        System.out.println("Exact share: " + apples / 2.0);
    }
}`, 'Change apples to 10 and predict the output before you run it.', `Whole number divided by whole number stays a whole number. Make one side a <code>double</code> to keep the decimals.`),
      S_('Formatted output with printf', `<p><code>printf</code> fills placeholders in a template string with values. It is handy for rounding and alignment.</p><table><tr><th>Placeholder</th><th>Prints</th><th>Example</th></tr><tr><td><code>%d</code></td><td>int</td><td><code>42</code></td></tr><tr><td><code>%f</code></td><td>double</td><td><code>3.140000</code></td></tr><tr><td><code>%s</code></td><td>String</td><td><code>Ada</code></td></tr><tr><td><code>%n</code></td><td>new line</td><td></td></tr></table>`,
        R`public class Main {
    public static void main(String[] args) {
        String name = "Ada";
        int marks = 92;
        System.out.printf("%s scored %d%n", name, marks);
        System.out.printf("Half of that is %.1f%n", marks / 2.0);
        System.out.printf("Padded: [%5d]%n", marks);
    }
}`, 'Change %d to %f for marks and read the exception.', `Java is strict: <code>%d</code> needs an int and <code>%f</code> needs a double, otherwise it throws an exception. <code>%n</code> is a portable new line.`)
    ],
    quiz: [
      Q('Which declaration is valid Java?', ['<code>int 2nd = 5;</code>', '<code>string name = "Ada";</code>', '<code>String name = "Ada";</code>', '<code>text name = "Ada";</code>'], 2, 'The type <code>String</code> has a capital S. Variable names cannot start with a digit.'),
      Q('What happens with <code>int x = 3.9;</code>?', ['It stores 3', 'It stores 4', 'It stores 3.9', 'It fails to compile: possible lossy conversion'], 3, 'Java refuses to silently throw away the decimals. Use a <code>double</code>, or cast with <code>(int)</code> on purpose.'),
      Q('Which placeholder prints a decimal number with <code>printf</code>?', ['<code>%d</code>', '<code>%f</code>', '<code>%s</code>', '<code>%b</code>'], 1, '<code>%f</code> is for <code>double</code> values, and <code>%.2f</code> keeps two decimals.')
    ],
    challenge: {
      title: 'Rectangle area',
      prompt: `<p>The width and height are given. Store their product in an <code>int</code> variable called <code>area</code>, then print this exact line:</p><p><code>Area: 40</code></p>`,
      starter: R`public class Main {
    public static void main(String[] args) {
        int width = 8;
        int height = 5;

        // Store width * height in a variable called area
        // Then print: Area: 40

    }
}`,
      hint: `<code>int area = width * height;</code> then <code>System.out.println("Area: " + area);</code>.`,
      tests: [
        T('Prints exactly: Area: 40', (c, o) => o.trim() === 'Area: 40'),
        T('Stores the result in an int called area', c => /\bint\s+area\s*=/.test(c)),
        T('Calculates the area instead of typing 40', c => !/\b40\b/.test(c))
      ]
    }
  },
  PREI('ch3', 'branch', 'Making decisions', 'Fork in the road', 35, 'Make your program choose between paths with conditions.', ['if, else if and else', 'Comparison and logical operators', 'switch and the ternary operator']),
  PREI('ch4', 'repeat', 'Loops', 'Going around again', 35, 'Repeat work with loops.', ['for loops', 'while and do-while loops', 'break and continue']),
  PREI('ch5', 'braces', 'Methods', 'Reusable blocks', 40, 'Split your program into named pieces.', ['Declaring and calling methods', 'Parameters and return values', 'Method overloading']),
  PREI('ch6', 'rows', 'Arrays and Strings', 'Rows of values', 45, 'Work with many values at once, including text.', ['Arrays', 'String methods', 'Looping over arrays']),
  PREI('ch7', 'cube', 'Objects and classes', 'Your own types', 50, 'The heart of Java: bundle data and behaviour into classes.', ['Classes and objects', 'Constructors', 'Inheritance and interfaces']),
  PREI('ch8', 'layers', 'Collections', 'Growing containers', 55, 'Use ArrayList and HashMap, then build a small project.', ['ArrayList', 'HashMap', 'A small project'])
];

const BT = s => s.replace(/§/g, '`').replace(/¤/g, '$');

const JSC = [
  {
    id: 'ch1', icon: 'terminal', title: 'Hello, JavaScript', alias: 'First log', minutes: 30,
    blurb: 'Print to the console, store values in variables, and learn the operators and gotchas every JavaScript developer meets.',
    sections: [
      S_('Say hello with console.log', `<p>JavaScript runs in every web browser, and on servers too. <code>console.log()</code> prints a value to the console, which is where developers check what their code is doing.</p>`,
        `console.log("Hello, JavaScript!");\nconsole.log(2 + 3);\nconsole.log("Py" + "thon");\nconsole.log("ha".repeat(3));`, 'Change the text, then log a calculation of your own.', `Strings can use single or double quotes. Semicolons are optional in JavaScript, but most style guides keep them.`),
      S_('Variables: const and let', `<p>Store a value with <code>const</code> (cannot be reassigned) or <code>let</code> (can be). Every value has a type, and <code>typeof</code> tells you which.</p>`,
        BT(R`const name = "Ada";
let score = 10;
score = score + 5;
console.log(name, score);
console.log(§¤{name} has ¤{score} points§);
console.log(typeof name, typeof score);`), 'Try reassigning name and read the error.', `Use <code>const</code> by default and <code>let</code> only when the value must change. Backticks (&#96;) make a template literal, where <code>&#36;{...}</code> drops a value into the text.`),
      S_('Operators and a classic gotcha', `<p>The usual math operators work, but JavaScript also converts types automatically, which can surprise you. Watch what happens when text and numbers meet.</p>`,
        `console.log(10 / 4);\nconsole.log(7 % 3);\nconsole.log("5" + 5);\nconsole.log("5" - 2);\nconsole.log(5 === "5");\nconsole.log(5 == "5");`, 'Predict each line before you run it.', `<code>==</code> converts types before comparing, which causes surprises. Always use <code>===</code>, which compares both value and type.`)
    ],
    quiz: [
      Q('Which line prints to the console?', ['<code>print("Hi")</code>', '<code>System.out.println("Hi")</code>', '<code>console.log("Hi")</code>', '<code>echo "Hi"</code>'], 2, '<code>console.log</code> is JavaScript\'s way to print values for developers.'),
      Q('What happens if you reassign a <code>const</code> variable?', ['It changes silently', 'It throws a TypeError', 'It becomes undefined', 'JavaScript ignores it'], 1, 'A <code>const</code> binding cannot be reassigned: you get "Assignment to constant variable".'),
      Q('What does <code>console.log("5" + 5)</code> print?', ['10', 'Error', '5 5', '55'], 3, 'With a string on one side, <code>+</code> joins text, so the number 5 becomes "5" and the result is "55".'),
      Q('Which comparison does NOT convert types?', ['<code>===</code>', '<code>==</code>', '<code>=</code>', '<code>!=</code>'], 0, '<code>===</code> is strict equality: both the value and the type must match.')
    ],
    challenge: {
      title: 'Introduce yourself',
      prompt: `<p>Create a <code>const</code> called <code>name</code> with the value <code>"Ada"</code> and a <code>let</code> called <code>level</code> set to 3. Then log this exact line using a template literal:</p><p><code>Ada is level 3</code></p>`,
      starter: `// Create const name = "Ada" and let level = 3\n// Then log: Ada is level 3 (use a template literal)\n\n`,
      hint: BT(`Template literals use backticks, like <code>§¤{name} is level ¤{level}§</code>, and <code>console.log(...)</code> prints them.`),
      tests: [
        T('Logs exactly: Ada is level 3', (c, o) => o.trim() === 'Ada is level 3'),
        T('Declares const name and let level', c => /\bconst\s+name\b/.test(c) && /\blet\s+level\b/.test(c)),
        T('Uses a template literal with a ${...} value', c => /`[^`]*\$\{[^}]+\}[^`]*`/.test(c))
      ]
    }
  },
  {
    id: 'ch2', icon: 'braces', title: 'Functions and arrays', alias: 'Reusable moves', minutes: 35,
    blurb: 'Write functions, work with arrays using map and filter, and group data in objects.',
    sections: [
      S_('Functions', `<p>A function is a reusable block of code. Declare it with <code>function</code>, or write a short <b>arrow function</b> with <code>=&gt;</code>. <code>return</code> sends a value back.</p>`,
        `function greet(name) {\n  return "Hello, " + name + "!";\n}\n\nconst double = (n) => n * 2;\n\nconsole.log(greet("Ada"));\nconsole.log(double(21));`, 'Write a function square(n) and log square(9).', `A function with no <code>return</code> gives back <code>undefined</code>.`),
      S_('Arrays and their methods', `<p>An array holds an ordered list. <code>map</code> transforms every item, <code>filter</code> keeps only the items that pass a test, and both return a new array.</p>`,
        `const nums = [1, 2, 3, 4, 5];\n\nconsole.log(nums.length);\nconsole.log(nums[0]);\nconsole.log(nums.map(n => n * 2));\nconsole.log(nums.filter(n => n % 2 === 0));\nconsole.log(nums.includes(3));`, 'Filter the numbers that are greater than 2.', `Arrays start counting at 0, so the first item is <code>nums[0]</code>.`),
      S_('Objects', `<p>An object groups related values under names, called properties. Read one with a dot, <code>student.name</code>, or with brackets, <code>student["name"]</code>.</p>`,
        `const student = { name: "Ada", score: 92, skills: ["JS", "SQL"] };\n\nconsole.log(student.name);\nconsole.log(student["score"]);\nconsole.log(student.skills.length);\nconsole.log(student);`, 'Add a city property and log it.', `Objects can hold any values, including arrays and other objects, which is how most real data is shaped.`)
    ],
    quiz: [
      Q('What does <code>[1, 2, 3].map(n =&gt; n * 2)</code> return?', ['<code>[1, 2, 3]</code>', '<code>[2, 4, 6]</code>', '<code>6</code>', '<code>undefined</code>'], 1, '<code>map</code> applies the function to every item and returns a new array of the results.'),
      Q('What does a function return if it has no <code>return</code> statement?', ['<code>0</code>', '<code>null</code>', 'An error', '<code>undefined</code>'], 3, 'Without <code>return</code>, a function gives back <code>undefined</code>.'),
      Q('How do you read the <code>name</code> property of an object called <code>student</code>?', ['<code>student.name</code>', '<code>student-&gt;name</code>', '<code>student{name}</code>', '<code>student::name</code>'], 0, 'Use dot notation, <code>student.name</code>, or brackets, <code>student["name"]</code>.')
    ],
    challenge: {
      title: 'Evens only',
      prompt: `<p>Write a function called <code>evens(list)</code> that returns a new array with only the even numbers. Then log <code>evens([1, 2, 3, 4, 5, 6])</code>, which should print:</p><p><code>[ 2, 4, 6 ]</code></p>`,
      starter: `// Write a function called evens that returns only the even numbers\n\n// Then log the result of evens([1, 2, 3, 4, 5, 6])\n`,
      hint: `<code>list.filter(n =&gt; n % 2 === 0)</code> keeps the even numbers. Return that from the function.`,
      tests: [
        T('Logs exactly: [ 2, 4, 6 ]', (c, o) => o.trim() === '[ 2, 4, 6 ]'),
        T('Defines a function called evens', c => /(function\s+evens|(const|let)\s+evens)/.test(c)),
        T('evens([10, 15, 20]) returns [10, 20]', (c, o, api) => JSON.stringify(api.call('evens', [10, 15, 20])) === '[10,20]')
      ]
    }
  },
  {
    id: 'ch3', icon: 'branch', title: 'Decisions and loops', alias: 'Choose and repeat', minutes: 40,
    blurb: 'Branch with if and switch, and repeat work with for and while loops.',
    sections: [
      S_('if, else if and else', `<p>An <code>if</code> runs its block only when the condition in parentheses is true. Chain more checks with <code>else if</code>, and add <code>else</code> as the fallback.</p>`, `const hour = 14;\n\nif (hour < 12) {\n  console.log("Good morning");\n} else if (hour < 18) {\n  console.log("Good afternoon");\n} else {\n  console.log("Good evening");\n}`, 'Change hour to 20 and run it again.', `Curly braces <code>{ }</code> mark the block that belongs to each branch, the way indentation does in Python.`),
      S_('for and while loops', `<p>A <code>for</code> loop packs the start, the condition and the update into one line. A <code>while</code> loop just repeats as long as its condition is true.</p>`, `for (let i = 0; i < 5; i++) {\n  console.log(i);\n}\n\nlet total = 0;\nlet n = 1;\nwhile (n <= 4) {\n  total += n;\n  n++;\n}\nconsole.log(total);`, 'Change i < 5 to i < 8 and run it again.', `<code>for (let i = 0; i &lt; 5; i++)</code> reads as: start i at 0, keep going while i &lt; 5, add 1 to i after each pass.`),
      S_('switch and the ternary operator', `<p><code>switch</code> compares one value against several cases; don't forget <code>break</code>, or execution falls through into the next case. The ternary operator <code>cond ? a : b</code> is a compact one-line if/else that produces a value.</p>`, `const day = 3;\n\nswitch (day) {\n  case 1:\n    console.log("Monday");\n    break;\n  case 2:\n    console.log("Tuesday");\n    break;\n  case 3:\n    console.log("Wednesday");\n    break;\n  default:\n    console.log("Some other day");\n}\n\nconst age = 20;\nconsole.log(age >= 18 ? "adult" : "minor");`, 'Remove the break after case 3 and see what prints.', `Without <code>break</code>, a <code>switch</code> keeps running the next case's statements too. This is called "falling through", and it is a common bug.`)
    ],
    quiz: [
      Q('Which keyword checks an extra condition after an <code>if</code> fails?', ['<code>elseif</code>', '<code>elif</code>', '<code>else if</code>', '<code>otherwise</code>'], 2, "JavaScript writes it as two words: <code>else if</code>."),
      Q('What happens if a switch case has no <code>break</code>?', ['An error is thrown', 'Execution falls through into the next case', 'Nothing runs', 'The switch exits immediately'], 1, 'Without <code>break</code>, JavaScript keeps executing the statements in the following cases too.'),
      Q('What does <code>age &gt;= 18 ? "adult" : "minor"</code> produce when age is 16?', ['<code>"adult"</code>', '<code>"minor"</code>', '<code>true</code>', '<code>undefined</code>'], 1, 'The condition is false, so the ternary operator evaluates the part after the colon.'),
      Q('What does this print?<br><code>let total = 0;<br>for (let i = 1; i &lt;= 3; i++) {<br>&nbsp;&nbsp;total += i;<br>}<br>console.log(total);</code>', ['3', '6', '1', 'undefined'], 1, 'The loop adds 1, then 2, then 3: 1 + 2 + 3 = 6.')
    ],
    challenge: {
      title: 'FizzBuzz',
      prompt: `<p>For the numbers 1 to 15, print <code>"Fizz"</code> if divisible by 3, <code>"Buzz"</code> if divisible by 5, <code>"FizzBuzz"</code> if divisible by both, and the number itself otherwise. Each on its own line.</p>`,
      starter: `// Print 1 to 15, replacing multiples of 3 with Fizz, multiples of 5 with Buzz,\n// and multiples of both with FizzBuzz\n`,
      hint: `Check divisible-by-both first with <code>i % 15 === 0</code>, since both <code>i % 3 === 0</code> and <code>i % 5 === 0</code> would also be true for those numbers.`,
      tests: [T('Prints the correct 15-line FizzBuzz sequence', (c, o) => o.trim() === '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz'), T('Uses a loop', c => /\bfor\b|\bwhile\b/.test(c)), T('Checks %', c => /%/.test(c))]
    }
  },
  {
    id: 'ch4', icon: 'pointer', title: 'The DOM and events', alias: 'Control the page', minutes: 45,
    blurb: 'Read and change the web page, and react to clicks and typing.',
    sections: [
      S_('Selecting elements', `<p>The <b>DOM</b> (Document Object Model) is how JavaScript sees the page: every tag is an element you can find and read. <code>document.querySelector(sel)</code> finds the first match for a CSS-style selector; <code>document.getElementById(id)</code> finds one by its <code>id</code> directly.</p>`, `const title = document.querySelector("#title");\nconsole.log(title.textContent);\n\nconst button = document.getElementById("toggle-btn");\nconsole.log(button.tagName);`, 'Try document.querySelector("ul") to find the list on this page.', `<code>#title</code> means "the element with id='title'", the same syntax CSS uses. <code>.someClass</code> would match a class instead.`),
      S_('Changing text and styles', `<p>Once you have an element, <code>.textContent</code> reads or replaces what it shows, and <code>.style.property</code> reads or sets one CSS style directly.</p>`, `const title = document.querySelector("#title");\ntitle.textContent = "Welcome!";\ntitle.style.color = "blue";\n\nconsole.log(title.textContent, title.style.color);`, 'Also set title.style.fontWeight = "bold" and check it.', `Style properties are written in camelCase in JavaScript, so the CSS <code>font-weight</code> becomes <code>style.fontWeight</code>.`),
      S_('Event listeners', `<p><code>element.addEventListener(type, handler)</code> runs <code>handler</code> every time that event happens on that element, such as <code>"click"</code> or <code>"input"</code>.</p>`, `const button = document.querySelector("#toggle-btn");\nlet clicks = 0;\n\nbutton.addEventListener("click", () => {\n  clicks++;\n  console.log("Clicked " + clicks + " time(s)");\n});\n\nbutton.click();\nbutton.click();`, 'Add a second listener on the same button and see both run.', `This preview simulates a click with <code>button.click()</code> so the example runs without a real page. In a browser, a real mouse click fires the same event.`)
    ],
    quiz: [
      Q('What does <code>document.querySelector("#title")</code> select?', ['Every element', 'The element with class "title"', 'The element with id "title"', 'Nothing, it is invalid'], 2, 'A <code>#</code> prefix in a selector means "match this id".'),
      Q('Which property changes the visible text inside an element?', ['<code>.value</code>', '<code>.textContent</code>', '<code>.tagName</code>', '<code>.className</code>'], 1, '<code>.textContent</code> gets or sets the text shown inside an element.'),
      Q('What does <code>button.addEventListener("click", fn)</code> do?', ['Runs fn immediately', 'Runs fn once, then forgets it', 'Runs fn every time the button is clicked', 'Deletes the button'], 2, 'The handler stays attached and runs every time that event happens.'),
      Q('How do you set an element\'s CSS color from JavaScript?', ['<code>el.color = "red"</code>', '<code>el.css.color = "red"</code>', '<code>el.style.color = "red"</code>', '<code>el.setColor("red")</code>'], 2, 'Inline styles are read and set through the <code>.style</code> object.')
    ],
    challenge: {
      title: 'Counter button',
      prompt: `<p>Select <code>#toggle-btn</code> and <code>#count</code>. Add a click listener on the button that increases a running total and writes it into <code>#count</code>'s text. Simulate 3 clicks, then print <code>count.textContent</code>, which should print exactly:</p><p><code>3</code></p>`,
      starter: `const button = document.querySelector("#toggle-btn");\nconst count = document.querySelector("#count");\n\n// Add a click listener that increases a total and updates count.textContent\n\n// Then simulate 3 clicks and print count.textContent\n`,
      hint: `Keep a <code>total</code> variable outside the listener, increase it inside, then set <code>count.textContent = String(total)</code>.`,
      tests: [T('Prints exactly: 3', (c, o) => o.trim() === '3'), T('Adds a click listener', c => /addEventListener\s*\(\s*["']click["']/.test(c)), T('Updates count.textContent', c => /count\.textContent\s*=/.test(c))]
    }
  },
  {
    id: 'ch5', icon: 'cloud', title: 'Async and fetch', alias: 'Wait for data', minutes: 45,
    blurb: 'Load data from an API with promises and async/await.',
    sections: [
      S_('Promises', `<p>A <b>promise</b> represents a value that might not be ready yet. <code>.then(fn)</code> runs <code>fn</code> once the promise settles, passing in the resolved value.</p>`, `function double(n) {\n  return Promise.resolve(n * 2);\n}\n\ndouble(21).then(result => console.log(result));`, 'Chain a second .then() onto the first one.', `<code>Promise.resolve(v)</code> makes an already-settled promise, useful for practising <code>.then()</code> without a real wait.`),
      S_('async and await', `<p>An <code>async</code> function always returns a promise. Inside one, <code>await</code> pauses until a promise settles and hands you its resolved value directly, reading top to bottom like ordinary code.</p>`, `async function getDouble(n) {\n  return n * 2;\n}\n\nasync function main() {\n  const result = await getDouble(21);\n  console.log(result);\n}\n\nmain();`, 'Add a second await call that doubles the result again.', `<code>await</code> can only be used inside a function marked <code>async</code>.`),
      S_('fetch and JSON', `<p><code>fetch(url)</code> requests data and returns a promise for a response. <code>response.json()</code> reads the body and parses it from JSON text into a real object, and is itself async too.</p>`, `async function loadWeather() {\n  const response = await fetch("/api/weather");\n  const data = await response.json();\n  console.log(data.city + ": " + data.tempC + "C, " + data.condition);\n}\n\nloadWeather();`, 'Log response.ok and response.status as well.', `This preview simulates the network with a couple of built-in endpoints like <code>/api/weather</code>, so <code>fetch</code> works without internet access.`)
    ],
    quiz: [
      Q('What does <code>await</code> do to a promise?', ['Cancels it', 'Pauses until it settles and returns its value', 'Converts it to a string', 'Nothing, it is decorative'], 1, '<code>await</code> unwraps a promise, giving you its resolved value directly.'),
      Q('What must a function be marked as to use await inside it?', ['<code>static</code>', '<code>async</code>', '<code>promise</code>', '<code>wait</code>'], 1, '<code>await</code> is only valid inside an <code>async</code> function.'),
      Q('What does <code>response.json()</code> do?', ['Sends data to the server', 'Reads and parses the response body as JSON', 'Deletes the response', 'Converts JSON to a string'], 1, 'It parses the response body text into a usable object, and returns a promise for it.'),
      Q('What does an <code>async</code> function always return?', ['The value after return, unwrapped', 'undefined', 'A promise', 'An error'], 2, 'Even a plain <code>return value</code> inside an async function is automatically wrapped in a promise.')
    ],
    challenge: {
      title: 'Todo loader',
      prompt: `<p>Fetch <code>"/api/todos"</code>, parse the JSON response, and print how many of the todos have <code>done</code> set to <code>true</code>. It should print exactly:</p><p><code>1</code></p>`,
      starter: `async function countDone() {\n  // Fetch "/api/todos", parse the JSON, and print how many are done\n}\n\ncountDone();\n`,
      hint: `<code>todos.filter(t =&gt; t.done).length</code> counts how many items have <code>done</code> true.`,
      tests: [T('Prints exactly: 1', (c, o) => o.trim() === '1'), T('Uses await', c => /\bawait\b/.test(c)), T('Fetches /api/todos', c => /fetch\s*\(\s*["']\/api\/todos["']/.test(c))]
    }
  },
  {
    id: 'ch6', icon: 'package', title: 'Modules and tooling', alias: 'Organise your code', minutes: 40,
    blurb: 'Split code into modules and use npm packages.',
    sections: [
      S_('import and export', `<p>In a real project, <code>export</code> marks a function or value as usable from other files, and <code>import { name } from "./file.js"</code> brings it in. This preview runs everything in one file, so the import below is just shown for its syntax — the function is really defined above it, in the same file.</p>`, `export function double(n) {\n  return n * 2;\n}\n\nimport { double } from "./math.js";\n\nconsole.log(double(21));`, 'Export a second function and import it the same way.', `A real project would put <code>double</code> in <code>math.js</code> and the <code>import</code> in a different file. This preview keeps everything together to stay runnable.`),
      S_('npm basics', `<p><b>npm</b> is the package manager that ships with Node.js. <code>npm install some-package</code> downloads code someone else wrote into your project's <code>node_modules</code> folder, so you can <code>import</code> it like your own code.</p>`, `// npm install lodash\n// npm install --save-dev vite\n\nconsole.log("Packages add code you did not write yourself.");`, 'Think of two packages you have heard of and what they might do.', `<code>--save-dev</code> marks a package as only needed while developing, not when the finished app runs.`),
      S_('Bundlers and build tools', `<p>A <b>bundler</b> (like Vite or webpack) follows every <code>import</code> in your project and combines the files into the handful the browser actually loads, often also compressing them.</p>`, `console.log("A bundler combines many files into one, ready for the browser.");`, 'Think about why combining many small files into fewer, larger ones helps a page load faster.', `Browsers can load fewer, larger files faster than hundreds of tiny ones, which is one of the main reasons bundlers exist.`)
    ],
    quiz: [
      Q('What does <code>export</code> do to a function?', ['Deletes it', 'Marks it as usable from other files', 'Runs it immediately', 'Makes it private'], 1, '<code>export</code> makes a name available for other files to <code>import</code>.'),
      Q('What does npm mainly manage?', ['Variable names', 'Packages of code written by other people', 'CSS colours', 'Browser tabs'], 1, 'npm installs and tracks packages (dependencies) your project uses.'),
      Q('What is a bundler for?', ['Writing code for you', 'Combining and preparing many files for the browser', 'Running tests', 'Styling a page'], 1, 'A bundler follows imports across files and combines them into what the browser loads.'),
      Q('In <code>npm install --save-dev vite</code>, what does --save-dev mean?', ['Install it twice', 'Only needed while developing, not in the running app', 'Save it to the desktop', 'Delete it after installing'], 1, "It records the package as a development-only dependency.")
    ],
    challenge: {
      title: 'Export and use',
      prompt: `<p>Write and export a function called <code>timesThree(n)</code> that returns <code>n * 3</code>. Then (as shown in the lesson) import it and log <code>timesThree(7)</code>, which should print exactly:</p><p><code>21</code></p>`,
      starter: `// Write and export a function called timesThree that returns n * 3\n\nimport { timesThree } from "./math.js";\n\nconsole.log(timesThree(7));\n`,
      hint: `<code>export function timesThree(n) { return n * 3; }</code>, written above the <code>import</code> line.`,
      tests: [T('Prints exactly: 21', (c, o) => o.trim() === '21'), T('Exports a function called timesThree', c => /export\s+function\s+timesThree/.test(c))]
    }
  },
  {
    id: 'ch7', icon: 'cube', title: 'Classes', alias: 'Blueprints for objects', minutes: 45,
    blurb: 'Create objects from blueprints with classes and inheritance.',
    sections: [
      S_('class and constructor', `<p>A <code>class</code> is a blueprint for objects. <code>constructor</code> is a special method that runs when you create one with <code>new</code>, usually to set up <code>this.property</code> values.</p>`, `class Dog {\n  constructor(name, age) {\n    this.name = name;\n    this.age = age;\n  }\n}\n\nconst rex = new Dog("Rex", 4);\nconsole.log(rex.name, rex.age);`, 'Create a second Dog and log its name too.', `<code>new Dog("Rex", 4)</code> creates a fresh object and runs <code>constructor</code> with <code>this</code> set to that new object.`),
      S_('Methods', `<p>A <b>method</b> is a function defined inside a class. Call it on an instance with a dot, and <code>this</code> inside it refers to that instance.</p>`, `class Dog {\n  constructor(name, age) {\n    this.name = name;\n    this.age = age;\n  }\n  describe() {\n    return this.name + " is " + this.age + " years old";\n  }\n}\n\nconst rex = new Dog("Rex", 4);\nconsole.log(rex.describe());`, 'Add a method birthday() that adds 1 to this.age, then call rex.birthday() and log rex.age.', `Every instance made from the class shares the same methods, but each has its own separate property values.`),
      S_('Inheritance', `<p><code>class Cat extends Animal</code> makes <code>Cat</code> reuse everything from <code>Animal</code>, and it can override just the methods that should behave differently.</p>`, `class Animal {\n  constructor(name) {\n    this.name = name;\n  }\n  speak() {\n    return this.name + " makes a sound";\n  }\n}\n\nclass Cat extends Animal {\n  speak() {\n    return this.name + " says meow";\n  }\n}\n\nconst tom = new Cat("Tom");\nconst bessie = new Animal("Bessie");\nconsole.log(tom.speak());\nconsole.log(bessie.speak());`, 'Add a Dog class that extends Animal and overrides speak to say woof.', `<code>bessie</code> is a plain <code>Animal</code>, so it uses <code>Animal</code>'s own <code>speak</code>. <code>tom</code> is a <code>Cat</code>, so its overridden version runs instead.`)
    ],
    quiz: [
      Q('What does <code>constructor</code> do?', ['Nothing special', 'Runs automatically when you create an instance with new', 'Deletes an instance', 'Must be called by name'], 1, '<code>constructor</code> runs the moment <code>new ClassName(...)</code> creates an instance.'),
      Q('Inside a method, what does <code>this</code> refer to?', ['The class itself', 'The instance the method was called on', 'The constructor function', 'Nothing, it is always undefined'], 1, '<code>this</code> is set to whichever instance the method is called through.'),
      Q('What does <code>class Cat extends Animal</code> mean?', ['Cat replaces Animal entirely', 'Cat reuses Animal\'s methods and can override some', 'Animal and Cat are unrelated', 'Cat must redefine every method'], 1, '<code>extends</code> sets up inheritance: Cat gets everything Animal has, plus whatever it adds or overrides.'),
      Q('A subclass with no speak() method of its own, inheriting from a class that has one, will...', ['Throw an error', "Use the parent's speak()", 'Have a blank speak()', 'Need an empty one written manually'], 1, 'Without its own override, a subclass falls back to the method defined on its parent.')
    ],
    challenge: {
      title: 'Rectangle class',
      prompt: `<p>Write a class called <code>Rectangle</code> with a constructor that takes <code>width</code> and <code>height</code>, and a method <code>area()</code> that returns their product. Create one with width 6 and height 3, then log its area, which should print exactly:</p><p><code>18</code></p>`,
      starter: `// Define a class called Rectangle with a constructor and an area() method\n\n// Then create one with width 6 and height 3, and log its area\n`,
      hint: `<code>this.width = width;</code> inside the constructor saves the value. <code>area()</code> should <code>return this.width * this.height;</code>.`,
      tests: [T('Logs exactly: 18', (c, o) => o.trim() === '18'), T('Defines a class called Rectangle', c => /\bclass\s+Rectangle\b/.test(c)), T('Defines an area method', c => /\barea\s*\(\s*\)\s*\{/.test(c))]
    }
  },
  {
    id: 'ch8', icon: 'rocket', title: 'Mini projects', alias: 'Ship something', minutes: 60,
    blurb: 'Combine everything into small apps you can show off.',
    sections: [
      S_('Todo list', `<p>A class is a tidy way to give every todo item the same shape: its text and whether it is done.</p>`, `class Todo {\n  constructor(text) {\n    this.text = text;\n    this.done = false;\n  }\n}\n\nconst todos = [new Todo("Learn JS"), new Todo("Build a project")];\ntodos[0].done = true;\n\nfor (const t of todos) {\n  console.log((t.done ? "[x] " : "[ ] ") + t.text);\n}`, 'Add a third Todo and mark it done too.', `A real todo list would render this to the page with the DOM skills from an earlier chapter, and toggle <code>done</code> from a click listener.`),
      S_('Weather app', BT(`<p>Combining <code>fetch</code>, <code>await</code> and a template literal is a common pattern for showing live data.</p>`), BT(R`async function showWeather() {
  const response = await fetch("/api/weather");
  const data = await response.json();
  console.log(§¤{data.city}: ¤{data.tempC}°C, ¤{data.condition}§);
}

showWeather();`), 'Add a check: if response.ok is false, log an error message instead.', `A real weather app would write this text into a page element instead of logging it, using the DOM skills from an earlier chapter.`),
      S_('Quiz game', `<p>Storing each question as an object in an array, with its own answer and the player's choice, makes scoring a simple loop.</p>`, BT(R`const quiz = [
  { q: "2 + 2", answer: 4, chosen: 4 },
  { q: "Capital of France", answer: "Paris", chosen: "Paris" },
  { q: "7 * 8", answer: 56, chosen: 54 }
];

let score = 0;
for (const item of quiz) {
  if (item.chosen === item.answer) score++;
}

console.log(§You scored ¤{score} out of ¤{quiz.length}§);`), 'Add a fourth question and see the score update.', `This keeps every question's text, answer and the player's pick bundled together in one object, which is easy to loop over and score.`)
    ],
    quiz: [
      Q('What does this print?<br><code>let score = 0;<br>for (const item of quiz) {<br>&nbsp;&nbsp;if (item.chosen === item.answer) score++;<br>}</code> for a quiz where 2 of 3 chosen answers match?', ['1', '2', '3', '0'], 1, 'score increases once for each item where chosen matches answer: two matches here.'),
      Q('Why give each Todo its own class instead of plain objects?', ['Classes run faster', 'It guarantees every todo has the same shape, like text and done', 'Plain objects cannot hold booleans', 'There is no real difference'], 1, 'A class is a consistent blueprint, so every instance is guaranteed to have the properties you defined.'),
      Q('In the weather example, what does <code>await response.json()</code> give you?', ['The raw response object', 'A promise that never resolves', 'The parsed data from the response body', 'The URL that was fetched'], 2, '<code>await</code> unwraps the promise from <code>.json()</code>, handing you the parsed data directly.'),
      Q('What combination of skills does a real todo list on a web page need?', ['Only loops', 'Only classes', 'DOM selection and events, plus data to track each item', 'Only fetch'], 2, 'Displaying and interacting with a list on a page needs the DOM and event skills combined with data to track, like a class or array of objects.')
    ],
    challenge: {
      title: 'Shopping cart',
      prompt: `<p>Write a class called <code>Item</code> with a constructor <code>(name, price, qty)</code> and a method <code>total()</code> that returns <code>price * qty</code>. Given <code>cart = [new Item("Pen", 2, 3), new Item("Notebook", 5, 2)]</code>, print the sum of every item's total, which should print exactly:</p><p><code>16</code></p>`,
      starter: `class Item {\n  // Add a constructor(name, price, qty) and a total() method\n}\n\nconst cart = [new Item("Pen", 2, 3), new Item("Notebook", 5, 2)];\n\n// Print the sum of every item's total\n`,
      hint: `<code>cart.reduce((sum, item) =&gt; sum + item.total(), 0)</code> adds up every item's total.`,
      tests: [T('Prints exactly: 16', (c, o) => o.trim() === '16'), T('Defines a class called Item', c => /\bclass\s+Item\b/.test(c)), T('Defines a total method', c => /\btotal\s*\(\s*\)\s*\{/.test(c))]
    }
  }
];

const DS = [
  {
    id: 'ch1', icon: 'sigma', title: 'Thinking in steps', alias: 'Big-O basics', minutes: 30,
    blurb: 'Learn what an algorithm is, count its steps, and meet Big-O, the way programmers compare speed.',
    sections: [
      S_('An algorithm is a recipe', `<p>An <b>algorithm</b> is a finite list of steps that solves a problem. A <b>data structure</b> is a way of organising data so those steps are easy to do. You can follow this course in C, C++, Java, JavaScript or Python. Pick your language above the editor.</p>`,
        `function sum(numbers) {\n  let total = 0;\n  for (let i = 0; i < numbers.length; i++) {\n    total += numbers[i];\n  }\n  return total;\n}\n\nconsole.log(sum([4, 8, 15, 16, 23, 42]));`, 'Change the numbers and run it again.', `The loop visits each number once. Remember that: the number of visits is what we will count next.`),
      S_('Counting steps', `<p>To compare algorithms, count how many steps they take as the input grows. Here <code>steps</code> counts how often the loop compares an item.</p>`,
        `function findMax(list) {\n  let steps = 0;\n  let max = list[0];\n  for (let i = 1; i < list.length; i++) {\n    steps++;\n    if (list[i] > max) {\n      max = list[i];\n    }\n  }\n  return { max, steps };\n}\n\nconsole.log(findMax([3, 9, 2, 7]));\nconsole.log(findMax([3, 9, 2, 7, 5, 8, 1, 6]));`, 'Try a list of 16 numbers and watch steps.', `Double the list and the steps roughly double. We say this algorithm is <b>linear</b>, or <code>O(n)</code>.`),
      S_('Big-O at a glance', `<p>Big-O describes how the steps grow as the input size <code>n</code> grows. It ignores small details and keeps the shape of the growth.</p><table><tr><th>Big-O</th><th>Name</th><th>Example</th></tr><tr><td><code>O(1)</code></td><td>Constant</td><td>Read <code>list[0]</code></td></tr><tr><td><code>O(log n)</code></td><td>Logarithmic</td><td>Binary search</td></tr><tr><td><code>O(n)</code></td><td>Linear</td><td>Find the maximum</td></tr><tr><td><code>O(n²)</code></td><td>Quadratic</td><td>Two nested loops</td></tr></table>`,
        `function countPairs(n) {\n  let steps = 0;\n  for (let i = 0; i < n; i++) {\n    for (let j = 0; j < n; j++) {\n      steps++;\n    }\n  }\n  return steps;\n}\n\nconsole.log(countPairs(10));\nconsole.log(countPairs(100));`, 'Predict countPairs(1000) before you run it.', `Ten times more input made it <b>one hundred</b> times more work. That is why nested loops get slow so quickly.`)
    ],
    quiz: [
      Q('What does Big-O describe?', ['Exactly how many seconds code takes', 'How much memory a computer has', 'How the number of steps grows as the input grows', 'The length of the source code'], 2, 'Big-O is about the shape of growth, not exact timing, so it works on any computer.'),
      Q('A function loops once over a list of 1,000 items. About how many steps is that?', ['1', '1,000', '10', '1,000,000'], 1, 'One visit per item, so about n steps. That is <code>O(n)</code>.'),
      Q('What is the Big-O of two nested loops over n items?', ['<code>O(n)</code>', '<code>O(1)</code>', '<code>O(log n)</code>', '<code>O(n²)</code>'], 3, 'The inner loop runs n times for each of the n outer passes, so n × n steps.'),
      Q('If you double the input, an <code>O(n²)</code> algorithm does about how much more work?', ['The same', 'Twice as much', 'Four times as much', 'Ten times as much'], 2, 'Doubling n makes n × n four times bigger.')
    ],
    challenge: {
      title: 'Count the evens',
      prompt: `<p>Write a function <code>countEvens(numbers)</code> that returns how many even numbers are in the array. For example, <code>countEvens([1, 2, 3, 4])</code> is 2. Use a loop, and log <code>countEvens([1, 2, 3, 4])</code>.</p>`,
      starter: `function countEvens(numbers) {\n  // loop through numbers and count the even ones\n\n}\n\nconsole.log(countEvens([1, 2, 3, 4]));\n`,
      hint: `Start with <code>let count = 0;</code>, loop with <code>for (const n of numbers)</code>, add 1 when <code>n % 2 === 0</code>, then <code>return count</code>.`,
      tests: [
        T('Logs 2 for [1, 2, 3, 4]', (c, o) => o.trim() === '2'),
        T('Returns 3 for [2, 4, 6] and 0 for []', (c, o, api) => api.call('countEvens', [2, 4, 6]) === 3 && api.call('countEvens', []) === 0),
        T('Uses a loop', c => /\b(for|while)\b/.test(c))
      ]
    }
  },
  {
    id: 'ch2', icon: 'search', title: 'Arrays and searching', alias: 'Find it fast', minutes: 35,
    blurb: 'Search a list two ways, and see why sorted data lets you find things in a handful of steps.',
    sections: [
      S_('Linear search', `<p>The simplest search checks items one by one until it finds the target. It works on any list, but in the worst case it checks every item.</p>`,
        `function linearSearch(list, target) {\n  for (let i = 0; i < list.length; i++) {\n    if (list[i] === target) {\n      return i;\n    }\n  }\n  return -1;\n}\n\nconsole.log(linearSearch([5, 3, 8, 1], 8));\nconsole.log(linearSearch([5, 3, 8, 1], 7));`, 'Search for 5 and then for 1.', `Returning <code>-1</code> for "not found" is a common convention, because no real index is negative.`),
      S_('Binary search', `<p>If the list is <b>sorted</b>, you can do much better. Look at the middle item: if it is too small, throw away the left half, otherwise throw away the right half. Repeat.</p>`,
        `function binarySearch(sorted, target) {\n  let low = 0;\n  let high = sorted.length - 1;\n  let steps = 0;\n\n  while (low <= high) {\n    steps++;\n    const mid = Math.floor((low + high) / 2);\n    if (sorted[mid] === target) {\n      return { index: mid, steps };\n    }\n    if (sorted[mid] < target) {\n      low = mid + 1;\n    } else {\n      high = mid - 1;\n    }\n  }\n  return { index: -1, steps };\n}\n\nconst nums = [1, 3, 5, 7, 9, 11, 13, 15];\nconsole.log(binarySearch(nums, 11));\nconsole.log(binarySearch(nums, 4));`, 'Search for 1 and for 15 and compare the steps.', `Each step throws away half of what is left, which is why binary search is <code>O(log n)</code>.`),
      S_('Why halving wins', `<p>Compare the two approaches on a big list. Binary search needs only about <code>log₂(n)</code> steps, while linear search may need all <code>n</code>.</p>`,
        `function binarySearch(sorted, target) {\n  let low = 0;\n  let high = sorted.length - 1;\n  let steps = 0;\n\n  while (low <= high) {\n    steps++;\n    const mid = Math.floor((low + high) / 2);\n    if (sorted[mid] === target) return steps;\n    if (sorted[mid] < target) low = mid + 1;\n    else high = mid - 1;\n  }\n  return steps;\n}\n\nconst big = [];\nfor (let i = 0; i < 1000; i++) {\n  big.push(i * 2);\n}\n\nconsole.log("Items:", big.length);\nconsole.log("Steps to find the last item:", binarySearch(big, 1998));\nconsole.log("Steps for linear search: 1000");`, 'Make the list 2000 long and see how little the steps change.', `Searching a million sorted items takes about 20 steps. That is the power of <code>O(log n)</code>.`)
    ],
    quiz: [
      Q('What must be true before you use binary search?', ['The list has no duplicates', 'The list is short', 'The list is sorted', 'The list contains numbers'], 2, 'Throwing away half the list only works because sorted order tells you which half the target is in.'),
      Q('About how many steps does binary search need, at most, for 1,000,000 sorted items?', ['About 1,000', 'About 20', 'About 500,000', '1,000,000'], 1, 'Halving 1,000,000 repeatedly reaches 1 in about 20 steps.'),
      Q('What does the <code>linearSearch</code> above return when the target is missing?', ['<code>0</code>', '<code>undefined</code>', 'An error', '<code>-1</code>'], 3, 'It returns -1, a value that can never be a real index.')
    ],
    challenge: {
      title: 'Write binary search',
      prompt: `<p>Write <code>binarySearch(sorted, target)</code> that returns the index of <code>target</code> in the sorted array, or <code>-1</code> if it is missing. Use the low and high pointer idea from the lesson, not <code>indexOf</code>.</p>`,
      starter: `function binarySearch(sorted, target) {\n  // keep low and high pointers and check the middle each time\n\n}\n\nconsole.log(binarySearch([1, 3, 5, 7, 9], 7));\n`,
      hint: `Loop <code>while (low &lt;= high)</code>. Compute <code>mid</code> with <code>Math.floor((low + high) / 2)</code>, return it on a match, otherwise move <code>low</code> up or <code>high</code> down.`,
      tests: [
        T('Logs 3 for [1, 3, 5, 7, 9] and 7', (c, o) => o.trim() === '3'),
        T('Finds the first and last items, and returns -1 when missing', (c, o, api) => api.call('binarySearch', [1, 3, 5, 7, 9], 1) === 0 && api.call('binarySearch', [1, 3, 5, 7, 9], 9) === 4 && api.call('binarySearch', [1, 3, 5, 7, 9], 4) === -1),
        T('Uses a loop and not indexOf or includes', c => /\b(while|for)\b/.test(c) && !/indexOf|includes|find\(/.test(c))
      ]
    }
  },
  PREI('ch3', 'sort', 'Sorting', 'Put things in order', 45, 'Sort with bubble, selection and merge sort and compare their speed.', ['Bubble and selection sort', 'Merge sort', 'Comparing sorting speeds']),
  PREI('ch4', 'layers', 'Stacks and queues', 'Last in, first out', 40, 'Two simple structures behind undo buttons and task lines.', ['Stacks', 'Queues', 'Real-world uses']),
  PREI('ch5', 'link', 'Linked lists', 'Chains of nodes', 45, 'Build lists out of nodes that point to each other.', ['Nodes and pointers', 'Insert and delete', 'Linked list vs array']),
  PREI('ch6', 'hash', 'Hash tables', 'Instant lookups', 45, 'Look things up in constant time using keys.', ['Hash functions', 'Collisions', 'Maps and sets']),
  PREI('ch7', 'tree', 'Trees', 'Branching data', 50, 'Organise data in trees and search them fast.', ['Binary trees', 'Binary search trees', 'Tree traversal']),
  PREI('ch8', 'rocket', 'Interview practice', 'Put it all together', 60, 'Solve classic interview-style problems step by step.', ['Two pointers', 'Recursion', 'Problem-solving checklist'])
];

const GT = [
  {
    id: 'ch1', icon: 'terminal', title: 'Hello, Git', alias: 'First commit', minutes: 30,
    blurb: 'Create a repository, stage your work, save commits, and read the history. Every command runs in a practice terminal.',
    sections: [
      S_('Create a repository', `<p><b>Git</b> records the history of a project. A <b>repository</b> (repo) is a project folder plus Git's hidden history. <code>git init</code> turns a folder into one, and <code>git status</code> shows what Git sees.</p>`,
        `# Make a project folder into a Git repository\ngit init\necho "My first notes" > notes.txt\nls\ngit status`, 'Create a second file with touch todo.txt and check git status again.', `<code>git status</code> is the command you will run most. Run it often, especially before and after every other command.`),
      S_('Stage and commit', `<p>Saving in Git takes two steps. <code>git add</code> puts changes in the <b>staging area</b>, which is where you choose what goes into the next snapshot. <code>git commit</code> saves that snapshot with a message.</p>`,
        `git init\necho "My first notes" > notes.txt\ngit add notes.txt\ngit status\ngit commit -m "Add notes"\ngit status`, 'Add a second file and commit it with its own message.', `Think of staging as a loading dock: you pack the box with <code>git add</code>, then seal it with <code>git commit</code>.`),
      S_('Read the history', `<p><code>git log</code> lists your commits, newest first. Each commit has an id (a long hash), an author, a date and a message. <code>--oneline</code> gives a short version, and <code>git commit -am</code> stages and commits changes to files Git already tracks.</p>`,
        `git init\necho "line one" > notes.txt\ngit add notes.txt\ngit commit -m "Add first line"\necho "line two" >> notes.txt\ngit status\ngit commit -am "Add second line"\ngit log --oneline\ngit log`, 'Add a third line and commit it.', `Write messages that say <b>what changed and why</b>, like "Add login form", not "stuff" or "fix".`)
    ],
    quiz: [
      Q('Which command turns a folder into a Git repository?', ['<code>git start</code>', '<code>git new</code>', '<code>git create</code>', '<code>git init</code>'], 3, '<code>git init</code> creates the hidden <code>.git</code> folder that stores the history.'),
      Q('What does <code>git add</code> do?', ['Saves a commit permanently', 'Uploads your code to GitHub', 'Moves changes into the staging area', 'Creates a branch'], 2, '<code>git add</code> stages changes so they will be part of the next commit.'),
      Q('Which command shows which files are changed or staged?', ['<code>git log</code>', '<code>git status</code>', '<code>git check</code>', '<code>git list</code>'], 1, '<code>git status</code> reports staged, unstaged and untracked files.'),
      Q('What should a commit message do?', ['Be as short as possible, like "x"', 'List every line you edited', 'Describe what changed and why', 'Include your name only'], 2, 'A good message tells your future self (and teammates) what changed and why.')
    ],
    challenge: {
      title: 'Two commits',
      prompt: `<p>Create a repository, then make a file <code>readme.txt</code> with any text and commit it with the message <code>Add readme</code>. Add another line to <code>readme.txt</code> and commit again with the message <code>Update readme</code>. Finish with nothing left uncommitted.</p>`,
      starter: `# 1. Create a repository\ngit init\n\n# 2. Create readme.txt, then stage and commit it ("Add readme")\n\n# 3. Add a line to readme.txt and commit again ("Update readme")\n\n`,
      hint: `<code>echo "Hello" &gt; readme.txt</code>, <code>git add readme.txt</code>, <code>git commit -m "Add readme"</code>. Then <code>echo "More" &gt;&gt; readme.txt</code> and <code>git commit -am "Update readme"</code>.`,
      tests: [
        T('The history has Update readme on top of Add readme', (c, o, api) => JSON.stringify(api.repo.log) === JSON.stringify(['Update readme', 'Add readme'])),
        T('readme.txt has at least two lines', (c, o, api) => ((api.repo.wt['readme.txt'] || '').match(/\n/g) || []).length >= 2),
        T('The working tree is clean', (c, o, api) => api.repo.clean)
      ]
    }
  },
  {
    id: 'ch2', icon: 'branch', title: 'Branches and merging', alias: 'Parallel timelines', minutes: 35,
    blurb: 'Work on features safely in branches, switch between them, and merge them back.',
    sections: [
      S_('Branches', `<p>A <b>branch</b> is a movable label that points at a commit. The default branch is <code>main</code>. <code>git branch</code> lists or creates branches, and <b>HEAD</b> marks the one you are on.</p>`,
        `git init\necho "v1" > app.txt\ngit add app.txt\ngit commit -m "Start app"\ngit branch feature\ngit branch\ngit switch feature\ngit branch\ngit log --oneline`, 'Create a second branch called bugfix.', `Creating a branch does not copy your files. It only adds a new label, so it is instant and free.`),
      S_('Work on a branch', `<p><code>git switch -c name</code> creates a branch and switches to it in one step. Commits go to the branch you are on, and switching branches updates your files to match.</p>`,
        `git init\necho "v1" > app.txt\ngit add .\ngit commit -m "Start app"\ngit switch -c feature\necho "login page" > login.txt\ngit add login.txt\ngit commit -m "Add login page"\nls\ngit switch main\nls`, 'Watch login.txt disappear when you switch back to main.', `Commits on a branch stay there until you merge them. That is what makes branches a safe place to experiment.`),
      S_('Merge', `<p><code>git merge feature</code>, run while on <code>main</code>, brings the feature's commits into main. If main has not moved, Git simply slides the label forward, called a <b>fast-forward</b>.</p>`,
        `git init\necho "v1" > app.txt\ngit add .\ngit commit -m "Start app"\ngit switch -c feature\necho "login page" > login.txt\ngit add .\ngit commit -m "Add login page"\ngit switch main\ngit merge feature\ngit log --oneline`, 'Add a commit on main before merging to see a merge commit instead.', `If both branches changed the same line, Git cannot decide and reports a <b>merge conflict</b>. You fix it by hand, then commit.`)
    ],
    quiz: [
      Q('What is a branch?', ['A copy of the project on another computer', 'A movable label that points at a commit', 'A deleted commit', 'A kind of file'], 1, 'A branch is just a name pointing at a commit, which is why creating one is instant.'),
      Q('Which command creates a branch and switches to it?', ['<code>git branch -c name</code>', '<code>git new name</code>', '<code>git switch -c name</code>', '<code>git checkout name</code>'], 2, '<code>git switch -c name</code> (or the older <code>git checkout -b name</code>) does both at once.'),
      Q('What does <code>git merge feature</code> do when you are on <code>main</code>?', ['Deletes the feature branch', 'Renames main to feature', 'Uploads feature to GitHub', 'Brings the feature branch\'s commits into main'], 3, 'Merging combines the work from the named branch into the branch you are currently on.')
    ],
    challenge: {
      title: 'Ship a feature',
      prompt: `<p>Starting from one commit on <code>main</code>, create a branch called <code>feature</code>, add a file <code>feature.txt</code> and commit it there, switch back to <code>main</code>, and merge <code>feature</code> so main contains <code>feature.txt</code>.</p>`,
      starter: `git init\necho "v1" > app.txt\ngit add .\ngit commit -m "Start app"\n\n# 1. Create and switch to a branch called feature\n# 2. Create feature.txt and commit it\n# 3. Switch back to main and merge feature\n\n`,
      hint: `<code>git switch -c feature</code>, then <code>echo "hi" &gt; feature.txt</code>, <code>git add .</code>, <code>git commit -m "Add feature"</code>, then <code>git switch main</code> and <code>git merge feature</code>.`,
      tests: [
        T('A branch called feature exists', (c, o, api) => 'feature' in api.repo.branches),
        T('You are on main and it contains feature.txt', (c, o, api) => api.repo.head === 'main' && 'feature.txt' in api.repo.treeOf('main')),
        T('The working tree is clean', (c, o, api) => api.repo.clean)
      ]
    }
  },
  PREI('ch3', 'repeat', 'Undoing changes', 'Rewind safely', 35, 'Undo mistakes with restore, reset and revert.', ['git restore', 'Unstaging', 'Reverting a commit']),
  PREI('ch4', 'link', 'Merge conflicts', 'Fix collisions', 40, 'Understand and resolve conflicts when branches clash.', ['Reading conflict markers', 'Resolving by hand', 'Aborting a merge']),
  PREI('ch5', 'cloud', 'Remotes and GitHub', 'Share your work', 45, 'Push and pull your repository to and from GitHub.', ['git remote', 'git push and pull', 'Cloning a repository']),
  PREI('ch6', 'branch', 'Pull requests', 'Review together', 40, 'Propose and review changes with your team.', ['Opening a pull request', 'Code review', 'Merging on GitHub']),
  PREI('ch7', 'tag', 'Ignore files and tags', 'Keep it tidy', 35, 'Keep junk out of your repo and mark releases.', ['.gitignore', 'Tags', 'Releases']),
  PREI('ch8', 'rocket', 'Team workflow', 'Work like a pro', 50, 'Put it all together in a realistic team workflow.', ['Feature branches', 'Rebasing', 'A full project walkthrough'])
];

const DSA_V = {};
DS[0].sections[0].variants = {"c": {"code": "#include <stdio.h>\n\nint sum(int numbers[], int n) {\n    int total = 0;\n    for (int i = 0; i < n; i++) {\n        total += numbers[i];\n    }\n    return total;\n}\n\nint main() {\n    int data[] = {4, 8, 15, 16, 23, 42};\n    printf(\"%d\\n\", sum(data, 6));\n    return 0;\n}\n", "out": "108"}, "cpp": {"code": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint sum(const vector<int>& numbers) {\n    int total = 0;\n    for (int n : numbers) {\n        total += n;\n    }\n    return total;\n}\n\nint main() {\n    cout << sum({4, 8, 15, 16, 23, 42}) << endl;\n    return 0;\n}\n", "out": "108"}, "java": {"code": "public class Main {\n    static int sum(int[] numbers) {\n        int total = 0;\n        for (int i = 0; i < numbers.length; i++) {\n            total += numbers[i];\n        }\n        return total;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(sum(new int[]{4, 8, 15, 16, 23, 42}));\n    }\n}\n", "out": "108"}, "py": {"code": "def sum_list(numbers):\n    total = 0\n    for n in numbers:\n        total += n\n    return total\n\nprint(sum_list([4, 8, 15, 16, 23, 42]))\n", "out": "108"}};
DS[0].sections[1].variants = {"c": {"code": "#include <stdio.h>\n\nint steps = 0;\n\nint find_max(int items[], int n) {\n    int best = items[0];\n    steps = 0;\n    for (int i = 1; i < n; i++) {\n        steps++;\n        if (items[i] > best) {\n            best = items[i];\n        }\n    }\n    return best;\n}\n\nint main() {\n    int a[] = {3, 9, 2, 7};\n    int b[] = {3, 9, 2, 7, 5, 8, 1, 6};\n    printf(\"max=%d \", find_max(a, 4));\n    printf(\"steps=%d\\n\", steps);\n    printf(\"max=%d \", find_max(b, 8));\n    printf(\"steps=%d\\n\", steps);\n    return 0;\n}\n", "out": "max=9 steps=3\nmax=9 steps=7"}, "cpp": {"code": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint findMax(const vector<int>& items, int& steps) {\n    int best = items[0];\n    steps = 0;\n    for (size_t i = 1; i < items.size(); i++) {\n        steps++;\n        if (items[i] > best) {\n            best = items[i];\n        }\n    }\n    return best;\n}\n\nint main() {\n    int steps;\n    int best = findMax({3, 9, 2, 7}, steps);\n    cout << \"max=\" << best << \" steps=\" << steps << endl;\n    best = findMax({3, 9, 2, 7, 5, 8, 1, 6}, steps);\n    cout << \"max=\" << best << \" steps=\" << steps << endl;\n    return 0;\n}\n", "out": "max=9 steps=3\nmax=9 steps=7"}, "java": {"code": "public class Main {\n    static int steps = 0;\n\n    static int findMax(int[] items) {\n        int best = items[0];\n        steps = 0;\n        for (int i = 1; i < items.length; i++) {\n            steps++;\n            if (items[i] > best) {\n                best = items[i];\n            }\n        }\n        return best;\n    }\n\n    public static void main(String[] args) {\n        int best = findMax(new int[]{3, 9, 2, 7});\n        System.out.println(\"max=\" + best + \" steps=\" + steps);\n        best = findMax(new int[]{3, 9, 2, 7, 5, 8, 1, 6});\n        System.out.println(\"max=\" + best + \" steps=\" + steps);\n    }\n}\n", "out": "max=9 steps=3\nmax=9 steps=7"}, "py": {"code": "def find_max(items):\n    steps = 0\n    best = items[0]\n    for i in range(1, len(items)):\n        steps += 1\n        if items[i] > best:\n            best = items[i]\n    return best, steps\n\nfor data in ([3, 9, 2, 7], [3, 9, 2, 7, 5, 8, 1, 6]):\n    best, steps = find_max(data)\n    print(f\"max={best} steps={steps}\")\n", "out": "max=9 steps=3\nmax=9 steps=7"}};
DS[0].sections[2].variants = {"c": {"code": "#include <stdio.h>\n\nint count_pairs(int n) {\n    int steps = 0;\n    for (int i = 0; i < n; i++) {\n        for (int j = 0; j < n; j++) {\n            steps++;\n        }\n    }\n    return steps;\n}\n\nint main() {\n    printf(\"%d\\n\", count_pairs(10));\n    printf(\"%d\\n\", count_pairs(100));\n    return 0;\n}\n", "out": "100\n10000"}, "cpp": {"code": "#include <iostream>\nusing namespace std;\n\nint countPairs(int n) {\n    int steps = 0;\n    for (int i = 0; i < n; i++) {\n        for (int j = 0; j < n; j++) {\n            steps++;\n        }\n    }\n    return steps;\n}\n\nint main() {\n    cout << countPairs(10) << endl;\n    cout << countPairs(100) << endl;\n    return 0;\n}\n", "out": "100\n10000"}, "java": {"code": "public class Main {\n    static int countPairs(int n) {\n        int steps = 0;\n        for (int i = 0; i < n; i++) {\n            for (int j = 0; j < n; j++) {\n                steps++;\n            }\n        }\n        return steps;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(countPairs(10));\n        System.out.println(countPairs(100));\n    }\n}\n", "out": "100\n10000"}, "py": {"code": "def count_pairs(n):\n    steps = 0\n    for i in range(n):\n        for j in range(n):\n            steps += 1\n    return steps\n\nprint(count_pairs(10))\nprint(count_pairs(100))\n", "out": "100\n10000"}};
DS[1].sections[0].variants = {"c": {"code": "#include <stdio.h>\n\nint linear_search(int items[], int n, int target) {\n    for (int i = 0; i < n; i++) {\n        if (items[i] == target) {\n            return i;\n        }\n    }\n    return -1;\n}\n\nint main() {\n    int data[] = {5, 3, 8, 1};\n    printf(\"%d\\n\", linear_search(data, 4, 8));\n    printf(\"%d\\n\", linear_search(data, 4, 7));\n    return 0;\n}\n", "out": "2\n-1"}, "cpp": {"code": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint linearSearch(const vector<int>& items, int target) {\n    for (int i = 0; i < (int)items.size(); i++) {\n        if (items[i] == target) {\n            return i;\n        }\n    }\n    return -1;\n}\n\nint main() {\n    vector<int> data = {5, 3, 8, 1};\n    cout << linearSearch(data, 8) << endl;\n    cout << linearSearch(data, 7) << endl;\n    return 0;\n}\n", "out": "2\n-1"}, "java": {"code": "public class Main {\n    static int linearSearch(int[] items, int target) {\n        for (int i = 0; i < items.length; i++) {\n            if (items[i] == target) {\n                return i;\n            }\n        }\n        return -1;\n    }\n\n    public static void main(String[] args) {\n        int[] data = {5, 3, 8, 1};\n        System.out.println(linearSearch(data, 8));\n        System.out.println(linearSearch(data, 7));\n    }\n}\n", "out": "2\n-1"}, "py": {"code": "def linear_search(items, target):\n    for i in range(len(items)):\n        if items[i] == target:\n            return i\n    return -1\n\nprint(linear_search([5, 3, 8, 1], 8))\nprint(linear_search([5, 3, 8, 1], 7))\n", "out": "2\n-1"}};
DS[1].sections[1].variants = {"c": {"code": "#include <stdio.h>\n\nint steps = 0;\n\nint binary_search(int items[], int n, int target) {\n    int low = 0, high = n - 1;\n    steps = 0;\n    while (low <= high) {\n        steps++;\n        int mid = (low + high) / 2;\n        if (items[mid] == target) {\n            return mid;\n        }\n        if (items[mid] < target) {\n            low = mid + 1;\n        } else {\n            high = mid - 1;\n        }\n    }\n    return -1;\n}\n\nint main() {\n    int nums[] = {1, 3, 5, 7, 9, 11, 13, 15};\n    int index = binary_search(nums, 8, 11);\n    printf(\"index=%d steps=%d\\n\", index, steps);\n    index = binary_search(nums, 8, 4);\n    printf(\"index=%d steps=%d\\n\", index, steps);\n    return 0;\n}\n", "out": "index=5 steps=2\nindex=-1 steps=3"}, "cpp": {"code": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint binarySearch(const vector<int>& items, int target, int& steps) {\n    int low = 0, high = (int)items.size() - 1;\n    steps = 0;\n    while (low <= high) {\n        steps++;\n        int mid = (low + high) / 2;\n        if (items[mid] == target) return mid;\n        if (items[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return -1;\n}\n\nint main() {\n    vector<int> nums = {1, 3, 5, 7, 9, 11, 13, 15};\n    int steps;\n    int index = binarySearch(nums, 11, steps);\n    cout << \"index=\" << index << \" steps=\" << steps << endl;\n    index = binarySearch(nums, 4, steps);\n    cout << \"index=\" << index << \" steps=\" << steps << endl;\n    return 0;\n}\n", "out": "index=5 steps=2\nindex=-1 steps=3"}, "java": {"code": "public class Main {\n    static int steps = 0;\n\n    static int binarySearch(int[] items, int target) {\n        int low = 0, high = items.length - 1;\n        steps = 0;\n        while (low <= high) {\n            steps++;\n            int mid = (low + high) / 2;\n            if (items[mid] == target) {\n                return mid;\n            }\n            if (items[mid] < target) {\n                low = mid + 1;\n            } else {\n                high = mid - 1;\n            }\n        }\n        return -1;\n    }\n\n    public static void main(String[] args) {\n        int[] nums = {1, 3, 5, 7, 9, 11, 13, 15};\n        int index = binarySearch(nums, 11);\n        System.out.println(\"index=\" + index + \" steps=\" + steps);\n        index = binarySearch(nums, 4);\n        System.out.println(\"index=\" + index + \" steps=\" + steps);\n    }\n}\n", "out": "index=5 steps=2\nindex=-1 steps=3"}, "py": {"code": "def binary_search(items, target):\n    low, high = 0, len(items) - 1\n    steps = 0\n    while low <= high:\n        steps += 1\n        mid = (low + high) // 2\n        if items[mid] == target:\n            return mid, steps\n        if items[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1, steps\n\nnums = [1, 3, 5, 7, 9, 11, 13, 15]\nfor target in (11, 4):\n    index, steps = binary_search(nums, target)\n    print(f\"index={index} steps={steps}\")\n", "out": "index=5 steps=2\nindex=-1 steps=3"}};
DS[1].sections[2].variants = {"c": {"code": "#include <stdio.h>\n\nint binary_steps(int items[], int n, int target) {\n    int low = 0, high = n - 1, steps = 0;\n    while (low <= high) {\n        steps++;\n        int mid = (low + high) / 2;\n        if (items[mid] == target) return steps;\n        if (items[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return steps;\n}\n\nint main() {\n    int big[1000];\n    for (int i = 0; i < 1000; i++) {\n        big[i] = i * 2;\n    }\n\n    printf(\"Items: %d\\n\", 1000);\n    printf(\"Steps to find the last item: %d\\n\", binary_steps(big, 1000, 1998));\n    printf(\"Steps for linear search: %d\\n\", 1000);\n    return 0;\n}\n", "out": "Items: 1000\nSteps to find the last item: 10\nSteps for linear search: 1000"}, "cpp": {"code": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint binarySteps(const vector<int>& items, int target) {\n    int low = 0, high = (int)items.size() - 1, steps = 0;\n    while (low <= high) {\n        steps++;\n        int mid = (low + high) / 2;\n        if (items[mid] == target) return steps;\n        if (items[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return steps;\n}\n\nint main() {\n    vector<int> big;\n    for (int i = 0; i < 1000; i++) {\n        big.push_back(i * 2);\n    }\n\n    cout << \"Items: \" << big.size() << endl;\n    cout << \"Steps to find the last item: \" << binarySteps(big, 1998) << endl;\n    cout << \"Steps for linear search: 1000\" << endl;\n    return 0;\n}\n", "out": "Items: 1000\nSteps to find the last item: 10\nSteps for linear search: 1000"}, "java": {"code": "public class Main {\n    static int binarySteps(int[] items, int target) {\n        int low = 0, high = items.length - 1, steps = 0;\n        while (low <= high) {\n            steps++;\n            int mid = (low + high) / 2;\n            if (items[mid] == target) return steps;\n            if (items[mid] < target) low = mid + 1;\n            else high = mid - 1;\n        }\n        return steps;\n    }\n\n    public static void main(String[] args) {\n        int[] big = new int[1000];\n        for (int i = 0; i < 1000; i++) {\n            big[i] = i * 2;\n        }\n\n        System.out.println(\"Items: \" + big.length);\n        System.out.println(\"Steps to find the last item: \" + binarySteps(big, 1998));\n        System.out.println(\"Steps for linear search: 1000\");\n    }\n}\n", "out": "Items: 1000\nSteps to find the last item: 10\nSteps for linear search: 1000"}, "py": {"code": "def binary_steps(items, target):\n    low, high = 0, len(items) - 1\n    steps = 0\n    while low <= high:\n        steps += 1\n        mid = (low + high) // 2\n        if items[mid] == target:\n            return steps\n        if items[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return steps\n\nbig = [i * 2 for i in range(1000)]\n\nprint(\"Items:\", len(big))\nprint(\"Steps to find the last item:\", binary_steps(big, 1998))\nprint(\"Steps for linear search: 1000\")\n", "out": "Items: 1000\nSteps to find the last item: 10\nSteps for linear search: 1000"}};
DS[0].challenge.starters = {"c": "#include <stdio.h>\n\nint count_evens(int numbers[], int n) {\n    // loop through numbers and count the even ones\n    return 0;\n}\n\nint main() {\n    int data[] = {1, 2, 3, 4};\n    printf(\"%d\\n\", count_evens(data, 4));\n    return 0;\n}\n", "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint countEvens(const vector<int>& numbers) {\n    // loop through numbers and count the even ones\n    return 0;\n}\n\nint main() {\n    cout << countEvens({1, 2, 3, 4}) << endl;\n    return 0;\n}\n", "java": "public class Main {\n    static int countEvens(int[] numbers) {\n        // loop through numbers and count the even ones\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(countEvens(new int[]{1, 2, 3, 4}));\n    }\n}\n", "py": "def count_evens(numbers):\n    # loop through numbers and count the even ones\n    return 0\n\nprint(count_evens([1, 2, 3, 4]))\n"};
DS[1].challenge.starters = {"c": "#include <stdio.h>\n\nint binary_search(int items[], int n, int target) {\n    // keep low and high pointers and check the middle each time\n    return -1;\n}\n\nint main() {\n    int data[] = {1, 3, 5, 7, 9};\n    printf(\"%d\\n\", binary_search(data, 5, 7));\n    return 0;\n}\n", "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint binarySearch(const vector<int>& items, int target) {\n    // keep low and high pointers and check the middle each time\n    return -1;\n}\n\nint main() {\n    cout << binarySearch({1, 3, 5, 7, 9}, 7) << endl;\n    return 0;\n}\n", "java": "public class Main {\n    static int binarySearch(int[] items, int target) {\n        // keep low and high pointers and check the middle each time\n        return -1;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(binarySearch(new int[]{1, 3, 5, 7, 9}, 7));\n    }\n}\n", "py": "def binary_search(items, target):\n    # keep low and high pointers and check the middle each time\n    return -1\n\nprint(binary_search([1, 3, 5, 7, 9], 7))\n"};
const COURSES = [
  { id: 'python', name: 'Python', glyph: 'Py', lang: 'python', file: 'main.py', level: 'Beginner friendly', title: 'Learn Python',
    tag: 'Readable and friendly. Scripts, data, AI and the web all start here.',
    intro: 'Eight chapters from your first print() to a mini project. Finish a chapter\'s lessons, quiz and challenge to open the next one.',
    sample: 'name = "Pythonista"\nprint(f"Hello, {name}!")', chapters: PY },
  { id: 'c', name: 'C', glyph: 'C', lang: 'c', file: 'main.c', level: 'Beginner to intermediate', title: 'Learn C',
    tag: 'The language underneath everything. Learn how programs really talk to the machine.',
    intro: 'Eight chapters from your first printf() to pointers and files. Finish a chapter\'s lessons, quiz and challenge to open the next one.',
    sample: '#include <stdio.h>\n\nint main() {\n    printf("Hello, C!\\n");\n    return 0;\n}', chapters: CC },
  { id: 'cpp', name: 'C++', glyph: 'C++', lang: 'cpp', file: 'main.cpp', level: 'Intermediate', title: 'Learn C++',
    tag: 'C\'s speed with objects and a big standard library. Games, engines and performance code.',
    intro: 'Eight chapters from your first cout to classes and the standard library. Finish a chapter\'s lessons, quiz and challenge to open the next one.',
    sample: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, C++!" << endl;\n}', chapters: CP },
  { id: 'react', name: 'React', glyph: 'Re', lang: 'jsx', file: 'App.jsx', level: 'Intermediate', title: 'Learn React',
    tag: 'Build interactive screens from small reusable components, the skill behind most modern web apps.',
    intro: 'Eight chapters from your first component to routing. Every lesson has a live preview that really reacts when you click and type. Finish a chapter\'s lessons, quiz and challenge to open the next one.',
    sample: 'function Hello({ name }) {\n  return <h1>Hi, {name}!</h1>;\n}\n\n<Hello name="Ada" />', chapters: RX },
  { id: 'sql', name: 'SQL', glyph: 'SQL', lang: 'sql', file: 'query.sql', level: 'Beginner friendly', title: 'Learn SQL',
    tag: 'Ask databases questions. A top data skill that reads almost like English.',
    intro: 'Eight chapters from your first SELECT to joins and project work. Queries run against a sample students table. Finish a chapter\'s lessons, quiz and challenge to open the next one.',
    sample: 'SELECT name, score\nFROM students\nWHERE score >= 90\nORDER BY score DESC;', chapters: SQ },
  { id: 'java', name: 'Java', glyph: 'Jv', lang: 'java', file: 'Main.java', level: 'Beginner to intermediate', title: 'Learn Java',
    tag: 'Write once, run anywhere. Powers Android apps, big back-end systems and a lot of hiring.',
    intro: 'Eight chapters from your first class to objects and collections. Finish a chapter\'s lessons, quiz and challenge to open the next one.',
    sample: 'int apples = 7;\nString msg = "Apples: " + apples;\nSystem.out.println(msg);', chapters: JV },
  { id: 'js', name: 'JavaScript', glyph: 'JS', lang: 'js', file: 'script.js', level: 'Beginner friendly', title: 'Learn JavaScript',
    tag: 'The language of the web. Runs in every browser and powers the apps you use every day.',
    intro: 'Eight chapters from your first console.log to async code and mini projects. Finish a chapter\'s lessons, quiz and challenge to open the next one.',
    sample: 'const nums = [1, 2, 3];\nconsole.log(\n  nums.map(n => n * 2)\n);', chapters: JSC },
  { id: 'dsa', name: 'DSA', glyph: 'DSA', lang: 'js', file: 'solution.js', level: 'Intermediate', title: 'Learn DSA',
    tag: 'Data structures and algorithms, the problem-solving skills behind every coding interview. Pick C, C++, Java, JavaScript or Python.',
    intro: 'Eight chapters from Big-O to trees and interview practice. Choose your language: C, C++, Java, JavaScript or Python. Finish a chapter\'s lessons, quiz and challenge to open the next one.',
    sample: 'function max(list) {\n  let best = list[0];\n  for (const x of list) {\n    if (x > best) best = x;\n  }\n  return best;\n}', chapters: DS },
  { id: 'git', name: 'Git', glyph: 'Git', lang: 'git', file: 'terminal', level: 'Beginner friendly', title: 'Learn Git',
    tag: 'Track every change, undo mistakes and work with a team. Practise in a safe terminal.',
    intro: 'Eight chapters from your first commit to team workflows. Every lesson runs in a practice terminal with a repository that behaves like the real thing. Finish a chapter\'s lessons, quiz and challenge to open the next one.',
    sample: 'git init\ngit add notes.txt\ngit commit -m "First commit"', chapters: GT }
];
const GCOL = { python: '#3776AB', c: '#0E8A84', cpp: '#5B4BC4', react: '#D6336C', sql: '#2E9E5B', java: '#D9480F', js: '#2F3136', dsa: '#9C36B5', git: '#5C940D' };
COURSES.forEach(c => c.chapters.forEach(ch => { ch.id = c.id + '-' + ch.id; }));

export { COURSES, BADGES, TIPS, GCOL };
