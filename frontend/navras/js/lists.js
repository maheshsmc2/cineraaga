/* ===========================
   NAVRAS — Lists Page JS
   =========================== */

/* ---- Lists metadata ---- */
const allLists = {
  evergreen: [
    {
      id: "bollywood50",
      count: 50,
      badge: "hot",
      badgeText: "Most read",
      title: "50 Greatest Bollywood Films of All Time",
      desc: "From Mughal-E-Azam to Dangal — the films that defined Hindi cinema across eight decades.",
      meta: "Curated by Navras · Updated June 2025",
      tag: "All time · Bollywood",
      intro: "Bollywood has produced over 100,000 films since its inception. These 50 are the ones that transcend time — films that defined generations, broke records, changed the industry, and continue to be watched, rewatched, and argued about. Ranked by Navras score, cultural impact, and enduring relevance.",
      topFilms: ["Mughal-E-Azam", "DDLJ", "3 Idiots"],
      films: [
        { rank: 1, title: "Mughal-E-Azam", year: 1960, lang: "Hindi", director: "K. Asif", score: 99, color: "#2e2e0d", rasas: ["Karuna","Veera","Shringara"], verdict: "India's most magnificent epic. A landmark in world cinema." },
        { rank: 2, title: "Dilwale Dulhania Le Jayenge", year: 1995, lang: "Hindi", director: "Aditya Chopra", score: 98, color: "#1a0d2e", rasas: ["Shringara","Veera"], verdict: "The film that gave Indian romance its modern face. Timeless." },
        { rank: 3, title: "Pyaasa", year: 1957, lang: "Hindi", director: "Guru Dutt", score: 98, color: "#2e1a0d", rasas: ["Karuna","Raudra"], verdict: "Guru Dutt's masterpiece. Poetry in motion." },
        { rank: 4, title: "Lagaan", year: 2001, lang: "Hindi", director: "Ashutosh Gowariker", score: 97, color: "#2e2e0d", rasas: ["Veera","Shringara"], verdict: "The film that took India to the Oscars and deserved to win." },
        { rank: 5, title: "Taare Zameen Par", year: 2007, lang: "Hindi", director: "Aamir Khan", score: 97, color: "#0d2e1a", rasas: ["Karuna","Veera"], verdict: "Changed how India thinks about children and learning." },
        { rank: 6, title: "Dangal", year: 2016, lang: "Hindi", director: "Nitesh Tiwari", score: 96, color: "#1a2e0d", rasas: ["Veera","Karuna"], verdict: "The greatest sports film India has produced. Also its biggest." },
        { rank: 7, title: "3 Idiots", year: 2009, lang: "Hindi", director: "Rajkumar Hirani", score: 95, color: "#1a2e0d", rasas: ["Hasya","Veera"], verdict: "The most rewatched Indian film of its generation." },
        { rank: 8, title: "Sholay", year: 1975, lang: "Hindi", director: "Ramesh Sippy", score: 95, color: "#2e1a0d", rasas: ["Veera","Raudra"], verdict: "The original Indian blockbuster. Jai and Veeru forever." },
        { rank: 9, title: "Andhadhun", year: 2018, lang: "Hindi", director: "Sriram Raghavan", score: 94, color: "#1a1a1a", rasas: ["Bhayanaka","Hasya"], verdict: "The cleverest thriller Bollywood has ever made." },
        { rank: 10, title: "Tumbbad", year: 2018, lang: "Hindi", director: "Rahi Anil Barve", score: 94, color: "#2e0d0d", rasas: ["Bhayanaka","Bibhatsa"], verdict: "The most original Indian horror film ever made." }
      ]
    },
    {
      id: "alltime100",
      count: 100,
      badge: "hot",
      badgeText: "Most saved",
      title: "100 Greatest Indian Films of All Time — All Languages",
      desc: "The complete Navras canon — spanning Bollywood, Tamil, Telugu, Malayalam, Bengali and beyond.",
      meta: "Curated by Navras · Updated June 2025",
      tag: "All time · All languages",
      intro: "This is the definitive Navras list — 100 films across every Indian language that represent the absolute best this country's cinema has to offer. No favouritism, no star worship. Just films that endure.",
      topFilms: ["Mughal-E-Azam", "Pather Panchali", "Drishyam"],
      films: [
        { rank: 1, title: "Mughal-E-Azam", year: 1960, lang: "Hindi", director: "K. Asif", score: 99, color: "#2e2e0d", rasas: ["Karuna","Veera"], verdict: "India's most magnificent epic. A landmark in world cinema." },
        { rank: 2, title: "Pather Panchali", year: 1955, lang: "Bengali", director: "Satyajit Ray", score: 99, color: "#0d1a2e", rasas: ["Karuna","Shanta"], verdict: "Satyajit Ray's debut. Still the finest Indian film ever made." },
        { rank: 3, title: "Nayakan", year: 1987, lang: "Tamil", director: "Mani Ratnam", score: 98, color: "#2e0d0d", rasas: ["Raudra","Karuna"], verdict: "Kamal Haasan's Godfather. One of India's greatest films." },
        { rank: 4, title: "Dilwale Dulhania Le Jayenge", year: 1995, lang: "Hindi", director: "Aditya Chopra", score: 98, color: "#1a0d2e", rasas: ["Shringara","Veera"], verdict: "The film that gave Indian romance its modern face." },
        { rank: 5, title: "Drishyam", year: 2013, lang: "Malayalam", director: "Jeethu Joseph", score: 97, color: "#0d2e1a", rasas: ["Bhayanaka","Karuna"], verdict: "The perfect Malayalam thriller. Mohanlal at his finest." },
        { rank: 6, title: "Charulata", year: 1964, lang: "Bengali", director: "Satyajit Ray", score: 97, color: "#1a1a2e", rasas: ["Shringara","Karuna"], verdict: "Ray's most perfectly realised film. Heartbreaking and beautiful." },
        { rank: 7, title: "Lagaan", year: 2001, lang: "Hindi", director: "Ashutosh Gowariker", score: 97, color: "#2e2e0d", rasas: ["Veera","Shringara"], verdict: "India's most crowd-pleasing masterpiece." },
        { rank: 8, title: "Baahubali 2", year: 2017, lang: "Telugu", director: "S.S. Rajamouli", score: 96, color: "#2e1a0d", rasas: ["Adbhuta","Veera"], verdict: "India's most spectacular blockbuster. A modern epic." },
        { rank: 9, title: "Dangal", year: 2016, lang: "Hindi", director: "Nitesh Tiwari", score: 96, color: "#1a2e0d", rasas: ["Veera","Karuna"], verdict: "The film that proved Indian sport could power world cinema." },
        { rank: 10, title: "Gangs of Wasseypur", year: 2012, lang: "Hindi", director: "Anurag Kashyap", score: 97, color: "#2e0d0d", rasas: ["Raudra","Bibhatsa"], verdict: "India's most complete crime epic. Five hours of brilliance." }
      ]
    }
  ],

  ott: [
    {
      id: "netflix2025",
      count: 30,
      badge: "weekly",
      badgeText: "Updated weekly",
      title: "Best Indian Films on Netflix Right Now (2025)",
      desc: "The definitive guide to Indian cinema on Netflix — ranked by Navras score, not algorithm.",
      meta: "Updated June 23, 2025",
      tag: "OTT · Netflix",
      intro: "Netflix India has thousands of titles but finding the best is nearly impossible with their algorithm. We've done it for you — every Indian film worth watching on Netflix right now, ranked by Navras score.",
      topFilms: ["IC 814", "All We Imagine as Light", "Gangs of Wasseypur"],
      films: [
        { rank: 1, title: "IC 814: The Kandahar Hijack", year: 2024, lang: "Hindi", director: "Anubhav Sinha", score: 91, color: "#1a1a2e", rasas: ["Bhayanaka","Veera"], verdict: "India's most gripping series based on true events." },
        { rank: 2, title: "All We Imagine as Light", year: 2024, lang: "Malayalam", director: "Payal Kapadia", score: 96, color: "#0d2e1a", rasas: ["Karuna","Shanta"], verdict: "India's most celebrated film at Cannes 2024." },
        { rank: 3, title: "Gangs of Wasseypur", year: 2012, lang: "Hindi", director: "Anurag Kashyap", score: 97, color: "#2e0d0d", rasas: ["Raudra","Bibhatsa"], verdict: "If you haven't seen it, stop everything and watch it now." },
        { rank: 4, title: "Masaan", year: 2015, lang: "Hindi", director: "Neeraj Ghaywan", score: 95, color: "#1a1a2e", rasas: ["Karuna","Shanta"], verdict: "The most poetic Indian film of the last decade." },
        { rank: 5, title: "3 Idiots", year: 2009, lang: "Hindi", director: "Rajkumar Hirani", score: 95, color: "#1a2e0d", rasas: ["Hasya","Veera"], verdict: "Still the most rewatched film on Netflix India." },
        { rank: 6, title: "Andhadhun", year: 2018, lang: "Hindi", director: "Sriram Raghavan", score: 94, color: "#1a1a1a", rasas: ["Bhayanaka","Hasya"], verdict: "The cleverest thriller Bollywood has ever made." },
        { rank: 7, title: "Tumbbad", year: 2018, lang: "Hindi", director: "Rahi Anil Barve", score: 94, color: "#2e0d0d", rasas: ["Bhayanaka","Bibhatsa"], verdict: "Watch it tonight with the lights off." },
        { rank: 8, title: "RRR", year: 2022, lang: "Telugu", director: "S.S. Rajamouli", score: 95, color: "#2e0d1a", rasas: ["Veera","Raudra"], verdict: "The film that introduced Indian mass cinema to the world." }
      ]
    },
    {
      id: "prime2025",
      count: 25,
      badge: "weekly",
      badgeText: "Updated weekly",
      title: "Best Indian Films on Prime Video (2025)",
      desc: "From Stree 2 to Panchayat — the best Indian content on Amazon Prime Video right now.",
      meta: "Updated June 23, 2025",
      tag: "OTT · Prime Video",
      intro: "Amazon Prime Video has quietly become the home of India's best web series and a growing library of films. Here's the Navras guide to what's worth watching.",
      topFilms: ["Stree 2", "Panchayat", "Drishyam 2"],
      films: [
        { rank: 1, title: "Stree 2", year: 2024, lang: "Hindi", director: "Amar Kaushik", score: 87, color: "#1a0d2e", rasas: ["Hasya","Bhayanaka"], verdict: "The horror comedy sequel that broke every box office record." },
        { rank: 2, title: "Panchayat S3", year: 2024, lang: "Hindi", director: "Deepak Kumar Mishra", score: 93, color: "#1a2e0d", rasas: ["Hasya","Shanta"], verdict: "The most wholesome Indian series ever made." },
        { rank: 3, title: "Drishyam 2", year: 2021, lang: "Malayalam", director: "Jeethu Joseph", score: 91, color: "#0d1a2e", rasas: ["Bhayanaka","Karuna"], verdict: "A sequel that surpasses the original. Watch back to back." },
        { rank: 4, title: "The Family Man S2", year: 2021, lang: "Hindi", director: "Raj & DK", score: 94, color: "#0d1a1a", rasas: ["Bhayanaka","Hasya"], verdict: "Manoj Bajpayee gives the performance of his career." },
        { rank: 5, title: "Mirzapur S3", year: 2024, lang: "Hindi", director: "Gurmeet Singh", score: 82, color: "#2e0d0d", rasas: ["Raudra","Bhayanaka"], verdict: "The Mirzapur universe reaches its most complex chapter." }
      ]
    },
    {
      id: "webseries",
      count: 20,
      badge: "hot",
      badgeText: "Trending",
      title: "Best Indian Web Series of All Time — Ranked",
      desc: "From Scam 1992 to Panchayat — every great Indian web series, ranked by Navras score.",
      meta: "Curated by Navras · Updated June 2025",
      tag: "OTT · Series",
      intro: "Indian web series have grown from an afterthought to a global phenomenon in under a decade. These are the ones that defined the format.",
      topFilms: ["Scam 1992", "Panchayat", "The Family Man"],
      films: [
        { rank: 1, title: "Scam 1992: The Harshad Mehta Story", year: 2020, lang: "Hindi", director: "Hansal Mehta", score: 97, color: "#2e2e0d", rasas: ["Adbhuta","Raudra"], verdict: "The greatest Indian web series ever made. Not even close." },
        { rank: 2, title: "Panchayat S1-S3", year: 2020, lang: "Hindi", director: "Deepak Kumar Mishra", score: 95, color: "#1a2e0d", rasas: ["Hasya","Shanta"], verdict: "The series that made rural India feel like home to everyone." },
        { rank: 3, title: "The Family Man S1-S2", year: 2019, lang: "Hindi", director: "Raj & DK", score: 94, color: "#0d1a1a", rasas: ["Bhayanaka","Hasya"], verdict: "Manoj Bajpayee. Enough said." },
        { rank: 4, title: "Paatal Lok S1-S2", year: 2020, lang: "Hindi", director: "Sudip Sharma", score: 93, color: "#1a0d1a", rasas: ["Raudra","Bibhatsa"], verdict: "India's most uncomfortable and necessary thriller." },
        { rank: 5, title: "IC 814: The Kandahar Hijack", year: 2024, lang: "Hindi", director: "Anubhav Sinha", score: 91, color: "#1a1a2e", rasas: ["Bhayanaka","Veera"], verdict: "The most tightly written Indian series of 2024." }
      ]
    }
  ],

  trending: [
    {
      id: "best2025",
      count: 25,
      badge: "new",
      badgeText: "2025 list",
      title: "Best Indian Films of 2025 — Navras Ranked",
      desc: "Kantara Chapter 1, Saiyaara, Lokah and more — every major Indian film of 2025 ranked by Navras.",
      meta: "Last updated June 2025",
      tag: "2025 · All languages",
      intro: "2025 was a year of contrasts in Indian cinema. Mainstream Bollywood leaned into familiarity while Malayalam cinema continued to set the pace. Here are the films that actually mattered.",
      topFilms: ["Kantara Ch.1", "Lokah", "Saiyaara"],
      films: [
        { rank: 1, title: "Kantara: A Legend Chapter 1", year: 2025, lang: "Kannada", director: "Rishab Shetty", score: 93, color: "#0d2e1a", rasas: ["Adbhuta","Veera"], verdict: "The follow-up to one of India's most culturally impactful films." },
        { rank: 2, title: "Lokah", year: 2025, lang: "Malayalam", director: "Dominic Arun", score: 91, color: "#1a0d2e", rasas: ["Adbhuta","Veera"], verdict: "The highest-grossing Malayalam film ever made. Spectacular." },
        { rank: 3, title: "Saiyaara", year: 2025, lang: "Hindi", director: "Mohit Suri", score: 82, color: "#1a1a2e", rasas: ["Shringara","Karuna"], verdict: "The romantic comeback Bollywood needed. Ahaan Panday announces himself." },
        { rank: 4, title: "Dhurandhar", year: 2025, lang: "Hindi", director: "Aditya Dhar", score: 88, color: "#1a0d0d", rasas: ["Veera","Raudra"], verdict: "Ranveer Singh's best performance since Gully Boy." },
        { rank: 5, title: "Superboys of Malegaon", year: 2025, lang: "Hindi", director: "Reema Kagti", score: 87, color: "#2e1a0d", rasas: ["Hasya","Veera"], verdict: "The most heartwarming Indian film of the year." }
      ]
    },
    {
      id: "mostsearched2025",
      count: 10,
      badge: "hot",
      badgeText: "Trending",
      title: "Most Searched Indian Films of 2025 on Google",
      desc: "Saiyaara topped Google India 2025 search — here's the full list with Navras scores added.",
      meta: "Based on Google Year in Search 2025",
      tag: "2025 · Trending",
      intro: "Google India revealed the most-searched Indian films of 2025. We've added Navras scores to every title so you can actually decide what's worth watching.",
      topFilms: ["Saiyaara", "Kantara Ch.1", "Coolie"],
      films: [
        { rank: 1, title: "Saiyaara", year: 2025, lang: "Hindi", director: "Mohit Suri", score: 82, color: "#1a1a2e", rasas: ["Shringara","Karuna"], verdict: "Most searched film of 2025 — and it earns the attention." },
        { rank: 2, title: "Kantara: A Legend Chapter 1", year: 2025, lang: "Kannada", director: "Rishab Shetty", score: 93, color: "#0d2e1a", rasas: ["Adbhuta","Bhayanaka"], verdict: "The most anticipated follow-up in Indian cinema history." },
        { rank: 3, title: "Coolie", year: 2025, lang: "Tamil", director: "Lokesh Kanagaraj", score: 84, color: "#1a0d1a", rasas: ["Veera","Raudra"], verdict: "Rajinikanth in the Lokesh Cinematic Universe. Unmissable." },
        { rank: 4, title: "Dhurandhar", year: 2025, lang: "Hindi", director: "Aditya Dhar", score: 88, color: "#2e0d0d", rasas: ["Veera","Raudra"], verdict: "India's biggest blockbuster of 2025." },
        { rank: 5, title: "War 2", year: 2025, lang: "Hindi", director: "Ayan Mukerji", score: 68, color: "#0d1a2e", rasas: ["Veera","Adbhuta"], verdict: "Hrithik vs NTR Jr. The spectacle delivers; the story doesn't." }
      ]
    },
    {
      id: "pushpa2rrr",
      count: 5,
      badge: "hot",
      badgeText: "Debated",
      title: "Pushpa 2 vs RRR vs Baahubali 2 — Greatest Indian Mass Film?",
      desc: "Three giants of Indian cinema. Which one truly reigns? Navras settles the debate with data.",
      meta: "Navras debate feature · June 2025",
      tag: "Debate · Telugu cinema",
      intro: "Three films that redefined what Indian mass cinema could achieve globally. We break down each one across six dimensions to settle this once and for all.",
      topFilms: ["Pushpa 2", "RRR", "Baahubali 2"],
      films: [
        { rank: 1, title: "RRR", year: 2022, lang: "Telugu", director: "S.S. Rajamouli", score: 95, color: "#2e0d1a", rasas: ["Veera","Raudra"], verdict: "The film that made the world fall in love with Indian mass cinema." },
        { rank: 2, title: "Baahubali 2: The Conclusion", year: 2017, lang: "Telugu", director: "S.S. Rajamouli", score: 92, color: "#2e1a0d", rasas: ["Adbhuta","Veera"], verdict: "India's most spectacular world-building achievement." },
        { rank: 3, title: "Pushpa 2: The Rule", year: 2024, lang: "Telugu", director: "Sukumar", score: 88, color: "#2e0d0d", rasas: ["Raudra","Veera"], verdict: "Allu Arjun's greatest performance. The numbers don't lie." }
      ]
    }
  ],

  language: [
    {
      id: "malayalam35",
      count: 35,
      badge: "hot",
      badgeText: "Most read",
      title: "35 Best Malayalam Films of All Time",
      desc: "The golden standard of Indian regional cinema — from Drishyam to All We Imagine as Light.",
      meta: "Curated by Navras · Updated June 2025",
      tag: "Language · Malayalam",
      intro: "Malayalam cinema is currently the most exciting film industry in India — possibly the world. Small budgets, real stories, extraordinary craft. This list is your complete guide.",
      topFilms: ["Drishyam", "Premam", "Kumbalangi Nights"],
      films: [
        { rank: 1, title: "Drishyam", year: 2013, lang: "Malayalam", director: "Jeethu Joseph", score: 97, color: "#0d2e1a", rasas: ["Bhayanaka","Karuna"], verdict: "The perfect thriller. Remade five times. None come close." },
        { rank: 2, title: "All We Imagine as Light", year: 2024, lang: "Malayalam", director: "Payal Kapadia", score: 96, color: "#0d2e0d", rasas: ["Karuna","Shanta"], verdict: "Grand Prix at Cannes 2024. Kerala's most internationally acclaimed film." },
        { rank: 3, title: "Premam", year: 2015, lang: "Malayalam", director: "Alphonse Puthren", score: 94, color: "#2e1a0d", rasas: ["Shringara","Hasya"], verdict: "The film that defined a generation of Malayalam youth." },
        { rank: 4, title: "Kumbalangi Nights", year: 2019, lang: "Malayalam", director: "Madhu C. Narayanan", score: 93, color: "#0d1a2e", rasas: ["Shanta","Karuna"], verdict: "Four brothers. One home. Malayalam cinema at its most tender." },
        { rank: 5, title: "Manjummel Boys", year: 2024, lang: "Malayalam", director: "Chidambaram S. Poduval", score: 91, color: "#0d2e2e", rasas: ["Veera","Bhayanaka"], verdict: "Brotherhood and survival, based on a true story. Unmissable." }
      ]
    },
    {
      id: "tamil25",
      count: 25,
      badge: "updated",
      badgeText: "Updated",
      title: "25 Tamil Films Everyone Must Watch",
      desc: "From Nayakan to Vikram — the definitive Navras guide to Tamil cinema's greatest films.",
      meta: "Curated by Navras · Updated June 2025",
      tag: "Language · Tamil",
      intro: "Tamil cinema has given India some of its most original filmmakers and most daring stories. This list is the essential starting point for anyone exploring Kollywood.",
      topFilms: ["Nayakan", "Vikram", "96"],
      films: [
        { rank: 1, title: "Nayakan", year: 1987, lang: "Tamil", director: "Mani Ratnam", score: 98, color: "#2e0d0d", rasas: ["Raudra","Karuna"], verdict: "India's answer to The Godfather. Kamal Haasan's greatest." },
        { rank: 2, title: "96", year: 2018, lang: "Tamil", director: "C. Prem Kumar", score: 96, color: "#1a1a2e", rasas: ["Shringara","Karuna"], verdict: "Nostalgia and longing distilled to absolute perfection." },
        { rank: 3, title: "Vikram", year: 2022, lang: "Tamil", director: "Lokesh Kanagaraj", score: 90, color: "#2e0d1a", rasas: ["Raudra","Bhayanaka"], verdict: "Three legends. One unstoppable collision of Tamil mass cinema." },
        { rank: 4, title: "Kanguva", year: 2024, lang: "Tamil", director: "Siva", score: 91, color: "#1a0d2e", rasas: ["Veera","Adbhuta"], verdict: "Tamil cinema's most ambitious production design ever." },
        { rank: 5, title: "Jai Bhim", year: 2021, lang: "Tamil", director: "T.J. Gnanavel", score: 95, color: "#0d0d2e", rasas: ["Raudra","Karuna"], verdict: "Suriya's most powerful performance. Required viewing for all Indians." }
      ]
    },
    {
      id: "telugu20",
      count: 20,
      badge: "updated",
      badgeText: "Updated",
      title: "20 Greatest Telugu Films — The Tollywood Canon",
      desc: "From Baahubali to RRR — the films that made Telugu cinema a global force.",
      meta: "Curated by Navras · Updated June 2025",
      tag: "Language · Telugu",
      intro: "Telugu cinema went from a regional industry to a global phenomenon in a decade. These 20 films explain exactly how that happened.",
      topFilms: ["Baahubali 2", "RRR", "Arjun Reddy"],
      films: [
        { rank: 1, title: "Baahubali 2: The Conclusion", year: 2017, lang: "Telugu", director: "S.S. Rajamouli", score: 92, color: "#2e1a0d", rasas: ["Adbhuta","Veera"], verdict: "India's most spectacular blockbuster. A modern epic." },
        { rank: 2, title: "RRR", year: 2022, lang: "Telugu", director: "S.S. Rajamouli", score: 95, color: "#2e0d1a", rasas: ["Veera","Raudra"], verdict: "The film that made the world fall in love with Indian mass cinema." },
        { rank: 3, title: "Arjun Reddy", year: 2017, lang: "Telugu", director: "Sandeep Reddy Vanga", score: 87, color: "#1a0d0d", rasas: ["Raudra","Shringara"], verdict: "Divisive, raw, and impossible to forget." },
        { rank: 4, title: "Pushpa 2: The Rule", year: 2024, lang: "Telugu", director: "Sukumar", score: 88, color: "#2e0d0d", rasas: ["Raudra","Veera"], verdict: "Allu Arjun at the absolute peak of his stardom." },
        { rank: 5, title: "Jai Bhim", year: 2021, lang: "Tamil/Telugu", director: "T.J. Gnanavel", score: 95, color: "#0d0d2e", rasas: ["Raudra","Karuna"], verdict: "Required viewing. One of the most important Indian films ever." }
      ]
    }
  ],

  awards: [
    {
      id: "cannes",
      count: 15,
      badge: "updated",
      badgeText: "Updated",
      title: "Indian Films That Won at Cannes — Complete List",
      desc: "From Satyajit Ray to Payal Kapadia — every Indian film to win at the world's greatest film festival.",
      meta: "Complete historical list · Updated 2025",
      tag: "Awards · Cannes",
      intro: "India's relationship with Cannes spans 70 years. From Satyajit Ray's Pather Panchali in 1956 to Payal Kapadia's Grand Prix in 2024, these are the films that put Indian cinema on the world stage.",
      topFilms: ["All We Imagine as Light", "Pather Panchali", "An Elephant Sitting Still"],
      films: [
        { rank: 1, title: "All We Imagine as Light", year: 2024, lang: "Malayalam", director: "Payal Kapadia", score: 96, color: "#0d2e1a", rasas: ["Karuna","Shanta"], verdict: "Grand Prix, Cannes 2024. India's greatest recent triumph at the festival." },
        { rank: 2, title: "Pather Panchali", year: 1955, lang: "Bengali", director: "Satyajit Ray", score: 99, color: "#0d1a2e", rasas: ["Karuna","Shanta"], verdict: "Best Human Document, Cannes 1956. Where it all began." },
        { rank: 3, title: "Theeb", year: 2014, lang: "Arabic", director: "Naji Abu Nowar", score: 88, color: "#2e2e0d", rasas: ["Veera","Bhayanaka"], verdict: "Jury Prize at Cannes. A co-production with Indian involvement." },
        { rank: 4, title: "Masaan", year: 2015, lang: "Hindi", director: "Neeraj Ghaywan", score: 95, color: "#1a1a2e", rasas: ["Karuna","Shanta"], verdict: "FIPRESCI Prize and Promising Future Award, Cannes 2015." },
        { rank: 5, title: "Liar's Dice", year: 2013, lang: "Hindi", director: "Geetu Mohandas", score: 84, color: "#0d2e2e", rasas: ["Karuna","Veera"], verdict: "Un Certain Regard selection. India's most underrated recent film." }
      ]
    },
    {
      id: "oscars",
      count: 10,
      badge: "updated",
      badgeText: "Updated",
      title: "Indian Films at the Oscars — Every Entry Ever",
      desc: "India's complete Oscar history — which films were submitted, which were nominated, and which won.",
      meta: "Complete historical list · Updated 2025",
      tag: "Awards · Oscars",
      intro: "India has been submitting films to the Academy Awards since 1957. Only three have received nominations. Here's the complete, honest story of Indian cinema at the Oscars.",
      topFilms: ["Lagaan", "Mother India", "Salaam Bombay!"],
      films: [
        { rank: 1, title: "Lagaan", year: 2001, lang: "Hindi", director: "Ashutosh Gowariker", score: 97, color: "#2e2e0d", rasas: ["Veera","Shringara"], verdict: "Nominated for Best Foreign Film, Oscars 2002. India's greatest Oscar moment." },
        { rank: 2, title: "Mother India", year: 1957, lang: "Hindi", director: "Mehboob Khan", score: 96, color: "#2e1a0d", rasas: ["Veera","Karuna"], verdict: "Nominated for Best Foreign Film, Oscars 1958. Lost by one vote." },
        { rank: 3, title: "Salaam Bombay!", year: 1988, lang: "Hindi", director: "Mira Nair", score: 94, color: "#1a0d0d", rasas: ["Karuna","Bibhatsa"], verdict: "Nominated for Best Foreign Film, Oscars 1989. A landmark in Indian cinema." },
        { rank: 4, title: "Laapataa Ladies", year: 2024, lang: "Hindi", director: "Kiran Rao", score: 90, color: "#1a2e1a", rasas: ["Hasya","Veera"], verdict: "India's official Oscar entry 2025. Aamir Khan produced. Kiran Rao directs." },
        { rank: 5, title: "RRR — Naatu Naatu", year: 2022, lang: "Telugu", director: "S.S. Rajamouli", score: 95, color: "#2e0d1a", rasas: ["Veera","Hasya"], verdict: "Won Best Original Song at Oscars 2023. India's first competitive Oscar win." }
      ]
    }
  ]
};

