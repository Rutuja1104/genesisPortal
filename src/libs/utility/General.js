import { jwtDecode } from "jwt-decode";
import xss from "xss";
import { ROLES } from "../constant";
import { getSessionToken } from "@descope/react-sdk";
export default class General {
  static tokenDecode = (token) => {
    if (token) {
      const decoded = jwtDecode(token);
      return decoded;
    }
    return null;
  };

  static getToken = () => {
    const actAsToken = sessionStorage.getItem("actAsToken");
    const decoded = this.tokenDecode(actAsToken);
    if (decoded?.nsec?.defaultRole === ROLES.SUPER_ADMIN) {
      return actAsToken;
    } else {
      return getSessionToken();
    }
  };

  static getUserRole = () => {
    const actAsToken = sessionStorage.getItem("actAsToken");
    if (actAsToken) {
      const decoded = this.tokenDecode(actAsToken);
      return decoded?.nsec?.role;
    } else {
      const token = getSessionToken();
      const decodedToken = this.tokenDecode(token);
      return decodedToken?.roles?.[0];
    }
  };

  static debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  static isValidDateFormat(dateString) {
    const regex =
      /^(?:(?:\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)|(?:\d{4}-\d{2}-\d{2})|(?:\d{2}-\d{2}-\d{4})|(?:\d{4}\/\d{2}\/\d{2})|(?:\d{2}\/\d{2}\/\d{4}))$/;
    return regex.test(dateString);
  }

  static formatDate(date) {
    if (!date) return "-";
    const formattedDate = new Date(date);
    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    };
    return formattedDate.toLocaleDateString("en-US", options);
  }

  static camelCaseToSimpleFormat(input) {
    let words = input.replace(/([a-z])([A-Z])/g, "$1 $2").split(/(?=[A-Z])/);
    let formattedWords = words.map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
    return formattedWords.join(" ");
  }

  static sanitizeInput(input) {
    if (input) {
      const sanitizedInput = xss(input, {
        whiteList: [],
        stripIgnoreTag: true,
        stripIgnoreTagBody: ["script"],
      });
      return sanitizedInput;
    } else {
      return undefined;
    }
  }

  static formatFileSize = (size, digits = 2) => {
    if (size == 0) return "0 B";
    if (isNaN(size)) return "-";
    const units = ["B", "KB", "MB", "GB", "TB", "PB"];
    const exp = Math.floor(Math.log(size) / Math.log(1024));
    const converted = parseFloat(size / Math.pow(1024, exp));
    return `${converted.toFixed(digits)} ${units[exp]}`;
  };
}
