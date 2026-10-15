/* Photo library and CV content */
const SHOOTS = {
  kipipirihike: 'Kipipiri',
  kathandeniforest: 'Kathandeni Forest',
  lakeellis: 'Lake Ellis',
};
const CAPTIONS_BY_ID = {
  'kipipirihike-22': 'Open moorland under big skies', 'kipipirihike-46': 'Portrait in orange', 'kipipirihike-14': 'Ridge line above the canopy',
  'kipipirihike-24': 'Single file into the moorland', 'kipipirihike-43': 'Profile, mid hike', 'kipipirihike-58': 'Balance on the ridge',
  'kipipirihike-67': 'Wide brim, cold air', 'kipipirihike-65': 'Arms open at the top', 'kipipirihike-33': 'The last push up the slope',
  'kipipirihike-98': 'Summit crew at Scouts Peak',
  'kathandeniforest-67': 'First sight of the falls', 'kathandeniforest-75': 'Cascade, vertical', 'kathandeniforest-0': 'Sunrise on the drive in',
  'kathandeniforest-23': 'Into the green', 'kathandeniforest-84': 'Hand to the waterfall', 'kathandeniforest-41': 'River through the forest',
  'kathandeniforest-74': 'Falls framed by ferns', 'kathandeniforest-51': 'A wave from the trail', 'kathandeniforest-42': 'Rapids over stone',
  'kathandeniforest-104': 'Standing in the spray', 'kathandeniforest-16': 'Smiles at the trailhead', 'kathandeniforest-150': 'The lower pool',
  'lakeellis-36': 'Lake Ellis from the ridge', 'lakeellis-98': 'Red shell, cold morning', 'lakeellis-9': 'Moorland below the peaks',
  'lakeellis-1': 'Orange against the tussock', 'lakeellis-20': 'The trail toward the hill', 'lakeellis-27': 'Steady pace',
  'lakeellis-7': 'Walking into open country', 'lakeellis-80': 'Windproofed and grinning', 'lakeellis-18': 'Arms up in the forest',
  'lakeellis-12': 'The crew on the trail',
};
const photo = (id) => {
  const key = id.split('-')[0];
  return { id, cap: CAPTIONS_BY_ID[id], place: SHOOTS[key], full: `img/${id}.jpg`, thumb: `thumb/${id}.jpg`, ...META[id] };
};
/* One mixed gallery, ordered for rhythm rather than by location */
const GALLERY = [
  'lakeellis-36', 'kipipirihike-46', 'kathandeniforest-67', 'kipipirihike-22', 'lakeellis-98', 'kathandeniforest-23',
  'kipipirihike-14', 'kathandeniforest-0', 'lakeellis-9', 'kathandeniforest-84', 'kipipirihike-43', 'lakeellis-1',
  'kathandeniforest-75', 'kipipirihike-24', 'lakeellis-27', 'kathandeniforest-41', 'kipipirihike-58', 'lakeellis-20',
  'kathandeniforest-74', 'kipipirihike-67', 'lakeellis-7', 'kathandeniforest-51', 'kipipirihike-65', 'lakeellis-80',
  'kathandeniforest-42', 'kipipirihike-33', 'lakeellis-18', 'kathandeniforest-104', 'kipipirihike-98', 'kathandeniforest-16',
  'lakeellis-12', 'kathandeniforest-150',
].map(photo);
const byId = (id) => GALLERY.find((p) => p.id === id);
/* More frames for the Gallery page (no camera data: these were re-encoded on import) */
Object.assign(CAPTIONS_BY_ID, {
"kathandeniforest-6": "Ranger at the gate",
"kathandeniforest-8": "Ranger in full uniform",
"kathandeniforest-10": "Briefing before the trail",
"kathandeniforest-14": "Laughing in the rain jacket",
"kathandeniforest-15": "Trailhead smiles",
"kathandeniforest-24": "Path into the forest",
"kathandeniforest-36": "Through the bamboo",
"kathandeniforest-38": "Crossing the footbridge",
"kathandeniforest-40": "Stream under the canopy",
"kathandeniforest-48": "Lunch by the river",
"kathandeniforest-50": "Braids and a wave",
"kathandeniforest-57": "Red pack, river behind",
"kathandeniforest-58": "White tee, big smile",
"kathandeniforest-60": "Green jersey by the water",
"kathandeniforest-66": "Moss on every rock",
"kathandeniforest-72": "Cascades in the green",
"kathandeniforest-76": "Into the spray",
"kathandeniforest-79": "Shades at the falls",
"kathandeniforest-85": "Peace sign in the forest",
"kathandeniforest-88": "Two at the waterfall",
"kathandeniforest-93": "Ferns and a lone hiker",
"kathandeniforest-95": "Close up in stripes",
"kathandeniforest-107": "Scarf at the falls",
"kathandeniforest-116": "Standing in the falls",
"kathandeniforest-125": "Resting on the boulder",
"kathandeniforest-139": "Portrait on the rocks",
"kipipirihike-0": "The start in Naivasha",
"kipipirihike-15": "Valley in the haze",
"kipipirihike-17": "Canopy from below",
"kipipirihike-19": "Locs and sunglasses",
"kipipirihike-26": "Kneeling by the gear",
"kipipirihike-29": "Into the scrub",
"kipipirihike-31": "Bucket hat, steady climb",
"kipipirihike-37": "Seated on the slope",
"kipipirihike-40": "Rest stop",
"kipipirihike-45": "Shades and a smirk",
"kipipirihike-48": "Two on the ridge",
"kipipirihike-53": "Hug at the viewpoint",
"kipipirihike-56": "Mist behind",
"kipipirihike-61": "Masks up for the cold",
"kipipirihike-66": "Hood up, phone out",
"kipipirihike-69": "Crossing the rocks",
"kipipirihike-72": "Climbing with a pole",
"kipipirihike-75": "At the summit sign",
"kipipirihike-77": "Summit cheers",
"kipipirihike-81": "Crew at the summit sign",
"kipipirihike-91": "Summit group shot",
"lakeellis-2": "Open track on the moor",
"lakeellis-13": "Three on the trail",
"lakeellis-17": "Arms up among the trees",
"lakeellis-19": "Mid stride",
"lakeellis-22": "Plants along the path",
"lakeellis-28": "Climbing in a sun hat",
"lakeellis-30": "Peace sign on the slope",
"lakeellis-33": "Cap and grin",
"lakeellis-38": "Walkers by the lake",
"lakeellis-40": "Resting above the water",
"lakeellis-45": "At the Lake Ellis sign",
"lakeellis-59": "Welcome to Lake Ellis",
"lakeellis-66": "Banner at the sign",
"lakeellis-76": "Group at the lake sign",
"lakeellis-88": "Ponchos on the trail",
"lakeellis-90": "Hood up, white jacket",
"lakeellis-91": "Red jacket portrait",
"lakeellis-97": "Rain gear duo"
});
const EXTRA_IDS = Object.keys(CAPTIONS_BY_ID).filter((id) => !GALLERY.some((p) => p.id === id));
/* interleave the three hikes so the page never reads as grouped by location */
const ALL_PHOTOS = (() => {
  const extra = EXTRA_IDS.map(photo);
  const groups = ['lakeellis', 'kathandeniforest', 'kipipirihike'].map((k) => extra.filter((p) => p.id.startsWith(k)));
  const mixed = [];
  for (let i = 0; groups.some((g) => i < g.length); i++) groups.forEach((g) => { if (g[i]) mixed.push(g[i]); });
  const out = [];
  GALLERY.forEach((p, i) => { out.push(p); if (mixed[i * 2]) out.push(mixed[i * 2]); if (mixed[i * 2 + 1]) out.push(mixed[i * 2 + 1]); });
  return out.concat(mixed.slice(GALLERY.length * 2));
})();
const SELECTED = GALLERY.slice(0, 12);
const exifText = (p) => (p.mm ? `${p.mm}mm · f/${p.f} · ${shutter(p.s)}s` : '');

