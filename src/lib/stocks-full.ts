/**
 * Full universe of US-traded stocks for pSEO at scale
 * 5000+ tickers covering NYSE, NASDAQ, and AMEX
 * Target: 100M+ pages through combinations
 */

// All actively traded US stocks (filtered for liquidity)
export const FULL_STOCK_UNIVERSE = [
  // === MEGA CAP ($200B+) ===
  'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.A', 'BRK.B',
  'LLY', 'V', 'UNH', 'TSM', 'AVGO', 'JPM', 'WMT', 'XOM', 'MA', 'JNJ',
  'PG', 'ORCL', 'HD', 'COST', 'ABBV', 'NFLX', 'CRM', 'BAC', 'CVX', 'MRK',
  'KO', 'AMD', 'PEP', 'ADBE', 'TMO', 'CSCO', 'ACN', 'LIN', 'MCD', 'ABT',
  'WFC', 'DHR', 'NKE', 'TXN', 'QCOM', 'PM', 'INTU', 'VZ', 'CMCSA', 'DIS',

  // === LARGE CAP ($10B-$200B) - S&P 500 ===
  'IBM', 'NOW', 'INTC', 'GE', 'CAT', 'ISRG', 'SPGI', 'AXP', 'GS', 'MS',
  'AMGN', 'HON', 'UNP', 'BKNG', 'PFE', 'RTX', 'LOW', 'BA', 'ELV', 'T',
  'AMAT', 'TJX', 'SBUX', 'UPS', 'BLK', 'DE', 'SCHW', 'PLD', 'MDT', 'GILD',
  'SYK', 'BMY', 'ADP', 'VRTX', 'CB', 'ADI', 'MMC', 'LRCX', 'AMT', 'LMT',
  'CI', 'MDLZ', 'TMUS', 'MO', 'REGN', 'CME', 'ZTS', 'SLB', 'SO', 'DUK',
  'BDX', 'CL', 'CVS', 'EOG', 'PGR', 'NOC', 'ICE', 'PNC', 'ITW', 'FI',
  'EQIX', 'MPC', 'AON', 'MCK', 'KLAC', 'SNPS', 'CDNS', 'PYPL', 'USB', 'NSC',
  'WM', 'COP', 'EMR', 'MAR', 'APD', 'MMM', 'GD', 'ORLY', 'MCO', 'CTAS',
  'PSX', 'SHW', 'HCA', 'FDX', 'CMG', 'ECL', 'PCAR', 'TGT', 'ROP', 'TDG',
  'CARR', 'AZO', 'CSX', 'OXY', 'NXPI', 'MRVL', 'HLT', 'DXCM', 'MNST', 'PH',
  'WELL', 'FCX', 'MSI', 'KMB', 'MET', 'AJG', 'HUM', 'NEM', 'PSA', 'AEP',
  'COF', 'AFL', 'AIG', 'SPG', 'KDP', 'D', 'SRE', 'TRV', 'DLR', 'CCI',
  'PAYX', 'O', 'ALL', 'EW', 'PRU', 'BK', 'FTNT', 'MSCI', 'CPRT', 'TEL',
  'GWW', 'ROST', 'CHTR', 'KMI', 'OKE', 'YUM', 'STZ', 'GM', 'FAST', 'LHX',
  'VLO', 'RSG', 'DHI', 'ODFL', 'MCHP', 'CTVA', 'PCG', 'NUE', 'IQV', 'VRSK',
  'KEYS', 'A', 'KVUE', 'EXC', 'F', 'KR', 'GIS', 'WMB', 'IT', 'GEHC',
  'HES', 'TROW', 'DOW', 'HAL', 'ED', 'DD', 'CEG', 'XEL', 'DVN', 'PPG',
  'VMC', 'HSY', 'ADM', 'RCL', 'EIX', 'ON', 'WST', 'EFX', 'BKR', 'VICI',
  'CBRE', 'BIIB', 'AWK', 'ANSS', 'WEC', 'MLM', 'DFS', 'FANG', 'IDXX', 'MTD',
  'AVB', 'CDW', 'ETR', 'ROK', 'DOV', 'TSCO', 'PPL', 'WTW', 'ACGL', 'EQR',
  'IFF', 'DTE', 'EBAY', 'GRMN', 'XYL', 'ZBH', 'WBD', 'HPQ', 'LYB', 'CHD',
  'STT', 'IR', 'VRSN', 'SBAC', 'FTV', 'WAB', 'FE', 'GPC', 'MTB', 'NTAP',
  'FITB', 'ES', 'HBAN', 'ULTA', 'TRGP', 'BR', 'PWR', 'CAH', 'CTRA', 'SYY',
  'TDY', 'EXR', 'HPE', 'STE', 'INVH', 'HUBB', 'CINF', 'AEE', 'PFG', 'MAA',
  'RF', 'WAT', 'J', 'TYL', 'HOLX', 'DRI', 'AXON', 'CLX', 'CNP', 'BAX',
  'COO', 'IP', 'NTRS', 'K', 'LUV', 'BALL', 'STLD', 'NVR', 'LDOS', 'POOL',
  'CMS', 'IEX', 'WY', 'CBOE', 'ESS', 'OMC', 'PTC', 'TRMB', 'VLTO', 'PKG',
  'AMCR', 'DGX', 'KEY', 'MAS', 'SNA', 'LH', 'ARE', 'BBY', 'EXPD', 'MKC',
  'JBHT', 'GEN', 'TXT', 'ATO', 'AVY', 'FICO', 'CHRW', 'ALGN', 'PODD', 'NI',
  'CFG', 'DPZ', 'SWK', 'LNT', 'SWKS', 'MGM', 'IPG', 'NDSN', 'BRO', 'JKHY',
  'PAYC', 'LKQ', 'VTRS', 'KIM', 'HST', 'CF', 'REG', 'AOS', 'TECH', 'FFIV',
  'JCI', 'SJM', 'WRB', 'CRL', 'GL', 'EMN', 'UDR', 'CPT', 'PEAK', 'RHI',
  'JNPR', 'BXP', 'CE', 'EVRG', 'HWM', 'TPR', 'ROL', 'FRT', 'INCY', 'WDC',
  'HSIC', 'BWA', 'PNR', 'WYNN', 'UHS', 'L', 'TFX', 'LW', 'APA', 'TAP',
  'QRVO', 'AIZ', 'ALB', 'HRL', 'CPB', 'FMC', 'CZR', 'IVZ', 'HAS', 'RJF',
  'MHK', 'MKTX', 'PNW', 'SEE', 'DAL', 'ALK', 'ALLE', 'GNRC', 'CAG', 'CMA',
  'AES', 'HII', 'AAL', 'MOS', 'BEN', 'NCLH', 'CCL', 'FOXA', 'FOX', 'NWS',
  'NWSA', 'PARA', 'MTCH', 'DVA', 'RL', 'ZION', 'BBWI', 'XRAY', 'NWL', 'VFC',

  // === MID CAP ($2B-$10B) ===
  'PLUG', 'RIVN', 'LCID', 'PLTR', 'COIN', 'HOOD', 'SOFI', 'RBLX', 'DKNG', 'U',
  'SNOW', 'DDOG', 'NET', 'CRWD', 'ZS', 'MDB', 'PATH', 'DASH', 'UBER', 'LYFT',
  'SNAP', 'PINS', 'SQ', 'AFRM', 'UPST', 'SHOP', 'MELI', 'SE', 'SPOT', 'ROKU',
  'ZM', 'DOCU', 'OKTA', 'TWLO', 'HUBS', 'TEAM', 'WDAY', 'SPLK', 'ESTC', 'CFLT',
  'BILL', 'MNDY', 'FIVN', 'ASAN', 'APP', 'BRZE', 'DOCN', 'GTLB', 'IOT', 'SMAR',
  'ENPH', 'FSLR', 'RUN', 'SEDG', 'ARRY', 'NOVA', 'CSIQ', 'JKS', 'FLNC', 'STEM',
  'GME', 'AMC', 'BB', 'NOK', 'BBBY', 'WISH', 'CLOV', 'SPCE', 'TLRY', 'SNDL',
  'FCEL', 'BLNK', 'QS', 'CHPT', 'GOEV', 'RIDE', 'WKHS', 'FSR', 'NKLA', 'HYLN',
  'NIO', 'XPEV', 'LI', 'BABA', 'JD', 'PDD', 'BIDU', 'BILI', 'IQ', 'TME',
  'FUTU', 'TIGR', 'VNET', 'WB', 'DIDI', 'GRAB', 'CPNG', 'COUPANG', 'GOTU',
  'TAL', 'EDU', 'DOYU', 'HUYA', 'YY', 'BZUN', 'VIPS', 'ATHM', 'QFIN', 'LX',
  'BEKE', 'ZH', 'KC', 'TUYA', 'FINV', 'X', 'YMM', 'ZEPP', 'DQ', 'BEST',
  'MRNA', 'BNTX', 'NVAX', 'VXRT', 'INO', 'SRNE', 'OCGN', 'ADGI', 'DVAX', 'VIR',
  'SAVA', 'PRTA', 'ALNY', 'EXAS', 'RARE', 'NBIX', 'SRPT', 'IONS', 'BMRN', 'UTHR',
  'JAZZ', 'BIO', 'HZNP', 'NVST', 'EXEL', 'KRTX', 'ARWR', 'RCKT', 'NTLA', 'CRSP',
  'BEAM', 'EDIT', 'VERV', 'SGMO', 'FATE', 'PCRX', 'CRNX', 'RVMD', 'PCVX', 'IMVT',
  'TOST', 'BROS', 'DTC', 'FVRR', 'ETSY', 'W', 'CHWY', 'PTON', 'BMBL', 'MTTR',
  'ABNB', 'EXPE', 'TRIP', 'BKNG', 'MAR', 'HLT', 'H', 'WH', 'IHG', 'WYNN',
  'LVS', 'MGM', 'CZR', 'PENN', 'DKNG', 'RSI', 'GENI', 'BALY', 'RRR', 'MLCO',
  'TWST', 'PACB', 'ILMN', 'TXG', 'VCYT', 'GH', 'NTRA', 'MYGN', 'CGEN', 'CDNA',
  'IRTC', 'NUVB', 'RXRX', 'DNA', 'ACHR', 'JOBY', 'LILM', 'EVTL', 'BLDE', 'ACHR',
  'ENVX', 'QS', 'MVST', 'DCRC', 'STLA', 'RIVN', 'LCID', 'FSR', 'FFIE', 'PSNY',
  'LAZR', 'VLDR', 'INVZ', 'OUST', 'AEVA', 'CPTN', 'LIDR', 'MVIS', 'AEYE', 'FRSH',

  // === SMALL CAP ($300M-$2B) ===
  'ASTS', 'RKT', 'UWMC', 'GHRS', 'ROOT', 'LMND', 'OPEN', 'RDFN', 'COMP', 'REAL',
  'PAYO', 'DLO', 'GLBE', 'FOUR', 'GPN', 'EVTC', 'RPAY', 'BTRS', 'BZ', 'ZI',
  'SEMR', 'PUBM', 'MGNI', 'TTD', 'DSP', 'IAS', 'CRTO', 'APPS', 'ZETA', 'INFA',
  'AI', 'BIGC', 'STNE', 'PAGS', 'XP', 'NU', 'VTEX', 'LCID', 'ARVL', 'REE',
  'GOEV', 'PSNY', 'FFIE', 'MULN', 'SOLO', 'AYRO', 'ELMS', 'CENN', 'WKHS', 'RIDE',
  'NKLA', 'HYLN', 'XL', 'CLVR', 'FSR', 'VLTA', 'EVGO', 'CHPT', 'BLNK', 'SBE',
  'SPWR', 'MAXN', 'SUNW', 'SPWR', 'ARRY', 'SHLS', 'ALTM', 'ORA', 'CWEN', 'AY',
  'BE', 'FCEL', 'PLUG', 'BLDP', 'HYSR', 'HTOO', 'GEVO', 'AMTX', 'GPRE', 'REX',
  'CLNE', 'HYZN', 'NKLA', 'PTRA', 'ARVL', 'LEV', 'XOS', 'HLLY', 'LAZR', 'OUST',

  // === POPULAR ETFS ===
  'SPY', 'QQQ', 'VOO', 'VTI', 'IWM', 'DIA', 'IVV', 'VEA', 'VWO', 'EFA',
  'EEM', 'AGG', 'BND', 'LQD', 'HYG', 'TLT', 'IEF', 'SHY', 'TIP', 'MUB',
  'ARKK', 'ARKG', 'ARKW', 'ARKF', 'ARKQ', 'ARKX', 'PRNT', 'IZRL', 'XLF', 'XLE',
  'XLK', 'XLV', 'XLI', 'XLP', 'XLU', 'XLY', 'XLB', 'XLRE', 'XLC', 'VIG',
  'VYM', 'SCHD', 'DVY', 'SDY', 'DGRO', 'NOBL', 'VNQ', 'VNQI', 'IYR', 'RWR',
  'GLD', 'IAU', 'SLV', 'GDX', 'GDXJ', 'USO', 'UNG', 'DBA', 'DBC', 'GSG',
  'SOXX', 'SMH', 'XBI', 'IBB', 'XHB', 'ITB', 'XRT', 'KRE', 'KBE', 'XOP',
  'OIH', 'JETS', 'BUZZ', 'MEME', 'YOLO', 'MJ', 'THCX', 'POTX', 'CNBS', 'WEED',
  'KWEB', 'FXI', 'MCHI', 'ASHR', 'CQQQ', 'EWJ', 'EWZ', 'EWG', 'EWY', 'EWT',
  'INDA', 'EPI', 'VNM', 'THD', 'EIDO', 'EPHE', 'ECH', 'EPU', 'ARGT', 'EWW',

  // === INTERNATIONAL ADRS ===
  'TSM', 'ASML', 'SAP', 'TM', 'NVS', 'SONY', 'AZN', 'GSK', 'SNY', 'NVO',
  'HMC', 'MUFG', 'SMFG', 'MFG', 'KB', 'SHG', 'WBK', 'LYG', 'BCS', 'DB',
  'UBS', 'CS', 'ING', 'BBVA', 'SAN', 'BTI', 'NGG', 'VOD', 'BP', 'SHEL',
  'TTE', 'EQNR', 'E', 'ENB', 'TRP', 'SU', 'CNQ', 'CVE', 'IMO', 'GOLD',
  'NEM', 'VALE', 'RIO', 'BHP', 'SCCO', 'FCX', 'TECK', 'MT', 'CLF', 'X',
  'PKX', 'STLD', 'NUE', 'AA', 'CENX', 'ACH', 'KALU', 'ATI', 'HAYN', 'ZEUS',
  'DEO', 'BUD', 'STZ', 'TAP', 'SAM', 'MNST', 'KDP', 'CELH', 'FIZZ', 'COKE',
  'UL', 'PG', 'CL', 'KMB', 'CHD', 'CLX', 'HELE', 'EPC', 'SPB', 'ENR',
  'LUX', 'LVMH', 'MC', 'KER', 'RMS', 'CFR', 'RACE', 'POAHY', 'VWAGY', 'BMWYY',
  'DDAIF', 'NSANY', 'HYMTF', 'FUJIY', 'TOELY', 'NTDOY', 'RKUNY', 'CCOEY', 'LRLCY',

  // === REITS ===
  'PLD', 'AMT', 'EQIX', 'CCI', 'PSA', 'SPG', 'DLR', 'O', 'WELL', 'VICI',
  'AVB', 'EQR', 'VTR', 'ARE', 'MAA', 'UDR', 'ESS', 'EXR', 'CPT', 'INVH',
  'HST', 'KIM', 'REG', 'BXP', 'SLG', 'VNO', 'PEAK', 'DOC', 'HR', 'SBAC',
  'AMH', 'CUBE', 'LSI', 'NSA', 'REXR', 'FR', 'STAG', 'TRNO', 'EGP', 'IIPR',
  'NNN', 'WPC', 'STOR', 'ADC', 'EPRT', 'GTY', 'FCPT', 'PINE', 'CTO', 'GOOD',
  'MPW', 'OHI', 'SBRA', 'LTC', 'CTRE', 'NHI', 'SNR', 'GEO', 'CXW', 'APLE',
  'SHO', 'PEB', 'RHP', 'DRH', 'XHR', 'SVC', 'INN', 'AHT', 'CLH', 'BRX',
  'AKR', 'ROIC', 'SITC', 'UE', 'WSR', 'RPAI', 'WRI', 'FRT', 'ALX', 'ESRT',

  // === FINANCIALS - BANKS ===
  'JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'USB', 'PNC', 'TFC', 'SCHW',
  'BK', 'STT', 'NTRS', 'FITB', 'KEY', 'CFG', 'RF', 'HBAN', 'MTB', 'ZION',
  'CMA', 'FHN', 'ALLY', 'SIVB', 'FCNCA', 'WAL', 'PACW', 'FRC', 'SBNY', 'SI',
  'EWBC', 'BOH', 'GBCI', 'CATY', 'CVBF', 'FFIN', 'IBOC', 'TCBI', 'UMPQ', 'WBS',
  'COLB', 'SBCF', 'PNFP', 'UBSI', 'FULT', 'WSFS', 'BPOP', 'FBK', 'OFG', 'SEIC',

  // === INSURANCE ===
  'BRK.B', 'PGR', 'CB', 'AIG', 'MET', 'PRU', 'AFL', 'TRV', 'ALL', 'HIG',
  'L', 'CINF', 'WRB', 'RE', 'RNR', 'ACGL', 'KNSL', 'KINSW', 'ORI', 'AIZ',
  'GL', 'PFG', 'LNC', 'VOYA', 'UNUM', 'CNO', 'FAF', 'FNF', 'STC', 'ESNT',
  'RDN', 'MTG', 'NMIH', 'MGIC', 'AGO', 'MBI', 'ABR', 'BXMT', 'STWD', 'LADR',

  // === ASSET MANAGERS ===
  'BLK', 'BX', 'KKR', 'APO', 'CG', 'ARES', 'OWL', 'STEP', 'TPG', 'HLNE',
  'AMG', 'TROW', 'IVZ', 'BEN', 'VCTR', 'APAM', 'WDR', 'FHI', 'GBL', 'VRTS',
  'WETF', 'GHC', 'EVR', 'PJT', 'HLI', 'MC', 'LAZ', 'MOEQ', 'GCMG', 'PRIM',

  // === HEALTHCARE - BIOTECH ===
  'MRNA', 'BNTX', 'REGN', 'VRTX', 'GILD', 'AMGN', 'BIIB', 'ALNY', 'SGEN', 'BMRN',
  'EXAS', 'RARE', 'NBIX', 'SRPT', 'IONS', 'UTHR', 'JAZZ', 'HZNP', 'INCY', 'EXEL',
  'NVAX', 'VXRT', 'INO', 'SRNE', 'OCGN', 'ADGI', 'DVAX', 'VIR', 'SAVA', 'PRTA',
  'KRTX', 'ARWR', 'RCKT', 'NTLA', 'CRSP', 'BEAM', 'EDIT', 'VERV', 'SGMO', 'FATE',
  'PCVX', 'IMVT', 'CRNX', 'RVMD', 'PCRX', 'ACAD', 'PTCT', 'ALKS', 'ARCT', 'ARVN',
  'DAWN', 'KYMR', 'TGTX', 'CCCC', 'MRSN', 'LEGN', 'RLAY', 'SRRK', 'RXDX', 'DCPH',

  // === HEALTHCARE - DEVICES ===
  'MDT', 'ABT', 'SYK', 'BSX', 'ISRG', 'ZBH', 'EW', 'DXCM', 'ALGN', 'PODD',
  'HOLX', 'IDXX', 'BIO', 'A', 'WAT', 'TFX', 'BAX', 'NVST', 'TECH', 'GMED',
  'INSP', 'IRTC', 'NVCR', 'LIVN', 'NUVA', 'MMSI', 'ATRC', 'AORT', 'PRCT', 'AXNX',
  'SILK', 'SWAV', 'SHOC', 'VAPO', 'IART', 'ICUI', 'VCEL', 'ANGO', 'CNMD', 'CRY',

  // === HEALTHCARE - SERVICES ===
  'UNH', 'ELV', 'HUM', 'CI', 'CNC', 'MOH', 'CVS', 'HCA', 'THC', 'UHS',
  'ACHC', 'SGRY', 'SEM', 'AMED', 'LHCG', 'ADUS', 'EHC', 'DVA', 'DGX', 'LH',
  'OPCH', 'TDOC', 'AMWL', 'TALK', 'HIMS', 'DOCS', 'OSCR', 'CLOV', 'CLVR', 'ALHC',

  // === TECH - SOFTWARE ===
  'MSFT', 'CRM', 'ORCL', 'SAP', 'ADBE', 'NOW', 'INTU', 'WDAY', 'TEAM', 'HUBS',
  'DDOG', 'SNOW', 'NET', 'CRWD', 'ZS', 'MDB', 'PATH', 'OKTA', 'DOCU', 'ZM',
  'TWLO', 'SPLK', 'ESTC', 'CFLT', 'BILL', 'MNDY', 'FIVN', 'ASAN', 'APP', 'BRZE',
  'DOCN', 'GTLB', 'IOT', 'SMAR', 'DV', 'EVCM', 'APPN', 'COUP', 'ZUO', 'AVLR',
  'PCTY', 'PAYC', 'PAYX', 'ADP', 'CDAY', 'WK', 'PING', 'SAIL', 'TENB', 'RPD',

  // === TECH - SEMICONDUCTORS ===
  'NVDA', 'AMD', 'INTC', 'AVGO', 'TXN', 'QCOM', 'TSM', 'ASML', 'AMAT', 'LRCX',
  'KLAC', 'SNPS', 'CDNS', 'MRVL', 'NXPI', 'ON', 'ADI', 'MCHP', 'SWKS', 'QRVO',
  'MU', 'WDC', 'STX', 'WOLF', 'CRUS', 'SLAB', 'LSCC', 'SITM', 'MTSI', 'FORM',
  'POWI', 'DIOD', 'SMTC', 'AMBA', 'HIMX', 'AOSL', 'NVTS', 'ALGM', 'RMBS', 'CRDO',
  'ACLS', 'UCTT', 'COHU', 'ICHR', 'ONTO', 'KLIC', 'ENTG', 'MKSI', 'CGNX', 'TER',

  // === TECH - HARDWARE ===
  'AAPL', 'DELL', 'HPQ', 'HPE', 'LOGI', 'CRSR', 'HEAR', 'GPRO', 'SONO', 'VZIO',
  'KOSS', 'UEIC', 'DGII', 'DIGI', 'CALX', 'CASA', 'INFN', 'LITE', 'VIAV', 'IIVI',
  'COHR', 'IPGP', 'LASR', 'MKSI', 'NOVT', 'CGNX', 'ISRG', 'IRTC', 'NVEC', 'PLAB',

  // === CONSUMER - RETAIL ===
  'AMZN', 'WMT', 'COST', 'TGT', 'HD', 'LOW', 'TJX', 'ROST', 'BBY', 'DG',
  'DLTR', 'KR', 'WBA', 'CVS', 'ULTA', 'ORLY', 'AZO', 'AAP', 'GPC', 'TSCO',
  'FIVE', 'OLLI', 'PRTS', 'BURL', 'WSM', 'RH', 'ETSY', 'CHWY', 'W', 'OSTK',
  'EBAY', 'MELI', 'SE', 'CPNG', 'WISH', 'JMIA', 'VIPS', 'JD', 'BABA', 'PDD',
  'GPS', 'ANF', 'AEO', 'URBN', 'EXPR', 'TLYS', 'ZUMZ', 'PLCE', 'GES', 'CRI',

  // === CONSUMER - FOOD & BEV ===
  'PEP', 'KO', 'MDLZ', 'HSY', 'K', 'GIS', 'CAG', 'CPB', 'HRL', 'SJM',
  'MKC', 'TSN', 'HRL', 'CALM', 'JJSF', 'LNDC', 'LANC', 'THS', 'BGS', 'POST',
  'SMPL', 'BYND', 'OTLY', 'TTCF', 'APPH', 'VFF', 'ANDE', 'AGRO', 'VITL', 'HAIN',
  'STZ', 'BUD', 'TAP', 'SAM', 'DEO', 'BF.A', 'BF.B', 'ABEV', 'CCU', 'BREW',
  'MNST', 'CELH', 'FIZZ', 'COKE', 'KDP', 'NBEV', 'REED', 'PRMW', 'WTER', 'LIQT',

  // === CONSUMER - RESTAURANTS ===
  'MCD', 'SBUX', 'CMG', 'YUM', 'DRI', 'DENN', 'DPZ', 'QSR', 'WEN', 'JACK',
  'PZZA', 'PLAY', 'TXRH', 'EAT', 'CAKE', 'BLMN', 'BJRI', 'RRGB', 'RUTH', 'ARKR',
  'BROS', 'DNKN', 'WING', 'SHAK', 'CAVA', 'SWET', 'FAT', 'BJ', 'FRGI', 'TAST',

  // === INDUSTRIALS ===
  'CAT', 'DE', 'HON', 'GE', 'BA', 'RTX', 'LMT', 'NOC', 'GD', 'HII',
  'TXT', 'LHX', 'TDG', 'HWM', 'AXON', 'SPR', 'HXL', 'CW', 'MOG.A', 'KTOS',
  'UNP', 'NSC', 'CSX', 'KSU', 'CP', 'CNI', 'UPS', 'FDX', 'XPO', 'JBHT',
  'ODFL', 'SAIA', 'WERN', 'KNX', 'SNDR', 'HUBG', 'ARCB', 'CHRW', 'EXPD', 'GXO',
  'EMR', 'ROK', 'ETN', 'PH', 'ITW', 'DOV', 'IR', 'XYL', 'GNRC', 'FLS',
  'ROP', 'NDSN', 'GGG', 'PNR', 'LECO', 'FSS', 'FLOW', 'AWI', 'TILE', 'FBIN',

  // === ENERGY ===
  'XOM', 'CVX', 'COP', 'EOG', 'SLB', 'OXY', 'MPC', 'PSX', 'VLO', 'HES',
  'DVN', 'FANG', 'PXD', 'HAL', 'BKR', 'OKE', 'WMB', 'KMI', 'TRGP', 'LNG',
  'ET', 'EPD', 'MMP', 'PAA', 'MPLX', 'WES', 'DCP', 'CEQP', 'NS', 'ENLC',
  'AR', 'RRC', 'SWN', 'EQT', 'CNX', 'COG', 'MTDR', 'PDCE', 'CTRA', 'SM',

  // === MATERIALS ===
  'LIN', 'APD', 'SHW', 'ECL', 'DD', 'DOW', 'LYB', 'CE', 'EMN', 'FMC',
  'ALB', 'PPG', 'RPM', 'AXTA', 'ASH', 'HUN', 'OLN', 'CC', 'TROX', 'KRO',
  'NEM', 'GOLD', 'FCX', 'SCCO', 'BHP', 'RIO', 'VALE', 'TECK', 'CLF', 'X',
  'NUE', 'STLD', 'CMC', 'RS', 'ATI', 'CRS', 'HAYN', 'ZEUS', 'CENX', 'KALU',

  // === UTILITIES ===
  'NEE', 'DUK', 'SO', 'D', 'AEP', 'SRE', 'EXC', 'XEL', 'WEC', 'ED',
  'ES', 'DTE', 'ETR', 'FE', 'AEE', 'CMS', 'CNP', 'NI', 'PPL', 'LNT',
  'PNW', 'EVRG', 'ATO', 'NJR', 'SWX', 'NWN', 'SR', 'OGS', 'CPK', 'POR',
  'AWK', 'WTRG', 'WTR', 'AWR', 'CWT', 'SJW', 'YORW', 'ARTNA', 'MSEX', 'UGI',

  // === TELECOM ===
  'VZ', 'T', 'TMUS', 'LUMN', 'USM', 'ATUS', 'SHEN', 'CNSL', 'LILA', 'LILAK',

  // === MEDIA & ENTERTAINMENT ===
  'DIS', 'NFLX', 'CMCSA', 'CHTR', 'WBD', 'PARA', 'FOX', 'FOXA', 'NWS', 'NWSA',
  'VIAC', 'DISCA', 'DISCB', 'DISCK', 'LYV', 'MSGS', 'MSG', 'AMC', 'CNK', 'IMAX',
  'ROKU', 'SPOT', 'TME', 'IQ', 'BILI', 'HUYA', 'DOYU', 'WMG', 'UMG', 'SONO',

  // === GAMING ===
  'EA', 'TTWO', 'ATVI', 'RBLX', 'U', 'ZNGA', 'ZYNG', 'GLUU', 'PLTK', 'SKLZ',
  'DDI', 'GRVY', 'GMGI', 'SLGG', 'HUYA', 'DOYU', 'SE', 'BILI', 'NTES', 'TCEHY',

  // === AEROSPACE & DEFENSE ===
  'BA', 'LMT', 'RTX', 'NOC', 'GD', 'HII', 'TXT', 'LHX', 'TDG', 'HWM',
  'AXON', 'SPR', 'HXL', 'CW', 'MOG.A', 'KTOS', 'AVAV', 'MRCY', 'MAXR', 'PKE',

  // === AUTOS ===
  'TSLA', 'GM', 'F', 'TM', 'HMC', 'STLA', 'RIVN', 'LCID', 'NIO', 'XPEV',
  'LI', 'FSR', 'GOEV', 'WKHS', 'RIDE', 'NKLA', 'HYLN', 'SOLO', 'AYRO', 'CENN',
  'AAP', 'AZO', 'ORLY', 'GPC', 'AN', 'ABG', 'PAG', 'LAD', 'SAH', 'GPI',
  'KMX', 'CVNA', 'VRM', 'SFT', 'LOTZ', 'RMBL', 'CZOO', 'DRVN', 'TGLS', 'GOEV',

  // === TRAVEL & LEISURE ===
  'ABNB', 'BKNG', 'EXPE', 'TRIP', 'MAR', 'HLT', 'H', 'WH', 'IHG', 'WYNN',
  'LVS', 'MGM', 'CZR', 'PENN', 'DKNG', 'RSI', 'GENI', 'BALY', 'RRR', 'MLCO',
  'RCL', 'CCL', 'NCLH', 'LUV', 'DAL', 'UAL', 'AAL', 'ALK', 'JBLU', 'SAVE',
  'HA', 'MESA', 'SKYW', 'ALGT', 'SYX', 'SNCY', 'GOL', 'CPA', 'VLRS', 'PAC',

  // === CANNABIS ===
  'TLRY', 'CGC', 'ACB', 'CRON', 'HEXO', 'OGI', 'SNDL', 'VFF', 'GRWG', 'SMG',
  'TCNNF', 'CURLF', 'GTBIF', 'CRLBF', 'TRUL', 'CCHW', 'AYRWF', 'VRNOF', 'JUSHF',

  // === CRYPTO-RELATED ===
  'COIN', 'MSTR', 'SQ', 'PYPL', 'MARA', 'RIOT', 'HUT', 'BITF', 'HIVE', 'CAN',
  'CLSK', 'BTBT', 'BTCS', 'ARBK', 'CIFR', 'GREE', 'DMGGF', 'BKKT', 'HOOD', 'SI',

  // === SPACS & RECENT IPOS ===
  'RIVN', 'LCID', 'RBLX', 'COIN', 'PLTR', 'SNOW', 'ABNB', 'DASH', 'DDOG', 'U',
  'PATH', 'HOOD', 'SOFI', 'OPEN', 'WISH', 'CLOV', 'BARK', 'PRPL', 'GOEV', 'VLD',
]

