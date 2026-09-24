# Taking my setup with me

I want to write about my dotfiles repo: a setup that makes it easy to set up and sync across machines. It has its own custom CLI and brings things like skills along with it, so I can have a consistent experience developing.

---

A possible way to put it: a better setup on one machine should become a better setup everywhere I work.

---

My development environment includes the instructions and skills my agents use.

---

Configuring a machine is one job. Remembering which machines still need that configuration is another.

---

I was finally getting a MacBook of my own. That pushed me to want a consistent setup across machines. I already knew the pain points: my work laptop and my personal desktop PC had different skills and different setups.

---

My favorite small moment is having consistent skills across my devices. My agent setup is very similar, and I don't have to worry about oddities.

---

I'm a big fan of the custom CLI, including its colors. It gives me a lot of information and helps me remember what to do.

---

Inside my terminal, it lets me know when there are changes I need to sync. I don't have to remember. It shows up right in my terminal or in my Claude Code status line.

---

Ideally, the experience would be exactly the same across all my machines. A lot of the developer setup can be similar between WSL and a MacBook, but some Mac-specific things don't translate. Differences in OS and architecture put a limit on how far that consistency can go.

---

The oddities were mostly ordinary: I would change something on one machine and forget to do it on the other. Add a skill, change a skill, tweak the setup. Keeping everything aligned meant mentally and manually syncing it myself.

---

The point is having a consistent experience across machines, particularly for developer tooling. Having everything synced is the end goal. The reminders help me get there.

---

I don't remember exactly how the reminders started. I think I wanted to explore ways to visually see when my dotfiles needed updating, and they grew out of that.

---

Trying to get everything synced brings out a perfection mindset. Once I expect the machines to match, even one small difference can throw me off. The reminders have helped as the setup has progressed.

---

There wasn't a ton of hands-on implementation work for me. I used agentic AI heavily, and much of the development happened autonomously. I didn't read much of the code because I didn't feel I needed to for this personal setup. It isn't consumer-facing or production software.

---

Would I have built something this extensive without agents? No, absolutely not. That should be a big point of this post.

---

I had talked for a while about using something like chezmoi to keep my work laptop and desktop PC consistent: the same WSL development setup, the same aliases, the things I like having around. I kept putting it off. There were other side projects I wanted to work on, things I felt would drive more value.

---

Without agents, I would have had a much more minimal version. I might not even have had syncing across devices.

---

I started from someone else's Mac dotfiles setup, found through a YouTuber in the agentic AI space. The repository's recorded seed is kunchenguid/dotfiles, and its original README links to a Mac setup walkthrough. I had a starting point to adapt.

---

A possible way to put it: this had been worth wanting for a long time. Agents made it worth doing.

---

I barely read the code. My confidence came from linting, tests, other verification, trust in the agents, and actually running it on my machines. If it didn't work, I kept iterating.

---

I moved the routine CI checks onto the device to save runner costs. The workflow immediately before that change used Ubuntu and macOS runners, with the WSL configuration built on Linux. My recollection of a separate Windows runner isn't supported by that version of the workflow. The current repository also retains a manually triggered GitHub workflow.

---

I want someone reading this to think: maybe I could use this setup. Maybe agents make it practical for me to put the work into something like this now.

---

Something you hadn't thought of doing, or hadn't wanted to spend the time on before, is now within reach.

---

At the beginning, I used Matt Pocock's Grill Me skill to work through what I wanted and how I wanted the setup to develop. There was a lot of planning and investigation up front. Once most of it was built, adding features usually meant asking for what I wanted.

---

The agents were generally able to work out which changes belonged across all hosts and which were specific to a machine or operating system. I didn't have to spell out every placement decision when asking for a new feature.

---

My ambitions absolutely grew. The custom CLI wasn't in the original scope. It started making sense as the setup developed, and I welcomed the extra scope because it brought conveniences I wanted.

---

This is personal software. I'm the person asking for the features and the person who finds them useful. I don't need a customer case for every convenience.

---

It was one of those "boil the ocean" moments. I felt we could keep going and building, as long as we had the effort and tokens for it.

---

A possible way to put it: I put work into deciding what I wanted. Once the foundation was there, I could ask for the next thing that would make it nicer to use.

---

I remember doing the planning and investigation, but it happened long enough ago that I can't give a concrete example of what the grilling helped me discover.

---

Building it definitely became enjoyable, especially seeing it work. The payoff has felt huge because this is something I've wanted for a while.

---

> This is something I've been wanting for a while now. I just haven't cared to put the effort in.

---

I wasn't familiar with Nix or Home Manager at all before this. I hadn't used either of them.

---

Using the setup has made me slightly curious about the underlying tools, including how pruning works. But I'm more than happy to let the dot interface control things. It's specialized to me, my setup, and what I know.

---

A possible way to put it: I can be curious about what's underneath and still prefer the interface I made for myself.
