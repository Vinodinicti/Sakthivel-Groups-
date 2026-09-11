require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files (HTML, CSS, JS, Images)
app.use(express.static(path.join(__dirname)));

// Ensure data directory exists for JSON fallback
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'enquiries.json');

// Pre-seeded sample leads
const initialLeads = [
  {
    id: 'ENQ-1001',
    customerName: 'Rajan Sundaram',
    phone: '+91 98422 10542',
    email: 'rajan.sundaram@gmail.com',
    project: 'VELS Golden Vistas Pollachi',
    plotNumber: 'Plot P-115 (40 FT Boulevard)',
    budget: '₹ 25.00 - 30.00 Lakhs',
    timeline: 'Immediate (Within 7 Days)',
    paymentMode: 'Pre-Approved Bank Loan',
    siteVisitRequested: true,
    message: 'Need site visit cab pick-up tomorrow afternoon with family. Want to finalize 40ft corner plot.',
    aiPriority: 'HOT',
    aiScore: 98,
    aiSummary: 'URGENT BUYER: Pre-approved bank loan, requested site visit tomorrow for corner plot P-115.',
    recommendedAction: 'Call within 15 mins — Confirm site visit cab pick-up and reserve Plot P-115.',
    status: 'NEW',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString()
  },
  {
    id: 'ENQ-1002',
    customerName: 'Kavitha Mahalingam',
    phone: '+91 94431 88920',
    email: 'kavitha.m@yahoo.com',
    project: 'VELS Heritage Coimbatore Airport',
    plotNumber: 'Plot C-142 (30 FT Avenue)',
    budget: '₹ 28.00 - 35.00 Lakhs',
    timeline: 'Within 30 Days',
    paymentMode: 'Self-Funded / Cash',
    siteVisitRequested: true,
    message: 'Looking for DTCP approved villa plot near Hope College main road. Interested in site inspection this Saturday.',
    aiPriority: 'HOT',
    aiScore: 88,
    aiSummary: 'HIGH INTENT: Self-funded cash buyer requesting Saturday site visit near Airport Corridor.',
    recommendedAction: 'Call today to arrange Saturday site inspection and share DTCP approval documents.',
    status: 'CONTACTED',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  },
  {
    id: 'ENQ-1003',
    customerName: 'Prakash Ramasamy',
    phone: '+91 99945 33019',
    email: 'prakash.ram@outlook.com',
    project: 'VELS ECR Bay Vistas Chennai',
    plotNumber: 'General Layout Enquiry',
    budget: '₹ 40.00 - 50.00 Lakhs',
    timeline: 'Within 60 Days',
    paymentMode: 'Applying for Bank Loan',
    siteVisitRequested: false,
    message: 'Please send ECR layout masterplan PDF and current square foot rates.',
    aiPriority: 'WARM',
    aiScore: 68,
    aiSummary: 'WARM LEAD: High budget ECR inquiry. Requested PDF masterplan & square foot rate chart.',
    recommendedAction: 'Send WhatsApp PDF brochure + Follow up within 24 hours regarding bank loan options.',
    status: 'NEW',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString()
  },
  {
    id: 'ENQ-1004',
    customerName: 'Suresh Kumar',
    phone: '+91 97890 12345',
    email: 'suresh.k@gmail.com',
    project: 'VELS Temple City Madurai',
    plotNumber: 'Plot M-108',
    budget: 'Under ₹ 20.00 Lakhs',
    timeline: 'Planning in 6+ Months',
    paymentMode: 'Undecided',
    siteVisitRequested: false,
    message: 'Just checking future layout options near AIIMS corridor.',
    aiPriority: 'COLD',
    aiScore: 35,
    aiSummary: 'COLD LEAD: Long-term timeline (>6 months) with low budget threshold.',
    recommendedAction: 'Add to monthly email newsletter drip campaign for upcoming layout launches.',
    status: 'NEW',
    createdAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString()
  }
];

// Mongoose Schema Definition
const enquirySchema = new mongoose.Schema({
  id: { type: String, unique: true },
  customerName: String,
  phone: String,
  email: String,
  project: String,
  plotNumber: String,
  budget: String,
  timeline: String,
  paymentMode: String,
  siteVisitRequested: Boolean,
  message: String,
  aiPriority: String,
  aiScore: Number,
  aiSummary: String,
  recommendedAction: String,
  status: { type: String, default: 'NEW' },
  createdAt: { type: String }
});

const Enquiry = mongoose.model('Enquiry', enquirySchema);

let isMongoConnected = false;

