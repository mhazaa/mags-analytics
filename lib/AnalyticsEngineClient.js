"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uniqid_1 = __importDefault(require("uniqid"));
const getCookie = (cookieName) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${cookieName}=`);
    if (parts.length === 2)
        return parts.pop().split(';').shift() || '';
    return '';
};
class AnalyticsEngineClient {
    static connected = false;
    static connectionCallbacks = [];
    static async connect() {
        const userId = AnalyticsEngineClient.getUserId() || AnalyticsEngineClient.setUserId((0, uniqid_1.default)());
        const data = { userId };
        const res = await fetch('/pageLoaded', {
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(data)
        });
        console.log(res);
        AnalyticsEngineClient.connectionCallbacks.forEach(loadEvent => loadEvent());
        AnalyticsEngineClient.connected = true;
        console.log('Successfully connected to AnalyticsEngine');
    }
    static onConnection(callback) {
        if (typeof callback !== 'function')
            throw new Error('Callback must be of type function');
        (AnalyticsEngineClient.connected)
            ? callback()
            : AnalyticsEngineClient.connectionCallbacks.push(callback);
    }
    static async sendMetric(metric, globalMetric = metric) {
        const sendMetric = async () => {
            const userId = AnalyticsEngineClient.getUserId();
            const data = { userId, metric, globalMetric };
            const res = await fetch('/sendMetric', {
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify(data)
            });
            console.log(res);
        };
        (!AnalyticsEngineClient.connected)
            ? AnalyticsEngineClient.connectionCallbacks.push(sendMetric)
            : sendMetric();
    }
    static getUserId() {
        return getCookie('userid');
    }
    static setUserId(userId) {
        document.cookie = `userid=${userId}`;
        return AnalyticsEngineClient.getUserId();
    }
}
exports.default = AnalyticsEngineClient;