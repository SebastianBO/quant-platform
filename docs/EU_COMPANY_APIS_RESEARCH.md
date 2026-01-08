# European Company Data APIs Research

**Date:** January 8, 2026
**Purpose:** Build comprehensive EU company database with 100K+ companies
**Status:** Research complete - implementation ready

---

## Executive Summary

| Country | API Name | Free? | API Key Required | Rate Limit | Financials? |
|---------|----------|-------|------------------|------------|-------------|
| Denmark | CVR API | Yes | Yes (email request) | Unspecified | No |
| Denmark | cvrapi.dk | Yes | No (Basic Auth) | 50/day free | No |
| Finland | PRH YTJ | Yes | No | 300/min global | Yes (XBRL) |
| France | INSEE SIRENE | Yes | Yes (free account) | 30/min | No |
| Germany | bundesAPI | Yes | No | Unspecified | Yes |
| Germany | OffeneRegister | Yes | No | Bulk download | No |
| Netherlands | KvK | No | Yes (paid) | N/A | Yes (paid) |

**Best Options for 100K+ Companies:**
1. **Finland PRH** - Completely free, no auth, includes financials
2. **France SIRENE** - 25M+ companies, free with account
3. **Denmark cvrapi.dk** - Free tier, 50 lookups/day (or pay for more)
4. **Germany bundesAPI** - Free Python package, scrapes Bundesanzeiger

---

## 1. Denmark - CVR (Central Business Register)

### Overview
- **Registry:** Det Centrale Virksomhedsregister (CVR)
- **Companies:** 2.2M+ active and historical
- **Data:** Names, addresses, industry codes, ownership, directors

### Option A: Official VIRK API (Elasticsearch)

**Endpoint:**
```
http://distribution.virk.dk/cvr-permanent/virksomhed/_search
```

**Authentication:** HTTP Basic Auth (credentials from Danish Business Authority)

**How to Get Access:**
1. Email: cvrselvbetjening@erst.dk
2. Request system-to-system access
3. Receive username/password

**Sample Request:**
```bash
curl -u "$CVR_USERNAME:$CVR_PASSWORD" \
  -X POST "http://distribution.virk.dk/cvr-permanent/virksomhed/_search" \
  -H 'Content-Type: application/json' \
  -d '{
    "size": 10,
    "query": {
      "term": { "cvrNummer": 13612870 }
    }
  }'
```

**Available Indices:**
- `virksomhed` - Companies (2.2M+)
- `deltager` - Participants/owners (1.7M+)
- `produktionsenhed` - Production units (2.8M+)

**Rate Limits:** Not explicitly documented, recommend caching

---

### Option B: cvrapi.dk (Free Alternative)

**Better for quick integration - no approval needed**

**Base URL:**
```
https://rest.cvrapi.dk
```

**Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v2/dk/company/{vat}` | Get company by CVR number |
| GET | `/v2/dk/search/company` | Search companies |
| GET | `/v2/dk/suggestions/company/{name}` | Autocomplete |
| GET | `/v2/dk/subsidiary/{number}` | Get subsidiary |
| GET | `/v2/dk/participant/{number}` | Get person/participant |

**Rate Limits:**
- **Free:** 50 lookups/day per IP
- **Paid:** Higher quotas available
- Exceeding limit returns `null` with QUOTA_EXCEEDED

**Authentication:** HTTP Basic (token as username, empty password) for paid tier

**Sample Request (Free):**
```bash
curl "https://rest.cvrapi.dk/v2/dk/company/13612870"
```

**Sample Response:**
```json
{
  "vat": 13612870,
  "name": "NOVO NORDISK A/S",
  "address": "Novo Alle 1",
  "zipcode": "2880",
  "city": "Bagsvaerd",
  "protected": false,
  "phone": "44448888",
  "email": "info@novonordisk.com",
  "fax": null,
  "startdate": "1989-01-02",
  "enddate": null,
  "employees": "10000+",
  "addressco": null,
  "industrycode": 212000,
  "industrydesc": "Manufacture of pharmaceutical preparations",
  "companycode": 60,
  "companydesc": "Aktieselskab",
  "creditstartdate": null,
  "creditbankrupt": false,
  "creditstatus": null,
  "owners": [...],
  "productionunits": [...],
  "t": 1704729600,
  "version": 9
}
```

**TypeScript Implementation:**
```typescript
// src/app/api/cron/sync-danish-companies/route.ts
const CVRAPI_BASE = 'https://rest.cvrapi.dk';

