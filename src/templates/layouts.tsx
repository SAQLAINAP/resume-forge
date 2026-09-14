import type { TemplateProps } from './primitives'
import { Section } from './primitives'
import {
  AchievementsBlock,
  CertificationsBlock,
  ContactLine,
  EducationBlock,
  EducationTableBlock,
  ExperienceBlock,
  ExtracurricularsBlock,
  LanguagesBlock,
  PositionsBlock,
  ProjectsBlock,
  PublicationsBlock,
  SkillsBlock,
  SkillsStackedBlock,
  SummaryBlock,
} from './blocks'

/**
 * Each layout is a pure function of ResumeData. No local state, no effects —
 * that is what lets the same component render into the preview, the print
 * surface, the PNG rasteriser and (via a walk of the same data) the DOCX.
 */

function Name({ data, className = '' }: TemplateProps & { className?: string }) {
  return <h1 className={`rf-h1 ${className}`}>{data.basics.fullName || 'Your Name'}</h1>
}

/* -- Jake's Resume --------------------------------------------------------- */

export function JakeTemplate({ data }: TemplateProps) {
  return (
    <div className="rf-page rf-jake rf-sans">
      <header className="rf-head">
        <Name data={data} />
        {data.basics.headline && <div className="rf-muted rf-small">{data.basics.headline}</div>}
        <div style={{ marginTop: '1.4mm' }}>
          <ContactLine data={data} />
        </div>
      </header>
      <EducationBlock data={data} />
      <ExperienceBlock data={data} />
      <ProjectsBlock data={data} />
      <SkillsBlock data={data} title="Technical Skills" />
      <AchievementsBlock data={data} />
    </div>
  )
}

/* -- Deedy two-column ------------------------------------------------------ */

export function DeedyTemplate({ data }: TemplateProps) {
  const [first, ...restName] = (data.basics.fullName || 'Your Name').split(' ')
  return (
    <div className="rf-page rf-deedy rf-sans">
      <header style={{ textAlign: 'center', marginBottom: '4mm' }}>
        <h1 className="rf-h1">
          {first} <strong>{restName.join(' ')}</strong>
        </h1>
        <div style={{ marginTop: '1.4mm' }}>
          <ContactLine data={data} />
        </div>
      </header>
      <div className="rf-two-col">
        <div className="rf-col-side">
          <EducationBlock data={data} />
          <SkillsStackedBlock data={data} title="Skills" />
          <LanguagesBlock data={data} />
          <CertificationsBlock data={data} />
        </div>
        <div className="rf-col-main">
          <ExperienceBlock data={data} />
          <ProjectsBlock data={data} />
          <AchievementsBlock data={data} title="Awards" />
        </div>
      </div>
    </div>
  )
}

/* -- Harvard OCS ----------------------------------------------------------- */

export function HarvardTemplate({ data }: TemplateProps) {
  return (
    <div className="rf-page rf-harvard rf-letter">
      <header className="rf-head">
        <Name data={data} />
        <div style={{ marginTop: '1.6mm' }}>
          <ContactLine data={data} />
        </div>
      </header>
      <EducationBlock data={data} />
      <ExperienceBlock data={data} />
      <ProjectsBlock data={data} title="Projects & Research" />
      <PositionsBlock data={data} title="Leadership & Activities" />
      <SkillsBlock data={data} title="Skills, Interests & Languages" />
      <LanguagesBlock data={data} />
    </div>
  )
}

/* -- MIT EECS -------------------------------------------------------------- */

export function MitTemplate({ data }: TemplateProps) {
  return (
    <div className="rf-page rf-mit rf-letter rf-sans">
      <header style={{ marginBottom: '3mm' }}>
        <Name data={data} />
        <div style={{ marginTop: '1.2mm', textAlign: 'left' }}>
          <div className="rf-contact" style={{ justifyContent: 'flex-start' }}>
            <ContactLine data={data} />
          </div>
        </div>
      </header>
      <EducationBlock data={data} />
      <ExperienceBlock data={data} />
      <ProjectsBlock data={data} />
      <PublicationsBlock data={data} />
      <SkillsBlock data={data} title="Technical Skills" />
      <AchievementsBlock data={data} title="Honors & Awards" />
    </div>
  )
}

/* -- Stanford -------------------------------------------------------------- */

