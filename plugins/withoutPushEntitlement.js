const { withEntitlementsPlist } = require("expo/config-plugins");

/**
 * expo-notifications is auto-applied at prebuild (it is listed in
 * prebuild-config's `versionedExpoSDKPackages`) and injects `aps-environment`
 * into the iOS entitlements. This app only schedules local notifications, so
 * the push capability is never used and its presence breaks archiving against
 * provisioning profiles that lack Push Notifications.
 *
 * Delete this plugin if remote push is ever added.
 */
function removeApsEnvironment(entitlements) {
  delete entitlements["aps-environment"];
  return entitlements;
}

const withoutPushEntitlement = (config) =>
  withEntitlementsPlist(config, (config) => {
    config.modResults = removeApsEnvironment(config.modResults);
    return config;
  });

module.exports = withoutPushEntitlement;
module.exports.removeApsEnvironment = removeApsEnvironment;
