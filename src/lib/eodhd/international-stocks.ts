/**
 * International Stock List for EODHD Sync
 * Organized by exchange with major stocks from each market
 */

export interface InternationalStock {
  ticker: string
  exchange: string
  name: string
  country: string
}

// ============================================================================
// NORDIC STOCKS
// ============================================================================

export const SWEDEN_STOCKS: InternationalStock[] = [
  // Large Cap
  { ticker: 'VOLV-B', exchange: 'ST', name: 'Volvo', country: 'SE' },
  { ticker: 'ERIC-B', exchange: 'ST', name: 'Ericsson', country: 'SE' },
  { ticker: 'ATCO-A', exchange: 'ST', name: 'Atlas Copco', country: 'SE' },
  { ticker: 'INVE-B', exchange: 'ST', name: 'Investor', country: 'SE' },
  { ticker: 'SEB-A', exchange: 'ST', name: 'SEB', country: 'SE' },
  { ticker: 'SWED-A', exchange: 'ST', name: 'Swedbank', country: 'SE' },
  { ticker: 'HM-B', exchange: 'ST', name: 'H&M', country: 'SE' },
  { ticker: 'SAND', exchange: 'ST', name: 'Sandvik', country: 'SE' },
  { ticker: 'ABB', exchange: 'ST', name: 'ABB Ltd', country: 'SE' },
  { ticker: 'HEXA-B', exchange: 'ST', name: 'Hexagon', country: 'SE' },
  { ticker: 'ESSITY-B', exchange: 'ST', name: 'Essity', country: 'SE' },
  { ticker: 'ALFA', exchange: 'ST', name: 'Alfa Laval', country: 'SE' },
  { ticker: 'NDA-SE', exchange: 'ST', name: 'Nordea', country: 'SE' },
  { ticker: 'ASSA-B', exchange: 'ST', name: 'ASSA ABLOY', country: 'SE' },
  { ticker: 'SKF-B', exchange: 'ST', name: 'SKF', country: 'SE' },
  { ticker: 'TEL2-B', exchange: 'ST', name: 'Tele2', country: 'SE' },
  { ticker: 'ELUX-B', exchange: 'ST', name: 'Electrolux', country: 'SE' },
  { ticker: 'KINV-B', exchange: 'ST', name: 'Kinnevik', country: 'SE' },
  { ticker: 'BOL', exchange: 'ST', name: 'Boliden', country: 'SE' },
  { ticker: 'SPOT', exchange: 'ST', name: 'Spotify', country: 'SE' },
]

export const DENMARK_STOCKS: InternationalStock[] = [
  { ticker: 'NOVO-B', exchange: 'CO', name: 'Novo Nordisk', country: 'DK' },
  { ticker: 'MAERSK-B', exchange: 'CO', name: 'Maersk', country: 'DK' },
  { ticker: 'DSV', exchange: 'CO', name: 'DSV', country: 'DK' },
  { ticker: 'CARL-B', exchange: 'CO', name: 'Carlsberg', country: 'DK' },
  { ticker: 'ORSTED', exchange: 'CO', name: 'Ørsted', country: 'DK' },
  { ticker: 'VWS', exchange: 'CO', name: 'Vestas', country: 'DK' },
  { ticker: 'COLO-B', exchange: 'CO', name: 'Coloplast', country: 'DK' },
  { ticker: 'DEMANT', exchange: 'CO', name: 'Demant', country: 'DK' },
  { ticker: 'PNDORA', exchange: 'CO', name: 'Pandora', country: 'DK' },
  { ticker: 'GN', exchange: 'CO', name: 'GN Store Nord', country: 'DK' },
]

export const NORWAY_STOCKS: InternationalStock[] = [
  { ticker: 'EQNR', exchange: 'OL', name: 'Equinor', country: 'NO' },
  { ticker: 'DNB', exchange: 'OL', name: 'DNB Bank', country: 'NO' },
  { ticker: 'TEL', exchange: 'OL', name: 'Telenor', country: 'NO' },
  { ticker: 'MOWI', exchange: 'OL', name: 'Mowi', country: 'NO' },
  { ticker: 'YAR', exchange: 'OL', name: 'Yara', country: 'NO' },
  { ticker: 'ORK', exchange: 'OL', name: 'Orkla', country: 'NO' },
  { ticker: 'AKRBP', exchange: 'OL', name: 'Aker BP', country: 'NO' },
  { ticker: 'SALM', exchange: 'OL', name: 'SalMar', country: 'NO' },
  { ticker: 'SUBC', exchange: 'OL', name: 'Subsea 7', country: 'NO' },
  { ticker: 'NHY', exchange: 'OL', name: 'Norsk Hydro', country: 'NO' },
]