export function StanfordTemplate({ data }: TemplateProps) {
  return (
    <div className="rf-page rf-stanford rf-letter rf-sans">
      <header style={{ marginBottom: '4mm' }}>
        <Name data={data} />
        {data.basics.headline && <div className="rf-muted">{data.basics.headline}</div>}
        <div style={{ marginTop: '1.6mm' }}>
          <div className="rf-contact" style={{ justifyContent: 'flex-start' }}>
            <ContactLine data={data} />
          </div>
        </div>
      </header>
      <SummaryBlock data={data} title="Profile" />
      <ExperienceBlock data={data} />
      <EducationBlock data={data} />
      <ProjectsBlock data={data} />
      <SkillsBlock data={data} />
      <AchievementsBlock data={data} title="Honors" />
    </div>
  )
}

/* -- IIT Bombay ------------------------------------------------------------ */

export function IitbTemplate({ data }: TemplateProps) {
  return (
    <div className="rf-page rf-iitb rf-sans">
      <header style={{ marginBottom: '3mm' }}>
        <div className="rf-row">
          <div className="rf-row-left">
            <Name data={data} />
            {data.basics.headline && <div className="rf-muted rf-small">{data.basics.headline}</div>}
          </div>
        </div>
        <div style={{ marginTop: '1.4mm' }}>
          <div className="rf-contact" style={{ justifyContent: 'flex-start' }}>
            <ContactLine data={data} />
          </div>
        </div>
      </header>
      <EducationTableBlock data={data} />
      <ExperienceBlock data={data} title="Internships & Work Experience" />
      <ProjectsBlock data={data} />
      <AchievementsBlock data={data} title="Scholastic Achievements" />
      <PositionsBlock data={data} />
      <SkillsBlock data={data} title="Technical Skills" />
      <ExtracurricularsBlock data={data} />
    </div>
  )
}

/* -- IIT Kharagpur --------------------------------------------------------- */

export function IitkgpTemplate({ data }: TemplateProps) {
  return (
    <div className="rf-page rf-iitkgp rf-sans">
      <header style={{ textAlign: 'center', marginBottom: '3mm' }}>
        <Name data={data} />
        <div style={{ marginTop: '1.2mm' }}>
          <ContactLine data={data} showDob />
        </div>
      </header>
      <EducationTableBlock data={data} />
      <AchievementsBlock data={data} title="Scholastic Achievements" />
      <ExperienceBlock data={data} title="Internships" />
      <ProjectsBlock data={data} title="Projects & Technical Work" />
      <SkillsBlock data={data} title="Technical Skills" />
      <PositionsBlock data={data} />
      <ExtracurricularsBlock data={data} />
    </div>
  )
}

/* -- NIT Jamshedpur -------------------------------------------------------- */

export function NitTemplate({ data }: TemplateProps) {
  return (
    <div className="rf-page rf-nit rf-sans">
      <header className="rf-head">
        <div className="rf-row">
          <div className="rf-row-left">
            <Name data={data} />
            {data.basics.headline && <div className="rf-muted rf-small">{data.basics.headline}</div>}
          </div>
          <div className="rf-row-right" style={{ whiteSpace: 'normal', textAlign: 'right', maxWidth: '70mm' }}>
            <div className="rf-contact" style={{ justifyContent: 'flex-end' }}>
              <ContactLine data={data} />
            </div>
          </div>
        </div>
      </header>
      <EducationTableBlock data={data} />
      <ExperienceBlock data={data} title="Industrial Training & Internships" />
      <ProjectsBlock data={data} />
      <SkillsBlock data={data} title="Technical Skills" />
      <AchievementsBlock data={data} />
      <PositionsBlock data={data} />
      <CertificationsBlock data={data} />
      <ExtracurricularsBlock data={data} />
    </div>
  )
}

/* -- Plain ATS ------------------------------------------------------------- */

export function PlainTemplate({ data }: TemplateProps) {
  return (
    <div className="rf-page rf-plain rf-sans rf-letter">
      <header style={{ marginBottom: '4mm' }}>
        <Name data={data} />
        {data.basics.headline && <div className="rf-muted">{data.basics.headline}</div>}
        <div style={{ marginTop: '1.6mm' }}>
          <div className="rf-contact" style={{ justifyContent: 'flex-start' }}>
            <ContactLine data={data} />
          </div>
        </div>
      </header>
      <SummaryBlock data={data} title="Professional Summary" />
      <SkillsBlock data={data} title="Core Skills" />
      <ExperienceBlock data={data} title="Professional Experience" />
      <EducationBlock data={data} />
      <ProjectsBlock data={data} />
      <CertificationsBlock data={data} />
      <AchievementsBlock data={data} />
      <LanguagesBlock data={data} />
    </div>
  )
}

/* -- Executive ------------------------------------------------------------- */