/* ---- Render list cards with visual collage ---- */
function renderListCard(list) {
  // Generate collage cells from top films
  const collageCells = (list.films || []).slice(0, 4).map((f, i) => {
    const colors = ['#1a1a2e','#0d2e1a','#2e0d0d','#1a2e0d'];
    return `<div class="lc-collage-cell" id="lc-cell-${list.id}-${i}"
      style="background:linear-gradient(135deg,${f.color||colors[i]},${f.color||colors[i]}88);">
    </div>`;
  }).join('');

  return `
    <div class="list-card" onclick="openList('${list.id}')">
      <!-- Visual collage top -->
      <div class="lc-collage">
        ${collageCells}
        <div class="lc-collage-overlay">
          <div class="lc-count-badge">${list.count} films</div>
        </div>
        <div class="lc-badge-wrap">
          <span class="lc-badge ${list.badge}">${list.badgeText}</span>
        </div>
      </div>
      <!-- Card body -->
      <div class="lc-body">
        <div class="lc-tag">${list.tag}</div>
        <div class="lc-title">${list.title}</div>
        <div class="lc-desc">${list.desc}</div>
        <div class="lc-films-preview">
          ${list.topFilms.map(f => `<span class="lc-film-chip">${f}</span>`).join('')}
        </div>
        <div class="lc-bottom">
          <div class="lc-meta">${list.meta}</div>
          <div class="lc-arrow">→</div>
        </div>
      </div>
    </div>
  `;
}

