import * as dotenv from 'dotenv';

dotenv.config();

export const API_PREFIX_PATH = '/api/v1';

export const FAILED = -1;
export const SALT_ROUNDS = 10;

export const TIMEZONE_UTC = 'Etc/UTC';

export const DATE_TIME_FORMAT = 'yyyy-mm-dd HH:mm:ss';

export const DATE_FORMAT = 'DD';

export const THROTTLE_TTL = 60;
export const THROTTLE_LIMIT = 30;

export const PAGINATION = {
  LIMIT: 100,
  PAGE_DEFAULT: 1,
};

export const SORT_DESC = 'DESC';
export const SORT_ASC = 'ASC';

export const MSG_INTERNAL_SERVER_ERROR = 'internal-server-error';
export const MSG_NOT_FOUND = 'not-found';

export const JWT_EXPIRED_TIME_UPDATE_TOKEN = '24h';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_VALID_REGEX =
  /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*\d)(.{8,})$/;

export const PHONE_NUMBER_REGEX = /^\d{10,11}$/;

export const TIME_REGEX = /^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/;

export const COUNTRY_CODE = /^\d{1,4}$/;

export const PHONE_NUMBER = /^\d{10,11}$/;

export const METADATA__PARAM_TYPE = 'partialBodyType';

export const jwtConstants = {
  secret: process.env.JWT_SECRET_KEY,
  expired: JWT_EXPIRED_TIME_UPDATE_TOKEN,
};
