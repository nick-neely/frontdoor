# Research: The Agentic Software Gold Rush

Gathered 2026-10-31. Every figure below was read by me on the primary page or PDF unless it is marked **UNVERIFIED**. "Read on primary" means I downloaded the source itself and extracted the sentence, not a summary of it. Quotes are verbatim; PDF text extraction can drop ligatures, so check punctuation against the source before publishing.

## 1. Output up, review load up

### Faros AI, "The AI Productivity Paradox" (2025)

- **Source:** https://www.faros.ai/blog/ai-software-engineering (published 2025-07-23). Landing page: https://www.faros.ai/research/ai-productivity-paradox
- **Population:** "telemetry ... from 1,255 teams and over 10,000 developers across multiple companies."
- **Read on primary:** yes.

| Figure | Exact quote |
| --- | --- |
| +21% tasks, +98% PRs merged, +91% PR review time | "Developers on teams with high AI adoption complete 21% more tasks and merge 98% more pull requests , but PR review time increases 91% , revealing a critical bottleneck: human approval." |
| +9% tasks, +47% PRs touched per day | "Developers on teams with high AI adoption touch 9% more tasks and 47% more pull requests per day." |
| +9% bugs, +154% PR size | "AI adoption is consistently associated with a 9% increase in bugs per developer and a 154% increase in average PR size." |

What you remembered was right: 98% more PRs merged and 91% longer review time.

### Faros AI, "AI Engineering Report 2026: The Acceleration Whiplash" (newest full edition)

- **Source (the PDF itself):** https://pages.faros.ai/hubfs/AI_Engineering_Report_2026_The_Acceleration_Whiplash_Faros.pdf. Landing page: https://www.faros.ai/research/ai-acceleration-whiplash
- **Population and date:** "two years of data from 22,000 developers and 4,000 teams across the Faros platform" (p. 2). Method: "For each team, we calculated the percent change in metric values between the two quarters of lowest AI adoption and the two quarters of highest AI adoption" (p. 4). "This version of the report reflects analysis as of March 2026." (p. 4). The PDF was created 2026-04-09.
- **Read on primary:** yes, the full PDF.

| Figure | Exact quote (page) |
| --- | --- |
| +33.7% task throughput per developer, +66.2% epics, +16.2% PR merge rate | Table: "+33.7% task throughput per developer +66.2% epics completed per developer +16.2% PR merge rate per developer +210% tasks completed per team with an associated PR" (p. 10) |
| +156.6% wait for first review, +199.6% average time in review, +441.5% median time in review | "Before a reviewer even picks up a pull request, the median wait time has grown 156.6%. Once someone does begin reviewing, the time spent in review has increased 199.6% on average and 441.5% at the median." (p. 18) |
| +31.3% PRs merged with no review | "Consider one finding from this report: 31.3% more PRs are being merged without any review." (p. 5) |
| The review bottleneck, in Faros's own words | "PR merge rate per developer is up 16.2% after high AI adoption, but considerably lower than the 98% increase in our 2025 report. The most likely explanation is not diminishing returns from the tools, rather that the code quality is creating a review bottleneck that is throttling throughput." (p. 12) |
| Deployments −11.7% (only ~10% of the dataset) | "For the subset of organizations that instrument deployment frequency (approximately 10% of the dataset), deployments per week are down 11.7%." (p. 12) |
| Executive-summary rounding | "Task completion is up 34%. Epics completed per developer are up 66%. ... Bugs per developer are up 54%. The incidents-to-PR ratio has more than tripled. Median review time has increased 5X. 31% more PRs are merging without any review." (p. 2) |

The p. 17 table prints "+441.5 median time in PR review" without the % sign. Quote the p. 18 prose, which includes it.

### Faros AI, "Q3 2026: The Speed Trap" (newest edition, full report gated)

