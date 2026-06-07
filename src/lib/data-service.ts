import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Profile, Project, Education, Experience, Certificate, Skill, Photo } from '@/lib/types'
import { TECH_STACK } from '@/lib/constants'

// 1. MOCK PROFILE
export const MOCK_PROFILE: Profile = {
  id: "mock-admin-id",
  name: "Al Fitra Nur Ramadhani",
  headline: "Data Enthusiast & Scientist",
  about_me: "Informatics graduate from University of Muhammadiyah Malang, specializing in data analytics and machine learning. Proficient in Python, SQL, Excel, and Tableau, with experience in end-to-end data handling and a solid foundation in mathematics and programming, strong analytical, problem-solving skills and a passion for continuous learning. Seeking opportunities to apply expertise in dynamic environments while advancing in data-driven technologies.",
  avatar_url: null,
  resume_url: null,
  instagram_url: "https://www.instagram.com/rmdhani_ii",
  linkedin_url: "https://www.linkedin.com/in/al-fitra-nur-ramadhani/",
  github_url: "https://github.com/alfitranurr"
}


// 3. MOCK PROJECTS
export const MOCK_PROJECTS: Project[] = [
  {
    id: "mock-proj-1",
    title: "Predictive Customer Churn Pipeline",
    description: "Built a production-ready machine learning pipeline using XGBoost to predict customer attrition with 92% accuracy, highlighting key risk drivers in a Tableau dashboard.",
    category: "data",
    sub_category: "Data Analytics Projects",
    cover_image: null,
    github_url: "https://github.com/alfitranurr",
    demo_url: null,
    notebook_url: "https://colab.research.google.com",
    slide_url: null,
    embed_code: null,
    is_featured: true,
    pinned_order: 1,
    created_at: "2026-01-15T00:00:00Z",
    content: `## Executive Summary
This project analyzes customer attrition using machine learning techniques to help a telecommunication company identify high-risk accounts and formulate retention strategies.

### Dataset
The analysis is based on the Telco Churn dataset containing **7,043 customer accounts** with 21 demographic, billing, and usage metrics.

### Methodology
1. **Exploratory Data Analysis (EDA)**: Identified correlations between contract types, tenure, and churn rates.
2. **Feature Engineering**: Normalized numerical metrics, handled missing value imputations, and encoded categorical fields.
3. **Modeling**: Benchmarked Logistic Regression, Random Forest, and XGBoost models.
4. **Evaluation**: XGBoost yielded the best results, achieving a ROC-AUC score of **0.94** and overall accuracy of **92%** on test partitions.

\`\`\`python
# Training sample code
import xgboost as xgb
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = xgb.XGBClassifier(max_depth=5, learning_rate=0.1, n_estimators=100)
model.fit(X_train, y_train)
\`\`\`
`
  },
  {
    id: "mock-proj-2",
    title: "Computer Vision Traffic Classifier",
    description: "Designed a convolutional neural network (CNN) in PyTorch to classify and count vehicles in real-time urban traffic streams, decreasing telemetry latency by 35%.",
    category: "data",
    sub_category: "Artificial Intelligence Projects",
    cover_image: null,
    github_url: "https://github.com/alfitranurr",
    demo_url: null,
    notebook_url: null,
    slide_url: null,
    embed_code: null,
    is_featured: true,
    pinned_order: 2,
    created_at: "2026-02-10T00:00:00Z",
    content: `## Deep Learning for Urban Mobility
An automated video analytics pipeline using PyTorch and OpenCV to identify, count, and classify urban vehicles (sedans, trucks, motorbikes) at complex intersections.

### Architecture
- **Model**: Custom ResNet-18 backbone with transfer learning.
- **Data Augmentation**: Albumentations for light, perspective, and noise simulation.
- **Deployment**: ONNX Runtime wrapper integrated with a fast API.

### Key Results
- Multi-class vehicle classification accuracy: **96.8%**.
- Frame rate throughput: **42 FPS** on a single GTX 1080Ti.
`
  },
  {
    id: "mock-proj-3",
    title: "Interactive Global Supply Chain Dashboard",
    description: "Designed and implemented an interactive logistics dashboard in Tableau tracking shipment delays, saving logistic dispatch managers over 10 hours a week.",
    category: "data",
    sub_category: "Data Visualization Projects",
    cover_image: null,
    github_url: "https://github.com/alfitranurr",
    demo_url: null,
    notebook_url: null,
    slide_url: null,
    embed_code: null,
    is_featured: true,
    pinned_order: 3,
    created_at: "2026-03-05T00:00:00Z",
    content: `## Tableau Global Supply Chain Analysis
An interactive visualization tracking international transport routes, warehouse inventory levels, and logistics delays.

### Core Features
- Map overlays showing flight & cargo routes
- Gantt charts for shipment delivery delays
- Dropdowns for supplier-specific filtering
- Integrated forecasting model indicating bottleneck zones
`
  },
  {
    id: "mock-proj-4",
    title: "Gen-Z E-Commerce UI System",
    description: "A fast, responsive web application showcasing an intuitive checkout experience designed with Tailwind CSS, Next.js, and glassmorphic designs.",
    category: "non-data",
    sub_category: "Web Development Projects",
    cover_image: null,
    github_url: "https://github.com/alfitranurr",
    demo_url: null,
    notebook_url: null,
    slide_url: null,
    embed_code: null,
    is_featured: false,
    pinned_order: 0,
    created_at: "2026-04-18T00:00:00Z",
    content: `## E-Commerce Visual Aesthetics
A design-first client interface focusing on animations, dark theme setups, and frictionless item checkout.

### Highlights
- Framer Motion slide-in animations.
- LocalState-cached cart items.
- Fully typed forms with Zod and React Hook Form.
`
  }
]

