import * as bcrypt from 'bcrypt';

export const getHashedPassword = (password: string, salt: number) =>
  bcrypt.hashSync(password, salt);

export const isPasswordValid = (password: string, hash: string) =>
  bcrypt.compareSync(password, hash);
