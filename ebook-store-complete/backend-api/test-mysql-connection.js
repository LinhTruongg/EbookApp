const { sequelize } = require('./models');

async function testConnection() {
  try {
    console.log('Testing MySQL connection...');
    await sequelize.authenticate();
    console.log('✅ MySQL connection has been established successfully.');
    
    // Test database creation if it doesn't exist
    const config = sequelize.config;
    console.log(`Connected to database: ${config.database}`);
    console.log(`Host: ${config.host}:${config.port}`);
    console.log(`Username: ${config.username}`);
    
    await sequelize.close();
    console.log('✅ Connection test completed successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to MySQL database:', error.message);
    console.log('\nPlease check:');
    console.log('1. MySQL server is running');
    console.log('2. Database exists (create it if needed)');
    console.log('3. Environment variables are set correctly');
    console.log('4. MySQL credentials are correct');
    process.exit(1);
  }
}

testConnection();