// Connect to MongoDB Atlas if URI is valid and password placeholder is replaced
const mongoURI = process.env.MONGODB_URI || '';
if (mongoURI && !mongoURI.includes('<db_password>') && !mongoURI.includes('<password>')) {
  mongoose.connect(mongoURI)
    .then(async () => {
      isMongoConnected = true;
      console.log(' Successfully connected to MongoDB Atlas!');
      
      // Seed database if empty
      const count = await Enquiry.countDocuments();
      if (count === 0) {
        await Enquiry.insertMany(initialLeads);
        console.log(' MongoDB seeded with initial enquiries.');
      }
    })
    .catch(err => {
      console.error(' MongoDB Atlas Connection Error:', err.message);
      console.log(' Falling back to local JSON file database.');
      isMongoConnected = false;
    });
} else {
  console.log(' MongoDB URI contains placeholder password or is missing. Using local JSON database (data/enquiries.json).');
}

// Local JSON File Database Helpers
function readLocalDB() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(initialLeads, null, 2));
    return initialLeads;
  }
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return initialLeads;
  }
}

function writeLocalDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Unified Database Access Functions
async function fetchAllLeads() {
  if (isMongoConnected) {
    try {
      const docs = await Enquiry.find({}).lean();
      return docs;
    } catch (e) {
      console.error('MongoDB fetch error, falling back to local:', e.message);
    }
  }
  return readLocalDB();
}

async function saveLeadRecord(record) {
  const localLeads = readLocalDB();
  localLeads.unshift(record);
  writeLocalDB(localLeads);

  if (isMongoConnected) {
    try {
      const newDoc = new Enquiry(record);
      await newDoc.save();
    } catch (e) {
      console.error('MongoDB save error:', e.message);
    }
  }
}

async function updateLeadStatusRecord(id, newStatus) {
  const localLeads = readLocalDB();
  const idx = localLeads.findIndex(l => l.id === id);
  if (idx !== -1) {
    localLeads[idx].status = newStatus;
    writeLocalDB(localLeads);
  }

  if (isMongoConnected) {
    try {
      await Enquiry.findOneAndUpdate({ id: id }, { status: newStatus });
    } catch (e) {
      console.error('MongoDB update status error:', e.message);
    }
  }
}

async function resetDBRecords() {
  writeLocalDB(initialLeads);
  if (isMongoConnected) {
    try {
      await Enquiry.deleteMany({});
      await Enquiry.insertMany(initialLeads);
    } catch (e) {
      console.error('MongoDB reset error:', e.message);
    }
  }
}

// Autonomous AI Lead Evaluator
function evaluateLeadWithAI(lead) {
  let score = 30;
  let signals = [];

  const text = (lead.message || '').toLowerCase() + ' ' + (lead.timeline || '').toLowerCase() + ' ' + (lead.paymentMode || '').toLowerCase();

  if (lead.siteVisitRequested || text.includes('site visit') || text.includes('visit') || text.includes('cab') || text.includes('inspection') || text.includes('tomorrow') || text.includes('saturday') || text.includes('sunday')) {
    score += 30;
    signals.push('Immediate Site Visit Requested');
  }

  if (text.includes('pre-approved') || text.includes('cash') || text.includes('ready money') || text.includes('self-funded') || text.includes('token') || text.includes('advance')) {
    score += 25;
    signals.push('High Financial Readiness / Pre-Approved Funds');
  } else if (text.includes('loan') || text.includes('bank')) {
    score += 15;
    signals.push('Bank Financing Required');
  }

  if (text.includes('immediate') || text.includes('7 days') || text.includes('10 days') || text.includes('this week') || text.includes('today')) {
    score += 20;
    signals.push('Immediate Registration Timeline (<15 days)');
  } else if (text.includes('30 days') || text.includes('this month')) {
    score += 12;
    signals.push('30-Day Purchase Horizon');
  }

  if (lead.plotNumber && lead.plotNumber.trim() !== '' && lead.plotNumber.toLowerCase() !== 'general layout enquiry') {
    score += 15;
    signals.push(`Specific Plot Target: ${lead.plotNumber}`);
  } else if (text.includes('corner') || text.includes('boulevard') || text.includes('east facing')) {
    score += 10;
    signals.push('Specific Facing / Corner Plot Requested');
  }

  score = Math.min(100, Math.max(10, score));

  let priority = 'COLD';
  if (score >= 80) {
    priority = 'HOT';
  } else if (score >= 50) {
    priority = 'WARM';
  }

  let summary = '';
  let action = '';

  if (priority === 'HOT') {
    summary = `URGENT BUYER (${score}/100): ${signals.join(' • ')}`;
    action = `CALL IMMEDIATELY (Within 15 mins) — Confirm site visit & reserve target plot.`;
  } else if (priority === 'WARM') {
    summary = `WARM PROSPECT (${score}/100): ${signals.join(' • ')}`;
    action = `Follow up within 24 hours — Share layout PDF brochure & bank loan options.`;
  } else {
    summary = `COLD / FUTURE PROSPECT (${score}/100): Early research phase enquiry.`;
    action = `Add to automated layout launch nurture campaign.`;
  }

  return {
    aiPriority: priority,
    aiScore: score,
    aiSummary: summary,
    recommendedAction: action
  };
}

