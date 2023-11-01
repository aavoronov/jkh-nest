import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

function validPassword(password: string, userPassword: string) {
  return bcrypt.compareSync(password, userPassword);
}

export const authenticate = async (email: string, password: string) => {
  const user = await User.findOne({
    where: { email },
    attributes: ['email', 'password', 'role', 'id'],
  });

  let passwordMatches = false;
  console.log(user.role);

  if (!!user) passwordMatches = validPassword(password, user.password);
  if (passwordMatches && user.role.includes('admin'))
    return Promise.resolve({ email });

  return null;
};
