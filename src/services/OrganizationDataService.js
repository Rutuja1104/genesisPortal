import { trackEvents } from "../libs/utility/mixpanelHelper";
import AppDataService from "./AppDataService";
import { customHeaders } from "./utils/constants";

const COMMON_BASE = process.env.REACT_APP_BASE_URL + "/organization";
const COMMON_BASE_GET = process.env.REACT_APP_BASE_URL + "/organizations";
const GENESIS_URL = process.env.REACT_APP_GENESIS_URL + "/organization/status";
const WORKFLOW_BASE = process.env.REACT_APP_WORKFLOW_URL + "/workflows/container_activity/container_context_launch";
export default class OrganizationDataService {
  static async uploadOrganizationList(body, params) {
    trackEvents("CALLING_UPLOAD_ORGANIZATION_LIST_API", { params, body });
    const response = await AppDataService.post(`${COMMON_BASE}/bulk`, body, customHeaders(true), params, true);
    trackEvents("UPLOAD_ORGANIZATION_LIST_API_RESPONSE", { status: response.status });
    return response;
  }

  static async createOrganization(body) {
    trackEvents("CALLING_CREATE_ORGANIZATION_API", { body });
    const response = await AppDataService.post(`${COMMON_BASE}`, JSON.stringify(body), customHeaders());
    trackEvents("CREATE_ORGANIZATION_API_RESPONSE", { status: response.status });
    return response;
  }

  static async updateOrganization(body) {
    trackEvents("CALLING_UPDATE_ORGANIZATION_API", { body });
    const response = await AppDataService.put(`${COMMON_BASE}`, JSON.stringify(body), customHeaders());
    trackEvents("UPDATE_ORGANIZATION_API_RESPONSE", { status: response.status });
    return response;
  }

  static async getAllOrganization({ body }) {
    trackEvents("CALLING_GET_ALL_ORGANIZATION_API", { body });
    const response = await AppDataService.post(`${COMMON_BASE_GET}`, JSON.stringify(body), customHeaders());
    trackEvents("GET_ALL_ORGANIZATION_API_RESPONSE", { status: response.status });
    return response;
  }

  static async getSiteStatus(params) {
    trackEvents("CALLING_GET_SITE_STATUS_API", { params });
    const response = await AppDataService.get(`${GENESIS_URL}/`, params, customHeaders());
    trackEvents("GET_SITE_STATUS_API_RESPONSE", { status: response.status });
    return response;
  }

  static async getOrganizationStatus(params) {
    trackEvents("CALLING_GET_ORGANIZATION_STATUS_API", { params });
    const response = await AppDataService.get(`${COMMON_BASE}/isExists`, params, customHeaders());
    trackEvents("GET_ORGANIZATION_STATUS_API_RESPONSE", { status: response.status });
    return response;
  }

  static async activeDeactiveSite(body) {
    trackEvents("CALLING_ACTIVE_DEACTIVE_SITE_API", { body });
    const response = await AppDataService.put(`${COMMON_BASE}/activateDeactivate`, JSON.stringify(body), customHeaders());
    trackEvents("ACTIVE_DEACTIVE_SITE_API_RESPONSE", { status: response.status });
    return response;
  }

  static async updateSiteCreds(body) {
    trackEvents("CALLING_UPDATE_SITE_CREDS_API", { body });
    const response = await AppDataService.put(`${COMMON_BASE}/updateSiteCreds`, JSON.stringify(body), customHeaders());
    trackEvents("UPDATE_SITE_CREDS_API_RESPONSE", { status: response.status });
    return response;
  }

  static async getOrganizationInformation({ body }) {
    trackEvents("CALLING_GET_ORGANIZATION_INFORMATION_API", { body });
    const response = await AppDataService.post(`${COMMON_BASE_GET}`, JSON.stringify(body), customHeaders());
    trackEvents("GET_ORGANIZATION_INFORMATION_API_RESPONSE", { status: response.status });
    return response;
  }

  static async getConfig(params) {
    trackEvents("CALLING_GET_CONFIG_API", { params });
    const response = await AppDataService.get(`${WORKFLOW_BASE}`, params, customHeaders());
    trackEvents("GET_CONFIG_API_RESPONSE", { status: response.status });
    return response;
  }

  static async getEnablementKey(params) {
    trackEvents("CALLING_GET_ENABLEMENT_KEY_API", { params });
    const response = await AppDataService.get(`${WORKFLOW_BASE}/enablement_key`, params, customHeaders());
    trackEvents("GET_ENABLEMENT_KEY_API_RESPONSE", { status: response.status });
    return response;
  }

  static async updateConfig({ params, body }) {
    trackEvents("CALLING_UPDATE_CONFIG_API", { params, body });
    const response = await AppDataService.post(`${WORKFLOW_BASE}`, JSON.stringify(body), customHeaders(), params);
    trackEvents("UPDATE_CONFIG_API_RESPONSE", { status: response.status });
    return response;
  }

  static async resetGaps(params) {
    trackEvents("CALLING_RESET_GAPS_API", { params });
    const response = await AppDataService.put(`${process.env.REACT_APP_GENESIS_URL}/resetGaps`, null, customHeaders(), params);
    trackEvents("RESET_GAPS_API_RESPONSE", { status: response.status });
    return response;
  }

  static async getCookiesForMetrics() {
    const headers = {
      Authorization: `Basic ${process.env.REACT_APP_MIXPANEL_USERNAME}:${process.env.REACT_APP_MIXPANEL_PASSWORD}`,
    };
    return await AppDataService.get(process.env.REACT_APP_MIXPANEL_AUTH, null, { headers }, null, true);
  }

  static async getAWSCreds(body) {
    trackEvents("CALLING_GET_AWS_CREDS_API", { body });
    const response = await AppDataService.post(`${COMMON_BASE_GET}/fileAccess`, JSON.stringify(body), customHeaders());
    trackEvents("GET_AWS_CREDS_API_RESPONSE", { status: response.status });
    return response;
  }

  static async executeCommand(body) {
    trackEvents("CALLING_EXECUTE_COMMAND_API", { body });
    const response = await AppDataService.post(`${COMMON_BASE}/executeCommand`, JSON.stringify(body), customHeaders());
    trackEvents("EXECUTE_COMMAND_API_RESPONSE", { status: response.status });
    return response;
  }
}
