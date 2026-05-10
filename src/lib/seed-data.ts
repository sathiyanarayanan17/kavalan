import type { Case, Evidence, DigitalEvidence, CaseActivity } from "@/types";

// ─── Cases ────────────────────────────────────────────────────────────────────

export const SEED_CASES: Case[] = [
	{
		id: "case-001",
		caseRef: "CASE-2024-0187",
		title: "Rosewood Manor Suspicious Death",
		status: "ACTIVE",
		riskLevel: "HIGH",
		riskScore: 74,
		location: "14 Rosewood Ave, Northgate",
		dateCreated: "2024-11-03T08:22:00Z",
		dateOfIncident: "2024-11-01T23:00:00Z",
		assignedAgent: "Det. Sarah Okafor",
		suspectCount: 3,
		evidenceCount: 12,
		victimName: "Eleanor Voss",
		description:
			"Suspicious death of a 58-year-old retired attorney found in her study. Initial responders noted locked doors, overturned furniture, and signs of a staged scene.",
		tags: '["homicide","staged","attorney","wealthy"]',
	},
	{
		id: "case-002",
		caseRef: "CASE-2024-0203",
		title: "Port District Homicide",
		status: "ACTIVE",
		riskLevel: "CRITICAL",
		riskScore: 91,
		location: "Pier 17, Eastport District",
		dateCreated: "2024-11-08T03:14:00Z",
		dateOfIncident: "2024-11-07T21:30:00Z",
		assignedAgent: "Det. James Reeves",
		suspectCount: 5,
		evidenceCount: 23,
		victimName: "Marco DeSilva",
		description:
			"Execution-style homicide at the port. Victim identified as mid-level organized crime operative. Multiple witnesses fled scene. CCTV partially disabled before the incident.",
		tags: '["organized-crime","execution","cctv-tampering","multiple-suspects"]',
	},
	{
		id: "case-003",
		caseRef: "CASE-2024-0156",
		title: "Greenfield Park Discovery",
		status: "PENDING",
		riskLevel: "MEDIUM",
		riskScore: 42,
		location: "Greenfield Municipal Park, Sector 4",
		dateCreated: "2024-10-21T11:05:00Z",
		dateOfIncident: "2024-10-20T06:00:00Z",
		assignedAgent: "Det. Priya Nair",
		suspectCount: 1,
		evidenceCount: 7,
		victimName: "Unknown Male (John Doe)",
		description:
			"Unidentified male discovered by park maintenance. Possible drug-related or exposure death. Toxicology pending. No ID found on person.",
		tags: '["unidentified","possible-overdose","outdoor"]',
	},
	{
		id: "case-004",
		caseRef: "CASE-2024-0219",
		title: "Metro Station Incident",
		status: "ACTIVE",
		riskLevel: "CRITICAL",
		riskScore: 96,
		location: "Central Metro Station, Platform 3",
		dateCreated: "2024-11-10T07:45:00Z",
		dateOfIncident: "2024-11-10T06:22:00Z",
		assignedAgent: "Det. Marcus Webb",
		suspectCount: 2,
		evidenceCount: 31,
		victimName: "Multiple Victims (3)",
		description:
			"Coordinated attack during morning rush. Three fatalities, seven injured. Suspect fled via maintenance corridor. Counter-terrorism unit notified. Active investigation.",
		tags: '["terrorism","mass-casualty","ct-unit","high-priority"]',
	},
	{
		id: "case-005",
		caseRef: "CASE-2023-0098",
		title: "Riverside Cold Case Reopened",
		status: "COLD",
		riskLevel: "LOW",
		riskScore: 18,
		location: "Riverside District, Former Textile Mill",
		dateCreated: "2023-04-12T14:00:00Z",
		dateOfIncident: "2023-04-09T00:00:00Z",
		assignedAgent: "Det. Linda Park",
		suspectCount: 0,
		evidenceCount: 4,
		victimName: "Patricia Chen",
		description:
			"Cold case reopened following new forensic DNA evidence. Victim found in abandoned mill in 2023. Original investigation inconclusive. New trace evidence submitted for analysis.",
		tags: '["cold-case","dna-evidence","reopened","abandoned-structure"]',
	},
	// ─── Tamil Nadu regional cases ──────────────────────────────────────────────
	{
		id: "case-tn-01",
		caseRef: "CASE-2026-0071",
		title: "Marina Beach Body Recovery",
		status: "ACTIVE",
		riskLevel: "HIGH",
		riskScore: 72,
		location: "Marina Beach, Chennai, Tamil Nadu",
		dateCreated: "2026-04-18T06:45:00Z",
		dateOfIncident: "2026-04-17T22:00:00Z",
		assignedAgent: "Insp. R. Karthik",
		suspectCount: 2,
		evidenceCount: 9,
		victimName: "Anand Kumar",
		description:
			"Male in early 30s recovered from surf near Marina Beach lighthouse. Saline water in lungs alongside ligature marks on neck — possible homicide staged as drowning.",
		tags: '["drowning","possible-homicide","coastal","ligature"]',
	},
	{
		id: "case-tn-02",
		caseRef: "CASE-2026-0084",
		title: "Coimbatore Textile Mill Fire Fatality",
		status: "ACTIVE",
		riskLevel: "CRITICAL",
		riskScore: 88,
		location: "SIDCO Industrial Estate, Coimbatore, Tamil Nadu",
		dateCreated: "2026-04-29T08:20:00Z",
		dateOfIncident: "2026-04-29T03:40:00Z",
		assignedAgent: "DSP V. Meenakshi",
		suspectCount: 4,
		evidenceCount: 18,
		victimName: "Multiple Victims (2)",
		description:
			"Fire at textile mill during off-shift hours killed 2 overnight staff. Accelerant traces detected; possible arson concealing embezzlement activity.",
		tags: '["arson","industrial","embezzlement","accelerant"]',
	},
	{
		id: "case-tn-03",
		caseRef: "CASE-2026-0059",
		title: "Madurai Temple District Homicide",
		status: "PENDING",
		riskLevel: "HIGH",
		riskScore: 64,
		location: "East Chitrai Street, Madurai, Tamil Nadu",
		dateCreated: "2026-04-02T19:00:00Z",
		dateOfIncident: "2026-04-02T02:30:00Z",
		assignedAgent: "Insp. S. Arun Prakash",
		suspectCount: 1,
		evidenceCount: 11,
		victimName: "Lakshmi Venkatesh",
		description:
			"Retired jeweller found deceased in her home near the Meenakshi Amman temple district. Signs of forced entry; gold ornaments and cash missing from concealed safe.",
		tags: '["robbery-homicide","forced-entry","jeweller","gold"]',
	},
	{
		id: "case-tn-04",
		caseRef: "CASE-2026-0045",
		title: "Trichy Rock Fort Highway Death",
		status: "PENDING",
		riskLevel: "MEDIUM",
		riskScore: 41,
		location: "NH-38 near Rock Fort, Tiruchirappalli, Tamil Nadu",
		dateCreated: "2026-03-12T10:15:00Z",
		dateOfIncident: "2026-03-12T04:45:00Z",
		assignedAgent: "Insp. N. Palani",
		suspectCount: 0,
		evidenceCount: 6,
		victimName: "Unknown Male (John Doe)",
		description:
			"Pedestrian struck and killed on NH-38; driver fled the scene. Unidentified male in early 40s. No CCTV on that stretch; awaiting paint-flake analysis.",
		tags: '["hit-and-run","unidentified","highway"]',
	},
	{
		id: "case-tn-05",
		caseRef: "CASE-2024-0021",
		title: "Ooty Botanical Gardens Cold Case",
		status: "COLD",
		riskLevel: "LOW",
		riskScore: 22,
		location: "Botanical Gardens, Ooty (Udhagamandalam), Tamil Nadu",
		dateCreated: "2024-02-14T09:30:00Z",
		dateOfIncident: "2023-11-22T00:00:00Z",
		assignedAgent: "Det. L. Kavitha",
		suspectCount: 0,
		evidenceCount: 3,
		victimName: "Jane Doe (identified 2026)",
		description:
			"Cold case from 2023 reopened after touch-DNA from clothing matched a person-of-interest in a separate 2025 hill-station investigation. Re-examination underway.",
		tags: '["cold-case","dna-match","reopened","hill-station"]',
	},
];

