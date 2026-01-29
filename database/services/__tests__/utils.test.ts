import { generateUUID, parseJsonField } from "../utils";

describe("generateUUID", () => {
  it("should return a valid UUID v4 format", () => {
    const uuid = generateUUID();
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("should generate unique UUIDs", () => {
    const uuids = new Set(Array.from({ length: 100 }, () => generateUUID()));
    expect(uuids.size).toBe(100);
  });
});

describe("parseJsonField", () => {
  it("should parse a JSON string", () => {
    const result = parseJsonField<{ reps: string }>('{"reps":"10"}');
    expect(result).toEqual({ reps: "10" });
  });

  it("should return undefined for null", () => {
    expect(parseJsonField(null)).toBeUndefined();
  });

  it("should return undefined for undefined", () => {
    expect(parseJsonField(undefined)).toBeUndefined();
  });

  it("should return the value as-is if already an object", () => {
    const obj = { reps: "10", sets: "3" };
    expect(parseJsonField(obj)).toBe(obj);
  });

  it("should return undefined for invalid JSON string", () => {
    expect(parseJsonField("not valid json")).toBeUndefined();
  });
});