export const FINLAND_STOCKS: InternationalStock[] = [
  { ticker: 'NOKIA', exchange: 'HE', name: 'Nokia', country: 'FI' },
  { ticker: 'UPM', exchange: 'HE', name: 'UPM-Kymmene', country: 'FI' },
  { ticker: 'FORTUM', exchange: 'HE', name: 'Fortum', country: 'FI' },
  { ticker: 'NESTE', exchange: 'HE', name: 'Neste', country: 'FI' },
  { ticker: 'STERV', exchange: 'HE', name: 'Stora Enso', country: 'FI' },
  { ticker: 'KNEBV', exchange: 'HE', name: 'Kone', country: 'FI' },
  { ticker: 'SAMPO', exchange: 'HE', name: 'Sampo', country: 'FI' },
  { ticker: 'ELISA', exchange: 'HE', name: 'Elisa', country: 'FI' },
  { ticker: 'WRT1V', exchange: 'HE', name: 'Wärtsilä', country: 'FI' },
  { ticker: 'OUT1V', exchange: 'HE', name: 'Outokumpu', country: 'FI' },
]

// ============================================================================
// WESTERN EUROPE
// ============================================================================

export const GERMANY_STOCKS: InternationalStock[] = [
  { ticker: 'SAP', exchange: 'XETRA', name: 'SAP', country: 'DE' },
  { ticker: 'SIE', exchange: 'XETRA', name: 'Siemens', country: 'DE' },
  { ticker: 'ALV', exchange: 'XETRA', name: 'Allianz', country: 'DE' },
  { ticker: 'DTE', exchange: 'XETRA', name: 'Deutsche Telekom', country: 'DE' },
  { ticker: 'BMW', exchange: 'XETRA', name: 'BMW', country: 'DE' },
  { ticker: 'MBG', exchange: 'XETRA', name: 'Mercedes-Benz', country: 'DE' },
  { ticker: 'BAS', exchange: 'XETRA', name: 'BASF', country: 'DE' },
  { ticker: 'BAYN', exchange: 'XETRA', name: 'Bayer', country: 'DE' },
  { ticker: 'VOW3', exchange: 'XETRA', name: 'Volkswagen', country: 'DE' },
  { ticker: 'MRK', exchange: 'XETRA', name: 'Merck KGaA', country: 'DE' },
  { ticker: 'ADS', exchange: 'XETRA', name: 'Adidas', country: 'DE' },
  { ticker: 'DBK', exchange: 'XETRA', name: 'Deutsche Bank', country: 'DE' },
  { ticker: 'IFX', exchange: 'XETRA', name: 'Infineon', country: 'DE' },
  { ticker: 'DPW', exchange: 'XETRA', name: 'Deutsche Post', country: 'DE' },
  { ticker: 'MUV2', exchange: 'XETRA', name: 'Munich Re', country: 'DE' },
  { ticker: 'RWE', exchange: 'XETRA', name: 'RWE', country: 'DE' },
  { ticker: 'HEN3', exchange: 'XETRA', name: 'Henkel', country: 'DE' },
  { ticker: 'CON', exchange: 'XETRA', name: 'Continental', country: 'DE' },
  { ticker: 'FRE', exchange: 'XETRA', name: 'Fresenius', country: 'DE' },
  { ticker: 'EON', exchange: 'XETRA', name: 'E.ON', country: 'DE' },
]

