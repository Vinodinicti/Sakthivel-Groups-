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

// Pre-seeded sample leads — Empty so only real form enquiries appear
const initialLeads = [];

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
  voiceCallStatus: { type: String, default: 'NOT_CALLED' }, // NOT_CALLED | CALLING | COMPLETED | FAILED
  siteVisitDateTime: String,
  customerConfirmedPlot: String,
  callTranscript: String,
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
      
      // Clean old sample leads from MongoDB if present
      await Enquiry.deleteMany({ id: { $in: ['ENQ-1001', 'ENQ-1002', 'ENQ-1003', 'ENQ-1004'] } });
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
    fs.writeFileSync(dbPath, JSON.stringify([], null, 2));
    return [];
  }
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    const parsed = JSON.parse(data) || [];
    return parsed.filter(l => !['ENQ-1001', 'ENQ-1002', 'ENQ-1003', 'ENQ-1004'].includes(l.id));
  } catch (err) {
    return [];
  }
}

function writeLocalDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Auto-Sync Local JSON Leads to MongoDB Atlas
async function syncLocalLeadsToMongo() {
  if (!isMongoConnected) return;
  try {
    const localLeads = readLocalDB();
    let syncedCount = 0;
    for (const lead of localLeads) {
      const existing = await Enquiry.findOne({ 
        $or: [
          { id: lead.id }, 
          { phone: lead.phone, customerName: lead.customerName }
        ] 
      });
      if (!existing) {
        const docToSave = { ...lead };
        delete docToSave._id;
        await Enquiry.create(docToSave);
        syncedCount++;
        console.log(`[MONGO AUTO-SYNC] Synced local lead to MongoDB: ${lead.customerName} (${lead.id})`);
      }
    }
    if (syncedCount > 0) {
      console.log(` Successfully auto-synced ${syncedCount} offline lead(s) into MongoDB Atlas!`);
    }
  } catch (err) {
    console.error('Error syncing local leads to MongoDB:', err.message);
  }
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
  const exists = localLeads.some(l => l.id === record.id);
  if (!exists) {
    localLeads.unshift(record);
    writeLocalDB(localLeads);
  }

  if (isMongoConnected) {
    try {
      const docToSave = { ...record };
      delete docToSave._id;
      await Enquiry.findOneAndUpdate(
        { id: record.id },
        { $set: docToSave },
        { upsert: true, returnDocument: 'after' }
      );
      console.log(`[MONGO SAVE SUCCESS] Upserted lead to MongoDB Atlas: ${record.customerName} (${record.id})`);
    } catch (e) {
      console.error('[MONGO SAVE ERROR]', e.message);
    }
  }
}

