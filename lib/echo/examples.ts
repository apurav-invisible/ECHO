export interface ExampleCategory { id: string; label: string; examples: string[] }
export interface Demo { id: string; title: string; text: string }

export const CATEGORIES: ExampleCategory[] = [
  { id: "relationships", label: "Relationships", examples: ["Fine, whatever you want.", "I don't care anymore.", "Do you even care?", "It's okay, don't worry about it."] },
  { id: "work", label: "Work and teamwork", examples: ["I feel like my efforts go unnoticed.", "I can't handle everything right now.", "Nobody listens when I suggest changes.", "That meeting was really frustrating."] },
  { id: "friends", label: "Friends and family", examples: ["I'm tired of always being the one who reaches out.", "I wasn't invited again.", "Sorry, I shouldn't have said that.", "I don't know how to explain it."] },
  { id: "boundaries", label: "Boundaries", examples: ["I need you to respect my time.", "Leave me alone for a while.", "Please stop asking me about this.", "I'm not okay with that."] },
  { id: "everyday", label: "Everyday", examples: ["Hi.", "What time is the meeting?", "The meeting starts at 3 PM.", "I'm not sure what I want."] },
];

export const DEMOS: Demo[] = [
  { id: "unheard", title: "Feeling unheard", text: "Nobody listens when I try to explain myself." },
  { id: "effort", title: "Unequal effort", text: "I'm exhausted from always being the one who tries." },
  { id: "space", title: "Needing space", text: "I don't want to talk about this right now." },
];