- **Source:** Faros's own takeaways post, https://www.faros.ai/blog/ai-speed-trap-takeaways (published 2026-09-18). The report itself (https://www.faros.ai/research/speed-trap) is behind a form, and I did not read it.
- **Population:** "the most recent 12 months of telemetry from 22,000 developers across 4,000 teams."
- **Read on primary:** yes for the first-party post. The underlying report is not read.

| Figure | Exact quote |
| --- | --- |
| PRs merged with no review: rise grew from 31.3% to 76.3% | "Six months ago, we flagged a 31.3% rise in PRs merged without review as one of the most alarming findings in the report. That figure has increased to 76.3%." |
| QA time +300.6% | "time in QA is up 300.6%, the largest deterioration among the major efficiency and flow metrics in this dataset." |
| PR size +71.8% | "average PR size is up 71.8%, even more than in our previous dataset." |
| Agents opening 13-14% of PRs, AI reviewing 50-80% | "many companies running AI review on 50–80% of PRs. ... with agents opening 13–14% of PRs at the leading edge." |

The post gives no new review-time figure. It says only "Time in review also remains heavily elevated."

### GitHub Octoverse 2026 (independent volume figure, no review-time pair)

- **Source:** https://github.blog/news-insights/octoverse/octoverse-commits-pushes-reach-new-highs-in-2026-as-developers-build-with-agents/ (published 2026-10-28). Window: "October 1, 2025 to September 30, 2026, inclusive."
- **Read on primary:** yes.
- "Merged pull requests more than tripled to 1.3 billion over the same period, an average of 3.5 million a day."
- "As of September, developers start more than 40% of pull requests with an agent. In March, it was 17%."
- "Usage of AI-assisted code review and GitHub Advanced Security both grew more than 90% year over year."

**Caveats.** Faros sells engineering-measurement software. Its numbers are observational correlations within teams (low-adoption quarters vs high-adoption quarters), not causal estimates. The 2025 and 2026 datasets are different samples, so do not chart 98% against 16.2% as a trend without saying so. I did not check LinearB.

## 2. Google DORA

### DORA 2024 Accelerate State of DevOps

- **Source:** https://services.google.com/fh/files/misc/2024_final_dora_report.pdf (v. 2024.3)
- **Population:** "nearly 3,000 working professionals" took the 2024 survey (p. 91).
- **Read on primary:** yes.
- Your recollection is confirmed. "We see that the effect on delivery throughput is small, but likely negative (an estimated 1.5% reduction for every 25% increase in AI adoption). The negative impact on delivery stability is larger (an estimated 7.2% reduction for every 25% increase in AI adoption)." (p. 40)
- Trust: "39.2% of respondents reported having little or no trust in AI." (p. 6), broken down as "39.2% reporting little (27.3%) or no trust (11.9%) at all" (p. 23).

### DORA 2025 State of AI-assisted Software Development (newest edition; I found no 2026 edition)

- **Source:** https://services.google.com/fh/files/misc/2025_state_of_ai_assisted_software_development.pdf (v. 2025.2). Hub page: https://dora.dev/dora-report-2025/
- **Population and date:** "survey responses from nearly 5,000 technology professionals from around the world" (p. 3). The survey was "conducted between June 13 and July 21, 2025" (p. 4).
- **Read on primary:** yes.
- Amplifier: "The research reveals a critical truth: AI's primary role in software development is that of an amplifier. It magnifies the strengths of high- performing organizations and the dysfunctions of struggling ones." (p. 3; the PDF breaks "high-performing" across a line.)
- Downstream loss: "Without this foundation, AI creates localized pockets of productivity that are often lost to downstream chaos." (p. 3)
- Throughput vs instability: "AI adoption now improves software delivery throughput, a key shift from last year. However, it still increases delivery instability." (p. 4)
- Adoption and trust: "The majority of survey respondents (90%) use AI as part of their work and believe (more than 80%) it has increased their productivity. Yet a notable portion (30%) currently report little to no trust in the code generated by AI, indicating a need for critical validation skills." (p. 4)
- Trust breakdown: "This includes nearly a quarter of respondents (24%) who report having "a great deal" or "a lot" of trust. While 30% of those surveyed indicate a more reserved stance, with "a little" (23%) or "no trust at all" (7%) in the quality of AI-generated output." (p. 31)

