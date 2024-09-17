import { trackEvents } from "../libs/utility/mixpanelHelper";
import AppDataService from "./AppDataService";
import { customHeaders } from "./utils/constants";

const COMMON_BASE = process.env.REACT_APP_BASE_URL + "/network";
const REMOVE_NTK_ORG = "network/organization";
export default class NetworkDataService {
  static async createNetwork(body) {
    trackEvents("CALLING_CREATE_NETWORK_API", { body });
    const response = await AppDataService.post(`${COMMON_BASE}`, JSON.stringify(body), customHeaders());
    trackEvents("CREATE_NETWORK_API_RESPONSE", { status: response.status });
    return response;
  }

  static async getNetwork(params) {
    trackEvents("CALLING_GET_NETWORK_API", { params });
    const response = await AppDataService.get(`${COMMON_BASE}/`, params, customHeaders());
    trackEvents("GET_NETWORK_API_RESPONSE", { status: response.status });
    return response;
  }

  static async deleteNetwork(params) {
    trackEvents("CALLING_DELETE_NETWORK_API", { params });
    const response = await AppDataService.delete(`${COMMON_BASE}/`, params, customHeaders());
    trackEvents("DELETE_NETWORK_API_RESPONSE", { status: response.status });
    return response;
  }

  static async getAllNetworks(params) {
    trackEvents("CALLING_GET_ALL_NETWORK_API", { params });
    const response = await AppDataService.get(`${COMMON_BASE}/`, params, customHeaders());
    trackEvents("GET_ALL_NETWORK_API_RESPONSE", { status: response.status });
    return response;
  }

  static async removeNetworkOrgnization(params) {
    trackEvents("CALLING_DELETE_NETWORK_ORGANIZATION_API", { params });
    const response = await AppDataService.delete(`${REMOVE_NTK_ORG}/`, params, customHeaders());
    trackEvents("DELETE_NETWORK_ORGANIZATION_RESPONSE", { status: response.status });
    return response;
  }

  static async updateNetworkDetails(body) {
    trackEvents("CALLING_UPDATE_NETWORK_DETAILS_API", { body });
    const response = await AppDataService.put(`${COMMON_BASE}/`, JSON.stringify(body), customHeaders());
    trackEvents("UPDATE_NETWORK_DETAILS_API_RESPONSE", { status: response.status });
    return response;
  }
}