// 4. MOCK EDUCATION
export const MOCK_EDUCATION: Education[] = [
  {
    id: "mock-edu-1",
    institution: "State University of Indonesia",
    degree: "Bachelor of Science",
    field_of_study: "Information Systems & Data Analytics",
    location: "Jakarta, Indonesia",
    start_date: "2022-09-01",
    end_date: "2026-06-30",
    gpa: 3.92,
    description: "Focused on business intelligence, statistics, and machine learning. Recipient of National Academic Scholarship. Completed thesis on Deep Learning for crop yield forecasting.",
    logo_url: null
  },
  {
    id: "mock-edu-2",
    institution: "Semarang Science High School",
    degree: "High School Diploma",
    field_of_study: "Natural Sciences & Mathematics",
    location: "Semarang, Indonesia",
    start_date: "2019-07-01",
    end_date: "2022-06-30",
    gpa: 3.88,
    description: "Competed in National Mathematics Olympiad. Leader of Informatics Student Association.",
    logo_url: null
  }
]

// 5. MOCK EXPERIENCE
export const MOCK_EXPERIENCE: Experience[] = [
  {
    id: "mock-exp-1",
    role: "Data Analyst Intern",
    company: "Astra International",
    location: "Jakarta, Indonesia (Hybrid)",
    start_date: "2025-01-10",
    end_date: null,
    is_current: true,
    description: [
      "Optimized operational ETL pipelines using Python and SQL, reducing automated report latency by 25%.",
      "Built 12+ dashboard pages in Tableau to analyze automobile supply chains and shipment durations.",
      "Collaborated with data engineers to cleanse raw web event streams and identify product click-through patterns."
    ],
    category: 'professional',
    logo_url: null
  },
  {
    id: "mock-exp-2",
    role: "Data Science Project Lead",
    company: "University Research Laboratory",
    location: "Depok, Indonesia",
    start_date: "2024-02-15",
    end_date: "2024-12-20",
    is_current: false,
    description: [
      "Led a team of 4 students to build predictive modeling scripts on local agricultural crop yields.",
      "Applied hyperparameter optimization on Random Forest and LightGBM models, boosting F1-score to 0.89.",
      "Presented project metrics at national student symposium and compiled project documentation."
    ],
    category: 'committee_organization',
    logo_url: null
  }
]