The 2025 effects are published as standardized estimates. I did not find a "per 25% adoption" percentage like the 2024 one, so do not write a 2025 equivalent of "−7.2%".

## 3. Developer trust (Stack Overflow)

### Stack Overflow Developer Survey 2026 (newest edition)

- **Source:** https://survey.stackoverflow.co/2026/ai/data (chart data) and https://survey.stackoverflow.co/2026/ai (narrative). Methodology: https://survey.stackoverflow.co/2026/methodology. The survey received "30,903 responses from 169 countries", "recorded from June 23, 2026 through August 5, 2026".
- **Read on primary:** yes.
- **Question (exact wording):** "How much do you trust the output from AI tools or AI agents as part of your workflow?" (All Respondents, n = 14,304)

| Answer option (exact)                                         | Share |
| ------------------------------------------------------------- | ----- |
| I trust it when I can easily verify the output                | 48.0% |
| I trust it for many tasks, but not important work decisions   | 16.3% |
| I trust it for low-risk work tasks only                       | 16.3% |
| I do not trust it for most work tasks                         | 12.3% |
| I trust it for many tasks, including important work decisions | 6.6%  |

- Page summary: "Trust is conditional: 48% trust AI when they can easily verify it, while only 7% trust it with important decisions."
- Verification behaviour: "When you receive an AI-generated answer for a development task, what do you usually do before using it?" (n = 13,162) "Run it locally 10,067 76.5%", "Use as-is 1,265 9.6%".
- Skill loss, relevant to expertise decay: the question "Do you try to avoid using AI tools or agents at work or school?" (n = 13,857) has the answer "Concern over losing job skills or training an AI to replace you 2,367 17.1%". The summary line: "Skill loss/job replacement (17%) exceeds ethical (15%), privacy/security (13%), environmental (8%), or training concerns (3%)."

The 2026 survey changed the trust question. It no longer asks about "accuracy" on a trust/distrust scale, so the 2025 and 2026 figures cannot be compared as a trend.

### Stack Overflow Developer Survey 2025 (the trust/distrust split you asked about)

- **Source:** https://survey.stackoverflow.co/2025/ai. The survey had "over 49,000+ responses from 177 countries" (https://survey.stackoverflow.co/2025/).
- **Read on primary:** yes.
- **Question (exact wording):** "How much do you trust the accuracy of the output from AI tools as part of your development workflow?" (Responses: 33,244). Answers: "Highly trust 3.1% Somewhat trust 29.6% Somewhat distrust 26.1% Highly distrust 19.6%".
- Summary: "More developers actively distrust the accuracy of AI tools (46%) than trust it (33%), and only a fraction (3%) report "highly trusting" the output."
- Frustrations (Responses: 31,476): "The biggest single frustration, cited by 66% of developers, is dealing with "AI solutions that are almost right, but not quite," which often leads to the second-biggest frustration: "Debugging AI-generated code is more time-consuming" (45%)"

**UNVERIFIED / misattributed:** one search summary credited DORA 2025 with "Only 3% of developers report high trust". That figure is Stack Overflow 2025 ("Highly trust 3.1%"), not DORA.

## 4. METR

### Early-2025 RCT

- **Source:** https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/. Paper: https://arxiv.org/abs/2507.09089
- **Population:** "16 experienced developers from large open-source repositories (averaging 22k+ stars and 1M+ lines of code)", working on "real issues (246 total)".
- **Read on primary:** yes, the METR post. I did not re-read the arXiv PDF.
- "When developers are allowed to use AI tools, they take 19% longer to complete issues—a significant slowdown that goes against developer beliefs and expert forecasts. This gap between perception and reality is striking: developers expected AI to speed them up by 24%, and even after experiencing the slowdown, they still believed AI had sped them up by 20%."

### Follow-up: "We are Changing our Developer Productivity Experiment Design" (2026-02-24)

