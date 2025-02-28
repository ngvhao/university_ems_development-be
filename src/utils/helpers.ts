import * as bcrypt from 'bcrypt';
import { SALT_ROUNDS } from './constants';

class Helpers {
  async hashPassword({
    password,
    saltRounds = SALT_ROUNDS,
  }: {
    password: string;
    saltRounds?: number;
  }): Promise<string> {
    const salt = bcrypt.genSaltSync(saltRounds);
    console.log(salt);
    console.log(password);
    return bcrypt.hashSync(password, salt);
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}

export default new Helpers();
