/**
 * ── Prolx Academy Marketing Stats ─────────────────────────────────────────
 * Provides realistic social-proof numbers for the PUBLIC frontend.
 * The Admin Dashboard ALWAYS shows real database data.
 *
 * These numbers start from a base that feels established, and drift
 * upward using a seeded pseudo-random function (based on the current date)
 * so they're stable per-day but change realistically over time.
 */

/** Base marketing numbers (floor for social proof display) */
const BASE_STATS = {
  studentsEnrolled: 1247,
  coursesAvailable: 32,
  expertTrainers: 12,
  internshipOpps: 50,
  hiringPartners: 25,
  satisfactionRate: 98,
  studentsPaced: 487,
  avgSalary: 60000,
};

/**
 * Returns a seeded integer that drifts day-by-day.
 * Uses the current date as seed so it's consistent per-day.
 */
function dailySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function seededRand(seed: number, index: number): number {
  const x = Math.sin(seed + index) * 10000;
  return x - Math.floor(x);
}

/** Returns marketing stats for frontend display (NOT real DB data) */
export function getMarketingStats() {
  const seed = dailySeed();
  return {
    studentsEnrolled: BASE_STATS.studentsEnrolled + Math.floor(seededRand(seed, 1) * 43),
    coursesAvailable: BASE_STATS.coursesAvailable,
    expertTrainers: BASE_STATS.expertTrainers,
    internshipOpps: BASE_STATS.internshipOpps,
    hiringPartners: BASE_STATS.hiringPartners,
    satisfactionRate: BASE_STATS.satisfactionRate,
    studentsPaced: BASE_STATS.studentsPaced + Math.floor(seededRand(seed, 2) * 21),
    avgSalary: BASE_STATS.avgSalary,
  };
}

/** Names used for fake live enrollment pop-ups */
const FAKE_NAMES = [
  "Ahmed R.", "Fatima M.", "Usman T.", "Zainab K.", "Hassan A.", "Ayesha N.",
  "Bilal S.", "Mariam F.", "Sana Q.", "Tariq J.", "Nadia R.", "Imran B.",
  "Sara H.", "Owais L.", "Hina K.", "Raza M.", "Asma Y.", "Kamran P.",
  "Layla W.", "Farhan D.", "Noor S.", "Junaid A.", "Areeba T.", "Shahid C.",
  "Maryam I.", "Daniyal N.", "Sadia H.", "Wajahat R.", "Amna Q.", "Ali Z.",
];

const FAKE_LOCATIONS = [
  "Abbottabad", "Islamabad", "Karachi", "Lahore", "Peshawar",
  "Multan", "Rawalpindi", "Faisalabad", "Quetta", "Sialkot",
  "Murree", "Mansehra", "Haripur", "Attock", "Gujranwala",
];

export const FAKE_COURSES = [
  "Full Stack Web Development",
  "UI/UX Design Masterclass",
  "Digital Marketing Pro",
  "Mobile App Dev — Flutter",
  "AI & Machine Learning",
  "Graphic Design with Adobe",
  "React & Next.js Advanced",
  "Python Programming Bootcamp",
  "WordPress & Shopify Dev",
  "SEO Optimization Complete",
  "Freelancing & Business",
  "Cyber Security Fundamentals",
];

const FAKE_TIMES = [
  "just now", "2 min ago", "5 min ago", "8 min ago", "12 min ago",
  "15 min ago", "18 min ago", "22 min ago", "27 min ago", "31 min ago",
];

export interface FakeEnrollment {
  id: number;
  name: string;
  location: string;
  course: string;
  time: string;
  avatar: string;
}

/** Generates a list of fake enrollment notifications for marketing display */
export function generateFakeEnrollments(count = 8): FakeEnrollment[] {
  const seed = dailySeed();
  const result: FakeEnrollment[] = [];

  for (let i = 0; i < count; i++) {
    const nameIdx = Math.floor(seededRand(seed, i * 7 + 1) * FAKE_NAMES.length);
    const locIdx = Math.floor(seededRand(seed, i * 7 + 2) * FAKE_LOCATIONS.length);
    const courseIdx = Math.floor(seededRand(seed, i * 7 + 3) * FAKE_COURSES.length);
    const timeIdx = Math.floor(seededRand(seed, i * 7 + 4) * FAKE_TIMES.length);

    const name = FAKE_NAMES[nameIdx];
    result.push({
      id: i,
      name,
      location: FAKE_LOCATIONS[locIdx],
      course: FAKE_COURSES[courseIdx],
      time: FAKE_TIMES[timeIdx],
      avatar: name.split(" ").map(w => w[0]).join("").replace(".", ""),
    });
  }


  return result;
}

/**
 * Computes realistic marketing urgency for batch seats on public frontend.
 * - Displays dynamic remaining seats (e.g. 7, 8, 9 left) that vary realistically.
 * - Auto-updates: As real students enroll in DB, remaining seats decrease (e.g., 8 -> 5 -> 2 -> 0).
 * - Stops enrollments completely when real enrolled >= total seats!
 */
export function getBatchSeatDisplay(totalSeats = 30, enrolledSeats = 0, batchKey = "") {
  const total = Math.max(1, totalSeats);
  const realEnrolled = Math.max(0, enrolledSeats);
  const realAvailable = total - realEnrolled;

  if (realAvailable <= 0) {
    return {
      available: 0,
      enrolled: total,
      pct: 100,
      isFull: true,
    };
  }

  // Deterministic seed based on batch identifier + day
  let hash = 0;
  for (let i = 0; i < batchKey.length; i++) {
    hash = (hash << 5) - hash + batchKey.charCodeAt(i);
    hash |= 0;
  }
  const day = new Date().getDate();
  const seedVar = Math.abs(hash + day) % 4; // 0, 1, 2, or 3

  // Base fake left between 6 and 9 seats (e.g. 7 left, 8 left)
  const baseLeft = 6 + seedVar;

  // Proportionally scale available seats down as real capacity fills up
  const ratio = realAvailable / total;
  let available = Math.max(1, Math.min(realAvailable, Math.round(baseLeft * ratio + (seedVar % 2))));

  const enrolled = total - available;
  const pct = Math.min(98, Math.max(15, Math.round((enrolled / total) * 100)));

  return {
    available,
    enrolled,
    pct,
    isFull: false,
  };
}
