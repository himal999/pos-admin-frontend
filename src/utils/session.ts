// utils/sessionStorage.ts

const SESSION_KEY = "appSessionData";

const setSessionData = (key: string, value: any) => {
  const sessionData = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "{}");
  sessionData[key] = value;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
};

const getSessionData = (key: string) => {
  const sessionData = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "{}");
  return sessionData[key];
};

const removeSessionData = (key: string) => {
  const sessionData = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "{}");
  delete sessionData[key];
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
};

const clearSession = () => {
  sessionStorage.removeItem(SESSION_KEY);
};
// const getSession = sessionStorage.getItem(SESSION_KEY)
export { setSessionData, getSessionData, removeSessionData, clearSession }; //getSession
