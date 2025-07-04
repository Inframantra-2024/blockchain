/**
 * Server API Docs Diagnostic Test
 * Tests API documentation accessibility on production server
 */

const axios = require('axios');

async function testServerApiDocs() {
  console.log('🔍 Testing API Documentation on Production Server\n');

  // Test URLs for your server
  const serverUrl = 'http://142.93.223.225:5000';
  
  const testEndpoints = [
    '/test',
    '/api/v1/health', 
    '/api-docs',
    '/docs',
    '/api-docs.json'
  ];

  console.log(`🌐 Testing server: ${serverUrl}\n`);

  for (const endpoint of testEndpoints) {
    const fullUrl = `${serverUrl}${endpoint}`;
    console.log(`📝 Testing: ${fullUrl}`);
    
    try {
      const response = await axios.get(fullUrl, { 
        timeout: 10000,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📊 Content-Type: ${response.headers['content-type']}`);
      
      if (endpoint === '/test' || endpoint === '/api/v1/health') {
        console.log(`   📋 Response: ${JSON.stringify(response.data, null, 2)}`);
      } else if (endpoint === '/api-docs' || endpoint === '/docs') {
        if (response.data.includes('swagger-ui') || response.data.includes('Swagger UI')) {
          console.log(`   ✅ Swagger UI content detected`);
        } else {
          console.log(`   ⚠️ No Swagger UI content found`);
        }
      } else if (endpoint === '/api-docs.json') {
        console.log(`   📊 Swagger spec title: ${response.data.info?.title || 'Not found'}`);
        console.log(`   📊 Paths count: ${Object.keys(response.data.paths || {}).length}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      
      if (error.response) {
        console.log(`   📊 HTTP Status: ${error.response.status}`);
        console.log(`   📊 Status Text: ${error.response.statusText}`);
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`   💡 Connection refused - server may not be running`);
      } else if (error.code === 'ETIMEDOUT') {
        console.log(`   💡 Request timeout - server may be slow or unreachable`);
      }
    }
    
    console.log(''); // Empty line for readability
  }

  // Additional diagnostic information
  console.log('🔧 Diagnostic Information:');
  console.log('1. Check if PM2 process is running: pm2 list');
  console.log('2. Check PM2 logs: pm2 logs');
  console.log('3. Restart if needed: pm2 restart all');
  console.log('4. Check server status: pm2 show [process-name]');
  
  console.log('\n💡 Common Issues and Solutions:');
  console.log('• If /test works but /api-docs doesn\'t: Swagger UI issue');
  console.log('• If nothing works: Server not running or port blocked');
  console.log('• If timeout: Firewall or network issue');
  console.log('• If 404: Route not configured properly');
  
  console.log('\n🌐 Expected Working URLs:');
  console.log(`• Health: ${serverUrl}/api/v1/health`);
  console.log(`• Test: ${serverUrl}/test`);
  console.log(`• API Docs: ${serverUrl}/api-docs`);
  console.log(`• Docs Redirect: ${serverUrl}/docs`);
  console.log(`• Swagger JSON: ${serverUrl}/api-docs.json`);
}

// Run the test
if (require.main === module) {
  testServerApiDocs().catch(console.error);
}

module.exports = { testServerApiDocs };
