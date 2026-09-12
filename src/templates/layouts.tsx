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