export function ExecTemplate({ data }: TemplateProps) {
  return (
    <div className="rf-page rf-exec rf-sans rf-letter">
      <header className="rf-head">
        <Name data={data} />
        {data.basics.headline && <div className="rf-muted" style={{ marginTop: '0.8mm' }}>{data.basics.headline}</div>}
        <div style={{ marginTop: '2mm' }}>
          <div className="rf-contact" style={{ justifyContent: 'flex-start' }}>
            <ContactLine data={data} />
          </div>
        </div>
      </header>
      <SummaryBlock data={data} title="Executive Summary" />
      <ExperienceBlock data={data} title="Leadership Experience" />
      <AchievementsBlock data={data} title="Selected Achievements" />
      <SkillsBlock data={data} title="Areas of Expertise" />
      <EducationBlock data={data} />
      <CertificationsBlock data={data} />
      <Section title="Board & Advisory" show={data.positions.length > 0}>
        <PositionsBlock data={data} title="" />
      </Section>
      <LanguagesBlock data={data} />
    </div>
  )
}

/* -- Research CV ----------------------------------------------------------- */

export function ResearchTemplate({ data }: TemplateProps) {
  return (
    <div className="rf-page rf-harvard rf-letter">
      <header className="rf-head">
        <Name data={data} />
        {data.basics.headline && <div className="rf-italic rf-muted">{data.basics.headline}</div>}
        <div style={{ marginTop: '1.6mm' }}>
          <ContactLine data={data} />
        </div>
      </header>
      <EducationBlock data={data} />
      <PublicationsBlock data={data} />
      <ExperienceBlock data={data} title="Research & Teaching Experience" />
      <AchievementsBlock data={data} title="Grants, Awards & Honors" />
      <ProjectsBlock data={data} title="Selected Projects" />
      <SkillsBlock data={data} title="Technical & Methodological Skills" />
      <LanguagesBlock data={data} />
      <PositionsBlock data={data} title="Service & Membership" />
    </div>
  )
}

/* -- Shared shapes for v2 additions ---------------------------------------- */

/**
 * A "compact band" layout: colored/dark strip at the top, then a single-column
 * body. Used by most FAANG-style formats — the differences are pure CSS.
 */
function BandLayout({
  data,
  variant,
  paper = 'a4',
  showSummary = true,
}: TemplateProps & { variant: string; paper?: 'a4' | 'letter'; showSummary?: boolean }) {
  return (
    <div className={`rf-page rf-band ${variant} rf-sans${paper === 'letter' ? ' rf-letter' : ''}`}>
      <header className="rf-head">
        <Name data={data} />
        {data.basics.headline && <div className="rf-band-headline">{data.basics.headline}</div>}
        <div className="rf-band-contact">
          <ContactLine data={data} />
        </div>
      </header>
      {showSummary && <SummaryBlock data={data} title="Summary" />}
      <ExperienceBlock data={data} />
      <ProjectsBlock data={data} />
      <SkillsBlock data={data} title="Technical Skills" />
      <EducationBlock data={data} />
      <AchievementsBlock data={data} />
      <CertificationsBlock data={data} />
    </div>
  )
}

export function GoogleTemplate(props: TemplateProps) {
  return <BandLayout {...props} variant="rf-band-google" paper="letter" showSummary={false} />
}
export function MetaTemplate(props: TemplateProps) {
  return <BandLayout {...props} variant="rf-band-meta" paper="letter" />
}
export function AmazonTemplate(props: TemplateProps) {
  return <BandLayout {...props} variant="rf-band-amazon" paper="letter" />
}
export function MicrosoftTemplate(props: TemplateProps) {
  return <BandLayout {...props} variant="rf-band-msft" paper="letter" />
}
export function NetflixTemplate(props: TemplateProps) {
  return <BandLayout {...props} variant="rf-band-nflx" paper="letter" showSummary={false} />
}

/**
 * Conservative single column with rules under section headings. Consulting
 * and finance houses. Difference is pigment and spacing.
 */
function ConservativeLayout({
  data,
  variant,
  order = ['edu', 'exp', 'proj', 'skills'],
}: TemplateProps & { variant: string; order?: Array<'edu' | 'exp' | 'proj' | 'skills' | 'ach' | 'lang'> }) {
  const RENDERERS = {
    edu: <EducationBlock data={data} key="edu" />,
    exp: <ExperienceBlock data={data} key="exp" />,
    proj: <ProjectsBlock data={data} key="proj" title="Selected Projects" />,
    skills: <SkillsBlock data={data} key="skills" title="Skills" />,
    ach: <AchievementsBlock data={data} key="ach" title="Honours & Awards" />,
    lang: <LanguagesBlock data={data} key="lang" />,
  } as const
  return (
    <div className={`rf-page rf-conservative ${variant} rf-letter`}>
      <header className="rf-head">
        <Name data={data} />
        {data.basics.headline && <div className="rf-muted rf-small">{data.basics.headline}</div>}
        <div style={{ marginTop: '1.6mm' }}>
          <ContactLine data={data} />
        </div>
      </header>
      <SummaryBlock data={data} title="Profile" />
      {order.map((k) => RENDERERS[k])}
    </div>
  )
}

