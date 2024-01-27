export const isUserLoggedIn = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    return false;
  }
  const access_token = user.access_token;
  if (access_token) {
    return true;
  }
  return false;
};

export const setUserLoggedIn = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const setUserLoggedOut = () => {
  localStorage.clear();
};

export const getUserData = () => {
  return JSON.parse(localStorage.getItem('user'));
};

export const getUserId = () => {
  const user = getUserData();
  return user ? user._id : '';
};

export const getUserName = () => {
  const user = getUserData();
  return user ? user.username : '';
};

export const getUserMail = () => {
  const user = getUserData();
  return user ? user.email_id : '';
};

export const getAccessToken = () => {
  const user = getUserData();
  return user ? user.access_token : '';
};

export const getUserRoles = () => {
  const user = getUserData();
  return user ? user.roles : '';
};
