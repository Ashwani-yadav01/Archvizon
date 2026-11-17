/**
 * Archvizon Independent Backend & Database Verification Script
 * Sends real HTTP requests against the live running Node/Express backend and MongoDB.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api/v1';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const parsed = new URL(url);

  return new Promise((resolve, reject) => {
    const headers = options.headers || {};
    let reqBody = options.body;
    if (reqBody && typeof reqBody === 'object' && !(reqBody instanceof Buffer) && !headers['Content-Type']?.includes('multipart')) {
      reqBody = JSON.stringify(reqBody);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(reqBody);
    } else if (reqBody instanceof Buffer) {
      headers['Content-Length'] = reqBody.length;
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
            body: json || text,
            buffer
          });
        });
      }
    );

    req.on('error', reject);

    if (reqBody) {
      req.write(reqBody);
    }
    req.end();
  });
}

function buildMultipart(fields, fileField) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const crlf = '\r\n';
  const parts = [];

  for (const [k, v] of Object.entries(fields)) {
    parts.push(Buffer.from(`--${boundary}${crlf}Content-Disposition: form-data; name="${k}"${crlf}${crlf}${v}${crlf}`));
  }

  if (fileField) {
    parts.push(
      Buffer.from(
        `--${boundary}${crlf}Content-Disposition: form-data; name="${fileField.name}"; filename="${fileField.filename}"${crlf}Content-Type: ${fileField.contentType}${crlf}${crlf}`
      )
    );
    parts.push(fileField.buffer);
    parts.push(Buffer.from(crlf));
  }

  parts.push(Buffer.from(`--${boundary}--${crlf}`));

  const body = Buffer.concat(parts);
  return {
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': body.length
    },
    body
  };
}

async function runVerification() {
  console.log('===============================================================');
  console.log(' ARCHVIZON INDEPENDENT BACKEND & DATABASE LIVE VERIFICATION');
  console.log('===============================================================\n');

  const results = [];
  function assert(name, condition, details = '') {
    if (condition) {
      console.log(`  [PASS] ${name}`);
      results.push({ name, passed: true, details });
    } else {
      console.error(`  [FAIL] ${name} — ${details}`);
      results.push({ name, passed: false, details });
    }
  }

  const timestamp = Date.now();
  const clientEmail1 = `client_a_${timestamp}@archvizon-verify.com`;
  const clientEmail2 = `client_b_${timestamp}@archvizon-verify.com`;
  const password = 'SecurePassword123!';
  let tokenA, tokenB, userA, userB;
  let projectId, sceneId, stagingJobId, renderJobId, assetId;

  try {
    // 1. Health Check
    console.log('--- 1. Server Health Check ---');
    const health = await request('/health');
    assert('Health Check Returns 200', health.status === 200 && health.body.data?.status === 'healthy', JSON.stringify(health.body));

    // 2. Authentication & User Registration
    console.log('\n--- 2. User Registration & Auth ---');
    const regA = await request('/auth/register', {
      method: 'POST',
      body: { name: 'Client Alice', email: clientEmail1, password, role: 'CLIENT' }
    });
    assert('Client A Registered Successfully', regA.status === 201 && regA.body.success, JSON.stringify(regA.body));
    tokenA = regA.body.data?.token;
    userA = regA.body.data?.user;

    const regB = await request('/auth/register', {
      method: 'POST',
      body: { name: 'Client Bob', email: clientEmail2, password, role: 'CLIENT' }
    });
    assert('Client B Registered Successfully', regB.status === 201 && regB.body.success, JSON.stringify(regB.body));
    tokenB = regB.body.data?.token;
    userB = regB.body.data?.user;

    // Login
    const loginA = await request('/auth/login', {
      method: 'POST',
      body: { email: clientEmail1, password }
    });
    assert('Client A Login Returns Valid Token', loginA.status === 200 && Boolean(loginA.body.data?.token));

    // Profile & Profile Update
    const profile = await request('/auth/me', {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert('GET /auth/me Returns Client A Details', profile.status === 200 && profile.body.data?.user?.email === clientEmail1);

    const updateProfile = await request('/auth/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: { name: 'Alice Architect' }
    });
    assert('PUT /auth/profile Updates User Name', updateProfile.status === 200 && updateProfile.body.data?.user?.name === 'Alice Architect');

    // 3. Password Reset Workflow
    console.log('\n--- 3. Password Reset Flow ---');
    const forgot = await request('/auth/forgot-password', {
      method: 'POST',
      body: { email: clientEmail1 }
    });
    assert('POST /auth/forgot-password Generates Token', forgot.status === 200 && forgot.body.success);
    const resetToken = forgot.body.data?.resetToken;

    if (resetToken) {
      const reset = await request('/auth/reset-password', {
        method: 'POST',
        body: { token: resetToken, newPassword: 'NewSecurePassword456!' }
      });
      assert('POST /auth/reset-password Consumes Token & Updates Password', reset.status === 200 && reset.body.success);

      // Re-login with new password
      const reLogin = await request('/auth/login', {
        method: 'POST',
        body: { email: clientEmail1, password: 'NewSecurePassword456!' }
      });
      assert('Login Succeeds With New Password', reLogin.status === 200 && Boolean(reLogin.body.data?.token));
      tokenA = reLogin.body.data.token;
    }

    // 4. Project Management
    console.log('\n--- 4. Project Lifecycle & Isolation ---');
    const createProj = await request('/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: {
        name: 'Horizon Penthouse 3D Space',
        description: 'Modern luxury penthouse overlooking coastline',
        propertyType: 'RESIDENTIAL',
        deadline: new Date(Date.now() + 864000000).toISOString()
      }
    });
    projectId = createProj.body.data?.project?._id;
    assert('Client A Creates Project', createProj.status === 201 && Boolean(projectId), `Received: ${JSON.stringify(createProj.body)}`);

    // Get Project Details
    const getProj = await request(`/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert('Client A Retrieves Project Details', getProj.status === 200 && getProj.body.data?.project?._id === projectId);

    // Duplicate Project
    const dupProj = await request(`/projects/${projectId}/duplicate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert('POST /:id/duplicate Creates Project Copy', dupProj.status === 201 && dupProj.body.data?.project?.name?.includes('(Copy)'));

    // Update Thumbnail
    const updateThumb = await request(`/projects/${projectId}/thumbnail`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: { thumbnailUrl: '/uploads/renders/custom_thumb.jpg' }
    });
    assert('PATCH /:id/thumbnail Updates Project Thumbnail', updateThumb.status === 200 && updateThumb.body.data?.project?.thumbnailUrl === '/uploads/renders/custom_thumb.jpg');

    // Access Isolation: Client B accessing Client A's Project
    const crossGet = await request(`/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert('Cross-Client Read Blocked (403 Forbidden)', crossGet.status === 403, `Received status: ${crossGet.status}`);

    const crossUpdate = await request(`/projects/${projectId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenB}` },
      body: { name: 'Hacked Title' }
    });
    assert('Cross-Client Update Blocked (403 Forbidden)', crossUpdate.status === 403, `Received status: ${crossUpdate.status}`);

    // Unauthenticated Access
    const noAuth = await request('/projects');
    assert('Unauthenticated Access Blocked (401 Unauthorized)', noAuth.status === 401, `Received status: ${noAuth.status}`);

    // 5. 3D Scene Modeling & Persistence
    console.log('\n--- 5. 3D Scene Engine & Persistence ---');
    const sceneRes = await request(`/projects/${projectId}/scene`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    sceneId = sceneRes.body.data?.scene?._id;
    assert('GET /projects/:id/scene Initializes 3D Scene', sceneRes.status === 200 && Boolean(sceneId));

    // Add Object to Scene
    const addObj = await request(`/scenes/${sceneId}/objects`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: {
        id: `wall_${Date.now()}`,
        name: 'South Living Wall',
        type: 'WALL',
        transform: {
          position: { x: 0, y: 1.4, z: -3.5 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 6, y: 2.8, z: 0.25 }
        },
        geometry: {
          type: 'BOX',
          parameters: { width: 6, height: 2.8, depth: 0.25 }
        },
        material: {
          color: '#e2e8f0',
          roughness: 0.8,
          metalness: 0.05
        }
      }
    });
    assert('POST /scenes/:id/objects Adds 3D Element', [200, 201].includes(addObj.status) && addObj.body.data?.scene?.objects?.some((o) => o.name === 'South Living Wall'));

    // Update Scene Transforms & Environment
    const updateScene = await request(`/scenes/${sceneId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: {
        environment: {
          gridVisible: true,
          axesVisible: true,
          sunIntensity: 1.6,
          backgroundColor: '#0f172a'
        }
      }
    });
    assert('PUT /scenes/:id Updates Environment & Lighting', updateScene.status === 200 && updateScene.body.data?.scene?.environment?.sunIntensity === 1.6);

    // 6. Architectural Catalog & PBR Materials
    console.log('\n--- 6. Architectural Catalog & Materials ---');
    const catalogAssets = await request('/catalog/assets', {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert('GET /catalog/assets Returns 16 Seeded Items', catalogAssets.status === 200 && catalogAssets.body.data?.assets?.length === 16);

    const catalogMaterials = await request('/catalog/materials', {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert('GET /catalog/materials Returns 9 PBR Materials', catalogMaterials.status === 200 && catalogMaterials.body.data?.materials?.length === 9);

    // 7. File Upload & Binary Storage
    console.log('\n--- 7. File Upload & Storage ---');
    // Real minimal 2x2 JPEG image binary
    const realJpegBuffer = Buffer.from(
      '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAACAAIBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
      'base64'
    );
    const multipart = buildMultipart(
      { category: 'SOURCE_FILE' },
      { name: 'file', filename: 'room_plan.jpg', contentType: 'image/jpeg', buffer: realJpegBuffer }
    );

    const uploadRes = await request(`/projects/${projectId}/assets`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        ...multipart.headers
      },
      body: multipart.body
    });
    assetId = uploadRes.body.data?._id;
    assert('POST /projects/:id/assets Uploads Image Asset', uploadRes.status === 201 && Boolean(assetId), `Status: ${uploadRes.status}`);

    // Verify Asset Storage on Disk & Streaming Download
    if (assetId) {
      const downloadRes = await request(`/assets/${assetId}/download`, {
        headers: { Authorization: `Bearer ${tokenA}` }
      });
      assert('GET /assets/:id/download Streams Back Binary File', downloadRes.status === 200 && downloadRes.buffer.length > 0);
    }

    // 8. Virtual Staging Engine
    console.log('\n--- 8. Virtual Staging Engine ---');
    const stageJobRes = await request('/staging/jobs', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: {
        projectId,
        originalImageUrl: '/uploads/staging/test_vacant_living.jpg',
        roomType: 'LIVING_ROOM',
        designStyle: 'SCANDINAVIAN',
        furnitureDensity: 'BALANCED',
        colorPalette: 'Warm Neutral & Oak Wood'
      }
    });
    stagingJobId = stageJobRes.body.data?._id;
    assert('POST /staging/jobs Queues Virtual Staging Job', stageJobRes.status === 201 && Boolean(stagingJobId));

    // Check Staging Job Status
    const getStageJob = await request(`/staging/jobs/${stagingJobId}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert('GET /staging/jobs/:id Retrieves Staging Progress', getStageJob.status === 200 && ['PENDING', 'PROCESSING', 'COMPLETED'].includes(getStageJob.body.data?.status));

    // Staging Jobs for Project
    const projStaging = await request(`/staging/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert('GET /staging/projects/:id Lists Project Staging Runs', projStaging.status === 200 && Array.isArray(projStaging.body.data) && projStaging.body.data.length >= 1);

    // 9. Architectural Rendering Engine
    console.log('\n--- 9. Architectural Rendering Engine ---');
    const renderJobRes = await request('/render/jobs', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: {
        projectId,
        resolution: '4K',
        quality: 'PRODUCTION',
        cameraPreset: 'PERSPECTIVE',
        lightingScenario: 'GOLDEN_HOUR',
        sunIntensity: 1.4
      }
    });
    renderJobId = renderJobRes.body.data?._id;
    assert('POST /render/jobs Queues Architectural Render', renderJobRes.status === 201 && Boolean(renderJobId));

    // Check Render Job Status
    const getRenderJob = await request(`/render/jobs/${renderJobId}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert('GET /render/jobs/:id Retrieves Render Status', getRenderJob.status === 200 && ['PENDING', 'PROCESSING', 'COMPLETED'].includes(getRenderJob.body.data?.status));

    // Render Jobs for Project
    const projRenders = await request(`/render/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert('GET /render/projects/:id Lists Project Render History', projRenders.status === 200 && Array.isArray(projRenders.body.data) && projRenders.body.data.length >= 1);

    // 10. Validation & Error Handling
    console.log('\n--- 10. Validation & Error Handling ---');
    const invalidProj = await request('/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: { name: '', propertyType: 'INVALID_TYPE' }
    });
    assert('Invalid Project Rejected with 422/400 Validation Error', [400, 422].includes(invalidProj.status));

    const invalidObjectId = await request('/projects/not_a_valid_id', {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert('Invalid ObjectId Handled Gracefully (400/404)', [400, 404].includes(invalidObjectId.status));

    // 11. Cleanup & Project Deletion
    console.log('\n--- 11. Project Deletion ---');
    const delProj = await request(`/projects/${projectId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert('DELETE /projects/:id Removes Project', delProj.status === 200 && delProj.body.success);

    const verifyDeleted = await request(`/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert('Deleted Project Returns 404 Not Found', verifyDeleted.status === 404);
  } catch (err) {
    console.error('Fatal Verification Error:', err);
    assert('Execution without fatal exceptions', false, err.message);
  }

  console.log('\n===============================================================');
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(` SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED (TOTAL: ${results.length})`);
  console.log('===============================================================');

  return { passedCount, failedCount, results };
}

runVerification();