export function McKinseyTemplate(props: TemplateProps) {
  return <ConservativeLayout {...props} variant="rf-consult-mck" order={['edu', 'exp', 'ach', 'skills', 'lang']} />
}
export function GoldmanTemplate(props: TemplateProps) {
  return <ConservativeLayout {...props} variant="rf-consult-gs" order={['edu', 'exp', 'proj', 'skills']} />
}
export function WhartonTemplate(props: TemplateProps) {
  return <ConservativeLayout {...props} variant="rf-consult-wh" order={['edu', 'exp', 'ach', 'proj', 'skills', 'lang']} />
}

/**
 * Left-sidebar layout. Sidebar holds skills, education, languages; main column
 * carries experience and projects. Same shape as Deedy but tuned for business
 * and design roles rather than SWE density.
 */
function SidebarLayout({ data, variant }: TemplateProps & { variant: string }) {
  return (
    <div className={`rf-page rf-sidebar ${variant} rf-sans`}>
      <header className="rf-head">
        <Name data={data} />
        {data.basics.headline && <div className="rf-muted">{data.basics.headline}</div>}
      </header>
      <div className="rf-two-col">
        <div className="rf-col-side">
          <div className="rf-side-block">
            <h2 className="rf-h2">Contact</h2>
            <ContactLine data={data} />
          </div>
          <SkillsStackedBlock data={data} />
          <EducationBlock data={data} />
          <LanguagesBlock data={data} />
          <CertificationsBlock data={data} />
        </div>
        <div className="rf-col-main">
          <SummaryBlock data={data} title="Summary" />
          <ExperienceBlock data={data} />
          <ProjectsBlock data={data} />
          <AchievementsBlock data={data} />
        </div>
      </div>
    </div>
  )
}

export function BcgTemplate(props: TemplateProps) {
  return <SidebarLayout {...props} variant="rf-sidebar-bcg" />
}
export function BainTemplate(props: TemplateProps) {
  return <SidebarLayout {...props} variant="rf-sidebar-bain" />
}
export function CreativeTemplate(props: TemplateProps) {
  return <SidebarLayout {...props} variant="rf-sidebar-creative" />
}

/* -- Indian campus variants ------------------------------------------------ */

function CampusVariant({ data, variant, subtitle }: TemplateProps & { variant: string; subtitle?: string }) {
  return (
    <div className={`rf-page rf-campus ${variant} rf-sans`}>
      <header className="rf-head">
        <Name data={data} />
        {subtitle && <div className="rf-small rf-muted">{subtitle}</div>}
        {data.basics.headline && <div className="rf-muted rf-small">{data.basics.headline}</div>}
        <div style={{ marginTop: '1.4mm' }}>
          <div className="rf-contact" style={{ justifyContent: 'flex-start' }}>
            <ContactLine data={data} />
          </div>
        </div>
      </header>
      <EducationTableBlock data={data} />
      <AchievementsBlock data={data} title="Scholastic Achievements" />
      <ExperienceBlock data={data} title="Internships & Work Experience" />
      <ProjectsBlock data={data} />
      <SkillsBlock data={data} title="Technical Skills" />
      <PositionsBlock data={data} />
      <CertificationsBlock data={data} />
      <ExtracurricularsBlock data={data} />
    </div>
  )
}

export function BitsTemplate(props: TemplateProps) {
  return <CampusVariant {...props} variant="rf-campus-bits" subtitle="Birla Institute of Technology and Science, Pilani" />
}
export function DtuTemplate(props: TemplateProps) {
  return <CampusVariant {...props} variant="rf-campus-dtu" subtitle="Delhi Technological University" />
}
export function IiitTemplate(props: TemplateProps) {
  return <CampusVariant {...props} variant="rf-campus-iiit" subtitle="International Institute of Information Technology" />
}

/**
 * MBA / business school variant — front-loads leadership and achievements.
 */
