# Slopaoke Campaign — habit tracker

A single-file web app (index.html) tracking Matt's 92-day fat-loss campaign,
1 Aug – 31 Oct 2026, ending at a live gig (Slopaoke). Hosted on GitHub Pages,
used exclusively on his phone, added to home screen.

## The user, as a client

- Excellent at abstract plans, poor at follow-through. The system exists to
  convert intention into tiny binary daily actions.
- Motivated by game mechanics, scores, and milestones (builds elaborate games
  for friends). But clutter and equal-weight information overwhelm him.
- Logs food conversationally with Claude in a separate chat thread (calorie/
  protein estimates). This app is only the scoreboard, not the food log.
- Will realistically log same evening, or next morning after drinking.
  **Next-morning backfill is a designed-for behaviour, not cheating.**

## Non-negotiable design decisions (agreed, do not silently change)

1. **Two separate tracks.** Diet discipline = points. Gym = its own plain
   session counter (target 2/week, 26 total). Gym is NEVER converted to
   points — the user explicitly rejected mixing the two, and re-confirmed
   (19 Jul 2026) after being tempted: the answer to "gym feels
   under-rewarded" is ceremony in its own currency (see gym strip), never
   points. Gym milestones MAY gate rewards/grand prize (pending his list).
2. **No negative points, ever.** Bad days lose bonuses, never subtract.
   Punishment maths creates avoidance; avoidance kills logging.
3. **Drink days and takeaways are reports, not sins.** Neutral-to-red styling
   is fine, but no shaming copy.
