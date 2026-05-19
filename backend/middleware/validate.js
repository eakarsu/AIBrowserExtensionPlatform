const Joi = require('joi');

/**
 * Returns an Express middleware that validates req.body against the given Joi schema.
 * Sends 400 with error details on failure.
 */
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message),
      });
    }
    req.body = value; // use cleaned/coerced value
    next();
  };
}

// ---- Auth Schemas ----

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Must be a valid email address',
    'any.required': 'email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'password is required',
  }),
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(1).max(100).required().messages({
    'any.required': 'name is required',
  }),
});

// ---- AI Route Schemas ----

const researchSchema = Joi.object({
  query: Joi.string().min(3).max(2000).required(),
});

const summarizeSchema = Joi.object({
  content: Joi.string().min(10).required(),
  url: Joi.string().uri().allow('', null).optional(),
});

const autofillSchema = Joi.object({
  formType: Joi.string().min(2).required(),
  fields: Joi.alternatives().try(Joi.string(), Joi.array()).required(),
});

const organizeTabsSchema = Joi.object({
  tabs: Joi.alternatives().try(Joi.string(), Joi.array()).required(),
});

const categorizeBookmarkSchema = Joi.object({
  title: Joi.string().min(1).required(),
  url: Joi.string().required(),
  description: Joi.string().allow('', null).optional(),
});

const passwordAnalyzeSchema = Joi.object({
  requirements: Joi.string().min(3).required(),
});

const adblockSchema = Joi.object({
  website: Joi.string().min(3).required(),
});

const translateSchema = Joi.object({
  text: Joi.string().min(1).required(),
  sourceLang: Joi.string().required(),
  targetLang: Joi.string().required(),
});

const annotateSchema = Joi.object({
  description: Joi.string().min(3).required(),
  context: Joi.string().allow('', null).optional(),
});

const generateEmailSchema = Joi.object({
  purpose: Joi.string().min(3).required(),
  tone: Joi.string().allow('', null).optional(),
  context: Joi.string().allow('', null).optional(),
});

const analyzePriceSchema = Joi.object({
  product: Joi.string().min(1).required(),
  currentPrice: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
  priceHistory: Joi.string().allow('', null).optional(),
});

const checkGrammarSchema = Joi.object({
  text: Joi.string().min(5).required(),
});

const generateCitationSchema = Joi.object({
  title: Joi.string().min(1).required(),
  authors: Joi.string().allow('', null).optional(),
  url: Joi.string().allow('', null).optional(),
  publicationDate: Joi.string().allow('', null).optional(),
  citationType: Joi.string().valid('APA', 'MLA', 'Chicago', 'IEEE', 'Harvard', 'Vancouver').default('APA'),
});

const readingSuggestSchema = Joi.object({
  interests: Joi.string().min(3).required(),
  currentList: Joi.string().allow('', null).optional(),
});

const darkModeSuggestSchema = Joi.object({
  website: Joi.string().min(3).required(),
  issues: Joi.string().allow('', null).optional(),
});

const privateAnalyzeSchema = Joi.object({
  content: Joi.string().min(5).max(50000).required(),
  analysis_type: Joi.string().valid('summarize', 'analyze', 'grammar', 'translate', 'default').default('default'),
});

const scanEmailSchema = Joi.object({
  subject: Joi.string().min(1).required(),
  sender: Joi.string().allow('', null).optional(),
  headers: Joi.string().allow('', null).optional(),
  body: Joi.string().allow('', null).optional(),
});

const analyzeInvoiceSchema = Joi.object({
  rawText: Joi.string().min(10).required(),
  knownVendors: Joi.string().allow('', null).optional(),
});

const summarizeMeetingSchema = Joi.object({
  transcript: Joi.string().min(20).required(),
  participants: Joi.string().allow('', null).optional(),
  title: Joi.string().allow('', null).optional(),
});

const explainCodeSchema = Joi.object({
  code: Joi.string().min(5).required(),
  language: Joi.string().allow('', null).optional(),
});

const enhanceResumeSchema = Joi.object({
  resumeText: Joi.string().min(50).required(),
  jobDescription: Joi.string().allow('', null).optional(),
  targetRole: Joi.string().allow('', null).optional(),
});

const reviewContractSchema = Joi.object({
  contractText: Joi.string().min(50).required(),
  contractType: Joi.string().allow('', null).optional(),
  partyName: Joi.string().allow('', null).optional(),
});

const validateHealthSchema = Joi.object({
  claimText: Joi.string().min(20).required(),
  sourceUrl: Joi.string().allow('', null).optional(),
});

const monitorCompetitorSchema = Joi.object({
  productName: Joi.string().min(1).required(),
  competitorName: Joi.string().allow('', null).optional(),
  ourPrice: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
  competitorPrice: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
  priceHistory: Joi.string().allow('', null).optional(),
});

module.exports = {
  validate,
  schemas: {
    login: loginSchema,
    register: registerSchema,
    research: researchSchema,
    summarize: summarizeSchema,
    autofill: autofillSchema,
    organizeTabs: organizeTabsSchema,
    categorizeBookmark: categorizeBookmarkSchema,
    passwordAnalyze: passwordAnalyzeSchema,
    adblock: adblockSchema,
    translate: translateSchema,
    annotate: annotateSchema,
    generateEmail: generateEmailSchema,
    analyzePrice: analyzePriceSchema,
    checkGrammar: checkGrammarSchema,
    generateCitation: generateCitationSchema,
    readingSuggest: readingSuggestSchema,
    darkModeSuggest: darkModeSuggestSchema,
    privateAnalyze: privateAnalyzeSchema,
    scanEmail: scanEmailSchema,
    analyzeInvoice: analyzeInvoiceSchema,
    summarizeMeeting: summarizeMeetingSchema,
    explainCode: explainCodeSchema,
    enhanceResume: enhanceResumeSchema,
    reviewContract: reviewContractSchema,
    validateHealth: validateHealthSchema,
    monitorCompetitor: monitorCompetitorSchema,
  },
};
