# Gold rush

Something about the gold rush. The seed is already in my Google Drive notes.

---

From [The Agentic Software Gold Rush](https://docs.google.com/document/d/1KXb4_KlRFvRbwuttqVJk7Dp0u8Y7MtRfu0yun9opCmA/edit?usp=drivesdk): “Implementation time once doubled as learning time; automation removes some of that incidental understanding.”

---

“Evidence quality matters more than the number of passing checks.”

---

“The danger is expertise decay: if engineers stop implementing and debugging, they may gradually lose the ability to recognize when automated oversight fails.”

---

A possible way to say it: We made code cheaper. We haven't made knowing whether to trust it equally cheap.

---

It's less one specific moment and more that agents can now write code faster than I can review it.

---

I keep coming back to what the picks and shovels are in this gold rush, and whether trust and verification are where the real opportunity is.

---

I've seen it in my day-to-day work: more agentic development means more code, more PRs with bigger diffs, and more context I need as the human reviewing them.

---

It's mostly understanding what changed and how it fits into the larger system. Passing tests alone wouldn't convince me. I'd want to know what was actually verified, what could still go wrong, and how easy it is to undo.

---

I've been using [Matt Pocock's PR skill](https://github.com/mattpocock/skills/blob/main/skills/engineering/pr/SKILL.md), which includes merge danger: the blast radius and whether a change is a one-way or two-way door. Does this touch billing? What are the consequences, and can we walk it back?

---

Right now, I would still have trouble taking “independently verified and safe to merge” at face value. I suspect other software engineers would too.

---

There needs to be some other way to understand the changes without reading every single line of code. As more code ships in larger PRs, trying to understand every line makes the human the bottleneck.

---

It's easy to imagine models becoming better than humans at this work. Even then, they still need a way to communicate to me what changed and how it fits in.

---

A possible phrase: keeping the human oriented. Trusting a change and understanding the system it leaves behind are different needs.

---

It's mostly being able to judge whether the design fits the larger system. A good PR description helps, but I'm still relying on the agent's explanation of its own work. How do I know what it left out?

---

A possible phrase: the omission problem. The agent writes the change, then chooses what I see about the change. What if the missing context is exactly what would have made me disagree?

---

A second agent helps, but it could share the same blind spots. What I catch is often: we already solve this elsewhere, or this adds complexity that makes the next change harder. How do we make that context visible?

---

Even if agents eventually far exceed humans at writing software, they still need ways to check their own decisions. Greater capability doesn't remove the need for verification.

---

Agents can keep trying, checking, and improving. But that hill climbing needs feedback: run the work, control the browser, use the computer, see what actually happened. Verification belongs throughout the work, not just at the end.

---

A question to work out: what tells the agent that it is climbing the right hill? A working browser flow can show that the feature works. What shows that it reused the right abstraction, or left the next change easier?

---

The context lives in a mix of code, docs, and my head. But duplication is only one example. What interests me is the verification infrastructure that lets agents work autonomously while keeping humans able to understand the system.

---

A possible way to say it: I want to delegate the work without losing my understanding of what we're building.

---

I want a mix of a system map and being able to ask questions about what changed and why, with evidence behind the answers. I don't want to read a log of everything the agents did. I want to know what matters.

---

We're still thinking about a workday where we're present for eight hours and agents help us. What if they could work independently while we're away, and we came back to confirm and understand what happened? What does that do to software engineering as we know it?

---

I can grill the agent about what it did and how it implemented it. I can ask it to simplify the explanation until I understand. The explanation can be a conversation.

---

Videos and recordings of the changes are something I'd want to see. Show me what changed in the working software.

---

A possible tension: if agents work all night but I spend all day catching up, we have moved the bottleneck without resolving it. What would let my understanding keep pace without requiring my attention for every change?

---

I'd want to choose what to build next and weigh the bigger design tradeoffs. Agents should be able to finish and verify routine changes on their own, with risky or hard-to-reverse decisions waiting for me.

---

A possible way to say it: verification buys autonomy. The infrastructure earns its keep when it lets work finish safely without needing my attention at every step, while bringing consequential decisions back to me.

---

What holds me back is confidence that agents will verify the work properly and stop when something gets risky, plus being able to return and understand what changed without spending my whole day catching up.

---

A lot of this is good engineering practice: proper tests, verification, and an environment where the work can be checked. Making the codebase easier for agents to work in also gives me more reason to trust their work.

---

From my [agent-friendly codebase exploration checklist](/mnt/c/Users/neely/Documents/Codex/2026-10-20/realtime-voice-chat/outputs/agent-friendly-codebase-exploration.md): give agents isolated environments where they can reset state, replay events, simulate failures, and safely exercise destructive workflows. Let them inspect the effects of an action across screens, requests, jobs, and database state. Give the human runnable previews, before-and-after evidence, and the remaining uncertainty.

---

The checklist asks whether agents can recover from a partially completed operation, and whether verification stays independent when they change both the implementation and the tests. Finishing the task is only part of the test. How many incorrect assumptions and human interventions did it take?

---

A possible way to say it: good engineering practices become the infrastructure for delegation. The same environment that lets an agent discover its mistakes can give a human evidence for trusting the result.

---

The practices already exist. The opportunity is connecting them into something agents can use independently, while giving me enough evidence and context to understand the result.

---

A possible way to say it: the same evidence that lets an agent move forward should let a human catch up.

---

Smaller PRs help, but if agents keep producing more of them, I'm still the bottleneck.

---

Gold rush is mostly excitement about the opportunity to connect these pieces and make autonomous work something we can actually trust.

---

A possible way to say it: smaller units of review don't give me more hours in the day.

---

Probably more experiments and more ambitious projects, while agents handle the maintenance that usually gets pushed aside. I'd want to spend more time deciding what's worth building and less time supervising every change.

---

A possible way to say it: the payoff is room for ambition. Verification infrastructure earns back attention I can spend deciding what deserves to exist.

---

It's less one specific project and more being able to try ideas without taking on another maintenance burden. The focus is the infrastructure that makes that possible.

---

I'm already doing some of this with my personal projects. I already have a lot of trust in agents, but I don't let them ship code straight to main. I still review PRs, and that remains a bottleneck.

---

I think this becomes more relevant in companies building software with more employees. My personal workflow gives me a glimpse of the opportunity; making it work across a team is a larger question.

---

A question to explore: how does personal confidence become shared confidence? The engineer who worked with the agent may understand its decisions. What lets the rest of the team rely on the result?

---

At a company, knowledge is fragmented, more changes happen at once, and the consequences are bigger. The infrastructure needs to give the whole team confidence in what was verified and help them understand how the system is changing.

---

Some of this can't be solved purely from code or by reviewing output. Shared confidence also comes from domain modeling meetings, mobbing, and building understanding with your team and product owner. These were good practices before agents, too.

---

A possible way to say it: verification needs a shared understanding of what we're trying to make true. The team conversations help establish that; the infrastructure connects it to what agents build and check.

---

Agreed rules, examples, and why we made certain decisions should be available to agents. Agents should bring back gaps or contradictions they find. This is one connection in the broader infrastructure opportunity.

---

A possible way to say it: the opportunity lives in the connections between intent, execution, verification, and understanding. Each piece helps the others become useful enough to trust autonomous work.

---

Some of this infrastructure gets absorbed by agents as they improve. But teams still need to own the intent, risk boundaries, and what counts as verified. More capable agents make that infrastructure more important because they can do more on their own.

---

A possible way to say it: capability expands what we can delegate. It doesn't decide what we should authorize or what evidence we should accept.

---

Some of this could be separate infrastructure, and some could be woven into existing tools. I don't want to commit to a specific product shape. The broader opportunity is connecting verification, autonomy, and human understanding across whatever tools teams use.

---

I think people focus too much on how fast agents can write code and underestimate the infrastructure needed to trust autonomous work while keeping the team able to understand what's changing.

---

This infrastructure could give teams false confidence. That possibility is part of why getting it right matters.

---

I'm writing for engineers feeling the review bottleneck, engineering leaders, and builders looking for opportunities in the infrastructure that makes autonomous work trustworthy and understandable.

---

When one part of the work gets cheaper, faster, or more accessible, the bottleneck can move elsewhere. Making implementation faster exposes the limits of review, verification, and human comprehension.

---

The human comprehension gap: if AI saves me four hours of implementation, I've also skipped four hours in which I would have been building a mental model. The time saved and the understanding lost aren't necessarily equal, but implementation was doing both jobs.

---

Even if you don't think AI is good enough today, it's easy to imagine it becoming significantly better. If an AI reviewer becomes demonstrably more reliable than a human at understanding code and catching problems, what does the human rubber stamp still contribute?

---

The long term might not be helping humans understand code, but making it safer for them not to.

---

Two possible futures to hold open: infrastructure that helps humans understand more, and infrastructure that makes it safe for them to need less understanding. Both could matter, in different parts of the same system.

---

As automated systems become more reliable, human expertise could atrophy through lack of practice. If we rarely need to intervene, will we still know how when it matters? What minimal understanding is enough?