async function updateLeadStatusRecord(id, newStatus) {
  const localLeads = readLocalDB();
  const cleanId = (id || '').toString().trim();
  const cleanPhone = cleanId.replace(/[^0-9]/g, '').slice(-10);

  let updated = false;
  localLeads.forEach(l => {
    const lId = (l.id || '').toString().trim();
    const lPhone = (l.phone || '').replace(/[^0-9]/g, '').slice(-10);
    if (lId === cleanId || (cleanPhone && cleanPhone.length >= 7 && lPhone === cleanPhone)) {
      l.status = newStatus;
      l.isNew = false;
      updated = true;
    }
  });
  if (updated) {
    writeLocalDB(localLeads);
  }

  if (isMongoConnected) {
    try {
      await Enquiry.updateMany(
        { 
          $or: [
            { id: cleanId }, 
            { phone: cleanPhone ? new RegExp(cleanPhone + '$') : cleanId }
          ] 
        },
        { $set: { status: newStatus, isNew: false } }
      );
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

// Outbound Tamil Voice AI Agent Dispatcher — Calls Customer Directly
async function triggerTamilVoiceAlertToCustomer(lead) {
  const apiKey = process.env.SNAPSERVE_API_KEY;
  const agentId = process.env.SNAPSERVE_AGENT_ID;
  const rawPhone = lead.phone || process.env.ADMIN_PHONE_NUMBER;

  if (!apiKey || apiKey.includes('your_snapserve_api_key') || !agentId || !rawPhone || rawPhone === 'Not Provided') {
    console.log(`[VOICE AI SKIPPED] SnapServe API Key or Customer Phone Number missing for ${lead.customerName}`);
    return;
  }

  // Format phone number to E.164 (+91XXXXXXXXXX)
  let formattedPhone = (rawPhone || '').trim();
  const digitsOnly = formattedPhone.replace(/[^0-9]/g, '');
  if (digitsOnly.length === 10) {
    formattedPhone = `+91${digitsOnly}`;
  } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    formattedPhone = `+${digitsOnly}`;
  } else if (!formattedPhone.startsWith('+')) {
    formattedPhone = `+${digitsOnly}`;
  }

  const numericAgentId = !isNaN(Number(agentId)) ? Number(agentId) : agentId;

  try {
    console.log(`[VOICE AI DISPATCHING] Triggering Tamil AI Voice Call to CUSTOMER: ${formattedPhone} (${lead.customerName}) via Agent ID: ${numericAgentId}`);
    
    // Pass optimized, concise variables for low-latency Customer Call Script
    const firstName = (lead.customerName || "Customer").trim().split(' ')[0];
    const requestPayload = {
      agentId: numericAgentId,
      toNumber: formattedPhone,
      variables: {
        customer_name: firstName,
        project_name: lead.project || "VELS Layout",
        plot_number: lead.plotNumber || "General Enquiry",
        enquiry_id: lead.id
      }
    };

    console.log('[VOICE AI REQUEST PAYLOAD]', JSON.stringify(requestPayload));

    const response = await fetch('https://app.snapserve.ai/api/calls/outbound', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`[VOICE AI SUCCESS] Customer Call initiated! Call ID: ${data.id || data.callId || 'Initiated'}`);
      await updateLeadVoiceStatusRecord(lead.id, 'CALLING', null);
    } else {
      console.error(`[VOICE AI ERROR] SnapServe API returned status ${response.status}:`, JSON.stringify(data));
    }
  } catch (err) {
    console.error('[VOICE AI EXCEPTION] Failed to place outbound customer call:', err.message);
  }
}

// Helper to update Voice Call status and answers in DB automatically
async function updateLeadVoiceStatusRecord(id, voiceStatus, callData) {
  const localLeads = readLocalDB();
  const cleanId = (id || '').toString().trim();
  const cleanPhone = cleanId.replace(/[^0-9]/g, '').slice(-10);

  let matchFound = false;

  localLeads.forEach(l => {
    const lId = (l.id || '').toString().trim();
    const lPhone = (l.phone || '').replace(/[^0-9]/g, '').slice(-10);

    if (lId === cleanId || (cleanPhone && cleanPhone.length >= 7 && lPhone === cleanPhone)) {
      l.voiceCallStatus = voiceStatus;
      if (callData) {
        l.callTranscript = callData.transcript || l.callTranscript;
        l.siteVisitDateTime = callData.siteVisitDateTime || l.siteVisitDateTime;
        l.customerConfirmedPlot = callData.customerConfirmedPlot || l.customerConfirmedPlot;
        if (l.status !== 'READ' && l.status !== 'CONTACTED') {
          l.status = 'NEW';
          l.isNew = true;
        }
      }
      matchFound = true;
    }
  });

  if (matchFound) {
    writeLocalDB(localLeads);
    console.log(`[DB AUTO-UPDATE] Updated voice call status & site visit details for Lead ID/Phone: ${cleanId}`);
  }

  if (isMongoConnected) {
    try {
      const updateDoc = { voiceCallStatus: voiceStatus };
      if (callData) {
        if (callData.transcript) updateDoc.callTranscript = callData.transcript;
        if (callData.siteVisitDateTime) updateDoc.siteVisitDateTime = callData.siteVisitDateTime;
        if (callData.customerConfirmedPlot) updateDoc.customerConfirmedPlot = callData.customerConfirmedPlot;
      }

      // Update strictly by ID if cleanId matches ENQ-format, or update the most recent matching record by phone
      if (cleanId.startsWith('ENQ-')) {
        await Enquiry.updateOne({ id: cleanId }, { $set: updateDoc });
      } else if (cleanPhone) {
        await Enquiry.updateOne(
          { phone: new RegExp(cleanPhone + '$') },
          { $set: updateDoc },
          { sort: { createdAt: -1 } }
        );
      }
      console.log(`[MONGO AUTO-UPDATE] Updated MongoDB Atlas for Lead: ${cleanId}`);
    } catch (e) {
      console.error('MongoDB update voice status error:', e.message);
    }
  }
}

async function generateUniqueEnquiryId() {
  const leads = await fetchAllLeads();
  let maxNum = 1000;
  leads.forEach(l => {
    const num = parseInt((l.id || '').replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num) && num > maxNum) maxNum = num;
  });
  return `ENQ-${maxNum + 1}`;
}

