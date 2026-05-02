export type PassageEntry = {
  title: string;
  author: string;
  source: string;
  content: string;
};

// All passages target ~53-88 words (15-25s at average typing speed).
// All are public domain or short fair-use quotes.

const CLASSIC_LITERATURE: PassageEntry[] = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    source: "Chapter 1",
    content:
      "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since. Whenever you feel like criticizing anyone, he told me, just remember that all the people in this world haven't had the advantages that you've had.",
  },
  {
    title: "1984",
    author: "George Orwell",
    source: "Part One",
    content:
      "It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him.",
  },
  {
    title: "Moby Dick",
    author: "Herman Melville",
    source: "Chapter 1",
    content:
      "Call me Ishmael. Some years ago, never mind how long precisely, having little money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation.",
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    source: "Chapter 1",
    content:
      "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families.",
  },
  {
    title: "A Tale of Two Cities",
    author: "Charles Dickens",
    source: "Book the First",
    content:
      "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair.",
  },
  {
    title: "Anna Karenina",
    author: "Leo Tolstoy",
    source: "Part One",
    content:
      "All happy families are alike; each unhappy family is unhappy in its own way. Everything was in confusion in the Oblonskys' house. The wife had discovered that the husband was carrying on an intrigue with a French girl, who had been a governess in their family, and she had announced to her husband that she could not go on living in the same house with him.",
  },
  {
    title: "The Metamorphosis",
    author: "Franz Kafka",
    source: "Part One",
    content:
      "One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment.",
  },
  {
    title: "The Adventures of Huckleberry Finn",
    author: "Mark Twain",
    source: "Chapter 1",
    content:
      "You don't know about me without you have read a book by the name of The Adventures of Tom Sawyer; but that ain't no matter. That book was made by Mr. Mark Twain, and he told the truth, mainly. There was things which he stretched, but mainly he told the truth. That is nothing.",
  },
  {
    title: "To the Lighthouse",
    author: "Virginia Woolf",
    source: "Part One",
    content:
      "Yes, of course, if it's fine tomorrow, said Mrs. Ramsay. But you'll have to be up with the lark, she added. To her son these words conveyed an extraordinary joy, as if it were settled, the expedition were bound to take place, and the wonder to which he had looked forward, for years and years it seemed, was within touch.",
  },
  {
    title: "The Sun Also Rises",
    author: "Ernest Hemingway",
    source: "Chapter 3",
    content:
      "It was a warm spring night and I sat at a table on the terrace of the Napolitain after Robert had gone. The evening crowd was going by and I watched it. There were the slow, heavy vehicles of the street and the people crossing between them, and I watched a pretty girl go by.",
  },
];