interface DanishCompany {
  vat: number;
  name: string;
  address: string;
  zipcode: string;
  city: string;
  phone?: string;
  email?: string;
  employees?: string;
  industrycode?: number;
  industrydesc?: string;
  companycode?: number;
  companydesc?: string;
  startdate?: string;
  owners?: Array<{
    name: string;
    relation: string;
  }>;
}

async function getDanishCompany(cvr: number): Promise<DanishCompany | null> {
  try {
    const response = await fetch(`${CVRAPI_BASE}/v2/dk/company/${cvr}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch CVR ${cvr}:`, error);
    return null;
  }
}

async function searchDanishCompanies(name: string): Promise<DanishCompany[]> {
  const response = await fetch(
    `${CVRAPI_BASE}/v2/dk/search/company?name=${encodeURIComponent(name)}`
  );
  if (!response.ok) return [];
  const data = await response.json();
  return data.companies || [];
}
```

---

## 2. Finland - PRH (Patent and Registration Office)

### Overview
- **Registry:** YTJ (Yritys- ja yhteisotietojarjestelma)
- **Companies:** All Finnish Trade Register companies
- **Data:** Company info, registered entries, **financial statements (XBRL)**

### API Details

**Base URL:**
```
https://avoindata.prh.fi/opendata-ytj-api/v3
```

**Authentication:** None required (completely free)

**Rate Limit:** 300 queries/minute (global limit for all users)

**License:** Creative Commons Attribution 4.0

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/companies` | Search companies |
| GET | `/all_companies` | Download all companies (ZIP) |
| GET | `/description` | Get code descriptions |
| GET | `/post_codes` | Get postal codes |

### Search Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Company name (current or previous) |
| `location` | string | City/town |
| `businessId` | string | Business ID (Y-tunnus) |
| `companyForm` | enum | AOY, OY, OYJ, KY, etc. |
| `mainBusinessLine` | string | TOL 2008 industry code |
| `registrationDateStart` | date | Format: yyyy-mm-dd |
| `registrationDateEnd` | date | Format: yyyy-mm-dd |
| `postCode` | string | Postal code |
| `page` | integer | Pagination (100 results/page) |

### Company Forms (companyForm values)
```
AOY, ASH, ASY, AY, AYH, ETS, ETY, SCE, SCP, HY, KOY, KVJ, KVY,
KY, OK, OP, OY, OYJ, SE, SL, SP, SAA, TYH, VOJ, VOY, VY, VALTLL
```

### Sample Request
```bash
# Search by company name
curl "https://avoindata.prh.fi/opendata-ytj-api/v3/companies?name=Nokia"

# Search by business ID
curl "https://avoindata.prh.fi/opendata-ytj-api/v3/companies?businessId=0112038-9"

# Search listed companies (OYJ = public limited)
curl "https://avoindata.prh.fi/opendata-ytj-api/v3/companies?companyForm=OYJ&page=0"
```

### Sample Response
```json
{
  "companies": [
    {
      "businessId": {
        "value": "0112038-9",
        "registrationDate": "1988-07-01",
        "source": 1
      },
      "names": [
        {
          "name": "NOKIA OYJ",
          "type": 1,
          "registrationDate": "2017-01-01",
          "version": 5,
          "source": 3
        }
      ],
      "companyForms": [
        {
          "type": "OYJ",
          "descriptions": [
            {"language": "EN", "value": "Public limited company"}
          ],
          "registrationDate": "1997-10-01"
        }
      ],
      "mainBusinessLine": {
        "type": "26300",
        "descriptions": [
          {"language": "EN", "value": "Manufacture of communication equipment"}
        ]
      },
      "addresses": [
        {
          "type": 1,
          "street": "Karakaari 7",
          "postCode": "02610",
          "postOffices": [
            {"language": "FI", "value": "ESPOO"}
          ],
          "country": "FI"
        }
      ],
      "tradeRegisterStatus": "REGISTERED",
      "status": "ACTIVE",
      "registrationDate": "1967-05-13"
    }
  ],
  "totalHits": 1,
  "currentPage": 0
}
```

