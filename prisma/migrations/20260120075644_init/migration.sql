-- CreateEnum
CREATE TYPE "PartyTypeCode" AS ENUM ('PERSON', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "GenderCode" AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED', 'DOMESTIC_PARTNER', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "AddressTypeCode" AS ENUM ('RESIDENCE', 'BUSINESS', 'MAILING', 'BILLING', 'PRIOR_RESIDENCE', 'SEASONAL', 'OTHER');

-- CreateEnum
CREATE TYPE "PhoneTypeCode" AS ENUM ('HOME', 'BUSINESS', 'MOBILE', 'FAX', 'PAGER', 'OTHER');

-- CreateEnum
CREATE TYPE "EmailTypeCode" AS ENUM ('PERSONAL', 'BUSINESS', 'OTHER');

-- CreateEnum
CREATE TYPE "HoldingTypeCode" AS ENUM ('POLICY', 'ANNUITY', 'INVESTMENT', 'BANKING', 'OTHER');

-- CreateEnum
CREATE TYPE "HoldingStatus" AS ENUM ('PROPOSED', 'PENDING', 'ACTIVE', 'INACTIVE', 'TERMINATED', 'SURRENDERED', 'LAPSED', 'DEATH_CLAIM', 'MATURED', 'CANCELLED', 'DECLINED', 'NOT_TAKEN', 'PAID_UP', 'EXTENDED_TERM', 'REDUCED_PAID_UP');

-- CreateEnum
CREATE TYPE "PolicyStatus" AS ENUM ('PROPOSAL_PENDING', 'PENDING_ISSUE', 'INFORCE_ACTIVE', 'INFORCE_PREMIUM_PAYING', 'PENDING_REISSUE', 'LAPSED', 'SURRENDERED', 'DEATH_CLAIM', 'MATURED', 'TERMINATED', 'CANCELLED_BY_CARRIER', 'CANCELLED_BY_OWNER', 'PENDING_RESCIND', 'RESCINDED', 'NOT_TAKEN', 'DECLINED', 'INCOMPLETE', 'ISSUED');

-- CreateEnum
CREATE TYPE "LineOfBusiness" AS ENUM ('LIFE', 'ANNUITY', 'HEALTH', 'PROPERTY', 'CASUALTY', 'OTHER');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('WHOLE_LIFE', 'TERM_LIFE', 'UNIVERSAL_LIFE', 'VARIABLE_LIFE', 'VARIABLE_UL', 'INDEXED_UL', 'FIXED_ANNUITY', 'VARIABLE_ANNUITY', 'INDEXED_ANNUITY', 'IMMEDIATE_ANNUITY', 'DEFERRED_ANNUITY', 'OTHER');

-- CreateEnum
CREATE TYPE "QualifiedPlanType" AS ENUM ('NON_QUALIFIED', 'IRA', 'ROTH_IRA', 'SEP_IRA', 'SIMPLE_IRA', 'K401', 'K403B', 'K457', 'PENSION', 'PROFIT_SHARING', 'KEOGH', 'INHERITED_IRA', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('ANNUAL', 'SEMI_ANNUAL', 'QUARTERLY', 'MONTHLY', 'WEEKLY', 'BI_WEEKLY', 'SINGLE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CHECK', 'EFT', 'CREDIT_CARD', 'PAYROLL_DEDUCT', 'GOVT_ALLOTMENT', 'AUTO_PREMIUM', 'DIVIDEND', 'WIRE', 'OTHER');

-- CreateEnum
CREATE TYPE "CoverageStatus" AS ENUM ('ACTIVE', 'PENDING', 'TERMINATED', 'WAIVED', 'NOT_TAKEN', 'REDUCED');

-- CreateEnum
CREATE TYPE "CoverageIndicatorCode" AS ENUM ('BASE', 'RIDER', 'OPTION', 'SUPPLEMENTAL');

-- CreateEnum
CREATE TYPE "RelationRoleCode" AS ENUM ('OWNER', 'INSURED', 'JOINT_INSURED', 'ANNUITANT', 'JOINT_ANNUITANT', 'PAYOR', 'PRIMARY_BENEFICIARY', 'CONTINGENT_BENEFICIARY', 'FINAL_BENEFICIARY', 'IRREVOCABLE_BENEFICIARY', 'PRIMARY_AGENT', 'SERVICING_AGENT', 'WRITING_AGENT', 'BROKER_DEALER', 'TRUSTEE', 'CUSTODIAN', 'EMPLOYER', 'GUARDIAN', 'POWER_OF_ATTORNEY', 'CARRIER', 'SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'GRANDPARENT', 'GRANDCHILD', 'OTHER_RELATIVE', 'OTHER');

-- CreateEnum
CREATE TYPE "BeneficiaryDesignation" AS ENUM ('NAMED', 'PER_STIRPES', 'ESTATE', 'TRUST', 'CHARITY', 'CLASS', 'OTHER');

-- CreateEnum
CREATE TYPE "GovtIdType" AS ENUM ('SSN', 'FEIN', 'ITIN', 'PASSPORT', 'DRIVERS_LICENSE', 'OTHER');

-- CreateEnum
CREATE TYPE "OrgFormType" AS ENUM ('SOLE_PROPRIETORSHIP', 'PARTNERSHIP', 'LLC', 'CORPORATION', 'S_CORP', 'C_CORP', 'NON_PROFIT', 'TRUST', 'ESTATE', 'GOVERNMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "TrustType" AS ENUM ('REVOCABLE', 'IRREVOCABLE', 'LIVING_TRUST', 'TESTAMENTARY', 'CHARITABLE', 'SPECIAL_NEEDS', 'QUALIFIED_TRUST', 'ILIT', 'OTHER');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CALL', 'EMAIL', 'MEETING', 'TASK', 'NOTE', 'FOLLOW_UP', 'APPOINTMENT', 'QUOTE', 'APPLICATION', 'POLICY_DELIVERY', 'REVIEW', 'OTHER');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DEFERRED');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('REFERRAL', 'WEB_INQUIRY', 'COLD_CALL', 'WALK_IN', 'SEMINAR', 'DIRECT_MAIL', 'SOCIAL_MEDIA', 'EXISTING_CLIENT', 'PURCHASED_LIST', 'OTHER');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST', 'DORMANT');

-- CreateTable
CREATE TABLE "Party" (
    "id" TEXT NOT NULL,
    "partyTypeCode" "PartyTypeCode" NOT NULL DEFAULT 'PERSON',
    "partyKey" TEXT,
    "carrierAdminSystem" TEXT,
    "fullName" TEXT,
    "govtId" TEXT,
    "govtIdType" "GovtIdType" DEFAULT 'SSN',
    "residenceState" TEXT,
    "residenceCountry" TEXT DEFAULT 'US',
    "residenceZip" TEXT,
    "estNetWorth" DECIMAL(15,2),
    "estTotalLiabilities" DECIMAL(15,2),
    "estTotalAssets" DECIMAL(15,2),
    "liquidNetWorth" DECIMAL(15,2),
    "prefComm" TEXT,
    "bestTimeToCallFrom" TEXT,
    "bestTimeToCallTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "prefix" TEXT,
    "suffix" TEXT,
    "nickName" TEXT,
    "initials" TEXT,
    "title" TEXT,
    "gender" "GenderCode",
    "birthDate" DATE,
    "age" INTEGER,
    "maritalStatus" "MaritalStatus",
    "citizenship" TEXT DEFAULT 'US',
    "birthCountry" TEXT,
    "birthJurisdiction" TEXT,
    "birthCity" TEXT,
    "occupation" TEXT,
    "occupationClass" TEXT,
    "estimatedSalary" DECIMAL(15,2),
    "estimatedOtherIncome" DECIMAL(15,2),
    "tobaccoType" TEXT,
    "smokerStatus" TEXT,
    "height" DECIMAL(5,2),
    "heightUnits" TEXT DEFAULT 'IN',
    "weight" DECIMAL(5,2),
    "weightUnits" TEXT DEFAULT 'LB',
    "driversLicenseNum" TEXT,
    "driversLicenseState" TEXT,
    "passportNo" TEXT,
    "immigrationStatus" TEXT,
    "visaType" TEXT,
    "visaExpDate" DATE,
    "deathDate" DATE,
    "causeOfDeath" TEXT,
    "deathCountry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "orgForm" "OrgFormType",
    "dba" TEXT,
    "abbrName" TEXT,
    "trustType" "TrustType",
    "trustTypeDesc" TEXT,
    "irrevocableInd" BOOLEAN,
    "establishedDate" DATE,
    "dissolvedDate" DATE,
    "natureCategory" TEXT,
    "natureSubCategory" TEXT,
    "businessDesc" TEXT,
    "sicCode" TEXT,
    "sicCodeDesc" TEXT,
    "naicsCode" TEXT,
    "naicsCodeDesc" TEXT,
    "dunsNumber" TEXT,
    "numEmployees" INTEGER,
    "estTaxBracket" DECIMAL(5,2),
    "publiclyTraded" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "addressTypeCode" "AddressTypeCode" NOT NULL DEFAULT 'RESIDENCE',
    "attentionLine" TEXT,
    "line1" TEXT,
    "line2" TEXT,
    "line3" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "country" TEXT DEFAULT 'US',
    "countyName" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "solicitationInd" BOOLEAN NOT NULL DEFAULT true,
    "startDate" DATE,
    "endDate" DATE,
    "yearsAtAddress" INTEGER,
    "recurringStartMoDay" TEXT,
    "recurringEndMoDay" TEXT,
    "returnedMailInd" BOOLEAN NOT NULL DEFAULT false,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phone" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "phoneTypeCode" "PhoneTypeCode" NOT NULL DEFAULT 'HOME',
    "countryCode" TEXT DEFAULT '1',
    "areaCode" TEXT,
    "dialNumber" TEXT NOT NULL,
    "extension" TEXT,
    "fullNumber" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "bestTimeToCallFrom" TEXT,
    "bestTimeToCallTo" TEXT,
    "solicitationInd" BOOLEAN NOT NULL DEFAULT true,
    "startDate" DATE,
    "endDate" DATE,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "invalidInd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EMailAddress" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "emailTypeCode" "EmailTypeCode" NOT NULL DEFAULT 'PERSONAL',
    "addrLine" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "attachmentInd" BOOLEAN NOT NULL DEFAULT true,
    "solicitationInd" BOOLEAN NOT NULL DEFAULT true,
    "startDate" DATE,
    "endDate" DATE,
    "undeliverableInd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EMailAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employment" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "employerPartyId" TEXT,
    "employeeId" TEXT,
    "occupation" TEXT,
    "title" TEXT,
    "hireDate" DATE,
    "terminationDate" DATE,
    "retirementDate" DATE,
    "annualSalary" DECIMAL(15,2),
    "salaryMode" "PaymentMode" DEFAULT 'ANNUAL',
    "annualEarnings" DECIMAL(15,2),
    "hoursWorkedPerWeek" DECIMAL(4,1),
    "employmentStatus" TEXT,
    "occupationClass" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "leadSource" "LeadSource",
    "leadStatus" "LeadStatus" DEFAULT 'NEW',
    "leadDate" DATE,
    "convertedDate" DATE,
    "assignedAgentId" TEXT,
    "riskTolerance" TEXT,
    "investmentObjective" TEXT,
    "timeHorizon" TEXT,
    "reviewDate" DATE,
    "lastContactDate" DATE,
    "nextFollowUpDate" DATE,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producer" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "npn" TEXT,
    "stateProducerNum" TEXT,
    "licenseState" TEXT,
    "licenseNumber" TEXT,
    "licenseExpDate" DATE,
    "appointedCarriers" TEXT[],
    "commissionLevel" TEXT,
    "commissionSplit" DECIMAL(5,4),
    "uplineProducerId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Producer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Carrier" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "carrierCode" TEXT NOT NULL,
    "naicCode" TEXT,
    "amBestCode" TEXT,
    "amBestRating" TEXT,
    "website" TEXT,
    "phoneNumber" TEXT,
    "productsOffered" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Carrier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Holding" (
    "id" TEXT NOT NULL,
    "holdingKey" TEXT,
    "carrierAdminSystem" TEXT,
    "holdingTypeCode" "HoldingTypeCode" NOT NULL DEFAULT 'POLICY',
    "holdingStatus" "HoldingStatus" NOT NULL DEFAULT 'PROPOSED',
    "holdingName" TEXT,
    "currencyTypeCode" TEXT DEFAULT 'USD',
    "assetValue" DECIMAL(15,2),
    "liabilityValue" DECIMAL(15,2),
    "costBasis" DECIMAL(15,2),
    "asOfDate" DATE,
    "lastFinActivityDate" DATE,
    "lastAnniversaryDate" DATE,
    "nextAnniversaryDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Holding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "holdingId" TEXT NOT NULL,
    "polNumber" TEXT NOT NULL,
    "certificateNo" TEXT,
    "billNumber" TEXT,
    "lineOfBusiness" "LineOfBusiness" NOT NULL DEFAULT 'LIFE',
    "productType" "ProductType",
    "productCode" TEXT,
    "productVersionCode" TEXT,
    "planName" TEXT,
    "marketingName" TEXT,
    "carrierCode" TEXT,
    "carrierPartyId" TEXT,
    "administeringCarrier" TEXT,
    "policyStatus" "PolicyStatus" NOT NULL DEFAULT 'PROPOSAL_PENDING',
    "statusReason" TEXT,
    "statusChangeDate" DATE,
    "issueNation" TEXT DEFAULT 'US',
    "jurisdiction" TEXT,
    "effDate" DATE,
    "issueDate" DATE,
    "termDate" DATE,
    "paidToDate" DATE,
    "billedToDate" DATE,
    "gracePeriodEndDate" DATE,
    "renewalDate" DATE,
    "paymentMode" "PaymentMode" DEFAULT 'MONTHLY',
    "paymentAmt" DECIMAL(15,2),
    "annualPaymentAmt" DECIMAL(15,2),
    "paymentMethod" "PaymentMethod" DEFAULT 'EFT',
    "paymentDueDate" DATE,
    "paymentDraftDay" INTEGER,
    "bankName" TEXT,
    "bankAcctType" TEXT,
    "routingNumber" TEXT,
    "accountNumber" TEXT,
    "acctHolderName" TEXT,
    "policyValue" DECIMAL(15,2),
    "policyFee" DECIMAL(15,2),
    "replacementType" TEXT,
    "taxStatus" TEXT,
    "qualPlanType" "QualifiedPlanType" DEFAULT 'NON_QUALIFIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Life" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "qualPlanType" "QualifiedPlanType",
    "faceAmt" DECIMAL(15,2),
    "faceUnits" DECIMAL(15,4),
    "valuePerUnit" DECIMAL(15,4),
    "deathBenefitAmt" DECIMAL(15,2),
    "netDeathBenefitAmt" DECIMAL(15,2),
    "cashValueAmt" DECIMAL(15,2),
    "netSurrValueAmt" DECIMAL(15,2),
    "surrenderChargeAmt" DECIMAL(15,2),
    "targetPremAmt" DECIMAL(15,2),
    "minPremAmt" DECIMAL(15,2),
    "grossPremAmtITD" DECIMAL(15,2),
    "totCumPremAmt" DECIMAL(15,2),
    "lastPremAmt" DECIMAL(15,2),
    "lastPremDate" DATE,
    "currIntRate" DECIMAL(7,5),
    "guarIntRate" DECIMAL(7,5),
    "loanAmtATD" DECIMAL(15,2),
    "currLoanIntRate" DECIMAL(7,5),
    "maxAvailableLoan" DECIMAL(15,2),
    "divType" TEXT,
    "lastDivAmt" DECIMAL(15,2),
    "lastDivDate" DATE,
    "divOnDepositAmt" DECIMAL(15,2),
    "divPUA" DECIMAL(15,2),
    "totWthdrwlAmtITD" DECIMAL(15,2),
    "numWthdrwITD" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Life_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Annuity" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "premType" TEXT,
    "payoutType" TEXT,
    "qualPlanType" "QualifiedPlanType",
    "sourceOfFunds" TEXT,
    "ownershipOfFunds" TEXT,
    "surrenderValue" DECIMAL(15,2),
    "surrenderCharge" DECIMAL(15,2),
    "deathBenefitAmt" DECIMAL(15,2),
    "cashValueMaturity" DECIMAL(15,2),
    "guarIntRate" DECIMAL(7,5),
    "guarLifetimeRate" DECIMAL(7,5),
    "accumValueIntRateCurrent" DECIMAL(7,5),
    "initDepositAmt" DECIMAL(15,2),
    "initDepositDate" DATE,
    "totalDepositITD" DECIMAL(15,2),
    "grossPremATD" DECIMAL(15,2),
    "cumWthdrwlAmtITD" DECIMAL(15,2),
    "numWthdrwITD" INTEGER DEFAULT 0,
    "withdrawalRule" TEXT,
    "manPayoutDate" DATE,
    "penaltyPhaseEndDate" DATE,
    "guarIntEndDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Annuity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "annuityId" TEXT NOT NULL,
    "incomeOption" TEXT,
    "payoutType" TEXT,
    "payoutAmt" DECIMAL(15,2),
    "payoutPct" DECIMAL(7,5),
    "payoutMode" "PaymentMode",
    "payoutForm" TEXT,
    "startDate" DATE,
    "payoutEndDate" DATE,
    "nextPayoutDate" DATE,
    "taxWithheldInd" BOOLEAN DEFAULT false,
    "federalTaxWithheld" DECIMAL(15,2),
    "jurisdictionTaxWithheld" DECIMAL(15,2),
    "exclusionRatio" DECIMAL(7,5),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coverage" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "coverageKey" TEXT,
    "covNumber" TEXT,
    "productCode" TEXT,
    "planName" TEXT,
    "indicatorCode" "CoverageIndicatorCode" NOT NULL DEFAULT 'BASE',
    "lifeCovTypeCode" TEXT,
    "lifeCovStatus" "CoverageStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentAmt" DECIMAL(15,2),
    "deathBenefitAmt" DECIMAL(15,2),
    "initCovAmt" DECIMAL(15,2),
    "cashValue" DECIMAL(15,2),
    "modalPremAmt" DECIMAL(15,2),
    "annualPremAmt" DECIMAL(15,2),
    "targetPremAmt" DECIMAL(15,2),
    "effDate" DATE,
    "termDate" DATE,
    "paidToDate" DATE,
    "duration" INTEGER,
    "benefitPeriod" INTEGER,
    "issueGender" "GenderCode",
    "equivalentAge" INTEGER,
    "guarIntRate" DECIMAL(7,5),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LifeParticipant" (
    "id" TEXT NOT NULL,
    "coverageId" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "participantType" TEXT,
    "issueAge" INTEGER,
    "issueGender" "GenderCode",
    "underwritingClass" TEXT,
    "tobaccoClass" TEXT,
    "tableRating" TEXT,
    "flatExtraAmt" DECIMAL(15,2),
    "flatExtraEndDate" DATE,
    "permFlatExtraAmt" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LifeParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CovOption" (
    "id" TEXT NOT NULL,
    "coverageId" TEXT NOT NULL,
    "optionType" TEXT,
    "optionCode" TEXT,
    "optionName" TEXT,
    "optionAmt" DECIMAL(15,2),
    "optionPremAmt" DECIMAL(15,2),
    "effDate" DATE,
    "termDate" DATE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CovOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Relation" (
    "id" TEXT NOT NULL,
    "originatingPartyId" TEXT,
    "originatingHoldingId" TEXT,
    "relatedPartyId" TEXT,
    "relationRoleCode" "RelationRoleCode" NOT NULL,
    "relationDescription" TEXT,
    "interestPercent" DECIMAL(7,4),
    "beneficiarySeqNum" INTEGER,
    "beneficiaryDesignation" "BeneficiaryDesignation",
    "irrevocableInd" BOOLEAN DEFAULT false,
    "volumeSharePct" DECIMAL(7,4),
    "commScheduleCode" TEXT,
    "startDate" DATE,
    "endDate" DATE,
    "sequence" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Relation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" TEXT NOT NULL,
    "holdingId" TEXT NOT NULL,
    "loanType" TEXT,
    "loanAmt" DECIMAL(15,2),
    "loanIntRate" DECIMAL(7,5),
    "loanDate" DATE,
    "loanBalance" DECIMAL(15,2),
    "accruedInterest" DECIMAL(15,2),
    "loanPaymentAmt" DECIMAL(15,2),
    "loanPaymentMode" "PaymentMode",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Arrangement" (
    "id" TEXT NOT NULL,
    "holdingId" TEXT NOT NULL,
    "arrType" TEXT,
    "arrMode" "PaymentMode",
    "arrAmt" DECIMAL(15,2),
    "arrPct" DECIMAL(7,5),
    "startDate" DATE,
    "endDate" DATE,
    "nextProcessDate" DATE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Arrangement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequirementInfo" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "reqCode" TEXT,
    "requirementDetails" TEXT,
    "reqStatus" TEXT,
    "requestedDate" DATE,
    "receivedDate" DATE,
    "fulfilledDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequirementInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationInfo" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "applicationNumber" TEXT,
    "applicationDate" DATE,
    "signedDate" DATE,
    "submittedDate" DATE,
    "applicationState" TEXT,
    "replacementInd" BOOLEAN DEFAULT false,
    "requestedPolNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "claimNumber" TEXT,
    "claimType" TEXT,
    "claimStatus" TEXT,
    "claimDate" DATE,
    "notificationDate" DATE,
    "claimAmt" DECIMAL(15,2),
    "paidAmt" DECIMAL(15,2),
    "paidDate" DATE,
    "causeOfLoss" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "partyId" TEXT,
    "holdingId" TEXT,
    "attachmentType" TEXT,
    "attachmentName" TEXT,
    "description" TEXT,
    "fileName" TEXT,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "storageUrl" TEXT,
    "creationDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "partyId" TEXT,
    "holdingId" TEXT,
    "activityType" "ActivityType" NOT NULL DEFAULT 'NOTE',
    "activityStatus" "ActivityStatus" NOT NULL DEFAULT 'PENDING',
    "subject" TEXT,
    "description" TEXT,
    "dueDate" DATE,
    "dueTime" TEXT,
    "startDate" DATE,
    "endDate" DATE,
    "completedDate" DATE,
    "completedBy" TEXT,
    "assignedTo" TEXT,
    "createdBy" TEXT,
    "priority" INTEGER DEFAULT 3,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringFrequency" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyedValue" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "keyName" TEXT NOT NULL,
    "keyValue" TEXT,
    "vendorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeyedValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemMessage" (
    "id" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "messageCode" TEXT,
    "messageType" TEXT,
    "messageText" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "userId" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Party_partyTypeCode_idx" ON "Party"("partyTypeCode");

-- CreateIndex
CREATE INDEX "Party_fullName_idx" ON "Party"("fullName");

-- CreateIndex
CREATE INDEX "Party_govtId_idx" ON "Party"("govtId");

-- CreateIndex
CREATE INDEX "Party_residenceState_idx" ON "Party"("residenceState");

-- CreateIndex
CREATE UNIQUE INDEX "Person_partyId_key" ON "Person"("partyId");

-- CreateIndex
CREATE INDEX "Person_lastName_firstName_idx" ON "Person"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "Person_birthDate_idx" ON "Person"("birthDate");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_partyId_key" ON "Organization"("partyId");

-- CreateIndex
CREATE INDEX "Organization_orgForm_idx" ON "Organization"("orgForm");

-- CreateIndex
CREATE INDEX "Organization_dba_idx" ON "Organization"("dba");

-- CreateIndex
CREATE INDEX "Address_partyId_idx" ON "Address"("partyId");

-- CreateIndex
CREATE INDEX "Address_addressTypeCode_idx" ON "Address"("addressTypeCode");

-- CreateIndex
CREATE INDEX "Address_state_city_idx" ON "Address"("state", "city");

-- CreateIndex
CREATE INDEX "Phone_partyId_idx" ON "Phone"("partyId");

-- CreateIndex
CREATE INDEX "Phone_phoneTypeCode_idx" ON "Phone"("phoneTypeCode");

-- CreateIndex
CREATE INDEX "EMailAddress_partyId_idx" ON "EMailAddress"("partyId");

-- CreateIndex
CREATE INDEX "EMailAddress_addrLine_idx" ON "EMailAddress"("addrLine");

-- CreateIndex
CREATE INDEX "Employment_partyId_idx" ON "Employment"("partyId");

-- CreateIndex
CREATE INDEX "Employment_isCurrent_idx" ON "Employment"("isCurrent");

-- CreateIndex
CREATE UNIQUE INDEX "Client_partyId_key" ON "Client"("partyId");

-- CreateIndex
CREATE INDEX "Client_leadStatus_idx" ON "Client"("leadStatus");

-- CreateIndex
CREATE INDEX "Client_assignedAgentId_idx" ON "Client"("assignedAgentId");

-- CreateIndex
CREATE UNIQUE INDEX "Producer_partyId_key" ON "Producer"("partyId");

-- CreateIndex
CREATE INDEX "Producer_npn_idx" ON "Producer"("npn");

-- CreateIndex
CREATE INDEX "Producer_isActive_idx" ON "Producer"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Carrier_partyId_key" ON "Carrier"("partyId");

-- CreateIndex
CREATE UNIQUE INDEX "Carrier_carrierCode_key" ON "Carrier"("carrierCode");

-- CreateIndex
CREATE INDEX "Carrier_carrierCode_idx" ON "Carrier"("carrierCode");

-- CreateIndex
CREATE INDEX "Holding_holdingTypeCode_idx" ON "Holding"("holdingTypeCode");

-- CreateIndex
CREATE INDEX "Holding_holdingStatus_idx" ON "Holding"("holdingStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Policy_holdingId_key" ON "Policy"("holdingId");

-- CreateIndex
CREATE INDEX "Policy_policyStatus_idx" ON "Policy"("policyStatus");

-- CreateIndex
CREATE INDEX "Policy_effDate_idx" ON "Policy"("effDate");

-- CreateIndex
CREATE INDEX "Policy_carrierCode_idx" ON "Policy"("carrierCode");

-- CreateIndex
CREATE UNIQUE INDEX "Policy_polNumber_carrierCode_key" ON "Policy"("polNumber", "carrierCode");

-- CreateIndex
CREATE UNIQUE INDEX "Life_policyId_key" ON "Life"("policyId");

-- CreateIndex
CREATE UNIQUE INDEX "Annuity_policyId_key" ON "Annuity"("policyId");

-- CreateIndex
CREATE INDEX "Payout_annuityId_idx" ON "Payout"("annuityId");

-- CreateIndex
CREATE INDEX "Coverage_policyId_idx" ON "Coverage"("policyId");

-- CreateIndex
CREATE INDEX "Coverage_indicatorCode_idx" ON "Coverage"("indicatorCode");

-- CreateIndex
CREATE INDEX "LifeParticipant_coverageId_idx" ON "LifeParticipant"("coverageId");

-- CreateIndex
CREATE INDEX "LifeParticipant_partyId_idx" ON "LifeParticipant"("partyId");

-- CreateIndex
CREATE INDEX "CovOption_coverageId_idx" ON "CovOption"("coverageId");

-- CreateIndex
CREATE INDEX "Relation_originatingPartyId_idx" ON "Relation"("originatingPartyId");

-- CreateIndex
CREATE INDEX "Relation_originatingHoldingId_idx" ON "Relation"("originatingHoldingId");

-- CreateIndex
CREATE INDEX "Relation_relatedPartyId_idx" ON "Relation"("relatedPartyId");

-- CreateIndex
CREATE INDEX "Relation_relationRoleCode_idx" ON "Relation"("relationRoleCode");

-- CreateIndex
CREATE INDEX "Loan_holdingId_idx" ON "Loan"("holdingId");

-- CreateIndex
CREATE INDEX "Arrangement_holdingId_idx" ON "Arrangement"("holdingId");

-- CreateIndex
CREATE INDEX "RequirementInfo_policyId_idx" ON "RequirementInfo"("policyId");

-- CreateIndex
CREATE INDEX "RequirementInfo_reqStatus_idx" ON "RequirementInfo"("reqStatus");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationInfo_policyId_key" ON "ApplicationInfo"("policyId");

-- CreateIndex
CREATE INDEX "Claim_policyId_idx" ON "Claim"("policyId");

-- CreateIndex
CREATE INDEX "Claim_claimStatus_idx" ON "Claim"("claimStatus");

-- CreateIndex
CREATE INDEX "Attachment_partyId_idx" ON "Attachment"("partyId");

-- CreateIndex
CREATE INDEX "Attachment_holdingId_idx" ON "Attachment"("holdingId");

-- CreateIndex
CREATE INDEX "Activity_partyId_idx" ON "Activity"("partyId");

-- CreateIndex
CREATE INDEX "Activity_holdingId_idx" ON "Activity"("holdingId");

-- CreateIndex
CREATE INDEX "Activity_activityType_idx" ON "Activity"("activityType");

-- CreateIndex
CREATE INDEX "Activity_activityStatus_idx" ON "Activity"("activityStatus");

-- CreateIndex
CREATE INDEX "Activity_dueDate_idx" ON "Activity"("dueDate");

-- CreateIndex
CREATE INDEX "Activity_assignedTo_idx" ON "Activity"("assignedTo");

-- CreateIndex
CREATE INDEX "KeyedValue_entityType_entityId_idx" ON "KeyedValue"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "KeyedValue_keyName_idx" ON "KeyedValue"("keyName");

-- CreateIndex
CREATE UNIQUE INDEX "KeyedValue_entityType_entityId_keyName_vendorCode_key" ON "KeyedValue"("entityType", "entityId", "keyName", "vendorCode");

-- CreateIndex
CREATE INDEX "SystemMessage_entityType_entityId_idx" ON "SystemMessage"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "SystemMessage_isRead_idx" ON "SystemMessage"("isRead");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phone" ADD CONSTRAINT "Phone_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EMailAddress" ADD CONSTRAINT "EMailAddress_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employment" ADD CONSTRAINT "Employment_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producer" ADD CONSTRAINT "Producer_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Carrier" ADD CONSTRAINT "Carrier_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_holdingId_fkey" FOREIGN KEY ("holdingId") REFERENCES "Holding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Life" ADD CONSTRAINT "Life_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Annuity" ADD CONSTRAINT "Annuity_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_annuityId_fkey" FOREIGN KEY ("annuityId") REFERENCES "Annuity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coverage" ADD CONSTRAINT "Coverage_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifeParticipant" ADD CONSTRAINT "LifeParticipant_coverageId_fkey" FOREIGN KEY ("coverageId") REFERENCES "Coverage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CovOption" ADD CONSTRAINT "CovOption_coverageId_fkey" FOREIGN KEY ("coverageId") REFERENCES "Coverage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relation" ADD CONSTRAINT "Relation_originatingPartyId_fkey" FOREIGN KEY ("originatingPartyId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relation" ADD CONSTRAINT "Relation_originatingHoldingId_fkey" FOREIGN KEY ("originatingHoldingId") REFERENCES "Holding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relation" ADD CONSTRAINT "Relation_relatedPartyId_fkey" FOREIGN KEY ("relatedPartyId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_holdingId_fkey" FOREIGN KEY ("holdingId") REFERENCES "Holding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arrangement" ADD CONSTRAINT "Arrangement_holdingId_fkey" FOREIGN KEY ("holdingId") REFERENCES "Holding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequirementInfo" ADD CONSTRAINT "RequirementInfo_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationInfo" ADD CONSTRAINT "ApplicationInfo_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_holdingId_fkey" FOREIGN KEY ("holdingId") REFERENCES "Holding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_holdingId_fkey" FOREIGN KEY ("holdingId") REFERENCES "Holding"("id") ON DELETE SET NULL ON UPDATE CASCADE;