export const NETHERLANDS_STOCKS: InternationalStock[] = [
  { ticker: 'ASML', exchange: 'AS', name: 'ASML Holding', country: 'NL' },
  { ticker: 'SHELL', exchange: 'AS', name: 'Shell', country: 'NL' },
  { ticker: 'UNA', exchange: 'AS', name: 'Unilever', country: 'NL' },
  { ticker: 'PHIA', exchange: 'AS', name: 'Philips', country: 'NL' },
  { ticker: 'INGA', exchange: 'AS', name: 'ING Group', country: 'NL' },
  { ticker: 'PRX', exchange: 'AS', name: 'Prosus', country: 'NL' },
  { ticker: 'ABN', exchange: 'AS', name: 'ABN AMRO', country: 'NL' },
  { ticker: 'AKZA', exchange: 'AS', name: 'Akzo Nobel', country: 'NL' },
  { ticker: 'HEIA', exchange: 'AS', name: 'Heineken', country: 'NL' },
  { ticker: 'AD', exchange: 'AS', name: 'Ahold Delhaize', country: 'NL' },
  { ticker: 'ADYEN', exchange: 'AS', name: 'Adyen', country: 'NL' },
  { ticker: 'WKL', exchange: 'AS', name: 'Wolters Kluwer', country: 'NL' },
  { ticker: 'DSM', exchange: 'AS', name: 'DSM-Firmenich', country: 'NL' },
  { ticker: 'NN', exchange: 'AS', name: 'NN Group', country: 'NL' },
  { ticker: 'KPN', exchange: 'AS', name: 'KPN', country: 'NL' },
]

export const FRANCE_STOCKS: InternationalStock[] = [
  { ticker: 'MC', exchange: 'PA', name: 'LVMH', country: 'FR' },
  { ticker: 'OR', exchange: 'PA', name: "L'Oréal", country: 'FR' },
  { ticker: 'TTE', exchange: 'PA', name: 'TotalEnergies', country: 'FR' },
  { ticker: 'SAN', exchange: 'PA', name: 'Sanofi', country: 'FR' },
  { ticker: 'AIR', exchange: 'PA', name: 'Airbus', country: 'FR' },
  { ticker: 'BNP', exchange: 'PA', name: 'BNP Paribas', country: 'FR' },
  { ticker: 'SU', exchange: 'PA', name: 'Schneider Electric', country: 'FR' },
  { ticker: 'AI', exchange: 'PA', name: 'Air Liquide', country: 'FR' },
  { ticker: 'KER', exchange: 'PA', name: 'Kering', country: 'FR' },
  { ticker: 'DG', exchange: 'PA', name: 'Vinci', country: 'FR' },
  { ticker: 'CS', exchange: 'PA', name: 'AXA', country: 'FR' },
  { ticker: 'SAF', exchange: 'PA', name: 'Safran', country: 'FR' },
  { ticker: 'DSY', exchange: 'PA', name: 'Dassault Systèmes', country: 'FR' },
  { ticker: 'ORA', exchange: 'PA', name: 'Orange', country: 'FR' },
  { ticker: 'CAP', exchange: 'PA', name: 'Capgemini', country: 'FR' },
  { ticker: 'RMS', exchange: 'PA', name: 'Hermès', country: 'FR' },
  { ticker: 'RI', exchange: 'PA', name: 'Pernod Ricard', country: 'FR' },
  { ticker: 'VIE', exchange: 'PA', name: 'Veolia', country: 'FR' },
  { ticker: 'EN', exchange: 'PA', name: 'Bouygues', country: 'FR' },
  { ticker: 'STM', exchange: 'PA', name: 'STMicroelectronics', country: 'FR' },
]

export const UK_STOCKS: InternationalStock[] = [
  { ticker: 'SHEL', exchange: 'LSE', name: 'Shell', country: 'GB' },
  { ticker: 'AZN', exchange: 'LSE', name: 'AstraZeneca', country: 'GB' },
  { ticker: 'HSBA', exchange: 'LSE', name: 'HSBC', country: 'GB' },
  { ticker: 'BP', exchange: 'LSE', name: 'BP', country: 'GB' },
  { ticker: 'GSK', exchange: 'LSE', name: 'GSK', country: 'GB' },
  { ticker: 'RIO', exchange: 'LSE', name: 'Rio Tinto', country: 'GB' },
  { ticker: 'ULVR', exchange: 'LSE', name: 'Unilever', country: 'GB' },
  { ticker: 'DGE', exchange: 'LSE', name: 'Diageo', country: 'GB' },
  { ticker: 'LSEG', exchange: 'LSE', name: 'LSEG', country: 'GB' },
  { ticker: 'LLOY', exchange: 'LSE', name: 'Lloyds', country: 'GB' },
  { ticker: 'BARC', exchange: 'LSE', name: 'Barclays', country: 'GB' },
  { ticker: 'REL', exchange: 'LSE', name: 'RELX', country: 'GB' },
  { ticker: 'BA', exchange: 'LSE', name: 'BAE Systems', country: 'GB' },
  { ticker: 'AAL', exchange: 'LSE', name: 'Anglo American', country: 'GB' },
  { ticker: 'BATS', exchange: 'LSE', name: 'British American Tobacco', country: 'GB' },
  { ticker: 'NG', exchange: 'LSE', name: 'National Grid', country: 'GB' },
  { ticker: 'RKT', exchange: 'LSE', name: 'Reckitt', country: 'GB' },
  { ticker: 'CPG', exchange: 'LSE', name: 'Compass Group', country: 'GB' },
  { ticker: 'GLEN', exchange: 'LSE', name: 'Glencore', country: 'GB' },
  { ticker: 'VOD', exchange: 'LSE', name: 'Vodafone', country: 'GB' },
]

