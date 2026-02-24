import Text "mo:core/Text";
import Time "mo:core/Time";
import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type SensorType = {
    #temperature;
    #humidity;
    #occupancy;
    #energyConsumption;
  };

  public type DeviceType = {
    #sensor : SensorType;
    #actuator : {
      #toggle;
      #thermostat;
    };
  };

  public type Device = {
    id : Text;
    deviceType : DeviceType;
    location : {
      building : Text;
      room : Text;
    };
    status : {
      #online;
      #offline;
      #maintenance;
    };
    lastReadingTimestamp : Time.Time;
  };

  public type SensorReading = {
    deviceId : Text;
    sensorType : SensorType;
    value : Float;
    unit : Text;
    timestamp : Time.Time;
  };

  public type BooleanRuleCondition = {
    deviceId : Text;
    sensorType : SensorType;
    threshold : Float;
    comparison : {
      #greaterThan;
      #lessThan;
      #equalTo;
      #notEqualTo;
    };
  };

  public type AutomationRule = {
    id : Text;
    conditions : [BooleanRuleCondition];
    actions : [{
      deviceId : Text;
      command : {
        #turnOn;
        #turnOff;
        #setTemperature : Float;
      };
    }];
    enabled : Bool;
    createdBy : Text;
    lastModified : Time.Time;
  };

  public type Alert = {
    id : Text;
    deviceId : Text;
    sensorType : ?SensorType;
    message : Text;
    severity : {
      #critical;
      #warning;
      #info;
    };
    timestamp : Time.Time;
    acknowledged : Bool;
  };

  public type IoTUserProfile = {
    name : Text;
    department : Text;
    contactInfo : Text;
    role : ?AccessControl.UserRole;
  };

  public type Recommendation = {
    id : Text;
    category : {
      #energySavings;
      #spaceUtilization;
      #operationalEfficiency;
    };
    description : Text;
    estimatedImpact : Text;
    timestamp : Time.Time;
  };

  let devices = Map.empty<Text, Device>();
  let sensorReadings = Map.empty<Text, List.List<SensorReading>>();
  let automationRules = Map.empty<Text, AutomationRule>();
  let alerts = Map.empty<Text, Alert>();
  let userProfiles = Map.empty<Principal, IoTUserProfile>();
  let recommendations = Map.empty<Text, Recommendation>();

  // Device Management Functions

  public shared ({ caller }) func registerDevice(device : Device) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only Operators and Admins can register devices");
    };

    devices.add(device.id, device);
  };

  public shared ({ caller }) func updateDeviceStatus(deviceId : Text, status : { #online; #offline; #maintenance }) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only Operators and Admins can update device status");
    };

    switch (devices.get(deviceId)) {
      case (null) {
        Runtime.trap("Device not found");
      };
      case (?device) {
        let updatedDevice = {
          device with
          status = status;
          lastReadingTimestamp = Time.now();
        };
        devices.add(deviceId, updatedDevice);

        // Trigger alert if device goes offline
        if (status == #offline) {
          let alertId = deviceId # "-offline-" # Time.now().toText();
          let alert : Alert = {
            id = alertId;
            deviceId = deviceId;
            sensorType = null;
            message = "Device " # deviceId # " has gone offline";
            severity = #warning;
            timestamp = Time.now();
            acknowledged = false;
          };
          alerts.add(alertId, alert);
        };
      };
    };
  };

  public query ({ caller }) func getDevice(id : Text) : async ?Device {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Authentication required to view devices");
    };
    devices.get(id);
  };

  public query ({ caller }) func getAllDevices() : async [Device] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Authentication required to view devices");
    };
    devices.values().toArray();
  };

  public shared ({ caller }) func deleteDevice(deviceId : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only Admins can delete devices");
    };

    devices.remove(deviceId);
    sensorReadings.remove(deviceId);
  };

  // Sensor Reading Functions

  public shared ({ caller }) func recordSensorReading(reading : SensorReading) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only Operators and Admins can record sensor readings");
    };

    let device = switch (devices.get(reading.deviceId)) {
      case (null) {
        Runtime.trap("Device not found");
      };
      case (?device) {
        device;
      };
    };

    let updatedDevice = {
      device with
      lastReadingTimestamp = reading.timestamp;
      status = #online;
    };
    devices.add(reading.deviceId, updatedDevice);

    let existingReadings = switch (sensorReadings.get(reading.deviceId)) {
      case (null) {
        List.empty<SensorReading>();
      };
      case (?readings) {
        readings;
      };
    };

    existingReadings.add(reading);
    sensorReadings.add(reading.deviceId, existingReadings);

    // Check automation rules and trigger alerts if thresholds exceeded
    checkAutomationRules(reading);
  };

  public query ({ caller }) func getSensorReadings(deviceId : Text) : async [SensorReading] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Authentication required to view sensor readings");
    };
    switch (sensorReadings.get(deviceId)) {
      case (null) {
        [];
      };
      case (?list) {
        list.toArray();
      };
    };
  };

  public query ({ caller }) func getLatestSensorReading(deviceId : Text) : async ?SensorReading {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Authentication required to view sensor readings");
    };
    switch (sensorReadings.get(deviceId)) {
      case (null) {
        null;
      };
      case (?list) {
        list.last();
      };
    };
  };

  // Automation Rule Functions

  public shared ({ caller }) func createOrUpdateRule(rule : AutomationRule) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only Operators and Admins can manage automation rules");
    };

    automationRules.add(rule.id, rule);
  };

  public shared ({ caller }) func deleteRule(ruleId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only Operators and Admins can delete automation rules");
    };

    automationRules.remove(ruleId);
  };

  public shared ({ caller }) func toggleRule(ruleId : Text, enabled : Bool) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only Operators and Admins can toggle automation rules");
    };

    switch (automationRules.get(ruleId)) {
      case (null) {
        Runtime.trap("Rule not found");
      };
      case (?rule) {
        let updatedRule = {
          rule with
          enabled = enabled;
          lastModified = Time.now();
        };
        automationRules.add(ruleId, updatedRule);
      };
    };
  };

  public query ({ caller }) func getRule(id : Text) : async ?AutomationRule {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Authentication required to view automation rules");
    };
    automationRules.get(id);
  };

  public query ({ caller }) func getAllRules() : async [AutomationRule] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Authentication required to view automation rules");
    };
    automationRules.values().toArray();
  };

  // Alert Functions

  public shared ({ caller }) func createAlert(alert : Alert) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only Operators and Admins can create alerts");
    };

    alerts.add(alert.id, alert);
  };

  public shared ({ caller }) func acknowledgeAlert(alertId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can acknowledge alerts");
    };

    switch (alerts.get(alertId)) {
      case (null) {
        Runtime.trap("Alert not found");
      };
      case (?alert) {
        let updatedAlert = {
          alert with
          acknowledged = true;
        };
        alerts.add(alertId, updatedAlert);
      };
    };
  };

  public query ({ caller }) func getAlert(alertId : Text) : async ?Alert {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Authentication required to view alerts");
    };
    alerts.get(alertId);
  };

  public query ({ caller }) func getAllAlerts() : async [Alert] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Authentication required to view alerts");
    };
    alerts.values().toArray();
  };

  public query ({ caller }) func getUnacknowledgedAlerts() : async [Alert] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Authentication required to view alerts");
    };
    alerts.values().filter(func(alert : Alert) : Bool { not alert.acknowledged }).toArray();
  };

  public shared ({ caller }) func deleteAlert(alertId : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only Admins can delete alerts");
    };

    alerts.remove(alertId);
  };

  // Optimization Engine Functions

  public shared ({ caller }) func generateRecommendations() : async [Recommendation] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only Operators and Admins can generate recommendations");
    };

    let newRecommendations = List.empty<Recommendation>();

    for ((deviceId, readingsList) in sensorReadings.entries()) {
      let readings = readingsList.toArray();
      if (readings.size() > 0) {
        let energyReadings = readings.filter(func(r : SensorReading) : Bool { r.sensorType == #energyConsumption });

        if (energyReadings.size() > 10) {
          let energyValues = energyReadings.map(func(r : SensorReading) : Float { r.value });
          let sum = energyValues.foldLeft(0.0, func(acc, val) { acc + val });
          let energyCount = energyReadings.size();
          let avgEnergy = sum / energyCount.toFloat();

          if (avgEnergy > 100.0) {
            let recId = "energy-" # deviceId # "-" # Time.now().toText();
            let rec : Recommendation = {
              id = recId;
              category = #energySavings;
              description = "Device " # deviceId # " shows high energy consumption. Consider scheduling or automation.";
              estimatedImpact = "Potential 15-20% energy savings";
              timestamp = Time.now();
            };
            newRecommendations.add(rec);
            recommendations.add(recId, rec);
          };
        };
      };
    };

    newRecommendations.toArray();
  };

  public query ({ caller }) func getRecommendations() : async [Recommendation] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Authentication required to view recommendations");
    };
    recommendations.values().toArray();
  };

  public shared ({ caller }) func deleteRecommendation(recId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only Operators and Admins can delete recommendations");
    };

    recommendations.remove(recId);
  };

  // User Profile Functions

  public shared ({ caller }) func saveCallerUserProfile(profile : IoTUserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?IoTUserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?IoTUserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile or must be Admin");
    };
    userProfiles.get(user);
  };

  // Internal helper functions

  private func checkAutomationRules(reading : SensorReading) {
    for ((ruleId, rule) in automationRules.entries()) {
      if (rule.enabled) {
        var conditionsMet = true;
        for (condition in rule.conditions.vals()) {
          if (condition.deviceId == reading.deviceId and condition.sensorType == reading.sensorType) {
            let met = switch (condition.comparison) {
              case (#greaterThan) { reading.value > condition.threshold };
              case (#lessThan) { reading.value < condition.threshold };
              case (#equalTo) { reading.value == condition.threshold };
              case (#notEqualTo) { reading.value != condition.threshold };
            };
            if (not met) {
              conditionsMet := false;
            };

            // Create alert if threshold exceeded
            if (met and (condition.comparison == #greaterThan or condition.comparison == #lessThan)) {
              let alertId = reading.deviceId # "-threshold-" # Time.now().toText();
              let alert : Alert = {
                id = alertId;
                deviceId = reading.deviceId;
                sensorType = ?reading.sensorType;
                message = "Sensor threshold exceeded for device " # reading.deviceId;
                severity = #warning;
                timestamp = Time.now();
                acknowledged = false;
              };
              alerts.add(alertId, alert);
            };
          };
        };
      };
    };
  };
};
