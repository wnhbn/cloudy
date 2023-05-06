interface NOTIFICATION {
  message: string;
}

const SIGNUP_FAILED: NOTIFICATION = {
  message: 'This account has been registered before!',
};
const WRONG_PASSWORD: NOTIFICATION = {
  message: 'The password you have just entered is incorrect!',
};

const WRONG_EMAIL: NOTIFICATION = {
  message: 'You have not registered an account yet, please register now!',
};

const NO_ACCOUNT_EXISTS: NOTIFICATION = {
  message: "Account doesn't exist",
};

const STRANGE_FILE: NOTIFICATION = {
  message: 'Only image files are allowed!',
};

const FILE_SIZE_ERROR: NOTIFICATION = {
  message: 'File size must be less than 5MB!',
};

const EMPTY_IMAGE: NOTIFICATION = {
  message: `Haven't you uploaded a picture yet?`,
};

const FRIENDSHIP_ERROR: NOTIFICATION = {
  message: 'This user does not exist',
};

const ACCEPT_FRIEND_ERROR: NOTIFICATION = {
  message: 'There is no friendship between two people',
};

const FRIEND_ERROR: NOTIFICATION = {
  message: 'You have already friended this user!',
};

const EMPTY_MESSAGE: NOTIFICATION = {
  message: 'Messages should not be left blank!',
};

const INTRUDERS: NOTIFICATION = {
  message:
    'You are not a member of this conversation, I detected and blocked you ^^',
};

const EDITING_ERROR: NOTIFICATION = {
  message: 'Same email, please update another email!',
};

export {
  SIGNUP_FAILED,
  WRONG_PASSWORD,
  WRONG_EMAIL,
  NO_ACCOUNT_EXISTS,
  STRANGE_FILE,
  FILE_SIZE_ERROR,
  FRIENDSHIP_ERROR,
  ACCEPT_FRIEND_ERROR,
  FRIEND_ERROR,
  EMPTY_MESSAGE,
  EMPTY_IMAGE,
  EDITING_ERROR,
  INTRUDERS,
};
