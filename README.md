# Pre-session readiness check - Strategic Realty Services

Six questions, ninety seconds, on a phone. Same architecture as the PBSO feedback app: static HTML on GitHub Pages, Google Apps Script writing to a Google Sheet. The difference is this one runs before the session, it is not anonymous, and there is no live TV dashboard. You pull a readout when you want it.

Three files:

- `readiness.html` - what Glen's team fills out
- `readiness-results.html` - your readout, key-gated
- `Code.gs` - the Apps Script backend

## What it asks

1. Name and role (broker/partner, sales or leasing agent, property manager, accounting, admin)
2. Score yourself with AI, 1 to 10
3. Which tools have you actually used
4. Do you have a paid account
5. What is one thing you want to walk out able to do

On submit they get a full-screen page with your two pre-work asks: use Claude if you do not already have a favorite, and pay the $20.

## Setup, about 5 minutes

### 1. New sheet and script

Use a **new** Google Sheet, not the PBSO one.

1. Create a Google Sheet, name it "Strategic Realty Readiness".
2. Extensions > Apps Script.
3. Delete the starter code, paste in all of `Code.gs`, and save.
4. `READ_KEY` at the top is already set. It is the password for the readout page, nothing else. The form never needs it, only you do when you open the readout. Change it here any time; whatever this says is what you type on the readout page.
5. In the function dropdown pick `setupHeaders`, click Run, authorize when Google prompts.

### 2. Deploy

1. Deploy > New deployment > gear icon > Web app.
2. Execute as: **Me**. Who has access: **Anyone**.
3. Deploy, authorize, copy the Web app URL ending in `/exec`.

If you ever change `Code.gs`, edit the SAME deployment as a New version. A new deployment mints a new URL and breaks both HTML files.

### 3. Wire the URL in

Paste the same `/exec` URL into the `WEB_APP_URL` line near the top of the script block in **both** `readiness.html` and `readiness-results.html`.

### 4. Host

This gets its **own repo**, not the `feedback` repo. That repo already has a `Code.gs` and a `README.md` for the PBSO app, and copying these in on top of them would overwrite a live, working backend. A separate repo also keeps a client's staff names out of a repo built for a different client.

1. Create a new GitHub repo named `srs-readiness`.
2. Push these four files to it.
3. Settings > Pages > Source: deploy from branch `main`, folder `/ (root)`.

Pages URLs become, and note the `.html` is required:

- Form: `https://ajfas1-netizen.github.io/srs-readiness/readiness.html`
- Readout: `https://ajfas1-netizen.github.io/srs-readiness/readiness-results.html`

Open the readout, type your read key, hit Load results. It remembers the key in that browser.

### 5. Test it yourself first

Fill the form out once as yourself before it goes to Glen. Confirm the row lands in the sheet and the readout renders. Then delete your test row.

## The readout

- Response count, average self-score
- Core audience count (scored 5 or lower) vs already-fluent count (6 or higher)
- Paid accounts vs no account at all, which is your pre-work gap in one number
- Full roster sorted lowest score first
- Tool usage bars
- A plain-text summary with a Copy button, including every verbatim answer to "what do you want to walk out able to do" and averages by role

## Privacy note

This has a client's staff names and self-ratings on it, and GitHub Pages is public. That is why the readout is key-gated: without the right key, `doGet` returns a bare count and nothing else. The form itself needs no key.

---

## Email for Glen to forward

Subject: Quick 90-second form before the AI training

> Team,
>
> Before we lock the date for the AI training, AJ needs a quick read on where everyone is today so he can build the day around us instead of running a generic class.
>
> Please fill this out by [DAY, DATE]. It is six questions and takes about ninety seconds on your phone.
>
> [LINK]
>
> There is no wrong answer and nothing to study for. Most people rate themselves around a 3, and that is exactly who this training is built for.
>
> Glen

## Email you send Glen with the link

> Glen,
>
> Good talking today. Here is the survey we discussed. Six questions, ninety seconds on a phone, and I wrote the forwarding note for you so you just have to paste and send.
>
> [LINK]
>
> Give your team through [DAY] to fill it out. Once I have it back I will tell you two things: who belongs in the room, and whether it should be one day for everyone or split across office and sales. That should make your staffing call easy.
>
> One thing worth flagging so it does not surprise anyone: everyone in the room needs a laptop and a paid AI account, $20 a month. The form tells them that when they submit. It is the only prerequisite and it is the difference between people practicing all day and people hitting a wall by lunch.
>
> Send me those dates whenever you have them. The workbooks are custom and I need two to three weeks lead time to get them printed.
>
> AJ
