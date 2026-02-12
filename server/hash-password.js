// hash-password.js
import bcrypt from 'bcryptjs';

const password = '424242';
// Generate a salt
const salt = bcrypt.genSaltSync(12); // 12 rounds of salt
// Hash the password
const hash = bcrypt.hashSync(password, salt);

console.log('Password:', password);
console.log('Hash:', hash);
