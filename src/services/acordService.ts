// =============================================================================
// ACORD XML Service - Import/Export for TXLife 2.20.01
// =============================================================================

import { XMLParser, XMLBuilder, XmlBuilderOptions } from 'fast-xml-parser';
import { prisma } from '../utils/prisma';
import { Prisma } from '@prisma/client';
import {
  TXLife,
  OLifE,
  OLifEParty,
  OLifEHolding,
  OLifERelation,
  OLifECoverage,
  OLifEPerson,
  OLifEOrganization,
  OLifEAddress,
  OLifEPhone,
  OLifEEMailAddress,
  OLifEPolicy,
  OLifELife,
  OLifEAnnuity,
  OLifEClient,
  OLifEApplicationInfo,
  ImportResult,
  ImportError,
  ImportWarning,
  ExportOptions,
  ExportResult,
  ACORD_TYPE_CODES,
} from '../types/acord.types';
import * as mappings from '../utils/acordMappings';

// =============================================================================
// XML Parser/Builder Configuration
// =============================================================================

const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  allowBooleanAttributes: true,
  parseTagValue: true,
  parseAttributeValue: true,
  trimValues: true,
  isArray: (name: string) => {
    const arrayElements = [
      'TXLifeRequest', 'TXLifeResponse', 'Holding', 'Party', 'Relation',
      'Address', 'Phone', 'EMailAddress', 'Employment', 'Coverage',
      'LifeParticipant', 'CovOption', 'Payout', 'Loan', 'Arrangement',
      'RequirementInfo', 'ResultInfo', 'OLifEExtension', 'FormInstance',
      'QuestionAnswer', 'Activity', 'CarrierAppointment'
    ];
    return arrayElements.includes(name);
  },
};

const builderOptions: XmlBuilderOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  format: true,
  indentBy: '  ',
  suppressBooleanAttributes: false,
};

const parser = new XMLParser(parserOptions);
const builder = new XMLBuilder(builderOptions);

// =============================================================================
// Main Import Function
// =============================================================================