const POETRY: PassageEntry[] = [
  {
    title: "The Road Not Taken",
    author: "Robert Frost",
    source: "Mountain Interval, 1916",
    content:
      "Two roads diverged in a yellow wood, and sorry I could not travel both and be one traveler, long I stood and looked down one as far as I could to where it bent in the undergrowth; then took the other, as just as fair, and having perhaps the better claim, because it was grassy and wanted wear.",
  },
  {
    title: "If—",
    author: "Rudyard Kipling",
    source: "Rewards and Fairies, 1910",
    content:
      "If you can keep your head when all about you are losing theirs and blaming it on you, if you can trust yourself when all men doubt you, but make allowance for their doubting too; if you can wait and not be tired by waiting, or being lied about, don't deal in lies.",
  },
  {
    title: "The Love Song of J. Alfred Prufrock",
    author: "T.S. Eliot",
    source: "Prufrock and Other Observations, 1917",
    content:
      "Let us go then, you and I, when the evening is spread out against the sky like a patient etherized upon a table; let us go, through certain half-deserted streets, the muttering retreats of restless nights in one-night cheap hotels and sawdust restaurants with oyster-shells.",
  },
  {
    title: "Ozymandias",
    author: "Percy Bysshe Shelley",
    source: "The Examiner, 1818",
    content:
      "I met a traveller from an antique land, who said: two vast and trunkless legs of stone stand in the desert. Near them, on the sand, half sunk, a shattered visage lies, whose frown, and wrinkled lip, and sneer of cold command, tell that its sculptor well those passions read which yet survive.",
  },
  {
    title: "Stopping by Woods on a Snowy Evening",
    author: "Robert Frost",
    source: "New Hampshire, 1923",
    content:
      "Whose woods these are I think I know. His house is in the village though; he will not see me stopping here to watch his woods fill up with snow. My little horse must think it queer to stop without a farmhouse near between the woods and frozen lake the darkest evening of the year.",
  },
  {
    title: "Do Not Go Gentle into That Good Night",
    author: "Dylan Thomas",
    source: "In Country Sleep, 1952",
    content:
      "Do not go gentle into that good night, old age should burn and rave at close of day; rage, rage against the dying of the light. Though wise men at their end know dark is right, because their words had forked no lightning they do not go gentle into that good night.",
  },
  {
    title: "The Waste Land",
    author: "T.S. Eliot",
    source: "1922",
    content:
      "April is the cruellest month, breeding lilacs out of the dead land, mixing memory and desire, stirring dull roots with spring rain. Winter kept us warm, covering earth in forgetful snow, feeding a little life with dried tubers. Summer surprised us, coming over the Starnbergersee with a shower of rain.",
  },
  {
    title: "Sonnet 18",
    author: "William Shakespeare",
    source: "Sonnets, 1609",
    content:
      "Shall I compare thee to a summer's day? Thou art more lovely and more temperate: rough winds do shake the darling buds of May, and summer's lease hath all too short a date: sometime too hot the eye of heaven shines, and often is his gold complexion dimm'd.",
  },
  {
    title: "I Carry Your Heart With Me",
    author: "E.E. Cummings",
    source: "Complete Poems, 1952",
    content:
      "I carry your heart with me, I carry it in my heart. I am never without it anywhere I go you go, my dear; and whatever is done by only me is your doing, my darling. I fear no fate, for you are my fate, my sweet. I want no world, for beautiful you are my world.",
  },
  {
    title: "Song of Myself",
    author: "Walt Whitman",
    source: "Leaves of Grass, 1855",
    content:
      "I celebrate myself, and sing myself, and what I assume you shall assume, for every atom belonging to me as good belongs to you. I loafe and invite my soul, I lean and loafe at my ease observing a spear of summer grass. My tongue, every atom of my blood, formed from this soil, this air.",
  },
];

const SPEECHES: PassageEntry[] = [
  {
    title: "I Have a Dream",
    author: "Martin Luther King Jr.",
    source: "March on Washington, 1963",
    content:
      "I have a dream that one day this nation will rise up and live out the true meaning of its creed: we hold these truths to be self-evident, that all men are created equal. I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin.",
  },
  {
    title: "The Gettysburg Address",
    author: "Abraham Lincoln",
    source: "Soldiers' National Cemetery, 1863",
    content:
      "Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal. Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated, can long endure.",
  },
  {
    title: "We Shall Fight on the Beaches",
    author: "Winston Churchill",
    source: "House of Commons, 1940",
    content:
      "We shall go on to the end. We shall fight in France, we shall fight on the seas and oceans, we shall fight with growing confidence and growing strength in the air, we shall defend our island, whatever the cost may be. We shall fight on the beaches, we shall fight on the landing grounds.",
  },
  {
    title: "Inaugural Address",
    author: "John F. Kennedy",
    source: "Washington D.C., 1961",
    content:
      "Let every nation know, whether it wishes us well or ill, that we shall pay any price, bear any burden, meet any hardship, support any friend, oppose any foe, in order to assure the survival and the success of liberty. This much we pledge, and more.",
  },
  {
    title: "Stanford Commencement Address",
    author: "Steve Jobs",
    source: "Stanford University, 2005",
    content:
      "Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma, which is living with the results of other people's thinking. Don't let the noise of others' opinions drown out your own inner voice. And most important, have the courage to follow your heart and intuition.",
  },
  {
    title: "Blood, Toil, Tears and Sweat",
    author: "Winston Churchill",
    source: "House of Commons, 1940",
    content:
      "You ask, what is our policy? I can say: it is to wage war, by sea, land and air, with all our might and with all the strength that God can give us; to wage war against a monstrous tyranny, never surpassed in the dark, lamentable catalogue of human crime.",
  },
  {
    title: "Ain't I a Woman",
    author: "Sojourner Truth",
    source: "Women's Rights Convention, 1851",
    content:
      "That man over there says that women need to be helped into carriages, and lifted over ditches, and to have the best place everywhere. Nobody ever helps me into carriages, or over mud-puddles, or gives me any best place! And ain't I a woman? Look at me! Look at my arm.",
  },
  {
    title: "The Man in the Arena",
    author: "Theodore Roosevelt",
    source: "Sorbonne, Paris, 1910",
    content:
      "It is not the critic who counts; not the man who points out how the strong man stumbles, or where the doer of deeds could have done them better. The credit belongs to the man who is actually in the arena, whose face is marred by dust and sweat and blood.",
  },
  {
    title: "A Chance for Peace",
    author: "Dwight D. Eisenhower",
    source: "American Society of Newspaper Editors, 1953",
    content:
      "Every gun that is made, every warship launched, every rocket fired signifies, in the final sense, a theft from those who hunger and are not fed, those who are cold and are not clothed. This world in arms is not spending money alone. It is spending the sweat of its laborers, the genius of its scientists.",
  },
  {
    title: "First Inaugural Address",
    author: "Franklin D. Roosevelt",
    source: "Washington D.C., 1933",
    content:
      "This is a day of national consecration, and I am certain that my fellow Americans expect that on my induction into the Presidency I will address them with a candor and a decision which the present situation of our people impels. This is preeminently the time to speak the truth, the whole truth, frankly and boldly.",
  },
];

