import axios from "axios";

import {
  API_BASE_URL,
} from "@/lib/api-config";


export const apiClient =
  axios.create({
    baseURL: API_BASE_URL,

    timeout: 15_000,

    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });