import { IBaseRequest } from "@/types";
import { showAuthErrorAlert } from "@/utils/alert";
import { clearSession } from "@/utils/session";
import axios from "axios";

// Create Axios instance
// const createAxiosInstance = (baseURL: string, withCredentials = false) => {
//   const instance = axios.create({
//     baseURL,
//     withCredentials,
//   });

//   instance.interceptors.response.use(
//     (response) => response,
//     (error) => {
//       return Promise.reject(error);
//     },
//   );

//   return instance;
// };

// Create Axios instance
const createAxiosInstance = (baseURL: string, withCredentials = false) => {
  const instance = axios.create({
    baseURL,
    withCredentials,
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        showAuthErrorAlert(
          "Token has expired or is invalid",
          "Please log in again to continue.",
          "Login Again",
          "/admin/auth/login",
          false,
          "Cancel",
          () => {
            localStorage.removeItem("accessToken");
            clearSession(); // Make sure this is imported or in scope
          },
        );
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

// Define base API URL
const apiURL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}`
  : "http://localhost:3000/api/v1";

// Create an Axios instance with the base URL
const api = createAxiosInstance(apiURL, false);

// Common GET, POST, PUT, DELETE methods
// const getRequest = async (url: string, params = {}) => {
//   try {
//     const response = await api.get(url, { params });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// Post Request Method
const postRequest = async (
  url: string,
  data: Record<string, Object>,
  message: string | "",
  username: string | "",
) => {
  try {
    const userAgent = typeof window !== "undefined" ? navigator.userAgent : "";
    const body = generateRequest(data, message, username);
    console.log(body);
    const response = await api.post(url, body);
    return response.data;
  } catch (error: any) {
    const status = error?.status;

    if (status === 401) {
      showAuthErrorAlert(
        "Token has expired or is invalid",
        "Please log in again to continue.",
        "Login Again",
        "/admin/auth/login",
        false,
        "Cancel",
        () => {
          localStorage.removeItem("accessToken");
          clearSession(); // Make sure this is imported or in scope
        },
      );
    }
  }
};

const postLoginRequest = async (
  url: string,
  data: Record<string, Object>,
  message: string,
  token: string,
  username: string,
) => {
  try {
    const body = generateRequest(data, message, username);
    console.log(body);
    const response = await api.post(url, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    const status = error?.status;

    if (status === 401) {
      showAuthErrorAlert(
        "Token has expired or is invalid",
        "Please log in again to continue.",
        "Login Again",
        "/admin/auth/login",
        false,
        "Cancel",
        () => {
          localStorage.removeItem("accessToken");
          clearSession(); // Make sure this is imported or in scope
        },
      );
    }
  }
};
const templateDownload = async (
  url: string,
  data: Record<string, Object>,
  message: string,
  token: string,
  username: string,
) => {
  try {
    const body = generateRequest(data, message, username);
    const response = await api.post(url, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    });
    return response;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 401) {
      showAuthErrorAlert(
        "Token has expired or is invalid",
        "Please log in again to continue.",
        "Login Again",
        "/admin/auth/login",
        false,
        "Cancel",
        () => {
          localStorage.removeItem("accessToken");
          clearSession();
        },
      );
    }
    throw error;
  }
};

const imageRequest = async (url: string, formData: FormData, token: string) => {
  try {
    const response = await api.post(url, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Put Request Method
// const putRequest = async (url: string, data: Record<string, string>) => {
//   try {
//     const body = generateRequest(data, "");
//     console.log(body);
//     const response = await api.put(url, body);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// Delete Request Method
const deleteRequest = async (url: string) => {
  try {
    const response = await api.delete(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Base Request
const generateRequest = (
  data: Record<string, Object>,
  message: string,
  username: string,
) => {
  const baseRequest: IBaseRequest = {
    channel: "OP",
    ip: "0.0.0.1",
    message: message,
    username: username,
    userAgent: getBrowserName(),
  };
  return {
    channel: baseRequest.channel,
    ip: baseRequest.ip,
    message: baseRequest.message,
    ...data,
    username: baseRequest.username,
    userAgent: baseRequest.userAgent,
  };
};

const getBrowserName = (): string => {
  const userAgent = typeof window !== "undefined" ? navigator.userAgent : "";

  if (/chrome|crios|crmo/i.test(userAgent) && !/edg/i.test(userAgent)) {
    return "Chrome";
  } else if (/firefox|fxios/i.test(userAgent)) {
    return "Firefox";
  } else if (
    /safari/i.test(userAgent) &&
    !/chrome|crios|crmo/i.test(userAgent)
  ) {
    return "Safari";
  } else if (/edg/i.test(userAgent)) {
    return "Edge";
  } else if (/opr\//i.test(userAgent)) {
    return "Opera";
  } else {
    return "Other";
  }
};

export {
  api,
  apiURL,
  // getRequest,
  postRequest,
  // putRequest,
  deleteRequest,
  postLoginRequest,
  imageRequest,
  templateDownload,
};
