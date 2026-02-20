
const express = require('express');


const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRouter');
const placementRoutes = require('./routes/placementRoutes');
const certificationRoutes = require('./routes/certificationRoutes');
const topCorporateRoutes = require('./routes/topCorporateRoutes');
const adminMiddleware = require('./middleware/adminMiddleware');
const authMiddleware = require('./middleware/authMiddleware');

console.log('✅ All route imports successful');
console.log('  authRoutes:', typeof authRoutes);
console.log('  jobRoutes:', typeof jobRoutes);
console.log('  applicationRoutes:', typeof applicationRoutes);
console.log('  placementRoutes:', typeof placementRoutes);
console.log('  certificationRoutes:', typeof certificationRoutes);
console.log('  topCorporateRoutes:', typeof topCorporateRoutes);
console.log('  adminMiddleware:', typeof adminMiddleware);


const User = require('./models/user');
const Job = require('./models/Job');
const Application = require('./models/Application');
const Placement = require('./models/Placement');
const TopCorporate = require('./models/TopCorporate');
const Certification = require('./models/certification');

console.log('✅ All models loaded');
console.log('  Placement paths:', Object.keys(Placement.schema.paths).join(', '));
console.log('  Certification paths:', Object.keys(Certification.schema.paths).join(', '));
console.log('  Application timestamps:', !!Application.schema.options.timestamps);


function getRoutePaths(router) {
  return router.stack
    .filter(r => r.route)
    .map(r => Object.keys(r.route.methods).join(',').toUpperCase() + ' ' + r.route.path);
}

console.log('\n✅ Route paths:');
console.log('  authRoutes:', getRoutePaths(authRoutes));
console.log('  jobRoutes:', getRoutePaths(jobRoutes));
console.log('  applicationRoutes:', getRoutePaths(applicationRoutes));
console.log('  placementRoutes:', getRoutePaths(placementRoutes));
console.log('  certificationRoutes:', getRoutePaths(certificationRoutes));
console.log('  topCorporateRoutes:', getRoutePaths(topCorporateRoutes));

console.log('\n✅ All verification checks passed!');
process.exit(0);