const FILM: PassageEntry[] = [
  {
    title: "The Shawshank Redemption",
    author: "Frank Darabont",
    source: "1994",
    content:
      "I have to remind myself that some birds aren't meant to be caged. Their feathers are just too bright. And when they fly away, the part of you that knows it was a sin to lock them up does rejoice, but still, the place you live in is that much more drab and empty that they're gone.",
  },
  {
    title: "Good Will Hunting",
    author: "Matt Damon & Ben Affleck",
    source: "1997",
    content:
      "You're not perfect, sport, and let me save you the suspense: this girl you've met, she's not perfect either. But the question is whether or not you're perfect for each other. That's the whole deal. That's what intimacy is all about. You can know everything about a person and still be surprised.",
  },
  {
    title: "Dead Poets Society",
    author: "Tom Schulman",
    source: "1989",
    content:
      "We don't read and write poetry because it's cute. We read and write poetry because we are members of the human race. And the human race is filled with passion. And medicine, law, business, engineering, these are noble pursuits and necessary to sustain life. But poetry, beauty, romance, love, these are what we stay alive for.",
  },
  {
    title: "Interstellar",
    author: "Christopher Nolan",
    source: "2014",
    content:
      "We've always defined ourselves by the ability to overcome the impossible. And we count these moments. These moments when we dare to aim higher, to break barriers, to reach for the stars, to make the unknown known. We count these moments as our proudest achievements, but we lost all that.",
  },
  {
    title: "Apocalypse Now",
    author: "John Milius & Francis Ford Coppola",
    source: "1979",
    content:
      "I love the smell of napalm in the morning. You know, one time we had a hill bombed for twelve hours. When it was all over I walked up. We didn't find one of them, not one stinking body. The smell, you know that gasoline smell, the whole hill. Smelled like victory.",
  },
  {
    title: "The Dark Knight",
    author: "Christopher Nolan",
    source: "2008",
    content:
      "You either die a hero, or you live long enough to see yourself become the villain. I can do those things because I'm not a hero, not like Dent. I killed those people. That's what I can be. I can be whatever Gotham needs me to be.",
  },
  {
    title: "Schindler's List",
    author: "Steven Zaillian",
    source: "1993",
    content:
      "Whoever saves one life, saves the world entire. I could have got more, I could have got more, I don't know, I could have got more. I threw away so much money, you have no idea. If I'd just, I could have got more, I don't know, if I'd just, I could have got more.",
  },
  {
    title: "Gladiator",
    author: "David Franzoni",
    source: "2000",
    content:
      "My name is Maximus Decimus Meridius, commander of the Armies of the North, General of the Felix Legions, loyal servant to the true emperor, Marcus Aurelius. Father to a murdered son, husband to a murdered wife. And I will have my vengeance, in this life or the next.",
  },
  {
    title: "Good Will Hunting",
    author: "Matt Damon & Ben Affleck",
    source: "1997 — Sean's monologue",
    content:
      "So if I asked you about art, you'd probably give me the skinny on every art book ever written. Michelangelo, you know a lot about him. Life's work, political aspirations, him and the Pope, sexual orientations, the whole works, right? But I'll bet you can't tell me what it smells like in the Sistine Chapel.",
  },
  {
    title: "Moneyball",
    author: "Aaron Sorkin & Steven Zaillian",
    source: "2011",
    content:
      "It's hard not to be romantic about baseball. This game, the consistency of it. The reason baseball matters is the day you realize you love it more than anything else. And I think you do. I think you love the game more than you hate the Yankees.",
  },
];

