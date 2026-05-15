// ===== Full Curriculum Data =====
// Rich, authored content for the ZK/Web3 learning platform

export interface CurriculumLevel {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  icon: string;
  modules: CurriculumModule[];
  totalXp: number;
}

export interface CurriculumModule {
  id: string;
  title: string;
  description: string;
  lessons: CurriculumLesson[];
  xpReward: number;
  type: 'theory' | 'interactive' | 'coding' | 'challenge' | 'project';
  prerequisites: string[];
}

export interface CurriculumLesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  xp: number;
  type: 'theory' | 'interactive' | 'coding' | 'challenge' | 'project';
  content: LessonSection[];
  quiz?: QuizQuestion[];
}

export interface LessonSection {
  type: 'text' | 'code' | 'visualization' | 'interactive' | 'callout' | 'math';
  content: string;
  language?: string;
  vizType?: string;
  vizParams?: Record<string, unknown>;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// ===== LEVEL 1: FOUNDATIONS =====
export const level1: CurriculumLevel = {
  id: 1,
  title: 'Foundations',
  subtitle: 'The building blocks of cryptographic thinking',
  description: 'Master the fundamental concepts that underpin all of cryptography and zero knowledge proofs. From the philosophy of secrecy to the mathematics of finite fields, this level builds the intuition you need for everything that follows.',
  color: '#8b5cf6',
  icon: '🔑',
  totalXp: 2500,
  modules: [
    {
      id: 'l1-m1',
      title: 'Why Cryptography Matters',
      description: 'Understand the foundational motivation for cryptographic systems and why privacy is a fundamental property of digital life.',
      type: 'theory',
      prerequisites: [],
      xpReward: 200,
      lessons: [
        {
          id: 'l1-m1-les1',
          title: 'The Privacy Imperative',
          description: 'Why privacy matters in the digital age and how cryptography enables it.',
          duration: '15 min',
          xp: 100,
          type: 'theory',
          content: [
            { type: 'text', content: 'Every time you send a message, make a payment, or authenticate to a service, you rely on cryptographic protocols. Most people never think about this invisible infrastructure — until it breaks. Cryptography is the silent guardian of digital civilization, and understanding it means understanding how trust works in a world where anyone can listen.' },
            { type: 'callout', content: 'Privacy is not about having something to hide. It is about having the choice of what to reveal. Cryptography gives us that choice by transforming information so that only intended recipients can access it, even when the communication channel is completely public.' },
            { type: 'text', content: 'Consider what happens when you visit a website with HTTPS. Your browser and the server perform a delicate dance — exchanging public values, deriving shared secrets, and establishing an encrypted channel — all before a single byte of your actual data is transmitted. This happens billions of times per day, and it works because of mathematical properties that seem almost magical: functions that are easy to compute in one direction but practically impossible to reverse.' },
            { type: 'text', content: 'Zero Knowledge Proofs extend this magic further. They allow you to prove that a statement is true without revealing anything beyond the truth of the statement itself. You can prove you know a password without transmitting it. You can prove you are old enough without revealing your age. You can prove a transaction is valid without revealing who sent it, how much was sent, or to whom.' },
            { type: 'interactive', content: 'visualization:privacy-spectrum', vizType: 'privacy-spectrum', vizParams: {} },
            { type: 'text', content: 'This is not theoretical. ZK proofs are already being used in production blockchains, privacy-preserving identity systems, and verifiable computation networks. By the end of this curriculum, you will not just understand how they work — you will be able to build them yourself.' },
          ],
          quiz: [
            { id: 'q1-1', question: 'What fundamental capability does cryptography provide in digital systems?', options: ['Speed of computation', 'Controlled disclosure of information', 'Data storage efficiency', 'Network routing'], correctIndex: 1, explanation: 'Cryptography fundamentally provides the ability to control what information is revealed and to whom, enabling trust in untrusted environments.' },
            { id: 'q1-2', question: 'What makes Zero Knowledge Proofs different from traditional encryption?', options: ['They are faster to compute', 'They prove a statement without revealing the underlying data', 'They use smaller keys', 'They are only used in blockchains'], correctIndex: 1, explanation: 'ZK proofs uniquely allow proving the truth of a statement without revealing any information beyond the truth of that statement itself.' },
          ],
        },
        {
          id: 'l1-m1-les2',
          title: 'A Brief History of Secrecy',
          description: 'From ancient ciphers to modern proof systems — the evolution of cryptographic thinking.',
          duration: '12 min',
          xp: 100,
          type: 'theory',
          content: [
            { type: 'text', content: 'The desire to conceal information is as old as writing itself. Around 500 BCE, Spartan military commanders wrapped leather strips around wooden cylinders of a specific diameter — a transposition cipher called the scytale. Only a cylinder of the right size would reveal the message. The principle was simple: the shape of the medium itself became the key.' },
            { type: 'text', content: 'Julius Caesar used a substitution cipher, shifting each letter by three positions. A became D, B became E. This was sufficient when most people could not read at all, but it established a pattern that would repeat throughout history: a cipher is only as strong as the difficulty of discovering its rules.' },
            { type: 'text', content: 'The real revolution came in the 20th century. Claude Shannon formalized information theory in 1948, proving that perfect secrecy requires keys at least as long as the message itself. The Enigma machine and its cracking at Bletchley Park demonstrated that mathematical rigor, not mechanical complexity, determines cryptographic strength. Diffie and Hellman\'s 1976 paper on public-key cryptography introduced a concept that seemed paradoxical: two parties could agree on a secret over a public channel, even with eavesdroppers listening to every message.' },
            { type: 'text', content: 'Then came zero knowledge. In 1985, Goldwasser, Micali, and Rackoff published a paper that introduced the concept of interactive proofs where the verifier learns nothing beyond the validity of the statement. The cryptographic community was skeptical at first — the idea seemed to violate intuition. How could you convince someone of something without revealing why it was true? But the mathematics was rigorous, and the implications were profound.' },
            { type: 'text', content: 'Today, ZK proofs have moved from theoretical curiosity to engineering reality. zkSNARKs power privacy on Zcash. zk-rollups scale Ethereum. zk-login systems authenticate users without passwords. The arc from scytale to succinct proofs is the story of humanity learning to encode trust in mathematics rather than in the obscurity of method.' },
          ],
          quiz: [
            { id: 'q1-3', question: 'What did Shannon prove about perfect secrecy?', options: ['It requires quantum computers', 'Keys must be at least as long as the message', 'It is impossible to achieve', 'It requires public key cryptography'], correctIndex: 1, explanation: 'Shannon proved that for perfect secrecy (where the ciphertext reveals no information about the plaintext), the key must be at least as long as the message itself — this is the one-time pad theorem.' },
          ],
        },
      ],
    },
    {
      id: 'l1-m2',
      title: 'Hash Functions',
      description: 'The workhorses of cryptography — one-way functions that turn any input into a fixed-size fingerprint.',
      type: 'interactive',
      prerequisites: ['l1-m1'],
      xpReward: 300,
      lessons: [
        {
          id: 'l1-m2-les1',
          title: 'What is a Hash Function?',
          description: 'Understand the properties and importance of cryptographic hash functions.',
          duration: '20 min',
          xp: 150,
          type: 'interactive',
          content: [
            { type: 'text', content: 'A hash function takes any input — a single character, a document, or an entire database — and produces a fixed-size output called a hash or digest. SHA-256, the most widely used cryptographic hash function, always produces a 256-bit (32-byte) output regardless of input size. This deterministic mapping has three critical properties that make it cryptographic.' },
            { type: 'text', content: 'First, preimage resistance: given a hash output, it should be computationally infeasible to find any input that produces that output. This is the "one-way" property. Like a meat grinder — you can put a steak in and get ground beef out, but you cannot reconstruct the steak from the ground beef. Second, second preimage resistance: given an input and its hash, it should be infeasible to find a different input with the same hash. Third, collision resistance: it should be infeasible to find any two inputs that hash to the same value.' },
            { type: 'visualization', content: 'hash-visualizer', vizType: 'hash', vizParams: { algorithm: 'sha256' } },
            { type: 'text', content: 'In the context of ZK proofs, hash functions serve as the "compression" layer. Merkle trees use hash functions to commit to large datasets with a single root hash. The Fiat-Shamir heuristic replaces interactive challenges with hash-based ones. Poseidon and other ZK-friendly hash functions are designed to be efficient inside arithmetic circuits, where every multiplication gate adds to the proof complexity.' },
            { type: 'interactive', content: 'visualization:hash-explorer', vizType: 'hash-explorer', vizParams: {} },
            { type: 'code', content: '// Hashing in JavaScript (using Web Crypto API)\nasync function hashMessage(message: string): Promise<string> {\n  const encoder = new TextEncoder();\n  const data = encoder.encode(message);\n  const hashBuffer = await crypto.subtle.digest("SHA-256", data);\n  const hashArray = Array.from(new Uint8Array(hashBuffer));\n  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");\n}\n\n// Same input always gives same output\nawait hashMessage("hello"); // 2cf24dba5fb0a30e...\nawait hashMessage("hello"); // 2cf24dba5fb0a30e...\n\n// Tiny change = completely different hash\nawait hashMessage("hellp"); // 5a3bf34... (entirely different!)', language: 'typescript' },
          ],
          quiz: [
            { id: 'q2-1', question: 'Which property ensures you cannot reverse a hash to find the original input?', options: ['Collision resistance', 'Determinism', 'Preimage resistance', 'Avalanche effect'], correctIndex: 2, explanation: 'Preimage resistance (one-wayness) means that given a hash output, it is computationally infeasible to find any input that would produce that output.' },
            { id: 'q2-2', question: 'What happens to the hash output when you change one bit of the input?', options: ['Only one bit of the hash changes', 'The hash changes in a predictable pattern', 'The entire hash changes unpredictably', 'The hash stays the same'], correctIndex: 2, explanation: 'The avalanche effect ensures that even a single bit change in the input causes roughly half the output bits to change, in an unpredictable pattern.' },
          ],
        },
      ],
    },
    {
      id: 'l1-m3',
      title: 'Commitment Schemes',
      description: 'How to commit to a value while keeping it hidden, and reveal it later with proof.',
      type: 'interactive',
      prerequisites: ['l1-m2'],
      xpReward: 250,
      lessons: [
        {
          id: 'l1-m3-les1',
          title: 'Binding and Hiding',
          description: 'The two fundamental properties of commitment schemes and why they matter.',
          duration: '18 min',
          xp: 125,
          type: 'interactive',
          content: [
            { type: 'text', content: 'Imagine you want to predict the outcome of a coin flip before it happens, but you do not want to influence the flipper. You write your prediction on a piece of paper, seal it in an envelope, and hand it to a trusted friend. After the coin lands, you open the envelope to prove you predicted correctly. This is the essence of a commitment scheme: you commit to a value now, and prove what you committed to later, without any possibility of changing your mind.' },
            { type: 'text', content: 'A commitment scheme has two properties that seem almost contradictory. The hiding property ensures that the commitment reveals nothing about the committed value — just as the sealed envelope conceals the paper inside. The binding property ensures that once you have made a commitment, you cannot open it to a different value — you cannot change what is written on the paper inside the sealed envelope.' },
            { type: 'text', content: 'The simplest commitment scheme uses a hash function: commit = H(value || randomness). The randomness (often called a "blinding factor") is crucial. Without it, an attacker could simply hash all possible values and compare against your commitment. The randomness makes the space of possible commitments exponentially larger than the space of possible values, ensuring hiding even when the value space is small.' },
            { type: 'math', content: 'Commit(v, r) = H(v || r)\n\nWhere:\n  v = value being committed\n  r = random blinding factor\n  H = cryptographic hash function\n\nTo open: reveal (v, r)\nTo verify: check Commit(v, r) = stored commitment' },
            { type: 'text', content: 'Commitment schemes are everywhere in ZK proofs. When a prover commits to a polynomial, they are making a binding commitment to its coefficients. When a verifier sends a random challenge, they are ensuring the prover cannot adaptively change their commitment. The entire structure of a SNARK can be viewed as a sequence of commitments and challenges, where the prover progressively commits to their computation and then proves properties of those commitments.' },
            { type: 'interactive', content: 'visualization:commitment-demo', vizType: 'commitment', vizParams: {} },
          ],
          quiz: [
            { id: 'q3-1', question: 'Why is randomness (blinding factor) necessary in hash-based commitments?', options: ['To make the hash faster', 'To prevent brute-force attacks on small value spaces', 'To make the commitment shorter', 'It is not necessary'], correctIndex: 1, explanation: 'Without randomness, an attacker could hash all possible values and compare against the commitment. The blinding factor makes the commitment space exponentially larger than the value space.' },
          ],
        },
      ],
    },
    {
      id: 'l1-m4',
      title: 'Merkle Trees',
      description: 'Efficient data structures for committing to and proving membership in large datasets.',
      type: 'interactive',
      prerequisites: ['l1-m2'],
      xpReward: 350,
      lessons: [
        {
          id: 'l1-m4-les1',
          title: 'Structure and Proofs',
          description: 'How Merkle trees enable efficient inclusion proofs with logarithmic complexity.',
          duration: '25 min',
          xp: 175,
          type: 'interactive',
          content: [
            { type: 'text', content: 'A Merkle tree is a binary tree where every leaf node is the hash of a data element, and every non-leaf node is the hash of its two children. The root of the tree — the Merkle root — is a single hash that commits to the entire dataset. Change any single leaf, and the root changes. This elegant structure has a remarkable property: to prove that a specific element is in the tree, you only need to provide the hashes along the path from that leaf to the root, plus the sibling hashes at each level.' },
            { type: 'visualization', content: 'merkle-tree', vizType: 'merkle', vizParams: { leaves: 8 } },
            { type: 'text', content: 'For a tree with N leaves, a Merkle proof requires only log2(N) hashes. A tree with one billion leaves requires just 30 hashes per proof. This logarithmic scaling is what makes Merkle trees so powerful in blockchain systems, where every node needs to verify transactions without storing the entire state.' },
            { type: 'text', content: 'In ZK systems, Merkle trees are perhaps the most important data structure. A ZK proof of Merkle membership allows you to prove "my data is in this tree" without revealing which leaf is yours or what your data contains. This is the foundation of privacy in Zcash (proving a note is in the global Merkle tree without revealing which note), of ZK identity systems (proving you are in a group without revealing which member you are), and of ZK voting (proving you are an eligible voter without revealing your identity).' },
            { type: 'code', content: '// Building a Merkle Tree in TypeScript\nclass MerkleTree {\n  private leaves: Buffer[];\n  private layers: Buffer[][];\n\n  constructor(data: string[]) {\n    this.leaves = data.map(d => sha256(d));\n    this.layers = [this.leaves];\n    this.buildTree();\n  }\n\n  private buildTree() {\n    let current = this.leaves;\n    while (current.length > 1) {\n      const next: Buffer[] = [];\n      for (let i = 0; i < current.length; i += 2) {\n        const left = current[i];\n        const right = current[i + 1] || left; // pad odd\n        next.push(sha256(Buffer.concat([left, right])));\n      }\n      this.layers.push(next);\n      current = next;\n    }\n  }\n\n  get root(): Buffer {\n    return this.layers[this.layers.length - 1][0];\n  }\n\n  getProof(index: number): Buffer[] {\n    const proof: Buffer[] = [];\n    let idx = index;\n    for (let i = 0; i < this.layers.length - 1; i++) {\n      const sibling = idx % 2 === 0 ? idx + 1 : idx - 1;\n      proof.push(this.layers[i][sibling]);\n      idx = Math.floor(idx / 2);\n    }\n    return proof;\n  }\n}', language: 'typescript' },
            { type: 'text', content: 'The verification of a Merkle proof is beautifully simple: starting from the claimed leaf, hash it with each sibling from the proof (in the correct order based on whether the current node is a left or right child), and check if the final result equals the stored root. This computation is so lightweight that it can be performed inside a smart contract, making on-chain verification of off-chain data practical.' },
          ],
          quiz: [
            { id: 'q4-1', question: 'How many hashes are needed for a Merkle proof in a tree with 1 million leaves?', options: ['1 million', '500,000', '20', '10'], correctIndex: 2, explanation: 'A Merkle proof requires log2(N) hashes. log2(1,000,000) ≈ 20, so you need about 20 hashes per proof.' },
          ],
        },
      ],
    },
    {
      id: 'l1-m5',
      title: 'Finite Fields & Modular Arithmetic',
      description: 'The mathematical universe where all ZK proofs live — fields, primes, and modular operations.',
      type: 'interactive',
      prerequisites: ['l1-m1'],
      xpReward: 400,
      lessons: [
        {
          id: 'l1-m5-les1',
          title: 'The Clock Arithmetic',
          description: 'Build intuition for modular arithmetic through visual exploration.',
          duration: '20 min',
          xp: 200,
          type: 'interactive',
          content: [
            { type: 'text', content: 'Think of modular arithmetic as clock math. On a 12-hour clock, adding 7 hours to 8 o\'clock gives 3 o\'clock — not 15. The clock "wraps around" at 12. In mathematical terms, we say 15 ≡ 3 (mod 12). The "mod" operation returns the remainder after division. This simple wrapping behavior creates a closed mathematical system where addition, subtraction, multiplication, and (crucially) division all work consistently, as long as the modulus is a prime number.' },
            { type: 'visualization', content: 'modular-clock', vizType: 'modular-clock', vizParams: { modulus: 7 } },
            { type: 'text', content: 'A finite field (also called a Galois field) is a set of numbers {0, 1, 2, ..., p-1} where p is a prime, with addition and multiplication defined modulo p. The critical property is that every non-zero element has a multiplicative inverse — for every a ≠ 0, there exists a unique b such that a × b ≡ 1 (mod p). This means division works: a/b = a × b⁻¹ (mod p). Without this property, many cryptographic constructions would be impossible.' },
            { type: 'math', content: 'Finite Field F_p where p is prime:\n\nAddition:  (a + b) mod p\nSubtraction: (a - b) mod p\nMultiplication: (a × b) mod p\nDivision:  a × a⁻¹ mod p  where a × a⁻¹ ≡ 1 (mod p)\n\nExample in F_7:\n  3 + 5 = 8 mod 7 = 1\n  3 × 5 = 15 mod 7 = 1\n  3⁻¹ = 5  (because 3 × 5 ≡ 1 mod 7)' },
            { type: 'text', content: 'Why does the modulus need to be prime? If p = 6 (not prime), then 2 has no inverse: there is no b such that 2b ≡ 1 (mod 6). This is because gcd(2, 6) = 2 ≠ 1. When p is prime, every number from 1 to p-1 is coprime with p, guaranteeing that inverses exist for all non-zero elements. This is what makes finite fields so useful: they give us a mathematical universe where all the algebraic operations we need work flawlessly, but in a finite, discrete setting that is computationally tractable.' },
            { type: 'interactive', content: 'visualization:field-explorer', vizType: 'field-explorer', vizParams: { modulus: 7, operation: 'multiply' } },
            { type: 'text', content: 'In ZK proof systems, finite fields are the computational substrate. Every arithmetic circuit operates over a finite field. The BN254 curve used in Ethereum\'s EIP-196/197 precompiles operates over a field of size approximately 2²⁵⁴. The BLS12-381 curve uses a slightly larger field. When you write a Circom circuit, you are writing constraints over a finite field. When a proof is generated, every computation is modular arithmetic. Understanding finite fields is not optional — it is the ground on which everything else is built.' },
          ],
          quiz: [
            { id: 'q5-1', question: 'What is 3⁻¹ (the multiplicative inverse of 3) in F_7?', options: ['2', '3', '5', '6'], correctIndex: 2, explanation: '3 × 5 = 15 ≡ 1 (mod 7), so 3⁻¹ = 5 in F_7.' },
            { id: 'q5-2', question: 'Why must the modulus be prime for a finite field?', options: ['For performance reasons', 'To ensure every non-zero element has a multiplicative inverse', 'To make the field smaller', 'It does not need to be prime'], correctIndex: 1, explanation: 'A prime modulus ensures every number 1 through p-1 is coprime with p, guaranteeing multiplicative inverses exist for all non-zero elements — which is essential for division to work.' },
          ],
        },
      ],
    },
  ],
};

// ===== LEVEL 2: INTRO TO ZK =====
export const level2: CurriculumLevel = {
  id: 2,
  title: 'Introduction to Zero Knowledge',
  subtitle: 'Where intuition meets formal proof',
  description: 'Build deep intuition for zero knowledge proofs through interactive analogies, then formalize your understanding with the core definitions of soundness, completeness, and zero-knowledge.',
  color: '#06b6d4',
  icon: '🧩',
  totalXp: 3000,
  modules: [
    {
      id: 'l2-m1',
      title: 'The ZK Intuition',
      description: 'Develop an intuitive understanding of what zero knowledge means through classic analogies and thought experiments.',
      type: 'interactive',
      prerequisites: [],
      xpReward: 400,
      lessons: [
        {
          id: 'l2-m1-les1',
          title: 'The Cave of Ali Baba',
          description: 'The classic ZK analogy — how to prove you know a secret without revealing it.',
          duration: '20 min',
          xp: 200,
          type: 'interactive',
          content: [
            { type: 'text', content: 'Imagine a circular cave with a single entrance and a magic door inside that connects the two paths around the circle. The door only opens if you speak a secret password. You want to prove to a verifier that you know the password, but you absolutely do not want to reveal the password itself. This is the Ali Baba cave scenario, and it perfectly illustrates the three properties of a zero knowledge proof.' },
            { type: 'visualization', content: 'cave-analogy', vizType: 'cave', vizParams: {} },
            { type: 'text', content: 'The protocol works as follows: (1) The prover enters the cave and takes either the left or right path. (2) The verifier stands outside, then enters and shouts "left" or "right" at random. (3) If the prover knows the password, they can always come out the requested path — either by walking back if they are already on that side, or by using the password to go through the magic door. (4) If the prover does not know the password, they have only a 50% chance of being on the correct side.' },
            { type: 'text', content: 'After one round, a cheating prover succeeds with probability 1/2. After n rounds, the probability of cheating drops to (1/2)ⁿ. After 20 rounds, a cheating prover succeeds with probability less than one in a million. The verifier learns nothing about the password — they only learn that the prover can consistently come out the requested side, which implies knowledge of the password. This is zero knowledge: the verifier is convinced of the truth of the statement but gains no additional information.' },
            { type: 'interactive', content: 'simulation:cave-protocol', vizType: 'cave-simulation', vizParams: { rounds: 5 } },
            { type: 'text', content: 'The cave analogy demonstrates three fundamental properties. Completeness: an honest prover who knows the password will always convince the verifier. Soundness: a dishonest prover who does not know the password will fail with overwhelming probability. Zero-knowledge: the verifier learns nothing beyond the truth of the statement "the prover knows the password." Every ZK proof system, no matter how complex, must satisfy these three properties.' },
          ],
          quiz: [
            { id: 'q6-1', question: 'After 10 rounds of the cave protocol, what is the probability that a cheating prover succeeds?', options: ['1/10', '1/100', '1/1024', '1/2'], correctIndex: 2, explanation: 'Each round has a 1/2 chance of the cheater being caught, so after 10 rounds the success probability is (1/2)^10 = 1/1024.' },
          ],
        },
        {
          id: 'l2-m1-les2',
          title: 'Proving vs Verifying',
          description: 'The asymmetry at the heart of ZK — hard to prove, easy to verify.',
          duration: '15 min',
          xp: 150,
          type: 'theory',
          content: [
            { type: 'text', content: 'One of the most remarkable properties of ZK proof systems is the dramatic asymmetry between proving and verifying. Generating a proof might take seconds or minutes of intensive computation. Verifying that same proof takes milliseconds. This asymmetry is not a bug — it is a feature that makes ZK proofs practical in real-world systems where verifiers are resource-constrained.' },
            { type: 'text', content: 'Consider a zk-rollup: the prover (a specialized server with powerful hardware) processes thousands of transactions and generates a single proof that all transactions are valid. The verifier (an Ethereum smart contract) checks this proof in constant time, regardless of how many transactions were processed. The verification cost is the same whether the rollup processed 10 transactions or 10,000. This is the power of succinct verification.' },
            { type: 'math', content: 'Proof Size Comparison:\n\nGroth16:  3 group elements (~192 bytes)\nPLONK:   ~400-500 bytes\nSTARK:   ~45-200 kB (larger but transparent)\n\nVerification Time:\nGroth16:  ~1-3ms (3 pairings)\nPLONK:    ~2-5ms (1 pairing + FFT)\nSTARK:    ~10-50ms (FRI verification)' },
            { type: 'text', content: 'This asymmetry mirrors a pattern found throughout mathematics and computer science. The P vs NP problem asks whether solutions that are easy to verify are also easy to find. ZK proof systems exploit this gap: even though finding a proof requires significant computation, verifying it is efficient. In fact, the most succinct ZK proofs (SNARKs) compress arbitrarily long computations into constant-size proofs, a property that would have seemed impossible to early cryptographers.' },
          ],
        },
      ],
    },
    {
      id: 'l2-m2',
      title: 'Formal Properties',
      description: 'The three pillars of zero knowledge: completeness, soundness, and zero-knowledge.',
      type: 'theory',
      prerequisites: ['l2-m1'],
      xpReward: 350,
      lessons: [
        {
          id: 'l2-m2-les1',
          title: 'Completeness, Soundness, Zero-Knowledge',
          description: 'Formal definitions and why each property is essential.',
          duration: '25 min',
          xp: 175,
          type: 'theory',
          content: [
            { type: 'text', content: 'Every zero knowledge proof system must satisfy three properties. Completeness guarantees that an honest prover with a true statement can always convince an honest verifier. Soundness guarantees that a dishonest prover with a false statement cannot convince the verifier, except with negligible probability. Zero-knowledge guarantees that the verifier learns nothing beyond the truth of the statement — there exists a simulator that can produce indistinguishable "proofs" without knowing the witness.' },
            { type: 'text', content: 'Completeness is the easiest property to understand and achieve. If the statement is true and the prover follows the protocol honestly, the verifier should accept. If this were not the case, the proof system would be useless — honest provers would sometimes fail to convince verifiers of true statements. In practice, completeness is always 1 in well-designed systems: an honest prover always succeeds.' },
            { type: 'text', content: 'Soundness comes in two flavors. Statistical soundness means that no computationally unbounded prover can convince the verifier of a false statement, except with negligible probability. Computational soundness means that no polynomial-time prover can convince the verifier of a false statement, except with negligible probability. SNARKs (Succinct Non-interactive ARguments of Knowledge) have computational soundness — they rely on cryptographic assumptions. STARKs (Scalable Transparent ARguments of Knowledge) achieve statistical soundness through information-theoretic techniques, making them secure even against quantum computers.' },
            { type: 'text', content: 'Zero-knowledge is the most subtle property. It does not mean the verifier learns "nothing" in an absolute sense — they learn that the statement is true. It means they learn nothing beyond this fact. Formally, there exists a polynomial-time simulator that, without access to the witness, can produce transcripts that are computationally (or statistically) indistinguishable from real proof transcripts. If a simulator can produce fake proofs that look real, then the real proof cannot contain any information beyond the truth of the statement — because the same "information" appears in the simulated proofs, which were generated without the witness.' },
            { type: 'callout', content: 'The simulator argument is the formalization of the intuition: "If I could have generated this transcript without knowing the secret, then the transcript cannot contain any information about the secret." This is why the existence of a simulator proves zero-knowledge.' },
          ],
        },
      ],
    },
    {
      id: 'l2-m3',
      title: 'Witnesses & Constraint Systems',
      description: 'How computations are encoded as constraint systems that can be proven and verified.',
      type: 'interactive',
      prerequisites: ['l2-m2'],
      xpReward: 400,
      lessons: [
        {
          id: 'l2-m3-les1',
          title: 'The Witness',
          description: 'Understanding the private input that makes a statement true.',
          duration: '15 min',
          xp: 150,
          type: 'theory',
          content: [
            { type: 'text', content: 'In a ZK proof system, the statement is the public claim being made, and the witness is the private data that makes the statement true. If the statement is "I know a preimage of this hash," the witness is the actual preimage value. If the statement is "I know a valid transaction," the witness includes the private keys and transaction details. The entire art of ZK proof systems is about proving that you know a valid witness for a statement without revealing the witness itself.' },
            { type: 'text', content: 'The relationship between statement and witness is captured by a relation R(x, w), where x is the public statement and w is the private witness. The proof system allows the prover to demonstrate knowledge of w such that R(x, w) = true, without revealing w. The language L_R = {x | exists w: R(x, w) = true} consists of all statements that have a valid witness. Proving membership in L_R without revealing the witness is the core capability of ZK proofs.' },
            { type: 'math', content: 'Relation: R(x, w)\n  x = public statement (e.g., hash output)\n  w = private witness (e.g., preimage)\n\nStatement: "I know w such that H(w) = x"\n\nZK Proof: π such that:\n  - Verifier accepts π if ∃w: R(x,w) = true\n  - π reveals nothing about w\n  - π is succinct (constant or logarithmic size)' },
            { type: 'text', content: 'In practice, the relation R is almost always expressed as a constraint system — a set of arithmetic constraints over a finite field that the witness must satisfy. The most common constraint systems are R1CS (Rank-1 Constraint Systems, used by Groth16 and Pinocchio), AIR (Algebraic Intermediate Representation, used by STARKs), and PLONKish constraints (used by PLONK, Halo2, and many modern systems). Each constraint system has different trade-offs in expressiveness, proof size, and verification efficiency.' },
          ],
        },
      ],
    },
  ],
};

// ===== LEVEL 3: zkSNARKs =====
export const level3: CurriculumLevel = {
  id: 3,
  title: 'zkSNARKs',
  subtitle: 'Succinct proofs for arbitrary computations',
  description: 'Master the most widely deployed ZK proof systems — from arithmetic circuits and R1CS to Groth16 and PLONK, with interactive visualizations of every step in the proof pipeline.',
  color: '#10b981',
  icon: '⚡',
  totalXp: 4000,
  modules: [
    {
      id: 'l3-m1',
      title: 'Arithmetic Circuits & R1CS',
      description: 'How computations become constraints — the bridge between programs and proofs.',
      type: 'interactive',
      prerequisites: ['l2-m3'],
      xpReward: 500,
      lessons: [
        {
          id: 'l3-m1-les1',
          title: 'From Computation to Constraints',
          description: 'Learn how to express computations as arithmetic circuits over finite fields.',
          duration: '30 min',
          xp: 250,
          type: 'interactive',
          content: [
            { type: 'text', content: 'An arithmetic circuit is a directed acyclic graph where each node performs an addition or multiplication over a finite field. The inputs are the values we want to prove properties about, and the output is the result of the computation. The key insight is that any computation that can be expressed as a program can also be expressed as an arithmetic circuit — and therefore as a system of constraints that can be proven in zero knowledge.' },
            { type: 'visualization', content: 'arithmetic-circuit', vizType: 'circuit', vizParams: { gates: 'basic' } },
            { type: 'text', content: 'Consider computing x³ + x + 5. We can decompose this into three multiplication gates and three addition constraints. First, set v₁ = x × x (squaring gate). Then v₂ = v₁ × x (cubing gate). Then x³ + x + 5 = v₂ + x + 5 (addition constraint). Each multiplication gate introduces one constraint in the R1CS system, while additions are "free" — they can be folded into the same constraint as a linear combination.' },
            { type: 'math', content: 'Computation: x³ + x + 5 = out\n\nFlat arithmetic:\n  v₁ = x · x          (multiplication gate 1)\n  v₂ = v₁ · x         (multiplication gate 2)\n  out = v₂ + x + 5    (addition, folded into linear combination)\n\nR1CS constraints (each: a·b = c):\n  Gate 1: x · x = v₁\n  Gate 2: v₁ · x = v₂\n  Gate 3: (v₂ + x + 5) · 1 = out' },
            { type: 'text', content: 'Rank-1 Constraint Systems (R1CS) formalize this structure. Each constraint has the form (a⃗ · s⃗) × (b⃗ · s⃗) = (c⃗ · s⃗), where a⃗, b⃗, c⃗ are vectors of coefficients and s⃗ is the witness vector containing all intermediate values. The constraint says: the product of two linear combinations of the witness equals a third linear combination. This "rank-1" structure (each constraint has exactly one multiplication) is what makes the system amenable to efficient proof generation.' },
            { type: 'code', content: '// R1CS in TypeScript\ninterface R1CSConstraint {\n  a: bigint[];  // coefficients for left input\n  b: bigint[];  // coefficients for right input\n  c: bigint[];  // coefficients for output\n}\n\n// x³ + x + 5 = 42\n// Witness vector: [1, x, v1, v2, out]\n// Constraint 1: x * x = v1\nconst c1: R1CSConstraint = {\n  a: [0n, 1n, 0n, 0n, 0n],  // x\n  b: [0n, 1n, 0n, 0n, 0n],  // x\n  c: [0n, 0n, 1n, 0n, 0n],  // v1\n};\n\n// Constraint 2: v1 * x = v2\nconst c2: R1CSConstraint = {\n  a: [0n, 0n, 1n, 0n, 0n],  // v1\n  b: [0n, 1n, 0n, 0n, 0n],  // x\n  c: [0n, 0n, 0n, 1n, 0n],  // v2\n};', language: 'typescript' },
          ],
        },
      ],
    },
    {
      id: 'l3-m2',
      title: 'Trusted Setup & Groth16',
      description: 'The most deployed SNARK — how it works and why the trusted setup matters.',
      type: 'theory',
      prerequisites: ['l3-m1'],
      xpReward: 500,
      lessons: [
        {
          id: 'l3-m2-les1',
          title: 'The Trusted Setup Ceremony',
          description: 'Understanding the structured reference string and why it requires a multi-party ceremony.',
          duration: '25 min',
          xp: 200,
          type: 'theory',
          content: [
            { type: 'text', content: 'Groth16 and many other SNARK systems require a "trusted setup" — a one-time ceremony that generates public parameters (called the structured reference string, or SRS) used by both provers and verifiers. The setup produces a set of cryptographic values derived from secret random numbers (often called "toxic waste"). If any single participant in the ceremony honestly destroys their secret contribution, the resulting parameters are secure. But if all participants collude and combine their secrets, they could forge proofs.' },
            { type: 'text', content: 'The reason for the setup is deeply mathematical. SNARKs rely on bilinear pairings — special functions e: G₁ × G₂ → G_T that satisfy e(a·g, b·h) = e(g, h)^(ab). The SRS encodes powers of a secret τ as encrypted points: [1]₁, [τ]₁, [τ²]₁, ..., [τ^d]₁ and [1]₂, [τ]₂. These allow the prover to evaluate polynomials at τ without knowing τ, through the algebraic properties of the pairing. This is the "polynomial evaluation in the exponent" trick that makes succinct proofs possible.' },
            { type: 'text', content: 'The multi-party ceremony addresses the trust problem. In Zcash\'s Sprout ceremony, six participants in different locations each contributed randomness to the SRS. As long as one participant was honest (destroyed their contribution), the toxic waste cannot be reconstructed. In the Sapling ceremony, over 90 participants contributed, making collusion astronomically unlikely. Modern ceremonies like Perpetual Powers of Tau use thousands of participants, each adding randomness to an ever-growing chain of contributions.' },
            { type: 'callout', content: 'The "Powers of Tau" ceremony is universal — it generates parameters sufficient for any circuit up to a certain size. Circuit-specific setups (like Groth16\'s second phase) then specialize these universal parameters for a particular circuit. This two-phase approach reduces the trust requirement: the universal setup only needs to be done once.' },
          ],
        },
      ],
    },
    {
      id: 'l3-m3',
      title: 'PLONK & Polynomial Commitments',
      description: 'Universal and updatable setup systems with KZG polynomial commitments.',
      type: 'interactive',
      prerequisites: ['l3-m2'],
      xpReward: 600,
      lessons: [
        {
          id: 'l3-m3-les1',
          title: 'The PLONK Revolution',
          description: 'How PLONK achieved universal setup and simpler proof generation.',
          duration: '30 min',
          xp: 300,
          type: 'interactive',
          content: [
            { type: 'text', content: 'PLONK (Permutations over Lagrange-bases for Oecumenical Noninteractive arguments of Knowledge) was a breakthrough in SNARK design. Published in 2019 by Gabizon, Williamson, and Ciobotaru, it introduced a universal and updatable structured reference string — meaning the same setup could be used for any circuit, and the setup could be extended by any participant at any time to increase security.' },
            { type: 'text', content: 'The key innovation in PLONK is the use of permutation arguments (specifically, copy constraints) to enforce that wires in the circuit carry the same values where they should. In R1CS-based systems like Groth16, the wiring is encoded directly into the constraint matrices. In PLONK, the wiring is enforced through a separate permutation argument that checks consistency across gates. This separation of "gate constraints" (what each gate computes) from "copy constraints" (how gates are connected) makes the system much more flexible and easier to update.' },
            { type: 'visualization', content: 'plonk-pipeline', vizType: 'plonk', vizParams: {} },
            { type: 'math', content: 'PLONK Gate Constraint:\n  q_L·a_i + q_R·b_i + q_O·c_i + q_M·a_i·b_i + q_C = 0\n\nWhere:\n  a_i, b_i = left and right inputs to gate i\n  c_i = output of gate i\n  q_L, q_R, q_O, q_M, q_C = selector polynomials\n    (encode the type of each gate)\n\nCopy Constraints (permutation):\n  Check that wire values are consistent\n  across gates using grand product argument:\n  ∏(a_i + β·s_σ1(i) + γ)/(a_i + β·i + γ) = 1' },
            { type: 'text', content: 'The polynomial commitment scheme is the engine that makes PLONK work. KZG (Kate-Zaverucha-Goldberg) commitments allow the prover to commit to a polynomial and later prove that it evaluates to a claimed value at a specific point, without revealing the polynomial. The commitment is a single elliptic curve point, and the evaluation proof is also a single point. This extreme succinctness is what gives PLONK its small proof size and fast verification.' },
          ],
        },
      ],
    },
  ],
};

// ===== LEVEL 4: zkSTARKs =====
export const level4: CurriculumLevel = {
  id: 4,
  title: 'zkSTARKs',
  subtitle: 'Transparent proofs without trusted setup',
  description: 'Explore the world of transparent proof systems — no trusted setup required, post-quantum secure, and scalable to massive computations.',
  color: '#f59e0b',
  icon: '🌟',
  totalXp: 4000,
  modules: [
    {
      id: 'l4-m1',
      title: 'AIR & Trace Tables',
      description: 'How STARKs represent computations as algebraic execution traces.',
      type: 'interactive',
      prerequisites: ['l3-m1'],
      xpReward: 500,
      lessons: [
        {
          id: 'l4-m1-les1',
          title: 'The Execution Trace',
          description: 'Understanding the algebraic intermediate representation (AIR) of computations.',
          duration: '25 min',
          xp: 250,
          type: 'interactive',
          content: [
            { type: 'text', content: 'Unlike SNARKs, which work with constraint systems like R1CS, STARKs represent computations as execution traces — tables where each row represents one step of the computation and each column represents a state variable. The constraints are expressed as polynomial relationships between rows of this table. This representation is more natural for many computations, especially those that involve iteration or state evolution.' },
            { type: 'visualization', content: 'trace-table', vizType: 'trace', vizParams: { rows: 8 } },
            { type: 'text', content: 'Consider a simple computation: the Fibonacci sequence. The trace table has two columns (a and b), and each row is computed from the previous one: a_{i+1} = b_i and b_{i+1} = a_i + b_i. The AIR constraints enforce these transition rules: a_{i+1} - b_i = 0 and b_{i+1} - a_i - b_i = 0. The initial row contains boundary conditions (e.g., a_0 = 1, b_0 = 1), and the final row might contain an assertion about the result.' },
            { type: 'math', content: 'Fibonacci Trace Table:\n\nRow |  a  |  b\n----|-----|----\n 0  |  1  |  1\n 1  |  1  |  2\n 2  |  2  |  3\n 3  |  3  |  5\n 4  |  5  |  8\n 5  |  8  |  13\n 6  |  13 |  21\n 7  |  21 |  34\n\nAIR Constraints:\n  a\'(x) - b(x) = 0    (transition)\n  b\'(x) - a(x) - b(x) = 0  (transition)\n  a(0) = 1  (boundary)\n  b(0) = 1  (boundary)' },
            { type: 'text', content: 'The key insight is that if the trace satisfies all constraints, then the columns can be interpolated by low-degree polynomials. STARKs use this property to reduce the problem of verifying a computation to the problem of verifying that certain polynomials have low degree. The FRI (Fast Reed-Solomon Interactive Oracle Proof of Proximity) protocol provides an efficient way to do this verification, and it requires no trusted setup.' },
          ],
        },
      ],
    },
    {
      id: 'l4-m2',
      title: 'FRI & Low Degree Testing',
      description: 'The heart of STARKs — proving that a polynomial has low degree without revealing it.',
      type: 'interactive',
      prerequisites: ['l4-m1'],
      xpReward: 500,
      lessons: [
        {
          id: 'l4-m2-les1',
          title: 'The FRI Protocol',
          description: 'How Fast Reed-Solomon IOP enables scalable transparent proofs.',
          duration: '30 min',
          xp: 250,
          type: 'interactive',
          content: [
            { type: 'text', content: 'FRI (Fast Reed-Solomon Interactive Oracle Proof of Proximity) is the core innovation behind STARKs. It solves a fundamental problem: how can a verifier check that a committed polynomial has degree at most d, without reading all d+1 coefficients? The answer is surprisingly elegant — repeatedly "fold" the polynomial by splitting it into even and odd parts, reducing the degree by half each time, until it reaches a constant.' },
            { type: 'text', content: 'The folding works as follows. Given a polynomial f(x), split it into f(x) = f_even(x²) + x · f_odd(x²), where f_even contains the even-indexed coefficients and f_odd contains the odd-indexed coefficients. Then construct a new polynomial f\'(x) = f_even(x) + α · f_odd(x), where α is a random challenge from the verifier. This new polynomial has roughly half the degree of f. Repeating this process log₂(d) times reduces any degree-d polynomial to a constant.' },
            { type: 'visualization', content: 'fri-folding', vizType: 'fri', vizParams: { degree: 16 } },
            { type: 'text', content: 'At each folding step, the verifier checks that the relationship f\'(x²) = (f(x) + f(-x))/2 + α · (f(x) - f(-x))/(2x) holds for random evaluation points. If the original polynomial has low degree, these checks will pass. If it has high degree (meaning the prover is cheating), at least one folding step will fail with high probability. The beauty of FRI is that it requires only O(log d) rounds and O(log d) queries, making it extremely efficient for both the prover and verifier.' },
            { type: 'text', content: 'The transparency of STARKs comes from the fact that FRI uses only hash functions for commitments (specifically, Merkle commitments to the polynomial evaluations). No trusted setup is needed because there are no elliptic curve operations or pairing-based assumptions. This also means STARKs are plausibly post-quantum secure — the only assumption is the collision resistance of the hash function, which is not known to be broken by quantum computers (unlike the discrete logarithm problem on elliptic curves).' },
          ],
        },
      ],
    },
  ],
};

// ===== LEVEL 5: Advanced ZK Engineering =====
export const level5: CurriculumLevel = {
  id: 5,
  title: 'Advanced ZK Engineering',
  subtitle: 'From theory to production systems',
  description: 'Dive into the cutting edge: recursive proofs, folding schemes, zkVMs, Halo2, Nova, and the architecture of real proving systems.',
  color: '#ef4444',
  icon: '🔬',
  totalXp: 5000,
  modules: [
    {
      id: 'l5-m1',
      title: 'Recursive Proofs & Folding',
      description: 'How to verify a proof inside another proof — the key to incrementally verifiable computation.',
      type: 'theory',
      prerequisites: ['l3-m3', 'l4-m2'],
      xpReward: 600,
      lessons: [
        {
          id: 'l5-m1-les1',
          title: 'Proof Composition',
          description: 'Understanding how proofs can verify other proofs, enabling recursive verification.',
          duration: '30 min',
          xp: 300,
          type: 'theory',
          content: [
            { type: 'text', content: 'Recursive proof composition is one of the most powerful techniques in ZK engineering. The idea is simple but profound: since verifying a SNARK is just a computation, you can express the verifier as a circuit and prove that you ran it correctly. This means you can produce a single proof that attests to the correctness of an entire chain of previous proofs — each new proof recursively absorbs the previous one.' },
            { type: 'text', content: 'The challenge is that the verifier circuit must be efficient enough to fit inside a SNARK. Early SNARK verifiers required elliptic curve pairings, and performing a pairing check inside a circuit (which operates over a different field) was extremely expensive — requiring millions of gates. The breakthrough came with the development of pairing-friendly cycles: two elliptic curves where the base field of one equals the scalar field of the other, and vice versa. This allows the pairing verification to be performed natively without field emulation.' },
            { type: 'text', content: 'Nova, developed by Kothapalli, Setty, and Tzialla, takes a different approach. Instead of running the full verifier circuit inside a SNARK, Nova uses "folding schemes" that combine two instances of the same relation into a single instance. The folding is much cheaper than proof verification — it is essentially just a random linear combination of the witness and instance values. Only the final folded instance needs to be proved, dramatically reducing the per-step cost of recursive verification.' },
            { type: 'math', content: 'Recursive Proof Chain:\n\nπ₁ proves: "Computation step 1 is correct"\nπ₂ proves: "Computation step 2 is correct AND Verify(π₁) = accept"\nπ₃ proves: "Computation step 3 is correct AND Verify(π₂) = accept"\n...\nπₙ proves: "All N steps are correct"\n\nSize: O(1) regardless of N\nVerification: Single proof verification' },
            { type: 'text', content: 'The practical impact is enormous. Recursive proofs enable incrementally verifiable computation: a rollup can process millions of transactions over days or weeks, maintaining a single constant-size proof that attests to the validity of the entire history. Each new batch of transactions is folded into the existing proof, and the verifier only ever needs to check the latest one. This is how modern zk-rollups like zkSync, Scroll, and Polygon zkEVM achieve their scalability properties.' },
          ],
        },
      ],
    },
    {
      id: 'l5-m2',
      title: 'Halo2 & Production Systems',
      description: 'Deep dive into the Halo2 proving system used by Zcash, Scroll, and others.',
      type: 'coding',
      prerequisites: ['l3-m3'],
      xpReward: 500,
      lessons: [
        {
          id: 'l5-m2-les1',
          title: 'Inside Halo2',
          description: 'Understanding the architecture and advantages of the Halo2 proof system.',
          duration: '35 min',
          xp: 250,
          type: 'coding',
          content: [
            { type: 'text', content: 'Halo2, developed by the Electric Coin Company (Zcash), is a proving system that combines the flexibility of PLONKish circuits with a novel polynomial commitment scheme based on the inner product argument. Unlike Groth16, it does not require a circuit-specific trusted setup. Unlike standard PLONK with KZG, it does not require any trusted setup at all — it is fully transparent.' },
            { type: 'text', content: 'The circuit model in Halo2 is more expressive than R1CS. It supports custom gates with arbitrary degree (not just rank-1), lookup arguments (efficiently proving that a value appears in a predefined table), and permutation arguments for copy constraints. This expressiveness means that many operations that would require dozens of R1CS constraints can be expressed as a single Halo2 custom gate, dramatically reducing circuit size and proof generation time.' },
            { type: 'code', content: '// Halo2 Circuit Layout (conceptual)\n// Example: a simple Fibonacci circuit\n\n#[derive(Clone)]\nstruct FibonacciConfig {\n    advice: [Column<Advice>; 2],\n    selector: Selector,\n    instance: Column<Instance>,\n}\n\nimpl<F: FieldExt> Circuit<F> for FibonacciCircuit {\n    type Config = FibonacciConfig;\n    type FloorPlanner = SimpleFloorPlanner;\n\n    fn configure(meta: &mut ConstraintSystem<F>) -> Self::Config {\n        let advice = [\n            meta.advice_column(),\n            meta.advice_column(),\n        ];\n        let instance = meta.instance_column();\n        let selector = meta.selector();\n\n        // Custom gate: a\' = b, b\' = a + b\n        meta.create_gate("fibonacci", |meta| {\n            let s = meta.query_selector(selector);\n            let a = meta.query_advice(advice[0], Rotation::cur());\n            let b = meta.query_advice(advice[1], Rotation::cur());\n            let a_next = meta.query_advice(advice[0], Rotation::next());\n            let b_next = meta.query_advice(advice[1], Rotation::next());\n\n            vec![\n                s.clone() * (a_next - b),     // a\' = b\n                s * (b_next - a - b),          // b\' = a + b\n            ]\n        });\n\n        FibonacciConfig { advice, selector, instance }\n    }\n}', language: 'rust' },
            { type: 'text', content: 'The lookup argument is one of Halo2\'s most powerful features. It allows the circuit to prove that certain values appear in a predefined table, without having to decompose the lookup into arithmetic constraints. This is particularly useful for range checks (proving a value is between 0 and 2³²) and for operations like AES or SHA-256 that use S-boxes — substitution tables that would require thousands of constraints in a pure arithmetic circuit, but only a single lookup argument in Halo2.' },
          ],
        },
      ],
    },
  ],
};

// ===== LEVEL 6: Real World ZK Applications =====
export const level6: CurriculumLevel = {
  id: 6,
  title: 'Real World ZK Applications',
  subtitle: 'Build production ZK systems',
  description: 'Apply everything you have learned to build real, deployable ZK applications — from anonymous voting to privacy wallets to zk-rollups.',
  color: '#ec4899',
  icon: '🚀',
  totalXp: 6000,
  modules: [
    {
      id: 'l6-m1',
      title: 'Anonymous Voting',
      description: 'Build a ZK voting system where votes are verified but voters are anonymous.',
      type: 'project',
      prerequisites: ['l3-m1', 'l1-m4'],
      xpReward: 800,
      lessons: [
        {
          id: 'l6-m1-les1',
          title: 'Designing the Protocol',
          description: 'Architect a ZK voting system with Merkle tree membership and nullifiers.',
          duration: '45 min',
          xp: 400,
          type: 'project',
          content: [
            { type: 'text', content: 'An anonymous voting system must satisfy two seemingly contradictory requirements: only eligible voters can vote, and it must be impossible to link a vote to a voter. Zero knowledge proofs make this possible through a combination of Merkle tree membership proofs (to prove eligibility without revealing identity) and nullifiers (to prevent double voting without revealing which vote belongs to which voter).' },
            { type: 'text', content: 'The architecture works as follows. A central authority (or a decentralized protocol) maintains a Merkle tree of eligible voters. Each voter has a public key and a secret key. To vote, the voter generates a ZK proof that: (1) their public key is in the Merkle tree (membership proof), (2) the nullifier is correctly derived from their secret key, (3) the vote is well-formed (e.g., voting for a valid option). The nullifier is a deterministic function of the secret key and the election ID — it is unique per voter per election, but reveals nothing about which voter it corresponds to.' },
            { type: 'math', content: 'Anonymous Vote Circuit:\n\nPrivate inputs:\n  sk = secret key of voter\n  path = Merkle proof path\n\nPublic inputs:\n  root = Merkle root of eligible voters\n  nullifier = H(sk, election_id)\n  vote = encrypted vote choice\n\nConstraints:\n  1. pk = H(sk)              // derive public key\n  2. VerifyMerkleProof(pk, path, root)  // membership\n  3. nullifier = H(sk, election_id)     // anti-double-vote\n  4. vote ∈ valid_options        // vote validity' },
            { type: 'code', content: '// Circom circuit for anonymous voting\npragma circom 2.1.0;\n\ninclude "lib/merkleProof.circom";\ninclude "lib/hash.circom";\n\ntemplate AnonymousVote(treeDepth) {\n  // Private inputs\n  signal input sk;           // secret key\n  signal input pathElements[treeDepth];  // Merkle path\n  signal input pathIndices[treeDepth];   // left/right positions\n\n  // Public inputs\n  signal input root;         // expected Merkle root\n  signal input electionId;   // election identifier\n  signal input nullifier;    // anti-double-vote nullifier\n  signal input vote;         // vote choice\n\n  // Derive public key from secret key\n  signal pk;\n  pk <== Poseidon([sk]);\n\n  // Verify Merkle membership\n  component merkle = MerkleProof(treeDepth);\n  merkle.leaf <== pk;\n  for (var i = 0; i < treeDepth; i++) {\n    merkle.pathElements[i] <== pathElements[i];\n    merkle.pathIndices[i] <== pathIndices[i];\n  }\n  merkle.root === root;\n\n  // Compute nullifier\n  signal expectedNullifier;\n  expectedNullifier <== Poseidon([sk, electionId]);\n  expectedNullifier === nullifier;\n}', language: 'circom' },
            { type: 'text', content: 'The smart contract that receives and verifies these votes maintains the Merkle root, a list of used nullifiers, and the vote tallies. When a new vote is submitted with a valid proof and a fresh nullifier, the contract adds the nullifier to the used list and increments the vote tally. At no point does the contract learn which voter cast which vote — it only knows that some eligible voter voted for this option, and they have not voted before.' },
          ],
        },
      ],
    },
    {
      id: 'l6-m2',
      title: 'ZK Rollups',
      description: 'Build a minimal zk-rollup that batches transactions and proves their validity.',
      type: 'project',
      prerequisites: ['l3-m3', 'l5-m1'],
      xpReward: 1000,
      lessons: [
        {
          id: 'l6-m2-les1',
          title: 'Rollup Architecture',
          description: 'Design and implement a minimal zk-rollup with state transitions and proof verification.',
          duration: '60 min',
          xp: 500,
          type: 'project',
          content: [
            { type: 'text', content: 'A zk-rollup is a Layer 2 scaling solution that executes transactions off-chain and posts cryptographic proofs of their validity on-chain. The on-chain contract only stores the state root and verifies proofs — it never processes individual transactions. This allows the rollup to process thousands of transactions per second while the Ethereum mainnet only needs to verify a single constant-size proof.' },
            { type: 'text', content: 'The architecture consists of three components: (1) The prover, which executes the transactions, updates the state, and generates a ZK proof that the state transition is valid. (2) The smart contract, which stores the state root and verifies submitted proofs. (3) The data availability layer, which publishes the transaction data so that anyone can reconstruct the state (required for security — without data availability, the operator could withhold state and users could not withdraw).' },
            { type: 'visualization', content: 'rollup-architecture', vizType: 'rollup', vizParams: {} },
            { type: 'text', content: 'The state transition circuit proves: for each transaction, the sender has sufficient balance, the nonce is correct, the signature is valid, and the state is updated correctly. All these checks are performed inside the circuit, and the proof attests to the validity of the entire batch. The verifier contract checks the proof and updates the state root — a constant-time operation regardless of batch size. This is the fundamental scalability promise of zk-rollups: verification cost is O(1) while the work done is O(n).' },
          ],
        },
      ],
    },
  ],
};

export const allLevels: CurriculumLevel[] = [level1, level2, level3, level4, level5, level6];

export function getLevel(id: number): CurriculumLevel | undefined {
  return allLevels.find(l => l.id === id);
}

export function getModule(moduleId: string): CurriculumModule | undefined {
  for (const level of allLevels) {
    const mod = level.modules.find(m => m.id === moduleId);
    if (mod) return mod;
  }
  return undefined;
}

export function getLesson(lessonId: string): CurriculumLesson | undefined {
  for (const level of allLevels) {
    for (const mod of level.modules) {
      const lesson = mod.lessons.find(l => l.id === lessonId);
      if (lesson) return lesson;
    }
  }
  return undefined;
}

export function getLessonLevel(lessonId: string): CurriculumLevel | undefined {
  for (const level of allLevels) {
    for (const mod of level.modules) {
      if (mod.lessons.some(l => l.id === lessonId)) return level;
    }
  }
  return undefined;
}