// ─── Physical / Biological Evidence ──────────────────────────────────────────

export const SEED_EVIDENCE: Evidence[] = [
	// case-001 — Rosewood Manor
	{
		id: "evd-001-01",
		caseId: "case-001",
		catalogRef: "EVD-0187-001",
		type: "PHYSICAL",
		description:
			"Overturned antique writing desk chair found 1.2 m from victim. Drag marks on carpet suggest post-mortem repositioning.",
		collectedAt: "2024-11-02T07:15:00Z",
		location: "14 Rosewood Ave — Study, ground floor",
		analyst: "FSO Mitchell",
		notes: "Photographs taken, chair bagged for latent print processing.",
		confidence: 0.81,
	},
	{
		id: "evd-001-02",
		caseId: "case-001",
		catalogRef: "EVD-0187-002",
		type: "BIOLOGICAL",
		description:
			"Blood spatter on north wall, low-velocity pattern. Secondary transfer smear near window latch.",
		collectedAt: "2024-11-02T07:40:00Z",
		location: "14 Rosewood Ave — Study, north wall",
		analyst: "FSO Mitchell",
		notes:
			"Swabs collected; sent for DNA profiling. Spatter pattern documented.",
		confidence: 0.88,
	},
	{
		id: "evd-001-03",
		caseId: "case-001",
		catalogRef: "EVD-0187-003",
		type: "FORENSIC",
		description:
			"Latent fingerprints lifted from whisky decanter — partial ridge detail, three distinct sources.",
		collectedAt: "2024-11-02T09:00:00Z",
		location: "14 Rosewood Ave — Study, drinks cabinet",
		analyst: "FSO Chen",
		notes:
			"Two of three partials match suspect index cards. Third remains unidentified.",
		confidence: 0.73,
	},
	{
		id: "evd-001-04",
		caseId: "case-001",
		catalogRef: "EVD-0187-004",
		type: "DIGITAL",
		description:
			"Victim's smartphone (iPhone 15 Pro) recovered under sofa cushion. Screen cracked; last unlock 23:14 on date of incident.",
		collectedAt: "2024-11-02T10:30:00Z",
		location: "14 Rosewood Ave — Study, sofa",
		analyst: "Det. Sarah Okafor",
		notes: "Forensic extraction requested. Passcode unknown; warrant obtained.",
		confidence: 0.91,
	},
	// case-002 — Port District Homicide
	{
		id: "evd-002-01",
		caseId: "case-002",
		catalogRef: "EVD-0203-001",
		type: "BIOLOGICAL",
		description:
			"Pooled blood (approx. 600 mL) at primary scene on Pier 17 dockside walkway. Single-shot wound pattern.",
		collectedAt: "2024-11-07T23:05:00Z",
		location: "Pier 17, Eastport — Dockside walkway, section B",
		analyst: "FSO Alvarez",
		notes:
			"Swabs collected. Luminol applied; secondary satellite stains identified.",
		confidence: 0.94,
	},
	{
		id: "evd-002-02",
		caseId: "case-002",
		catalogRef: "EVD-0203-002",
		type: "PHYSICAL",
		description:
			"9mm brass casing recovered 4 m east of blood pool. Headstamp: Federal .355 115 gr.",
		collectedAt: "2024-11-07T23:18:00Z",
		location: "Pier 17, Eastport — Walkway, section B east",
		analyst: "FSO Alvarez",
		notes: "Submitted for NIBIN ballistic comparison.",
		confidence: 0.97,
	},
	{
		id: "evd-002-03",
		caseId: "case-002",
		catalogRef: "EVD-0203-003",
		type: "PHYSICAL",
		description:
			"Burner phone (Samsung A14) found in shipping container 22-C, partially concealed under tarpaulin.",
		collectedAt: "2024-11-08T01:45:00Z",
		location: "Pier 17 — Container bay 22-C",
		analyst: "Det. James Reeves",
		notes:
			"Phone active — last call 21:09 on date of incident. Forensic imaging in progress.",
		confidence: 0.85,
	},
	{
		id: "evd-002-04",
		caseId: "case-002",
		catalogRef: "EVD-0203-004",
		type: "TESTIMONIAL",
		description:
			"Statement from dock foreman (witness A) — heard two voices arguing, single gunshot, then vehicle departing at speed.",
		collectedAt: "2024-11-08T02:30:00Z",
		location: "Eastport District Police Interview Room 2",
		analyst: "Det. James Reeves",
		notes:
			"Witness placed in protective custody. Corroborated by second dockworker (witness B).",
		confidence: 0.78,
	},
	// case-003 — Greenfield Park
	{
		id: "evd-003-01",
		caseId: "case-003",
		catalogRef: "EVD-0156-001",
		type: "BIOLOGICAL",
		description:
			"Toxicology samples: blood, urine, vitreous humour. Suspected fentanyl-analogue detected in preliminary screen.",
		collectedAt: "2024-10-20T14:00:00Z",
		location: "Greenfield Park — Sector 4 / City Morgue",
		analyst: "Dr. Elaine Cho (Pathologist)",
		notes: "Full toxicology screen to return in 10 business days.",
		confidence: 0.67,
	},
	{
		id: "evd-003-02",
		caseId: "case-003",
		catalogRef: "EVD-0156-002",
		type: "PHYSICAL",
		description:
			"Discarded syringe (28-gauge) found 0.5 m from body in shrubbery. Cap present, needle bent.",
		collectedAt: "2024-10-20T11:45:00Z",
		location: "Greenfield Park — Sector 4, east hedge line",
		analyst: "FSO Patel",
		notes:
			"DNA swab from plunger. Fingerprint attempt on barrel — degraded due to moisture.",
		confidence: 0.58,
	},
	{
		id: "evd-003-03",
		caseId: "case-003",
		catalogRef: "EVD-0156-003",
		type: "FORENSIC",
		description:
			"Fingerprint reference cards from victim — postmortem ink roll. No AFIS match returned.",
		collectedAt: "2024-10-20T16:30:00Z",
		location: "City Morgue, Fingerprint Suite",
		analyst: "FSO Patel",
		notes:
			"Submitted to AFIS and cross-referenced with missing persons database.",
		confidence: 0.55,
	},
	// case-004 — Metro Station
	{
		id: "evd-004-01",
		caseId: "case-004",
		catalogRef: "EVD-0219-001",
		type: "PHYSICAL",
		description:
			"Improvised fragmentation device remnants collected from Platform 3 blast epicentre. Partial timer circuit identified.",
		collectedAt: "2024-11-10T08:00:00Z",
		location: "Central Metro Station — Platform 3, tracks 3A-3B",
		analyst: "EOD Unit / FSO Daniels",
		notes:
			"Referred to specialist explosives lab. Secondary sweep confirmed no further devices.",
		confidence: 0.92,
	},
	{
		id: "evd-004-02",
		caseId: "case-004",
		catalogRef: "EVD-0219-002",
		type: "DIGITAL",
		description:
			"Transit authority CCTV export — 12 camera angles, 06:00–07:00 window. Suspect captured on platforms 2 and 3.",
		collectedAt: "2024-11-10T09:15:00Z",
		location: "Central Metro CCTV Control Room",
		analyst: "Det. Marcus Webb",
		notes:
			"Facial recognition processing underway. Suspect wears hood; partial face visible on cam-07.",
		confidence: 0.76,
	},
	{
		id: "evd-004-03",
		caseId: "case-004",
		catalogRef: "EVD-0219-003",
		type: "BIOLOGICAL",
		description:
			"Sweat DNA collected from maintenance corridor handrail used by suspect during escape.",
		collectedAt: "2024-11-10T10:30:00Z",
		location: "Central Metro — Maintenance corridor B2",
		analyst: "FSO Daniels",
		notes:
			"DNA profile generated. Cross-referencing with existing CT watch-list.",
		confidence: 0.83,
	},
	{
		id: "evd-004-04",
		caseId: "case-004",
		catalogRef: "EVD-0219-004",
		type: "TESTIMONIAL",
		description:
			"Eyewitness account from platform attendant (witness C) describing suspect attire, direction, and approximate build.",
		collectedAt: "2024-11-10T11:00:00Z",
		location: "Central Metro Station, Staff Office",
		analyst: "Det. Marcus Webb",
		notes: "Consistent with CCTV silhouette. E-fit in preparation.",
		confidence: 0.71,
	},
	// case-005 — Riverside Cold Case
	{
		id: "evd-005-01",
		caseId: "case-005",
		catalogRef: "EVD-0098-001",
		type: "BIOLOGICAL",
		description:
			"New touch-DNA trace recovered from original clothing exhibits during re-examination — male contributor, unknown profile.",
		collectedAt: "2024-10-28T09:00:00Z",
		location: "Regional Forensic Science Lab — Cold Case Unit",
		analyst: "Dr. Yuki Tanaka",
		notes: "Profile uploaded to NDNAD. Familial search authorised.",
		confidence: 0.79,
	},
	{
		id: "evd-005-02",
		caseId: "case-005",
		catalogRef: "EVD-0098-002",
		type: "FORENSIC",
		description:
			"Fibre re-analysis using updated spectroscopic methods — synthetic blend linked to limited industrial run circa 2019-2021.",
		collectedAt: "2024-10-29T14:30:00Z",
		location: "Regional Forensic Science Lab",
		analyst: "Dr. Yuki Tanaka",
		notes: "Manufacturer identified; supply chain records requested.",
		confidence: 0.64,
	},
	{
		id: "evd-005-03",
		caseId: "case-005",
		catalogRef: "EVD-0098-003",
		type: "PHYSICAL",
		description:
			"Partial boot tread cast from original scene photographs — digitised and enhanced. Lug pattern consistent with a specific work-boot brand.",
		collectedAt: "2023-04-11T10:00:00Z",
		location: "Riverside District — Former Textile Mill, east entrance",
		analyst: "FSO Reyes",
		notes:
			"Digital enhancement provides 68% pattern confidence. Cross-referencing brand distribution records.",
		confidence: 0.61,
	},
];

