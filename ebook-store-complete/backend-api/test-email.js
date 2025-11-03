require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📧 TEST EMAIL SENDING');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Check environment variables
  console.log('1️⃣ Checking environment variables...');
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;

  if (!gmailUser || !gmailPass) {
    console.error('❌ Gmail credentials NOT found!');
    console.log('\n⚠️  Please add to .env file:');
    console.log('   GMAIL_USER=your-email@gmail.com');
    console.log('   GMAIL_PASS=your-app-password\n');
    console.log('📖 See SMTP_SETUP.md for instructions\n');
    process.exit(1);
  }

  console.log('✅ GMAIL_USER:', gmailUser);
  console.log('✅ GMAIL_PASS:', gmailPass ? `${gmailPass.substring(0, 4)}****` : 'NOT SET');
  console.log('');

  // Create transporter
  console.log('2️⃣ Creating SMTP transporter...');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: gmailUser,
      pass: gmailPass
    }
  });

  // Test connection
  console.log('3️⃣ Testing SMTP connection...');
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!\n');
  } catch (error) {
    console.error('❌ SMTP verification FAILED!\n');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'EAUTH') {
      console.error('\n🔍 Possible causes:');
      console.error('   - Wrong email or password');
      console.error('   - Using regular password instead of App Password');
      console.error('   - App Password revoked or expired');
      console.error('   - 2-Step Verification not enabled');
    } else if (error.code === 'ECONNECTION') {
      console.error('\n🔍 Possible causes:');
      console.error('   - Internet connection issue');
      console.error('   - Firewall blocking port 465');
      console.error('   - Gmail service unavailable');
    }
    process.exit(1);
  }

  // Send test email
  console.log('4️⃣ Sending test email...');
  const testEmail = process.argv[2] || gmailUser; // Use command line arg or same email
  
  const mailOptions = {
    from: gmailUser,
    to: testEmail,
    subject: 'Test Email - EBook App',
    text: 'This is a test email from EBook App. If you receive this, email configuration is working!',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #2563EB;">Test Email - EBook App</h2>
        <p>This is a test email from EBook App.</p>
        <p>If you receive this email, your SMTP configuration is working correctly! ✅</p>
        <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">
          Time: ${new Date().toLocaleString()}
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📧 To:', testEmail);
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ EMAIL CONFIGURATION IS WORKING!');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('📝 Next steps:');
    console.log('   1. Check your inbox:', testEmail);
    console.log('   2. Check Spam/Junk folder if not in inbox');
    console.log('   3. If email is received, password reset emails will work!\n');
  } catch (error) {
    console.error('❌ Failed to send test email!\n');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Response:', error.response);
    
    if (error.code === 'EAUTH') {
      console.error('\n🔍 Troubleshooting:');
      console.error('   1. Verify GMAIL_USER and GMAIL_PASS in .env');
      console.error('   2. Make sure you are using App Password (16 characters)');
      console.error('   3. Enable 2-Step Verification in Google Account');
      console.error('   4. Generate new App Password');
    } else if (error.responseCode === 535) {
      console.error('\n🔍 This usually means:');
      console.error('   - Wrong App Password');
      console.error('   - Need to enable "Less secure app access"');
      console.error('   - Solution: Use App Password instead');
    }
    process.exit(1);
  }
}

testEmail().catch(console.error);