// REST API Endpoints

app.post('/api/enquiries', async (req, res) => {
  try {
    const body = req.body || {};
    const newId = await generateUniqueEnquiryId();

    const leadData = {
      id: newId,
      customerName: body.customerName || body.name || 'Anonymous Prospect',
      phone: body.phone || body.mobile || 'Not Provided',
      email: body.email || 'Not Provided',
      project: body.project || body.area || body.location || 'General VELS Layouts',
      plotNumber: body.plotNumber || body.plotNo || body.selectedPlot || 'General Layout Enquiry',
      budget: body.budget || '₹ 25.00 - 35.00 Lakhs',
      timeline: body.timeline || 'Immediate (Within 15 Days)',
      paymentMode: body.paymentMode || 'Bank Loan / Self Funded',
      siteVisitRequested: body.siteVisitRequested === true || body.siteVisit === 'yes' || true,
      message: body.message || body.description || 'Interested in layout plots.',
      status: 'NEW',
      isNew: true,
      voiceCallStatus: 'NOT_CALLED',
      siteVisitDateTime: '',
      customerConfirmedPlot: '',
      callTranscript: '',
      createdAt: new Date().toISOString()
    };

    const aiEvaluation = evaluateLeadWithAI(leadData);

    const completeRecord = {
      ...leadData,
      ...aiEvaluation
    };

    await saveLeadRecord(completeRecord);

    console.log(`[AI AGENT] New Enquiry Evaluated: ${completeRecord.customerName} -> ${completeRecord.aiPriority} (${completeRecord.aiScore}/100)`);

    // Dispatch Outbound Tamil Voice AI Agent to Customer
    triggerTamilVoiceAlertToCustomer(completeRecord);

    res.status(201).json({
      success: true,
      message: 'Enquiry received. AI Customer Voice Verification call triggered!',
      lead: completeRecord
    });
  } catch (err) {
    console.error('Error processing enquiry:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Helper to extract the actual spoken site visit date & time from call payload or transcript/memory
function extractSpokenTimeFromCall(data) {
  if (data.dispositionResult?.site_visit_time) return data.dispositionResult.site_visit_time;
  if (data.variables?.site_visit_time) return data.variables.site_visit_time;
  if (data.site_visit_time) return data.site_visit_time;
  if (data.siteVisitDateTime) return data.siteVisitDateTime;

  const fullText = (data.callerMemory || data.transcript || data.callSummary || '').toString();

  // Match month date & time patterns e.g. "October 1st at 01:30 pm", "Oct 1st at 1:30 PM"
  const monthDateMatch = fullText.match(/(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s+\d+(st|nd|rd|th)?\s*(at\s*\d{1,2}(:\d{2})?\s*(am|pm)?)?/i);
  if (monthDateMatch && monthDateMatch[0]) {
    return monthDateMatch[0].trim();
  }

  // Match English day/time patterns e.g. "today at 12 PM", "Tomorrow at 3:30 PM"
  const match = fullText.match(/(tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday)?\s*(at\s*)?(\d{1,2}(:\d{2})?\s*(am|pm)?)/i);
  if (match && match[0] && match[0].trim().length > 3) {
    return match[0].trim();
  }

  if (fullText.includes('நாளைக்கு') || fullText.includes('tomorrow')) {
    return 'Tomorrow (Spoken on Call)';
  }

  return 'Confirmed on Call';
}

// Background Auto-Poller: Syncs completed calls directly from SnapServe API to MongoDB Atlas
async function syncSnapServeCallsWithMongo() {
  const apiKey = process.env.SNAPSERVE_API_KEY;
  const agentId = process.env.SNAPSERVE_AGENT_ID;
  if (!apiKey || !agentId || apiKey.includes('your_snapserve_api_key')) return;

  try {
    const res = await fetch(`https://app.snapserve.ai/api/calls?agentId=${agentId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    if (!res.ok) return;

    const data = await res.json();
    const calls = Array.isArray(data) ? data : (data.calls || data.data || []);

    for (const call of calls) {
      if (call.status === 'completed' || call.status === 'ended') {
        const rawPhone = call.toNumber || call.caller || call.phone;
        const memory = call.callerMemory || call.callSummary || call.transcript || '';
        const siteVisitTime = extractSpokenTimeFromCall({ callerMemory: memory, transcript: memory, callSummary: memory });
        const callTimeMs = call.startedAt || call.createdAt ? new Date(call.startedAt || call.createdAt).getTime() : 0;
        
        let targetPlot = 'Coimbatore Plot';
        let enquiryIdFromMeta = null;
        try {
          if (call.metadata) {
            const meta = typeof call.metadata === 'string' ? JSON.parse(call.metadata) : call.metadata;
            targetPlot = meta.callVariables?.plot_number || targetPlot;
            enquiryIdFromMeta = meta.callVariables?.enquiry_id || meta.enquiry_id || null;
          }
        } catch (e) {}

        const targetIdentifier = enquiryIdFromMeta || rawPhone;

        if (targetIdentifier) {
          // Verify that lead exists and call occurred after lead creation (if matching by phone)
          if (!enquiryIdFromMeta && rawPhone) {
            const leads = await fetchAllLeads();
            const cleanP = rawPhone.replace(/[^0-9]/g, '').slice(-10);
            const matchingLead = leads.find(l => (l.phone || '').replace(/[^0-9]/g, '').slice(-10) === cleanP);
            if (matchingLead && matchingLead.createdAt) {
              const leadCreatedMs = new Date(matchingLead.createdAt).getTime();
              if (callTimeMs > 0 && callTimeMs < leadCreatedMs - 60000) {
                // Call occurred before lead creation — skip attaching old call memory!
                continue;
              }
            }
          }

          await updateLeadVoiceStatusRecord(targetIdentifier, 'COMPLETED', {
            transcript: memory,
            siteVisitDateTime: siteVisitTime,
            customerConfirmedPlot: targetPlot
          });
        }
      }
    }
  } catch (err) {
    // Silent fail if network unreachable
  }
}

// Start background SnapServe Call Sync interval (Runs every 8 seconds)
setInterval(syncSnapServeCallsWithMongo, 8000);
syncSnapServeCallsWithMongo();

// Webhook endpoint called when SnapServe / n8n completes the AI Customer Voice Call
app.post('/api/webhooks/customer-call-completed', async (req, res) => {
  try {
    const payload = req.body || {};
    const data = payload.data || payload;

    const enquiryId = data.variables?.enquiry_id || data.enquiry_id;
    const phone = data.toNumber || data.caller || data.phone;
    const transcript = data.callerMemory || data.transcript || data.callSummary || 'Call completed in Tamil.';
    const siteVisitDateTime = extractSpokenTimeFromCall(data);
    const customerConfirmedPlot = data.dispositionResult?.plot_number || data.variables?.plot_number || data.plotNumber || 'Coimbatore Plot';

    console.log(`[CUSTOMER VOICE CALL COMPLETED] Enquiry: ${enquiryId || phone}`);
    console.log(`Extracted Spoken Site Visit Time: "${siteVisitDateTime}"`);
    console.log(`Caller Memory: "${transcript}"`);

    const targetId = enquiryId || phone;
    if (targetId) {
      await updateLeadVoiceStatusRecord(targetId, 'COMPLETED', {
        transcript,
        siteVisitDateTime,
        customerConfirmedPlot
      });
    }

    res.json({ success: true, message: 'Customer Voice Call details updated in VELS Database.' });
  } catch (err) {
    console.error('Error processing customer voice webhook:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Route to Simulate/Trigger Customer AI Voice Call for testing
app.post('/api/admin/simulate-customer-call/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { siteVisitDateTime, customerConfirmedPlot, sampleTranscript } = req.body || {};

    const mockTranscript = sampleTranscript || 
      `AI: வணக்கம்! VELS Groups-ல இருந்து பேசுறோம். நீங்க plot enquiry submit பண்ணிருந்தீங்க. Site visit வர விருப்பமா?
Customer: ஆமாங்க, நாளைக்கு மதியம் 3 மணிக்கு வரலாம்னு இருக்கேன். Corner Plot P-115 details வேணும்.
AI: சரிங்க, நாளைக்கு மதியம் 3 மணிக்கு site visit confirm பண்ணியாச்சு. நன்றி!`;

    await updateLeadVoiceStatusRecord(id, 'COMPLETED', {
      transcript: mockTranscript,
      siteVisitDateTime: siteVisitDateTime || 'Tomorrow at 3:00 PM',
      customerConfirmedPlot: customerConfirmedPlot || 'Plot P-115 (40 FT Boulevard)'
    });

    console.log(`[SIMULATED CUSTOMER CALL] Updated Enquiry ${id} with Voice Call Completion details.`);

    res.json({
      success: true,
      message: `Simulated Customer AI Call completed for Enquiry ${id}. VELS Database & Admin Dashboard updated!`,
      siteVisitDateTime: siteVisitDateTime || 'Tomorrow at 3:00 PM',
      customerConfirmedPlot: customerConfirmedPlot || 'Plot P-115 (40 FT Boulevard)'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
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

app.delete('/api/admin/enquiries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = (id || '').toString().trim();

    // 1. Delete strictly single lead by ID from local JSON database
    const localLeads = readLocalDB();
    const filteredLocal = localLeads.filter(l => (l.id || '').toString().trim() !== cleanId);
    writeLocalDB(filteredLocal);

    // 2. Delete strictly single lead by ID from MongoDB Atlas
    if (isMongoConnected) {
      const deleteResult = await Enquiry.deleteOne({ id: cleanId });
      console.log(`[MONGO DELETE SUCCESS] Deleted single lead ${cleanId} from MongoDB Atlas. Count deleted: ${deleteResult.deletedCount}`);
    }

    res.json({ success: true, message: `Lead ${cleanId} deleted successfully.` });
  } catch (err) {
    console.error('Error deleting lead:', err);
    res.status(500).json({ success: false, error: err.message });
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

const server = app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` Sakthivel Groups VELS Server & AI Agent Running!`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` Admin Portal: http://localhost:${PORT}/admin.html`);
  console.log(`===================================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const fallbackPort = Number(PORT) + 1;
    console.log(`\n[PORT BUSY] Port ${PORT} is currently in use. Attempting fallback on port ${fallbackPort}...`);
    app.listen(fallbackPort, () => {
      console.log(`===================================================`);
      console.log(` Sakthivel Groups VELS Server Running on Fallback Port!`);
      console.log(` URL: http://localhost:${fallbackPort}`);
      console.log(` Admin Portal: http://localhost:${fallbackPort}/admin.html`);
      console.log(`===================================================`);
    });
  } else {
    console.error('Server error:', err);
  }
});