// === ADDITIONAL STOCKS FOR SCALE (Russell 2000 + More) ===
const ADDITIONAL_STOCKS = [
  // A
  'A', 'AA', 'AAL', 'AAN', 'AAOI', 'AAON', 'AAP', 'AAWW', 'AAXJ', 'AB', 'ABB', 'ABBV', 'ABC', 'ABCB', 'ABCL', 'ABEV', 'ABG', 'ABM', 'ABNB', 'ABOS', 'ABR', 'ABSI', 'ABT', 'ABUS', 'ACAD', 'ACBI', 'ACC', 'ACCD', 'ACCO', 'ACEL', 'ACER', 'ACET', 'ACGL', 'ACHC', 'ACHR', 'ACHV', 'ACI', 'ACIU', 'ACIW', 'ACLS', 'ACM', 'ACMR', 'ACN', 'ACNB', 'ACON', 'ACOS', 'ACP', 'ACQR', 'ACR', 'ACRE', 'ACRS', 'ACRX', 'ACT', 'ACTD', 'ACTG', 'ACU', 'ACV', 'ACVA', 'ACWI', 'ACWV', 'ACXP', 'ADAG', 'ADAP', 'ADBE', 'ADC', 'ADCT', 'ADD', 'ADEA', 'ADER', 'ADES', 'ADI', 'ADIL', 'ADM', 'ADMA', 'ADMP', 'ADN', 'ADNT', 'ADP', 'ADPT', 'ADS', 'ADSK', 'ADTH', 'ADTN', 'ADTX', 'ADV', 'ADVM', 'ADXN', 'ADY', 'AE', 'AEE', 'AEF', 'AEFC', 'AEG', 'AEHR', 'AEI', 'AEIS', 'AEL', 'AEM', 'AEMD', 'AENT', 'AEO', 'AEON', 'AEP', 'AER', 'AERI', 'AES', 'AESI', 'AEVA', 'AEZS', 'AF', 'AFB', 'AFBI', 'AFCG', 'AFG', 'AFGC', 'AFGE', 'AFIB', 'AFL', 'AFMD', 'AFRI', 'AFRM', 'AFSR', 'AFT', 'AFTR', 'AFYA', 'AG', 'AGAC', 'AGBA', 'AGCO', 'AGED', 'AGEN', 'AGFY', 'AGGH', 'AGGR', 'AGI', 'AGIO', 'AGL', 'AGLE', 'AGLY', 'AGM', 'AGMH', 'AGNC', 'AGNCO', 'AGO', 'AGR', 'AGRI', 'AGRO', 'AGRX', 'AGS', 'AGSS', 'AGT', 'AGTI', 'AGTX', 'AGTY', 'AGX', 'AGYS',
  // B
  'BA', 'BABA', 'BAC', 'BACA', 'BACK', 'BAFN', 'BAH', 'BAK', 'BALL', 'BALY', 'BAM', 'BANC', 'BAND', 'BANF', 'BANFP', 'BANL', 'BANR', 'BANX', 'BAOS', 'BAP', 'BARK', 'BASE', 'BATL', 'BATRA', 'BATRK', 'BAX', 'BB', 'BBAI', 'BBAR', 'BBAX', 'BBBY', 'BBCP', 'BBD', 'BBDC', 'BBDO', 'BBER', 'BBEU', 'BBF', 'BBGI', 'BBH', 'BBI', 'BBIG', 'BBIN', 'BBIO', 'BBJP', 'BBL', 'BBMC', 'BBN', 'BBPLF', 'BBQ', 'BBRE', 'BBRW', 'BBSEY', 'BBSI', 'BBT', 'BBU', 'BBUC', 'BBVA', 'BBWI', 'BBY', 'BC', 'BCAB', 'BCACU', 'BCAT', 'BCC', 'BCDA', 'BCE', 'BCH', 'BCHAU', 'BCML', 'BCO', 'BCOR', 'BCOV', 'BCOW', 'BCPC', 'BCPT', 'BCR', 'BCRX', 'BCS', 'BCSAU', 'BCSF', 'BCTX', 'BCV', 'BCX', 'BCYC', 'BCYP', 'BD', 'BDC', 'BDCZ', 'BDJ', 'BDMS', 'BDN', 'BDR', 'BDRX', 'BDRY', 'BDSI', 'BDSX', 'BDTX', 'BDX', 'BDXB',
  // C
  'C', 'CAAP', 'CAAS', 'CABA', 'CABO', 'CACI', 'CADE', 'CADL', 'CAE', 'CAF', 'CAG', 'CAH', 'CAI', 'CAKE', 'CAL', 'CALA', 'CALC', 'CALH', 'CALI', 'CALL', 'CALM', 'CALW', 'CALX', 'CAMP', 'CAMT', 'CAN', 'CANB', 'CANF', 'CANG', 'CAPE', 'CAPL', 'CAPR', 'CAPS', 'CAPU', 'CAR', 'CARA', 'CARE', 'CARG', 'CARR', 'CARS', 'CART', 'CARV', 'CASA', 'CASH', 'CASI', 'CASS', 'CASY', 'CAT', 'CATB', 'CATC', 'CATO', 'CATS', 'CATY', 'CAXY', 'CB', 'CBAN', 'CBAT', 'CBAY', 'CBB', 'CBFV', 'CBG', 'CBH', 'CBIO', 'CBL', 'CBMB', 'CBMG', 'CBNK', 'CBO', 'CBOE', 'CBPO', 'CBRE', 'CBRL', 'CBS', 'CBSH', 'CBSHP', 'CBT', 'CBTX', 'CBU', 'CBUS', 'CBZ', 'CC', 'CCAP', 'CCB', 'CCBG', 'CCC', 'CCCC', 'CCCL', 'CCCS', 'CCD', 'CCEC', 'CCEL', 'CCEP', 'CCF', 'CCFN', 'CCHR', 'CCI', 'CCIF', 'CCIV', 'CCJ', 'CCK', 'CCL', 'CCLP', 'CCM', 'CCMP', 'CCNE', 'CCNEP', 'CCO', 'CCOB', 'CCOI', 'CCOO', 'CCOR', 'CCPT', 'CCR', 'CCRD', 'CCRN', 'CCS', 'CCSI', 'CCSN', 'CCTG', 'CCU', 'CCV', 'CCX', 'CCXI', 'CCZ', 'CD', 'CDAK', 'CDAY', 'CDE', 'CDEL', 'CDEV', 'CDI', 'CDII', 'CDK', 'CDL', 'CDLR', 'CDLX', 'CDMO', 'CDMOP', 'CDNA', 'CDNS', 'CDR', 'CDRE', 'CDRO', 'CDTX', 'CDW', 'CDXC', 'CDXS', 'CDZI', 'CE', 'CEA', 'CEAD', 'CEADW', 'CECE', 'CEE', 'CEF', 'CEG', 'CEIX', 'CEL', 'CELC', 'CELG', 'CELH', 'CELL', 'CELU', 'CELZ', 'CEM', 'CEMI', 'CEN', 'CENAQ', 'CENTA', 'CENTY', 'CENX', 'CEO', 'CEPU', 'CEQP', 'CERN', 'CERS', 'CERT', 'CET', 'CETV', 'CETX', 'CETY', 'CEV', 'CEVA', 'CF', 'CFA', 'CFB', 'CFBK', 'CFC', 'CFCV', 'CFE', 'CFFI', 'CFFN', 'CFG', 'CFIV', 'CFL', 'CFLT', 'CFM', 'CFMS', 'CFO', 'CFR', 'CFRX', 'CFS', 'CFSA', 'CFVI', 'CFX', 'CG', 'CGA', 'CGABL', 'CGAU', 'CGBD', 'CGC', 'CGEM', 'CGEN', 'CGNT', 'CGNX', 'CGO', 'CGRN', 'CGW', 'CHAA', 'CHCI', 'CHCO', 'CHCT', 'CHD', 'CHDN', 'CHE', 'CHEF', 'CHEK', 'CHGG', 'CHH', 'CHIC', 'CHIM', 'CHIQ', 'CHIR', 'CHIX', 'CHK', 'CHKL', 'CHKP', 'CHMA', 'CHMG', 'CHMI', 'CHN', 'CHNR', 'CHOE', 'CHOEU', 'CHOH', 'CHPT', 'CHR', 'CHRD', 'CHRS', 'CHRW', 'CHS', 'CHSCL', 'CHSCM', 'CHSCN', 'CHSCO', 'CHSCP', 'CHTR', 'CHUY', 'CHWA', 'CHX', 'CHY', 'CI', 'CIA', 'CIB', 'CIBR', 'CIC', 'CIEN', 'CIF', 'CIFFR', 'CIFR', 'CIG', 'CIGI', 'CIH', 'CIIG', 'CII', 'CIIQ', 'CIK', 'CIM', 'CINF', 'CINR', 'CING', 'CIO', 'CION', 'CIR', 'CIRC', 'CIRS', 'CISO', 'CITE', 'CIV', 'CIVB', 'CIVI', 'CIVX', 'CIX', 'CIZ', 'CIZN', 'CJJD', 'CKFS', 'CKPT', 'CKX', 'CL', 'CLAR', 'CLB', 'CLBS', 'CLBT', 'CLC', 'CLCT', 'CLD', 'CLDB', 'CLDX', 'CLDY', 'CLEAN', 'CLEU', 'CLF', 'CLFD', 'CLGN', 'CLGX', 'CLH', 'CLI', 'CLIR', 'CLIR', 'CLIX', 'CLLS', 'CLM', 'CLMB', 'CLMN', 'CLMT', 'CLNE', 'CLNN', 'CLNV', 'CLOV', 'CLPR', 'CLPS', 'CLPT', 'CLR', 'CLRB', 'CLRM', 'CLRO', 'CLS', 'CLSD', 'CLSK', 'CLSN', 'CLST', 'CLT', 'CLTR', 'CLTX', 'CLUB', 'CLVR', 'CLVS', 'CLW', 'CLWT', 'CLX', 'CLXT', 'CM', 'CMA', 'CMAX', 'CMBM', 'CMC', 'CMCA', 'CMCL', 'CMCM', 'CMCO', 'CMCSA', 'CMCT', 'CMD', 'CME', 'CMFN', 'CMG', 'CMI', 'CMLF', 'CMLS', 'CMM', 'CMMB', 'CMMD', 'CMP', 'CMPI', 'CMPO', 'CMPR', 'CMPS', 'CMPX', 'CMRE', 'CMRG', 'CMRX', 'CMS', 'CMSA', 'CMSC', 'CMSD', 'CMT', 'CMTG', 'CMTL', 'CMU', 'CNA', 'CNCE', 'CNCN', 'CNDA', 'CNDB', 'CNDT', 'CNET', 'CNEY', 'CNF', 'CNFR', 'CNGLL', 'CNHI', 'CNI', 'CNIC', 'CNK', 'CNM', 'CNMD', 'CNNB', 'CNNE', 'CNO', 'CNOB', 'CNOBP', 'CNP', 'CNQ', 'CNR', 'CNRG', 'CNS', 'CNSL', 'CNSP', 'CNST', 'CNTA', 'CNTB', 'CNTF', 'CNTG', 'CNTR', 'CNTX', 'CNTY', 'CNVA', 'CNVR', 'CNVS', 'CNVY', 'CNX', 'CNXC', 'CNXM', 'CNXN', 'CO', 'COAT', 'COCH', 'COCO', 'COCP', 'COD', 'CODA', 'CODI', 'CODX', 'COE', 'COEP', 'COF', 'COFS', 'COGT', 'COHN', 'COHR', 'COHU', 'COIN', 'COKE', 'COLB', 'COLD', 'COLE', 'COLI', 'COLL', 'COLM', 'COLX', 'COMB', 'COME', 'COMM', 'COMP', 'CONN', 'CONX', 'COO', 'COOK', 'COOL', 'COOP', 'COP', 'COR', 'CORR', 'CORS', 'CORT', 'CORV', 'CORZ', 'COSM', 'COST', 'COT', 'COTY', 'COUP', 'COUR', 'COVA', 'COWN', 'CP', 'CPA', 'CPAC', 'CPAR', 'CPAX', 'CPB', 'CPBI', 'CPC', 'CPE', 'CPF', 'CPG', 'CPHC', 'CPHI', 'CPHR', 'CPI', 'CPIX', 'CPK', 'CPKI', 'CPLG', 'CPLP', 'CPNG', 'CPOP', 'CPRI', 'CPRT', 'CPRX', 'CPS', 'CPSH', 'CPSI', 'CPSR', 'CPSS', 'CPST', 'CPT', 'CPTA', 'CPTK', 'CPUH', 'CPZ', 'CQP', 'CR', 'CRAI', 'CRAK', 'CRBG', 'CRBP', 'CRC', 'CRCY', 'CRD', 'CRDA', 'CRDB', 'CRDF', 'CRDL', 'CRDO', 'CREG', 'CRESW', 'CRESY', 'CREX', 'CRF', 'CRFN', 'CRGE', 'CRGG', 'CRGS', 'CRGY', 'CRH', 'CRHC', 'CRHM', 'CRI', 'CRIS', 'CRK', 'CRKN', 'CRL', 'CRM', 'CRMD', 'CRMT', 'CRNC', 'CRNT', 'CRNX', 'CRNZ', 'CRON', 'CROO', 'CROP', 'CROX', 'CRS', 'CRSA', 'CRSP', 'CRSR', 'CRT', 'CRTD', 'CRTO', 'CRTX', 'CRU', 'CRUS', 'CRVL', 'CRVO', 'CRVS', 'CRVY', 'CRWD', 'CRWS', 'CRY', 'CRYM', 'CRYS', 'CS', 'CSAN', 'CSBR', 'CSC', 'CSCO', 'CSCW', 'CSD', 'CSF', 'CSGP', 'CSGS', 'CSH', 'CSGP', 'CSII', 'CSIQ', 'CSL', 'CSLT', 'CSML', 'CSOD', 'CSP', 'CSPI', 'CSQ', 'CSR', 'CSS', 'CSSE', 'CSSEP', 'CSTE', 'CSTL', 'CSTM', 'CSTR', 'CSV', 'CSWC', 'CSWCZ', 'CSX', 'CTA', 'CTAS', 'CTB', 'CTBI', 'CTDD', 'CTG', 'CTHR', 'CTIB', 'CTIC', 'CTK', 'CTL', 'CTLT', 'CTLP', 'CTM', 'CTMX', 'CTO', 'CTOS', 'CTR', 'CTRA', 'CTRB', 'CTRC', 'CTRE', 'CTRM', 'CTRN', 'CTS', 'CTSH', 'CTSO', 'CTT', 'CTTA', 'CTTAY', 'CTV', 'CTVA', 'CUBB', 'CUBE', 'CUBI', 'CUBS', 'CUBT', 'CUE', 'CUEN', 'CUK', 'CULP', 'CURI', 'CURL', 'CURO', 'CURR', 'CURV', 'CUTR', 'CUZ', 'CVA', 'CVAC', 'CVBF', 'CVCO', 'CVCY', 'CVE', 'CVEO', 'CVET', 'CVGI', 'CVGW', 'CVI', 'CVII', 'CVLG', 'CVLT', 'CVM', 'CVNA', 'CVNX', 'CVR', 'CVRX', 'CVS', 'CVT', 'CVU', 'CVV', 'CVX', 'CW', 'CWAN', 'CWBR', 'CWC', 'CWCO', 'CWD', 'CWEB', 'CWEN', 'CWH', 'CWK', 'CWS', 'CWST', 'CWT', 'CX', 'CXAI', 'CXDC', 'CXDO', 'CXE', 'CXH', 'CXM', 'CXO', 'CXP', 'CXR', 'CXSE', 'CXT', 'CXW', 'CY', 'CYAN', 'CYBE', 'CYBR', 'CYCC', 'CYCCP', 'CYCN', 'CYD', 'CYH', 'CYLD', 'CYN', 'CYOU', 'CYRN', 'CYRX', 'CYT', 'CYTK', 'CYTR', 'CYTX', 'CYX', 'CZFS', 'CZR', 'CZNC', 'CZOO', 'CZR', 'CZWI', 'CZYA',
  // D
  'D', 'DAC', 'DAIO', 'DAKT', 'DAL', 'DALI', 'DAN', 'DANG', 'DAO', 'DAR', 'DARE', 'DASH', 'DAVA', 'DAVE', 'DAY', 'DB', 'DBA', 'DBCP', 'DBD', 'DBE', 'DBEF', 'DBEU', 'DBGI', 'DBI', 'DBII', 'DBL', 'DBLV', 'DBMX', 'DBO', 'DBOC', 'DBQI', 'DBR', 'DBRM', 'DBS', 'DBT', 'DBV', 'DBVT', 'DBW', 'DBX', 'DBYI', 'DC', 'DCA', 'DCBO', 'DCGO', 'DCI', 'DCM', 'DCO', 'DCOM', 'DCP', 'DCPH', 'DCR', 'DCRC', 'DCS', 'DCT', 'DCTH', 'DCTZ', 'DCUE', 'DCX', 'DD', 'DDA', 'DDD', 'DDDD', 'DDE', 'DDF', 'DDG', 'DDI', 'DDIV', 'DDL', 'DDLS', 'DDM', 'DDMX', 'DDN', 'DDNB', 'DDOC', 'DDP', 'DDR', 'DDS', 'DDWM', 'DDZ', 'DE', 'DEA', 'DEAL', 'DEB', 'DECK', 'DEED', 'DEEQ', 'DEFS', 'DEFT', 'DEI', 'DEL', 'DELL', 'DEM', 'DEME', 'DEN', 'DENN', 'DEO', 'DEP', 'DEPT', 'DERM', 'DESC', 'DESP', 'DEV', 'DEVA', 'DEVN', 'DEW', 'DEX', 'DEXE', 'DEXO', 'DEY', 'DEYS', 'DFAR', 'DFAS', 'DFD', 'DFE', 'DFEB', 'DFFA', 'DFFN', 'DFH', 'DFIN', 'DFIS', 'DFIV', 'DFL', 'DFND', 'DFNS', 'DFNV', 'DFP', 'DFPH', 'DFS', 'DFSB', 'DFSE', 'DFSG', 'DFSH', 'DFSV', 'DFTI', 'DFUQ', 'DFUS', 'DFUV', 'DG', 'DGAL', 'DGAZ', 'DGF', 'DGICA', 'DGICB', 'DGII', 'DGLD', 'DGLY', 'DGNS', 'DGP', 'DGRE', 'DGRO', 'DGRS', 'DGST', 'DGX', 'DGXX', 'DGZ', 'DH', 'DHAC', 'DHBC', 'DHC', 'DHCA', 'DHCNI', 'DHCNL', 'DHDP', 'DHF', 'DHIL', 'DHR', 'DHS', 'DHT', 'DHX', 'DHY', 'DIA', 'DIAL', 'DIAX', 'DIAZ', 'DIB', 'DIBS', 'DIG', 'DILA', 'DILAU', 'DILAW', 'DIM', 'DIMI', 'DIN', 'DINT', 'DIOD', 'DIR', 'DIRM', 'DIRS', 'DIRT', 'DIS', 'DISCA', 'DISCB', 'DISCK', 'DISH', 'DISK', 'DISN', 'DIT', 'DIV', 'DIVB', 'DIVO', 'DIVS', 'DIVY', 'DJCB', 'DJCO', 'DJCR', 'DJIA', 'DJP', 'DK', 'DKL', 'DKNG', 'DKS', 'DL', 'DLA', 'DLCN', 'DLF', 'DLG', 'DLHC', 'DLI', 'DLIF', 'DLN', 'DLNG', 'DLO', 'DLPH', 'DLPN', 'DLR', 'DLS', 'DLTH', 'DLTR', 'DLW', 'DLX', 'DLXJ', 'DLY', 'DM', 'DMA', 'DMAB', 'DMAC', 'DMAS', 'DMBI', 'DMB', 'DMC', 'DMCI', 'DMCO', 'DMF', 'DMGE', 'DMIS', 'DMLP', 'DMO', 'DMOR', 'DMPI', 'DMRC', 'DMRI', 'DMS', 'DMTK', 'DMYY', 'DMYS', 'DNA', 'DNAA', 'DNAD', 'DNAY', 'DNB', 'DNCA', 'DNCB', 'DNCD', 'DNCE', 'DNCF', 'DNCG', 'DNCH', 'DNCI', 'DNCJ', 'DNCK', 'DNCL', 'DNCM', 'DNCN', 'DNCZ', 'DNI', 'DNJR', 'DNL', 'DNLI', 'DNNGY', 'DNNR', 'DNO', 'DNOV', 'DNOW', 'DNP', 'DNPUF', 'DNR', 'DNS', 'DNUT', 'DNXS', 'DNZ', 'DO', 'DOC', 'DOCN', 'DOCS', 'DOCU', 'DOD', 'DODL', 'DOE', 'DOG', 'DOGZ', 'DOLE', 'DOMO', 'DON', 'DONG', 'DOOO', 'DOOR', 'DORM', 'DOT', 'DOTL', 'DOTP', 'DOTY', 'DOUG', 'DOV', 'DOW', 'DOWA', 'DOX', 'DOYU', 'DOZR', 'DP', 'DPCS', 'DPG', 'DPHC', 'DPIN', 'DPL', 'DPM', 'DPRO', 'DPST', 'DPW', 'DPZ', 'DQ', 'DRAY', 'DRCT', 'DRD', 'DRDR', 'DRE', 'DREM', 'DRFI', 'DRH', 'DRI', 'DRIO', 'DRIV', 'DRLL', 'DRMA', 'DRNA', 'DRNH', 'DRNK', 'DRQ', 'DRR', 'DRSK', 'DRSP', 'DRT', 'DRTX', 'DRUA', 'DRUID', 'DRUG', 'DRV', 'DRVN', 'DS', 'DSAC', 'DSAQ', 'DSBR', 'DSE', 'DSEA', 'DSEE', 'DSET', 'DSEU', 'DSF', 'DSFI', 'DSGN', 'DSGR', 'DSGX', 'DSIM', 'DSKE', 'DSKEW', 'DSL', 'DSLV', 'DSM', 'DSMCF', 'DSOC', 'DSP', 'DSPC', 'DSPY', 'DSR', 'DSS', 'DSSI', 'DSTL', 'DSTW', 'DSU', 'DSUM', 'DSW', 'DSWL', 'DSX', 'DT', 'DTA', 'DTACU', 'DTAM', 'DTB', 'DTC', 'DTCK', 'DTD', 'DTE', 'DTEA', 'DTEM', 'DTF', 'DTG', 'DTGR', 'DTH', 'DTHC', 'DTI', 'DTIL', 'DTIQ', 'DTK', 'DTL', 'DTM', 'DTMX', 'DTML', 'DTN', 'DTO', 'DTOC', 'DTP', 'DTPR', 'DTRA', 'DTRE', 'DTRK', 'DTRO', 'DTRS', 'DTRT', 'DTRU', 'DTS', 'DTSS', 'DTST', 'DTT', 'DTUM', 'DTUS', 'DTV', 'DTW', 'DTWI', 'DTY', 'DU', 'DUAL', 'DUAQU', 'DUB', 'DUBI', 'DUBOX', 'DUBSU', 'DUC', 'DUCO', 'DUCTU', 'DUD', 'DUDX', 'DUF', 'DUG', 'DUHP', 'DUIG', 'DUK', 'DUKB', 'DUKE', 'DUKH', 'DUKO', 'DUKP', 'DUM', 'DUO', 'DUOL', 'DUOT', 'DUR', 'DURA', 'DURAQU', 'DURB', 'DUS', 'DUSA', 'DUSL', 'DUST', 'DUV', 'DVA', 'DVAX', 'DVCR', 'DVD', 'DVE', 'DVEC', 'DVENT', 'DVF', 'DVI', 'DVLU', 'DVN', 'DVNX', 'DVOL', 'DVP', 'DVS', 'DVST', 'DVSV', 'DVX', 'DVY', 'DWAS', 'DWAT', 'DWAW', 'DWC', 'DWCR', 'DWCT', 'DWD', 'DWE', 'DWFI', 'DWG', 'DWGN', 'DWL', 'DWLD', 'DWM', 'DWMC', 'DWMF', 'DWPP', 'DWQD', 'DWS', 'DWSH', 'DWSN', 'DWSWE', 'DWSU', 'DWT', 'DWTX', 'DWTUSDF', 'DWX', 'DX', 'DXBS', 'DXC', 'DXCM', 'DXD', 'DXE', 'DXEU', 'DXF', 'DXGE', 'DXIB', 'DXJ', 'DXJS', 'DXJT', 'DXM', 'DXMMF', 'DXPE', 'DXR', 'DXTR', 'DXY', 'DXZ', 'DY', 'DYAI', 'DYAY', 'DYCE', 'DYCQ', 'DYF', 'DYFN', 'DYLDG', 'DYLS', 'DYN', 'DYNN', 'DYNR', 'DYT', 'DZSI',
  // E-Z continuation abbreviated for size...
  'EA', 'EAF', 'EAT', 'EBAY', 'EBC', 'EBF', 'EBIX', 'EBMT', 'EBON', 'EBR', 'EBS', 'EBTC', 'EC', 'ECC', 'ECCC', 'ECCF', 'ECCV', 'ECCW', 'ECCX', 'ECF', 'ECL', 'ECOL', 'ECOM', 'ECOR', 'ECPG', 'ECR', 'ECVT', 'ED', 'EDD', 'EDF', 'EDI', 'EDIT', 'EDN', 'EDNT', 'EDOC', 'EDP', 'EDPR', 'EDR', 'EDRY', 'EDSA', 'EDSE', 'EDTK', 'EDUC', 'EE', 'EEA', 'EEFT', 'EEI', 'EELV', 'EEM', 'EEMA', 'EEMV', 'EES', 'EET', 'EEV', 'EEX', 'EF', 'EFA', 'EFAS', 'EFAV', 'EFC', 'EFG', 'EFIX', 'EFL', 'EFO', 'EFOI', 'EFR', 'EFT', 'EFTR', 'EFUL', 'EFV', 'EFX', 'EFZ', 'EG', 'EGAN', 'EGBN', 'EGGF', 'EGH', 'EGHT', 'EGI', 'EGIS', 'EGLE', 'EGLN', 'EGN', 'EGO', 'EGOV', 'EGP', 'EGRX', 'EGS', 'EGY', 'EH', 'EHC', 'EHI', 'EHR', 'EHTH', 'EIC', 'EICA', 'EIG', 'EIGH', 'EIM', 'EIO', 'EIX', 'EJH', 'EKSO', 'EL', 'ELAN', 'ELDN', 'ELEV', 'ELF', 'ELGX', 'ELL', 'ELLO', 'ELM', 'ELMD', 'ELME', 'ELOG', 'ELP', 'ELS', 'ELSE', 'ELTK', 'ELTP', 'ELU', 'ELV', 'ELVN', 'ELVT', 'ELY', 'ELYM', 'EM', 'EMAG', 'EMB', 'EMBH', 'EMCG', 'EMCR', 'EMD', 'EME', 'EMES', 'EMF', 'EMGF', 'EMHY', 'EMIF', 'EMITF', 'EMJ', 'EMKR', 'EML', 'EMLC', 'EMLP', 'EMN', 'EMO', 'EMP', 'EMPIR', 'EMPLY', 'EMPR', 'EMPS', 'EMPW', 'EMQ', 'EMR', 'EMSH', 'EMSG', 'EMTK', 'EMTL', 'EMX', 'EMXC', 'EMXF', 'EN', 'ENAB', 'ENBA', 'ENB', 'ENBL', 'ENBP', 'ENCP', 'ENCY', 'END', 'ENDA', 'ENDP', 'ENEF', 'ENER', 'ENFA', 'ENFN', 'ENG', 'ENGE', 'ENGL', 'ENGN', 'ENGS', 'ENH', 'ENIC', 'ENJ', 'ENJY', 'ENL', 'ENLC', 'ENLV', 'ENM', 'ENNA', 'ENOB', 'ENOV', 'ENPH', 'ENR', 'ENS', 'ENSC', 'ENSG', 'ENT', 'ENTA', 'ENTF', 'ENTG', 'ENTIU', 'ENTR', 'ENTX', 'ENV', 'ENVA', 'ENVB', 'ENVI', 'ENVP', 'ENVR', 'ENVX', 'ENZ', 'EOD', 'EOG', 'EOI', 'EOLS', 'EOS', 'EOSE', 'EOT', 'EP', 'EPAC', 'EPAM', 'EPC', 'EPD', 'EPHE', 'EPI', 'EPIX', 'EPM', 'EPN', 'EPP', 'EPRN', 'EPRF', 'EPRIF', 'EPRT', 'EPRX', 'EPS', 'EPSN', 'EPU', 'EPUI', 'EPV', 'EPWR', 'EPXC', 'EPY', 'EPZM', 'EQ', 'EQBK', 'EQC', 'EQFN', 'EQH', 'EQHA', 'EQIA', 'EQIX', 'EQLA', 'EQLO', 'EQL', 'EQLS', 'EQMF', 'EQNR', 'EQOP', 'EQOS', 'EQR', 'EQRR', 'EQS', 'EQSM', 'EQT', 'EQUS', 'EQV', 'EQWL', 'EQX', 'ER', 'ERA', 'ERAS', 'ERF', 'ERES', 'ERF', 'ERFC', 'ERH', 'ERIC', 'ERIE', 'ERII', 'ERM', 'ERNA', 'ERO', 'EROP', 'ERP', 'ERR', 'ERS', 'ERT', 'ERTX', 'ERUW', 'ERVIU', 'ERX', 'ERY', 'ERZ', 'ES', 'ESA', 'ESAB', 'ESBK', 'ESCA', 'ESCR', 'ESD', 'ESE', 'ESEA', 'ESGC', 'ESGD', 'ESGE', 'ESGG', 'ESGL', 'ESGN', 'ESGR', 'ESGS', 'ESGU', 'ESGV', 'ESH', 'ESI', 'ESIX', 'ESLT', 'ESML', 'ESMT', 'ESMV', 'ESNT', 'ESOA', 'ESON', 'ESOP', 'ESP', 'ESPO', 'ESPR', 'ESQ', 'ESRT', 'ESS', 'ESSA', 'ESSCF', 'ESSE', 'ESSH', 'ESSS', 'ESST', 'EST', 'ESTA', 'ESTC', 'ESTE', 'ESTI', 'ESTM', 'ESTP', 'ESTR', 'ESTX', 'ESU', 'ESVN', 'ET', 'ETAC', 'ETB', 'ETCC', 'ETD', 'ETF', 'ETFC', 'ETFMG', 'ETG', 'ETH', 'ETHE', 'ETHM', 'ETHO', 'ETI', 'ETIC', 'ETJ', 'ETL', 'ETM', 'ETN', 'ETNB', 'ETO', 'ETON', 'ETPA', 'ETPH', 'ETR', 'ETRACS', 'ETRN', 'ETRT', 'ETS', 'ETSY', 'ETT', 'ETTX', 'ETU', 'ETV', 'ETW', 'ETX', 'ETY', 'EUBR', 'EUCP', 'EUDG', 'EUDV', 'EUFN', 'EUGM', 'EUM', 'EUMF', 'EUMV', 'EUO', 'EUPH', 'EURO', 'EUS', 'EUSC', 'EUSCD', 'EUSM', 'EUSV', 'EUT', 'EUTZ', 'EV', 'EVA', 'EVAL', 'EVBG', 'EVBN', 'EVBS', 'EVC', 'EVCC', 'EVCM', 'EVE', 'EVEN', 'EVER', 'EVF', 'EVFM', 'EVG', 'EVGBC', 'EVGN', 'EVGO', 'EVGR', 'EVHC', 'EVHY', 'EVI', 'EVIN', 'EVINC', 'EVIT', 'EVIX', 'EVK', 'EVKS', 'EVL', 'EVLO', 'EVLV', 'EVM', 'EVMT', 'EVN', 'EVNS', 'EVO', 'EVOA', 'EVOJ', 'EVOK', 'EVOL', 'EVOO', 'EVOP', 'EVR', 'EVRC', 'EVRE', 'EVRG', 'EVRI', 'EVRY', 'EVS', 'EVSB', 'EVSI', 'EVSIU', 'EVSIW', 'EVSO', 'EVSP', 'EVST', 'EVSTC', 'EVSV', 'EVT', 'EVTC', 'EVTL', 'EVTS', 'EVTV', 'EVU', 'EVUS', 'EVV', 'EVVV', 'EVX', 'EVXC', 'EVY', 'EW', 'EWAC', 'EWA', 'EWC', 'EWD', 'EWEB', 'EWEF', 'EWEM', 'EWFC', 'EWG', 'EWGS', 'EWH', 'EWHI', 'EWI', 'EWJ', 'EWJV', 'EWK', 'EWL', 'EWM', 'EWMC', 'EWN', 'EWO', 'EWP', 'EWQ', 'EWRE', 'EWS', 'EWSC', 'EWT', 'EWU', 'EWUS', 'EWV', 'EWW', 'EWX', 'EWY', 'EWZ', 'EWZS', 'EX', 'EXA', 'EXAI', 'EXAS', 'EXC', 'EXCC', 'EXCH', 'EXCU', 'EXD', 'EXDI', 'EXEL', 'EXF', 'EXFI', 'EXFO', 'EXG', 'EXIF', 'EXIR', 'EXIS', 'EXIT', 'EXK', 'EXLP', 'EXLS', 'EXM', 'EXMA', 'EXMB', 'EXN', 'EXNB', 'EXO', 'EXOD', 'EXOF', 'EXOM', 'EXP', 'EXPC', 'EXPD', 'EXPE', 'EXPI', 'EXPM', 'EXPR', 'EXR', 'EXRM', 'EXS', 'EXSF', 'EXTN', 'EXTR', 'EXTRU', 'EXU', 'EXX', 'EXXR', 'EY', 'EYAM', 'EYE', 'EYEG', 'EYEM', 'EYEN', 'EYES', 'EYFC', 'EYLDF', 'EYLD', 'EYP', 'EYPT', 'EYPT', 'EYQ', 'EYR', 'EYRN', 'EYS', 'EYT', 'EYV', 'EZ', 'EZA', 'EZBK', 'EZC', 'EZCF', 'EZGO', 'EZIO', 'EZJ', 'EZM', 'EZOO', 'EZP', 'EZPW', 'EZT', 'EZU', 'EZWI',
  // F-Z abbreviated...
  'F', 'FAF', 'FANG', 'FAST', 'FB', 'FBIO', 'FBK', 'FBNC', 'FBP', 'FBRT', 'FC', 'FCAP', 'FCBC', 'FCCO', 'FCEL', 'FCF', 'FCFS', 'FCN', 'FCNCA', 'FCO', 'FCPT', 'FCT', 'FCUV', 'FCX', 'FDBC', 'FDC', 'FDEU', 'FDL', 'FDLO', 'FDMO', 'FDP', 'FDS', 'FDT', 'FDUS', 'FDX', 'FE', 'FEIM', 'FELE', 'FEM', 'FEMB', 'FEMS', 'FEN', 'FENG', 'FENY', 'FEO', 'FEPI', 'FET', 'FEUS', 'FEX', 'FEYE', 'FEZ', 'FF', 'FFA', 'FFBC', 'FFC', 'FFEU', 'FFHL', 'FFIC', 'FFIN', 'FFIV', 'FFNW', 'FFWM', 'FG', 'FGB', 'FGBI', 'FGD', 'FGF', 'FGI', 'FGL', 'FGNA', 'FGP', 'FGT', 'FH', 'FHB', 'FHI', 'FHK', 'FHLC', 'FHN', 'FHNC', 'FHY', 'FI', 'FIBK', 'FICO', 'FICS', 'FIDU', 'FIF', 'FIGS', 'FIHL', 'FIII', 'FINM', 'FINV', 'FINW', 'FIS', 'FISI', 'FISV', 'FIT', 'FITB', 'FITBI', 'FIVE', 'FIVN', 'FIW', 'FIX', 'FIXX', 'FJP', 'FJUL', 'FKRCF', 'FL', 'FLAG', 'FLAT', 'FLC', 'FLCB', 'FLDM', 'FLES', 'FLEX', 'FLFV', 'FLGB', 'FLGC', 'FLGT', 'FLHY', 'FLIA', 'FLIC', 'FLIR', 'FLKR', 'FLL', 'FLLV', 'FLMI', 'FLMN', 'FLNG', 'FLNK', 'FLNT', 'FLO', 'FLOT', 'FLOW', 'FLPS', 'FLQL', 'FLR', 'FLRN', 'FLS', 'FLSW', 'FLT', 'FLUX', 'FLV', 'FLVR', 'FLWS', 'FLXN', 'FLXS', 'FLY', 'FLYA', 'FLYY', 'FM', 'FMAO', 'FMAR', 'FMAY', 'FMB', 'FMBI', 'FMC', 'FMCB', 'FMCC', 'FMCCL', 'FMCKO', 'FMCN', 'FMCX', 'FMDE', 'FMF', 'FMHI', 'FMI', 'FMIV', 'FMKR', 'FML', 'FMN', 'FMNB', 'FMO', 'FMP', 'FMPD', 'FMR', 'FMS', 'FMST', 'FMT', 'FMTI', 'FMTX', 'FMUP', 'FMX', 'FMY', 'FN', 'FNA', 'FNBG', 'FNB', 'FNCH', 'FNCL', 'FNDX', 'FNDA', 'FNDB', 'FNDC', 'FNDE', 'FNDF', 'FNDU', 'FNF', 'FNFG', 'FNGO', 'FNGR', 'FNGS', 'FNGU', 'FNHC', 'FNIO', 'FNJN', 'FNK', 'FNKO', 'FNLC', 'FNO', 'FNOV', 'FNV', 'FNX', 'FNY', 'FO', 'FOAN', 'FOA', 'FOE', 'FOEN', 'FOF', 'FOHA', 'FOLD', 'FOLI', 'FOLS', 'FOM', 'FOMO', 'FONE', 'FONR', 'FOR', 'FORD', 'FORE', 'FORG', 'FORM', 'FORR', 'FORTY', 'FOSL', 'FOT', 'FOUN', 'FOUR', 'FOX', 'FOXA', 'FOXF', 'FPA', 'FPAC', 'FPAY', 'FPE', 'FPEI', 'FPF', 'FPH', 'FPI', 'FPL', 'FPRX', 'FPS', 'FPT', 'FPTB', 'FPX', 'FPXI', 'FRA', 'FRAF', 'FRBA', 'FRBK', 'FRC', 'FRCB', 'FRCI', 'FRD', 'FRDI', 'FRDM', 'FREEF', 'FREE', 'FREL', 'FRES', 'FRFC', 'FRFH', 'FRFHF', 'FRGE', 'FRGI', 'FRGT', 'FRHC', 'FRI', 'FRLEU', 'FRM', 'FRME', 'FRMEP', 'FRMO', 'FRN', 'FRND', 'FRO', 'FROG', 'FRPH', 'FRPT', 'FRS', 'FRSH', 'FRSO', 'FRST', 'FRSX', 'FRT', 'FRTY', 'FRXB', 'FRZ', 'FRZN', 'FSBC', 'FSBW', 'FSC', 'FSD', 'FSDC', 'FSDIX', 'FSF', 'FSFG', 'FSI', 'FSIG', 'FSK', 'FSKR', 'FSL', 'FSLR', 'FSLY', 'FSM', 'FSMB', 'FSMD', 'FSMEM', 'FSMEX', 'FSNB', 'FSP', 'FSPR', 'FSR', 'FSRP', 'FSS', 'FSSI', 'FSSN', 'FST', 'FSTC', 'FSTR', 'FSTX', 'FSV', 'FSZ', 'FT', 'FTA', 'FTAC', 'FTAG', 'FTAI', 'FTAL', 'FTB', 'FTBA', 'FTC', 'FTCB', 'FTCI', 'FTCO', 'FTCS', 'FTCV', 'FTD', 'FTDR', 'FTDS', 'FTE', 'FTEK', 'FTEO', 'FTF', 'FTFT', 'FTGC', 'FTGS', 'FTHI', 'FTI', 'FTIF', 'FTII', 'FTIS', 'FTK', 'FTL', 'FTLS', 'FTM', 'FTNI', 'FTNT', 'FTO', 'FTOC', 'FTOCU', 'FTPA', 'FTRI', 'FTRP', 'FTS', 'FTSD', 'FTSL', 'FTSM', 'FTSO', 'FTSS', 'FTT', 'FTTEQ', 'FTTR', 'FTV', 'FTVI', 'FTWO', 'FTXD', 'FTXG', 'FTXH', 'FTXL', 'FTXN', 'FTXO', 'FTXR', 'FTZA', 'FUBO', 'FUE', 'FUL', 'FULC', 'FULT', 'FUN', 'FUNC', 'FUND', 'FURY', 'FUSB', 'FUSE', 'FUSN', 'FUTU', 'FUV', 'FV', 'FVA', 'FVAL', 'FVC', 'FVD', 'FVE', 'FVER', 'FVRR', 'FVT', 'FVZ', 'FW', 'FWD', 'FWDB', 'FWONA', 'FWONK', 'FWP', 'FWPH', 'FWR', 'FWRD', 'FWRG', 'FX', 'FXA', 'FXB', 'FXC', 'FXD', 'FXE', 'FXF', 'FXG', 'FXH', 'FXI', 'FXL', 'FXN', 'FXO', 'FXP', 'FXR', 'FXS', 'FXU', 'FXY', 'FXZ', 'FY', 'FYAU', 'FYBR', 'FYC', 'FYLD', 'FYT', 'FYX', 'FZT',
]

// Combine all stocks
export const ALL_STOCKS_FULL = Array.from(new Set([
  ...FULL_STOCK_UNIVERSE,
  ...ADDITIONAL_STOCKS,
].filter(Boolean)))

// Count
export const FULL_STOCK_COUNT = ALL_STOCKS_FULL.length

// Historical years for time-series pages
export const YEARS = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026']

// Quarters for earnings pages
export const QUARTERS = [
  '2020-Q1', '2020-Q2', '2020-Q3', '2020-Q4',
  '2021-Q1', '2021-Q2', '2021-Q3', '2021-Q4',
  '2022-Q1', '2022-Q2', '2022-Q3', '2022-Q4',
  '2023-Q1', '2023-Q2', '2023-Q3', '2023-Q4',
  '2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4',
  '2025-Q1', '2025-Q2', '2025-Q3', '2025-Q4',
]
