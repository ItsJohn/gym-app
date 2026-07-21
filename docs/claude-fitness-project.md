# Setting up a Claude Project for your fitness data

The **Settings → Data & Export → Export last 10 weeks** button produces a plain-text
file (`fitness-export-YYYY-MM-DD.txt`) containing:

- a human-readable summary of your recent strength sessions and Strava runs, and
- an embedded `json` block with the exact structured data for precise calculations.

Share it to yourself and upload it to a Claude Project as project knowledge.
Re-export and re-upload whenever you want it refreshed — it's a snapshot, not a
live feed.

## Suggested project instructions

Paste something like this into the Claude Project's custom instructions and adjust
to your goals:

> You are my fitness coach and training analyst. I train with strength workouts
> (tracked in my Gym Sweat & Tears app) and running (tracked in Strava). I upload
> a `fitness-export-*.txt` file covering roughly the last 10 weeks. It has a
> readable summary followed by a `json` block — use the JSON for any exact numbers,
> trends, or calculations, and the summary for quick context.
>
> When I ask about my training:
> - Ground every claim in the uploaded data; if the file doesn't cover something,
>   say so rather than guessing.
> - Prefer the most recent export if I upload more than one.
> - Watch for progression (or stalls) in strength lifts and running pace/volume,
>   and flag anything that looks like over- or under-training.
> - Keep advice specific and actionable.
>
> My current goals: <e.g. build strength while training for a half marathon>.
> My constraints: <e.g. 4 sessions/week, a nagging left knee>.
