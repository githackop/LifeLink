import HospitalDonor from '../models/HospitalDonor.js';
import asyncHandler from '../utils/asyncHandler.js';
import { emitHospitalDonorAdded } from '../sockets/socketManager.js';

// ======================================
// GET HOSPITAL DONORS
// ======================================
export const getHospitalDonors = asyncHandler(async (req, res) => {
  const hospitalId = req.user._id;

  const donors = await HospitalDonor.find({ hospitalId })
    .populate('donorId', 'name email phoneNumber city bloodGroup')
    .sort({ lastDonationDate: -1 });

  const formatted = donors.map((d) => ({
    _id: d._id,

    // fallback for manual donors
    name: d.donorId?.name || d.name,
    email: d.donorId?.email || d.email,
    phoneNumber: d.donorId?.phoneNumber || d.phoneNumber,
    city: d.donorId?.city || d.city,

    bloodGroup: d.donorId?.bloodGroup || d.bloodGroup,

    totalDonations: d.totalDonations,
    lastDonationDate: d.lastDonationDate,

    donorType: d.donorId ? 'app' : 'manual',
  }));

  res.status(200).json({
    success: true,
    count: formatted.length,
    donors: formatted,
  });
});


// ======================================
// ADD MANUAL HOSPITAL DONOR
// ======================================
export const addManualHospitalDonor = asyncHandler(async (req, res) => {
  const hospitalId = req.user._id;

  const {
    name,
    phoneNumber,
    email,
    bloodGroup,
    city,
  } = req.body;

  // =========================
  // VALIDATION
  // =========================
  if (!name || !phoneNumber || !bloodGroup) {
    return res.status(400).json({
      success: false,
      message: 'Name, phone number, and blood group are required',
    });
  }

  // normalize data
  const cleanedPhone = phoneNumber.trim();

  // =========================
  // DUPLICATE CHECK (SAFE)
  // =========================
  const existingDonor = await HospitalDonor.findOne({
    hospitalId,
    phoneNumber: cleanedPhone,
  });

  if (existingDonor) {
    return res.status(400).json({
      success: false,
      message: 'Donor with this phone number already exists',
    });
  }

  // =========================
  // CREATE DONOR
  // =========================
  const donor = await HospitalDonor.create({
    hospitalId,
    name,
    phoneNumber: cleanedPhone,
    email,
    bloodGroup: bloodGroup.toUpperCase(),
    city,
    lastDonationDate: new Date(),
    totalDonations: 1,
    canContact: true,
  });

  // Trigger notification for directory addition
  await emitHospitalDonorAdded(hospitalId, name, bloodGroup.toUpperCase());

  // =========================
  // RESPONSE
  // =========================
  res.status(201).json({
    success: true,
    message: 'Manual donor added successfully',
    donor,
  });
});