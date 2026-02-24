import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface IoTUserProfile {
    contactInfo: string;
    name: string;
    role?: UserRole;
    department: string;
}
export type Time = bigint;
export interface AutomationRule {
    id: string;
    createdBy: string;
    actions: Array<{
        command: {
            __kind__: "turnOn";
            turnOn: null;
        } | {
            __kind__: "turnOff";
            turnOff: null;
        } | {
            __kind__: "setTemperature";
            setTemperature: number;
        };
        deviceId: string;
    }>;
    lastModified: Time;
    enabled: boolean;
    conditions: Array<BooleanRuleCondition>;
}
export interface SensorReading {
    sensorType: SensorType;
    value: number;
    unit: string;
    deviceId: string;
    timestamp: Time;
}
export interface Recommendation {
    id: string;
    estimatedImpact: string;
    description: string;
    timestamp: Time;
    category: Variant_operationalEfficiency_energySavings_spaceUtilization;
}
export type DeviceType = {
    __kind__: "sensor";
    sensor: SensorType;
} | {
    __kind__: "actuator";
    actuator: Variant_toggle_thermostat;
};
export interface BooleanRuleCondition {
    comparison: Variant_notEqualTo_equalTo_greaterThan_lessThan;
    sensorType: SensorType;
    threshold: number;
    deviceId: string;
}
export interface Alert {
    id: string;
    sensorType?: SensorType;
    acknowledged: boolean;
    message: string;
    deviceId: string;
    timestamp: Time;
    severity: Variant_warning_info_critical;
}
export interface Device {
    id: string;
    status: Variant_maintenance_offline_online;
    lastReadingTimestamp: Time;
    deviceType: DeviceType;
    location: {
        room: string;
        building: string;
    };
}
export enum SensorType {
    occupancy = "occupancy",
    temperature = "temperature",
    humidity = "humidity",
    energyConsumption = "energyConsumption"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_maintenance_offline_online {
    maintenance = "maintenance",
    offline = "offline",
    online = "online"
}
export enum Variant_notEqualTo_equalTo_greaterThan_lessThan {
    notEqualTo = "notEqualTo",
    equalTo = "equalTo",
    greaterThan = "greaterThan",
    lessThan = "lessThan"
}
export enum Variant_operationalEfficiency_energySavings_spaceUtilization {
    operationalEfficiency = "operationalEfficiency",
    energySavings = "energySavings",
    spaceUtilization = "spaceUtilization"
}
export enum Variant_toggle_thermostat {
    toggle = "toggle",
    thermostat = "thermostat"
}
export enum Variant_warning_info_critical {
    warning = "warning",
    info = "info",
    critical = "critical"
}
export interface backendInterface {
    acknowledgeAlert(alertId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAlert(alert: Alert): Promise<void>;
    createOrUpdateRule(rule: AutomationRule): Promise<void>;
    deleteAlert(alertId: string): Promise<void>;
    deleteDevice(deviceId: string): Promise<void>;
    deleteRecommendation(recId: string): Promise<void>;
    deleteRule(ruleId: string): Promise<void>;
    generateRecommendations(): Promise<Array<Recommendation>>;
    getAlert(alertId: string): Promise<Alert | null>;
    getAllAlerts(): Promise<Array<Alert>>;
    getAllDevices(): Promise<Array<Device>>;
    getAllRules(): Promise<Array<AutomationRule>>;
    getCallerUserProfile(): Promise<IoTUserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDevice(id: string): Promise<Device | null>;
    getLatestSensorReading(deviceId: string): Promise<SensorReading | null>;
    getRecommendations(): Promise<Array<Recommendation>>;
    getRule(id: string): Promise<AutomationRule | null>;
    getSensorReadings(deviceId: string): Promise<Array<SensorReading>>;
    getUnacknowledgedAlerts(): Promise<Array<Alert>>;
    getUserProfile(user: Principal): Promise<IoTUserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    recordSensorReading(reading: SensorReading): Promise<void>;
    registerDevice(device: Device): Promise<void>;
    saveCallerUserProfile(profile: IoTUserProfile): Promise<void>;
    toggleRule(ruleId: string, enabled: boolean): Promise<void>;
    updateDeviceStatus(deviceId: string, status: Variant_maintenance_offline_online): Promise<void>;
}
