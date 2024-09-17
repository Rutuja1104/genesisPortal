import AppDataService from "./AppDataService";
import { customHeaders } from "./utils/constants";
import General from "../libs/utility/General";
import { ROLES } from "../libs/constant";
import { trackEvents } from "../libs/utility/mixpanelHelper";
const COMMON_BASE = process.env.REACT_APP_AUTH_URL;
const ADMIN_BASE = process.env.REACT_APP_BASE_URL;
export default class LoginDataService {
  static async getLoginDetails(body) {
    return await AppDataService.post(`${COMMON_BASE}/login`, JSON.stringify(body));
  }

  static async getUserId() {
    const token = General.getToken();
    const userData = General.tokenDecode(token);
    let params = {};
    if (userData?.nsec?.defaultRole === ROLES.SUPER_ADMIN) {
      params.userId = userData?.nsec?.userId;
    } else {
      params.userId = userData?.sub;
    }
    trackEvents("CALLING_GET_USER_DATA_API", { params });
    const response = await AppDataService.get(`${ADMIN_BASE}/user`, params, customHeaders());
    trackEvents("GET_USER_DATA_API_RESPONSE", { status: response.status });
    return response;
  }
}
