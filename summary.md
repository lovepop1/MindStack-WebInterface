# 🧠 MindStack: The AI Memory Engine


### ⚠️ The Problem: The "Semantic Gap" in Knowledge Work

Developers and researchers lose countless hours retracing their steps. Knowledge is fragmented across entirely different formats: uncommitted code diffs, localized terminal crashes, heavy textbook PDFs, and scattered YouTube tutorials. Traditional databases and keyword searches fundamentally fail at linking these disparate formats. Standard search cannot semantically connect a theoretical concept in an academic PDF to a local Python stack trace. When context is lost, productivity halts.

### 💡 The Solution: A Multi-Modal Second Brain

MindStack is an AI-powered memory engine designed to passively capture engineering workflows and academic research, bridging the multi-modal gap using advanced vector mathematics and LLM reasoning. It acts as an omniscient group tutor and senior engineering partner, ensuring no knowledge is ever lost or siloed.

### 🚀 Key Features & Workflow

* **Passive Capture Agents:** * **Browser Assistant:** Allows users to capture web documentation, extract YouTube video transcripts, and upload heavy textbook PDFs.
* **IDE Assistant:** A VS Code extension that passively tracks active file paths, logs terminal stack traces, and captures local, uncommitted code diffs as developers iterate on solutions.


* **The "Never Google Twice" Engine:** MindStack completely eliminates the need to manually track bugs or scattered research. Users can simply ask the chat interface, *"How did I fix that memory leak yesterday?"* and instantly retrieve the exact uncommitted local diff.
* **Hive Brain & Team Attribution:** MindStack features a "Dual-Routing" architecture for shared team workspaces. A built-in Attribution Engine mathematically ties every captured data chunk to its original author. Teams can instantly see who contributed specific code modules or study notes, breaking down knowledge silos.

### ⚙️ Technical Architecture & AWS Integration

To process this multimodal data securely and efficiently, MindStack's core processing pipeline is built entirely on **AWS**.

* **S3 Client Bypass:** Heavy study materials and visual assets bypass standard Next.js server limits by uploading directly from the client to **Amazon S3** via secure pre-signed URLs.
* **Log Translation (Claude 4.5 Haiku):** Raw developer telemetry—such as complex Git diffs and chaotic terminal crashes—is initially intercepted and routed through AWS Bedrock to **Claude 4.5 Haiku**, which translates unreadable machine logs into structured, plain-English markdown summaries.
* **Semantic Vector Engine (Amazon Titan v2):** Translated code summaries, PDF text, and video transcripts are chunked and fed into the **Amazon Titan v2** embedding model on Bedrock. Titan converts this unstructured data into 1024-dimensional semantic vectors, natively stored in a PostgreSQL database using `pgvector`.
* **Advanced Synthesis (Claude 4.6 Sonnet):** The multimodal chat interface is powered by **Claude 4.6 Sonnet**. The AI evaluates uploaded PDFs, reads IDE telemetry, and generates cohesive, actionable solutions backed by exact, clickable source citations routing directly back to the S3 documents or the developer's terminal logs.

---