- **Source:** https://metr.org/blog/2026-02-24-uplift-update/
- **Population:** "We have data from 57 developers, across 143 repos, and 800+ tasks. 10 of these developers are from the original study".
- **Read on primary:** yes.
- "Our early 2025 study found the use of AI causes tasks to take 19% longer, with a confidence interval between +2% and +39%. For the subset of the original developers who participated in the later study, we now estimate a speedup of -18% with a confidence interval between -38% and +9%. Among newly-recruited developers the estimated speedup is -4%, with a confidence interval between -15% and +9%."
- "we believe it is likely that developers are more sped up from AI tools now — in early 2026 — compared to our estimates from early 2025. However, because of the selection effects in our experiment, our data is only very weak evidence for the size of this increase."
- Why the data is weak: "we have observed a significant increase in developers choosing not to participate in the study because they do not wish to work without AI".

**Sign warning.** METR describes the follow-up as "some evidence for speedup". On the same scale where the original was "+19%", "−18%" means less time, not "18% slower". Some secondary write-ups get this backwards. I found no later METR productivity study on the blog index as of 2026-10-31.

**Framing for the Post.** The durable finding is the gap between perception and measurement (expected +24%, believed +20%, measured +19% longer). Do not present the 19% slowdown as the current state; METR itself says it is likely outdated.

## 5. Bainbridge, "Ironies of Automation"

- **Citation:** Lisanne Bainbridge, "Ironies of automation," _Automatica_ 19(6), 775-779, 1983. DOI: https://doi.org/10.1016/0005-1098(83)90046-8 (stable, paywalled).
- **Free full text:** an archived NC State copy, https://web.archive.org/web/20200717054958if_/https://www.ise.ncsu.edu/wp-content/uploads/2017/02/Bainbridge_1983_Automatica.pdf
- **Read on primary:** yes, the archived scan of the published paper.

Quotes:

- Skill decay (p. 775): "Unfortunately, physical skills deteriorate when they are not used, particularly the refinements of gain and timing. This means that a formerly experienced operator who has been monitoring an automated process may now be an inexperienced one."
- Knowledge decay (p. 775): "efficient retrieval of knowledge from long- term memory depends on frequency of use".
- The generational point (p. 776): "There is some concern that the present generation of automated systems, which are monitored by former manual operators, are riding on their skills, which later generations of operators cannot be expected to have."
- Monitoring irony (p. 776): "A more serious irony is that the automatic control system has been put in because it can do the job better than the operator, but yet the operator is being asked to monitor that it is working effectively."
- Vigilance (p. 776): "it is impossible for even a highly motivated human being to maintain effective visual attention towards a source of information on which very little happens, for more than about half an hour."
- Short form (p. 776): "The human monitor has been given an impossible task."

The generational quote is the best fit for the expertise-decay worry. "The human monitor has been given an impossible task" is the best fit for the review bottleneck.

## 6. Gold rush: who sold the picks and shovels

### Samuel Brannan

- **California State Parks, "Gold Rush Prices Worksheet"** (an educator handout): https://www.parks.ca.gov/pages/22922/files/worksheet-goldrushprices.pdf. **Read on primary:** yes.
  - "Most miners only found $10 to $15 worth of gold dust a day. Merchants quickly realized they could get rich by selling supplies at high prices to miners. Sam Brannan, a merchant who built a store next to Sutter's Fort, made more than $2,000 a day selling goods to the miners."
  - "The gold pans that miners needed cost 20 cents before 1849, but soon were sold for $8 each."
- **PBS American Experience, "Samuel Brannan"**: https://www.pbs.org/wgbh/americanexperience/features/goldrush-samuel-brannan/. **Read on primary:** yes.
  - "As he stepped off the ferry, Brannan swung his hat, waved the bottle and shouted, "Gold! Gold! Gold! Gold from the American River!""
  - "Brannan didn't actually dig for gold, but gold swelled his investments to a fortune. His store made enormous profits by selling as much as $5,000 (about $120,000 in 2005 dollars) in goods per day to miners."
  - The coda: "Brannan died on small fruit farm outside San Diego on May 5, 1889, leaving his children but a few dollars apiece."