// 6. MOCK CERTIFICATES
export const MOCK_CERTIFICATES: Certificate[] = [
  {
    id: "mock-cert-1",
    title: "1st Place Winner - Data Hackathon",
    issuer: "Informatics Association Indonesia",
    issue_date: "2025-10-12",
    credential_url: null,
    credential_id: "HACK-2025-10",
    category: "competition"
  },
  {
    id: "mock-cert-2",
    title: "Professional Data Scientist Certification",
    issuer: "BNSP (National Certification Board)",
    issue_date: "2025-05-18",
    credential_url: "https://bnsp.go.id",
    credential_id: "BNSP-DS-7718A",
    category: "license_certification"
  },
  {
    id: "mock-cert-3",
    title: "Big Data & PySpark Foundations Workshop",
    issuer: "Google Developer Student Clubs",
    issue_date: "2024-11-04",
    credential_url: null,
    credential_id: null,
    category: "seminar_workshop"
  },
  {
    id: "mock-cert-4",
    title: "Head of Publicity Committee",
    issuer: "National Student Tech Festival",
    issue_date: "2024-09-10",
    credential_url: null,
    credential_id: null,
    category: "committee_organization"
  }
]

// Helper checks if env variables exist
function hasSupabaseConfig(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// PROFILE SERVICE
export async function getProfile(): Promise<Profile> {
  if (!hasSupabaseConfig()) {
    try {
      const cookieStore = await cookies()
      const mockProfileStr = cookieStore.get('mock_profile')?.value
      if (mockProfileStr) {
        return JSON.parse(mockProfileStr)
      }
    } catch (e: any) {
      if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) {
        throw e
      }
      console.warn('Failed to parse mock profile from cookies', e)
    }
    return MOCK_PROFILE
  }
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (error || !data) {
      console.warn('Profile fetch failed, using fallback mock data:', error?.message)
      return MOCK_PROFILE
    }
    return data
  } catch (err) {
    console.warn('Profile connection error, using fallback:', err)
    return MOCK_PROFILE
  }
}

function sortProjects(list: Project[]): Project[] {
  return [...list].sort((a, b) => {
    const aPin = a.pinned_order !== null && a.pinned_order !== undefined && a.pinned_order > 0 ? a.pinned_order : Infinity
    const bPin = b.pinned_order !== null && b.pinned_order !== undefined && b.pinned_order > 0 ? b.pinned_order : Infinity

    if (aPin !== bPin) {
      return aPin - bPin
    }

    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
    return bTime - aTime
  })
}

// PROJECTS SERVICE
export async function getProjects(): Promise<Project[]> {
  let projects: Project[] = []
  
  if (!hasSupabaseConfig()) {
    try {
      const cookieStore = await cookies()
      const mockProjectsStr = cookieStore.get('mock_projects')?.value
      if (mockProjectsStr) {
        projects = JSON.parse(mockProjectsStr)
      } else {
        projects = MOCK_PROJECTS
      }
    } catch (e: any) {
      if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) {
        throw e
      }
      console.warn('Failed to parse mock projects from cookies', e)
      projects = MOCK_PROJECTS
    }
  } else {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error || !data || data.length === 0) {
        console.warn('Projects fetch failed, using fallback mock data:', error?.message)
        projects = MOCK_PROJECTS
      } else {
        projects = data
      }
    } catch (err) {
      console.warn('Projects connection error, using fallback:', err)
      projects = MOCK_PROJECTS
    }
  }

  return sortProjects(projects)
}

export async function getProjectById(id: string): Promise<Project | null> {
  if (!hasSupabaseConfig() || id.startsWith('mock-')) {
    try {
      const cookieStore = await cookies()
      const mockProjectsStr = cookieStore.get('mock_projects')?.value
      let list = MOCK_PROJECTS
      if (mockProjectsStr) {
        list = JSON.parse(mockProjectsStr)
      }
      return list.find(p => p.id === id) || null
    } catch (e: any) {
      if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) {
        throw e
      }
      console.warn('Failed to parse mock project details from cookies', e)
    }
    return MOCK_PROJECTS.find(p => p.id === id) || null
  }
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error || !data) {
      console.warn(`Project ID ${id} fetch failed, checking fallback:`, error?.message)
      return MOCK_PROJECTS.find(p => p.id === id) || null
    }
    return data
  } catch (err) {
    console.warn('Project by id connection error, using fallback:', err)
    return MOCK_PROJECTS.find(p => p.id === id) || null
  }
}

