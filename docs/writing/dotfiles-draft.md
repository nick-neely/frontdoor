For a long time, I wanted my work laptop and personal desktop to feel the same when I sat down to develop. The same aliases, the same tools, the same agent skills. Instead, I’d change something on one machine and forget to change it on the other.

I’d talked about fixing this. I just kept finding other things I wanted to work on more.

Getting a MacBook of my own finally pushed me to do something about it. I started from an existing Mac dotfiles repo, a collection of configuration files for setting up a development environment, and began adapting it for my machines.

Coding agents made this practical enough for me to take on. I used 5.6 Sol for most of the work and had a good experience with it, especially for ambiguous tasks and long-running sessions. Without that help, I would have built something much smaller. I might still be putting off syncing the machines.

Today, I manage the setup through a custom command called `dot`. It gives me one place to sync configuration and restore the agent skills I want across my devices. Those consistent skills are one of my favorite parts: adding or changing one no longer means remembering to repeat the work on every machine.

I still need to bring each machine up to date, but I don’t have to remember to check. My terminal prompt shows when there are changes to sync. Pressing `Ctrl+G` puts the suggested command, such as `dot sync`, on the command line, ready for me to run. It puts the reminder and the next step right where I’m already working.

The CLI wasn’t part of the original plan. As the setup grew, I kept finding little things I wanted it to do. Once the foundation was there, adding a feature mostly meant asking for it and trying the result. I welcomed the extra scope because those conveniences were useful to me.

Getting to that point took planning and investigation. Early on, I used Matt Pocock’s Grill Me skill, which prompts the agent to question you about what you want until you reach a shared understanding. I spent time working through what this setup should do before asking agents to build it.

I didn’t closely read most of the code. My confidence came from automated checks, including linting and tests, and from using the setup on my machines. When something didn’t work, I kept iterating with the agents. Seeing it work in daily use mattered.

Building this became enjoyable, especially as I saw it working across my machines. I’d wanted a consistent setup for a long time without wanting to spend the effort to create it. Agents made that effort manageable enough for me to finally do it, and to keep adding conveniences I wouldn’t otherwise have bothered building.