### TypeScript Implementation
```typescript
// src/app/api/cron/sync-finnish-companies/route.ts
const PRH_BASE = 'https://avoindata.prh.fi/opendata-ytj-api/v3';

interface FinnishCompany {
  businessId: {
    value: string;
    registrationDate: string;
  };
  names: Array<{
    name: string;
    type: number;
    registrationDate: string;
  }>;
  companyForms: Array<{
    type: string;
    descriptions: Array<{language: string; value: string}>;
  }>;
  mainBusinessLine?: {
    type: string;
    descriptions: Array<{language: string; value: string}>;
  };
  addresses: Array<{
    type: number;
    street?: string;
    postCode?: string;
    postOffices?: Array<{language: string; value: string}>;
    country?: string;
  }>;
  tradeRegisterStatus: string;
  status: string;
  registrationDate: string;
}

interface PRHResponse {
  companies: FinnishCompany[];
  totalHits: number;
  currentPage: number;
}

async function searchFinnishCompanies(params: {
  name?: string;
  businessId?: string;
  companyForm?: string;
  page?: number;
}): Promise<PRHResponse> {
  const searchParams = new URLSearchParams();
  if (params.name) searchParams.set('name', params.name);
  if (params.businessId) searchParams.set('businessId', params.businessId);
  if (params.companyForm) searchParams.set('companyForm', params.companyForm);
  if (params.page !== undefined) searchParams.set('page', params.page.toString());

  const response = await fetch(`${PRH_BASE}/companies?${searchParams}`);
  if (!response.ok) throw new Error(`PRH API error: ${response.status}`);
  return await response.json();
}

// Fetch all listed companies (OYJ)
async function syncFinnishListedCompanies() {
  const allCompanies: FinnishCompany[] = [];
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const data = await searchFinnishCompanies({ companyForm: 'OYJ', page });
    allCompanies.push(...data.companies);

    hasMore = (page + 1) * 100 < data.totalHits;
    page++;

    // Respect rate limit (300/min global)
    await new Promise(r => setTimeout(r, 250));
  }

  return allCompanies;
}
```

### Bulk Download
```bash
# Download all companies as ZIP (JSON format)
curl -o finnish_companies.zip \
  "https://avoindata.prh.fi/opendata-ytj-api/v3/all_companies"
```

---

## 3. France - INSEE SIRENE

### Overview
- **Registry:** SIRENE (Systeme Informatique pour le Repertoire des Entreprises)
- **Companies:** 25M+ enterprises, 36M+ establishments
- **Data:** Company info, addresses, activity codes, employee ranges, dates

### API Details

**Base URL:**
```
https://api.insee.fr/entreprises/sirene/V3.11
```

**Authentication:** OAuth2 Bearer Token (free account required)

**Rate Limit:** 30 requests/minute

**License:** Licence Ouverte / Open Licence v2.0

### Getting Access

1. Create account at https://api.insee.fr
2. Subscribe to API Sirene
3. Get consumer key and secret
4. Generate Bearer token

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/siren/{siren}` | Get legal unit by SIREN |
| GET | `/siret/{siret}` | Get establishment by SIRET |
| GET | `/siren` | Search legal units |
| GET | `/siret` | Search establishments |
| GET | `/informations` | API status info |

### Sample Requests

```bash
# Get company by SIREN
curl -H "Authorization: Bearer $INSEE_TOKEN" \
  "https://api.insee.fr/entreprises/sirene/V3.11/siren/005520135"

# Get establishment by SIRET
curl -H "Authorization: Bearer $INSEE_TOKEN" \
  "https://api.insee.fr/entreprises/sirene/V3.11/siret/39860733300059"

# Search by name
curl -H "Authorization: Bearer $INSEE_TOKEN" \
  "https://api.insee.fr/entreprises/sirene/V3.11/siren?q=denominationUniteLegale:TOTAL"
