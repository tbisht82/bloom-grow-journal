export type MonthEntry = {
  month: number;
  title: string;
  weeks: string;
  size: string;
  sizeEmoji: string;
  notes: string;
  milestones: string[];
  appointments: { date: string; label: string }[];
  cravings: string[];
  memories: string;
};

export const months: MonthEntry[] = [
  {
    month: 1,
    title: "The Secret",
    weeks: "Weeks 1–4",
    size: "Poppy seed",
    sizeEmoji: "•",
    notes:
      "The tiniest whisper of you. Two pink lines on a quiet Tuesday morning — we held each other and cried the happy kind of tears.",
    milestones: ["Positive test", "Told each other first", "Started prenatal vitamins"],
    appointments: [{ date: "Week 4", label: "Confirmation with GP" }],
    cravings: ["Cold water with lemon", "Toast, always toast"],
    memories: "We took a walk at dusk and didn't say much. Everything felt bigger.",
  },
  {
    month: 2,
    title: "First Flutter of Feeling",
    weeks: "Weeks 5–8",
    size: "Raspberry",
    sizeEmoji: "🫐",
    notes:
      "Morning sickness arrived like an uninvited guest. Ginger tea became a ritual. Tilak learned to make it just right.",
    milestones: ["First ultrasound", "Heartbeat heard 💓", "Told our parents"],
    appointments: [
      { date: "Week 7", label: "Dating scan" },
      { date: "Week 8", label: "OB intake" },
    ],
    cravings: ["Sour candies", "Watermelon at midnight"],
    memories: "The sound of your heartbeat — like a tiny galloping horse.",
  },
  {
    month: 3,
    title: "The Reveal",
    weeks: "Weeks 9–13",
    size: "Lime",
    sizeEmoji: "🍋",
    notes:
      "Closing the first trimester. Energy is creeping back. We told our closest friends over Sunday brunch.",
    milestones: ["NT scan clear", "Announced to family", "First bump photo"],
    appointments: [{ date: "Week 12", label: "NT scan & bloodwork" }],
    cravings: ["Pickles", "Mango slices with chili"],
    memories: "Framed the ultrasound photo. Placed it on the bookshelf beside our wedding photo.",
  },
  {
    month: 4,
    title: "A Golden Season",
    weeks: "Weeks 14–17",
    size: "Avocado",
    sizeEmoji: "🥑",
    notes:
      "The second trimester glow is real. Skin, hair, and appetite have returned. We started decorating the nursery corner.",
    milestones: ["First maternity clothes", "Started prenatal yoga", "Bump becoming visible"],
    appointments: [{ date: "Week 16", label: "Routine check-up" }],
    cravings: ["Fresh coconut water", "Buttery croissants"],
    memories: "Painted the nursery wall a soft sky blue. It looks like a morning.",
  },
  {
    month: 5,
    title: "First Kicks",
    weeks: "Weeks 18–21",
    size: "Banana",
    sizeEmoji: "🍌",
    notes:
      "We felt you move for the first time — a little flicker like a butterfly saying hello.",
    milestones: ["Anatomy scan", "Learned the gender 💗", "First kick felt by Tilak"],
    appointments: [{ date: "Week 20", label: "Anatomy ultrasound" }],
    cravings: ["Chocolate milkshakes", "Salted popcorn"],
    memories: "We wrote your name down on paper for the first time. It's real.",
  },
  {
    month: 6,
    title: "Growing Together",
    weeks: "Weeks 22–26",
    size: "Papaya",
    sizeEmoji: "🥭",
    notes:
      "Belly is round and proud. We read to you every night — mostly poetry, sometimes cricket scores.",
    milestones: ["Baby shower planning", "Nursery furniture arrived", "Started registry"],
    appointments: [
      { date: "Week 24", label: "Glucose screening" },
      { date: "Week 26", label: "Routine OB" },
    ],
    cravings: ["Idli with coconut chutney", "Cold mango lassi"],
    memories: "Danced slowly in the kitchen. Three of us, swaying.",
  },
  {
    month: 7,
    title: "Almost There",
    weeks: "Weeks 27–30",
    size: "Eggplant",
    sizeEmoji: "🍆",
    notes:
      "Third trimester. Sleep is negotiable. Pillows are non-negotiable. You have hiccups now — we can feel them.",
    milestones: ["Baby shower 🌸", "Hospital tour booked", "Finished the nursery"],
    appointments: [{ date: "Week 28", label: "Tdap vaccine & glucose" }],
    cravings: ["Vanilla ice cream", "Warm dosa"],
    memories: "Family gathered under fairy lights. So much love in one room.",
  },
  {
    month: 8,
    title: "Nesting",
    weeks: "Weeks 31–35",
    size: "Pineapple",
    sizeEmoji: "🍍",
    notes:
      "Packing the hospital bag. Washing tiny clothes. Every folded onesie makes us tear up a little.",
    milestones: ["Hospital bag ready", "Car seat installed", "Birth plan written"],
    appointments: [
      { date: "Week 32", label: "Growth scan" },
      { date: "Week 34", label: "Bi-weekly OB" },
    ],
    cravings: ["Cheese, all kinds", "Iced coffee (decaf, promise)"],
    memories: "We wrote you a letter and sealed it. To be opened on your 18th birthday.",
  },
  {
    month: 9,
    title: "Waiting for You",
    weeks: "Weeks 36–40",
    size: "Watermelon",
    sizeEmoji: "🍉",
    notes:
      "Any day now. The house is quiet and expectant. We've never been more ready — or more tender.",
    milestones: ["Full term 🌟", "Final maternity photos", "Ready to meet you"],
    appointments: [
      { date: "Week 36", label: "Group B strep test" },
      { date: "Weekly", label: "Cervical checks" },
    ],
    cravings: ["Fresh strawberries", "Anything cold"],
    memories: "Whatever comes next, our story truly begins the moment we hear you cry.",
  },
];

export const DUE_DATE = new Date("2026-08-06T00:00:00");
export const PARENTS = { one: "Shodhika", two: "Tilak" };