// ─── Digital Evidence ─────────────────────────────────────────────────────────

export const SEED_DIGITAL_EVIDENCE: DigitalEvidence[] = [
	// case-001
	{
		id: "dig-001-01",
		caseId: "case-001",
		sourceType: "CCTV",
		sourceName: "Rosewood Ave Doorbell Camera (14A)",
		timestamp: "2024-11-01T22:47:00Z",
		location: "14A Rosewood Ave — Exterior front entrance",
		subject: "Unknown male — dark coat, no face visible",
		description:
			"Unidentified male approaches front gate of 14 Rosewood Ave. Remains stationary for 3 minutes, then departs. Returns at 23:02. No direct confrontation captured.",
		confidence: 0.69,
		anomalyScore: 58,
		tags: '["unidentified-male","loitering","pre-incident"]',
	},
	{
		id: "dig-001-02",
		caseId: "case-001",
		sourceType: "MOBILE",
		sourceName: "Eleanor Voss — iPhone 15 Pro (partial extraction)",
		timestamp: "2024-11-01T23:14:00Z",
		location: "Inferred: 14 Rosewood Ave — Study",
		subject: "Eleanor Voss",
		description:
			'Last device unlock event. Call logs indicate outgoing call to unknown number at 22:58 (duration 4 min 17 s). SMS thread with contact "R.H." deleted after 22:00.',
		confidence: 0.84,
		anomalyScore: 74,
		tags: '["last-contact","deleted-messages","unknown-contact"]',
	},
	{
		id: "dig-001-03",
		caseId: "case-001",
		sourceType: "GPS",
		sourceName: "Suspect vehicle — reg. HX14 KPZ (cell tower triangulation)",
		timestamp: "2024-11-01T22:30:00Z",
		location: "Northgate — 0.4 km radius of Rosewood Ave",
		subject: "Vehicle HX14 KPZ",
		description:
			"Cell-tower triangulation places registered vehicle within 0.4 km of scene for 47-minute window. Vehicle departs area at 23:28 — immediately post estimated time of death.",
		confidence: 0.72,
		anomalyScore: 81,
		tags: '["vehicle","proximity","post-tod-departure"]',
	},
	{
		id: "dig-001-04",
		caseId: "case-001",
		sourceType: "EMAIL",
		sourceName: "Eleanor Voss — Legal correspondence archive",
		timestamp: "2024-11-01T09:22:00Z",
		location: "Voss & Partners Legal — Email server",
		subject: "Eleanor Voss / R. Hartwell",
		description:
			'Final email received from "R. Hartwell" — subject: "Re: the arrangement." Tone described by analyst as coercive. Attached PDF encrypted.',
		confidence: 0.77,
		anomalyScore: 66,
		tags: '["coercive-communication","encrypted-attachment","day-of-incident"]',
	},
	// case-002
	{
		id: "dig-002-01",
		caseId: "case-002",
		sourceType: "CCTV",
		sourceName: "Eastport District — Port Authority Camera 08",
		timestamp: "2024-11-07T21:18:00Z",
		location: "Pier 17 access road, east gate",
		subject: "Black SUV — reg. unreadable (plate obscured)",
		description:
			"Black SUV enters port via east gate. Driver activates camera blind spot by stopping under overhanging structure. Two occupants exit. Camera feed cut at 21:22 — manual loop inserted.",
		confidence: 0.91,
		anomalyScore: 95,
		tags: '["cctv-tampering","suspect-vehicle","deliberate-loop"]',
	},
	{
		id: "dig-002-02",
		caseId: "case-002",
		sourceType: "MOBILE",
		sourceName: "Burner phone — Samsung A14 (EVD-0203-003)",
		timestamp: "2024-11-07T21:09:00Z",
		location: "Cell tower: Eastport-4 (150 m from Pier 17)",
		subject: "Unknown (burner)",
		description:
			"Last outgoing call from burner device — 2 min 44 s to second unregistered number. Cell tower confirms handset within 150 m of pier at time of call. Device powered off at 21:31.",
		confidence: 0.88,
		anomalyScore: 89,
		tags: '["burner","last-call","proximity-confirmed"]',
	},
	{
		id: "dig-002-03",
		caseId: "case-002",
		sourceType: "FINANCIAL",
		sourceName: "Marco DeSilva — Bank account (CityFirst x-7741)",
		timestamp: "2024-11-07T18:45:00Z",
		location: "ATM: Eastport High St — 2.1 km from pier",
		subject: "Marco DeSilva",
		description:
			"Cash withdrawal of £4,800 — maximum daily limit. Three hours before estimated time of death. Consistent with a pre-arranged payment scenario.",
		confidence: 0.82,
		anomalyScore: 78,
		tags: '["large-cash-withdrawal","pre-incident","payment-scenario"]',
	},
	{
		id: "dig-002-04",
		caseId: "case-002",
		sourceType: "GPS",
		sourceName: "DeSilva vehicle — reg. MK71 VRR (OBD telematics)",
		timestamp: "2024-11-07T21:05:00Z",
		location: "Pier 17 parking bay B",
		subject: "Vehicle MK71 VRR",
		description:
			"Vehicle telematics record DeSilva's car entering Pier 17 parking bay at 21:05. Engine off at 21:08. No further movement — vehicle recovered at scene.",
		confidence: 0.96,
		anomalyScore: 62,
		tags: '["victim-vehicle","scene-arrival","telematics-confirmed"]',
	},
	{
		id: "dig-002-05",
		caseId: "case-002",
		sourceType: "SOCIAL",
		sourceName: "Open-source intelligence — Telegram channel (OC-Watch)",
		timestamp: "2024-11-07T14:30:00Z",
		location: "Digital / Online",
		subject: "Unknown operator",
		description:
			'Intelligence feed captured a message referencing "the pier job tonight" in an encrypted group linked to regional OC network. Message deleted within 20 minutes.',
		confidence: 0.61,
		anomalyScore: 84,
		tags: '["osint","pre-operational-communication","organized-crime"]',
	},
	{
		id: "dig-002-06",
		caseId: "case-002",
		sourceType: "CCTV",
		sourceName: "Eastport District — Port Authority Camera 12 (partial)",
		timestamp: "2024-11-07T21:35:00Z",
		location: "Pier 17 south access corridor",
		subject: "Suspect (unidentified, male, approx. 6 ft)",
		description:
			"Partial footage recovered after loop override. Single male figure proceeds along south corridor toward exit. Gait analysis submitted. No face visible.",
		confidence: 0.58,
		anomalyScore: 71,
		tags: '["partial-footage","gait-analysis","suspect-exit"]',
	},
];