const PHILOSOPHY: PassageEntry[] = [
  {
    title: "Meditations",
    author: "Marcus Aurelius",
    source: "Book II",
    content:
      "You have power over your mind, not outside events. Realize this, and you will find strength. The impediment to action advances action. What stands in the way becomes the way. Our actions may be impeded, but there can be no impeding our intentions or dispositions. The mind adapts and converts obstacles into opportunities.",
  },
  {
    title: "Thus Spoke Zarathustra",
    author: "Friedrich Nietzsche",
    source: "Prologue",
    content:
      "Man is a rope stretched between the animal and the Superman, a rope over an abyss. A dangerous crossing, a dangerous wayfaring, a dangerous looking-back, a dangerous trembling and halting. What is great in man is that he is a bridge and not a goal; what is lovable in man is that he is a crossing over and a going down.",
  },
  {
    title: "Meditations",
    author: "Marcus Aurelius",
    source: "Book IV",
    content:
      "The happiness of your life depends upon the quality of your thoughts: therefore, guard accordingly, and take care that you entertain no notions unsuitable to virtue and reasonable nature. Begin the morning by saying to yourself, I shall meet with the busy-body, the ungrateful, arrogant, deceitful, envious, unsocial.",
  },
  {
    title: "Letters from a Stoic",
    author: "Seneca",
    source: "Letter I",
    content:
      "Ita fac, mi Lucili: vindica te tibi. Lay claim to yourself. Gather up and save the time which till lately has been forced from you, or filched away, or has merely slipped from your hands. Make yourself believe the truth of my words: that certain moments are torn from us, that some are gently removed, and that others glide beyond our reach.",
  },
  {
    title: "The Republic",
    author: "Plato",
    source: "Book VII",
    content:
      "Behold human beings living in an underground den, which has a mouth open towards the light. Here they have been from their childhood, and have their legs and necks chained so that they cannot move, and can only see before them. Above and behind them a fire is blazing at a distance.",
  },
  {
    title: "Nicomachean Ethics",
    author: "Aristotle",
    source: "Book I",
    content:
      "Every art and every inquiry, and similarly every action and pursuit, is thought to aim at some good; and for this reason the good has rightly been declared to be that at which all things aim. But a certain difference is found among ends; some are activities, others are products apart from the activities that produce them.",
  },
  {
    title: "The Myth of Sisyphus",
    author: "Albert Camus",
    source: "1942",
    content:
      "There is but one truly serious philosophical problem, and that is suicide. Judging whether life is or is not worth living amounts to answering the fundamental question of philosophy. All the rest comes afterwards. One must imagine Sisyphus happy. The struggle itself toward the heights is enough to fill a man's heart.",
  },
  {
    title: "Beyond Good and Evil",
    author: "Friedrich Nietzsche",
    source: "Part Four",
    content:
      "He who fights with monsters should look to it that he himself does not become a monster. And if you gaze long into an abyss, the abyss also gazes into you. The thought of suicide is a great consolation; by means of it one gets through many a dark night.",
  },
  {
    title: "Walden",
    author: "Henry David Thoreau",
    source: "Where I Lived, and What I Lived For",
    content:
      "I went to the woods because I wished to live deliberately, to front only the essential facts of life, and see if I could not learn what it had to teach, and not, when I came to die, discover that I had not lived. I did not wish to live what was not life.",
  },
  {
    title: "The Social Contract",
    author: "Jean-Jacques Rousseau",
    source: "Book I, Chapter 1",
    content:
      "Man is born free, and everywhere he is in chains. One thinks himself the master of others, and still remains a greater slave than they. How did this change come about? I do not know. What can make it legitimate? That question I think I can answer.",
  },
];

export const ALL_PASSAGES: PassageEntry[] = [
  ...CLASSIC_LITERATURE,
  ...POETRY,
  ...SPEECHES,
  ...FILM,
  ...PHILOSOPHY,
];

export function pickPassageIndexForDate(date: string): number {
  const seed = date
    .replace(/-/g, "")
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  // Offset ensures good distribution across the passage list from launch date
  return (seed + 7) % ALL_PASSAGES.length;
}

export function pickPassageForDate(date: string): PassageEntry {
  return ALL_PASSAGES[pickPassageIndexForDate(date)];
}