export async function importAcordXml(
  xmlContent: string,
  options?: { 
    updateExisting?: boolean;
    validateOnly?: boolean;
    userId?: string;
  }
): Promise<ImportResult> {
  const errors: ImportError[] = [];
  const warnings: ImportWarning[] = [];
  const partyIdMap: Record<string, string> = {};
  const holdingIdMap: Record<string, string> = {};
  const coverageIdMap: Record<string, string> = {};
  
  let partiesCreated = 0;
  let partiesUpdated = 0;
  let holdingsCreated = 0;
  let holdingsUpdated = 0;
  let relationsCreated = 0;
  let coveragesCreated = 0;

  try {
    // Parse XML
    const parsed = parser.parse(xmlContent);
    
    if (!parsed.TXLife) {
      return {
        success: false,
        summary: {
          partiesCreated: 0, partiesUpdated: 0,
          holdingsCreated: 0, holdingsUpdated: 0,
          relationsCreated: 0, coveragesCreated: 0,
          errors: [{ path: 'root', message: 'Invalid ACORD XML: Missing TXLife root element' }],
          warnings: [],
        },
      };
    }

    const txLife: TXLife = parsed.TXLife;
    const olife = extractOLifE(txLife);
    
    if (!olife) {
      return {
        success: false,
        summary: {
          partiesCreated: 0, partiesUpdated: 0,
          holdingsCreated: 0, holdingsUpdated: 0,
          relationsCreated: 0, coveragesCreated: 0,
          errors: [{ path: 'TXLife', message: 'No OLifE container found' }],
          warnings: [],
        },
      };
    }

    // Validate only mode
    if (options?.validateOnly) {
      return {
        success: true,
        summary: {
          partiesCreated: olife.Party?.length || 0,
          partiesUpdated: 0,
          holdingsCreated: olife.Holding?.length || 0,
          holdingsUpdated: 0,
          relationsCreated: olife.Relation?.length || 0,
          coveragesCreated: 0,
          errors, warnings,
        },
      };
    }

    // Process in transaction
    await prisma.$transaction(async (tx) => {
      // 1. Import Parties
      if (olife.Party?.length) {
        for (const xmlParty of olife.Party) {
          try {
            const result = await importParty(tx, xmlParty, options?.updateExisting);
            if (xmlParty.id) partyIdMap[xmlParty.id] = result.id;
            result.created ? partiesCreated++ : partiesUpdated++;
          } catch (error) {
            errors.push({
              path: `Party[${xmlParty.id || 'unknown'}]`,
              message: error instanceof Error ? error.message : 'Unknown error',
              xmlId: xmlParty.id,
            });
          }
        }
      }

      // 2. Import Holdings
      if (olife.Holding?.length) {
        for (const xmlHolding of olife.Holding) {
          try {
            const result = await importHolding(tx, xmlHolding, partyIdMap, options?.updateExisting);
            if (xmlHolding.id) holdingIdMap[xmlHolding.id] = result.id;
            result.created ? holdingsCreated++ : holdingsUpdated++;
            if (result.coveragesCreated) {
              coveragesCreated += result.coveragesCreated;
              Object.assign(coverageIdMap, result.coverageIdMap || {});
            }
          } catch (error) {
            errors.push({
              path: `Holding[${xmlHolding.id || 'unknown'}]`,
              message: error instanceof Error ? error.message : 'Unknown error',
              xmlId: xmlHolding.id,
            });
          }
        }
      }

      // 3. Import Relations
      if (olife.Relation?.length) {
        for (const xmlRelation of olife.Relation) {
          try {
            await importRelation(tx, xmlRelation, partyIdMap, holdingIdMap);
            relationsCreated++;
          } catch (error) {
            errors.push({
              path: `Relation[${xmlRelation.id || 'unknown'}]`,
              message: error instanceof Error ? error.message : 'Unknown error',
              xmlId: xmlRelation.id,
            });
          }
        }
      }
    });

    return {
      success: errors.length === 0,
      transactionId: extractTransactionId(txLife),
      summary: {
        partiesCreated, partiesUpdated,
        holdingsCreated, holdingsUpdated,
        relationsCreated, coveragesCreated,
        errors, warnings,
      },
      mappings: { partyIdMap, holdingIdMap, coverageIdMap },
    };

  } catch (error) {
    return {
      success: false,
      summary: {
        partiesCreated: 0, partiesUpdated: 0,
        holdingsCreated: 0, holdingsUpdated: 0,
        relationsCreated: 0, coveragesCreated: 0,
        errors: [{ path: 'root', message: error instanceof Error ? error.message : 'Parse error' }],
        warnings: [],
      },
    };
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

function extractOLifE(txLife: TXLife): OLifE | null {
  if (txLife.TXLifeRequest?.length) {
    for (const req of txLife.TXLifeRequest) {
      if (req.OLifE) return req.OLifE;
    }
  }
  if (txLife.TXLifeResponse?.length) {
    for (const res of txLife.TXLifeResponse) {
      if (res.OLifE) return res.OLifE;
    }
  }
  return null;
}

function extractTransactionId(txLife: TXLife): string | undefined {
  return txLife.TXLifeRequest?.[0]?.TransRefGUID || txLife.TXLifeResponse?.[0]?.TransRefGUID;
}

// =============================================================================
// Party Import
// =============================================================================

async function importParty(
  tx: Prisma.TransactionClient,
  xmlParty: OLifEParty,
  updateExisting?: boolean
): Promise<{ id: string; created: boolean }> {
  
  const partyData: Prisma.PartyCreateInput = {
    partyTypeCode: mappings.mapPartyTypeCode(xmlParty.PartyTypeCode),
    partyKey: xmlParty.PartyKey,
    fullName: xmlParty.FullName,
    govtId: xmlParty.GovtID,
    govtIdType: mappings.mapGovtIdType(xmlParty.GovtIDTC),
    residenceState: xmlParty.ResidenceState,
    residenceCountry: xmlParty.ResidenceCountry || 'US',
    residenceZip: xmlParty.ResidenceZip,
    estNetWorth: xmlParty.EstNetWorth?.value,
  };

  // Check for existing
  let existingParty = null;
  if (xmlParty.PartyKey) {
    existingParty = await tx.party.findFirst({ where: { partyKey: xmlParty.PartyKey } });
  }
  if (!existingParty && xmlParty.GovtID) {
    existingParty = await tx.party.findFirst({ where: { govtId: xmlParty.GovtID } });
  }

  let partyId: string;
  let created: boolean;

  if (existingParty && updateExisting) {
    await tx.party.update({ where: { id: existingParty.id }, data: partyData });
    partyId = existingParty.id;
    created = false;
  } else if (existingParty) {
    partyId = existingParty.id;
    created = false;
  } else {
    const newParty = await tx.party.create({ data: partyData });
    partyId = newParty.id;
    created = true;
  }

  // Import Person/Organization
  if (xmlParty.Person) await importPerson(tx, partyId, xmlParty.Person, !created);
  if (xmlParty.Organization) await importOrganization(tx, partyId, xmlParty.Organization, !created);

  // Import contacts
  if (xmlParty.Address?.length) {
    for (const addr of xmlParty.Address) await importAddress(tx, partyId, addr);
  }
  if (xmlParty.Phone?.length) {
    for (const phone of xmlParty.Phone) await importPhone(tx, partyId, phone);
  }
  if (xmlParty.EMailAddress?.length) {
    for (const email of xmlParty.EMailAddress) await importEmail(tx, partyId, email);
  }

  // Import Client
  if (xmlParty.Client) await importClient(tx, partyId, xmlParty.Client);

  return { id: partyId, created };
}

async function importPerson(tx: Prisma.TransactionClient, partyId: string, xmlPerson: OLifEPerson, exists: boolean) {
  const personData = {
    firstName: xmlPerson.FirstName || '',
    lastName: xmlPerson.LastName || '',
    middleName: xmlPerson.MiddleName,
    prefix: xmlPerson.Prefix,
    suffix: xmlPerson.Suffix,
    nickName: xmlPerson.NickName,
    title: xmlPerson.Title,
    gender: mappings.mapGenderCode(xmlPerson.Gender),
    birthDate: xmlPerson.BirthDate ? new Date(xmlPerson.BirthDate) : undefined,
    age: xmlPerson.Age,
    maritalStatus: mappings.mapMaritalStatus(xmlPerson.MarStat),
    citizenship: xmlPerson.Citizenship || 'US',
    birthCountry: xmlPerson.BirthCountry,
    birthJurisdiction: xmlPerson.BirthJurisdiction,
    occupation: xmlPerson.Occupation,
    estimatedSalary: xmlPerson.EstSalary?.value,
    driversLicenseNum: xmlPerson.DriversLicenseNum,
    driversLicenseState: xmlPerson.DriversLicenseState,
    deathDate: xmlPerson.DeathDate ? new Date(xmlPerson.DeathDate) : undefined,
  };

  if (exists) {
    const existing = await tx.person.findUnique({ where: { partyId } });
    if (existing) {
      await tx.person.update({ where: { partyId }, data: personData });
    } else {
      await tx.person.create({ data: { party: { connect: { id: partyId } }, ...personData } });
    }
  } else {
    await tx.person.create({ data: { party: { connect: { id: partyId } }, ...personData } });
  }
}

async function importOrganization(tx: Prisma.TransactionClient, partyId: string, xmlOrg: OLifEOrganization, exists: boolean) {
  const orgData = {
    orgForm: mappings.mapOrgForm(xmlOrg.OrgForm),
    dba: xmlOrg.DBA,
    abbrName: xmlOrg.AbbrName,
    trustType: mappings.mapTrustType(xmlOrg.TrustTypeCode),
    irrevocableInd: xmlOrg.IrrevocableInd,
    establishedDate: xmlOrg.EstabDate ? new Date(xmlOrg.EstabDate) : undefined,
    natureCategory: xmlOrg.NatureCategory,
    sicCode: xmlOrg.SICCode,
    naicsCode: xmlOrg.NAICSCode,
    dunsNumber: xmlOrg.DUNSNumber,
    numEmployees: xmlOrg.NumEmployees,
  };

  if (exists) {
    const existing = await tx.organization.findUnique({ where: { partyId } });
    if (existing) {
      await tx.organization.update({ where: { partyId }, data: orgData });
    } else {
      await tx.organization.create({ data: { party: { connect: { id: partyId } }, ...orgData } });
    }
  } else {
    await tx.organization.create({ data: { party: { connect: { id: partyId } }, ...orgData } });
  }
}

async function importAddress(tx: Prisma.TransactionClient, partyId: string, xmlAddr: OLifEAddress) {
  await tx.address.create({
    data: {
      partyId,
      addressTypeCode: mappings.mapAddressTypeCode(xmlAddr.AddressTypeCode),
      attentionLine: xmlAddr.AttentionLine,
      line1: xmlAddr.Line1,
      line2: xmlAddr.Line2,
      line3: xmlAddr.Line3,
      city: xmlAddr.City,
      state: xmlAddr.AddressState || mappings.getTypeCodeValue(xmlAddr.AddressStateTC),
      zip: xmlAddr.Zip,
      country: xmlAddr.AddressCountry || mappings.getTypeCodeValue(xmlAddr.AddressCountryTC) || 'US',
      startDate: xmlAddr.StartDate ? new Date(xmlAddr.StartDate) : undefined,
      endDate: xmlAddr.EndDate ? new Date(xmlAddr.EndDate) : undefined,
    },
  });
}

async function importPhone(tx: Prisma.TransactionClient, partyId: string, xmlPhone: OLifEPhone) {
  await tx.phone.create({
    data: {
      partyId,
      phoneTypeCode: mappings.mapPhoneTypeCode(xmlPhone.PhoneTypeCode),
      countryCode: xmlPhone.CountryCode || '1',
      areaCode: xmlPhone.AreaCode,
      dialNumber: xmlPhone.DialNumber || '',
      extension: xmlPhone.Ext,
      bestTimeToCallFrom: xmlPhone.BestTimeToCallFrom,
      bestTimeToCallTo: xmlPhone.BestTimeToCallTo,
    },
  });
}

async function importEmail(tx: Prisma.TransactionClient, partyId: string, xmlEmail: OLifEEMailAddress) {
  if (!xmlEmail.AddrLine) return;
  await tx.eMailAddress.create({
    data: {
      partyId,
      emailTypeCode: mappings.mapEmailTypeCode(xmlEmail.EMailType),
      addrLine: xmlEmail.AddrLine,
    },
  });
}

async function importClient(tx: Prisma.TransactionClient, partyId: string, xmlClient: OLifEClient) {
  const existing = await tx.client.findUnique({ where: { partyId } });
  const clientData = {
    leadSource: mappings.mapLeadSource(xmlClient.LeadSource),
    leadStatus: mappings.mapLeadStatus(xmlClient.LeadStatus),
    leadDate: xmlClient.LeadDate ? new Date(xmlClient.LeadDate) : undefined,
    assignedAgentId: xmlClient.AssignedAgentID,
  };

  if (existing) {
    await tx.client.update({ where: { partyId }, data: clientData });
  } else {
    await tx.client.create({ data: { partyId, ...clientData } });
  }
}

// =============================================================================
// Holding Import
// =============================================================================

async function importHolding(
  tx: Prisma.TransactionClient,
  xmlHolding: OLifEHolding,
  partyIdMap: Record<string, string>,
  updateExisting?: boolean
): Promise<{ id: string; created: boolean; coveragesCreated?: number; coverageIdMap?: Record<string, string> }> {
  
  const holdingData: Prisma.HoldingCreateInput = {
    holdingTypeCode: mappings.mapHoldingTypeCode(xmlHolding.HoldingTypeCode),
    holdingStatus: mappings.mapHoldingStatus(xmlHolding.HoldingStatus),
    holdingKey: xmlHolding.HoldingKey,
    holdingName: xmlHolding.HoldingName,
    currencyTypeCode: xmlHolding.CurrencyTypeCode?.tc || 'USD',
    assetValue: xmlHolding.AssetValue?.value,
    asOfDate: xmlHolding.AsOfDate ? new Date(xmlHolding.AsOfDate) : undefined,
  };

  let existingHolding = null;
  if (xmlHolding.HoldingKey) {
    existingHolding = await tx.holding.findFirst({ where: { holdingKey: xmlHolding.HoldingKey } });
  }
  if (!existingHolding && xmlHolding.Policy?.PolNumber) {
    const existingPolicy = await tx.policy.findFirst({
      where: { polNumber: xmlHolding.Policy.PolNumber },
      include: { holding: true },
    });
    if (existingPolicy) existingHolding = existingPolicy.holding;
  }

  let holdingId: string;
  let created: boolean;

  if (existingHolding && updateExisting) {
    await tx.holding.update({ where: { id: existingHolding.id }, data: holdingData });
    holdingId = existingHolding.id;
    created = false;
  } else if (existingHolding) {
    holdingId = existingHolding.id;
    created = false;
  } else {
    const newHolding = await tx.holding.create({ data: holdingData });
    holdingId = newHolding.id;
    created = true;
  }

  let coveragesCreated = 0;
  const coverageIdMap: Record<string, string> = {};
  
  if (xmlHolding.Policy) {
    const policyResult = await importPolicy(tx, holdingId, xmlHolding.Policy, partyIdMap, !created);
    coveragesCreated = policyResult.coveragesCreated;
    Object.assign(coverageIdMap, policyResult.coverageIdMap);
  }

  return { id: holdingId, created, coveragesCreated, coverageIdMap };
}

async function importPolicy(
  tx: Prisma.TransactionClient,
  holdingId: string,
  xmlPolicy: OLifEPolicy,
  partyIdMap: Record<string, string>,
  exists: boolean
): Promise<{ coveragesCreated: number; coverageIdMap: Record<string, string> }> {
  
  const carrierPartyId = xmlPolicy.CarrierPartyID 
    ? partyIdMap[xmlPolicy.CarrierPartyID] || xmlPolicy.CarrierPartyID
    : undefined;

  const policyData = {
    polNumber: xmlPolicy.PolNumber || `POL-${Date.now()}`,
    lineOfBusiness: mappings.mapLineOfBusiness(xmlPolicy.LineOfBusiness),
    productType: mappings.mapProductType(xmlPolicy.ProductType),
    productCode: xmlPolicy.ProductCode,
    planName: xmlPolicy.PlanName,
    marketingName: xmlPolicy.MarketingName,
    carrierCode: xmlPolicy.CarrierCode,
    carrierPartyId,
    policyStatus: mappings.mapPolicyStatus(xmlPolicy.PolicyStatus),
    jurisdiction: xmlPolicy.Jurisdiction,
    effDate: xmlPolicy.EffDate ? new Date(xmlPolicy.EffDate) : undefined,
    issueDate: xmlPolicy.IssueDate ? new Date(xmlPolicy.IssueDate) : undefined,
    termDate: xmlPolicy.TermDate ? new Date(xmlPolicy.TermDate) : undefined,
    paidToDate: xmlPolicy.PaidToDate ? new Date(xmlPolicy.PaidToDate) : undefined,
    billedToDate: xmlPolicy.BilledToDate ? new Date(xmlPolicy.BilledToDate) : undefined,
    renewalDate: xmlPolicy.RenewalDate ? new Date(xmlPolicy.RenewalDate) : undefined,
    paymentMode: mappings.mapPaymentMode(xmlPolicy.PaymentMode),
    paymentAmt: xmlPolicy.PaymentAmt?.value,
    annualPaymentAmt: xmlPolicy.AnnualPaymentAmt?.value,
    paymentMethod: mappings.mapPaymentMethod(xmlPolicy.PaymentMethod),
    paymentDraftDay: xmlPolicy.PaymentDueDay,
    policyValue: xmlPolicy.PolicyValue?.value,
    qualPlanType: mappings.mapQualPlanType(xmlPolicy.QualPlanType),
  };

  if (exists) {
    const existingPolicy = await tx.policy.findUnique({ where: { holdingId } });
    if (existingPolicy) {
      await tx.policy.update({ where: { holdingId }, data: policyData });
    } else {
      await tx.policy.create({ data: { holdingId, ...policyData } });
    }
  } else {
    await tx.policy.create({ data: { holdingId, ...policyData } });
  }

  const policy = await tx.policy.findUnique({ where: { holdingId } });
  if (!policy) return { coveragesCreated: 0, coverageIdMap: {} };

  // Import Life/Annuity
  if (xmlPolicy.Life) await importLife(tx, policy.id, xmlPolicy.Life);
  if (xmlPolicy.Annuity) await importAnnuity(tx, policy.id, xmlPolicy.Annuity);

  // Import Coverages
  let coveragesCreated = 0;
  const coverageIdMap: Record<string, string> = {};
  
  if (xmlPolicy.Coverage?.length) {
    for (const xmlCov of xmlPolicy.Coverage) {
      const covResult = await importCoverage(tx, policy.id, xmlCov, partyIdMap);
      if (xmlCov.id && covResult) coverageIdMap[xmlCov.id] = covResult;
      coveragesCreated++;
    }
  }

  // Import ApplicationInfo
  if (xmlPolicy.ApplicationInfo) await importApplicationInfo(tx, policy.id, xmlPolicy.ApplicationInfo);

  return { coveragesCreated, coverageIdMap };
}

async function importLife(tx: Prisma.TransactionClient, policyId: string, xmlLife: OLifELife) {
  const lifeData = {
    qualPlanType: mappings.mapQualPlanType(xmlLife.QualPlanType),
    faceAmt: xmlLife.FaceAmt?.value,
    faceUnits: xmlLife.FaceUnits,
    valuePerUnit: xmlLife.ValuePerUnit?.value,
    deathBenefitAmt: xmlLife.DeathBenefitAmt?.value,
    netDeathBenefitAmt: xmlLife.NetDeathBenefitAmt?.value,
    cashValueAmt: xmlLife.CashValueAmt?.value,
    netSurrValueAmt: xmlLife.NetSurrValueAmt?.value,
    surrenderChargeAmt: xmlLife.SurrenderChargeAmt?.value,
    targetPremAmt: xmlLife.TargetPremAmt?.value,
    minPremAmt: xmlLife.MinPremAmt?.value,
    grossPremAmtITD: xmlLife.GrossPremAmtITD?.value,
    totCumPremAmt: xmlLife.TotCumPremAmt?.value,
    currIntRate: xmlLife.CurrIntRate,
    guarIntRate: xmlLife.GuarIntRate,
    loanAmtATD: xmlLife.LoanAmtATD?.value,
    currLoanIntRate: xmlLife.CurrLoanIntRate,
    divOnDepositAmt: xmlLife.DivOnDepositAmt?.value,
  };

  const existing = await tx.life.findUnique({ where: { policyId } });
  if (existing) {
    await tx.life.update({ where: { policyId }, data: lifeData });
  } else {
    await tx.life.create({ data: { policyId, ...lifeData } });
  }
}

async function importAnnuity(tx: Prisma.TransactionClient, policyId: string, xmlAnnuity: OLifEAnnuity) {
  const annuityData = {
    premType: mappings.getTypeCodeValue(xmlAnnuity.PremType),
    payoutType: mappings.getTypeCodeValue(xmlAnnuity.PayoutType),
    qualPlanType: mappings.mapQualPlanType(xmlAnnuity.QualPlanType),
    sourceOfFunds: mappings.getTypeCodeValue(xmlAnnuity.SourceOfFunds),
    surrenderValue: xmlAnnuity.SurrenderValue?.value,
    surrenderCharge: xmlAnnuity.SurrenderCharge?.value,
    deathBenefitAmt: xmlAnnuity.DeathBenefitAmt?.value,
    guarIntRate: xmlAnnuity.GuarIntRate,
    accumValueIntRateCurrent: xmlAnnuity.AccumValueIntRateCurrent,
    initDepositAmt: xmlAnnuity.InitDepositAmt?.value,
    initDepositDate: xmlAnnuity.InitDepositDate ? new Date(xmlAnnuity.InitDepositDate) : undefined,
    totalDepositITD: xmlAnnuity.TotalDepositITD?.value,
    cumWthdrwlAmtITD: xmlAnnuity.CumWthdrwlAmtITD?.value,
    manPayoutDate: xmlAnnuity.ManPayoutDate ? new Date(xmlAnnuity.ManPayoutDate) : undefined,
  };

  const existing = await tx.annuity.findUnique({ where: { policyId } });
  if (existing) {
    await tx.annuity.update({ where: { policyId }, data: annuityData });
  } else {
    await tx.annuity.create({ data: { policyId, ...annuityData } });
  }
}

async function importCoverage(
  tx: Prisma.TransactionClient,
  policyId: string,
  xmlCov: OLifECoverage,
  partyIdMap: Record<string, string>
): Promise<string> {
  const coverage = await tx.coverage.create({
    data: {
      policyId,
      coverageKey: xmlCov.CoverageKey,
      covNumber: xmlCov.CovNumber,
      productCode: xmlCov.ProductCode,
      planName: xmlCov.PlanName,
      indicatorCode: mappings.mapCoverageIndicatorCode(xmlCov.IndicatorCode),
      lifeCovTypeCode: mappings.getTypeCodeValue(xmlCov.LifeCovTypeCode),
      lifeCovStatus: mappings.mapCoverageStatus(xmlCov.LifeCovStatus),
      currentAmt: xmlCov.CurrentAmt?.value,
      deathBenefitAmt: xmlCov.DeathBenefitAmt?.value,
      initCovAmt: xmlCov.InitCovAmt?.value,
      cashValue: xmlCov.CashValue?.value,
      modalPremAmt: xmlCov.ModalPremAmt?.value,
      annualPremAmt: xmlCov.AnnualPremAmt?.value,
      effDate: xmlCov.EffDate ? new Date(xmlCov.EffDate) : undefined,
      termDate: xmlCov.TermDate ? new Date(xmlCov.TermDate) : undefined,
    },
  });

  // Import LifeParticipants
  if (xmlCov.LifeParticipant?.length) {
    for (const xmlPart of xmlCov.LifeParticipant) {
      const partyId = xmlPart.PartyID ? partyIdMap[xmlPart.PartyID] || xmlPart.PartyID : undefined;
      if (partyId) {
        await tx.lifeParticipant.create({
          data: {
            coverageId: coverage.id,
            partyId,
            participantType: mappings.getTypeCodeValue(xmlPart.LifeParticipantRoleCode),
            issueAge: xmlPart.IssueAge,
            issueGender: mappings.mapGenderCode(xmlPart.IssueGender),
            underwritingClass: mappings.getTypeCodeValue(xmlPart.UnderwritingClass),
            tobaccoClass: mappings.getTypeCodeValue(xmlPart.TobaccoClass),
            tableRating: mappings.getTypeCodeValue(xmlPart.TableRating),
            flatExtraAmt: xmlPart.FlatExtraAmt?.value,
            permFlatExtraAmt: xmlPart.PermFlatExtraAmt?.value,
          },
        });
      }
    }
  }

  // Import CovOptions
  if (xmlCov.CovOption?.length) {
    for (const xmlOpt of xmlCov.CovOption) {
      await tx.covOption.create({
        data: {
          coverageId: coverage.id,
          optionType: mappings.getTypeCodeValue(xmlOpt.OptionType),
          optionCode: xmlOpt.OptionCode,
          optionName: xmlOpt.OptionName,
          optionAmt: xmlOpt.OptionAmt?.value,
          optionPremAmt: xmlOpt.OptionPremAmt?.value,
          effDate: xmlOpt.EffDate ? new Date(xmlOpt.EffDate) : undefined,
          termDate: xmlOpt.TermDate ? new Date(xmlOpt.TermDate) : undefined,
        },
      });
    }
  }

  return coverage.id;
}

async function importApplicationInfo(tx: Prisma.TransactionClient, policyId: string, xmlAppInfo: OLifEApplicationInfo) {
  const appData = {
    applicationNumber: xmlAppInfo.ApplicationNumber,
    applicationDate: xmlAppInfo.ApplicationDate ? new Date(xmlAppInfo.ApplicationDate) : undefined,
    signedDate: xmlAppInfo.SignedDate ? new Date(xmlAppInfo.SignedDate) : undefined,
    submittedDate: xmlAppInfo.SubmittedDate ? new Date(xmlAppInfo.SubmittedDate) : undefined,
    applicationState: xmlAppInfo.ApplicationState,
    replacementInd: xmlAppInfo.ReplacementInd,
    requestedPolNumber: xmlAppInfo.RequestedPolNumber,
  };

  const existing = await tx.applicationInfo.findUnique({ where: { policyId } });
  if (existing) {
    await tx.applicationInfo.update({ where: { policyId }, data: appData });
  } else {
    await tx.applicationInfo.create({ data: { policyId, ...appData } });
  }
}

// =============================================================================
// Relation Import
// =============================================================================

async function importRelation(
  tx: Prisma.TransactionClient,
  xmlRelation: OLifERelation,
  partyIdMap: Record<string, string>,
  holdingIdMap: Record<string, string>
) {
  let originatingPartyId: string | undefined;
  let originatingHoldingId: string | undefined;
  let relatedPartyId: string | undefined;

  const originatingId = xmlRelation.OriginatingObjectID;
  const relatedId = xmlRelation.RelatedObjectID;
  const originatingType = mappings.getTypeCodeValue(xmlRelation.OriginatingObjectType);

  if (originatingId) {
    if (originatingType === 'Holding' || originatingType === 'Policy') {
      originatingHoldingId = holdingIdMap[originatingId] || originatingId;
    } else {
      originatingPartyId = partyIdMap[originatingId] || originatingId;
    }
  }

  if (relatedId) {
    relatedPartyId = partyIdMap[relatedId] || relatedId;
  }

  if (!originatingPartyId && !originatingHoldingId) {
    throw new Error('Relation must have originating party or holding');
  }

  await tx.relation.create({
    data: {
      originatingPartyId,
      originatingHoldingId,
      relatedPartyId,
      relationRoleCode: mappings.mapRelationRoleCode(xmlRelation.RelationRoleCode),
      relationDescription: xmlRelation.RelationDescription,
      interestPercent: xmlRelation.InterestPercent,
      beneficiaryDesignation: mappings.mapBeneficiaryDesignation(xmlRelation.BeneficiaryDesignation),
      irrevocableInd: xmlRelation.IrrevocableInd,
      volumeSharePct: xmlRelation.VolumeSharePct,
      startDate: xmlRelation.StartDate ? new Date(xmlRelation.StartDate) : undefined,
      endDate: xmlRelation.EndDate ? new Date(xmlRelation.EndDate) : undefined,
    },
  });
}

// =============================================================================
// Export Function
// =============================================================================

export async function exportAcordXml(options: ExportOptions): Promise<ExportResult> {
  try {
    const olife: OLifE = {
      Version: '2.20.01',
      SourceInfo: {
        CreationDate: new Date().toISOString().split('T')[0],
        CreationTime: new Date().toISOString().split('T')[1].split('.')[0],
        SourceInfoName: options.vendorName || 'ACORD CRM',
      },
      Holding: [],
      Party: [],
      Relation: [],
    };

    let partiesExported = 0;
    let holdingsExported = 0;
    let relationsExported = 0;
    let coveragesExported = 0;

    // Export Parties
    if (options.includeParties !== false) {
      const parties = await prisma.party.findMany({
        where: options.partyIds?.length ? { id: { in: options.partyIds } } : undefined,
        include: {
          person: true,
          organization: true,
          addresses: true,
          phones: true,
          emails: true,
          client: true,
        },
      });

      for (const party of parties) {
        olife.Party!.push(exportParty(party));
        partiesExported++;
      }
    }

    // Export Holdings
    if (options.includeHoldings !== false) {
      const holdings = await prisma.holding.findMany({
        where: options.holdingIds?.length ? { id: { in: options.holdingIds } } : undefined,
        include: {
          policy: {
            include: {
              life: true,
              annuity: { include: { payouts: true } },
              coverages: { include: { lifeParticipants: true, covOptions: true } },
              applicationInfo: true,
            },
          },
          loans: true,
          arrangements: true,
        },
      });

      for (const holding of holdings) {
        olife.Holding!.push(exportHolding(holding));
        holdingsExported++;
        if (holding.policy?.coverages) coveragesExported += holding.policy.coverages.length;
      }
    }

    // Export Relations
    if (options.includeRelations !== false) {
      const whereClause: Prisma.RelationWhereInput = {};
      if (options.partyIds?.length) {
        whereClause.OR = [
          { originatingPartyId: { in: options.partyIds } },
          { relatedPartyId: { in: options.partyIds } },
        ];
      }
      if (options.holdingIds?.length) {
        whereClause.originatingHoldingId = { in: options.holdingIds };
      }

      const relations = await prisma.relation.findMany({
        where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      });

      for (const relation of relations) {
        olife.Relation!.push(exportRelation(relation));
        relationsExported++;
      }
    }

    // Build TXLife document
    const transRefGUID = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const txLife: TXLife = {
      version: '2.20.01',
      UserAuthRequest: {
        VendorApp: {
          VendorName: options.vendorName || 'ACORD CRM',
          AppName: options.appName || 'CRM Life Annuity Backend',
          AppVer: options.appVersion || '1.0.0',
        },
      },
      TXLifeResponse: [{
        TransRefGUID: transRefGUID,
        TransType: { tc: options.transactionType || ACORD_TYPE_CODES.TRANS_INQUIRY },
        TransExeDate: new Date().toISOString().split('T')[0],
        TransExeTime: new Date().toISOString().split('T')[1].split('.')[0],
        TransResult: { ResultCode: { tc: ACORD_TYPE_CODES.RESULT_SUCCESS } },
        OLifE: olife,
      }],
    };

    const xmlObj = {
      '?xml': { '@_version': '1.0', '@_encoding': 'UTF-8' },
      TXLife: {
        '@_xmlns': 'http://ACORD.org/Standards/Life/2',
        '@_version': '2.20.01',
        ...txLife,
      },
    };

    const xml = builder.build(xmlObj);

    return {
      success: true,
      xml,
      transactionId: transRefGUID,
      summary: { partiesExported, holdingsExported, relationsExported, coveragesExported },
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export XML',
    };
  }
}

// =============================================================================
// Export Helpers
// =============================================================================

function exportParty(party: any): OLifEParty {
  const xmlParty: OLifEParty = {
    id: party.id,
    PartyTypeCode: { tc: mappings.reverseMapPartyTypeCode(party.partyTypeCode) },
    PartyKey: party.partyKey || undefined,
    FullName: party.fullName || undefined,
    GovtID: party.govtId || undefined,
    GovtIDTC: party.govtIdType ? { tc: mappings.reverseMapGovtIdType(party.govtIdType) } : undefined,
    ResidenceState: party.residenceState || undefined,
    ResidenceCountry: party.residenceCountry || undefined,
    EstNetWorth: party.estNetWorth ? { value: Number(party.estNetWorth) } : undefined,
  };

  if (party.person) {
    xmlParty.Person = {
      FirstName: party.person.firstName,
      MiddleName: party.person.middleName || undefined,
      LastName: party.person.lastName,
      Prefix: party.person.prefix || undefined,
      Suffix: party.person.suffix || undefined,
      Gender: party.person.gender ? { tc: mappings.reverseMapGenderCode(party.person.gender) } : undefined,
      BirthDate: party.person.birthDate?.toISOString().split('T')[0],
      MarStat: party.person.maritalStatus ? { tc: mappings.reverseMapMaritalStatus(party.person.maritalStatus) } : undefined,
      Citizenship: party.person.citizenship || undefined,
      Occupation: party.person.occupation || undefined,
    };
  }

  if (party.organization) {
    xmlParty.Organization = {
      OrgForm: party.organization.orgForm ? { tc: mappings.reverseMapOrgForm(party.organization.orgForm) } : undefined,
      DBA: party.organization.dba || undefined,
      AbbrName: party.organization.abbrName || undefined,
      SICCode: party.organization.sicCode || undefined,
      NAICSCode: party.organization.naicsCode || undefined,
      NumEmployees: party.organization.numEmployees || undefined,
    };
  }

  if (party.addresses?.length > 0) {
    xmlParty.Address = party.addresses.map((addr: any) => ({
      id: addr.id,
      AddressTypeCode: { tc: mappings.reverseMapAddressTypeCode(addr.addressTypeCode) },
      Line1: addr.line1 || undefined,
      Line2: addr.line2 || undefined,
      City: addr.city || undefined,
      AddressState: addr.state || undefined,
      Zip: addr.zip || undefined,
      AddressCountry: addr.country || undefined,
    }));
  }

  if (party.phones?.length > 0) {
    xmlParty.Phone = party.phones.map((phone: any) => ({
      id: phone.id,
      PhoneTypeCode: { tc: mappings.reverseMapPhoneTypeCode(phone.phoneTypeCode) },
      AreaCode: phone.areaCode || undefined,
      DialNumber: phone.dialNumber,
      Ext: phone.extension || undefined,
    }));
  }

  if (party.emails?.length > 0) {
    xmlParty.EMailAddress = party.emails.map((email: any) => ({
      id: email.id,
      EMailType: { tc: mappings.reverseMapEmailTypeCode(email.emailTypeCode) },
      AddrLine: email.addrLine,
    }));
  }

  return xmlParty;
}

function exportHolding(holding: any): OLifEHolding {
  const xmlHolding: OLifEHolding = {
    id: holding.id,
    HoldingTypeCode: { tc: mappings.reverseMapHoldingTypeCode(holding.holdingTypeCode) },
    HoldingStatus: { tc: mappings.reverseMapHoldingStatus(holding.holdingStatus) },
    HoldingKey: holding.holdingKey || undefined,
    HoldingName: holding.holdingName || undefined,
    AssetValue: holding.assetValue ? { value: Number(holding.assetValue) } : undefined,
    AsOfDate: holding.asOfDate?.toISOString().split('T')[0],
  };

  if (holding.policy) {
    xmlHolding.Policy = {
      PolNumber: holding.policy.polNumber,
      LineOfBusiness: { tc: mappings.reverseMapLineOfBusiness(holding.policy.lineOfBusiness) },
      ProductType: holding.policy.productType ? { tc: mappings.reverseMapProductType(holding.policy.productType) } : undefined,
      ProductCode: holding.policy.productCode || undefined,
      PlanName: holding.policy.planName || undefined,
      CarrierCode: holding.policy.carrierCode || undefined,
      PolicyStatus: { tc: mappings.reverseMapPolicyStatus(holding.policy.policyStatus) },
      Jurisdiction: holding.policy.jurisdiction || undefined,
      EffDate: holding.policy.effDate?.toISOString().split('T')[0],
      IssueDate: holding.policy.issueDate?.toISOString().split('T')[0],
      TermDate: holding.policy.termDate?.toISOString().split('T')[0],
      PaymentMode: holding.policy.paymentMode ? { tc: mappings.reverseMapPaymentMode(holding.policy.paymentMode) } : undefined,
      PaymentAmt: holding.policy.paymentAmt ? { value: Number(holding.policy.paymentAmt) } : undefined,
      QualPlanType: holding.policy.qualPlanType ? { tc: mappings.reverseMapQualPlanType(holding.policy.qualPlanType) } : undefined,
    };

    if (holding.policy.life) {
      xmlHolding.Policy.Life = {
        FaceAmt: holding.policy.life.faceAmt ? { value: Number(holding.policy.life.faceAmt) } : undefined,
        DeathBenefitAmt: holding.policy.life.deathBenefitAmt ? { value: Number(holding.policy.life.deathBenefitAmt) } : undefined,
        CashValueAmt: holding.policy.life.cashValueAmt ? { value: Number(holding.policy.life.cashValueAmt) } : undefined,
        CurrIntRate: holding.policy.life.currIntRate ? Number(holding.policy.life.currIntRate) : undefined,
        GuarIntRate: holding.policy.life.guarIntRate ? Number(holding.policy.life.guarIntRate) : undefined,
      };
    }

    if (holding.policy.annuity) {
      xmlHolding.Policy.Annuity = {
        QualPlanType: holding.policy.annuity.qualPlanType ? { tc: mappings.reverseMapQualPlanType(holding.policy.annuity.qualPlanType) } : undefined,
        SurrenderValue: holding.policy.annuity.surrenderValue ? { value: Number(holding.policy.annuity.surrenderValue) } : undefined,
        DeathBenefitAmt: holding.policy.annuity.deathBenefitAmt ? { value: Number(holding.policy.annuity.deathBenefitAmt) } : undefined,
        GuarIntRate: holding.policy.annuity.guarIntRate ? Number(holding.policy.annuity.guarIntRate) : undefined,
      };
    }

    if (holding.policy.coverages?.length > 0) {
      xmlHolding.Policy.Coverage = holding.policy.coverages.map((cov: any) => ({
        id: cov.id,
        CoverageKey: cov.coverageKey || undefined,
        CovNumber: cov.covNumber || undefined,
        IndicatorCode: { tc: mappings.reverseMapCoverageIndicatorCode(cov.indicatorCode) },
        LifeCovStatus: { tc: mappings.reverseMapCoverageStatus(cov.lifeCovStatus) },
        CurrentAmt: cov.currentAmt ? { value: Number(cov.currentAmt) } : undefined,
        EffDate: cov.effDate?.toISOString().split('T')[0],
        TermDate: cov.termDate?.toISOString().split('T')[0],
      }));
    }
  }

  return xmlHolding;
}

function exportRelation(relation: any): OLifERelation {
  return {
    id: relation.id,
    OriginatingObjectID: relation.originatingHoldingId || relation.originatingPartyId || undefined,
    OriginatingObjectType: relation.originatingHoldingId 
      ? { tc: 'Holding', value: 'Holding' }
      : { tc: 'Party', value: 'Party' },
    RelatedObjectID: relation.relatedPartyId || undefined,
    RelatedObjectType: { tc: 'Party', value: 'Party' },
    RelationRoleCode: { tc: mappings.reverseMapRelationRoleCode(relation.relationRoleCode) },
    RelationDescription: relation.relationDescription || undefined,
    InterestPercent: relation.interestPercent ? Number(relation.interestPercent) : undefined,
    BeneficiaryDesignation: relation.beneficiaryDesignation 
      ? { tc: mappings.reverseMapBeneficiaryDesignation(relation.beneficiaryDesignation) }
      : undefined,
    IrrevocableInd: relation.irrevocableInd || undefined,
    VolumeSharePct: relation.volumeSharePct ? Number(relation.volumeSharePct) : undefined,
    StartDate: relation.startDate?.toISOString().split('T')[0],
    EndDate: relation.endDate?.toISOString().split('T')[0],
  };
}