// EDUCATION SERVICE
export async function getEducation(): Promise<Education[]> {
  if (!hasSupabaseConfig()) {
    try {
      const cookieStore = await cookies()
      const mockEduStr = cookieStore.get('mock_education')?.value
      if (mockEduStr) {
        return JSON.parse(mockEduStr)
      }
    } catch (e: any) {
      if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) {
        throw e
      }
      console.warn('Failed to parse mock education from cookies', e)
    }
    return MOCK_EDUCATION
  }
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .order('start_date', { ascending: false })

    if (error || !data || data.length === 0) {
      console.warn('Education fetch failed, using fallback mock data:', error?.message)
      return MOCK_EDUCATION
    }
    return data
  } catch (err) {
    console.warn('Education connection error, using fallback:', err)
    return MOCK_EDUCATION
  }
}

// EXPERIENCE SERVICE
export async function getExperience(): Promise<Experience[]> {
  if (!hasSupabaseConfig()) {
    try {
      const cookieStore = await cookies()
      const mockExpStr = cookieStore.get('mock_experience')?.value
      if (mockExpStr) {
        return JSON.parse(mockExpStr)
      }
    } catch (e: any) {
      if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) {
        throw e
      }
      console.warn('Failed to parse mock experience from cookies', e)
    }
    return MOCK_EXPERIENCE
  }
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('start_date', { ascending: false })

    if (error || !data || data.length === 0) {
      console.warn('Experiences fetch failed, using fallback mock data:', error?.message)
      return MOCK_EXPERIENCE
    }
    return data
  } catch (err) {
    console.warn('Experiences connection error, using fallback:', err)
    return MOCK_EXPERIENCE
  }
}

// CERTIFICATES SERVICE
export async function getCertificates(): Promise<Certificate[]> {
  if (!hasSupabaseConfig()) {
    try {
      const cookieStore = await cookies()
      const mockCertStr = cookieStore.get('mock_certificates')?.value
      if (mockCertStr) {
        return JSON.parse(mockCertStr)
      }
    } catch (e: any) {
      if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) {
        throw e
      }
      console.warn('Failed to parse mock certificates from cookies', e)
    }
    return MOCK_CERTIFICATES
  }
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('issue_date', { ascending: false })

    if (error || !data || data.length === 0) {
      console.warn('Certificates fetch failed, using fallback mock data:', error?.message)
      return MOCK_CERTIFICATES
    }
    return data
  } catch (err) {
    console.warn('Certificates connection error, using fallback:', err)
    return MOCK_CERTIFICATES
  }
}

// 8. SKILLS SERVICE
export async function getSkills(): Promise<Skill[]> {
  if (!hasSupabaseConfig()) {
    try {
      const cookieStore = await cookies()
      const mockSkillsStr = cookieStore.get('mock_skills')?.value
      if (mockSkillsStr) {
        return JSON.parse(mockSkillsStr)
      }
    } catch (e: any) {
      if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) {
        throw e
      }
      console.warn('Failed to parse mock skills from cookies', e)
    }
    // Return initial seed mapped from TECH_STACK
    return TECH_STACK.map((item, idx) => ({
      id: `mock-skill-${idx + 1}`,
      name: item.name,
      category: item.category,
      level: item.level,
      desc: item.desc,
      svg_path: null
    }))
  }
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('category', { ascending: true })
      .order('level', { ascending: false })

    if (error || !data || data.length === 0) {
      console.warn('Skills fetch failed, using fallback mock data:', error?.message)
      return TECH_STACK.map((item, idx) => ({
        id: `mock-skill-${idx + 1}`,
        name: item.name,
        category: item.category,
        level: item.level,
        desc: item.desc,
        svg_path: null
      }))
    }
    return data
  } catch (err) {
    console.warn('Skills connection error, using fallback:', err)
    return TECH_STACK.map((item, idx) => ({
      id: `mock-skill-${idx + 1}`,
      name: item.name,
      category: item.category,
      level: item.level,
      desc: item.desc,
      svg_path: null
    }))
  }
}