```

### Sample Response (SIRET)
```json
{
  "header": {
    "statut": 200,
    "message": "OK",
    "total": 1,
    "debut": 0,
    "nombre": 1
  },
  "etablissement": {
    "siren": "798372355",
    "nic": "00023",
    "siret": "79837235500023",
    "statutDiffusionEtablissement": "O",
    "dateCreationEtablissement": "2019-07-01",
    "trancheEffectifsEtablissement": "11",
    "anneeEffectifsEtablissement": "2021",
    "activitePrincipaleRegistreMetiersEtablissement": null,
    "etablissementSiege": true,
    "nombrePeriodesEtablissement": 1,
    "uniteLegale": {
      "denominationUniteLegale": "EXAMPLE COMPANY SAS",
      "categorieJuridiqueUniteLegale": "5710",
      "activitePrincipaleUniteLegale": "62.01Z",
      "categorieEntreprise": "PME"
    },
    "adresseEtablissement": {
      "numeroVoieEtablissement": "10",
      "typeVoieEtablissement": "RUE",
      "libelleVoieEtablissement": "DE LA PAIX",
      "codePostalEtablissement": "75002",
      "libelleCommuneEtablissement": "PARIS 2",
      "codeCommuneEtablissement": "75102"
    }
  }
}
```

### Python Implementation (using api-insee library)
```python
# pip install api-insee
from api_insee import ApiInsee

# Initialize with your credentials
api = ApiInsee(
    key='your_consumer_key',
    secret='your_secret_key'
)

# Get company by SIREN
company = api.siren('005520135').get()

# Get establishment by SIRET
establishment = api.siret('39860733300059').get()

# Search with criteria
from api_insee.criteria import Field

# Search companies in Paris
results = api.siren(q=(
    Field('codeCommuneEtablissement', '75*'),
    Field('categorieEntreprise', 'GE')  # Large enterprises
)).get()

# Pagination
request = api.siren(q={'categorieEntreprise': 'ETI'})
for page_index, page_result in enumerate(request.pages(nombre=1000)):
    print(f"Page {page_index}: {len(page_result)} companies")
    if page_index >= 10:  # Limit pages
        break
```

### TypeScript Implementation
```typescript
// src/app/api/cron/sync-french-companies/route.ts
const INSEE_BASE = 'https://api.insee.fr/entreprises/sirene/V3.11';

interface INSEEAuth {
  access_token: string;
  token_type: string;
  expires_in: number;
}

async function getINSEEToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.INSEE_CONSUMER_KEY}:${process.env.INSEE_SECRET_KEY}`
  ).toString('base64');

  const response = await fetch('https://api.insee.fr/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  const data: INSEEAuth = await response.json();
  return data.access_token;
}

interface FrenchCompany {
  siren: string;
  denominationUniteLegale: string;
  categorieJuridiqueUniteLegale: string;
  activitePrincipaleUniteLegale: string;
  categorieEntreprise: string;
  trancheEffectifsUniteLegale: string;
  dateCreationUniteLegale: string;
}

async function searchFrenchCompanies(query: string): Promise<FrenchCompany[]> {
  const token = await getINSEEToken();

  const response = await fetch(
    `${INSEE_BASE}/siren?q=${encodeURIComponent(query)}&nombre=100`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    }
  );

  if (!response.ok) throw new Error(`INSEE API error: ${response.status}`);

  const data = await response.json();
  return data.unitesLegales || [];
}

// Search large enterprises in France
const largeCompanies = await searchFrenchCompanies(
  'categorieEntreprise:GE'  // GE = Grande Entreprise
);
```

### Employee Size Codes
| Code | Range |
|------|-------|
| 00 | 0 employees |
| 01 | 1-2 |
| 02 | 3-5 |
| 03 | 6-9 |
| 11 | 10-19 |
| 12 | 20-49 |
| 21 | 50-99 |
| 22 | 100-199 |
| 31 | 200-249 |
| 32 | 250-499 |
| 41 | 500-999 |
| 42 | 1000-1999 |
| 51 | 2000-4999 |
| 52 | 5000-9999 |
| 53 | 10000+ |

---

## 4. Germany - Bundesanzeiger / Handelsregister

### Overview
- **Registries:** Handelsregister (Commercial), Bundesanzeiger (Financials)
- **Companies:** 5M+ in Handelsregister
- **Data:** Company info, officers, financial statements

### Option A: bundesAPI Python Package (FREE)

**Best option for financial statements**

