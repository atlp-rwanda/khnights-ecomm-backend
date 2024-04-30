import { Request, Response } from 'express';
import {OrmConfig} from '../configs/db_config';
import { User } from '../entity/User';
import bcrypt from 'bcrypt';
// export all controllers
function myFunction (): void {
  console.log('Hello');
}
myFunction();



const registerUser = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, userType } = req.body;
  console.log(firstName, lastName, email, password, userType);
  // Validate user input
  if (!firstName ||!lastName ||!email ||!password) {
    return res.status(400).json({ error: 'Please fill all the fields' });
  }


 const users = OrmConfig.getRepository(User);

  // Check for existing user
  const existingUser = await users.findOneBy({  email:email });
  if (existingUser) {
    return res.status(400).json({ error: 'Email already in use' });
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const user = new User();
  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;
  user.password = hashedPassword; // Replace with hashed password
  user.userType = userType;

  // Save user
  await OrmConfig.manager.save(user);

  return res.status(201).json({ message: 'User registered successfully' });
};

export { registerUser };