// ─── Case Activities ──────────────────────────────────────────────────────────

export const SEED_ACTIVITIES: CaseActivity[] = [
	// case-001
	{
		id: "act-001-01",
		caseId: "case-001",
		type: "EVIDENCE_ADDED",
		description:
			"Physical evidence logged: overturned chair (EVD-0187-001) and blood spatter swabs (EVD-0187-002).",
		createdAt: "2024-11-02T08:00:00Z",
		agent: "FSO Mitchell",
	},
	{
		id: "act-001-02",
		caseId: "case-001",
		type: "ANALYSIS_RUN",
		description:
			"Latent fingerprint analysis completed on decanter (EVD-0187-003). Two of three partials matched to suspect index cards.",
		createdAt: "2024-11-03T11:30:00Z",
		agent: "FSO Chen",
	},
	{
		id: "act-001-03",
		caseId: "case-001",
		type: "NOTE_ADDED",
		description:
			"Interview conducted with victim's neighbour (Mr. T. Langford). Reports hearing raised voices at approximately 23:00 on 01 Nov. Consistent with estimated incident window.",
		createdAt: "2024-11-04T14:00:00Z",
		agent: "Det. Sarah Okafor",
	},
	{
		id: "act-001-04",
		caseId: "case-001",
		type: "REPORT_GENERATED",
		description:
			"Preliminary postmortem report issued by Dr. Walsh. Cause of death: blunt force trauma. Manner: homicide. TOD estimated 22:45–23:30 on 01 Nov 2024.",
		createdAt: "2024-11-05T09:15:00Z",
		agent: "Dr. Walsh (Pathologist)",
	},
	// case-002
	{
		id: "act-002-01",
		caseId: "case-002",
		type: "STATUS_CHANGED",
		description:
			"Case status escalated from OPEN to ACTIVE following confirmation of organised crime link. Senior investigating officer assigned.",
		createdAt: "2024-11-08T04:00:00Z",
		agent: "DCI Harrison",
	},
	{
		id: "act-002-02",
		caseId: "case-002",
		type: "EVIDENCE_ADDED",
		description:
			"CCTV loop footage (EVD-0203 digital) and ballistic casing (EVD-0203-002) logged into evidence management system.",
		createdAt: "2024-11-08T05:30:00Z",
		agent: "FSO Alvarez",
	},
	{
		id: "act-002-03",
		caseId: "case-002",
		type: "ANALYSIS_RUN",
		description:
			"NIBIN ballistic comparison initiated for 9 mm casing (EVD-0203-002). Results expected within 72 hours.",
		createdAt: "2024-11-08T09:00:00Z",
		agent: "Ballistics Lab",
	},
	{
		id: "act-002-04",
		caseId: "case-002",
		type: "NOTE_ADDED",
		description:
			"Intelligence brief received from Regional OC Unit. DeSilva linked to Caruso network, suspected intermediary role. Three additional persons of interest identified.",
		createdAt: "2024-11-09T10:45:00Z",
		agent: "Det. James Reeves",
	},
	// case-003
	{
		id: "act-003-01",
		caseId: "case-003",
		type: "EVIDENCE_ADDED",
		description:
			"Toxicology samples (EVD-0156-001) and syringe (EVD-0156-002) logged. Samples dispatched to regional toxicology lab.",
		createdAt: "2024-10-20T16:00:00Z",
		agent: "FSO Patel",
	},
	{
		id: "act-003-02",
		caseId: "case-003",
		type: "ANALYSIS_RUN",
		description:
			"Postmortem fingerprint roll submitted to AFIS. No match returned. Submitted to national missing persons cross-check.",
		createdAt: "2024-10-21T13:00:00Z",
		agent: "FSO Patel",
	},
	{
		id: "act-003-03",
		caseId: "case-003",
		type: "NOTE_ADDED",
		description:
			"Park maintenance staff interviewed. Body discovered at 06:12 by crew member. Area reportedly frequented by rough sleepers. No visible altercation signs noted by crew.",
		createdAt: "2024-10-22T10:30:00Z",
		agent: "Det. Priya Nair",
	},
	// case-004
	{
		id: "act-004-01",
		caseId: "case-004",
		type: "STATUS_CHANGED",
		description:
			"Case immediately classified CRITICAL. Counter-terrorism unit and specialist firearms command notified at 06:35.",
		createdAt: "2024-11-10T06:35:00Z",
		agent: "Det. Marcus Webb",
	},
	{
		id: "act-004-02",
		caseId: "case-004",
		type: "EVIDENCE_ADDED",
		description:
			"IED remnants (EVD-0219-001) secured and catalogued by EOD. Transit CCTV export (EVD-0219-002) retrieved from control room.",
		createdAt: "2024-11-10T09:30:00Z",
		agent: "EOD Unit / FSO Daniels",
	},
	{
		id: "act-004-03",
		caseId: "case-004",
		type: "ANALYSIS_RUN",
		description:
			"Facial recognition processing commenced on CCTV exports. Partial face visible on cam-07 at 06:18. Confidence score 43% — enhancement underway.",
		createdAt: "2024-11-10T12:00:00Z",
		agent: "Digital Forensics Unit",
	},
	{
		id: "act-004-04",
		caseId: "case-004",
		type: "NOTE_ADDED",
		description:
			"Survivor interviews completed. Seven injured survivors accounted for across two hospitals. Consistent descriptions of attacker build and clothing.",
		createdAt: "2024-11-10T15:00:00Z",
		agent: "Det. Marcus Webb",
	},
	// case-005
	{
		id: "act-005-01",
		caseId: "case-005",
		type: "STATUS_CHANGED",
		description:
			"Case formally reopened following cold-case review board decision. New DNA trace evidence submitted for analysis.",
		createdAt: "2024-10-28T09:30:00Z",
		agent: "Det. Linda Park",
	},
	{
		id: "act-005-02",
		caseId: "case-005",
		type: "EVIDENCE_ADDED",
		description:
			"Touch-DNA results (EVD-0098-001) received from regional lab. Male contributor profile logged; familial search authorised.",
		createdAt: "2024-10-30T14:00:00Z",
		agent: "Dr. Yuki Tanaka",
	},
	{
		id: "act-005-03",
		caseId: "case-005",
		type: "ANALYSIS_RUN",
		description:
			"Fibre re-analysis (EVD-0098-002) complete. Spectroscopic data links fibre batch to industrial supplier. Supply chain inquiry submitted.",
		createdAt: "2024-11-01T11:00:00Z",
		agent: "Dr. Yuki Tanaka",
	},
];
