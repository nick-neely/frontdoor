# The Agentic Software Gold Rush

Agents can write code faster than I can review it. I already trust them with a lot of the work on my personal projects, but I still review the PRs before anything reaches main. Smaller PRs help. More of them still means more work for me.

Implementation got faster. My ability to understand what changed and how it fits into the system didn't keep pace.

That's what makes me interested in the picks and shovels of this software gold rush: the infrastructure that makes greater autonomy practical. Agents need ways to check their work, recognize when to stop, and leave evidence a team can use to understand the result. Connecting those pieces feels like an opportunity.

A lot of the pieces already exist: reproducible environments, automated tests, ways to inspect running software, and ways to recover when something fails. The opportunity is connecting them so an agent can use them independently. It should be able to try a change, exercise the affected workflow, inspect what happened, and use that feedback to decide what to do next.

Passing tests alone wouldn't convince me. I'd want to know what was exercised, what the checks establish, and what remains uncertain. If the agent changes both the implementation and its tests, they could agree with each other and still miss the requirement. The infrastructure has to make those limits visible.

How much evidence is enough depends on what the change could affect and how easily it can be undone. A routine, reversible change might proceed on its own. A destructive migration should wait for human judgment. Teams need to own those boundaries, and agents need to recognize when the work crosses them.

Even with those boundaries in place, I still need to understand the system the agents are changing. Implementation used to help me build that understanding. Suppose an agent saves me four hours of coding. I've also skipped time spent following dependencies, discovering constraints, and reconsidering the design. Writing code was doing two jobs. Delegating it leaves a human comprehension gap.

I'd want a map of the system that shows where a change fits, recordings that demonstrate the new behavior, and the ability to ask why a decision was made. Those answers should connect to the code and evidence behind them. I don't want to read a log of everything the agent did. I want to know what matters, then dig deeper where I need to.

But helping humans catch up may only be one possible future. Even if you're skeptical of today's agents, imagine an AI reviewer that becomes demonstrably more reliable than a human at understanding code and finding problems. What does a mandatory human rubber stamp contribute then? The longer-term opportunity might be making it safer for us to need less understanding of the implementation.

There's a catch: the expertise we rely on to supervise these systems could weaken through lack of use. If agents handle most implementation and debugging, humans get fewer opportunities to practice recognizing what went wrong. Keeping someone available to intervene means little if they've lost the understanding needed to do it. What minimum understanding must we preserve, and how do we keep it alive?

I don't have a complete answer. But teams still need to understand the intent, the consequential design decisions, and what counts as acceptable evidence. Some of that understanding comes from domain modeling and working through examples together with a product owner. The infrastructure needs to carry those agreed rules and reasons into the agents' work, and bring gaps or contradictions back to the team.

Imagine agents working while the team is away, completing routine maintenance and verifying changes within agreed boundaries. The team returns to evidence it can inspect and decisions that need its judgment. If everyone spends the day reconstructing what happened, the bottleneck survives. The payoff would be more attention for deciding what's worth building and weighing the larger design tradeoffs.

That's where I see the picks-and-shovels opportunity: connecting the practices we already have so agents can work independently and teams can judge the results. Faster implementation brought me to the review bottleneck. Getting beyond it will take infrastructure that earns our trust and helps us understand enough to remain responsible for what we build.