- The two sources give different daily figures ($2,000+ vs up to $5,000). Pick one and attribute it.
- **UNVERIFIED:** "California's first millionaire" and "$150,000 per month in 1849" appear only in secondary sources and search snippets. I did not find them on a primary page.

### Levi Strauss

- **Levi Strauss & Co. history:** https://www.levistrauss.com/levis-history/. **Read through the fetch tool only.** The site returns "Access Denied" to direct downloads, so check the wording in a browser before quoting.
  - "After working with his brothers in their dry goods wholesale business in New York City, Levi emigrates to Gold Rush San Francisco." / "He opens his own dry goods business to serve the small general stores of the American West."
- **LS&Co. historian Tracey Panek, "The Truth — and Exaggerations — of LS&Co."** (2024-06-11): https://www.levistrauss.com/2024/06/11/truth-and-exaggerations-of-lsco/. **Read through the fetch tool only;** same caveat.
  - Myth: "the show falsely depicted Levi setting up a canvas tent business before stitching up the first pair of Levi's® for miners out of the same canvas."
  - Fact: "he learned his trade from his two half-brothers, who had a dry goods wholesale business in New York, before leaving for San Francisco during the California Gold Rush to set up a dry goods business under his own name. He also arrived in San Francisco in 1853, not 1850. Twenty years later, in 1873, after establishing a successful business, Levi spotted an opportunity and began selling patent riveted work pants."
- **Nuance for the Post.** Levi was a wholesaler supplying the stores that supplied miners: a supplier to the suppliers. The jeans came 20 years later. If the Post says "Levi sold jeans to miners in 1849", the company's own historian contradicts it.

## Recommended for the Post

The strongest and best-verified figures, all read on the primary source:

1. **Faros 2025:** high-AI teams "merge 98% more pull requests, but PR review time increases 91%" (10,000+ developers, 1,255 teams). This is the cleanest single paired figure.
2. **Faros 2026 (Acceleration Whiplash, PDF):** "+33.7% task throughput per developer" against median time in PR review up "441.5%" and median wait for first review up "156.6%" (22,000 developers, 4,000 teams, analysis as of March 2026). Add "31.3% more PRs are being merged without any review". Faros's Q3 2026 update says that rise "has increased to 76.3%."
3. **DORA 2024:** "an estimated 7.2% reduction [in delivery stability] for every 25% increase in AI adoption". Pair it with **DORA 2025**: "AI adoption now improves software delivery throughput ... However, it still increases delivery instability" and the "amplifier" sentence.
4. **Stack Overflow 2026:** 48.0% answered "I trust it when I can easily verify the output", against 6.6% "I trust it for many tasks, including important work decisions" (n = 14,304). This directly supports "verification is the product".
5. **METR 2025:** developers "expected AI to speed them up by 24%" and afterwards "believed AI had sped them up by 20%", but "take 19% longer". Cite it as evidence that felt speed is unreliable, and note METR's February 2026 update.

**Chart idea: "Output up vs review up" (horizontal grouped bars, % change for high-AI-adoption teams, Faros only, two panels by edition):**

| Edition | Output metric | % | Review metric | % |
| --- | --- | --- | --- | --- |
| 2025 (10K devs) | PRs merged | +98 | PR review time | +91 |
| 2025 (10K devs) | Tasks completed | +21 | n/a | n/a |
| 2026 (22K devs) | Task throughput per developer | +33.7 | Median time to first PR review | +156.6 |
| 2026 (22K devs) | PR merge rate per developer | +16.2 | Median time in PR review | +441.5 |

Use two panels or label each pair with its edition, because the samples differ. Set the axis to make clear that 441.5 is a percentage change, not a multiple. The caption should say "Faros AI telemetry; low vs high AI-adoption quarters within each team; correlational."
