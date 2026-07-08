const { removeApsEnvironment } = require("../withoutPushEntitlement");

describe("removeApsEnvironment", () => {
  it("strips aps-environment and leaves other entitlements intact", () => {
    const result = removeApsEnvironment({
      "aps-environment": "development",
      "com.apple.security.application-groups": ["group.test"],
    });

    expect(result).toEqual({
      "com.apple.security.application-groups": ["group.test"],
    });
  });

  it("is a no-op when aps-environment is absent", () => {
    expect(removeApsEnvironment({})).toEqual({});
  });
});