/* ---- Load real posters into list card collages ---- */
async function loadListCardPosters() {
  const TMDB_KEY = (window.NAVRAS_CONFIG && window.NAVRAS_CONFIG.TMDB_KEY) || '';
  const lists = Object.values(allLists).flat();

  for (const list of lists) {
    const films = (list.films || []).slice(0, 4);
    for (let i = 0; i < films.length; i++) {
      const f = films[i];
      const cellId = `lc-cell-${list.id}-${i}`;
      const cell = document.getElementById(cellId);
      if (!cell) continue;
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(f.title)}&year=${f.year}`
        );
        const data = await res.json();
        const movie = data?.results?.[0];
        if (movie?.poster_path) {
          cell.style.backgroundImage = `url('https://image.tmdb.org/t/p/w185${movie.poster_path}')`;
          cell.style.backgroundSize = 'cover';
          cell.style.backgroundPosition = 'center';
        }
      } catch(e) {}
    }
  }
}

function renderAllLists() {
  document.getElementById('evergreenGrid').innerHTML = allLists.evergreen.map(renderListCard).join('');
  document.getElementById('ottGrid').innerHTML = allLists.ott.map(renderListCard).join('');
  document.getElementById('trendingGrid').innerHTML = allLists.trending.map(renderListCard).join('');
  document.getElementById('languageGrid').innerHTML = allLists.language.map(renderListCard).join('');
  document.getElementById('awardsGrid').innerHTML = allLists.awards.map(renderListCard).join('');
  // Load real posters into collages
  loadListCardPosters();
}

/* ---- Open full list modal ---- */
async function openList(id) {
  const list = Object.values(allLists).flat().find(l => l.id === id);
  if (!list) return;

  document.getElementById('lmTag').textContent = list.tag;
  document.getElementById('lmTitle').textContent = list.title;
  document.getElementById('lmMeta').textContent = list.meta;
  document.getElementById('lmIntro').textContent = list.intro;
  document.getElementById('listOverlay').style.display = 'block';
  document.getElementById('listOverlay').scrollTop = 0;
  document.body.style.overflow = 'hidden';

  // Render immediately with colour blocks
  const TMDB_KEY = (window.NAVRAS_CONFIG && window.NAVRAS_CONFIG.TMDB_KEY) || '';
  
  document.getElementById('lmFilms').innerHTML = list.films.map(f => {
    const rankClass = f.rank === 1 ? 'gold' : f.rank === 2 ? 'silver' : f.rank === 3 ? 'bronze' : '';
    const scoreColor = f.score >= 85 ? '#2ECC71' : f.score >= 65 ? '#F39C12' : '#E74C3C';
    const scoreBg = f.score >= 85 ? '#1A7A3C' : f.score >= 65 ? '#C47A00' : '#C0392B';
    return `
      <div class="lm-film-row" id="lm-row-${f.rank}">
        <div class="lm-rank ${rankClass}">${f.rank}</div>
        <div class="lm-poster" id="lm-poster-${f.rank}"
          style="background:linear-gradient(160deg,${f.color},${f.color}88);">
          <div class="lm-poster-score" style="background:${scoreBg}">${f.score}</div>
        </div>
        <div class="lm-info">
          <div class="lm-film-title">${f.title}</div>
          <div class="lm-film-meta">${f.lang} · ${f.year} · Dir. ${f.director}</div>
          <div class="lm-film-verdict">"${f.verdict}"</div>
          <div class="lm-rasas">${f.rasas.map(r=>`<span class="rtag">${r}</span>`).join('')}</div>
        </div>
        <div class="lm-score">
          <div class="lm-score-num" style="color:${scoreColor};">${f.score}</div>
          <div class="lm-score-label">Navras</div>
        </div>
      </div>
    `;
  }).join('');

  // Load ALL posters in parallel — much faster
  await Promise.all(list.films.map(async f => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(f.title)}&year=${f.year}&language=en-US`
      );
      const data = await res.json();
      // Try first result, then try without year filter if no poster
      let movie = data?.results?.[0];
      if (!movie?.poster_path && data?.results?.length > 1) {
        movie = data.results.find(r => r.poster_path) || movie;
      }
      if (movie?.poster_path) {
        const posterEl = document.getElementById(`lm-poster-${f.rank}`);
        if (posterEl) {
          const img = document.createElement('img');
          img.src = `https://image.tmdb.org/t/p/w185${movie.poster_path}`;
          img.alt = f.title;
          img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:6px;';
          img.loading = 'lazy';
          img.onerror = () => img.remove();
          posterEl.style.position = 'relative';
          posterEl.style.overflow = 'hidden';
          posterEl.prepend(img);
        }
      }
    } catch(e) {}
  }));
}

