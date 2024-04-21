import axios from "axios";
export const baseURL = "https://staging.api.dragonflyai.co";
const axiosInstance = axios.create({
  baseURL: baseURL,
});
const axiosInstancePresignedUrl = axios.create();
export const generateApiaxiosInstance = axios.create();

const DRAGON_FLY_STAGING_API_KEY = "fa66abff-98c2-4122-8997-b767836bf956";
axiosInstance.interceptors.request.use(
  function (config) {
    config.headers["Authorization"] = DRAGON_FLY_STAGING_API_KEY;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

//use
export const postData = async (url, reqBody, headers) => {
  const data = await axiosInstance({
    method: "POST",
    url,
    data: reqBody,
    headers: headers,
  });
  return data?.data;
};

export const putData = async (url, reqBody) => {
  const data = await axiosInstance({
    method: "PUT",
    url,
    data: reqBody,
  });
  return data?.data;
};
export const putDataPresignedUrl = async (url, reqBody, headers) => {
  const data = await axiosInstancePresignedUrl({
    method: "PUT",
    url,
    data: reqBody,
    headers: headers,
  });
  return data?.data;
};
