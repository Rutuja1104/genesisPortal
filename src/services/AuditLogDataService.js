import AppDataService from './AppDataService'
import { customHeaders } from './utils/constants'

const COMMON_BASE = process.env.REACT_APP_GENESIS_URL + '/audits';

export default class AuditLogDataService {
    static async getAuditLogs(params) {
        return await AppDataService.get(`${COMMON_BASE}`, params, customHeaders());
    }
}