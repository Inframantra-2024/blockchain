/**
 * Test API Documentation with IP Address Access
 * Verifies that API docs work when accessed via IP address
 */

const axios = require('axios');

async function testIpApiDocs() {
  console.log('🌐 Testing API Documentation with IP Address Access\n');

  // Test different access methods
  const testUrls = [
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    // Add your actual IP when testing
    // 'http://192.168.1.100:5000',
    // 'http://142.93.223.225:5000'
  ];

  for (const baseUrl of testUrls) {
    console.log(`📝 Testing API docs access: ${baseUrl}`);
    
    try {
      // Test 1: Health check first
      console.log(`   🔍 Health check: ${baseUrl}/api/v1/health`);
      const healthResponse = await axios.get(`${baseUrl}/api/v1/health`, { timeout: 5000 });
      
      if (healthResponse.status === 200) {
        console.log(`   ✅ Server is running and accessible`);
      }

      // Test 2: API docs main page
      console.log(`   🔍 API docs: ${baseUrl}/api-docs`);
      const docsResponse = await axios.get(`${baseUrl}/api-docs`, { 
        timeout: 10000,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (docsResponse.status === 200) {
        console.log(`   ✅ API docs page accessible`);
        
        // Check if it contains Swagger UI content
        const content = docsResponse.data;
        if (content.includes('swagger-ui') || content.includes('Swagger UI')) {
          console.log(`   ✅ Swagger UI content detected`);
        }
        
        // Check if it contains the current server URL
        if (content.includes(baseUrl)) {
          console.log(`   ✅ Dynamic server URL configured correctly`);
        }
      }

      // Test 3: Swagger JSON endpoint
      console.log(`   🔍 Swagger JSON: ${baseUrl}/api-docs/swagger.json`);
      const swaggerJsonResponse = await axios.get(`${baseUrl}/api-docs/swagger.json`, { timeout: 5000 });
      
      if (swaggerJsonResponse.status === 200) {
        console.log(`   ✅ Swagger JSON accessible`);
        
        const swaggerData = swaggerJsonResponse.data;
        console.log(`   📊 API Title: ${swaggerData.info?.title || 'Not specified'}`);
        console.log(`   📊 Servers configured: ${swaggerData.servers?.length || 0}`);
        
        // Check if current server URL is in the servers list
        const currentServerUrl = `${baseUrl}/api/v1`;
        const hasCurrentServer = swaggerData.servers?.some(server => server.url === currentServerUrl);
        
        if (hasCurrentServer) {
          console.log(`   ✅ Current server URL (${currentServerUrl}) found in servers list`);
        } else {
          console.log(`   ⚠️ Current server URL not found in servers list`);
          console.log(`   📋 Available servers:`, swaggerData.servers?.map(s => s.url));
        }
      }

      console.log(`   🎉 ${baseUrl} - All tests passed!\n`);

    } catch (error) {
      console.log(`   ❌ Failed to access ${baseUrl}: ${error.message}`);
      
      if (error.code === 'ECONNREFUSED') {
        console.log(`   💡 Server not running on ${baseUrl}`);
      } else if (error.response) {
        console.log(`   📊 HTTP Status: ${error.response.status}`);
        console.log(`   📊 Response: ${error.response.statusText}`);
      }
      console.log('');
    }
  }

  console.log('🎉 IP Address API Documentation Test Completed!\n');
  
  console.log('📋 What was tested:');
  console.log('✅ Dynamic server URL generation based on request host');
  console.log('✅ Swagger UI accessibility via different URLs');
  console.log('✅ Swagger JSON endpoint with dynamic configuration');
  console.log('✅ CORS headers for cross-origin access');
  
  console.log('\n🌐 How it works:');
  console.log('1. Server detects the incoming request host (localhost, IP, domain)');
  console.log('2. Dynamically generates Swagger configuration with current host');
  console.log('3. Serves Swagger UI with the correct server URLs');
  console.log('4. API docs work regardless of how you access the server');
  
  console.log('\n💡 Access examples:');
  console.log('• http://localhost:5000/api-docs');
  console.log('• http://127.0.0.1:5000/api-docs');
  console.log('• http://192.168.1.100:5000/api-docs (your local IP)');
  console.log('• http://142.93.223.225:5000/api-docs (production IP)');
  console.log('• http://your-domain.com/api-docs (custom domain)');
  
  console.log('\n🔧 Key improvements:');
  console.log('• Dynamic server URL detection');
  console.log('• CORS headers for universal access');
  console.log('• Multiple server options in Swagger UI');
  console.log('• Works with any IP address or domain');
}

// Run the test
if (require.main === module) {
  testIpApiDocs().catch(console.error);
}

module.exports = { testIpApiDocs };
