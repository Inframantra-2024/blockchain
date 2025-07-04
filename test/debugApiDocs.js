/**
 * Debug API Documentation Issues
 * Quick test to identify why API docs are not loading
 */

const axios = require('axios');

async function debugApiDocs() {
  console.log('🔍 Debugging API Documentation Issues\n');

  const baseUrl = 'http://142.93.223.225:5000';
  
  const testEndpoints = [
    { path: '/test', description: 'Basic test endpoint' },
    { path: '/api/v1/health', description: 'Health check' },
    { path: '/api-docs-debug', description: 'Debug info' },
    { path: '/api-docs.json', description: 'Swagger JSON' },
    { path: '/api-docs', description: 'Main API docs' },
    { path: '/docs', description: 'Docs redirect' }
  ];

  for (const endpoint of testEndpoints) {
    const fullUrl = `${baseUrl}${endpoint.path}`;
    console.log(`📝 Testing: ${endpoint.description}`);
    console.log(`   URL: ${fullUrl}`);
    
    try {
      const response = await axios.get(fullUrl, { 
        timeout: 10000,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        maxRedirects: 5
      });
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📊 Content-Type: ${response.headers['content-type']}`);
      console.log(`   📏 Content Length: ${response.headers['content-length'] || 'Unknown'}`);
      
      // Show response preview for specific endpoints
      if (endpoint.path === '/test' || endpoint.path === '/api/v1/health' || endpoint.path === '/api-docs-debug') {
        console.log(`   📋 Response:`, JSON.stringify(response.data, null, 2));
      } else if (endpoint.path === '/api-docs') {
        const content = response.data;
        if (typeof content === 'string') {
          if (content.includes('swagger-ui')) {
            console.log(`   ✅ Swagger UI content detected`);
          } else if (content.includes('API Documentation')) {
            console.log(`   ⚠️ Fallback HTML page loaded`);
          } else {
            console.log(`   ❌ Unexpected content type`);
            console.log(`   📄 Content preview: ${content.substring(0, 200)}...`);
          }
        } else {
          console.log(`   📊 Response type: ${typeof content}`);
        }
      } else if (endpoint.path === '/api-docs.json') {
        if (response.data && response.data.info) {
          console.log(`   ✅ Valid Swagger JSON`);
          console.log(`   📊 API Title: ${response.data.info.title}`);
          console.log(`   📊 Paths: ${Object.keys(response.data.paths || {}).length}`);
        } else {
          console.log(`   ❌ Invalid Swagger JSON`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      
      if (error.response) {
        console.log(`   📊 HTTP Status: ${error.response.status}`);
        console.log(`   📊 Status Text: ${error.response.statusText}`);
        
        if (error.response.status === 404) {
          console.log(`   💡 Route not found - check server configuration`);
        } else if (error.response.status === 500) {
          console.log(`   💡 Server error - check server logs`);
        }
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`   💡 Connection refused - server not running`);
      } else if (error.code === 'ETIMEDOUT') {
        console.log(`   💡 Request timeout - server slow or unreachable`);
      }
    }
    
    console.log(''); // Empty line for readability
  }

  console.log('🔧 Troubleshooting Steps:');
  console.log('1. Check PM2 status: pm2 list');
  console.log('2. Check PM2 logs: pm2 logs');
  console.log('3. Restart server: pm2 restart all');
  console.log('4. Check server configuration');
  
  console.log('\n💡 Common Issues:');
  console.log('• If /test works but /api-docs doesn\'t: Swagger UI configuration issue');
  console.log('• If nothing works: Server not running or port blocked');
  console.log('• If 404 errors: Routes not properly configured');
  console.log('• If 500 errors: Check server logs for detailed error messages');
  
  console.log('\n🌐 Expected Working URLs:');
  console.log(`• Test: ${baseUrl}/test`);
  console.log(`• Health: ${baseUrl}/api/v1/health`);
  console.log(`• Debug: ${baseUrl}/api-docs-debug`);
  console.log(`• API Docs: ${baseUrl}/api-docs`);
  console.log(`• Swagger JSON: ${baseUrl}/api-docs.json`);
}

// Run the debug test
if (require.main === module) {
  debugApiDocs().catch(console.error);
}

module.exports = { debugApiDocs };
