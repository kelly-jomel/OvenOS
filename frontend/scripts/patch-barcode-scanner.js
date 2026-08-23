const fs = require('fs');
const path = require('path');

const gradlePath = path.join(__dirname, '..', 'node_modules', '@capacitor-community', 'barcode-scanner', 'android', 'build.gradle');

if (fs.existsSync(gradlePath)) {
  let content = fs.readFileSync(gradlePath, 'utf8');
  let changed = false;
  
  if (content.includes('jcenter()')) {
    content = content.replace(/jcenter\(\)/g, 'mavenCentral()');
    changed = true;
    console.log('Patched barcode-scanner build.gradle to remove jcenter()');
  }
  
  if (content.includes('proguard-android.txt')) {
    content = content.replace(/'proguard-android\.txt'/g, "'proguard-android-optimize.txt'");
    changed = true;
    console.log('Patched barcode-scanner build.gradle to use proguard-android-optimize.txt');
  }

  if (changed) {
    fs.writeFileSync(gradlePath, content);
  }
}