export interface VisitorStats {
  totalViews: number
  uniqueVisitors: number
  todayViews: number
  todayUnique: number
  isMissingTable?: boolean
}

export async function getVisitorStats(): Promise<VisitorStats> {
  if (!hasSupabaseConfig()) {
    return {
      totalViews: 1248,
      uniqueVisitors: 382,
      todayViews: 24,
      todayUnique: 8,
      isMissingTable: false
    }
  }

  try {
    const supabase = await createClient()

    // Call the optimized database RPC function
    const { data, error } = await supabase.rpc('get_visitor_analytics')

    if (error) {
      // Check if function does not exist (error code 42883) or relation doesn't exist (error code 42P01)
      if (error.code === '42883' || error.code === '42P01' || error.message?.includes('does not exist')) {
        return { totalViews: 0, uniqueVisitors: 0, todayViews: 0, todayUnique: 0, isMissingTable: true }
      }
      throw error
    }

    const stats = data && data[0]

    return {
      totalViews: Number(stats?.total_views ?? 0),
      uniqueVisitors: Number(stats?.unique_visitors ?? 0),
      todayViews: Number(stats?.today_views ?? 0),
      todayUnique: Number(stats?.today_unique ?? 0),
      isMissingTable: false
    }
  } catch (err: any) {
    console.warn('Visitor stats connection error or function missing:', err)
    return {
      totalViews: 0,
      uniqueVisitors: 0,
      todayViews: 0,
      todayUnique: 0,
      isMissingTable: true
    }
  }
}

export interface MonthlyVisitorStats {
  month: number
  views: number
  visitors: number
}

export async function getMonthlyVisitorStats(year: number): Promise<{ 
  stats: MonthlyVisitorStats[], 
  yearlyViews: number,
  yearlyVisitors: number,
  isMissingFunction: boolean 
}> {
  if (!hasSupabaseConfig()) {
    // Return realistic monthly mock data
    let mockData = [
      { month: 1, views: 150, visitors: 45 },
      { month: 2, views: 220, visitors: 70 },
      { month: 3, views: 180, visitors: 60 },
      { month: 4, views: 290, visitors: 95 },
      { month: 5, views: 340, visitors: 120 },
      { month: 6, views: 410, visitors: 150 },
      { month: 7, views: 380, visitors: 135 },
      { month: 8, views: 480, visitors: 180 },
      { month: 9, views: 520, visitors: 200 },
      { month: 10, views: 610, visitors: 230 },
      { month: 11, views: 750, visitors: 280 },
      { month: 12, views: 900, visitors: 350 },
    ]
    let yearlyViews = 4850
    let yearlyVisitors = 1100

    if (year === 2025) {
      mockData = [
        { month: 1, views: 80, visitors: 25 },
        { month: 2, views: 95, visitors: 30 },
        { month: 3, views: 110, visitors: 35 },
        { month: 4, views: 120, visitors: 40 },
        { month: 5, views: 130, visitors: 45 },
        { month: 6, views: 140, visitors: 50 },
        { month: 7, views: 150, visitors: 52 },
        { month: 8, views: 160, visitors: 55 },
        { month: 9, views: 170, visitors: 58 },
        { month: 10, views: 180, visitors: 60 },
        { month: 11, views: 190, visitors: 65 },
        { month: 12, views: 200, visitors: 70 },
      ]
      yearlyViews = 1795
      yearlyVisitors = 420
    } else if (year === 2026) {
      yearlyViews = 1248
      yearlyVisitors = 382
    }
    return { stats: mockData, yearlyViews, yearlyVisitors, isMissingFunction: false }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_monthly_analytics', { target_year: year })

    if (error) {
      throw error
    }

    // Map database result to MonthlyVisitorStats format
    const mappedStats = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      views: 0,
      visitors: 0
    }))

    let yearlyViews = 0
    let yearlyVisitors = 0

    if (data && Array.isArray(data)) {
      if (data.length > 0) {
        yearlyViews = Number(data[0].yearly_views ?? 0)
        yearlyVisitors = Number(data[0].yearly_visitors ?? 0)
      }
      data.forEach((row: any) => {
        const m = Number(row.month_num)
        if (m >= 1 && m <= 12) {
          mappedStats[m - 1].views = Number(row.views_count ?? 0)
          mappedStats[m - 1].visitors = Number(row.visitors_count ?? 0)
        }
      })
    }

    return { stats: mappedStats, yearlyViews, yearlyVisitors, isMissingFunction: false }
  } catch (err: any) {
    console.warn(`Monthly stats connection error or function missing for year ${year}:`, err)
    const isMissing = err?.code === '42883' || err?.code === '42P01' || err?.message?.includes('does not exist')
    return {
      stats: Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        views: 0,
        visitors: 0
      })),
      yearlyViews: 0,
      yearlyVisitors: 0,
      isMissingFunction: isMissing
    }
  }
}

