/**
 * End-to-End Verification of Security & Functional Fixes
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000/api/v1';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const parsed = new URL(url);

  return new Promise((resolve, reject) => {
    const headers = options.headers || {};
    let reqBody = options.body;
    if (reqBody && typeof reqBody === 'object' && !(reqBody instanceof Buffer)) {
      reqBody = JSON.stringify(reqBody);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(reqBody);
    }

    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: options.method || 'GET',
        headers
      },
      (res) => {
        const chunks = [];
        res.on('data', (d) => chunks.push(d));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          const text = buffer.toString('utf8');
          let json = null;
          try {
            json = JSON.parse(text);
          } catch (e) {}

          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: json || text
          });
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (reqBody) req.write(reqBody);
    req.end();
  });
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

async function run() {
  console.log('=== VERIFYING ARCHVIZON SECURITY & FUNCTIONAL FIXES ===\n');

  // Step 1: Login Admin and Client
  console.log('1. Authenticating test users...');
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'admin@archvizon.com', password: 'Password123!' }
  });
  assert(adminLogin.status === 200, 'Admin login succeeded');
  const adminToken = adminLogin.body.data.token;

  const clientLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'client@developer.com', password: 'Password123!' }
  });
  assert(clientLogin.status === 200, 'Client login succeeded');
  const clientToken = clientLogin.body.data.token;
  const clientId = clientLogin.body.data.user._id;

  // Register a secondary client to test cross-client isolation & IDOR
  const secondClientEmail = `client2_${Date.now()}@example.com`;
  const registerRes = await request('/auth/register', {
    method: 'POST',
    body: {
      name: 'Secondary Client',
      email: secondClientEmail,
      password: 'Password123!',
      organization: 'Other Org'
    }
  });
  assert(registerRes.status === 201, 'Secondary client registered');
  const client2Token = registerRes.body.data.token;
  const client2Id = registerRes.body.data.user._id;

  // Step 2: Test Regex Injection / ReDoS Safety
  console.log('\n2. Testing Regex Special Characters & Crash Safety...');
  const dangerousSearch = '?search=[' + encodeURIComponent('(*+?\\^$');
  const projectSearchRes = await request(`/projects${dangerousSearch}`, {
    headers: { Authorization: `Bearer ${clientToken}` }
  });
  assert(projectSearchRes.status === 200, 'Project search with unescaped regex metacharacters does not crash');

  const catalogSearchRes = await request(`/catalog/assets${dangerousSearch}`, {
    headers: { Authorization: `Bearer ${clientToken}` }
  });
  assert(catalogSearchRes.status === 200, 'Catalog asset search with unescaped regex metacharacters does not crash');

  const userSearchRes = await request(`/users${dangerousSearch}`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(userSearchRes.status === 200, 'User search with unescaped regex metacharacters does not crash');

  // Step 3: Project Creation & Auto-Default Service & Submission
  console.log('\n3. Testing Project Creation with Default Service & Submission...');
  const createProjRes = await request('/projects', {
    method: 'POST',
    headers: { Authorization: `Bearer ${clientToken}` },
    body: {
      name: 'Automated Test Villa',
      description: 'Project to test submission flow',
      propertyType: 'RESIDENTIAL',
      template: 'EMPTY'
    }
  });
  assert(createProjRes.status === 201, 'Project created via API');
  const projectId = createProjRes.body.data.project._id;
  const servicesCreated = createProjRes.body.data.services;
  assert(Array.isArray(servicesCreated) && servicesCreated.length > 0, 'Default visualization service automatically created');

  // Client submits brief
  const submitRes = await request(`/projects/${projectId}/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${clientToken}` }
  });
  assert(submitRes.status === 200, 'Project brief submission succeeded (status -> SUBMITTED)');
  const submittedStatus = submitRes.body.data?.status || submitRes.body.data?.project?.status;
  assert(submittedStatus === 'SUBMITTED', 'Project status is SUBMITTED');

  // Step 4: IDOR Protection on updateThumbnail
  console.log('\n4. Testing IDOR Protection on updateThumbnail...');
  // Client 2 attempts to update Client 1's project thumbnail
  const idorRes = await request(`/projects/${projectId}/thumbnail`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${client2Token}` },
    body: { thumbnailUrl: 'https://evil.com/hacked.jpg' }
  });
  assert(idorRes.status === 403, 'Unauthorized client blocked from modifying project thumbnail (HTTP 403 Forbidden)');

  // Legitimate client updates their own project thumbnail
  const validThumbRes = await request(`/projects/${projectId}/thumbnail`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${clientToken}` },
    body: { thumbnailUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==' }
  });
  assert(validThumbRes.status === 200, 'Project owner can successfully update project thumbnail');

  // Step 5: User Management (Role updating & Account Status Suspension)
  console.log('\n5. Testing User Management (Role update & Status Suspension)...');
  // Invalid role rejected
  const invalidRoleRes = await request(`/users/${client2Id}/role`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { role: 'SUPER_HACKER' }
  });
  assert(invalidRoleRes.status === 400, 'Invalid user role rejected with HTTP 400 Bad Request');

  // Admin suspends user
  const suspendRes = await request(`/users/${client2Id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { status: 'SUSPENDED' }
  });
  assert(suspendRes.status === 200, 'Admin can suspend user account');
  assert(suspendRes.body.data.user.accountStatus === 'SUSPENDED', 'User accountStatus is SUSPENDED');

  // Suspended user tries to login -> 403 Forbidden
  const suspendedLoginRes = await request('/auth/login', {
    method: 'POST',
    body: { email: secondClientEmail, password: 'Password123!' }
  });
  assert(suspendedLoginRes.status === 403, 'Suspended user blocked from logging in (HTTP 403 Forbidden)');

  // Admin reactivates user account
  const reactivateRes = await request(`/users/${client2Id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { status: 'ACTIVE' }
  });
  assert(reactivateRes.status === 200, 'Admin can reactivate user account');

  const reactivatedLoginRes = await request('/auth/login', {
    method: 'POST',
    body: { email: secondClientEmail, password: 'Password123!' }
  });
  assert(reactivatedLoginRes.status === 200, 'Reactivated user can log in normally');

  // Step 6: Render Job Enum Contract Verification
  console.log('\n6. Testing Render Studio Enum Contract (1080P, TWILIGHT, WIDE)...');
  const renderJobRes = await request('/renders/jobs', {
    method: 'POST',
    headers: { Authorization: `Bearer ${clientToken}` },
    body: {
      projectId,
      cameraPreset: 'WIDE',
      lightingScenario: 'TWILIGHT',
      resolution: '1080P',
      quality: 'PRODUCTION',
      sunIntensity: 1.5
    }
  });
  assert(renderJobRes.status === 201, 'Render job created with 1080P, TWILIGHT, and WIDE presets');
  assert(renderJobRes.body.data.status === 'PENDING' || renderJobRes.body.data.status === 'PROCESSING', 'Render job status queued for asynchronous worker');

  // Step 7: Adding Service Request via Nested API
  console.log('\n7. Testing Nested Service Request Addition...');
  const addServiceRes = await request(`/projects/${projectId}/service-requests`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${clientToken}` },
    body: {
      serviceType: 'VIRTUAL_STAGING',
      requirements: {
        roomTypes: ['Master Bedroom'],
        furnitureStyle: 'SCANDINAVIAN',
        notes: 'Include king bed and walnut nightstands'
      }
    }
  });
  assert(addServiceRes.status === 201, 'New service request added to project');
  const addedType = addServiceRes.body.data?.serviceType || addServiceRes.body.data?.serviceRequest?.serviceType;
  assert(addedType === 'VIRTUAL_STAGING', 'Service type is VIRTUAL_STAGING');

  console.log('\n=== FIX VERIFICATION SUMMARY ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
  }
}

run().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