export const SWITZERLAND_STOCKS: InternationalStock[] = [
  { ticker: 'NESN', exchange: 'SW', name: 'Nestlé', country: 'CH' },
  { ticker: 'NOVN', exchange: 'SW', name: 'Novartis', country: 'CH' },
  { ticker: 'ROG', exchange: 'SW', name: 'Roche', country: 'CH' },
  { ticker: 'UBSG', exchange: 'SW', name: 'UBS', country: 'CH' },
  { ticker: 'ZURN', exchange: 'SW', name: 'Zurich Insurance', country: 'CH' },
  { ticker: 'ABBN', exchange: 'SW', name: 'ABB', country: 'CH' },
  { ticker: 'CFR', exchange: 'SW', name: 'Richemont', country: 'CH' },
  { ticker: 'SREN', exchange: 'SW', name: 'Swiss Re', country: 'CH' },
  { ticker: 'LONN', exchange: 'SW', name: 'Lonza', country: 'CH' },
  { ticker: 'GIVN', exchange: 'SW', name: 'Givaudan', country: 'CH' },
  { ticker: 'SIKA', exchange: 'SW', name: 'Sika', country: 'CH' },
  { ticker: 'HOLN', exchange: 'SW', name: 'Holcim', country: 'CH' },
  { ticker: 'GEBN', exchange: 'SW', name: 'Geberit', country: 'CH' },
  { ticker: 'SLHN', exchange: 'SW', name: 'Swiss Life', country: 'CH' },
  { ticker: 'SCMN', exchange: 'SW', name: 'Swisscom', country: 'CH' },
]

// ============================================================================
// ALL INTERNATIONAL STOCKS
// ============================================================================

export const ALL_INTERNATIONAL_STOCKS: InternationalStock[] = [
  ...SWEDEN_STOCKS,
  ...DENMARK_STOCKS,
  ...NORWAY_STOCKS,
  ...FINLAND_STOCKS,
  ...GERMANY_STOCKS,
  ...NETHERLANDS_STOCKS,
  ...FRANCE_STOCKS,
  ...UK_STOCKS,
  ...SWITZERLAND_STOCKS,
]

// Get stocks by exchange
export function getStocksByExchange(exchange: string): InternationalStock[] {
  return ALL_INTERNATIONAL_STOCKS.filter(s => s.exchange === exchange)
}

// Get stocks by country
export function getStocksByCountry(country: string): InternationalStock[] {
  return ALL_INTERNATIONAL_STOCKS.filter(s => s.country === country)
}

// Exchange metadata
export const EXCHANGES = {
  // Nordic
  ST: { name: 'OMX Stockholm', country: 'Sweden', currency: 'SEK' },
  CO: { name: 'OMX Copenhagen', country: 'Denmark', currency: 'DKK' },
  OL: { name: 'Oslo Børs', country: 'Norway', currency: 'NOK' },
  HE: { name: 'OMX Helsinki', country: 'Finland', currency: 'EUR' },
  // Western Europe
  XETRA: { name: 'XETRA', country: 'Germany', currency: 'EUR' },
  AS: { name: 'Euronext Amsterdam', country: 'Netherlands', currency: 'EUR' },
  PA: { name: 'Euronext Paris', country: 'France', currency: 'EUR' },
  LSE: { name: 'London Stock Exchange', country: 'UK', currency: 'GBP' },
  SW: { name: 'SIX Swiss Exchange', country: 'Switzerland', currency: 'CHF' },
} as const

export type ExchangeCode = keyof typeof EXCHANGES
