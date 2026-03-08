---
title: "Dhwani.ai"
slug: "dhwani-ai"
date: "2026-03-08"
published: "true"
---



## Banking That Listens to Bharat

Dhwani.ai is an AI-powered voice banking assistant that speaks Indian languages — Hindi, Tamil, Telugu, Bengali, Marathi, and English. No menus. No typing. Just speak.

---

## The Problem

- **700+ million Indians** prefer voice over typing
- Rural bank customers struggle with English-only interfaces
- Call centers can't scale to handle regional languages
- Elderly users find app navigation frustrating

---

## The Solution

A voice-first banking assistant where users speak naturally in their language and receive instant voice responses. Say "Mujhe loan chahiye" in Hindi or "எனக்கு கடன் வேண்டும்" in Tamil — Dhwani understands.

---

## How It Works

```
🎤 User speaks
    ↓
🔊 Sarvam STT transcribes (saarika:v2.5)
    ↓
🔒 PII auto-redacted (Aadhaar, phone, email)
    ↓
🧠 Groq AI processes (Llama 3.3 70B)
    ↓
🗣️ Sarvam TTS responds (bulbul:v3)
    ↓
🎧 User hears natural voice response
```

---

## What Makes It Special

| Feature | Why It Matters |
|---------|----------------|
| **6 Indian Languages** | Real multilingual — Hindi, Tamil, Telugu, Bengali, Marathi, English |
| **Sub-4 second responses** | Groq's speed makes it feel like talking to a human |
| **Privacy-first** | Aadhaar, phone numbers auto-masked before AI sees them |
| **Compliance-ready** | All conversations logged, sensitive queries flagged for human review |
| **Voice-only UX** | No typing needed — accessibility for all literacy levels |

---

## Tech Stack

- **Voice AI**: Sarvam AI — India's best speech models
- **LLM**: Groq AI — Llama 3.3 70B at insane inference speed
- **Backend**: Python 3.11+, FastAPI, SQLite
- **Security**: PII redaction, audit trails, human review flagging

---

## Use Cases

1. **Bank Call Centers** — Automate customer queries with AI that speaks their language
2. **Mobile Banking** — Voice-enabled banking for users who prefer speaking over typing
3. **Branch Kiosks** — Self-service voice assistants at bank branches
4. **Rural Outreach** — Banking access for users with limited literacy

---

## Sample Interactions

| Language | User Says | AI Understands |
|----------|-----------|----------------|
| Hindi | "Mujhe home loan chahiye" | Home loan inquiry |
| Tamil | "எனக்கு கடன் வேண்டும்" | Loan information request |
| Telugu | "నాకు బ్యాలెన్స్ చెక్ చేయాలి" | Balance check |
| Bengali | "আমার অ্যাকাউন্ট খুলতে চাই" | Account opening |
| Marathi | "मला FD rates हवे आहेत" | FD rate inquiry |

---

## Performance Specs

| Parameter | Value | Purpose |
|-----------|-------|---------|
| STT Timeout | 8 sec | Prevents hanging on bad audio |
| AI Timeout | 3.5 sec | Fast fallback to human agent |
| TTS Speed | 1.25x | Natural, brisk conversation |
| Max Tokens | 400 | Concise, relevant responses |

---

## Links

- **GitHub**: https://github.com/Ashurai84/Dhwani.ai


---

## Built

March 9, 2026 — Rapid prototype demonstrating voice-first banking UX for Indian languages. One evening build.
