import { trackEvents } from "../../libs/utility/mixpanelHelper";
import AppDataService from "../AppDataService";
import { customHeaders } from "./constants";

const COMMON_BASE = process.env.REACT_APP_BASE_URL + "/user";
export default class UsersDataService {
  static async getAllUsers(params) {
    trackEvents("CALLING_GET_ALL_USERS_API", { params });
    const response = await AppDataService.get(`${COMMON_BASE}`, params, customHeaders());
    trackEvents("GET_ALL_USERS_API_RESPONSE", { status: response.status });
    return response;
  }
  static async createUser(body) {
    trackEvents("CALLING_CREATE_USER_API", { body });
    const response = await AppDataService.post(`${COMMON_BASE}`, JSON.stringify(body), customHeaders());
    trackEvents("CREATE_USER_API_RESPONSE", { status: response.status });
    return response;
  }
  static async updateUser(body) {
    trackEvents("CALLING_UPDATE_USER_API", { body });
    const response = await AppDataService.put(`${COMMON_BASE}`, JSON.stringify(body), customHeaders());
    trackEvents("UPDATE_USER_API_RESPONSE", { status: response.status });
    return response;
  }
  static async updateActAs(body) {
    trackEvents("CALLING_UPDATE_ACT_AS_API", { body });
    const response = await AppDataService.put(`${COMMON_BASE}/actAs`, JSON.stringify(body), customHeaders());
    trackEvents("UPDATE_ACT_AS_API_RESPONSE", { status: response.status });
    return response;
  }
  static async activateDeactivateUser(body) {
    trackEvents("CALLING_ACTIVATE_DEACTIVATE_USER_API", { body });
    const response = await AppDataService.put(`${COMMON_BASE}/management`, JSON.stringify(body), customHeaders());
    trackEvents("ACTIVATE_DEACTIVATE_USER_API_RESPONSE", { status: response.status });
    return response;
  }
}
