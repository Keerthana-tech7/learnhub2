/**
 * PREVIOUS YEAR QUESTION PAPERS (PYQ) REPOSITORY
 * Comprehensive, authentic end-semester and model examination papers
 * for all 7 engineering and computer science disciplines (at least 2 per discipline).
 */

const QUESTION_PAPERS = [
  // ==========================================
  // 1. C PROGRAMMING
  // ==========================================
  {
    id: "pyq-c-prog-2024",
    title: "C Programming & Systems Architecture — End-Semester Exam (2024)",
    subject: "C Programming",
    reading_time: "3 Hours Exam • 100 Marks",
    level: "Previous Year Question Paper (2024)",
    summary: "Official University End-Semester Examination Paper (May/June 2024). Comprehensive evaluation on Pointers, Dynamic Memory Allocation, Structs & Bit-Fields, File Processing, and Low-Level Memory Buffers.",
    content: `
      <div class="exam-paper-container">
        <div class="exam-header-box">
          <div class="exam-univ-title">DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING</div>
          <div class="exam-degree">B.E. / B.TECH. DEGREE SEMESTER EXAMINATIONS — MAY / JUNE 2024</div>
          <div class="exam-meta-grid">
            <div><strong>Course Code:</strong> CS2101</div>
            <div><strong>Course Title:</strong> C Programming & Systems Architecture</div>
            <div><strong>Duration:</strong> 3 Hours</div>
            <div><strong>Max. Marks:</strong> 100</div>
          </div>
        </div>

        <div class="exam-instructions">
          <strong>GENERAL INSTRUCTIONS:</strong>
          <ol>
            <li>Answer ALL questions in PART A (10 × 2 = 20 Marks).</li>
            <li>Answer ALL questions in PART B selecting either (a) or (b) from each question (5 × 13 = 65 Marks).</li>
            <li>Answer PART C compulsory scenario analysis question (1 × 15 = 15 Marks).</li>
          </ol>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART A — (10 × 2 = 20 Marks)</h3>
          <p class="exam-instruction-sub">Answer all questions. Each question carries 2 marks.</p>
          <ol class="exam-questions-list">
            <li>Differentiate between <code>malloc()</code> and <code>calloc()</code> regarding initialization and memory allocation behavior.</li>
            <li>What is a <em>dangling pointer</em>, and how can it be avoided after calling <code>free()</code>?</li>
            <li>Explain the difference between <code>const char *p</code> and <code>char * const p</code> with brief syntax.</li>
            <li>Calculate the total byte size of the following union on a 64-bit architecture and justify:
              <pre><code>union Packet { int id; double timestamp; char buffer[12]; };</code></pre>
            </li>
            <li>What are the four storage classes in C? State the default storage class for local variables.</li>
            <li>Why is the use of <code>gets()</code> discouraged in modern C? Name two secure alternatives.</li>
            <li>Distinguish between <code>#include &lt;header.h&gt;</code> and <code>#include "header.h"</code>.</li>
            <li>What is the difference between file open modes <code>"r+"</code> and <code>"w+"</code>?</li>
            <li>Write a single-line C expression using bitwise operators to check if an integer <code>n</code> is a power of two.</li>
            <li>Explain the significance of the <code>volatile</code> keyword in hardware-interfaced C programming.</li>
          </ol>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART B — (5 × 13 = 65 Marks)</h3>
          <p class="exam-instruction-sub">Answer either (a) or (b) from each question.</p>

          <div class="exam-group">
            <p><strong>11. (a)</strong> Write a complete C program to dynamically allocate a 2D matrix of dimensions <code>m × n</code> using an array of pointers. Implement functions to read elements, compute the transpose, and properly release all allocated heap memory to avoid leaks. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>11. (b)</strong> Discuss pointer arithmetic in C. Given an integer array <code>int arr[5] = {10, 20, 30, 40, 50}</code>, explain the memory address increments and output produced by <code>*(arr + 3)</code> versus <code>*arr + 3</code> with diagrams. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>12. (a)</strong> Design a C program that defines a structure <code>Student</code> (roll_no, name, GPA, department). Read records for <code>N</code> students, sort them in descending order of GPA using <code>qsort()</code> with a custom comparator function, and display the ranked merit list. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>12. (b)</strong> Explain bit-fields in C structures. Write a complete structure definition for an 8-bit microcontroller status register containing: Carry Flag (1 bit), Zero Flag (1 bit), Overflow Flag (1 bit), Mode (2 bits), and Reserved (3 bits). Demonstrate how to set and read these flags. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>13. (a)</strong> Implement a file processing utility in C that reads a source text file <code>input.txt</code>, counts total characters, words, and lines, and writes a formatted summary report to <code>analytics.txt</code>. Handle all file opening errors gracefully. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>13. (b)</strong> Differentiate between text files and binary files in C. Write a program to write an array of 5 structure records into a binary file using <code>fwrite()</code>, and subsequently read back the 3rd record using <code>fseek()</code> and <code>fread()</code>. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>14. (a)</strong> Write a C program implementing a singly linked list with functions for inserting a node at the head, inserting at the tail, and deleting a node by value. Illustrate pointer reassignment steps. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>14. (b)</strong> Explain function pointers in C. Write a modular calculation engine that accepts two floating-point operands and a function pointer corresponding to addition, subtraction, multiplication, or division selected by the user. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>15. (a)</strong> Discuss preprocessor directives in C. Compare object-like macros, function-like macros, conditional compilation (<code>#ifdef</code>, <code>#ifndef</code>, <code>#endif</code>), and include guards. Highlight pitfalls of macro parameter side-effects. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>15. (b)</strong> Explain variable-length argument lists in C using <code>stdarg.h</code> (<code>va_list</code>, <code>va_start</code>, <code>va_arg</code>, <code>va_end</code>). Write a custom function <code>my_printf()</code> that supports format specifiers <code>%d</code>, <code>%c</code>, and <code>%s</code>. <em>(13 Marks)</em></p>
          </div>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART C — (1 × 15 = 15 Marks)</h3>
          <p class="exam-instruction-sub">Compulsory Technical Case Study.</p>
          <p><strong>16.</strong> An embedded IoT gateway device has constrained RAM (32 KB) and frequently receives telemetry data packets of variable size. Implement a lightweight custom circular buffer (Ring Buffer) in C that supports:</p>
          <ul>
            <li><code>init_buffer(RingBuffer *rb, size_t capacity)</code></li>
            <li><code>enqueue_byte(RingBuffer *rb, uint8_t byte)</code> (overwriting oldest data when full)</li>
            <li><code>dequeue_byte(RingBuffer *rb, uint8_t *byte)</code></li>
            <li>Buffer status check (isEmpty, isFull, count)</li>
          </ul>
          <p>Provide complete C struct definition, pointer logic, and explain why circular buffers are preferred in real-time embedded systems over linear arrays. <em>(15 Marks)</em></p>
        </div>
      </div>
    `,
    file_url: null,
    uploader_name: "University Examination Cell"
  },
  {
    id: "pyq-c-prog-2023",
    title: "C Programming & Problem Solving — End-Semester Exam (2023)",
    subject: "C Programming",
    reading_time: "3 Hours Exam • 100 Marks",
    level: "Previous Year Question Paper (2023)",
    summary: "University Final Examination Paper (Nov/Dec 2023). Focuses on Recursion, String Algorithms, Multi-dimensional Arrays, Dynamic Memory Reallocation, and Command-Line Arguments.",
    content: `
      <div class="exam-paper-container">
        <div class="exam-header-box">
          <div class="exam-univ-title">DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING</div>
          <div class="exam-degree">B.E. / B.TECH. DEGREE SEMESTER EXAMINATIONS — NOVEMBER / DECEMBER 2023</div>
          <div class="exam-meta-grid">
            <div><strong>Course Code:</strong> CS1102</div>
            <div><strong>Course Title:</strong> Problem Solving & C Programming</div>
            <div><strong>Duration:</strong> 3 Hours</div>
            <div><strong>Max. Marks:</strong> 100</div>
          </div>
        </div>

        <div class="exam-instructions">
          <strong>GENERAL INSTRUCTIONS:</strong>
          <ol>
            <li>PART A: 10 Questions × 2 Marks = 20 Marks.</li>
            <li>PART B: 5 Questions × 13 Marks = 65 Marks.</li>
            <li>PART C: 1 Case Study × 15 Marks = 15 Marks.</li>
          </ol>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART A — (10 × 2 = 20 Marks)</h3>
          <ol class="exam-questions-list">
            <li>What is the output of <code>printf("%d", sizeof('A'));</code> in C? Explain why.</li>
            <li>Explain short-circuit evaluation in C logical operators <code>&amp;&amp;</code> and <code>||</code> with an example.</li>
            <li>How are command-line arguments passed to <code>main()</code>? What do <code>argc</code> and <code>argv</code> represent?</li>
            <li>State the purpose of <code>realloc()</code>. What happens if the requested size is 0?</li>
            <li>Differentiate between pass-by-value and simulated pass-by-reference in C.</li>
            <li>Write a recursive function in C to compute the factorial of a positive integer <code>n</code>.</li>
            <li>Why does <code>strcmp("apple", "banana")</code> return a negative value?</li>
            <li>Explain the purpose of the <code>typedef</code> keyword with a practical code snippet.</li>
            <li>What is the difference between a static global variable and a standard global variable in multi-file C programs?</li>
            <li>What is an enumerated data type (<code>enum</code>)? Provide a concise declaration example.</li>
          </ol>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART B — (5 × 13 = 65 Marks)</h3>

          <div class="exam-group">
            <p><strong>11. (a)</strong> Write a C program to solve the classic Tower of Hanoi puzzle for <code>N</code> disks using recursion. Draw the recursion execution tree diagram for <code>N = 3</code> and derive its time complexity recurrence relation. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>11. (b)</strong> Write a C program to perform matrix multiplication of two matrices <code>A (p × q)</code> and <code>B (q × r)</code>. Check compatibility conditions and optimize access patterns using row-major pointer indexing. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>12. (a)</strong> Implement your own versions of the following standard string library functions without including <code>&lt;string.h&gt;</code>: (i) <code>my_strlen()</code>, (ii) <code>my_strcpy()</code>, (iii) <code>my_strcat()</code>, and (iv) <code>my_reverse()</code>. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>12. (b)</strong> Write a C program to read a line of text, tokenize it into individual words, and find the frequency of each unique word ignoring case sensitivity. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>13. (a)</strong> Explain nested structures and self-referential structures in C. Define an employee structure containing personal details, joined date (nested date structure), and an array of project assignments. Write code to input and print records. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>13. (b)</strong> Compare structures and unions in terms of memory layout, member accessibility, and alignment. Write a program to demonstrate memory sharing in unions. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>14. (a)</strong> Write a command-line file copy utility in C (similar to UNIX <code>cp</code>) that takes source and destination file paths as command-line arguments: <code>./mycp source.txt dest.txt</code>. Handle missing arguments, non-existent files, and write permissions. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>14. (b)</strong> Discuss random access in files using <code>fseek()</code>, <code>ftell()</code>, and <code>rewind()</code>. Write a program to reverse the contents of a file and write it to another file using backward seek operations. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>15. (a)</strong> Explain dynamic memory management. Write a program that begins with a dynamic array of size 5, dynamically doubles its capacity using <code>realloc()</code> whenever full, and outputs the reallocation trace. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>15. (b)</strong> Explain sorting algorithms in C. Write a complete implementation of In-place Quick Sort on an array of integers. Provide a step-by-step trace for the input <code>[35, 12, 67, 45, 9, 82, 23]</code>. <em>(13 Marks)</em></p>
          </div>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART C — (1 × 15 = 15 Marks)</h3>
          <p><strong>16.</strong> Design a robust Student Grading & Record System in C that stores records in a persistent binary file <code>grades.dat</code>. Implement functionality to: (i) Add new student record, (ii) Search student by Roll Number using binary search on sorted index, and (iii) Compute highest, lowest, and average score across class. Address potential file corruption issues. <em>(15 Marks)</em></p>
        </div>
      </div>
    `,
    file_url: null,
    uploader_name: "Academic Board of Examiners"
  },

  // ==========================================
  // 2. DATA STRUCTURES & ALGORITHMS
  // ==========================================
  {
    id: "pyq-dsa-2024",
    title: "Data Structures & Algorithms (DSA) — End-Semester Exam (2024)",
    subject: "Data Structures",
    reading_time: "3 Hours Exam • 100 Marks",
    level: "Previous Year Question Paper (2024)",
    summary: "University Final Examination Paper (May 2024). In-depth analytical questions on Asymptotic Complexity (Master Theorem), Balanced AVL Trees, Binary Heaps, Dijkstra's & Kruskal's Algorithms, and Dynamic Programming.",
    content: `
      <div class="exam-paper-container">
        <div class="exam-header-box">
          <div class="exam-univ-title">DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING</div>
          <div class="exam-degree">B.E. / B.TECH. DEGREE SEMESTER EXAMINATIONS — MAY 2024</div>
          <div class="exam-meta-grid">
            <div><strong>Course Code:</strong> CS2202</div>
            <div><strong>Course Title:</strong> Data Structures & Algorithm Analysis</div>
            <div><strong>Duration:</strong> 3 Hours</div>
            <div><strong>Max. Marks:</strong> 100</div>
          </div>
        </div>

        <div class="exam-instructions">
          <strong>GENERAL INSTRUCTIONS:</strong>
          <ol>
            <li>PART A: 10 Questions × 2 Marks = 20 Marks.</li>
            <li>PART B: 5 Questions × 13 Marks = 65 Marks.</li>
            <li>PART C: 1 System Challenge × 15 Marks = 15 Marks.</li>
          </ol>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART A — (10 × 2 = 20 Marks)</h3>
          <ol class="exam-questions-list">
            <li>Define Big-O, Big-Omega, and Big-Theta asymptotic notations with graphical representations.</li>
            <li>What is the Balance Factor of an AVL tree node? What range indicates a balanced node?</li>
            <li>Given an array representation of a binary heap, write formulas to determine the parent, left child, and right child of an element at index <code>i</code> (1-based index).</li>
            <li>Differentiate between Singly Linked Lists and Doubly Linked Lists in terms of memory overhead and deletion complexity.</li>
            <li>What is the worst-case time complexity of Quick Sort? Under what initial condition does it occur?</li>
            <li>Define a Minimum Spanning Tree (MST). Does an MST always contain the edge with the lowest weight?</li>
            <li>Explain the primary difference between Breadth-First Search (BFS) and Depth-First Search (DFS) in graph traversal.</li>
            <li>What is a Hash Collision? Briefly compare chaining with open addressing (linear probing).</li>
            <li>State the principle of optimality in Dynamic Programming.</li>
            <li>What is a Topological Sort? What condition must a graph satisfy to possess a topological ordering?</li>
          </ol>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART B — (5 × 13 = 65 Marks)</h3>

          <div class="exam-group">
            <p><strong>11. (a)</strong> Solve the following recurrence relations using the Master Theorem or substitution method: (i) <code>T(n) = 2T(n/2) + O(n)</code>, (ii) <code>T(n) = 4T(n/2) + O(n)</code>, (iii) <code>T(n) = 2T(n/2) + O(n²)</code>. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>11. (b)</strong> Explain amortized time complexity. Analyze the amortized cost of inserting <code>n</code> elements into a dynamic array that doubles in capacity whenever full. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>12. (a)</strong> Construct an AVL Tree by inserting the following sequence of numbers one by one: <code>[15, 20, 24, 10, 13, 7, 30, 36, 25]</code>. Specify each rotation (LL, RR, LR, RL) performed at each step. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>12. (b)</strong> Explain Binary Search Trees (BST). Write algorithms to: (i) Insert a node, (ii) Search for a key, and (iii) Delete a node with two children. Illustrate with a comprehensive trace. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>13. (a)</strong> Given the array <code>[45, 20, 10, 75, 90, 30, 80, 50, 60]</code>, build a Binary Max-Heap using the linear-time bottom-up <code>buildHeap()</code> procedure. Show the tree structure at each step of heapification. Then demonstrate two successive <code>deleteMax()</code> operations. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>13. (b)</strong> Implement a Priority Queue using a Min-Heap. Provide algorithms for <code>insert()</code> and <code>extractMin()</code> along with their logarithmic time complexity proofs. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>14. (a)</strong> Apply Dijkstra's Single-Source Shortest Path algorithm on a directed weighted graph with 6 vertices starting from source vertex <code>A</code>. Show the distance vector and predecessor table at each iteration. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>14. (b)</strong> Compare Kruskal's and Prim's algorithms for finding Minimum Spanning Trees. Step through Kruskal's algorithm on an undirected graph with 7 vertices using Disjoint Set Union (Union-Find) with path compression. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>15. (a)</strong> Solve the 0/1 Knapsack Problem using Dynamic Programming for capacity <code>W = 8</code> and items: (Weight: [2, 3, 4, 5], Value: [3, 4, 5, 8]). Draw the complete DP memoization table and trace the selected items. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>15. (b)</strong> Explain the Longest Common Subsequence (LCS) problem. Compute the LCS of strings <code>X = "BACDB"</code> and <code>Y = "BDCB"</code> using DP. Show the direction arrow matrix and optimal sequence. <em>(13 Marks)</em></p>
          </div>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART C — (1 × 15 = 15 Marks)</h3>
          <p><strong>16.</strong> Design and implement an <strong>LRU (Least Recently Used) Cache</strong> data structure supporting:</p>
          <ul>
            <li><code>get(key)</code>: Returns key value in <code>O(1)</code> time, updating usage order.</li>
            <li><code>put(key, value)</code>: Inserts or updates key in <code>O(1)</code> time, evicting the least recently used element when cache exceeds capacity.</li>
          </ul>
          <p>Detail how combining a Hash Map with a Doubly Linked List achieves constant-time operations. Provide full data structure definitions, pointer manipulation diagrams, and boundary condition handling. <em>(15 Marks)</em></p>
        </div>
      </div>
    `,
    file_url: null,
    uploader_name: "Academic Board of Examiners"
  },
  {
    id: "pyq-dsa-2023",
    title: "Data Structures & Linear Systems — End-Semester Exam (2023)",
    subject: "Data Structures",
    reading_time: "3 Hours Exam • 100 Marks",
    level: "Previous Year Question Paper (2023)",
    summary: "University Semester Examination Paper (Nov/Dec 2023). Focuses on Stacks, Queues, Infix-to-Postfix conversion, Trees, Graph Traversals, and Sorting Comparisons.",
    content: `
      <div class="exam-paper-container">
        <div class="exam-header-box">
          <div class="exam-univ-title">DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING</div>
          <div class="exam-degree">B.E. / B.TECH. DEGREE SEMESTER EXAMINATIONS — NOVEMBER / DECEMBER 2023</div>
          <div class="exam-meta-grid">
            <div><strong>Course Code:</strong> CS203</div>
            <div><strong>Course Title:</strong> Data Structures & Linear Implementations</div>
            <div><strong>Duration:</strong> 3 Hours</div>
            <div><strong>Max. Marks:</strong> 100</div>
          </div>
        </div>

        <div class="exam-instructions">
          <strong>GENERAL INSTRUCTIONS:</strong>
          <ol>
            <li>PART A: 10 Questions × 2 Marks = 20 Marks.</li>
            <li>PART B: 5 Questions × 13 Marks = 65 Marks.</li>
            <li>PART C: 1 Practical Design × 15 Marks = 15 Marks.</li>
          </ol>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART A — (10 × 2 = 20 Marks)</h3>
          <ol class="exam-questions-list">
            <li>What are the conditions for Stack Overflow and Stack Underflow when using an array?</li>
            <li>Convert the infix expression <code>(A + B) * (C - D) / E</code> into its prefix counterpart.</li>
            <li>How does a Circular Queue overcome the limitation of a simple linear array queue?</li>
            <li>Define a Full Binary Tree versus a Complete Binary Tree.</li>
            <li>What is the maximum number of nodes in a binary tree of height <code>h</code>?</li>
            <li>State the time complexity of searching an element in: (i) Unsorted Array, (ii) Sorted Array, (iii) Binary Search Tree, (iv) Hash Table.</li>
            <li>What is primary clustering in open addressing hash tables?</li>
            <li>Differentiate between an adjacency matrix and an adjacency list for graph representation.</li>
            <li>Why is Merge Sort preferred over Quick Sort for sorting linked lists?</li>
            <li>What is a Deque (Double-Ended Queue)? Mention two practical applications.</li>
          </ol>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART B — (5 × 13 = 65 Marks)</h3>

          <div class="exam-group">
            <p><strong>11. (a)</strong> Write an algorithm to convert an infix expression to a postfix expression using a stack. Trace your algorithm on: <code>A + B * (C ^ D - E) / (F + G * H)</code>. Show the stack status and output string at each step. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>11. (b)</strong> Write an algorithm to evaluate a postfix expression using a stack. Trace the evaluation for: <code>6 2 3 + - 3 8 2 / + * 2 ^ 3 +</code>. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>12. (a)</strong> Implement a Circular Queue using an array of fixed size <code>MAX</code>. Provide complete C/C++ code for <code>enqueue()</code>, <code>dequeue()</code>, <code>display()</code>, and boundary condition checks using modulo arithmetic. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>12. (b)</strong> Explain Polynomial Representation using Singly Linked Lists. Write a function to add two polynomials represented as linked lists and return the resulting polynomial list. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>13. (a)</strong> Given the pre-order and in-order traversals of a binary tree: <br> Pre-order: <code>[A, B, D, E, C, F, G]</code> <br> In-order: <code>[D, B, E, A, F, C, G]</code>. <br> Reconstruct the original binary tree and specify its post-order traversal. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>13. (b)</strong> Write recursive and non-recursive algorithms for In-order, Pre-order, and Post-order traversals of a Binary Search Tree. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>14. (a)</strong> Trace Breadth-First Search (BFS) and Depth-First Search (DFS) algorithms on a given connected graph of 8 vertices starting from vertex 1. Show the queue/stack contents at each stage and indicate discovery and back edges. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>14. (b)</strong> Explain Prim's algorithm for finding a Minimum Spanning Tree. Provide pseudocode and trace on a weighted undirected graph with 6 vertices. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>15. (a)</strong> Detail the working of Merge Sort. Trace the algorithm on the input array <code>[38, 27, 43, 3, 9, 82, 10]</code>. Derive its recurrence relation and prove that its worst-case complexity is <code>O(n log n)</code>. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>15. (b)</strong> Explain Hashing with separate chaining versus open addressing with quadratic probing. Given hash function <code>h(k) = k mod 11</code>, insert keys: <code>[22, 43, 11, 88, 33, 40, 55, 66]</code> into both systems. <em>(13 Marks)</em></p>
          </div>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART C — (1 × 15 = 15 Marks)</h3>
          <p><strong>16.</strong> Design a <strong>Trie (Prefix Tree)</strong> data structure for an autocomplete search engine. Implement methods for: (i) Inserting a word, (ii) Searching for an exact word, and (iii) Finding all words with a given prefix. Analyze the time and space complexity with respect to word length <code>L</code> and alphabet size. <em>(15 Marks)</em></p>
        </div>
      </div>
    `,
    file_url: null,
    uploader_name: "University Examination Cell"
  },

  // ==========================================
  // 3. WEB DEVELOPMENT
  // ==========================================
  {
    id: "pyq-web-dev-2024",
    title: "Full-Stack Web Technologies & Frameworks — End-Semester Exam (2024)",
    subject: "Web Development",
    reading_time: "3 Hours Exam • 100 Marks",
    level: "Previous Year Question Paper (2024)",
    summary: "University Final Examination Paper (May/June 2024). Comprehensive examination on Semantic HTML5, CSS Grid & Flexbox, JavaScript ES6+ Async/Await, RESTful API Design, DOM Manipulation, and Session Security.",
    content: `
      <div class="exam-paper-container">
        <div class="exam-header-box">
          <div class="exam-univ-title">DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING</div>
          <div class="exam-degree">B.E. / B.TECH. DEGREE SEMESTER EXAMINATIONS — MAY / JUNE 2024</div>
          <div class="exam-meta-grid">
            <div><strong>Course Code:</strong> CS3304</div>
            <div><strong>Course Title:</strong> Modern Full-Stack Web Development</div>
            <div><strong>Duration:</strong> 3 Hours</div>
            <div><strong>Max. Marks:</strong> 100</div>
          </div>
        </div>

        <div class="exam-instructions">
          <strong>GENERAL INSTRUCTIONS:</strong>
          <ol>
            <li>Answer ALL questions in PART A (10 × 2 = 20 Marks).</li>
            <li>Answer ALL questions in PART B (5 × 13 = 65 Marks).</li>
            <li>Answer PART C System Architecture question (1 × 15 = 15 Marks).</li>
          </ol>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART A — (10 × 2 = 20 Marks)</h3>
          <ol class="exam-questions-list">
            <li>What is the Document Object Model (DOM)? Differentiate between DOM and BOM (Browser Object Model).</li>
            <li>Explain the difference between CSS Flexbox (1-dimensional) and CSS Grid (2-dimensional).</li>
            <li>What is Event Delegation in JavaScript? Why is it more memory-efficient than attaching handlers to individual child nodes?</li>
            <li>Explain the difference between <code>localStorage</code>, <code>sessionStorage</code>, and HTTP Cookies.</li>
            <li>What is a JavaScript Closure? Provide a concise code snippet demonstrating variable encapsulation.</li>
            <li>What does the CORS (Cross-Origin Resource Sharing) header <code>Access-Control-Allow-Origin</code> signify?</li>
            <li>Explain the difference between Promise chaining and <code>async/await</code> syntax.</li>
            <li>What are HTTP status codes <code>201</code>, <code>304</code>, <code>401</code>, and <code>403</code>?</li>
            <li>Explain the concept of responsive web design using the CSS <code>@media</code> query rule.</li>
            <li>Why should passwords never be stored in plain text? State the role of salt in <code>bcrypt</code> hashing.</li>
          </ol>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART B — (5 × 13 = 65 Marks)</h3>

          <div class="exam-group">
            <p><strong>11. (a)</strong> Create a responsive educational dashboard layout using modern CSS Grid and Flexbox. The layout must consist of a sticky navigation header, collapsible sidebar, 3-column card grid, and sticky footer. Include CSS media queries for desktop, tablet, and mobile breakpoints. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>11. (b)</strong> Discuss CSS specificity and inheritance rules. Explain the calculation formula for inline styles, IDs, classes, and elements. Solve a specificity conflict scenario with 4 competing selectors. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>12. (a)</strong> Explain asynchronous programming in JavaScript. Write a reusable function <code>fetchWithRetry(url, options, maxRetries)</code> that uses Promises, handles network errors, and retries failed HTTP requests with exponential backoff. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>12. (b)</strong> Explain the JavaScript Event Loop, Call Stack, Web APIs, Microtask Queue (Promises), and Macrotask Queue (setTimeout). Provide an execution trace showing the exact console output order of a mixed synchronous/asynchronous code block. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>13. (a)</strong> Design a RESTful API specification for a Student Coursework Portal. Detail the endpoint routes, HTTP verbs, request payload schemas, and response formats for: (i) Student registration, (ii) Uploading coursework notes, (iii) Fetching paginated study resources with keyword filter, and (iv) Deleting a resource (admin only). <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>13. (b)</strong> Explain middleware in Express.js. Write a custom middleware pipeline that: (i) Logs incoming requests with timestamps, (ii) Checks authorization header for valid session, and (iii) Catches unhandled errors and returns JSON error responses. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>14. (a)</strong> Explain Single Page Application (SPA) routing in vanilla JavaScript without third-party frameworks. Demonstrate how to implement client-side route changes using <code>window.history.pushState()</code>, the <code>popstate</code> event, and dynamic section rendering. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>14. (b)</strong> Discuss web form validation. Build a client-side registration form with real-time field validation for: (i) Full name, (ii) Academic email format, (iii) Strong password criteria (length, uppercase, digit, special character), and (iv) Password confirmation matching. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>15. (a)</strong> Discuss web security vulnerabilities and prevention: (i) Cross-Site Scripting (XSS), (ii) SQL Injection, (iii) Cross-Site Request Forgery (CSRF). Explain countermeasures including input sanitization, parameterized queries, and CSRF tokens. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>15. (b)</strong> Explain server-sent events (SSE) versus WebSockets. When is full-duplex communication required? Build a minimal WebSocket client-server message broadcaster using Node.js and client JavaScript. <em>(13 Marks)</em></p>
          </div>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART C — (1 × 15 = 15 Marks)</h3>
          <p><strong>16.</strong> Design a high-performance, accessible Modal Dialog Component in vanilla JavaScript and CSS. The modal must fulfill the following WCAG accessibility guidelines and user experience requirements:</p>
          <ul>
            <li>Trigger opening on button click and trap keyboard focus inside modal while open.</li>
            <li>Close gracefully on <code>Esc</code> key press, clicking close button, or clicking the backdrop overlay.</li>
            <li>Restore focus to the triggering element upon closure.</li>
            <li>Provide action buttons for clipboard copying, text file download, and print-to-PDF formatting.</li>
          </ul>
          <p>Provide complete semantic HTML, CSS styling, and JavaScript event handling. <em>(15 Marks)</em></p>
        </div>
      </div>
    `,
    file_url: null,
    uploader_name: "University Examination Cell"
  },
  {
    id: "pyq-web-dev-2023",
    title: "Client-Server Web Architecture & Scripting — End-Semester Exam (2023)",
    subject: "Web Development",
    reading_time: "3 Hours Exam • 100 Marks",
    level: "Previous Year Question Paper (2023)",
    summary: "University Semester Examination (Nov/Dec 2023). Focuses on HTML5 APIs, CSS Flexbox layouts, DOM Manipulation, Node.js Express architecture, and File Upload Handling.",
    content: `
      <div class="exam-paper-container">
        <div class="exam-header-box">
          <div class="exam-univ-title">DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING</div>
          <div class="exam-degree">B.E. / B.TECH. DEGREE SEMESTER EXAMINATIONS — NOVEMBER / DECEMBER 2023</div>
          <div class="exam-meta-grid">
            <div><strong>Course Code:</strong> IT304</div>
            <div><strong>Course Title:</strong> Web Architecture & Client-Server Systems</div>
            <div><strong>Duration:</strong> 3 Hours</div>
            <div><strong>Max. Marks:</strong> 100</div>
          </div>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART A — (10 × 2 = 20 Marks)</h3>
          <ol class="exam-questions-list">
            <li>What is the purpose of the <code>&lt;meta name="viewport"&gt;</code> tag in mobile web design?</li>
            <li>Explain CSS Box-Sizing: <code>content-box</code> versus <code>border-box</code>.</li>
            <li>What is the difference between <code>let</code>, <code>const</code>, and <code>var</code> in JavaScript?</li>
            <li>Explain the concept of debouncing and throttling in event handling.</li>
            <li>What is JSONP, and why has it been superseded by CORS?</li>
            <li>How does the browser parse HTML and construct the Render Tree?</li>
            <li>Explain the difference between synchronous and asynchronous file reading in Node.js <code>fs</code> module.</li>
            <li>What is the role of <code>npm package.json</code> and <code>package-lock.json</code>?</li>
            <li>What is a CSS Preprocessor (Sass/SCSS)? State two primary advantages.</li>
            <li>Explain the purpose of the HTTP <code>Authorization: Bearer &lt;token&gt;</code> header.</li>
          </ol>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART B — (5 × 13 = 65 Marks)</h3>

          <div class="exam-group">
            <p><strong>11. (a)</strong> Design a mobile-first responsive navigation bar with a company logo, navigation links, and a search input. On mobile viewports (&lt; 768px), collapse the links into a functional hamburger menu toggled via JavaScript. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>11. (b)</strong> Discuss modern CSS pseudo-classes and pseudo-elements: <code>:hover</code>, <code>:focus-visible</code>, <code>:nth-child()</code>, <code>::before</code>, and <code>::after</code>. Provide illustrative UI component examples. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>12. (a)</strong> Write a client-side JavaScript search engine that filters an array of 50 study note objects by matching search input against title, subject, and summary fields. Implement debounce logic to delay filtering until 300ms after user finishes typing. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>12. (b)</strong> Explain the Fetch API. Write code to send a <code>multipart/form-data</code> POST request uploading a PDF file with metadata to a server, including progress indicators and error handling. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>13. (a)</strong> Build an Express.js backend route using <code>multer</code> to handle student coursework file uploads. Validate that uploaded files do not exceed 25 MB and are restricted to valid extensions (<code>.pdf</code>, <code>.txt</code>, <code>.docx</code>). Store files with unique timestamps. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>13. (b)</strong> Explain Express session management using <code>express-session</code>. Detail cookie parameters: <code>maxAge</code>, <code>httpOnly</code>, <code>secure</code>, and <code>sameSite</code> for robust session security. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>14. (a)</strong> Explain the differences between Server-Side Rendering (SSR), Client-Side Rendering (CSR), and Static Site Generation (SSG) with respect to initial page load, SEO, and server load. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>14. (b)</strong> Discuss Progressive Web Apps (PWAs). Explain Service Workers, Web App Manifests, offline caching strategies (Cache First, Network First, Stale-While-Revalidate). <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>15. (a)</strong> Write a complete Node.js script connecting to a PostgreSQL / SQLite database, creating a table for <code>notes</code>, and performing parameterized CRUD operations without vulnerability to SQL injection. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>15. (b)</strong> Explain web performance optimization strategies: Asset minification, image lazy-loading, Critical Rendering Path optimization, and CDN edge caching. <em>(13 Marks)</em></p>
          </div>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART C — (1 × 15 = 15 Marks)</h3>
          <p><strong>16.</strong> Design a Toast Notification System in vanilla JavaScript. Requirements: (i) Support notification types (success, error, info), (ii) Auto-dismiss after 3.2 seconds with smooth slide-up and fade-out animation, (iii) Allow manual dismissal, and (iv) Stack multiple toasts cleanly without overlapping. Provide complete HTML, CSS, and JS. <em>(15 Marks)</em></p>
        </div>
      </div>
    `,
    file_url: null,
    uploader_name: "Academic Board of Examiners"
  },

  // ==========================================
  // 4. PYTHON PROGRAMMING
  // ==========================================
  {
    id: "pyq-python-2024",
    title: "Python for Problem Solving & Analytics — End-Semester Exam (2024)",
    subject: "Python Programming",
    reading_time: "3 Hours Exam • 100 Marks",
    level: "Previous Year Question Paper (2024)",
    summary: "University Semester Final Examination (May 2024). Explores Pythonic Idioms, List & Dict Comprehensions, Decorators, Generators, File I/O, OOP, and Exception Hierarchies.",
    content: `
      <div class="exam-paper-container">
        <div class="exam-header-box">
          <div class="exam-univ-title">DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING</div>
          <div class="exam-degree">B.E. / B.TECH. DEGREE SEMESTER EXAMINATIONS — MAY 2024</div>
          <div class="exam-meta-grid">
            <div><strong>Course Code:</strong> CS2305</div>
            <div><strong>Course Title:</strong> Python for Problem Solving & Data Analytics</div>
            <div><strong>Duration:</strong> 3 Hours</div>
            <div><strong>Max. Marks:</strong> 100</div>
          </div>
        </div>

        <div class="exam-instructions">
          <strong>GENERAL INSTRUCTIONS:</strong>
          <ol>
            <li>Answer ALL questions in PART A (10 × 2 = 20 Marks).</li>
            <li>Answer ALL questions in PART B (5 × 13 = 65 Marks).</li>
            <li>Answer PART C Data Analytics Challenge (1 × 15 = 15 Marks).</li>
          </ol>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART A — (10 × 2 = 20 Marks)</h3>
          <ol class="exam-questions-list">
            <li>Differentiate between mutable and immutable data types in Python. List two examples of each.</li>
            <li>Explain the difference between the <code>is</code> operator and the <code>==</code> operator in Python.</li>
            <li>What is a generator function? How does the <code>yield</code> keyword differ from <code>return</code>?</li>
            <li>What is the purpose of <code>*args</code> and <code>**kwargs</code> in Python function definitions?</li>
            <li>Explain the difference between a shallow copy and a deep copy using the <code>copy</code> module.</li>
            <li>What is the Global Interpreter Lock (GIL) in CPython, and what is its impact on CPU-bound multithreading?</li>
            <li>Explain the syntax and purpose of list comprehensions versus generator expressions with respect to memory efficiency.</li>
            <li>What is the difference between <code>__str__</code> and <code>__repr__</code> special methods in Python?</li>
            <li>How does Python's <code>try...except...else...finally</code> block execute? State the purpose of the <code>else</code> clause.</li>
            <li>What are lambda functions? Write a one-line lambda to sort a list of tuples by their second element.</li>
          </ol>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART B — (5 × 13 = 65 Marks)</h3>

          <div class="exam-group">
            <p><strong>11. (a)</strong> Write a Python program to implement a custom function decorator <code>@execution_time_logger</code> that measures the elapsed execution time of any decorated function and logs function arguments, return values, and execution duration in milliseconds. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>11. (b)</strong> Explain Python decorators with arguments. Write a decorator <code>@retry(max_attempts=3, delay_sec=1)</code> that automatically retries an unreliable network function if an exception is raised. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>12. (a)</strong> Design a complete Object-Oriented hierarchy in Python: Base class <code>CourseModule</code>, derived classes <code>LectureNotes</code> and <code>QuestionPaper</code>. Implement encapsulation with private attributes, property getters/setters, abstract base classes using <code>abc.ABC</code>, and method overriding. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>12. (b)</strong> Explain multiple inheritance in Python and the Method Resolution Order (MRO). Illustrate the C3 Linearization algorithm with a classic Diamond Inheritance problem example. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>13. (a)</strong> Write a Python data processing pipeline that reads a 10,000-line server log file, uses regular expressions (<code>re</code> module) to extract IP addresses, HTTP status codes, and endpoint paths, and outputs a frequency breakdown of the top 10 requesting IPs. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>13. (b)</strong> Explain Python's <code>with</code> statement and Context Manager protocol. Implement a custom class <code>DatabaseTransaction</code> that implements <code>__enter__</code> and <code>__exit__</code> to handle automatic commit on success and rollback on exception. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>14. (a)</strong> Compare Multithreading (<code>threading</code> module) and Multiprocessing (<code>multiprocessing</code> module) in Python. Write two benchmark scripts calculating prime numbers to demonstrate when multiprocessing outperforms multithreading. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>14. (b)</strong> Discuss functional programming in Python. Implement solutions using <code>map()</code>, <code>filter()</code>, and <code>functools.reduce()</code> to process student test score records and compute class standard deviation. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>15. (a)</strong> Explain file serialization in Python using JSON and Pickle. Detail security concerns associated with deserializing untrusted Pickle streams and write safe JSON serialization routines for custom objects. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>15. (b)</strong> Explain built-in data structures: Lists, Tuples, Sets, and Dictionaries. Analyze their underlying CPython memory layouts, time complexities for search and insert, and hash table resizing mechanics. <em>(13 Marks)</em></p>
          </div>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART C — (1 × 15 = 15 Marks)</h3>
          <p><strong>16.</strong> Design and build a <strong>Student Exam Analytics Engine</strong> in Python. The engine must accept a CSV file of student responses for a 100-question multiple-choice exam, compare against an answer key, and generate: (i) Individual student scores and percentile ranks, (ii) Item difficulty index for each question, and (iii) Discrimination index identifying questions that differentiate top performers from struggling students. Provide complete, modular Python code. <em>(15 Marks)</em></p>
        </div>
      </div>
    `,
    file_url: null,
    uploader_name: "University Examination Cell"
  },
  {
    id: "pyq-python-2023",
    title: "Advanced Python Programming & Computational Thinking — End-Semester Exam (2023)",
    subject: "Python Programming",
    reading_time: "3 Hours Exam • 100 Marks",
    level: "Previous Year Question Paper (2023)",
    summary: "University Semester Examination (Nov/Dec 2023). Focuses on Data Structures, Recursion, Magic Methods, Dynamic Typing, Regular Expressions, and Standard Library Mastery.",
    content: `
      <div class="exam-paper-container">
        <div class="exam-header-box">
          <div class="exam-univ-title">DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING</div>
          <div class="exam-degree">B.E. / B.TECH. DEGREE SEMESTER EXAMINATIONS — NOVEMBER / DECEMBER 2023</div>
          <div class="exam-meta-grid">
            <div><strong>Course Code:</strong> PY201</div>
            <div><strong>Course Title:</strong> Advanced Python Programming</div>
            <div><strong>Duration:</strong> 3 Hours</div>
            <div><strong>Max. Marks:</strong> 100</div>
          </div>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART A — (10 × 2 = 20 Marks)</h3>
          <ol class="exam-questions-list">
            <li>What is the difference between <code>append()</code> and <code>extend()</code> on a Python list?</li>
            <li>Explain the significance of the <code>__name__ == "__main__"</code> idiom.</li>
            <li>How does Python handle pass-by-value vs pass-by-reference? Explain <em>Pass-by-Object-Reference</em>.</li>
            <li>What is the purpose of the <code>zip()</code> and <code>enumerate()</code> functions? Provide quick syntax.</li>
            <li>What is duck typing in Python? How does it differ from static typing in C or Java?</li>
            <li>What is an iterator versus an iterable in Python? Name the two dunder methods required for the iterator protocol.</li>
            <li>Explain the difference between a set and a frozenset.</li>
            <li>How does the <code>re.search()</code> function differ from <code>re.match()</code>?</li>
            <li>What are Python dataclasses (<code>@dataclass</code>)? How do they reduce boilerplate code?</li>
            <li>What does the <code>assert</code> statement do in Python? When should it be used?</li>
          </ol>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART B — (5 × 13 = 65 Marks)</h3>

          <div class="exam-group">
            <p><strong>11. (a)</strong> Write a Python class <code>Matrix</code> that supports addition (<code>+</code>), subtraction (<code>-</code>), and multiplication (<code>*</code>) by overloading operator special methods <code>__add__</code>, <code>__sub__</code>, and <code>__matmul__</code> (or <code>__mul__</code>). Include dimension validation and informative string representation via <code>__repr__</code>. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>11. (b)</strong> Implement a custom iterator class <code>ReverseRange</code> that mimics Python's <code>range()</code> function but iterates in reverse order from <code>start</code> down to <code>stop</code> by <code>step</code>. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>12. (a)</strong> Explain regular expressions in Python. Write a script to validate student institutional email addresses (format: <code>username@college.edu</code> or <code>firstname.lastname@department.university.ac.in</code>) and parse them into local and domain parts. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>12. (b)</strong> Write a program that recursively traverses a directory tree using the <code>os</code> and <code>pathlib</code> modules, finds all Python files (<code>.py</code>), counts total lines of code excluding blank lines and comments, and prints a file-by-file audit report. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>13. (a)</strong> Explain custom exceptions in Python. Build a banking validation system with custom exceptions <code>InsufficientFundsError</code>, <code>NegativeDepositError</code>, and <code>AccountLockedError</code>. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>13. (b)</strong> Discuss function closures. Build a configurable password validator factory function <code>create_password_policy(min_length, require_special, require_numbers)</code> that returns a customized validation function. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>14. (a)</strong> Write a Python script to consume a public REST API using the <code>urllib.request</code> or <code>requests</code> module, parse JSON data, filter records based on dynamic user criteria, and save the result into a clean Excel/CSV file. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>14. (b)</strong> Discuss Python's <code>collections</code> module: <code>Counter</code>, <code>defaultdict</code>, <code>deque</code>, and <code>namedtuple</code>. Provide real-world problem scenarios where each structure is optimal. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>15. (a)</strong> Implement the Binary Search algorithm in Python recursively and iteratively. Compare their space complexities regarding call stack overhead. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>15. (b)</strong> Implement Merge Sort in Python. Trace the sorting on a list of 8 student names in alphabetical order. <em>(13 Marks)</em></p>
          </div>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART C — (1 × 15 = 15 Marks)</h3>
          <p><strong>16.</strong> Design a <strong>Plagiarism Detection Utility</strong> in Python that compares two student code submissions. The tool must: (i) Strip whitespace and comments, (ii) Normalize variable names using AST tokenization, (iii) Generate N-gram shingles (e.g. 3-grams) from the normalized token stream, and (iv) Compute the Jaccard Similarity coefficient between submissions. Output a similarity percentage and highlight matching blocks. <em>(15 Marks)</em></p>
        </div>
      </div>
    `,
    file_url: null,
    uploader_name: "Academic Board of Examiners"
  },

  // ==========================================
  // 5. CLOUD & DEVOPS
  // ==========================================
  {
    id: "pyq-cloud-devops-2024",
    title: "Cloud Computing & Cloud Architecture — End-Semester Exam (2024)",
    subject: "Cloud & DevOps",
    reading_time: "3 Hours Exam • 100 Marks",
    level: "Previous Year Question Paper (2024)",
    summary: "University Final Examination Paper (May/June 2024). Explores Cloud Service Models (IaaS, PaaS, SaaS), AWS Infrastructure (VPC, EC2, S3, RDS, Lambda), Docker Containerization, and Cloud Security.",
    content: `
      <div class="exam-paper-container">
        <div class="exam-header-box">
          <div class="exam-univ-title">DEPARTMENT OF INFORMATION TECHNOLOGY & CLOUD SYSTEMS</div>
          <div class="exam-degree">B.E. / B.TECH. DEGREE SEMESTER EXAMINATIONS — MAY / JUNE 2024</div>
          <div class="exam-meta-grid">
            <div><strong>Course Code:</strong> IT4401</div>
            <div><strong>Course Title:</strong> Cloud Computing & Virtualization Architecture</div>
            <div><strong>Duration:</strong> 3 Hours</div>
            <div><strong>Max. Marks:</strong> 100</div>
          </div>
        </div>

        <div class="exam-instructions">
          <strong>GENERAL INSTRUCTIONS:</strong>
          <ol>
            <li>Answer ALL questions in PART A (10 × 2 = 20 Marks).</li>
            <li>Answer ALL questions in PART B (5 × 13 = 65 Marks).</li>
            <li>Answer PART C Architectural Design (1 × 15 = 15 Marks).</li>
          </ol>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART A — (10 × 2 = 20 Marks)</h3>
          <ol class="exam-questions-list">
            <li>Differentiate between Type-1 (Bare Metal) and Type-2 (Hosted) Hypervisors with examples.</li>
            <li>Define the NIST characteristics of Cloud Computing: On-demand self-service and Rapid elasticity.</li>
            <li>Compare IaaS, PaaS, and SaaS in terms of user management control versus cloud provider responsibility.</li>
            <li>What is an Amazon Machine Image (AMI)? What components does it contain?</li>
            <li>Explain the difference between horizontal scaling (scale-out) and vertical scaling (scale-up).</li>
            <li>What is AWS Lambda? What is meant by a serverless "cold start"?</li>
            <li>Differentiate between Amazon S3 (Object Storage) and Amazon EBS (Block Storage).</li>
            <li>What is a Virtual Private Cloud (VPC)? Why are databases placed in private subnets?</li>
            <li>Explain the Shared Responsibility Model for cloud security between AWS/Cloud Provider and Customer.</li>
            <li>What is Edge Computing, and how does Amazon CloudFront CDN utilize edge locations?</li>
          </ol>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART B — (5 × 13 = 65 Marks)</h3>

          <div class="exam-group">
            <p><strong>11. (a)</strong> Design a 3-Tier Highly Available Cloud Architecture on AWS for a university study portal. Detail the VPC configuration with public subnets (NAT Gateways, Application Load Balancers), private subnets (Auto-scaling EC2 instances across 2 Availability Zones), and secure database subnets (Amazon RDS Multi-AZ). Draw a comprehensive architecture diagram. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>11. (b)</strong> Discuss Cloud Storage Architecture. Compare Amazon S3 storage tiers (Standard, Intelligent-Tiering, Standard-IA, Glacier, Deep Archive) based on access latency, cost per GB, and retrieval fees. Explain S3 lifecycle policies. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>12. (a)</strong> Explain Docker containerization architecture. Compare virtual machines (VMs) with Docker containers. Write a production-ready, multi-stage <code>Dockerfile</code> for a Node.js web application that minimizes image size and runs as a non-root user. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>12. (b)</strong> Explain Kubernetes (K8s) architecture. Detail the roles of the Control Plane (API Server, etcd, Controller Manager, Scheduler) and Worker Node components (Kubelet, Kube-proxy, Container Runtime). Define a Deployment and Service YAML manifest. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>13. (a)</strong> Explain Identity and Access Management (IAM) in AWS. Detail IAM Users, Groups, Roles, Policies (JSON format), and Multi-Factor Authentication (MFA). Formulate a principle-of-least-privilege policy allowing S3 read-only access for a specific bucket. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>13. (b)</strong> Discuss Cloud Disaster Recovery strategies. Define Recovery Point Objective (RPO) and Recovery Time Objective (RTO). Compare the four DR strategies: Backup & Restore, Pilot Light, Warm Standby, and Multi-Site Active/Active. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>14. (a)</strong> Explain serverless computing and event-driven architecture using AWS Lambda and Amazon API Gateway. Illustrate how an incoming HTTP POST request triggers a serverless function to write user data into Amazon DynamoDB. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>14. (b)</strong> Discuss Cloud Load Balancing algorithms. Compare Round Robin, Least Connections, and IP Hash. Explain health check mechanisms and sticky sessions (session affinity). <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>15. (a)</strong> Explain Infrastructure as Code (IaC). Compare imperative scripts with declarative tools like Terraform and AWS CloudFormation. Write a Terraform HCL script to provision an AWS S3 bucket and an EC2 instance. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>15. (b)</strong> Discuss Cloud Monitoring and Observability. Differentiate between Metrics, Logs, and Traces (the 3 pillars of observability). Explain how AWS CloudWatch alarms and AWS X-Ray distributed tracing function. <em>(13 Marks)</em></p>
          </div>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART C — (1 × 15 = 15 Marks)</h3>
          <p><strong>16.</strong> A university is migrating its legacy on-premises student portal to the cloud to handle severe registration traffic surges (100,000 students concurrent within 10 minutes). Formulate a complete <strong>Cloud Migration & Auto-Scaling Strategy</strong>:</p>
          <ul>
            <li>Select an appropriate migration strategy among the 6 R's (Rehost, Replatform, Refactor, Repurchase, Retain, Retire).</li>
            <li>Configure Auto Scaling Group (ASG) policies (target tracking vs step scaling based on CPU utilization and RequestCountPerTarget).</li>
            <li>Integrate Amazon ElastiCache (Redis) to offload repeated session reads from the primary database.</li>
            <li>Provide cost-optimization strategies including AWS Savings Plans and Spot Instances. <em>(15 Marks)</em></li>
          </ul>
        </div>
      </div>
    `,
    file_url: null,
    uploader_name: "University Examination Cell"
  },
  {
    id: "pyq-cloud-devops-2023",
    title: "DevOps Practices, CI/CD & Containers — End-Semester Exam (2023)",
    subject: "Cloud & DevOps",
    reading_time: "3 Hours Exam • 100 Marks",
    level: "Previous Year Question Paper (2023)",
    summary: "University Semester Examination (Nov/Dec 2023). Focuses on CI/CD Pipelines, Git Branching Strategies, Docker Compose, Microservices, and Deployment Strategies (Blue-Green, Canary).",
    content: `
      <div class="exam-paper-container">
        <div class="exam-header-box">
          <div class="exam-univ-title">DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING</div>
          <div class="exam-degree">B.E. / B.TECH. DEGREE SEMESTER EXAMINATIONS — NOVEMBER / DECEMBER 2023</div>
          <div class="exam-meta-grid">
            <div><strong>Course Code:</strong> CLD305</div>
            <div><strong>Course Title:</strong> DevOps Engineering & Continuous Delivery</div>
            <div><strong>Duration:</strong> 3 Hours</div>
            <div><strong>Max. Marks:</strong> 100</div>
          </div>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART A — (10 × 2 = 20 Marks)</h3>
          <ol class="exam-questions-list">
            <li>What is DevOps? Name the key phases of the DevOps lifecycle.</li>
            <li>Differentiate between Continuous Integration, Continuous Delivery, and Continuous Deployment.</li>
            <li>What is GitFlow branching strategy? What are feature, release, and hotfix branches?</li>
            <li>Explain the difference between a Docker image layer and a running container writable layer.</li>
            <li>What is Blue-Green Deployment? State its primary benefit over in-place deployment.</li>
            <li>What is Canary Deployment? How does traffic routing work during a canary release?</li>
            <li>What is Docker Compose? In what file format are services defined?</li>
            <li>Explain the role of an API Gateway in Microservices Architecture.</li>
            <li>What is GitOps? How does ArgoCD or Flux automate Kubernetes deployments?</li>
            <li>What is the difference between Prometheus (metrics) and Grafana (visualization)?</li>
          </ol>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART B — (5 × 13 = 65 Marks)</h3>

          <div class="exam-group">
            <p><strong>11. (a)</strong> Design a complete CI/CD pipeline using GitHub Actions for a full-stack web application. The workflow must: (i) Trigger on push to <code>main</code>, (ii) Run unit tests and lint checks, (iii) Build and tag a Docker image, (iv) Push image to GitHub Container Registry, and (v) Deploy to staging server via SSH. Provide complete YAML syntax. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>11. (b)</strong> Compare Jenkins versus GitHub Actions and GitLab CI. Discuss Jenkins Master-Agent architecture, declarative vs scripted pipelines, and webhook triggers. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>12. (a)</strong> Write a comprehensive <code>docker-compose.yml</code> file orchestrating a 3-tier application: an Express.js web service, a PostgreSQL database with persistent volume, and a Redis caching layer. Include network definitions, environment variables, and health checks. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>12. (b)</strong> Discuss container networking in Docker. Compare bridge, host, overlay, and macvlan network drivers. Explain how container name resolution works via internal DNS. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>13. (a)</strong> Explain Zero-Downtime Deployment strategies: In-place rolling updates, Blue-Green deployments, and Canary releases. Compare them in terms of rollback speed, resource cost, and operational complexity. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>13. (b)</strong> Discuss Microservices Architecture design patterns: Circuit Breaker pattern (Netflix Hystrix / Resilience4j), Saga pattern for distributed transactions, and CQRS (Command Query Responsibility Segregation). <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>14. (a)</strong> Explain DevSecOps principles. Detail "Shift-Left Security", Static Application Security Testing (SAST), Dynamic Application Security Testing (DAST), and container vulnerability scanning with Trivy. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>14. (b)</strong> Discuss Configuration Management tools. Compare Ansible (agentless, push-based) with Chef/Puppet (agent-based, pull-based). Write an Ansible Playbook installing Nginx and configuring firewall rules. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>15. (a)</strong> Explain centralized logging using the ELK stack (Elasticsearch, Logstash, Kibana) or EFK stack (with Fluentd). Illustrate how container logs are collected, parsed, indexed, and queried. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>15. (b)</strong> Discuss Site Reliability Engineering (SRE) principles: Service Level Indicators (SLIs), Service Level Objectives (SLOs), Service Level Agreements (SLAs), and Error Budgets. <em>(13 Marks)</em></p>
          </div>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART C — (1 × 15 = 15 Marks)</h3>
          <p><strong>16.</strong> Design an end-to-end <strong>Automated Release Engineering Strategy</strong> for an enterprise university study portal that pushes code updates 5 times a day without impacting active students taking online quizzes. Address automated rollback triggers based on HTTP 5xx error rate spikes, database schema migrations with backward compatibility, and automated post-deployment smoke tests. <em>(15 Marks)</em></p>
        </div>
      </div>
    `,
    file_url: null,
    uploader_name: "Academic Board of Examiners"
  },

  // ==========================================
  // 6. OPERATING SYSTEMS
  // ==========================================
  {
    id: "pyq-os-2024",
    title: "Operating Systems & Systems Programming — End-Semester Exam (2024)",
    subject: "Operating Systems",
    reading_time: "3 Hours Exam • 100 Marks",
    level: "Previous Year Question Paper (2024)",
    summary: "University Final Examination Paper (May 2024). In-depth analytical paper on Process Synchronization, CPU Scheduling, Deadlock Avoidance (Banker's Algorithm), Paging & Virtual Memory, and Disk Scheduling.",
    content: `
      <div class="exam-paper-container">
        <div class="exam-header-box">
          <div class="exam-univ-title">DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING</div>
          <div class="exam-degree">B.E. / B.TECH. DEGREE SEMESTER EXAMINATIONS — MAY 2024</div>
          <div class="exam-meta-grid">
            <div><strong>Course Code:</strong> CS2303</div>
            <div><strong>Course Title:</strong> Operating Systems & Systems Architecture</div>
            <div><strong>Duration:</strong> 3 Hours</div>
            <div><strong>Max. Marks:</strong> 100</div>
          </div>
        </div>

        <div class="exam-instructions">
          <strong>GENERAL INSTRUCTIONS:</strong>
          <ol>
            <li>PART A: 10 Questions × 2 Marks = 20 Marks.</li>
            <li>PART B: 5 Questions × 13 Marks = 65 Marks.</li>
            <li>PART C: 1 Systems Design Problem × 15 Marks = 15 Marks.</li>
          </ol>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART A — (10 × 2 = 20 Marks)</h3>
          <ol class="exam-questions-list">
            <li>What is the difference between a process and a thread? What resources are shared among threads of the same process?</li>
            <li>State the three requirements that must be satisfied by any valid solution to the Critical Section problem.</li>
            <li>Differentiate between a counting semaphore and a binary semaphore.</li>
            <li>What are the four necessary and sufficient conditions for Deadlock to occur?</li>
            <li>Explain the difference between preemptive and non-preemptive CPU scheduling.</li>
            <li>What is the role of the Translation Lookaside Buffer (TLB) in address translation?</li>
            <li>Define Thrashing in virtual memory. What is the Working Set model?</li>
            <li>What is Belady's Anomaly? Name a page replacement algorithm that never suffers from it.</li>
            <li>Differentiate between Internal Fragmentation and External Fragmentation.</li>
            <li>What is an Inode in a UNIX file system? What metadata does it store?</li>
          </ol>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART B — (5 × 13 = 65 Marks)</h3>

          <div class="exam-group">
            <p><strong>11. (a)</strong> Consider 5 processes P1, P2, P3, P4, P5 with arrival times [0, 1, 2, 3, 4] and burst times [8, 4, 9, 5, 2] ms. Draw Gantt charts and compute average waiting time and turnaround time for: (i) Shortest Remaining Time First (Preemptive SJF), and (ii) Round Robin with time quantum q = 3 ms. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>11. (b)</strong> Explain Multi-Level Feedback Queue (MLFQ) scheduling. Detail how priorities are assigned, how aging prevents starvation, and how I/O-bound processes are separated from CPU-bound processes. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>12. (a)</strong> Explain the Classical Producer-Consumer Problem (Bounded Buffer). Provide a complete synchronized solution in C using POSIX semaphores (<code>sem_wait</code>, <code>sem_post</code>) and mutex locks preventing race conditions and deadlocks. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>12. (b)</strong> Discuss the Dining Philosophers Problem. Illustrate how naive semaphore solutions produce deadlocks. Implement a deadlock-free and starvation-free monitor or asymmetric philosopher solution. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>13. (a)</strong> Consider a system with 5 processes (P0 to P4) and 3 resource types (A: 10, B: 5, C: 7 instances). Given Allocation, Max matrices, and Available = [3, 3, 2]: (i) Calculate the Need matrix, (ii) Verify if system is in a safe state, and (iii) If P1 requests [1, 0, 2], can it be granted immediately? <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>13. (b)</strong> Discuss Deadlock Detection and Recovery. Explain resource-allocation graphs (RAGs) with cycle detection, wait-for graphs, and recovery strategies (process termination vs resource preemption). <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>14. (a)</strong> Consider the reference string: <code>7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1</code> with 3 page frames. Compute the total number of page faults using: (i) FIFO, (ii) LRU, and (iii) Optimal replacement algorithms. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>14. (b)</strong> Detail paging memory management. Given a 32-bit virtual address with 4 KB page size, calculate: (i) Number of pages in virtual address space, (ii) Number of bits for page number and offset, and (iii) Two-level paging structure and address translation steps. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>15. (a)</strong> A hard disk drive has 200 cylinders (0–199). The read/write head is currently at cylinder 53, moving towards higher cylinders. The request queue is: <code>98, 183, 37, 122, 14, 124, 65, 67</code>. Compute total head movement in cylinders for: (i) FCFS, (ii) SSTF, (iii) SCAN, and (iv) C-LOOK. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>15. (b)</strong> Discuss File System Implementation: Contiguous, Linked List, and Indexed Allocation. Compare their performance for sequential access versus direct access, storage overhead, and file growth flexibility. <em>(13 Marks)</em></p>
          </div>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART C — (1 × 15 = 15 Marks)</h3>
          <p><strong>16.</strong> In modern UNIX-like operating systems, the <code>fork()</code> system call duplicates a process. Explain the <strong>Copy-on-Write (COW)</strong> optimization technique utilized by modern kernels during <code>fork()</code> and <code>exec()</code>:</p>
          <ul>
            <li>How does COW prevent wasteful physical memory replication of the parent address space?</li>
            <li>How do page table permissions (read-only flags) trigger a page fault trap when either process attempts a write?</li>
            <li>Trace the kernel response upon trap: allocating a new physical frame, copying the page, updating page table, and resuming execution.</li>
            <li>Contrast COW efficiency against naive eager duplication. <em>(15 Marks)</em></li>
          </ul>
        </div>
      </div>
    `,
    file_url: null,
    uploader_name: "University Examination Cell"
  },
  {
    id: "pyq-os-2023",
    title: "Operating Systems: Concurrency, Memory & Security — End-Semester Exam (2023)",
    subject: "Operating Systems",
    reading_time: "3 Hours Exam • 100 Marks",
    level: "Previous Year Question Paper (2023)",
    summary: "University Semester Final Exam (Nov/Dec 2023). Focuses on CPU Scheduling, Synchronization, Memory Protection, File Allocation, and Storage Systems.",
    content: `
      <div class="exam-paper-container">
        <div class="exam-header-box">
          <div class="exam-univ-title">DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING</div>
          <div class="exam-degree">B.E. / B.TECH. DEGREE SEMESTER EXAMINATIONS — NOVEMBER / DECEMBER 2023</div>
          <div class="exam-meta-grid">
            <div><strong>Course Code:</strong> CS205</div>
            <div><strong>Course Title:</strong> Operating Systems Principles</div>
            <div><strong>Duration:</strong> 3 Hours</div>
            <div><strong>Max. Marks:</strong> 100</div>
          </div>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART A — (10 × 2 = 20 Marks)</h3>
          <ol class="exam-questions-list">
            <li>What is a context switch? Why is it considered an operating system overhead?</li>
            <li>What is the difference between short-term, medium-term, and long-term schedulers?</li>
            <li>What is a race condition? Illustrate with a concise banking debit/credit example.</li>
            <li>Explain the role of the <code>test_and_set()</code> atomic hardware instruction in synchronization.</li>
            <li>What is the difference between safe state and unsafe state in deadlock avoidance?</li>
            <li>Explain the translation of a logical address into a physical address using base and limit registers.</li>
            <li>What is demand paging? How does the valid/invalid bit support demand paging?</li>
            <li>Differentiate between contiguous memory allocation and segmented memory allocation.</li>
            <li>Explain the difference between a hard link and a symbolic (soft) link in Linux.</li>
            <li>Compare RAID 0, RAID 1, and RAID 5 in terms of fault tolerance and storage efficiency.</li>
          </ol>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART B — (5 × 13 = 65 Marks)</h3>

          <div class="exam-group">
            <p><strong>11. (a)</strong> Explain Peterson's algorithm for two-process mutual exclusion. Prove that it satisfies: (i) Mutual Exclusion, (ii) Progress, and (iii) Bounded Waiting. Explain why modern out-of-order processors require memory barriers with Peterson's algorithm. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>11. (b)</strong> Discuss the Readers-Writers problem. Provide a complete solution using semaphores where writers are not starved when readers arrive continuously. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>12. (a)</strong> Describe process state transitions: New, Ready, Running, Waiting, Terminated. Provide a state transition diagram detailing all triggering events (I/O wait, timer interrupt, child termination). <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>12. (b)</strong> Explain Inter-Process Communication (IPC). Compare Shared Memory versus Message Passing models with respect to kernel involvement, speed, and synchronization. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>13. (a)</strong> Explain Deadlock Prevention methods that eliminate each of the four deadlock conditions: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>13. (b)</strong> Differentiate between deadlock prevention, deadlock avoidance, and deadlock detection and recovery. Compare Banker's algorithm overhead against detection graphs. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>14. (a)</strong> Explain Inverted Page Tables and Hashed Page Tables. Detail why inverted page tables are used in 64-bit architectures to overcome excessive page table size. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>14. (b)</strong> Explain the Second-Chance (Clock) Page Replacement algorithm. Step through the reference string <code>[2, 3, 2, 1, 5, 2, 4, 5, 3, 2, 5, 2]</code> with 3 page frames showing reference bit modifications. <em>(13 Marks)</em></p>
          </div>

          <div class="exam-group">
            <p><strong>15. (a)</strong> Explain UNIX File System Inode structure. Detail direct blocks, single indirect, double indirect, and triple indirect pointers. Calculate the maximum file size possible for a 4 KB block size and 4-byte pointer. <em>(13 Marks)</em></p>
            <div class="exam-or-divider">── OR ──</div>
            <p><strong>15. (b)</strong> Discuss Disk Scheduling algorithms: FCFS, SSTF, SCAN, C-SCAN, and LOOK. Explain the starvation risk in SSTF and how SCAN prevents it. <em>(13 Marks)</em></p>
          </div>
        </div>

        <div class="exam-section">
          <h3 class="exam-section-title">PART C — (1 × 15 = 15 Marks)</h3>
          <p><strong>16.</strong> Design a <strong>Real-Time Priority-Driven Task Scheduler</strong> for a modern automotive embedded OS (e.g. anti-lock braking and infotainment). Compare Rate Monotonic Scheduling (RMS) with Earliest Deadline First (EDF). Given a set of 3 periodic tasks, perform schedulability tests, draw execution timelines, and address the Priority Inversion problem using Priority Inheritance Protocol. <em>(15 Marks)</em></p>
        </div>
      </div>
    `,
    file_url: null,
    uploader_name: "Academic Board of Examiners"
  }
];

module.exports = {
  QUESTION_PAPERS
};

