import CryptoJS from "crypto-js";
class DataService {
  async getNewAccessToken() {}
  encryptPayload(payload) {
    const encrypted = CryptoJS.AES.encrypt(payload, process.env.REACT_APP_SECRET_KEY);
    return encrypted;
  }

  async get(relativeUrl, data = null, config = {}) {
    try {
      let url = relativeUrl;
      if (data) {
        const queryString = Object.entries(data)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join("&");
        url += `?${queryString}`;
      }

      const response = await fetch(url, { method: "get", ...config });

      if (response.status === 401 || response.status === 403) {
        return response.json();
      } else {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      }
    } catch (error) {
      console.log(error);
    }
  }

  async post(relativeUrl, data = null, config = {}, params = null, isForm) {
    try {
      if (params) {
        const queryString = Object.entries(params)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join("&");
        relativeUrl += `?${queryString}`;
      }
      let payload = data;
      if (payload && !isForm) {
        payload = this.encryptPayload(payload);
      }
      let response = await fetch(relativeUrl, {
        method: "post",
        body: payload,
        ...config,
      });
      if (response.status === 401 || response.status === 403) {
        console.error("Unauthorized");
        return response.json();
      } else {
        return response.json();
      }
    } catch (error) {
      this.getNewAccessToken();
      console.log(error);
    }
  }

  async put(relativeUrl, data = null, config = {}, params = null) {
    try {
      if (params) {
        const queryString = Object.entries(params)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join("&");
        relativeUrl += `?${queryString}`;
      }
      let payload = data;
      if (payload) {
        payload = this.encryptPayload(payload);
      }
      const response = await fetch(relativeUrl, {
        method: "put",
        body: payload,
        ...config,
      });
      if (response.status === 401 || response.status === 403) {
        console.error("Unauthorized");
        return response.json();
      } else {
        return response.json();
      }
    } catch (error) {
      this.getNewAccessToken();
      throw error;
    }
  }

  async delete(relativeUrl, params = null, config = {}) {
    try {
      let url = this._generateUrl(relativeUrl);
      if (params) {
        const queryString = new URLSearchParams(params).toString();
        url += "?" + queryString;
      }
      return (await fetch(url, { method: "delete", ...config })).json();
    } catch (error) {
      console.error(error);
      this.getNewAccessToken();
      throw error;
    }
  }

  setBaseUrl(baseUrl) {
    this._baseUrl = baseUrl;
  }

  _generateUrl(relativeUrl) {
    return `${this._baseUrl}/${relativeUrl}`;
  }
}

export default DataService;
