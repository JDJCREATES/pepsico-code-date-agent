# PepsiCo Code Date Agent 
> Created by @JDJCREATES ~ Jacob Jones ~ PMO #37

> AI-powered production line monitoring using multi-agent architecture via Langchain framework

## Live Demo
> Input data is simulated - agentic AI is powered via Openai API
> PepsiCo would need to integrate either on premises LLM or use enterprise solutions such as azure.

## The Problem

**Code date errors cost food manufacturers millions in product recalls

At PepsiCo Frito-Lay:
- Code dates are checked manually every 30 minutes by operators and quality technicians
- This limits checking and logging code dates to only a few units out of thousands made during a shift
- No pattern detection or data logging between shifts

## Solution

An AI agent system that:
- Monitors code dates in real-time via camera feed
- Validates against product specifications
- Detects patterns (issues during shift changes, etc.)
- Makes intelligent decisions (stop line vs alert QC)
- Provides explainable reasoning

## Key Features
- **Real-Time Monitoring** - Continuous code date scanning
- **Multi-Agent Architecture** - Specialized agents collaborate
- **Context-Aware Decisions** - Considers product type, shelf life, history
- **Pattern Detection** - Identifies recurring issues
- **Explainable AI** - Shows reasoning for each decision
- **Proactive Alerts** - Prevents issues before shipment

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **AI**: LangChain.js (Function Calling + Agents) [easily ported to python]
- **LLM**: OpenAI GPT-4 (swappable with Azure OpenAI)
- **Frontend**: React, TypeScript, Tailwind CSS
- **Deployment**: Vercel
- **Mock Data**: JSON-based product/scenario system + custom images

### Agent Responsibilities

| Agent | Function | Tools Used |
|-------|----------|------------|
| Vision | Extract code date from image | OCR service |
| Product Lookup | Get SKU specifications | Product database |
| Date Validator | Check expiration status | Date math, business rules |
| Historical Analyzer | Find patterns | Incident database |
| Decision Maker | Determine action + severity | LLM reasoning |
| Action Executor | Execute alerts/logging | Alert system, logger |

### Data Flow

Camera continuously scans:
  → Image captured
  → Vision agent reads date
  → Product agent finds specs
  → Validator checks expiration
  → Historical agent checks patterns
  → Decision agent determines severity
  → Action agent executes (stop line / alert / log)
  → Results displayed to operator
  
#### Usage 

1. Click "Start Demo": Watch agent system execute
2. Observe Agent Trace: See each agent's reasoning
3. View Decision: Final action and severity score

#### What This Demonstrates
* AI Engineering Skills:
Multi-agent orchestration
Function calling / tool use
LLM prompt engineering
Streaming responses
State management across agents

* Production Thinking:
Provider abstraction (OpenAI → Azure)
Observable agent traces
Business logic separation
Deployment considerations

* Domain Expertise:
Understanding manufacturing constraints
Real operational knowledge
Business impact quantification


#### Author
Jacob Jones
Packaging Machine Operator & AI Engineer


> Built to demonstrate AI agent architecture for PepsiCo's quality control transformation.