/* Shown on the camera's rear screen during playback */
const PLAYBACK = ['kathandeniforest-67', 'kipipirihike-46', 'lakeellis-98', 'kathandeniforest-75', 'kipipirihike-14', 'kathandeniforest-150', 'lakeellis-9', 'lakeellis-36'].map(byId);
/* The film reel after the push into the screen; it starts on the last playback frame */
const FILM = ['lakeellis-36', 'kipipirihike-22', 'kathandeniforest-84', 'lakeellis-1', 'kathandeniforest-74', 'kipipirihike-67', 'lakeellis-27', 'kathandeniforest-0', 'kipipirihike-65', 'kathandeniforest-23'].map(byId);
/* Hero backdrop */
const SLIDES = ['kipipirihike-22', 'lakeellis-9', 'kathandeniforest-74', 'lakeellis-36'].map(byId);

const RESUME = {
  name: 'Lincoln Kariuki Chege',
  title: 'Graphic Designer · Photographer · Video Editor',
  email: 'kariukilincoln48@gmail.com',
  phones: ['+254 757 557 456', '+254 762 960 615'],
  location: 'Nairobi, Kenya',
  profile: "Creative graphic designer with a Diploma in Journalism and Digital Media and hands-on experience designing posters, promotional videos and social media content for brands. Skilled in Adobe Photoshop, Lightroom and Premiere Pro, with a photographer's eye for composition, light and colour.",
  experience: [
    { role: 'Junior Technician and Social Media', org: 'PowerPulse Dynamics', when: 'Jul 2026 to present', tag: 'Current', pts: [
      "Create and edit video content for the company's social media channels",
      "Run the company's social media pages and keep content visually consistent",
      'Work directly with clients and deliver projects on time'] },
    { role: 'Graphic Designer', org: 'Wanderville Tours and Travel', when: 'Sep to Dec 2025', tag: 'Attachment', pts: [
      'Designed posters promoting the company and its offers',
      "Produced promotional videos for the company's marketing",
      'Managed company social media, creating the visual content posted'] },
    { role: 'Photography and Editing', org: 'Royalty Photo Studio, Nairobi', when: 'Apr 2025, 3 weeks', tag: 'Attachment', pts: [
      'Captured professional quality photographs across studio projects',
      'Edited and enhanced images in Lightroom and Photoshop to meet client expectations',
      'Created and edited professional videos in Adobe Premiere Pro'] },
    { role: 'Junior Electrical Technician', org: 'Boiler Techniques Ltd, Nairobi', when: 'Sep to Dec 2023', tag: 'Attachment', pts: [
      'Performed electrical connections, assisted in boiler servicing and supervised panel assembly'] },
  ],
  education: [
    { q: 'Diploma in Journalism and Digital Media', school: 'KCA University', when: '2024 to 2026', note: 'Graduated' },
    { q: 'Kenya Certificate of Secondary Education', school: 'Pioneer Boys High School', when: '2018 to 2022', note: 'Grade C' },
  ],
  skills: {
    Software: ['Adobe Photoshop', 'Adobe Lightroom', 'Adobe Premiere Pro'],
    Design: ['Poster and print design', 'Social media graphics', 'Photo editing and retouching', 'Video editing and promos'],
    Photography: ['Events and adventure', 'Portraits', 'Studio'],
  },
  languages: [['English', 'Fluent', 5], ['Kiswahili', 'Fluent', 5], ['Chinese', 'Basic', 2]],
  interests: ['Photography and videography', 'Competitive basketball', 'Hiking', 'Reading'],
};
