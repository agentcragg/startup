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
   points — the user explicitly rejected mixing the two.
2. **No negative points, ever.** Bad days lose bonuses, never subtract.
   Punishment maths creates avoidance; avoidance kills logging.
3. **Drink days and takeaways are reports, not sins.** Neutral-to-red styling
   is fine, but no shaming copy.
4. **A "big drink day" = 3+ drinks.** User's own definition.
5. **No flavour copy / slogans / taglines.** The user hates them ("Points are
   the contract" got binned). Plain functional language only.
6. **No employer branding.** Earlier version used BIFA blue (#2B32C8) because
   the user works there; he hated it. Current palette: dark neutral
   (#141414 bg), one green accent (#4ade80), red (#f87171) for drink/finale.
7. **Past days editable via the calendar grid; future days locked.**
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

## Testing

`node test.js` extracts the Logic module from index.html and runs ~29
assertions. Keep it passing; extend it when scoring logic changes. The
UI layer is untested — logic must stay in the `Logic` module so this
keeps working.

## Backlog (agreed critique, in priority order)

1. **Restructure hierarchy.** Front page = today's taps + ONE glanceable
   status (a half-second "you're fine / you're slipping" read, not digits).
   Calendar, checkpoint detail, stats, rules move to a second view/tab or
   behind progressive disclosure.
2. **More visual, fewer numbers.** The app currently communicates almost
   entirely in tabular digits. User wants it to "say more" visually.
3. **Kill redundancy.** Weekly target, checkpoint bar, campaign total are
   three framings of "am I on pace" — collapse.
4. **Feedback moments.** Hitting the weekly target, earning a medal, banking
   a bonus should feel like something. Motivation layer candidates: reward
   ladder per checkpoint (user still owes the list of rewards + grand
   prize), milestone moments, possibly the user's current + goal photos.
5. **Rules card** → collapse or move to an info view.
6. **Calendar as story, not audit.** 92 grey squares reads as admin.

## Style of collaboration the user wants

Discuss before rebuilding when the change is structural. Be honest and
direct about flaws. Simple and visual beats clever. He iterates in short
bursts and will say "I don't hate it" when he means "good, continue".