```python
# pip install deutschland
from deutschland.bundesanzeiger import Bundesanzeiger

ba = Bundesanzeiger()

# Get all financial reports for a company
reports = ba.get_reports("Deutsche Bahn AG")

# Returns dict with report titles as keys
# Example keys:
# - "Jahresabschluss zum 31.12.2023"
# - "Konzernabschluss zum 31.12.2023"
# - "Lagebericht 2023"

for title, content in reports.items():
    print(f"Report: {title}")
    print(f"Content length: {len(content)} chars")
```

**Available Data:**
- Annual financial statements (Jahresabschluss)
- Consolidated statements (Konzernabschluss)
- Management reports (Lagebericht)
- Amendments and corrections

**Rate Limits:** Not specified (uses web scraping)

---

### Option B: OffeneRegister.de (Bulk Data)

**5M+ companies, but data from 2017-2019**

**Download:**
```bash
# Download bulk dataset (gzipped JSON Lines)
curl -O https://offeneregister.de/data/de_companies_ocdata_no_dob.jsonl.gz

# Decompress
gunzip de_companies_ocdata_no_dob.jsonl.gz
```

**Sample Record:**
```json
{
  "company_number": "HRB 12345",
  "name": "Example GmbH",
  "registered_address": {
    "street_address": "Musterstrasse 1",
    "locality": "Berlin",
    "postal_code": "10115",
    "country": "Germany"
  },
  "officers": [
    {
      "name": "Max Mustermann",
      "position": "Geschaftsfuhrer",
      "start_date": "2015-01-01"
    }
  ],
  "status": "active",
  "jurisdiction_code": "de"
}
```

**License:** CC BY 4.0 (must credit OpenCorporates)

---

### Option C: Handelsregister.de (Official, Manual)

**For individual lookups only - no API**

```bash
# Web interface only
https://www.handelsregister.de

# Search by company name or register number
# Documents cost 1 EUR each
```

---

### TypeScript Implementation (bundesAPI wrapper)
```typescript
// src/lib/germany/bundesanzeiger.ts
import { spawn } from 'child_process';

interface GermanFinancialReport {
  title: string;
  date: string;
  type: 'jahresabschluss' | 'konzernabschluss' | 'lagebericht' | 'other';
  content: string;
}

async function getGermanFinancials(companyName: string): Promise<GermanFinancialReport[]> {
  return new Promise((resolve, reject) => {
    const python = spawn('python3', [
      '-c',
      `
from deutschland.bundesanzeiger import Bundesanzeiger
import json

ba = Bundesanzeiger()
reports = ba.get_reports("${companyName.replace(/"/g, '\\"')}")

result = []
for title, content in reports.items():
    report_type = 'other'
    if 'jahresabschluss' in title.lower():
        report_type = 'jahresabschluss'
    elif 'konzernabschluss' in title.lower():
        report_type = 'konzernabschluss'
    elif 'lagebericht' in title.lower():
        report_type = 'lagebericht'

    result.append({
        'title': title,
        'type': report_type,
        'content': content[:5000]  # Truncate for size
    })

print(json.dumps(result))
      `
    ]);

    let output = '';
    python.stdout.on('data', (data) => output += data);
    python.stderr.on('data', (data) => console.error(`Python error: ${data}`));
    python.on('close', (code) => {
      if (code === 0) {
        resolve(JSON.parse(output));
      } else {
        reject(new Error(`Python exited with code ${code}`));
      }
    });
  });
}
```

---

## 5. Netherlands - KvK (Chamber of Commerce)

### Overview
- **Registry:** Handelsregister (managed by KvK)
- **Companies:** 2M+ active
- **Data:** Company info, addresses, officers, filing history

### API Details

**Note: This is a PAID API - no free tier for company data**

**Developer Portal:** https://developers.kvk.nl

**Base URL:**
```
https://api.kvk.nl/api/v1
```

**Authentication:** API Key (requires subscription)

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/zoeken` | Search companies |
| GET | `/basisprofielen/{kvkNummer}` | Get basic profile |
| GET | `/vestigingsprofielen/{vestigingsnummer}` | Get branch profile |
| GET | `/naamgevingen/{kvkNummer}` | Get company names |

### Pricing
- Monthly subscription fee + per-query cost
- Test environment available for free (fictitious data)

### Free Alternative: KvK Open Data Set

**Anonymized bulk data - no company names or KvK numbers**

```bash
# Useful for market analysis only, not company lookups
https://www.kvk.nl/en/ordering-products/kvk-business-register-open-data-set/
```

### Sample Request (if you have API key)
```bash
curl -H "apikey: $KVK_API_KEY" \
  "https://api.kvk.nl/api/v1/zoeken?handelsnaam=Philips&pagina=1"
