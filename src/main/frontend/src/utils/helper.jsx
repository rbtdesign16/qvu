import axios from "axios";
import { getApiURL } from "../api/api";
import moment from "moment";

export const hconfig = {
  headers: {
    "Content-Type": "application/json",
  },
};

export const formatErrorMessage = (err) => {
  if (err) {
    console.trace();
    return err.toString();
  } else {
    return "";
  }
};

export const isNotEmpty = (val) => {
  return val && ("" + val).length > 0;
};

export const copyObject = (o) => {
  return JSON.parse(JSON.stringify(o));
};