function closeList() {
  document.getElementById('listOverlay').style.display = 'none';
  document.body.style.overflow = '';
}

/* ---- Category filter ---- */
function initCategoryFilter() {
  document.querySelectorAll('.lf-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lf-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      const sections = {
        evergreen: 'sec-evergreen',
        ott: 'sec-ott',
        trending: 'sec-trending',
        language: 'sec-language',
        awards: 'sec-awards'
      };
      if (cat === 'all') {
        Object.values(sections).forEach(id => {
          document.getElementById(id).style.display = 'block';
        });
      } else {
        Object.values(sections).forEach(id => {
          document.getElementById(id).style.display = 'none';
        });
        if (sections[cat]) {
          document.getElementById(sections[cat]).style.display = 'block';
        }
      }
    });
  });
}

/* ---- Close modal on escape ---- */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeList();
});

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  renderAllLists();
  initCategoryFilter();

  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  }
});

/* ---- Load featured banner posters ---- */
async function loadFeaturedBannerPosters() {
  const TMDB_KEY = (window.NAVRAS_CONFIG && window.NAVRAS_CONFIG.TMDB_KEY) || '';

  // Films for featured Bollywood list preview
  const featuredFilms = [
    { id: 1, query: 'Mughal-E-Azam', year: 1960, tmdbId: 390043 },
    { id: 2, query: 'Dilwale Dulhania Le Jayenge', year: 1995, tmdbId: 19330 },
    { id: 3, query: 'Lagaan', year: 2001, tmdbId: 20453 },
    { id: 4, query: 'Dangal', year: 2016, tmdbId: 363676 },
    { id: 5, query: '3 Idiots', year: 2009, tmdbId: 20266 }
  ];

  // Background collage TMDb IDs
  const bgIds = [19330, 363676, 20266, 520110, 759244, 194662];

  // Load preview posters and background collage in parallel
  await Promise.all([
    // Preview list posters
    ...featuredFilms.map(async f => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${f.tmdbId}?api_key=${TMDB_KEY}`);
        const data = await res.json();
        if (data?.poster_path) {
          const el = document.getElementById(`flb-p-${f.id}`);
          if (el) {
            el.style.backgroundImage = `url('https://image.tmdb.org/t/p/w185${data.poster_path}')`;
            el.style.backgroundSize = 'cover';
            el.style.backgroundPosition = 'center';
          }
        }
      } catch(e) {}
    }),
    // Background collage
    ...bgIds.map(async (id, i) => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}`);
        const data = await res.json();
        const path = data?.backdrop_path || data?.poster_path;
        if (path) {
          const el = document.getElementById(`flb-bg-${i+1}`);
          if (el) {
            el.style.backgroundImage = `url('https://image.tmdb.org/t/p/w500${path}')`;
            el.style.backgroundSize = 'cover';
            el.style.backgroundPosition = 'center';
          }
        }
      } catch(e) {}
    })
  ]);
}

// Call on load
document.addEventListener('DOMContentLoaded', () => {
  loadFeaturedBannerPosters();
});
