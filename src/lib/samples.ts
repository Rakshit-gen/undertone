import type { Goal, Recipient } from "./signals";

/** Starting points that show off different weather. Written to sound like real work messages. */
export const SAMPLES: { name: string; recipient: Recipient; goal: Goal; text: string }[] = [
  {
    name: "The nudge",
    recipient: "colleague",
    goal: "followup",
    text: "Hi Priya,\n\nPer my last email, I'm still waiting on the numbers for Thursday. Not sure if this got lost, but it would be great to actually have them this time.\n\nThanks",
  },
  {
    name: "The no",
    recipient: "manager",
    goal: "decline",
    text: "Hi Tom, thanks for thinking of me for the migration. I can't take it on this sprint without dropping the billing fix, which is due Friday. If it can wait until the 14th, I'd be glad to lead it then.",
  },
  {
    name: "The sorry",
    recipient: "client",
    goal: "apologise",
    text: "So sorry, I'm really sorry about the delay. It's been a crazy week and the team was stretched, so it wasn't really anyone's fault. Sorry again, we'll try to get it to you soon hopefully.",
  },
];
