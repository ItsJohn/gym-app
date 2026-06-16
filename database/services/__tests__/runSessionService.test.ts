import { RunSessionService } from "@/database/services/runSessionService";

describe("RunSessionService formatting", () => {
  it("formats pace as mm:ss/km", () => {
    expect(RunSessionService.formatPace(330)).toBe("5:30/km");
  });

  it("formats duration with hours when over an hour", () => {
    expect(RunSessionService.formatDuration(3725)).toBe("1:02:05");
    expect(RunSessionService.formatDuration(605)).toBe("10:05");
  });
});