```

### Sample Response
```json
{
  "pagina": 1,
  "totaal": 150,
  "resultatenPerPagina": 10,
  "resultaten": [
    {
      "kvkNummer": "17003095",
      "handelsnaam": "Koninklijke Philips N.V.",
      "straatnaam": "Amstelplein",
      "huisnummer": "2",
      "postcode": "1096BC",
      "plaats": "Amsterdam",
      "type": "rechtspersoon",
      "links": [
        {
          "rel": "basisprofiel",
          "href": "https://api.kvk.nl/api/v1/basisprofielen/17003095"
        }
      ]
    }
  ]
}
```

### Recommendation

For Netherlands, consider:
1. **Paid KvK API** if budget allows (most accurate)
2. **OpenCorporates API** for basic data (commercial)
3. **Web scraping** as last resort (terms may prohibit)

---

## Summary: Recommended Implementation Order

### Phase 1: Free APIs (No API Key)
1. **Finland PRH** - Easiest, no auth, includes financials
2. **Denmark cvrapi.dk** - 50 free lookups/day

### Phase 2: Free APIs (API Key Required)
3. **France SIRENE** - Free account, huge dataset
4. **Denmark CVR (official)** - Email for credentials

### Phase 3: Scraping/Packages
5. **Germany bundesAPI** - Python package for financials
6. **Germany OffeneRegister** - Bulk download

### Phase 4: Paid (if needed)
7. **Netherlands KvK** - Requires subscription

---

## Environment Variables to Add

```bash
# Denmark (cvrapi.dk paid tier)
CVRAPI_TOKEN=your_token_here

# Denmark (official VIRK)
CVR_USERNAME=your_username
CVR_PASSWORD=your_password

# France INSEE
INSEE_CONSUMER_KEY=your_key
INSEE_SECRET_KEY=your_secret

# Netherlands (paid)
KVK_API_KEY=your_key
```

---

## Database Schema Updates Needed

```sql
-- Add Denmark, Finland, France to eu_companies
ALTER TABLE eu_companies
ADD CONSTRAINT eu_companies_country_check
CHECK (country_code IN ('SE', 'NO', 'GB', 'DK', 'FI', 'FR', 'DE', 'NL'));

-- Add country-specific identifiers
ALTER TABLE eu_companies ADD COLUMN cvr_number TEXT;  -- Denmark
ALTER TABLE eu_companies ADD COLUMN business_id TEXT; -- Finland (Y-tunnus)
ALTER TABLE eu_companies ADD COLUMN siren TEXT;       -- France
ALTER TABLE eu_companies ADD COLUMN siret TEXT;       -- France establishment
ALTER TABLE eu_companies ADD COLUMN hrb_number TEXT;  -- Germany (Handelsregister)
ALTER TABLE eu_companies ADD COLUMN kvk_number TEXT;  -- Netherlands
```

---

## Next Steps

1. Create `/api/cron/sync-finnish-companies` using PRH API
2. Create `/api/cron/sync-danish-companies` using cvrapi.dk
3. Create `/api/cron/sync-french-companies` using INSEE SIRENE
4. Add Germany bulk import from OffeneRegister
5. Update AI tools with `searchDanishCompanies`, `searchFinnishCompanies`, `searchFrenchCompanies`

---

## Sources

- [Danish CVR Documentation](https://brokk-sindre.github.io/cvr-documentation/)
- [cvrapi.dk Documentation](https://docs.rest.cvrapi.dk/)
- [Finland PRH Open Data](https://www.ytj.fi/en/index/opendata.html)
- [Finland PRH Swagger](https://avoindata.prh.fi/en/ytj/swagger-ui)
- [France INSEE SIRENE](https://api.gouv.fr/les-api/sirene_v3)
- [INSEE API Portal](https://portail-api.insee.fr/)
- [api-insee Python](https://github.com/sne3ks/api_insee)
- [bundesAPI Deutschland](https://github.com/bundesAPI/deutschland)
- [OffeneRegister.de](https://offeneregister.de/daten/)
- [Netherlands KvK API](https://developers.kvk.nl/)