// REST API Endpoints

app.post('/api/enquiries', async (req, res) => {
  try {
    const body = req.body || {};
    const leads = await fetchAllLeads();
    const newId = `ENQ-${1000 + leads.length + 1}`;

    const leadData = {
      id: newId,
      customerName: body.customerName || body.name || 'Anonymous Prospect',
      phone: body.phone || body.mobile || 'Not Provided',
      email: body.email || 'Not Provided',
      project: body.project || 'General VELS Layouts',
      plotNumber: body.plotNumber || body.selectedPlot || 'General Layout Enquiry',
      budget: body.budget || '₹ 25.00 - 35.00 Lakhs',
      timeline: body.timeline || 'Within 30 Days',
      paymentMode: body.paymentMode || 'Bank Loan / Self Funded',
      siteVisitRequested: body.siteVisitRequested === true || body.siteVisit === 'yes' || false,
      message: body.message || 'Interested in layout plots.',
      status: 'NEW',
      createdAt: new Date().toISOString()
    };

    const aiEvaluation = evaluateLeadWithAI(leadData);

    const completeRecord = {
      ...leadData,
      ...aiEvaluation
    };

    await saveLeadRecord(completeRecord);

    console.log(`[AI AGENT] New Enquiry Evaluated: ${completeRecord.customerName} -> ${completeRecord.aiPriority} (${completeRecord.aiScore}/100)`);

    res.status(201).json({
      success: true,
      message: 'Enquiry received and AI Lead Evaluation complete.',
      lead: completeRecord
    });
  } catch (err) {
    console.error('Error processing enquiry:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.get('/api/admin/enquiries', async (req, res) => {
  try {
    const leads = await fetchAllLeads();
    leads.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));

    const counts = {
      hot: leads.filter(l => l.aiPriority === 'HOT').length,
      hotNew: leads.filter(l => l.aiPriority === 'HOT' && (l.status === 'NEW' || l.isNew)).length,
      warm: leads.filter(l => l.aiPriority === 'WARM').length,
      warmNew: leads.filter(l => l.aiPriority === 'WARM' && (l.status === 'NEW' || l.isNew)).length,
      cold: leads.filter(l => l.aiPriority === 'COLD').length,
      coldNew: leads.filter(l => l.aiPriority === 'COLD' && (l.status === 'NEW' || l.isNew)).length,
      total: leads.length,
      totalNew: leads.filter(l => l.status === 'NEW' || l.isNew).length,
      topScore: leads.length > 0 ? (leads[0].aiScore || 0) : 0
    };

    res.json({
      success: true,
      counts,
      leads
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch enquiries' });
  }
});

app.put('/api/admin/enquiries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await updateLeadStatusRecord(id, status);
    res.json({ success: true, message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update lead' });
  }
});

app.post('/api/admin/reset', async (req, res) => {
  await resetDBRecords();
  res.json({ success: true, message: 'Database reset to initial leads.' });
});

app.get('/api/admin/enquiries/download', async (req, res) => {
  try {
    const leads = await fetchAllLeads();
    const headers = ['ID', 'Customer Name', 'Phone', 'Email', 'Project Location', 'Target Plot', 'Budget', 'Timeline', 'Purpose', 'AI Priority', 'AI Score', 'Date'];
    
    const rows = leads.map(l => [
      `"${l.id || ''}"`,
      `"${(l.customerName || l.name || '').replace(/"/g, '""')}"`,
      `"${l.phone || ''}"`,
      `"${l.email || ''}"`,
      `"${(l.project || l.location || '').replace(/"/g, '""')}"`,
      `"${(l.plotNumber || l.plot || '').replace(/"/g, '""')}"`,
      `"${(l.budget || '').replace(/"/g, '""')}"`,
      `"${(l.timeline || '').replace(/"/g, '""')}"`,
      `"${(l.paymentMode || l.purpose || '').replace(/"/g, '""')}"`,
      `"${l.aiPriority || l.category || ''}"`,
      `"${l.aiScore || l.score || ''}"`,
      `"${l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-IN') : 'Today'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="VELS_Client_Enquiries.csv"');
    res.status(200).send(csvContent);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to generate download.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` Sakthivel Groups VELS Server & AI Agent Running!`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` Admin Portal: http://localhost:${PORT}/admin.html`);
  console.log(`===================================================`);
});
