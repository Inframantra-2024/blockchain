/**
 * Test API Documentation Accessibility
 * Checks if API docs are accessible on localhost
 */

const axios = require('axios');

async function testApiDocs() {
  console.log('🚀 Testing API Documentation Accessibility\n');

  const baseUrl = 'http://localhost:5000';
  
  try {
    // Test 1: Check if server is running
    console.log('📝 Test 1: Server Health Check');
    try {
      const healthResponse = await axios.get(`${baseUrl}/api/v1/health`, { timeout: 5000 });
      console.log('✅ Server is running');
    } catch (error) {
      console.log('❌ Server not running or health endpoint not available');
      console.log('   Please start the server with: npm run dev');
      return;
    }

    // Test 2: Check API docs endpoint
    console.log('\n📝 Test 2: API Documentation Endpoint');
    try {
      const docsResponse = await axios.get(`${baseUrl}/api-docs`, { 
        timeout: 10000,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      
      if (docsResponse.status === 200) {
        console.log('✅ API Documentation is accessible');
        console.log(`   URL: ${baseUrl}/api-docs`);
        console.log(`   Status: ${docsResponse.status}`);
        console.log(`   Content-Type: ${docsResponse.headers['content-type']}`);
        
        // Check if it contains Swagger UI content
        if (docsResponse.data.includes('swagger-ui') || docsResponse.data.includes('Swagger UI')) {
          console.log('✅ Swagger UI is properly loaded');
        } else {
          console.log('⚠️ Response received but may not be Swagger UI');
        }
      }
    } catch (error) {
      console.log('❌ API Documentation not accessible');
      console.log(`   Error: ${error.message}`);
      console.log(`   URL attempted: ${baseUrl}/api-docs`);
    }

    // Test 3: Check Swagger JSON endpoint
    console.log('\n📝 Test 3: Swagger JSON Specification');
    try {
      const swaggerJsonResponse = await axios.get(`${baseUrl}/api-docs/swagger.json`, { timeout: 5000 });
      console.log('✅ Swagger JSON specification is available');
      console.log(`   URL: ${baseUrl}/api-docs/swagger.json`);
      
      const swaggerData = swaggerJsonResponse.data;
      console.log(`   API Title: ${swaggerData.info?.title || 'Not specified'}`);
      console.log(`   API Version: ${swaggerData.info?.version || 'Not specified'}`);
      console.log(`   Servers: ${swaggerData.servers?.length || 0} configured`);
      console.log(`   Paths: ${Object.keys(swaggerData.paths || {}).length} endpoints documented`);
    } catch (error) {
      console.log('⚠️ Swagger JSON not available (this is normal for some setups)');
    }

    // Test 4: Test some API endpoints
    console.log('\n📝 Test 4: Sample API Endpoints');
    
    // Test notification summary endpoint (requires auth, so we expect 401)
    try {
      await axios.get(`${baseUrl}/api/v1/notifications/summary`, { timeout: 5000 });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Notifications endpoint exists (returns 401 as expected without auth)');
      } else {
        console.log(`⚠️ Notifications endpoint: ${error.message}`);
      }
    }

    // Test auth login endpoint
    try {
      await axios.post(`${baseUrl}/api/v1/auth/login`, {}, { timeout: 5000 });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Auth login endpoint exists (returns 400 as expected without credentials)');
      } else {
        console.log(`⚠️ Auth login endpoint: ${error.message}`);
      }
    }

    console.log('\n🎉 API Documentation Test Completed!');
    console.log('\n📋 Summary:');
    console.log(`   Local API Docs: ${baseUrl}/api-docs`);
    console.log('   Third-party API: http://142.93.223.225:5000 (external)');
    console.log('\n💡 How to Access:');
    console.log('   1. Make sure server is running: npm run dev');
    console.log(`   2. Open browser: ${baseUrl}/api-docs`);
    console.log('   3. Use the interactive Swagger UI to test endpoints');

  } catch (error) {
    console.log('❌ Unexpected error during testing:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testApiDocs().catch(console.error);
}

module.exports = { testApiDocs };