export async function getAvailableYears(): Promise<number[]> {
  if (!hasSupabaseConfig()) {
    return [2026, 2025]
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_available_years')

    if (error) {
      throw error
    }

    if (data && Array.isArray(data) && data.length > 0) {
      return data.map((row: any) => Number(row.year_val)).filter(Boolean)
    }

    return [new Date().getFullYear()]
  } catch (err) {
    console.warn('Available years fetch error:', err)
    return [new Date().getFullYear()]
  }
}

// 12. PHOTOS / MOMENT RECAP SERVICE
export const MOCK_PHOTOS: Photo[] = [
  {
    id: "mock-photo-1",
    title: "The Spark of Code",
    year: "2020",
    description: "Began my journey into software engineering, writing my first lines of code and building my first websites.",
    image_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "mock-photo-2",
    title: "Collaboration & Hackathons",
    year: "2021",
    description: "Joined my first hackathons, building prototype projects and learning teamwork under tight deadlines.",
    image_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "mock-photo-3",
    title: "Academic Milestone",
    year: "2022",
    description: "Graduated with a degree in Computer Science, solidifying core algorithmic and development concepts.",
    image_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "mock-photo-4",
    title: "Entering the Industry",
    year: "2023",
    description: "Joined PT. Len Industri as a Frontend Developer, building corporate-grade web applications.",
    image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "mock-photo-5",
    title: "Climbing Mountains",
    year: "2024",
    description: "Conquered heights in hiking, finding the balance between challenging code and refreshing nature.",
    image_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "mock-photo-6",
    title: "Sharing Knowledge",
    year: "2025",
    description: "Began speaking at developer meetups, mentoring junior developers, and contributing to open source.",
    image_url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80"
  }
]

export async function getPhotos(): Promise<Photo[]> {
  let photos: Photo[] = []

  if (!hasSupabaseConfig()) {
    try {
      const cookieStore = await cookies()
      const mockPhotosStr = cookieStore.get('mock_photos')?.value
      if (mockPhotosStr) {
        photos = JSON.parse(mockPhotosStr)
      } else {
        photos = MOCK_PHOTOS
      }
    } catch (e: any) {
      if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) {
        throw e
      }
      console.warn('Failed to parse mock photos from cookies', e)
      photos = MOCK_PHOTOS
    }
  } else {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('year', { ascending: false })

      if (error) {
        console.warn('Photos table query failed or doesn\'t exist. Falling back to mock data:', error.message)
        try {
          const cookieStore = await cookies()
          const mockPhotosStr = cookieStore.get('mock_photos')?.value
          if (mockPhotosStr) {
            return JSON.parse(mockPhotosStr)
          }
        } catch (cookieErr) {}
        return MOCK_PHOTOS
      }

      if (!data || data.length === 0) {
        return MOCK_PHOTOS
      }
      photos = data
    } catch (err) {
      console.warn('Photos connection error, using fallback:', err)
      return MOCK_PHOTOS
    }
  }

  return photos
}