function MbaLayout({ data, variant, subtitle }: TemplateProps & { variant: string; subtitle?: string }) {
  return (
    <div className={`rf-page rf-mba ${variant} rf-sans rf-letter`}>
      <header className="rf-head">
        <Name data={data} />
        {subtitle && <div className="rf-small rf-muted">{subtitle}</div>}
        <div style={{ marginTop: '1.4mm' }}>
          <ContactLine data={data} />
        </div>
      </header>
      <EducationBlock data={data} />
      <ExperienceBlock data={data} title="Professional Experience" />
      <PositionsBlock data={data} title="Leadership & Community" />
      <AchievementsBlock data={data} title="Distinctions" />
      <SkillsBlock data={data} title="Skills & Interests" />
      <LanguagesBlock data={data} />
    </div>
  )
}

export function IimTemplate(props: TemplateProps) {
  return <MbaLayout {...props} variant="rf-mba-iim" subtitle="Indian Institute of Management" />
}
export function IsbTemplate(props: TemplateProps) {
  return <MbaLayout {...props} variant="rf-mba-isb" subtitle="Indian School of Business" />
}
export function InseadTemplate(props: TemplateProps) {
  return <MbaLayout {...props} variant="rf-mba-insead" subtitle="INSEAD" />
}

/* -- European CV variants -------------------------------------------------- */

function EuroCvLayout({ data, variant }: TemplateProps & { variant: string }) {
  return (
    <div className={`rf-page rf-euro ${variant}`}>
      <header className="rf-head">
        <Name data={data} />
        {data.basics.headline && <div className="rf-italic rf-muted">{data.basics.headline}</div>}
        <div style={{ marginTop: '1.4mm' }}>
          <ContactLine data={data} />
        </div>
      </header>
      <SummaryBlock data={data} title="Personal Statement" />
      <EducationBlock data={data} />
      <ExperienceBlock data={data} title="Work Experience" />
      <ProjectsBlock data={data} />
      <PublicationsBlock data={data} />
      <SkillsBlock data={data} title="Skills" />
      <LanguagesBlock data={data} />
      <AchievementsBlock data={data} />
    </div>
  )
}

export function OxfordTemplate(props: TemplateProps) {
  return <EuroCvLayout {...props} variant="rf-euro-ox" />
}
export function CambridgeTemplate(props: TemplateProps) {
  return <EuroCvLayout {...props} variant="rf-euro-cam" />
}
export function EuropassTemplate(props: TemplateProps) {
  return <EuroCvLayout {...props} variant="rf-euro-europass" />
}

/* -- Format variants (chronological / functional / hybrid / federal) ------- */

export function ChronologicalTemplate({ data }: TemplateProps) {
  return (
    <div className="rf-page rf-chron rf-sans rf-letter">
      <header className="rf-head">
        <Name data={data} />
        {data.basics.headline && <div className="rf-muted">{data.basics.headline}</div>}
        <div style={{ marginTop: '1.4mm' }}>
          <ContactLine data={data} />
        </div>
      </header>
      <SummaryBlock data={data} />
      <ExperienceBlock data={data} title="Career History" />
      <EducationBlock data={data} />
      <SkillsBlock data={data} title="Skills" />
      <CertificationsBlock data={data} />
    </div>
  )
}

export function FunctionalTemplate({ data }: TemplateProps) {
  return (
    <div className="rf-page rf-functional rf-sans rf-letter">
      <header className="rf-head">
        <Name data={data} />
        {data.basics.headline && <div className="rf-muted">{data.basics.headline}</div>}
        <div style={{ marginTop: '1.4mm' }}>
          <ContactLine data={data} />
        </div>
      </header>
      <SummaryBlock data={data} />
      <SkillsBlock data={data} title="Core Competencies" />
      <ProjectsBlock data={data} title="Selected Work" />
      <ExperienceBlock data={data} title="Employment History" />
      <EducationBlock data={data} />
      <CertificationsBlock data={data} />
    </div>
  )
}

export function FederalTemplate({ data }: TemplateProps) {
  return (
    <div className="rf-page rf-federal rf-letter">
      <header style={{ marginBottom: '3mm' }}>
        <Name data={data} />
        {data.basics.headline && <div className="rf-muted">{data.basics.headline}</div>}
        <div style={{ marginTop: '1.4mm' }}>
          <div className="rf-contact" style={{ justifyContent: 'flex-start' }}>
            <ContactLine data={data} />
          </div>
        </div>
      </header>
      <SummaryBlock data={data} title="Objective" />
      <ExperienceBlock data={data} title="Professional Experience" />
      <EducationBlock data={data} />
      <SkillsBlock data={data} title="Knowledge, Skills & Abilities" />
      <CertificationsBlock data={data} />
      <AchievementsBlock data={data} title="Awards & Recognition" />
      <PositionsBlock data={data} title="Additional Service" />
    </div>
  )
}
