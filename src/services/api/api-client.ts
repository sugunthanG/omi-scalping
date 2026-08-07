import axios from "axios";


const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL;


if (!apiBaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not configured.",
  );
}


export const apiClient =
  axios.create({
    baseURL:
      apiBaseUrl,

    timeout:
      15_000,

    headers: {
      "Content-Type":
        "application/json",

      Accept:
        "application/json",
    },
  });