4. **A "big drink day" = 3+ drinks.** User's own definition.
5. **No flavour copy / slogans / taglines.** The user hates them ("Points are
   the contract" got binned). Plain functional language only. ONE
   exception (his call, 19 Jul 2026): the rules page opens with his own
   statement of why, near-verbatim in his words, set in serif italic.
   Never invent or "improve" motivational copy beyond that.
6. **No employer branding.** Earlier version used BIFA blue (#2B32C8) because
   the user works there; he hated it. Design language v2 (agreed 19 Jul
   2026 after a reference round — Tigris museum site, SYN diagnostic
   concept, YSL labels, editorial portfolio lists; the user called the v1
   hi-fi panels "too skeuomorphic"): **print, don't box.** Near-black
   warm ground #121110, cream ink #e8e2d4, NO panels/bezels — open
   composition, hairlines only where meaning demands. Type: Georgia serif
   mixed-case for the big tappable actions ("Logged food" 24px), Helvetica
   letterspaced caps for labels, mono for figures/annotations. **Colour is
   semantic, never decorative:** cream/warm = diet track + its glow;
   cobalt #3b4eff = gym ONLY (his call — "it's not BIFA blue"); red
   #e0483e = warnings (drink), finale, target tick, rescue dot, and the
   N° in the serial tag. Green is RETIRED entirely. The tilted cream
   serial tag (N° day/92) is the one playful artefact. Solid-fill = on,
   thin outline = off; the near-silent off state is deliberate (a
   feature, per user). Cobalt slab loudness is deliberate (gym presence,
   per user — overruled my hierarchy objection, 19 Jul).
7. **Past days editable; future days locked.** Scrub the campaign trace
   (press–drag–release, floating date readout; clamps at today) to open a
   past day in the Today editor. The day card's bottom button is
   "Yesterday" when viewing today (the common backfill case) and "Back to
   today" when viewing any other day.
8. **Storage is dual-mode:** window.storage (Claude artifact) if present,
   else localStorage. Key: `slopaoke-campaign-v2`. Single JSON blob.

## Scoring spec (implemented in the `Logic` module, tested in test.js)

- Day record: `{l, p, d, g, t}` = logged food, protein ≥130g, big-drink day,
  gym session, takeaway count.
- Daily points: `l` +1, `p` +1. Max 2/day.
- Weeks are Mon–Sun. Weekly bonuses land only when the week has ENDED and
  only if the week had any logging (core > 0 — prevents free points for
  empty weeks; this was a real bug once):
  - ≤2 big-drink days → +3
  - ≤1 takeaway → +3
- Max 20/week. Perfect campaign ≈ 268. **Win line: 182 points.**
- Weekly bonuses credit to the date range containing the week's end; the
  final partial week credits to the campaign's last range.
- "Pending" bonus = what the current (unfinished) week is on track for;
  shown as translucent bar extension.
- Hero number = points still needed this week:
  `target = min(20, ceil((182 − points before this week) / weeks remaining))`.
  Recalculates live; good weeks shrink future asks, bad weeks grow them.
- Checkpoints (fortnights, diet points only): ends 14 Aug, 31 Aug, 14 Sep,
  30 Sep, 14 Oct, 31 Oct. Period max = round(40 × days/14). Medals at
  bronze 60% / silver 75% / gold 90%.
- Log streak = consecutive days with `l` (food logged); an unlogged *today*
  doesn't break it.
- `gymWeekStreak` = consecutive weeks with 2+ gym sessions; the current
  week joins the count at 2 and never breaks it before then.
- `paceStatus` = the front-page read: `hit` (week target cleared),
  `ontrack`, or `behind`. Straight-line pace over the week's in-campaign
  days, counting earned + pending; the current day doesn't count against
  pace until it's over (same stance as the streak).

## App structure (post backlog item 1)

Three views with a fixed bottom tab bar (Today / Progress / Rules;
active tab = underline, so the glowing dot stays unique to the lamp).
All in-app navigation goes through the History API — view switches,
opening a past day, and both overlays push history entries; overlay
Close buttons and video-ended call history.back(). This makes the
Android back gesture unwind the app instead of exiting it (user's
explicit requirement). The >30-min staleness snap does replaceState.
- **Today** (default): the **open dial** — unboxed VU meter (needle =
  week points, 0–20; faint cream ghost = earned+pending; red tick =
  target; needles clipped at a ground hairline so they grow from a
  baseline) with the centred status line beneath (lamp dot + word +
  mono digits). Backlight glow = light pooling on the page (no box),
  blooms on target-hit celebration, holds while target held, spent by
  Monday banking. Then the day section: two **big serif block buttons**
  (Logged food / Protein — solid cream fill + red mono "+1" when on,
  thin outline when off), the **cobalt gym slab** (serif "Gym" at the
  same 24px + day-dot for the edited day; week LEDs + lesser third dot
  below; odometer wheels + /26 + 26-lamp and streak at right; pressing
  the slab logs the session — sessions never points), then mini mono
  buttons: "Big drink · n/2", "Takeaway · n/1" (weekly budgets live ON
  the buttons; the old budget note line is gone), "● Rescue".
  "← Yesterday" sits under the serif date in the day header. Gym
  moments unchanged (2/2 pulse, 3rd-dot pulse, wheel pulses at
  10/20/26).
  The per-day points digit was dropped (redundancy — the needle is the
  feedback). The budget line covers drinks/takeaways only — gym left it
  for the strip.
- **Progress**: the **campaign pen trace**
  (replaced both the checkpoint bar card AND the calendar grid, 18 Jul
  2026): one monotone-cubic cream ink line over 92 days of ruled chart
  paper — daily points softened by a 1-2-1 kernel so a lone missed day
  dips without slamming to the floor; margin dots (gym = cobalt, drink =
  red); checkpoint hairlines with medal dots (lit cream at ≥bronze); pen
  dot + hairline = today; red tick = finale; one-line current-checkpoint
  status underneath (mono caps). Then unboxed stats figures (Campaign /
  Log streak) and photos. Everything printed on the page, no cards.
- **Rules** (own tab, 19 Jul 2026 — was briefly a link under Progress):
  the user's why-statement, then the spec sheet.
- Redundancy trims (18 Jul 2026): "This week" panel deleted (the meter
  says it all), "Gym wk" tile deleted, day-card budget line shows only
  once something is reported that week (clean week = no line). The
  budget line is the ONE home for weekly allowances.
- Staleness guard: after >30 min backgrounded, the app snaps the editor
  back to today (prevents evening taps landing on a morning-backfilled
  yesterday). Short gaps keep the editing state.

## Photos (on-device only — NEVER in the repo)

Goal photo + monthly mirror shots live in IndexedDB (`slopaoke-photos`)
on the phone, added via file input from the camera roll, compressed to
≤1280px JPEG. The repo/site are public, so photos must never be
committed or uploaded anywhere. No sync: clearing site data loses them
(originals remain in camera roll). Goal slot is fixed; dated photos
append; viewer overlay has delete.

## Rescue videos

Motivational clips the user saved from TikTok, for the wobble moment
(core need is *rescue*, not reward — his call). They play full-screen
INSIDE the app (`videos/*.mp4` + `VIDEOS` list in index.html, random
pick, auto-close on end). **Never link out to TikTok** — that ends in
doomscrolling. Clips stream from network (excluded from the service
worker: cached full responses break iOS Range requests), so rescue
needs signal for now. Repo is public — clips are
saved from other creators, user is fine with that. Pages serves with
a 10-minute HTTP cache, so replacing a clip's content needs a new URL
(new filename, or bump the `?v=` in VIDEOS) or phones play the stale
copy.

## Context the app doesn't show but the plan assumes

- ~2,200 kcal/day, ~130–140g protein. User is 5'10", start ~85kg; goal is
  visual (photos/clothes), not a scale number.
- Booze allowance: 2 big-drink days/week. Takeaway allowance: 1/week,
  ideally scheduled for the morning-after (aligning indulgence with
  predictable weakness).
- Monthly weigh-in + mirror photo on the 1st (calendar reminders exist).
  Weekly Sunday 8pm check-in with Claude in chat.
- WFH days were considered as a bonus mechanic and **deliberately parked**
  ("a bit tricky"). Don't reintroduce without asking.

## Hosting & deploy

- Live at https://agentcragg.github.io/startup/ (GitHub Pages, serves the
  `gh-pages` branch). Deploy = push to `main`: the pages.yml workflow runs
  test.js then force-pushes `main` → `gh-pages`. Never edit `gh-pages`
  directly. (Pages API enablement failed for the workflow token, hence the
  branch route.)
- Offline PWA: sw.js caches the shell (stale-while-revalidate, so a deploy
  appears on the *second* visit after it). manifest.json + icon-*.png give
  the home-screen install its name/icon. If sw.js's asset list changes,
  bump the CACHE version in sw.js.

## Testing

`node test.js` extracts the Logic module from index.html and runs ~29
assertions. Keep it passing; extend it when scoring logic changes. The
UI layer is untested — logic must stay in the `Logic` module so this
keeps working.

## Backlog (agreed critique, in priority order)

1. ~~**Restructure hierarchy.**~~ DONE — Today/Progress split, see "App
   structure" above. Open question for the user: "Behind pace" renders in
   red; flip to neutral grey if it reads as punishment.
2. ~~**More visual, fewer numbers.**~~ DONE (18 Jul 2026) — hi-fi panel
   reskin: VU meter, lamp, LED buttons, pen trace.
3. ~~**Kill redundancy.**~~ DONE — checkpoint bar card, per-day points
   digit, "This week" panel and "Gym wk" tile all deleted; budget line
   contextual. Meter readout digits kept deliberately (labelled dials).
4. **Feedback moments.** MOSTLY DONE. Rescue videos shipped (see "Rescue
   videos"). Moments layer shipped (19 Jul 2026), all one-time-witnessed
   via localStorage key `slopaoke-seen-v1`: target-hit needle power-sweep
   (fires on the crossing press only), medal LED pulse on first Progress
   view after earning, Monday banking ceremony (sweep + "+N banked last
   week" readout for 3.5s, keyed per week). REMAINING: the reward ladder —
   one reward per checkpoint unlocked at bronze (agreed: bronze, not
   higher — unreachable rewards are punishment), grand prize at 182,
   possibly sealed-until-unlocked. Blocked on the user's list.
5. ~~**Rules card**~~ DONE — own bottom tab. Copy: the user's why-statement (serif italic
   preamble), then a spec sheet (WIN / DAILY / REPORTING / WEEKLY BONUS /
   GYM / CHECKPOINTS) in plain sentences — includes the win line and the
   empty-week-no-bonus rule, which the old card omitted.
6. ~~**Calendar as story, not audit.**~~ DONE (18 Jul 2026) — the pen
   trace ("trace but less spiky" was the agreed direction; user rejected
   the bar/sample version as too modern).

## Style of collaboration the user wants

Discuss before rebuilding when the change is structural. Be honest and
direct about flaws. Simple and visual beats clever. He iterates in short
bursts and will say "I don't hate it" when he means "good, continue".
